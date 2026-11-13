import "../../../styles/video-gallery.css";
import { useState, useMemo, useEffect, useCallback } from "react";
import { FiX } from "react-icons/fi";
import { BsPlayFill } from "react-icons/bs";
import { categoryAPI, videoAPI, itemPath } from "../../../services/api"; // adjust the path to your project
import { subscribeCacheInvalidation } from "../../../lib/publicCache";

const VIDEO_HERO_BG_IMAGE = "/static/hero-bg.jpg";

// Works with both `{ data: { data: [...] } }` and `{ data: [...] }` responses
const toList = (res) => {
  const body = res?.data;
  const list = body?.data ?? body;
  return Array.isArray(list) ? list : [];
};

// categoryId can be a plain id or a populated category object
const getCategoryId = (item) =>
  item?.categoryId && typeof item.categoryId === "object"
    ? item.categoryId._id
    : item?.categoryId;

/* ---------------- video helpers ---------------- */

// Extracts the YouTube video id from watch / short / embed / youtu.be links
const getYouTubeId = (url = "") => {
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i,
  );
  return m ? m[1] : null;
};

// Absolute / local static URLs are used as-is; stored paths are resolved via itemPath
const fileUrl = (path = "") =>
  /^(https?:|data:|blob:|\/static\/|\/images\/|\/uploads\/)/i.test(path)
    ? path
    : `${itemPath}/${String(path).replace(/^\/+/, "")}`;

// Turns a stored `path` into everything the UI needs
const buildVideo = (g) => {
  const ytId = getYouTubeId(g.path);
  return {
    id: g._id,
    title: g.title,
    categoryId: String(getCategoryId(g)),
    isYouTube: !!ytId,
    embedUrl: ytId ? `https://www.youtube-nocookie.com/embed/${ytId}` : null,
    fileSrc: ytId ? null : fileUrl(g.path),
    thumb: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null,
  };
};

/* ---------------- cache layer ---------------- */
const CACHE_KEY = "videogallery:data:v1";
// Freshness is decided by the server: GET /video-gallery/version returns a number
// that the backend bumps whenever a video or category changes.
// If that endpoint is unavailable, we fall back to this time-based cache.
const CACHE_TTL = 10 * 60 * 1000; // 10 min

let memoryCache = null; // survives route changes
let inflight = null; // de-dupes simultaneous requests

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      memoryCache = null;
      return null;
    }
    if (memoryCache) return memoryCache;
    memoryCache = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return memoryCache;
}

function writeCache(data) {
  memoryCache = { ...data, savedAt: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    /* ignore */
  }
}

// Clear local cache when triggered via admin invalidation event
function clearVideoGalleryCache() {
  memoryCache = null;
  inflight = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchVideoGalleryData(version) {
  if (inflight) return inflight;
  inflight = (async () => {
    const [catRes, vidRes] = await Promise.all([
      categoryAPI.getAll(),
      videoAPI.getAll(),
    ]);

    // Only active categories
    const categories = toList(catRes).filter((c) => c.status === true);
    const activeIds = new Set(categories.map((c) => String(c._id)));

    // Only active videos that belong to an active category
    const videos = toList(vidRes)
      .filter((v) => v.status === true)
      .filter((v) => activeIds.has(String(getCategoryId(v))))
      .map(buildVideo);

    const data = { categories, videos, version };
    writeCache(data);
    return data;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function resolveVideoGalleryData(force = false) {
  const c = force ? null : readCache();
  try {
    let serverVersion;
    if (typeof videoAPI?.getVersion === "function") {
      try {
        const res = await videoAPI.getVersion();
        serverVersion = res?.data?.version;
      } catch (vErr) {
        console.warn("Video version check failed, using timer cache:", vErr);
      }
    }

    if (!force && c) {
      const versionKnown = serverVersion !== undefined;
      const upToDate = versionKnown
        ? c.version === serverVersion // server says nothing changed
        : Date.now() - c.savedAt < CACHE_TTL; // no version endpoint -> use timer
      if (upToDate) return { skipped: true, hasCache: true };
    }

    const data = await fetchVideoGalleryData(serverVersion);
    return { skipped: false, data, hasCache: !!c };
  } catch (err) {
    err.hasCache = !!c;
    throw err;
  }
}

export default function VideoGallery() {
  const cached = readCache();

  const [categories, setCategories] = useState(cached?.categories ?? []);
  const [videos, setVideos] = useState(cached?.videos ?? []);
  const [loading, setLoading] = useState(!cached); // no spinner if cache exists
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all" or a category _id
  const [lightbox, setLightbox] = useState(null); // index into filtered

  const startFetch = useCallback((force = false) => {
    let cancelled = false;
    resolveVideoGalleryData(force)
      .then((res) => {
        if (cancelled || res.skipped) return;
        setCategories(res.data.categories);
        setVideos(res.data.videos);
        setError("");
      })
      .catch((err) => {
        console.error("Video gallery load failed:", err);
        if (!cancelled && !err?.hasCache) {
          setError(
            err?.response?.data?.message || "Could not load the videos.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancel = startFetch(false);

    const handleSync = () => {
      clearVideoGalleryCache();
      cancel?.();
      cancel = startFetch(true);
    };
    const unsubscribe = subscribeCacheInvalidation((scope) => {
      if (scope === "videos" || scope === "gallery") handleSync();
    });
    const onStorage = (e) => {
      if (!e.key || e.key === CACHE_KEY) handleSync();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cancel?.();
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [startFetch]);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  const categoryLabel = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[String(c._id)] = c.categoryName ?? "";
    });
    return map;
  }, [categories]);

  const filters = useMemo(
    () => [
      { id: "all", label: "All" },
      ...categories.map((c) => ({
        id: String(c._id),
        label: c.categoryName ?? "",
      })),
    ],
    [categories],
  );

  const filtered = useMemo(
    () =>
      videos
        .filter((v) => filter === "all" || v.categoryId === filter)
        .map((v, i) => ({ ...v, num: i + 1 })),
    [filter, videos],
  );

  const active = lightbox !== null ? filtered[lightbox] : null;

  return (
    <div
      className="vidgal-page"
      style={{
        background: bg,
        color: ink,
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
      }}
    >

      {/* HERO BAND */}
      <section
        className="vidgal-hero-section"
        style={{ backgroundImage: `url(${VIDEO_HERO_BG_IMAGE})` }}
      >
        <div className="vidgal-hero-dark-overlay" />
        <div className="vidgal-hero-inner-container">
          <h1 className="vidgal-hero-heading">
            Watch the spaces come together.
          </h1>
          <p className="vidgal-hero-copy">
            A running record of walkthroughs and fit-out films from sites across
            the portfolio - filter by sector to see how each space was built,
            room by room.
          </p>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="vidgal-gallery-section">
        <div className="vidgal-blueprint-grid" />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px 100px",
          }}
        >
          {/* Filters */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              padding: "48px 0 6px",
              alignItems: "center",
            }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => {
                  setFilter(f.id);
                  setLightbox(null);
                }}
                className="vidgal-filter-chip"
                style={{
                  appearance: "none",
                  border: `1px solid ${filter === f.id ? brass : line}`,
                  background: filter === f.id ? brass : "transparent",
                  color: filter === f.id ? "#ffffff" : inkDim,
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  fontSize: 12.5,
                  letterSpacing: "0.04em",
                  padding: "10px 18px",
                  borderRadius: 100,
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {f.label}
              </button>
            ))}
            {!loading && !error && (
              <span
                className="vidgal-film-count"
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: inkDim,
                  letterSpacing: "0.04em",
                }}
              >
                {filtered.length} films
              </span>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={messageStyle}>Loading videos…</div>
          ) : error ? (
            <div style={{ ...messageStyle, color: "#DC2626" }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={messageStyle}>No films in this category yet.</div>
          ) : (
            <div className="vidgal-card-grid">
              {filtered.map((v, i) => (
                <div
                  key={v.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play video: ${v.title}`}
                  className="vidgal-video-card vidgal-fade-in"
                  style={{
                    animationDelay: `${Math.min(i, 18) * 0.035}s`,
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    background: panel,
                    border: `1px solid ${line}`,
                  }}
                  onClick={() => setLightbox(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLightbox(i);
                    }
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4/3",
                      overflow: "hidden",
                    }}
                  >
                    {v.thumb ? (
                      <img
                        src={v.thumb}
                        alt={v.title}
                        loading="lazy"
                        style={imgStyle}
                      />
                    ) : (
                      // Uploaded files have no thumbnail - show a plain panel
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(135deg, #2a261f, #14120f)",
                        }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(18,17,16,0) 40%, rgba(18,17,16,0.92) 100%)",
                      }}
                    />
                    <span
                      className="vidgal-card-corner"
                      style={{
                        ...cornerStyle,
                        top: 12,
                        left: 12,
                        borderTop: `1.5px solid ${brass}`,
                        borderLeft: `1.5px solid ${brass}`,
                      }}
                    />
                    <span
                      className="vidgal-card-corner"
                      style={{
                        ...cornerStyle,
                        bottom: 12,
                        right: 12,
                        borderBottom: `1.5px solid ${brass}`,
                        borderRight: `1.5px solid ${brass}`,
                      }}
                    />
                    <span style={tagStyle}>{categoryLabel[v.categoryId]}</span>
                    <span style={idxStyle}>
                      N&deg;{String(v.num).padStart(2, "0")}
                    </span>
                    <span className="vidgal-play-btn" style={playStyle}>
                      <BsPlayFill
                        size={17}
                        color={ovInk}
                        style={{ marginLeft: 2 }}
                      />
                    </span>
                    <div style={metaStyle}>
                      <div
                        style={{
                          fontSize: 10.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: ovBrass,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        {categoryLabel[v.categoryId]}
                      </div>
                      <h2
                        style={{
                          margin: 0,
                          fontFamily: "var(--font-serif)",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: 1.25,
                          color: ovInk,
                        }}
                      >
                        {v.title}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          style={overlayStyle}
          onClick={(e) => e.target === e.currentTarget && setLightbox(null)}
        >
          <div style={{ width: "100%", maxWidth: 1040 }}>
            <div style={lbHeadStyle}>
              <div>
                <div style={lbCatStyle}>{categoryLabel[active.categoryId]}</div>
                <h2 style={lbTitleStyle}>{active.title}</h2>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setLightbox(null)}
                style={closeBtnStyle}
                className="vidgal-close-btn"
                aria-label="Close"
              >
                <FiX size={16} color={ovInk} />
              </button>
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                background: "#000",
                border: `1px solid ${line}`,
                boxShadow: shadow,
              }}
            >
              {active.isYouTube ? (
                <iframe
                  key={active.id}
                  src={`${active.embedUrl}?autoplay=1&rel=0`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    border: "none",
                  }}
                />
              ) : (
                <video
                  key={active.id}
                  src={active.fileSrc}
                  controls
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    background: "#000",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- tokens & shared styles ---------------- */
const ink = "#1b1a17";
const inkDim = "#6b665c";
const bg = "#fbfaf7";
const panel = "#ffffff";
const line = "#e6e1d6";
const brass = "#8a6a28";
// Overlay palette: text that sits on photos or the dark lightbox
const ovInk = "#f3eee2";
const ovDim = "#cfc8b6";
const ovBrass = "#e0bd7c";
const ovLine = "#4a463f";
const shadow = "0 18px 40px -16px rgba(27,26,23,0.18)";

const messageStyle = {
  padding: "80px 0",
  textAlign: "center",
  color: inkDim,
  fontSize: 14,
};

const imgStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  filter:
    "grayscale(45%) sepia(12%) saturate(115%) brightness(0.75) contrast(1.05)",
};

const cornerStyle = { position: "absolute", width: 16, height: 16 };

const tagStyle = {
  position: "absolute",
  top: 14,
  left: 14,
  fontSize: 10,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: ovBrass,
  background: "rgba(18,16,14,0.55)",
  backdropFilter: "blur(6px)",
  padding: "6px 10px",
  border: "1px solid rgba(185,144,90,0.35)",};

const idxStyle = {
  position: "absolute",
  top: 14,
  right: 14,
  fontFamily: "var(--font-serif)",
  fontSize: 12,
  color: ovDim,};

const playStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  width: 56,
  height: 56,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(239,233,219,0.55)",
  background: "rgba(18,16,14,0.35)",
  backdropFilter: "blur(4px)",};

const metaStyle = { position: "absolute", left: 16, right: 16, bottom: 14 };

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  display: "flex",
  background: "rgba(10,9,8,0.94)",
  backdropFilter: "blur(6px)",
  alignItems: "center",
  justifyContent: "center",
  padding: "6vw 8vw",
};

const lbHeadStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: 16,
  gap: 20,};
const lbCatStyle = {
  fontSize: 10.5,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: ovBrass,
  fontWeight: 700,
  marginBottom: 6,};
const lbTitleStyle = {
  margin: 0,
  fontFamily: "var(--font-serif)",
  fontWeight: 400,
  fontSize: 26,
  color: ovInk,};
const closeBtnStyle = {
  border: `1px solid ${ovLine}`,
  background: "transparent",
  color: ovInk,
  width: 38,
  height: 38,
  borderRadius: "50%",
  cursor: "pointer",
  flex: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",};
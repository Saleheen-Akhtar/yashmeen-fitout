import { useState, useMemo, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { BsPlayFill } from "react-icons/bs";
import { categoryAPI, videoAPI, itemPath } from "../../services/api"; // adjust the path to your project

// Replace with your own fit-out / interior image (best: a local asset)
// e.g. import heroBg from "../../assets/video-hero.jpg";
const VIDEO_HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

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

// Absolute URLs are used as-is; stored paths are resolved via itemPath
const fileUrl = (path = "") =>
  /^https?:\/\//i.test(path)
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
    embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : null,
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
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) memoryCache = JSON.parse(raw);
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

// Call this from your admin panel after add / edit / delete of videos or categories
export function clearVideoGalleryCache() {
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

export default function VideoGallery() {
  const cached = readCache();

  const [categories, setCategories] = useState(cached?.categories ?? []);
  const [videos, setVideos] = useState(cached?.videos ?? []);
  const [loading, setLoading] = useState(!cached); // no spinner if cache exists
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all" or a category _id
  const [lightbox, setLightbox] = useState(null); // index into filtered

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const c = readCache();
      try {
        // Tiny request: just a number that changes when data changes.
        // If it fails (endpoint missing etc.) we fall back to loading the lists.
        let serverVersion;
        if (typeof videoAPI?.getVersion === "function") {
          try {
            const res = await videoAPI.getVersion();
            serverVersion = res?.data?.version;
          } catch (vErr) {}
        }

        if (c) {
          const versionKnown = serverVersion !== undefined;
          const upToDate = versionKnown
            ? c.version === serverVersion // server says nothing changed
            : Date.now() - c.savedAt < CACHE_TTL; // no version endpoint → use timer
          // Cache is up to date → skip the two big API calls
          if (upToDate) return;
        }

        const data = await fetchVideoGalleryData(serverVersion);
        if (cancelled) return;
        setCategories(data.categories);
        setVideos(data.videos);
        setError("");
      } catch (err) {
        console.error("Video gallery load failed:", err);
        // if cached data is already on screen, fail silently
        if (!cancelled && !c) {
          setError(
            err?.response?.data?.message || "Could not load the videos.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@400;500;700;800&display=swap');

        /* HERO (same look as Contact page) */
        .vidgal-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:#0A0A0A;
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){
          .vidgal-hero-section{ padding:120px 0; }
        }
        .vidgal-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(
            to bottom,
            rgba(10,10,10,0.72),
            rgba(10,10,10,0.60)
          );
        }
        .vidgal-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:1180px;
          margin:0 auto;
          padding:0 24px;
          text-align:center;
        }
        @media (min-width:768px){
          .vidgal-hero-inner-container{ padding:0 40px; }
        }
        .vidgal-hero-heading{
          margin:0;
          font-family:'Montserrat', sans-serif;
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .vidgal-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .vidgal-hero-heading{ font-size:56px; } }
        .vidgal-hero-copy{
          margin:22px auto 0;
          max-width:640px;
          font-family:'Montserrat', sans-serif;
          font-weight:500;
          font-size:15.5px;
          line-height:1.7;
          color:rgba(255,255,255,0.85);
        }

        /* GALLERY SECTION */
        .vidgal-gallery-section{
          position:relative;
          background:${bg};
        }
        .vidgal-blueprint-grid{
          position:absolute; inset:0; pointer-events:none; opacity:0.35;
          background-image:
            linear-gradient(rgba(185,144,90,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(185,144,90,0.06) 1px, transparent 1px);
          background-size:64px 64px;
          -webkit-mask-image:radial-gradient(1200px 700px at 50% 0%, black, transparent 75%);
          mask-image:radial-gradient(1200px 700px at 50% 0%, black, transparent 75%);
        }
        .vidgal-fade-in{ animation: vidgal-rise-keyframes .6s cubic-bezier(.2,.8,.2,1) forwards; opacity:0; transform:translateY(18px); }
        @keyframes vidgal-rise-keyframes{ to{ opacity:1; transform:translateY(0); } }
        .vidgal-video-card{ transition: transform .45s cubic-bezier(.2,.8,.2,1), border-color .3s; }
        .vidgal-video-card:hover{ transform:translateY(-5px); border-color:#544d3b; }
        .vidgal-video-card img{ transition: transform .7s cubic-bezier(.2,.8,.2,1), filter .5s; }
        .vidgal-video-card:hover img{ transform:scale(1.12); filter:grayscale(15%) sepia(8%) saturate(120%) brightness(0.6) contrast(1.05) !important; }
        .vidgal-card-corner{ opacity:0; transition:opacity .3s; }
        .vidgal-video-card:hover .vidgal-card-corner{ opacity:1; }
        .vidgal-play-btn{ transition: all .35s cubic-bezier(.2,.8,.2,1); }
        .vidgal-video-card:hover .vidgal-play-btn{ background:${brass}; border-color:${brass}; transform:translate(-50%,-50%) scale(1.12); }
        .vidgal-video-card:hover .vidgal-play-btn svg{ color:#181410; }
        .vidgal-filter-chip{ transition: all .25s ease; }
        .vidgal-close-btn:hover{ border-color:${brass} !important; color:${brass} !important; }
        .vidgal-card-grid{ display:grid; grid-template-columns:repeat(3, 1fr); gap:26px; padding-top:30px; }
        @media (max-width:980px){ .vidgal-card-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (max-width:620px){ .vidgal-card-grid{ grid-template-columns:1fr; } }
        @media (max-width:720px){ .vidgal-film-count{ margin-left:0 !important; width:100%; padding-top:6px; } }
      `}</style>

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
                onClick={() => {
                  setFilter(f.id);
                  setLightbox(null);
                }}
                className="vidgal-filter-chip"
                style={{
                  appearance: "none",
                  border: `1px solid ${filter === f.id ? brass : line}`,
                  background: filter === f.id ? brass : "transparent",
                  color: filter === f.id ? "#181410" : inkDim,
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
                        color={ink}
                        style={{ marginLeft: 2 }}
                      />
                    </span>
                    <div style={metaStyle}>
                      <div
                        style={{
                          fontSize: 10.5,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: brass,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        {categoryLabel[v.categoryId]}
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: "'Fraunces', serif",
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: 1.25,
                          color: ink,
                        }}
                      >
                        {v.title}
                      </h3>
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
                onClick={() => setLightbox(null)}
                style={closeBtnStyle}
                className="vidgal-close-btn"
                aria-label="Close"
              >
                <FiX size={16} color={ink} />
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
const ink = "#efe9db";
const inkDim = "#9c9584";
const bg = "#0A0A0A"; // solid dark, matches the hero band (was "#fff", which hid the cream text)
const panel = "#201d18";
const line = "#33302a";
const brass = "#b9905a";
const shadow = "0 30px 60px -25px rgba(0,0,0,0.6)";

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
  color: brass,
  background: "rgba(18,16,14,0.55)",
  backdropFilter: "blur(6px)",
  padding: "6px 10px",
  border: "1px solid rgba(185,144,90,0.35)",
};

const idxStyle = {
  position: "absolute",
  top: 14,
  right: 14,
  fontFamily: "'Fraunces', serif",
  fontSize: 12,
  color: inkDim,
};

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
  backdropFilter: "blur(4px)",
};

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
  gap: 20,
};
const lbCatStyle = {
  fontSize: 10.5,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: brass,
  fontWeight: 700,
  marginBottom: 6,
};
const lbTitleStyle = {
  margin: 0,
  fontFamily: "'Fraunces', serif",
  fontWeight: 400,
  fontSize: 26,
  color: ink,
};
const closeBtnStyle = {
  border: `1px solid ${line}`,
  background: "transparent",
  color: ink,
  width: 38,
  height: 38,
  borderRadius: "50%",
  cursor: "pointer",
  flex: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
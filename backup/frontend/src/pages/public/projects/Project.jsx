import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiMaximize2 } from "react-icons/fi";
import { categoryAPI, projectAPI, itemPath } from "../../../services/api"; // adjust the path to your project
import { subscribeCacheInvalidation } from "../../../lib/publicCache";

const GALLERY_HERO_BG_IMAGE = "/static/hero-bg.jpg";

// If your backend paginates (e.g. default 10 per page), ask for more here.
// Remove or rename the keys if your API uses different query params.
const FALLBACK_PROJECT_IMAGES = [
  "/static/work-oh-office.jpg",
  "/static/work-myrtle.jpg",
  "/static/work-clifton.jpg",
  "/static/work-runic.jpg",
  "/static/work-stanley.jpg",
  "/static/work-samford.jpg",
];

const FETCH_PARAMS = { limit: 1000, page: 1 };

// Works with both `{ data: { data: [...] } }` and `{ data: [...] }` responses
const LIST_KEYS = ["data","items","results","docs","rows","records","gallery","galleries","photos","images","categories"];
const toList = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];
  for (const k of LIST_KEYS) {
    const v = body[k];
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k2 of LIST_KEYS) if (Array.isArray(v[k2])) return v[k2];
    }
  }
  return Object.values(body).find(Array.isArray) ?? [];
};

// Records may use `_id` (Mongo) or `id` (SQL / Sequelize)
const getId = (x) => x?._id ?? x?.id ?? x?.ID;

// categoryId can be a plain id or a populated category object
const getCategoryId = (item) => {
  const c =
    item?.categoryId ?? item?.category ?? item?.categoryID ?? item?.category_id;
  return c && typeof c === "object" ? getId(c) : c;
};

// Category display name: categoryName / name / title
const getCategoryName = (c) =>
  c?.categoryName ?? c?.category_name ?? c?.name ?? c?.title ?? "";

// The photo field may be called photo / image / images / img ... (string or array)
const getPhotoPath = (g) => {
  const v =
    g?.photo ?? g?.image ?? g?.images ?? g?.img ?? g?.photos ?? g?.url ?? g?.path ?? g?.file;
  const first = Array.isArray(v) ? v[0] : v;
  if (first && typeof first === "object") return first.url ?? first.path ?? "";
  return first ?? "";
};

// Absolute / local static URLs are used as-is; stored paths are resolved via itemPath
const photoUrl = (path = "") => {
  if (!path) return "";
  return /^(https?:|data:|blob:|\/static\/|\/images\/|\/uploads\/)/i.test(path)
    ? path
    : `${itemPath ?? ""}/${String(path).replace(/^\/+/, "")}`;
};

// Only an explicit "off" hides a record; a missing/odd status value does not
const isOff = (status) =>
  status === false || status === "false" || status === 0 || status === "0";

/* ---------------- cache layer ----------------
   Goal: the two big API calls (categories + gallery) run ONLY when the
   data has changed on the server.

   How it works:
   1. A tiny "version" request asks the server "what is the data version?"
      (projectAPI.getVersion). It returns a small string/number that changes
      whenever a category or photo is added / edited / deleted.
   2. If it equals the cached version -> use the cache, skip the big calls.
   3. If it differs (or there is no cache) -> fetch everything and store it
      together with the new version.
   4. The version request itself is throttled (VERSION_CHECK_INTERVAL), so
      moving between pages does not even send that one.
   5. If the version endpoint does not exist or fails, it falls back to the
      timer (CACHE_TTL), so the page still works.
   6. An empty result is NEVER cached, so one bad response cannot leave the
      page blank until the version changes.
----------------------------------------------- */
const CACHE_KEY = "photogallery:data:v5";
const OLD_CACHE_KEYS = [
  "photogallery:data:v1",
  "photogallery:data:v2",
  "photogallery:data:v3",
  "photogallery:data:v4",
];
const CACHE_TTL = 10 * 60 * 1000; // fallback only: used when no version endpoint works
const VERSION_CHECK_INTERVAL = 60 * 1000; // ask the server at most once per minute

let memoryCache = null; // survives route changes (no re-read from storage)
let inflight = null; // de-dupes simultaneous requests
let lastVersionCheck = 0; // time of the last version request

// Drop caches left behind by older versions of this file
try {
  OLD_CACHE_KEYS.forEach((k) => localStorage.removeItem(k));
} catch {
  /* ignore */
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      memoryCache = null;
      lastVersionCheck = 0;
      return null;
    }
    if (!memoryCache) memoryCache = JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // A cache without photos is useless and may hide a real problem
  if (memoryCache && !(memoryCache.photos?.length > 0)) memoryCache = null;
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

// Clears in-memory + storage cache when triggered via admin invalidation event
function clearGalleryCache() {
  memoryCache = null;
  inflight = null;
  lastVersionCheck = 0;
  try {
    localStorage.removeItem(CACHE_KEY);
    OLD_CACHE_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// Returns the server data version, or undefined if it cannot be read
async function fetchServerVersion() {
  if (typeof projectAPI.getVersion !== "function") return undefined;
  try {
    const res = await projectAPI.getVersion();
    const v = res?.data?.version ?? res?.data?.data?.version;
    return v === undefined || v === null ? undefined : String(v);
  } catch (err) {
    console.warn("Gallery version check failed, using timer cache:", err);
    return undefined;
  }
}

async function fetchGalleryData(version) {
  if (inflight) return inflight;
  inflight = (async () => {
    const [catRes, galRes] = await Promise.all([
      categoryAPI.getAll(FETCH_PARAMS),
      projectAPI.getAll(FETCH_PARAMS),
    ]);

    const rawCategories = toList(catRes);
    const rawPhotos = toList(galRes);

    // Only active categories
    const categories = rawCategories
      .filter((c) => !isOff(c.status))
      .map((c) => ({ ...c, _id: String(getId(c)), categoryName: getCategoryName(c) }));
    const activeIds = new Set(categories.map((c) => c._id));

    // Only active photos that belong to an active category
    const photos = rawPhotos
      .filter((g) => !isOff(g.status))
      .filter((g) => activeIds.has(String(getCategoryId(g))))
      .map((g) => ({
        id: String(getId(g)),
        title: g.title ?? g.name ?? "",
        categoryId: String(getCategoryId(g)),
        src: getPhotoPath(g) ? photoUrl(getPhotoPath(g)) : "",
      }));

    // Debug: if "kept" is 0 while "raw" is not, a filter is removing everything
    console.info(
      "[gallery] raw categories/photos:",
      rawCategories.length,
      rawPhotos.length,
      "| kept:",
      categories.length,
      photos.length,
    );

    // On-screen hint shown only when nothing could be displayed
    let diag = "";
    if (photos.length === 0) {
      diag =
        rawPhotos.length === 0
          ? `The gallery API returned no records. Response keys: ${Object.keys(galRes?.data ?? {}).join(", ") || "none"}.`
          : `Received ${rawCategories.length} categories and ${rawPhotos.length} photos, but ${categories.length} categories and ${photos.length} photos matched. Photo fields: ${Object.keys(rawPhotos[0] ?? {}).join(", ")}. First photo category value: ${JSON.stringify(getCategoryId(rawPhotos[0]))}. Category ids: ${rawCategories.slice(0, 5).map((c) => getId(c)).join(", ")}.`;
    }

    const data = { categories, photos, version };
    // Only cache real data
    if (photos.length > 0) writeCache(data);
    return { ...data, diag };
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function resolveProjectsData(force = false) {
  const c = force ? null : readCache();
  const hasData = !!c;
  try {
    // Checked recently -> trust the cache, send no request at all
    if (!force && hasData && Date.now() - lastVersionCheck < VERSION_CHECK_INTERVAL) {
      return { skipped: true, hasData };
    }

    // Tiny request: has the data changed on the server?
    const serverVersion = await fetchServerVersion();
    lastVersionCheck = Date.now();

    if (!force && hasData) {
      const versionKnown = serverVersion !== undefined;
      const upToDate = versionKnown
        ? c.version === serverVersion
        : Date.now() - c.savedAt < CACHE_TTL;
      if (upToDate) return { skipped: true, hasData }; // nothing changed -> skip the big API calls
    }

    // First visit, or data changed -> fetch fresh data and cache it
    const data = await fetchGalleryData(serverVersion);
    return { skipped: false, data, hasData };
  } catch (err) {
    err.hasData = hasData;
    throw err;
  }
}

export default function PhotoGallery() {
  const cached = readCache();

  const [categories, setCategories] = useState(cached?.categories ?? []);
  const [photos, setPhotos] = useState(cached?.photos ?? []);
  const [loading, setLoading] = useState(!cached); // no spinner if cache exists
  const [error, setError] = useState("");
  const [diag, setDiag] = useState("");
  const [filter, setFilter] = useState("all"); // "all" or a category _id

  const startFetch = useCallback((force = false) => {
    let cancelled = false;
    resolveProjectsData(force)
      .then((res) => {
        if (cancelled || res.skipped) return;
        setCategories(res.data.categories);
        setPhotos(res.data.photos);
        setDiag(res.data.diag || "");
        setError("");
      })
      .catch((err) => {
        console.error("Gallery load failed:", err);
        if (!cancelled && !err?.hasData) {
          setError(
            err?.response?.data?.message || "Could not load the gallery.",
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
      clearGalleryCache();
      cancel?.();
      cancel = startFetch(true);
    };
    const unsubscribe = subscribeCacheInvalidation((scope) => {
      if (scope === "projects" || scope === "gallery") handleSync();
    });
    const onStorage = (e) => {
      if (!e.key || e.key === CACHE_KEY) handleSync();
    };
    window.addEventListener("projects-updated", handleSync);
    window.addEventListener("storage", onStorage);

    return () => {
      cancel?.();
      unsubscribe();
      window.removeEventListener("projects-updated", handleSync);
      window.removeEventListener("storage", onStorage);
    };
  }, [startFetch]);

  const categoryLabel = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[String(c._id)] = getCategoryName(c);
    });
    return map;
  }, [categories]);

  const filters = useMemo(
    () => [
      { id: "all", label: "All" },
      ...categories.map((c) => ({
        id: String(c._id),
        label: getCategoryName(c),
      })),
    ],
    [categories],
  );

  const filteredPhotos = useMemo(
    () =>
      photos.filter((p) => filter === "all" || p.categoryId === filter),
    [filter, photos],
  );

  return (
    <div
      className="photogal-page"
      style={{
        background: bg,
        color: ink,
        minHeight: "100vh",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <style>{`

        /* HERO (same look as Contact page) */
        .photogal-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:#0A0A0A;
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){
          .photogal-hero-section{ padding:120px 0; }
        }
        .photogal-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(
            to bottom,
            rgba(10,10,10,0.72),
            rgba(10,10,10,0.60)
          );
        }
        .photogal-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:1180px;
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .photogal-hero-inner-container{ padding:0 40px; }
        }
        .photogal-hero-heading{
          margin:0;
          text-align:center;
          font-family:var(--font-sans);
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .photogal-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .photogal-hero-heading{ font-size:56px; } }

        /* GALLERY SECTION */
        .photogal-gallery-section{
          position:relative;
          background:${bg};
        }
        .photogal-blueprint-grid{
          position:absolute; inset:0; pointer-events:none;
          opacity:0.35;
          background-image:
            linear-gradient(rgba(185,144,90,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(185,144,90,0.06) 1px, transparent 1px);
          background-size:64px 64px;
          -webkit-mask-image:radial-gradient(1200px 700px at 50% 0%, black, transparent 75%);
          mask-image:radial-gradient(1200px 700px at 50% 0%, black, transparent 75%);
        }
        .photogal-fade-in{ animation: photogal-rise-keyframes .6s cubic-bezier(.2,.8,.2,1) forwards; opacity:0; transform:translateY(18px); }
        @keyframes photogal-rise-keyframes{ to{ opacity:1; transform:translateY(0); } }
        .photogal-photo-tile{ transition: transform .45s cubic-bezier(.2,.8,.2,1), border-color .3s; }
        .photogal-photo-tile:hover{ transform:translateY(-5px); border-color:#544d3b; }
        .photogal-photo-tile img{ transition: transform .7s cubic-bezier(.2,.8,.2,1), filter .5s; }
        .photogal-photo-tile:hover img{ transform:scale(1.1); filter:grayscale(12%) sepia(6%) saturate(120%) brightness(0.62) contrast(1.05) !important; }
        .photogal-tile-corner{ opacity:0; transition:opacity .3s; }
        .photogal-photo-tile:hover .photogal-tile-corner{ opacity:1; }
        .photogal-tile-expand{ opacity:0; transition:opacity .3s; }
        .photogal-photo-tile:hover .photogal-tile-expand{ opacity:1; }
        .photogal-photo-tile:focus-visible{ outline:2px solid #8a6a28; outline-offset:3px; }
        .photogal-filter-chip{ transition: all .25s ease; }
        .photogal-filter-chip:focus-visible{ outline:2px solid #8a6a28; outline-offset:2px; }
        .photogal-masonry-grid{ column-count:3; column-gap:20px; }
        @media (max-width:980px){ .photogal-masonry-grid{ column-count:2; } }
        @media (max-width:620px){ .photogal-masonry-grid{ column-count:1; } }
        @media (max-width:720px){ .photogal-photo-count{ margin-left:0 !important; width:100%; padding-top:6px; } }
      `}</style>

      {/* HERO BAND */}
      <section
        className="photogal-hero-section"
        style={{ backgroundImage: `url(${GALLERY_HERO_BG_IMAGE})` }}
      >
        <div className="photogal-hero-dark-overlay" />
        <div className="photogal-hero-inner-container">
          <h1 className="photogal-hero-heading">
            Project Gallery - Yashmeen Future Building & Fit-Out Company
          </h1>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="photogal-gallery-section">
        <div className="photogal-blueprint-grid" />

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
                onClick={() => setFilter(f.id)}
                className="photogal-filter-chip"
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
                className="photogal-photo-count"
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: inkDim,
                  letterSpacing: "0.04em",
                }}
              >
                {filteredPhotos.length} photos
              </span>
            )}
          </div>

          {/* PHOTO MASONRY */}
          {loading ? (
            <div style={messageStyle}>Loading gallery…</div>
          ) : error ? (
            <div style={{ ...messageStyle, color: "#DC2626" }}>{error}</div>
          ) : filteredPhotos.length === 0 ? (
            <div style={messageStyle}>
              No photos in this category yet.
              {diag && (
                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
                  {diag}
                </div>
              )}
            </div>
          ) : (
            <div className="photogal-masonry-grid" style={{ paddingTop: 30 }}>
              {filteredPhotos.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/project/details/${p.id}`}
                  className="photogal-photo-tile photogal-fade-in"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    animationDelay: `${Math.min(i, 18) * 0.03}s`,
                    breakInside: "avoid",
                    marginBottom: 20,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: `1px solid ${line}`,
                  }}
                >
                  <img
                    src={p.src || FALLBACK_PROJECT_IMAGES[i % FALLBACK_PROJECT_IMAGES.length]}
                    alt={p.title}
                    loading="lazy"
                    style={imgStyle}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_PROJECT_IMAGES[i % FALLBACK_PROJECT_IMAGES.length];
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(18,17,16,0) 45%, rgba(18,17,16,0.9) 100%)",
                    }}
                  />
                  <span
                    className="photogal-tile-corner"
                    style={{
                      ...cornerStyle,
                      top: 12,
                      left: 12,
                      borderTop: `1.5px solid ${brass}`,
                      borderLeft: `1.5px solid ${brass}`,
                    }}
                  />
                  <span
                    className="photogal-tile-corner"
                    style={{
                      ...cornerStyle,
                      bottom: 12,
                      right: 12,
                      borderBottom: `1.5px solid ${brass}`,
                      borderRight: `1.5px solid ${brass}`,
                    }}
                  />
                  <span style={tagStyle}>{categoryLabel[p.categoryId]}</span>
                  <span className="photogal-tile-expand" style={expandStyle}>
                    <FiMaximize2 size={13} color={ovInk} />
                  </span>
                  <div style={metaStyle}>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-serif)",
                        fontWeight: 400,
                        fontSize: 17,
                        lineHeight: 1.25,
                        color: ovInk,
                      }}
                    >
                      {p.title}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------------- tokens & shared styles ---------------- */
const ink = "#1b1a17";
const inkDim = "#6b665c";
const bg = "#fbfaf7";
const line = "#e6e1d6";
const brass = "#8a6a28";
// Overlay palette: text that sits on photos or the dark lightbox
const ovInk = "#f3eee2";
const ovBrass = "#e0bd7c";

const messageStyle = {
  padding: "80px 0",
  textAlign: "center",
  color: inkDim,
  fontSize: 14,
};

const imgStyle = {
  width: "100%",
  height: "auto", // photos come from the API now, so let them keep their own height
  minHeight: 220,
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

const expandStyle = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid rgba(239,233,219,0.5)",
  background: "rgba(18,16,14,0.35)",};

const metaStyle = { position: "absolute", left: 16, right: 16, bottom: 14 };
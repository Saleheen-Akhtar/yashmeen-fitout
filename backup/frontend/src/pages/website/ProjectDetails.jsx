import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FiMaximize,
  FiMapPin,
  FiTarget,
  FiBriefcase,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { projectAPI, itemPath } from "../../services/api"; // adjust the path to your project

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1758448721205-8465cebc26af?auto=format&fit=crop&w=1800&q=80";

/* ---------------- helpers: map whatever the API returns ---------------- */

// Absolute URLs are used as-is; stored paths are resolved via itemPath
const photoUrl = (path = "") =>
  /^https?:\/\//i.test(path)
    ? path
    : `${itemPath ?? ""}/${String(path).replace(/^\/+/, "")}`;

// Works with `{ data: { data: {...} } }`, `{ data: {...} }` and `{ data: { project: {...} } }`
const toProject = (res) => {
  let body = res?.data;
  for (const k of ["data", "project", "item", "result", "record"]) {
    if (body && typeof body === "object" && !Array.isArray(body) && body[k] && typeof body[k] === "object") {
      body = body[k];
    }
  }
  if (Array.isArray(body)) body = body[0];
  return body && typeof body === "object" ? body : null;
};

const pick = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
};

// Collects every photo from photo / image / images / photos / gallery ... (string, array, or objects)
const getImages = (p) => {
  const out = [];
  const add = (v) => {
    if (!v) return;
    if (Array.isArray(v)) return v.forEach(add);
    if (typeof v === "object") return add(v.url ?? v.path ?? v.src ?? v.file ?? v.photo ?? v.image);
    if (typeof v === "string") out.push(photoUrl(v.trim()));
  };
  ["photo", "image", "img", "thumbnail", "images", "photos", "gallery", "galleryImages", "files"].forEach((k) =>
    add(p?.[k])
  );
  return [...new Set(out)];
};

const getYouTubeId = (url = "") => {
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})(?![\w-])/
  );
  return m ? m[1] : null;
};

/* ---------------- cache layer ----------------
   Goal: projectAPI.getById runs ONLY when the data has changed on the server.

   1. Each project is cached (memory + localStorage) together with the
      server "data version" it was fetched with.
   2. Opening the page again shows the cached project instantly (no spinner).
   3. A tiny version request (projectAPI.getVersion) asks the server whether
      anything changed. Same version -> keep the cache, skip getById.
      Different version -> fetch the project again and update the cache.
   4. The version request is throttled (VERSION_CHECK_INTERVAL), so quickly
      opening several projects sends it at most once per minute.
   5. If the version endpoint is missing or fails, a timer (CACHE_TTL) is used.
   6. Missing / empty projects are never cached.
----------------------------------------------- */
const CACHE_PREFIX = "projectdetails:v1:";
const CACHE_TTL = 10 * 60 * 1000; // fallback only: used when no version endpoint works
const VERSION_CHECK_INTERVAL = 60 * 1000; // ask the server at most once per minute

const memoryCache = new Map(); // projectId -> { project, version, savedAt }
const inflight = new Map(); // projectId -> Promise (de-dupes simultaneous requests)
let lastVersionCheck = 0;
let lastServerVersion; // result of the most recent version request

function readCache(id) {
  const key = String(id);
  if (memoryCache.has(key)) return memoryCache.get(key);
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw) {
      const entry = JSON.parse(raw);
      if (entry?.project) {
        memoryCache.set(key, entry);
        return entry;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(id, project, version) {
  const key = String(id);
  const entry = { project, version, savedAt: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* ignore (storage full / disabled) */
  }
}

// Call from your admin panel after add / edit / delete (same browser only)
export function clearProjectDetailsCache(id) {
  lastVersionCheck = 0;
  lastServerVersion = undefined;
  try {
    if (id !== undefined) {
      memoryCache.delete(String(id));
      localStorage.removeItem(CACHE_PREFIX + String(id));
      return;
    }
    memoryCache.clear();
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
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
    console.warn("Project version check failed, using timer cache:", err);
    return undefined;
  }
}

function fetchProject(id, version) {
  const key = String(id);
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    const res = await projectAPI.getById(id);
    const data = toProject(res);
    if (data) writeCache(id, data, version); // only cache real data
    return data;
  })().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, p);
  return p;
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams();

  const initial = readCache(projectId);
  const [project, setProject] = useState(initial?.project ?? null);
  const [loading, setLoading] = useState(!initial); // no spinner if cache exists
  const [error, setError] = useState("");

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const stripRef = useRef(null);

  /* ---------- load the project (cache first, API only if data changed) ---------- */
  useEffect(() => {
    let cancelled = false;
    const cached = readCache(projectId);

    setActive(0);
    setLightbox(null);
    setError("");
    setProject(cached?.project ?? null);
    setLoading(!cached);

    (async () => {
      try {
        const checkedRecently = Date.now() - lastVersionCheck < VERSION_CHECK_INTERVAL;

        // Checked recently and we have this project -> trust the cache, send no request
        if (cached && checkedRecently) return;

        // Tiny request: has the data changed on the server?
        let serverVersion;
        if (checkedRecently) {
          serverVersion = lastServerVersion;
        } else {
          serverVersion = await fetchServerVersion();
          lastServerVersion = serverVersion;
          lastVersionCheck = Date.now();
        }

        if (cached) {
          const versionKnown = serverVersion !== undefined;
          const upToDate = versionKnown
            ? cached.version === serverVersion
            : Date.now() - cached.savedAt < CACHE_TTL;
          if (upToDate) return; // nothing changed -> skip getById
        }

        // First visit, or data changed -> fetch fresh data and cache it
        const data = await fetchProject(projectId, serverVersion);
        if (cancelled) return;
        if (!data) {
          setProject(null);
          setError("Project not found.");
        } else {
          setProject(data);
          setError("");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Project load failed:", err);
        // if cached data is already on screen, fail silently
        if (!cached) {
          setProject(null);
          setError(
            err?.response?.status === 404
              ? "Project not found."
              : err?.response?.data?.message || "Could not load this project."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    window.scrollTo?.(0, 0);
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  /* ---------- derived data ---------- */
  const images = project ? getImages(project) : [];
  const thumbs = images;
  const title = project ? pick(project, ["title", "name", "projectName", "project_name"]) : "";
  const videoId = project
    ? getYouTubeId(pick(project, ["youtubeUrl", "youtube_url", "youtube", "videoUrl", "video_url", "video", "videoLink", "link"]))
    : null;

  const info = project
    ? [
        { icon: FiMaximize, label: "Size", value: pick(project, ["size", "area", "projectSize"]) },
        { icon: FiMapPin, label: "Location", value: pick(project, ["location", "city", "address"]) },
        { icon: FiTarget, label: "Scope", value: pick(project, ["scope", "scopeOfWork", "scope_of_work"]) },
        {
          icon: FiBriefcase,
          label: "Sector",
          value: pick(project, ["sector", "type", "projectType", "industry"]),
        },
      ].filter((i) => i.value)
    : [];

  const count = images.length;

  const goPrev = () => setActive((i) => (count ? (i - 1 + count) % count : 0));
  const goNext = () => setActive((i) => (count ? (i + 1) % count : 0));

  // keep the active thumbnail visible in the strip
  useEffect(() => {
    const strip = stripRef.current;
    const thumb = strip?.children[active];
    if (!strip || !thumb) return;
    strip.scrollTo({
      left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: "smooth",
    });
  }, [active, count]);

  const closeBox = useCallback(() => setLightbox(null), []);
  const boxPrev = useCallback(
    () => setLightbox((i) => (i === null || !count ? i : (i - 1 + count) % count)),
    [count]
  );
  const boxNext = useCallback(
    () => setLightbox((i) => (i === null || !count ? i : (i + 1) % count)),
    [count]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeBox();
      if (e.key === "ArrowLeft") boxPrev();
      if (e.key === "ArrowRight") boxNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, closeBox, boxPrev, boxNext]);

  return (
    <div className="page">
      <style>{`

        :root{
          --ink:#1b1a17;
          --dark:#fbfaf7;
          --card:#ffffff;
          --gray-200:#e6e1d6;
          --gray-500:#6b665c;
          --brass:#8a6a28;
          --brass-deep:#6f541d;
          --font-display:var(--font-sans);
          --font-body:var(--font-sans);
          --max-w:1180px;
        }
        *{ box-sizing:border-box; }
        .page{
          min-height:100vh;
          width:100%;
          background:var(--dark);
          color:var(--ink); font-family:var(--font-body); }
        button{ font-family:inherit; }
        .wrap{ max-width:var(--max-w); margin:0 auto; padding:0 24px; }
        .edge{ width:100%; }
        .edge-viewer{ padding:0 2%; }
        .edge-info{ padding:0 2.3%; }
        .edge-showcase{ padding:0 var(--showcase-pad, 0); }
        @media (min-width:768px){ .wrap{ padding:0 40px; } }

        /* STATUS (loading / error) */
        .status{
          min-height:60vh; display:flex; align-items:center; justify-content:center;
          text-align:center; padding:24px; font-size:15px; color:var(--gray-500);
        }
        .status.error{ color:#DC2626; }

        /* HERO */
        .hero{
          position:relative; isolation:isolate;
          min-height:220px; display:flex; align-items:center; justify-content:center;
          text-align:center; background-color:var(--dark); background-size:cover; background-position:center;
        }
        @media (min-width:768px){ .hero{ min-height:280px; } }
        .hero::before{
          content:""; position:absolute; inset:0; z-index:0;
          background:rgba(40,12,10,0.5);
        }
        .hero > .wrap{ position:relative; z-index:1; }
        .hero-title{
          margin:0; font-weight:700; color:#FFFFFF;
          font-size:34px; line-height:1.15; letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .hero-title{ font-size:46px; } }
        @media (min-width:1024px){ .hero-title{ font-size:56px; } }

        /* VIEWER */
        .viewer{ padding-top:36px; }
        .main-img{
          display:block; width:100%; aspect-ratio:16 / 10; object-fit:cover;
          background:var(--card);
        }
        @media (min-width:768px){ .main-img{ aspect-ratio:16 / 9; } }

        .strip-wrap{ position:relative; margin-top:20px; }
        .strip{
          display:flex; gap:0; overflow-x:auto; scrollbar-width:none;
          scroll-snap-type:x proximity;
        }
        .strip::-webkit-scrollbar{ display:none; }
        .thumb{
          flex:0 0 40%; padding:0; border:0; background:none; cursor:pointer;
          scroll-snap-align:start; position:relative;
        }
        @media (min-width:768px){ .thumb{ flex-basis:25%; } }
        .thumb img{
          display:block; width:100%; aspect-ratio:4 / 3; object-fit:cover;
          background:var(--card);
        }
        .thumb:focus-visible{ outline:3px solid var(--brass); outline-offset:-3px; }

        .arrow{
          position:absolute; top:50%; transform:translateY(-50%);
          width:36px; height:48px; border:0; cursor:pointer; background:none;
          color:rgba(40,40,40,0.75);
          display:flex; align-items:center; justify-content:center;
          filter:drop-shadow(0 0 2px rgba(255,255,255,0.6)); transition:color .15s;
        }
        .arrow:hover{ color:var(--brass-deep); }
        .arrow:focus-visible{ outline:3px solid var(--brass); outline-offset:2px; }
        .arrow-prev{ left:4px; }
        .arrow-next{ right:4px; }

        .dots{ margin-top:14px; display:flex; flex-wrap:wrap; justify-content:center; gap:0; }
        .dot{
          width:18px; height:24px; padding:0; border:0; background:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
        }
        .dot::before{
          content:""; width:6px; height:6px; border-radius:50%;
          background:#DCCBB6; transition:background .15s;
        }
        .dot[aria-current="true"]::before{ background:#B08A66; }
        .dot:focus-visible{ outline:2px solid var(--brass); border-radius:50%; }

        /* INFO CARDS */
        .info{ padding:80px 0 56px; }
        .info-grid{ display:grid; grid-template-columns:1fr; gap:18px; }
        @media (min-width:640px){ .info-grid{ grid-template-columns:repeat(2,1fr); } }
        @media (min-width:1024px){ .info-grid{ grid-template-columns:repeat(4,1fr); } }
        .info-card{
          position:relative;
          background:#ffffff;
          border:1px solid var(--gray-200);
          backdrop-filter:blur(16px); border-radius:28px;
          padding:26px 26px 20px;
        }
        .info-top{ display:flex; align-items:center; gap:14px; }
        .info-icon{
          flex-shrink:0;
          width:48px;
          height:48px;
          border-radius:50%;
          background:rgba(197,160,89,0.12);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--brass-deep);
        }
        .info-label{ font-size:16px; font-weight:400; }
        .info-rule{ margin:20px 0 0; border:0; border-top:1px solid var(--gray-200); }
        .info-value{
          margin:16px 0 0; padding-right:52px; min-height:40px;
          font-size:12.5px; line-height:1.5; color:var(--ink);
        }
        .info-go{
          position:absolute;
          right:14px;
          bottom:14px;
          width:40px;
          height:40px;
          border-radius:50%;
          background:#ffffff;
          color:var(--brass-deep);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 1px 4px rgba(0,0,0,0.12);
        }

        /* VIDEO */
        .video{ padding:0 0 72px; }
        .video-title{ margin:0 0 24px; font-size:26px; font-weight:400; line-height:1.2; }
        @media (min-width:768px){ .video-title{ font-size:30px; } }
        .video-frame{
          position:relative; width:100%; aspect-ratio:16 / 9;
          border-radius:28px; overflow:hidden; background:var(--dark);
        }
        .video-frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }

        /* SHOWCASE */
        .showcase{
          background:var(--dark); color:var(--ink);
          border-radius:36px 36px 0 0; padding:100px 0 40px;
        }
        @media (min-width:768px){ .showcase{ padding:130px 0 40px; } }
        .showcase-title{ margin:0; font-size:26px; font-weight:400; line-height:1.2; }
        @media (min-width:768px){ .showcase-title{ font-size:30px; } }
        .showcase-sub{
          margin:8px 0 0; display:flex; align-items:center; gap:8px;
          font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.02em;
          color:var(--brass);
        }
        .showcase-sub::before{
          content:""; border-style:solid; border-width:5px 7px 5px 0;
          border-color:transparent var(--brass) transparent transparent;
        }
        .showcase-grid{
          margin-top:48px; display:grid; gap:10px;
          grid-template-columns:repeat(2,1fr);
        }
        @media (min-width:640px){ .showcase-grid{ grid-template-columns:repeat(3,1fr); } }
        @media (min-width:1024px){ .showcase-grid{ grid-template-columns:repeat(5,1fr); } }
        .tile{
          padding:0; border:0; background:none; cursor:pointer; overflow:hidden; display:block;
        }
        .tile img{
          display:block; width:100%; aspect-ratio:4 / 3; object-fit:cover;
          background:#2A2424; transition:transform .5s ease;
        }
        .tile:hover img{ transform:scale(1.06); }
        .tile:focus-visible{ outline:3px solid var(--brass); outline-offset:2px; }

        /* LIGHTBOX */
        .lightbox{
          position:fixed; inset:0; z-index:100; background:rgba(10,10,10,0.94);
          display:flex; align-items:center; justify-content:center; padding:24px;
        }
        .lb-img{ display:block; max-width:min(1200px,100%); max-height:86vh; object-fit:contain; border-radius:8px; }
        .lb-count{
          position:absolute; bottom:18px; left:0; right:0; text-align:center;
          font-size:13px; color:#ffffff;
        }
        .lb-btn{
          position:absolute; width:46px; height:46px; border-radius:50%; border:0; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.14); color:#ffffff; transition:background .15s;
        }
        .lb-btn:hover{ background:var(--brass); }
        .lb-btn:focus-visible{ outline:3px solid #FFFFFF; outline-offset:2px; }
        .lb-close{ top:20px; right:20px; }
        .lb-prev{ left:12px; top:50%; transform:translateY(-50%); }
        .lb-next{ right:12px; top:50%; transform:translateY(-50%); }

        @media (prefers-reduced-motion:reduce){
          *{ transition:none !important; scroll-behavior:auto !important; }
          .tile:hover img{ transform:none; }
        }
      `}</style>

      {loading ? (
        <div className="status">Loading project…</div>
      ) : error || !project ? (
        <div className="status error">{error || "Project not found."}</div>
      ) : (
        <>
          {/* HERO */}
          <section
            className="hero"
            style={{ backgroundImage: `url('${images[0] || FALLBACK_HERO}')` }}
          >
            <div className="wrap">
              <h1 className="hero-title">{title}</h1>
            </div>
          </section>

          {/* MAIN IMAGE + THUMBNAIL STRIP */}
          {count > 0 && (
            <section className="viewer">
              <div className="edge edge-viewer">
                <img
                  className="main-img"
                  src={images[active] ?? images[0]}
                  alt={`${title}, photo ${active + 1}`}
                />

                {count > 1 && (
                  <>
                    <div className="strip-wrap">
                      <div className="strip" ref={stripRef}>
                        {thumbs.map((src, i) => (
                          <button
                            key={i}
                            type="button"
                            className="thumb"
                            aria-current={i === active}
                            aria-label={`Show photo ${i + 1}`}
                            onClick={() => setActive(i)}
                          >
                            <img src={src} alt="" loading="lazy" />
                          </button>
                        ))}
                      </div>
                      <button type="button" className="arrow arrow-prev" aria-label="Previous photo" onClick={goPrev}>
                        <FiChevronLeft size={20} />
                      </button>
                      <button type="button" className="arrow arrow-next" aria-label="Next photo" onClick={goNext}>
                        <FiChevronRight size={20} />
                      </button>
                    </div>

                    <div className="dots">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className="dot"
                          aria-current={i === active}
                          aria-label={`Go to photo ${i + 1}`}
                          onClick={() => setActive(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* INFO CARDS */}
          {info.length > 0 && (
            <section className="info">
              <div className="edge edge-info">
                <div className="info-grid">
                  {info.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="info-card">
                      <div className="info-top">
                        <span className="info-icon"><Icon size={22} aria-hidden="true" /></span>
                        <span className="info-label">{label}</span>
                      </div>
                      <hr className="info-rule" />
                      <p className="info-value">{String(value)}</p>
                      <span className="info-go" aria-hidden="true"><FiArrowUpRight size={16} /></span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* PROJECT VIDEO */}
          {videoId && (
            <section className="video">
              <div className="edge edge-info">
                <h2 className="video-title">Project Video</h2>
                <div className="video-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                    title={`${title} video`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
            </section>
          )}

          {/* FULL PROJECT SHOWCASE */}
          {count > 0 && (
            <section className="showcase">
              <div className="edge edge-showcase">
                <h2 className="showcase-title">Full Project Showcase</h2>
                <p className="showcase-sub">Click to explore now</p>

                <div className="showcase-grid">
                  {thumbs.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className="tile"
                      aria-label={`Open photo ${i + 1} full screen`}
                      onClick={() => setLightbox(i)}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* LIGHTBOX */}
          {lightbox !== null && images[lightbox] && (
            <div className="lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={closeBox}>
              <button type="button" className="lb-btn lb-close" aria-label="Close" autoFocus onClick={closeBox}>
                <FiX size={22} />
              </button>
              {count > 1 && (
                <>
                  <button
                    type="button" className="lb-btn lb-prev" aria-label="Previous photo"
                    onClick={(e) => { e.stopPropagation(); boxPrev(); }}
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    type="button" className="lb-btn lb-next" aria-label="Next photo"
                    onClick={(e) => { e.stopPropagation(); boxNext(); }}
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}
              <img
                className="lb-img"
                src={images[lightbox]}
                alt={`${title}, photo ${lightbox + 1}`}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="lb-count">{lightbox + 1} / {count}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
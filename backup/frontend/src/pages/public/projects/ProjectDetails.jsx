import "../../../styles/projects.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
import { projectAPI, itemPath } from "../../../services/api"; // adjust the path to your project
import { subscribeCacheInvalidation } from "../../../lib/publicCache";

const FALLBACK_HERO = "/static/hero-bg.jpg";
const FALLBACK_IMAGES = [
  "/static/hero-aperture-v2.webp",
  "/static/work-oh-office.jpg",
  "/static/Office-fit-out.jpg",
  "/static/joinery-bay.jpg",
  "/static/hero-editorial.webp",
  "/static/studio.jpg",
];
const handleProjectImgError = (idx) => (e) => {
  if (!e.currentTarget.dataset.fallbackApplied) {
    e.currentTarget.dataset.fallbackApplied = "1";
    e.currentTarget.src = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
  }
};

/* ---------------- helpers: map whatever the API returns ---------------- */

// Absolute / local static URLs are used as-is; stored paths are resolved via itemPath
const photoUrl = (path = "") => {
  if (!path) return "";
  return /^(https?:|data:|blob:|\/static\/|\/images\/|\/uploads\/)/i.test(path)
    ? path
    : `${itemPath ?? ""}/${String(path).replace(/^\/+/, "")}`;
};

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
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) {
      memoryCache.delete(key);
      return null;
    }
    if (memoryCache.has(key)) return memoryCache.get(key);
    const entry = JSON.parse(raw);
    if (entry?.project) {
      memoryCache.set(key, entry);
      return entry;
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

// Clear cache entries when triggered via admin invalidation
function clearProjectDetailsCache(id) {
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

async function resolveProjectDetail(projectId, force = false) {
  const cached = force ? null : readCache(projectId);
  try {
    const checkedRecently = !force && Date.now() - lastVersionCheck < VERSION_CHECK_INTERVAL;

    if (cached && checkedRecently) {
      return { skipped: true, hasCache: true };
    }

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
      if (upToDate) return { skipped: true, hasCache: true };
    }

    const data = await fetchProject(projectId, serverVersion);
    return { skipped: false, data, hasCache: !!cached };
  } catch (err) {
    err.hasCache = !!cached;
    throw err;
  }
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  return <ProjectDetailsInner key={projectId} projectId={projectId} />;
}

function ProjectDetailsInner({ projectId }) {
  const location = useLocation();
  const initial = readCache(projectId);
  const [project, setProject] = useState(initial?.project ?? null);
  const [loading, setLoading] = useState(!initial); // no spinner if cache exists
  const [error, setError] = useState("");

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const stripRef = useRef(null);

  const startFetch = useCallback(
    (force = false) => {
      let cancelled = false;
      resolveProjectDetail(projectId, force)
        .then((res) => {
          if (cancelled || res.skipped) return;
          if (!res.data) {
            setProject(null);
            setError("The requested architectural case study could not be found.");
          } else {
            setProject(res.data);
            setError("");
          }
        })
        .catch((err) => {
          console.error("Project load failed:", err);
          if (!cancelled && !err?.hasCache) {
            setProject(null);
            setError("The requested architectural case study could not be found.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    },
    [projectId],
  );

  /* ---------- load the project (cache first, API only if data changed) ---------- */
  useEffect(() => {
    window.scrollTo?.(0, 0);
    let cancel = startFetch(false);

    const handleSync = () => {
      clearProjectDetailsCache(projectId);
      cancel?.();
      cancel = startFetch(true);
    };
    const unsubscribe = subscribeCacheInvalidation((scope, id) => {
      if (
        (scope === "projects" || scope === "project-details") &&
        (!id || String(id) === String(projectId))
      ) {
        handleSync();
      }
    });
    const onStorage = (e) => {
      if (!e.key || e.key === CACHE_PREFIX + String(projectId)) handleSync();
    };
    window.addEventListener("projects-updated", handleSync);
    window.addEventListener("storage", onStorage);

    return () => {
      cancel?.();
      unsubscribe();
      window.removeEventListener("projects-updated", handleSync);
      window.removeEventListener("storage", onStorage);
    };
  }, [projectId, startFetch]);

  /* ---------- SEO metadata override per project / not-found ---------- */
  useEffect(() => {
    if (loading) return;
    if (error || !project) {
      window.dispatchEvent(
        new CustomEvent("seo-update", {
          detail: {
            pathname: location.pathname,
            title: "Project Not Found | Yashmeen Fit-Out Dubai",
            description:
              "The requested architectural case study could not be found. Browse completed projects by Yashmeen Future Building in Dubai.",
            robots: "noindex, follow",
          },
        }),
      );
      return;
    }

    const projectTitle =
      pick(project, ["title", "name", "projectName", "project_name"]) || "Project Case Study";
    const desc =
      pick(project, ["description", "summary", "scope"]) ||
      `Architectural specifications and fit-out execution for ${projectTitle} in Dubai by Yashmeen Future Building.`;
    const heroImg = getImages(project)[0] || "/static/hero-editorial.webp";
    window.dispatchEvent(
      new CustomEvent("seo-update", {
        detail: {
          pathname: location.pathname,
          title: `${projectTitle} | Yashmeen Fit-Out Dubai`,
          description: String(desc).replace(/\s+/g, " ").trim().slice(0, 160),
          image: heroImg,
          robots: "index, follow",
        },
      }),
    );
  }, [loading, error, project, location.pathname]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent("seo-update", { detail: null }));
    };
  }, []);

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
    <div className="page pd-page">

      {loading ? (
        <div className="status">Loading project…</div>
      ) : error || !project ? (
        <section className="status">
          <div className="pd-nf-card">
            <p className="pd-nf-kicker">Case Study Unavailable</p>
            <h1 className="pd-nf-title">Project Not Found</h1>
            <p className="pd-nf-copy">
              {error || "This architectural project could not be located or may have been archived."}
            </p>
            <div className="pd-nf-actions">
              <Link to="/projects" className="pd-nf-primary">
                Browse Selected Work
              </Link>
              <Link to="/contact" className="pd-nf-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
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
                  onError={handleProjectImgError(active)}
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
                            <img src={src} alt="" onError={handleProjectImgError(i)} />
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
                      <img src={src} alt="" loading="lazy" onError={handleProjectImgError(i)} />
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
                onError={handleProjectImgError(lightbox)}
              />
              <div className="lb-count">{lightbox + 1} / {count}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
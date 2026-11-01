import { useState, useMemo, useEffect } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
} from "react-icons/fi";
import { categoryAPI, galleryAPI, itemPath } from "../../services/api"; // adjust the path to your project

const GALLERY_HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1758448721205-8465cebc26af?auto=format&fit=crop&w=1800&q=80";

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

// Absolute URLs are used as-is; stored paths are resolved from the site root
const photoUrl = (path = "") =>
  /^https?:\/\//i.test(path) ? path : `/${String(path).replace(/^\/+/, "")}`;

/* ---------------- cache layer ---------------- */
const CACHE_KEY = "photogallery:data:v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 min - set 0 to always revalidate

let memoryCache = null; // survives route changes (no re-read from storage)
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

// Call this from your admin panel after add / edit / delete
export function clearGalleryCache() {
  memoryCache = null;
  inflight = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchGalleryData() {
  if (inflight) return inflight;
  inflight = (async () => {
    const [catRes, galRes] = await Promise.all([
      categoryAPI.getAll(),
      galleryAPI.getAll(),
    ]);

    // Only active categories
    const categories = toList(catRes).filter((c) => c.status === true);
    const activeIds = new Set(categories.map((c) => String(c._id)));

    // Only active photos that belong to an active category
    const photos = toList(galRes)
      .filter((g) => g.status === true)
      .filter((g) => activeIds.has(String(getCategoryId(g))))
      .map((g) => ({
        id: g._id,
        title: g.title,
        categoryId: String(getCategoryId(g)),
        src: photoUrl(g.photo),
      }));

    const data = { categories, photos };
    writeCache(data);
    return data;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export default function PhotoGallery() {
  const cached = readCache();

  const [categories, setCategories] = useState(cached?.categories ?? []);
  const [photos, setPhotos] = useState(cached?.photos ?? []);
  const [loading, setLoading] = useState(!cached); // no spinner if cache exists
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all" or a category _id
  const [photoLightbox, setPhotoLightbox] = useState(null); // index into `photos` (absolute)

  useEffect(() => {
    const c = readCache();
    const fresh = c && Date.now() - c.savedAt < CACHE_TTL;
    if (fresh) return; // ✅ cache is fresh → no API call

    let cancelled = false;
    fetchGalleryData()
      .then((data) => {
        if (cancelled) return;
        setCategories(data.categories);
        setPhotos(data.photos);
        setError("");
      })
      .catch((err) => {
        // if cached data is already on screen, fail silently
        if (!cancelled && !c) {
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

  const filteredPhotoIdx = useMemo(
    () =>
      photos
        .map((p, i) => i)
        .filter((i) => filter === "all" || photos[i].categoryId === filter),
    [filter, photos],
  );

  function stepPhoto(dir) {
    const pos = filteredPhotoIdx.indexOf(photoLightbox);
    const next =
      (pos + dir + filteredPhotoIdx.length) % filteredPhotoIdx.length;
    setPhotoLightbox(filteredPhotoIdx[next]);
  }

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
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700;800&family=Montserrat:wght@700;800&display=swap');

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
          font-family:'Montserrat', sans-serif;
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
        .photogal-filter-chip{ transition: all .25s ease; }
        .photogal-circle-btn{ transition: all .2s; }
        .photogal-circle-btn:hover{ border-color:${brass} !important; background:${brass} !important; }
        .photogal-circle-btn:hover svg{ color:#181410 !important; }
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
                onClick={() => setFilter(f.id)}
                className="photogal-filter-chip"
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
                className="photogal-photo-count"
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: inkDim,
                  letterSpacing: "0.04em",
                }}
              >
                {filteredPhotoIdx.length} photos
              </span>
            )}
          </div>

          {/* PHOTO MASONRY */}
          {loading ? (
            <div style={messageStyle}>Loading gallery…</div>
          ) : error ? (
            <div style={{ ...messageStyle, color: "#DC2626" }}>{error}</div>
          ) : filteredPhotoIdx.length === 0 ? (
            <div style={messageStyle}>No photos in this category yet.</div>
          ) : (
            <div className="photogal-masonry-grid" style={{ paddingTop: 30 }}>
              {filteredPhotoIdx.map((idx, i) => {
                const p = photos[idx];
                return (
                  <div
                    key={p.id}
                    className="photogal-photo-tile photogal-fade-in"
                    style={{
                      animationDelay: `${Math.min(i, 18) * 0.03}s`,
                      breakInside: "avoid",
                      marginBottom: 20,
                      position: "relative",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `1px solid ${line}`,
                    }}
                    onClick={() => setPhotoLightbox(idx)}
                  >
                    <img
                      src={p.src || FALLBACK_GALLERY_IMAGES[i % FALLBACK_GALLERY_IMAGES.length]}
                      alt={p.title}
                      loading="lazy"
                      style={imgStyle}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_GALLERY_IMAGES[i % FALLBACK_GALLERY_IMAGES.length];
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
                      <FiMaximize2 size={13} color={ink} />
                    </span>
                    <div style={metaStyle}>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: "'Fraunces', serif",
                          fontWeight: 400,
                          fontSize: 17,
                          lineHeight: 1.25,
                          color: ink,
                        }}
                      >
                        {p.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* PHOTO LIGHTBOX */}
      {photoLightbox !== null && photos[photoLightbox] && (
        <div
          style={overlayStyle}
          onClick={(e) =>
            e.target === e.currentTarget && setPhotoLightbox(null)
          }
        >
          <div style={{ width: "100%", maxWidth: 980 }}>
            <div style={lbHeadStyle}>
              <div>
                <div style={lbCatStyle}>
                  {categoryLabel[photos[photoLightbox].categoryId]}
                </div>
                <h2 style={lbTitleStyle}>{photos[photoLightbox].title}</h2>
              </div>
              <button
                onClick={() => setPhotoLightbox(null)}
                style={closeBtnStyle}
                className="photogal-circle-btn"
                aria-label="Close"
              >
                <FiX size={16} color={ink} />
              </button>
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                background: "#000",
                border: `1px solid ${line}`,
                boxShadow: shadow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxHeight: "72vh",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => stepPhoto(-1)}
                className="photogal-circle-btn"
                style={{ ...navBtnStyle, left: -64 }}
                aria-label="Previous"
              >
                <FiChevronLeft size={16} color={ink} />
              </button>
              <img
                src={photos[photoLightbox].src || FALLBACK_GALLERY_IMAGES[photoLightbox % FALLBACK_GALLERY_IMAGES.length]}
                alt={photos[photoLightbox].title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_GALLERY_IMAGES[photoLightbox % FALLBACK_GALLERY_IMAGES.length];
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  maxHeight: "72vh",
                }}
              />
              <button
                onClick={() => stepPhoto(1)}
                className="photogal-circle-btn"
                style={{ ...navBtnStyle, right: -64 }}
                aria-label="Next"
              >
                <FiChevronRight size={16} color={ink} />
              </button>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 14,
                fontSize: 11,
                letterSpacing: "0.14em",
                color: inkDim,
              }}
            >
              {String(filteredPhotoIdx.indexOf(photoLightbox) + 1).padStart(
                2,
                "0",
              )}{" "}
              / {String(filteredPhotoIdx.length).padStart(2, "0")}
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
  color: brass,
  background: "rgba(18,16,14,0.55)",
  backdropFilter: "blur(6px)",
  padding: "6px 10px",
  border: "1px solid rgba(185,144,90,0.35)",
};

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
  background: "rgba(18,16,14,0.35)",
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
const navBtnStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: 44,
  height: 44,
  borderRadius: "50%",
  cursor: "pointer",
  zIndex: 5,
  border: "1px solid rgba(239,233,219,0.35)",
  background: "rgba(18,16,14,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
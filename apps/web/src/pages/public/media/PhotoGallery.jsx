import useWebsiteContent from "../../../hooks/useWebsiteContent";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SpatialGallery3D } from "@/components/ui/spatial-gallery-3d";
import { categoryAPI, galleryAPI } from "../../../services/api";
import { resolveMediaUrl, mediaFallback } from "../../../lib/media";
import "../../../styles/photo-gallery.css";
import useDialogFocus from "../../../hooks/useDialogFocus";
import { subscribeCacheInvalidation } from "../../../lib/publicCache";

const MEDIA_UNAVAILABLE_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
    <rect width="1200" height="800" fill="#eae6de"/>
    <text x="600" y="400" text-anchor="middle" dominant-baseline="middle" fill="#6b665c" font-family="Arial, sans-serif" font-size="30" letter-spacing="4">PROJECT MEDIA UNAVAILABLE</text>
  </svg>
`)}`;

// Clean editorial display labels for legacy DB category strings while keeping IDs unchanged
const CATEGORY_LABEL_OVERRIDES = {
  "ac mentainance": "AC Maintenance",
  "electrical mentainance": "Electrical",
  "decor gypsum specialist": "Gypsum & Decor",
  "joinery and carpenter": "Joinery & Carpentry",
  "mep infrastructure/external electrical works": "MEP Infrastructure",
  "plumber p.p.r-pvc- drainach specialist": "Plumbing & Drainage",
  "cleaning services": "Cleaning",
};

const PHOTO_TITLE_OVERRIDES = {
  "fcu mentainance": "FCU Maintenance",
  "mirror clocetion": "Mirror Collection",
  "pergola work": "Pergola Work",
  "study table": "Study Table",
  "stair space": "Stair Space",
  "makeup with wardrobe area": "Makeup with Wardrobe Area",
};

const formatCategoryLabel = (raw = "") => {
  const clean = String(raw).trim();
  if (!clean) return "";
  return CATEGORY_LABEL_OVERRIDES[clean.toLowerCase()] ?? clean;
};

const formatPhotoTitle = (raw = "") => {
  const clean = String(raw).trim();
  if (!clean) return "Architectural Detail";
  return PHOTO_TITLE_OVERRIDES[clean.toLowerCase()] ?? clean;
};

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

// Absolute / static / upload URLs are preserved; relative DB paths resolve under itemPath (/uploads)
const photoUrl = resolveMediaUrl;

/* ---------------- cache layer ---------------- */
const CACHE_KEY = "gallery:photos:v3";
const CACHE_TTL = 10 * 60 * 1000;

let memoryCache = null;
let inflight = null;

function readCache() {
  try {
    localStorage.removeItem("photogallery:data:v1");
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      memoryCache = null;
      return null;
    }
    if (memoryCache) return memoryCache;
    const parsed = JSON.parse(raw);
    const hasBrokenPrefix =
      Array.isArray(parsed?.photos) &&
      parsed.photos.some(
        (p) => typeof p?.src === "string" && p.src.startsWith("/gallery/"),
      );
    if (hasBrokenPrefix) {
      localStorage.removeItem(CACHE_KEY);
      memoryCache = null;
      return null;
    }
    memoryCache = parsed;
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

function clearGalleryCache() {
  memoryCache = null;
  inflight = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchGalleryData() {
  const cached = readCache();
  if (cached && Date.now() - cached.savedAt < CACHE_TTL) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    const [catRes, galRes] = await Promise.all([
      categoryAPI.getAll({ status: true }),
      galleryAPI.getAll({ status: true }),
    ]);

    const categories = toList(catRes).filter((c) => c.status === true);
    const activeIds = new Set(categories.map((c) => String(c._id)));

    const photos = toList(galRes)
      .filter((g) => g.status === true)
      .filter((g) => activeIds.has(String(getCategoryId(g))))
      .map((g) => ({
        id: g._id,
        title: g.title || "Architectural Detail",
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
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.PhotoGallery;


  const cached = null; // Keep the first client render identical to the server.

  const [categories, setCategories] = useState(cached?.categories ?? []);
  const [photos, setPhotos] = useState(cached?.photos ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [photoLightbox, setPhotoLightbox] = useState(null);
  const touchStartXRef = useRef(null);
  const lightboxRef = useRef(null);
  useDialogFocus(photoLightbox !== null, lightboxRef);

  const startFetch = useCallback((c) => {
    let cancelled = false;
    fetchGalleryData()
      .then((data) => {
        if (cancelled) return;
        setCategories(data.categories);
        setPhotos(data.photos);
        setError("");
      })
      .catch((err) => {
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

  useEffect(() => {
    const c = readCache();
    let cancel = startFetch(c);

    const handleSync = () => {
      clearGalleryCache();
      cancel?.();
      cancel = startFetch(null);
    };
    const unsubscribe = subscribeCacheInvalidation((scope) => {
      if (scope === "gallery" || scope === "projects") handleSync();
    });
    window.addEventListener("projects-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      cancel?.();
      unsubscribe();
      window.removeEventListener("projects-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [startFetch]);

  const categoryLabel = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[String(c._id)] = formatCategoryLabel(c.categoryName);
    });
    return map;
  }, [categories]);

  const filters = useMemo(
    () => [
      { id: "all", label: "All" },
      ...categories.map((c) => ({
        id: String(c._id),
        label: formatCategoryLabel(c.categoryName),
      })),
    ],
    [categories],
  );

  const filteredPhotoIdx = useMemo(
    () =>
      photos
        .map((_, i) => i)
        .filter((i) => filter === "all" || photos[i].categoryId === filter),
    [filter, photos],
  );

  const spatialItems = useMemo(
    () =>
      filteredPhotoIdx.map((idx) => {
        const p = photos[idx];
        return {
          id: String(p.id),
          title: formatPhotoTitle(p.title),
          category: categoryLabel[p.categoryId] || "Gallery",
          src: p.src || MEDIA_UNAVAILABLE_IMAGE,
          fallbackSrc: MEDIA_UNAVAILABLE_IMAGE,
          index: idx,
        };
      }),
    [filteredPhotoIdx, photos, categoryLabel],
  );

  const stepPhoto = useCallback(
    (dir) => {
      if (photoLightbox === null || filteredPhotoIdx.length < 2) return;
      const pos = filteredPhotoIdx.indexOf(photoLightbox);
      const currentPos = pos === -1 ? 0 : pos;
      const next =
        (currentPos + dir + filteredPhotoIdx.length) % filteredPhotoIdx.length;
      setPhotoLightbox(filteredPhotoIdx[next]);
    },
    [filteredPhotoIdx, photoLightbox],
  );

  // Preload adjacent lightbox images for instant previous/next stepping
  useEffect(() => {
    if (photoLightbox === null || filteredPhotoIdx.length < 2) return;
    const pos = Math.max(0, filteredPhotoIdx.indexOf(photoLightbox));
    const prevIdx =
      filteredPhotoIdx[
        (pos - 1 + filteredPhotoIdx.length) % filteredPhotoIdx.length
      ];
    const nextIdx = filteredPhotoIdx[(pos + 1) % filteredPhotoIdx.length];
    [prevIdx, nextIdx].forEach((i) => {
      const src = photos[i]?.src;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [photoLightbox, filteredPhotoIdx, photos]);

  useEffect(() => {
    if (photoLightbox === null) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop?.();

    const onKeyDown = (e) => {
      if (e.key === "Escape") setPhotoLightbox(null);
      else if (e.key === "ArrowLeft") stepPhoto(-1);
      else if (e.key === "ArrowRight") stepPhoto(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start?.();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [photoLightbox, stepPhoto]);

  const scrollToFooter = useCallback(() => {
    const footer = document.getElementById("footer");
    if (!footer) return;
    if (window.__lenis && typeof window.__lenis.scrollTo === "function") {
      window.__lenis.scrollTo(footer, { duration: 1.1 });
    } else {
      footer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const activeLightboxPhoto =
    photoLightbox !== null ? photos[photoLightbox] : null;
  const activeLightboxTitle = activeLightboxPhoto
    ? formatPhotoTitle(activeLightboxPhoto.title)
    : "";
  const activeLightboxCategory = activeLightboxPhoto
    ? categoryLabel[activeLightboxPhoto.categoryId] || "Gallery"
    : "";
  const hasMultipleLightboxPhotos = filteredPhotoIdx.length > 1;
  const activeLightboxPos =
    photoLightbox !== null
      ? Math.max(0, filteredPhotoIdx.indexOf(photoLightbox))
      : 0;

  return (
    <div className="photo-gallery-page w-full bg-[var(--bg)] text-[var(--ink)]">
      <div className="gallery-toolbar wrap">
        <div>
          <span className="eyebrow">{pageCopy["spaces_details"]}</span>
          <h1 className="no-split">{pageCopy["photo_gallery"]}</h1>
        </div>
        <div className="works-view-switcher" aria-label="Gallery view">
          <button type="button" className={`works-switch-btn ${viewMode === 'grid' ? 'active' : ''}`} aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>{pageCopy["grid"]}</button>
          <button type="button" className={`works-switch-btn ${viewMode === 'spatial' ? 'active' : ''}`} aria-pressed={viewMode === 'spatial'} onClick={() => setViewMode('spatial')}>{pageCopy["3d_gallery"]}</button>
        </div>
      </div>
      {viewMode === 'grid' ? (
        <section className="gallery-grid-section wrap" aria-label="Project photographs">
          <div className="gallery-filter-row">
            <label className="gallery-category-label">{pageCopy["category"]}<select value={filter} onChange={(event) => setFilter(event.target.value)}>
                {filters.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </label>
            <span role="status">{spatialItems.length}{pageCopy["photos"]}</span>
          </div>
          {loading ? <p role="status">{pageCopy["loading_photographs"]}</p> : error ? <p role="alert">{error}</p> : spatialItems.length === 0 ? <p>{pageCopy["no_photos_in_this_category"]}</p> : (
            <div className="gallery-photo-grid">
              {spatialItems.map((item) => (
                <button key={item.id} type="button" className="gallery-photo-card" aria-label={`Open ${item.title}`} onClick={() => setPhotoLightbox(item.index)}>
                  <img src={item.src} alt={item.title} loading="lazy" onError={mediaFallback} />
                  <span className="gallery-photo-caption"><strong>{item.title}</strong><span>{item.category}</span></span>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
      <SpatialGallery3D
        items={spatialItems}
        filters={filters}
        activeFilter={filter}
        onFilterChange={setFilter}
        loading={loading}
        error={error}
        onSelectItem={(item) => setPhotoLightbox(item.index)}
        isLightboxOpen={photoLightbox !== null}
        onScrollToFooter={scrollToFooter}
      />
      )}

      {/* BORDERLESS ARCHITECTURAL LIMESTONE PHOTO VIEWER */}
      {activeLightboxPhoto && (
        <div
          ref={lightboxRef}
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={activeLightboxTitle}
          onClick={() => setPhotoLightbox(null)}
          className="fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden bg-[var(--bg)]/96 px-5 py-6 text-[var(--ink)] backdrop-blur-xl sm:px-10 sm:py-8"
        >
          {/* Warm Gallery Ceiling Spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-1/3 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,253,248,0.92),transparent_64%)] blur-[44px]"
          />

          {/* Top Editorial Title & Frameless Close Control */}
          <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-start justify-between gap-6">
            <div
              onClick={(e) => e.stopPropagation()}
              className="min-w-0 max-w-[74vw] cursor-default sm:max-w-2xl"
            >
              <div className="mb-1 text-[12px] font-medium tracking-[0.16em] text-[var(--accent)] uppercase">
                {activeLightboxCategory}
              </div>
              <h2 className="no-split truncate font-serif text-2xl font-normal tracking-[-0.02em] text-[var(--ink)] sm:text-3xl">
                {activeLightboxTitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPhotoLightbox(null);
              }}
              aria-label="Close lightbox"
              className="group inline-flex shrink-0 items-center gap-1.5 min-h-11 py-1 text-[12px] font-medium tracking-[0.14em] text-[var(--ink)]/65 uppercase transition hover:text-[var(--ink)] sm:text-[12px]"
            >
              <span>{pageCopy["close"]}</span>
              <X className="h-4 w-4 text-[var(--accent)] transition-transform duration-200 group-hover:rotate-90" />
            </button>
          </div>

          {/* Intrinsic Print Viewing Stage - Click Open Margin Around Artwork to Close */}
          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 items-center justify-center py-4 sm:py-6">
            {hasMultipleLightboxPhotos && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stepPhoto(-1);
                }}
                aria-label="Previous photo"
                className="hidden h-12 w-12 items-center justify-center text-[var(--ink)]/50 transition hover:text-[var(--ink)] active:scale-90 md:absolute md:left-0 md:top-1/2 md:flex md:-translate-y-1/2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              onTouchStart={(e) => {
                if (!hasMultipleLightboxPhotos) return;
                touchStartXRef.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                if (!hasMultipleLightboxPhotos || touchStartXRef.current === null) {
                  return;
                }
                const dx =
                  (e.changedTouches[0]?.clientX ?? touchStartXRef.current) -
                  touchStartXRef.current;
                touchStartXRef.current = null;
                if (Math.abs(dx) > 45) {
                  stepPhoto(dx < 0 ? 1 : -1);
                }
              }}
              className="relative inline-flex max-h-full max-w-[90vw] items-center justify-center md:max-w-[76vw]"
            >
              <img
                key={photoLightbox}
                onClick={(e) => e.stopPropagation()}
                src={activeLightboxPhoto.src || MEDIA_UNAVAILABLE_IMAGE}
                alt={activeLightboxTitle}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = MEDIA_UNAVAILABLE_IMAGE;
                }}
                className="block h-auto max-h-[64vh] w-auto max-w-full bg-[#eae6de] object-contain shadow-[0_28px_80px_rgba(23,22,19,0.13)] sm:max-h-[70vh]"
              />
            </div>

            {hasMultipleLightboxPhotos && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stepPhoto(1);
                }}
                aria-label="Next photo"
                className="hidden h-12 w-12 items-center justify-center text-[var(--ink)]/50 transition hover:text-[var(--ink)] active:scale-90 md:absolute md:right-0 md:top-1/2 md:flex md:-translate-y-1/2"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Bottom Whisper Index & Navigation */}
          <div className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-center sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <span className="hidden text-left text-[12px] font-medium tracking-[0.12em] text-[var(--ink)]/45 uppercase sm:block">
              {hasMultipleLightboxPhotos ? "← → navigate · Esc close" : "Esc to close"}
            </span>

            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-4"
            >
              {hasMultipleLightboxPhotos && (
                <button
                  type="button"
                  onClick={() => stepPhoto(-1)}
                  aria-label="Previous photo (bottom control)"
                  className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/65 transition hover:text-[var(--ink)] active:scale-90 md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              <span className="text-[12px] font-medium tracking-[0.18em] text-[var(--accent)] tabular-nums uppercase">
                {String(activeLightboxPos + 1).padStart(2, "0")} /{" "}
                {String(filteredPhotoIdx.length).padStart(2, "0")}
              </span>

              {hasMultipleLightboxPhotos && (
                <button
                  type="button"
                  onClick={() => stepPhoto(1)}
                  aria-label="Next photo (bottom control)"
                  className="flex h-11 w-11 items-center justify-center text-[var(--ink)]/65 transition hover:text-[var(--ink)] active:scale-90 md:hidden"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <span className="hidden text-right text-[12px] font-medium tracking-[0.12em] text-[var(--ink)]/45 uppercase sm:block">{pageCopy["click_outside_to_close"]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

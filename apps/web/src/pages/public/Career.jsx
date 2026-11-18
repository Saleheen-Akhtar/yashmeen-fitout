import { mediaFallback } from "../../lib/media";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import "../../styles/career.css";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiMapPin,
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiClock,
  FiX,
  FiMail,
} from "react-icons/fi";
import { vacancyAPI } from "../../services/api";
import { subscribeCacheInvalidation } from "../../lib/publicCache";
import Loading from "../../components/ui/Loading";


// Where candidates send their CV

/* ---------------- helpers: map whatever the API returns ---------------- */

// Returns the array from `{ data: [...] }`, `{ data: { data: [...] } }`, `{ data: { vacancies: [...] } }` ...
// Returns null when no array is found (so a bad response is never mistaken for "no openings")
const LIST_KEYS = ["data", "items", "results", "docs", "rows", "records", "vacancies", "vacancy"];
const toList = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return null;
  for (const k of LIST_KEYS) {
    const v = body[k];
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k2 of LIST_KEYS) if (Array.isArray(v[k2])) return v[k2];
    }
  }
  return null;
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Show a vacancy only while it is open and its end date (inclusive) has not passed
const isActive = (v) => {
  if (v?.status && v.status !== "open") return false;
  if (!v?.endDate) return true;
  const end = new Date(v.endDate);
  if (Number.isNaN(end.getTime())) return true;
  end.setHours(23, 59, 59, 999);
  return end.getTime() >= Date.now();
};

/* ---------------- cache layer ----------------
   Goal: vacancyAPI.opens runs ONLY when the data has changed on the server.

   1. The vacancy list is cached (memory + localStorage) together with the
      server "data version" it was fetched with.
   2. Opening the page again shows the cached list instantly (no spinner).
   3. A tiny version request (vacancyAPI.getVersion) asks the server whether
      anything changed. Same version -> keep the cache, skip opens.
      Different version -> fetch the list again and update the cache.
   4. The version request is throttled (VERSION_CHECK_INTERVAL).
   5. If the version endpoint is missing or fails, a timer (CACHE_TTL) is used.
   6. Only the raw list is cached. "Open" and "end date" are checked every
      time the page renders, so an expired vacancy disappears on its own
      without any API call.
   7. A failed or unexpected response is never cached.
----------------------------------------------- */
const CACHE_KEY = "career:vacancies:v1";
const CACHE_TTL = 10 * 60 * 1000; // fallback only: used when no version endpoint works
const VERSION_CHECK_INTERVAL = 60 * 1000; // ask the server at most once per minute

let memoryCache = null; // survives route changes (no re-read from storage)
let inflight = null; // de-dupes simultaneous requests
let lastVersionCheck = 0; // time of the last version request

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      memoryCache = null;
      lastVersionCheck = 0;
      return null;
    }
    if (memoryCache) return memoryCache;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.vacancies)) memoryCache = parsed;
  } catch {
    /* ignore */
  }
  return memoryCache;
}

function writeCache(vacancies, version) {
  memoryCache = { vacancies, version, savedAt: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    /* ignore (storage full / disabled) */
  }
}

function clearVacancyCache() {
  memoryCache = null;
  inflight = null;
  lastVersionCheck = 0;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

// Returns the server data version, or undefined if it cannot be read
async function fetchServerVersion() {
  if (typeof vacancyAPI.getVersion !== "function") return undefined;
  try {
    const res = await vacancyAPI.getVersion();
    const v = res?.data?.version ?? res?.data?.data?.version;
    return v === undefined || v === null ? undefined : String(v);
  } catch (err) {
    console.warn("Vacancy version check failed, using timer cache:", err);
    return undefined;
  }
}

function fetchVacancies(version) {
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await vacancyAPI.opens();
    const list = toList(res);
    if (!list) throw new Error("Unexpected response from the vacancy API.");
    writeCache(list, version); // an empty list is valid ("no openings") and is cached too
    return list;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

async function resolveVacanciesData(force = false) {
  const c = force ? null : readCache();
  const hasData = !!c;
  try {
    if (!force && hasData && Date.now() - lastVersionCheck < VERSION_CHECK_INTERVAL) {
      return { list: c.vacancies, hasData };
    }

    const serverVersion = await fetchServerVersion();
    lastVersionCheck = Date.now();

    if (!force && hasData) {
      const versionKnown = serverVersion !== undefined;
      const upToDate = versionKnown
        ? c.version === serverVersion
        : Date.now() - c.savedAt < CACHE_TTL;
      if (upToDate) return { list: c.vacancies, hasData };
    }

    const list = await fetchVacancies(serverVersion);
    return { skipped: false, list, hasData };
  } catch (err) {
    err.hasData = hasData;
    throw err;
  }
}

export default function Career() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.Career;

  const cached = null; // Match the server; adopt persisted data after hydration.

  const [vacancies, setVacancies] = useState(cached?.vacancies ?? []);
  const [pageLoading, setPageLoading] = useState(!cached); // no spinner if cache exists
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [applyId, setApplyId] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const startFetch = useCallback((force = false) => {
    let cancelled = false;
    resolveVacanciesData(force)
      .then((res) => {
        if (cancelled) return;
        setVacancies(res.list);
        setError("");
      })
      .catch((err) => {
        console.error("Vacancy load failed:", err);
        if (!cancelled && !err?.hasData) {
          setError(
            err?.response?.data?.message || "Could not load current openings.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- load vacancies (cache first, API only if data changed) ---------- */
  useEffect(() => {
    let cancel = startFetch(false);

    const handleSync = () => {
      clearVacancyCache();
      cancel?.();
      cancel = startFetch(true);
    };
    const unsubscribe = subscribeCacheInvalidation((scope) => {
      if (scope === "vacancies") handleSync();
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

  // Open vacancies only, newest first (re-checked on every render, so expired ones drop off)
  const vacancyData = useMemo(
    () =>
      vacancies
        .filter(isActive)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [vacancies],
  );

  const handleToggle = (jobId) => {
    setSelectedJob((prev) => (prev === jobId ? null : jobId));
  };

  const handleApply = (job) => {
    setApplyId(job);
    setIsApplyOpen(true);
  };

  const closeApply = () => setIsApplyOpen(false);

  // Close the "How to Apply" modal with Escape and lock page scroll while it is open
  useEffect(() => {
    if (!isApplyOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsApplyOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isApplyOpen]);

  const applyRole = applyId?.positionName || "[Role Title]";
  const applySubject = `Application for ${applyRole} - [Your Name]`;
  const applyMailto = `mailto:${content.email}?subject=${encodeURIComponent(applySubject)}`;

  return (
    <div className="careerpg-page">


      {/* HERO BAND */}
      <section
        className="careerpg-hero-section"
        style={{ backgroundImage: `url(${pageCopy.heroImage})` }}
      >
        <div className="careerpg-hero-dark-overlay" />
        <div className="careerpg-hero-inner-container">
          <h1 className="careerpg-hero-heading">{pageCopy.shape_your_career}</h1>
        </div>
      </section>

      {/* CURRENT OPENINGS */}
      <section className="careerpg-openings-section">
        <div className="careerpg-wrap">
          <div className="careerpg-eyebrow">
            <span className="careerpg-eyebrow-bar" />{pageCopy.careers}</div>
          <h2 className="careerpg-openings-heading">{pageCopy.current_openings}</h2>
          {vacancyData.length > 0 && (
            <p className="careerpg-openings-count">
              {vacancyData.length}{pageCopy.open}{" "}
              {vacancyData.length === 1 ? "position" : "positions"}
            </p>
          )}

          {pageLoading ? <Loading /> : error && vacancyData.length === 0 ? (
            <div className="careerpg-empty-box">
              <h3 className="careerpg-empty-title">{pageCopy.something_went_wrong}</h3>
              <p className="careerpg-empty-copy careerpg-error-copy">{error}</p>
            </div>
          ) : vacancyData.length === 0 ? (
            <div className="careerpg-empty-box">
              <img onError={mediaFallback}
                className="careerpg-empty-image"
                src={pageCopy.image}
                alt={pageCopy.image_description}
              />
              <h3 className="careerpg-empty-title">{pageCopy.no_current_openings_that_suit}</h3>
              <p className="careerpg-empty-copy">{pageCopy.stay_ahead_create_a_job}</p>
            </div>
          ) : (
            <div className="careerpg-job-list">
              {vacancyData.map((job) => {
                const isOpen = selectedJob === job?._id;
                const posted = formatDate(job.createdAt);
                const closing = formatDate(job.endDate);
                return (
                  <div className="careerpg-job-card" key={job?._id}>
                    <div className="careerpg-job-top">
                      <h3 className="careerpg-job-title">
                        {job.positionName}
                      </h3>
                      {posted && (
                        <span className="careerpg-job-date">
                          <FiCalendar size={12} />
                          {posted}
                        </span>
                      )}
                    </div>

                    <ul className="careerpg-job-meta">
                      <li className="careerpg-job-meta-item">
                        <FiUsers size={15} />
                        <span>
                          <strong>{pageCopy.positions}</strong> {job.numberOfPositions}
                        </span>
                      </li>
                      <li className="careerpg-job-meta-item">
                        <FiBriefcase size={15} />
                        <span>
                          <strong>{pageCopy.experience}</strong> {job.experience}{pageCopy.years}</span>
                      </li>
                      <li className="careerpg-job-meta-item">
                        <FiMapPin size={15} />
                        <span>
                          <strong>{pageCopy.location}</strong> {job.location}
                        </span>
                      </li>
                      {closing && (
                        <li className="careerpg-job-meta-item">
                          <FiClock size={15} />
                          <span>
                            <strong>{pageCopy.apply_by}</strong> {closing}
                          </span>
                        </li>
                      )}
                    </ul>

                    {isOpen && (
                      <div className="careerpg-job-about">
                        <p className="careerpg-job-about-title">{pageCopy.about_position}</p>
                        <p className="careerpg-job-about-copy">
                          {job.aboutPosition}
                        </p>
                      </div>
                    )}

                    <div className="careerpg-job-actions">
                      <button
                        type="button"
                        className="careerpg-apply-btn"
                        onClick={() => handleApply(job)}
                      >{pageCopy.apply}</button>
                      <button
                        type="button"
                        className="careerpg-details-btn"
                        aria-expanded={isOpen}
                        onClick={() => handleToggle(job?._id)}
                      >
                        {isOpen ? "Hide Details" : "Show Details"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* HOW TO APPLY MODAL */}
      {isApplyOpen && (
        <div className="careerpg-modal-overlay" onClick={closeApply}>
          <div
            className="careerpg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="careerpg-apply-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="careerpg-modal-close"
              onClick={closeApply}
              aria-label="Close"
              autoFocus
            >
              <FiX size={20} />
            </button>

            <h3 className="careerpg-modal-title" id="careerpg-apply-title">{pageCopy.how_to_apply}</h3>
            {applyId?.positionName && (
              <p className="careerpg-modal-role">{applyId.positionName}</p>
            )}

            <p className="careerpg-modal-copy">{pageCopy.interested_candidates_are_invited_to}{" "}
              <a href={applyMailto}>{content.email}</a>.
            </p>

            <p className="careerpg-modal-copy">{pageCopy.please_use_the_following_subject}</p>
            <p className="careerpg-modal-subject">{applySubject}</p>

            <p className="careerpg-modal-copy">{pageCopy.only_shortlisted_candidates_will_be}</p>

            <div className="careerpg-modal-actions">
              <a className="careerpg-mail-btn" href={applyMailto}>
                <FiMail size={16} />{pageCopy.email_your_cv}</a>
              <button
                type="button"
                className="careerpg-details-btn"
                onClick={closeApply}
              >{pageCopy.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

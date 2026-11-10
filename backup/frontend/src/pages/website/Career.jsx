import React, { useState, useEffect, useMemo } from "react";
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
import Loading from "../../components/Loading";

// Replace with your own fit-out / interior image (best: a local asset)
// e.g. import heroBg from "../../assets/career-hero.jpg";
const CAREER_HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

// Where candidates send their CV
const APPLY_EMAIL = "info@yfbfitoutcontracting.com";

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
   Goal: vacancyAPI.getAll runs ONLY when the data has changed on the server.

   1. The vacancy list is cached (memory + localStorage) together with the
      server "data version" it was fetched with.
   2. Opening the page again shows the cached list instantly (no spinner).
   3. A tiny version request (vacancyAPI.getVersion) asks the server whether
      anything changed. Same version -> keep the cache, skip getAll.
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
  if (memoryCache) return memoryCache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.vacancies)) memoryCache = parsed;
    }
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

// Call from your admin panel after add / edit / delete (same browser only)
export function clearVacancyCache() {
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
    const res = await vacancyAPI.getAll();
    const list = toList(res);
    if (!list) throw new Error("Unexpected response from the vacancy API.");
    writeCache(list, version); // an empty list is valid ("no openings") and is cached too
    return list;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export default function Career() {
  const cached = readCache();

  const [vacancies, setVacancies] = useState(cached?.vacancies ?? []);
  const [pageLoading, setPageLoading] = useState(!cached); // no spinner if cache exists
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [applyId, setApplyId] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  /* ---------- load vacancies (cache first, API only if data changed) ---------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const c = readCache();
      const hasData = !!c;
      try {
        // Checked recently -> trust the cache, send no request at all
        if (hasData && Date.now() - lastVersionCheck < VERSION_CHECK_INTERVAL) return;

        // Tiny request: has the data changed on the server?
        const serverVersion = await fetchServerVersion();
        lastVersionCheck = Date.now();

        if (hasData) {
          const versionKnown = serverVersion !== undefined;
          const upToDate = versionKnown
            ? c.version === serverVersion
            : Date.now() - c.savedAt < CACHE_TTL;
          if (upToDate) return; // nothing changed -> skip getAll
        }

        // First visit, or data changed -> fetch fresh data and cache it
        const list = await fetchVacancies(serverVersion);
        if (cancelled) return;
        setVacancies(list);
        setError("");
      } catch (err) {
        console.error("Vacancy load failed:", err);
        // if cached data is already on screen, fail silently
        if (!cancelled && !c) {
          setError(
            err?.response?.data?.message || "Could not load current openings.",
          );
        }
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
  const applyMailto = `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(applySubject)}`;

  if (pageLoading) return <Loading />;

  return (
    <div className="careerpg-page">
      <style>{`

        .careerpg-page{
          --careerpg-ink:#1b1a17;
          --careerpg-black:#fbfaf7;
          --careerpg-gray-50:#f4f1ea;
          --careerpg-gray-100:rgba(27,26,23,0.04);
          --careerpg-gray-200:#e6e1d6;
          --careerpg-gray-500:#6b665c;
          --careerpg-brass:#8a6a28;
          --careerpg-brass-deep:#6f541d;
          --careerpg-font:var(--font-sans);
          --careerpg-max-w:1180px;

          min-height:100vh;
          width:100%;
          background:var(--careerpg-black);
          color:var(--careerpg-ink);
          font-family:var(--careerpg-font);
        }
        .careerpg-page *{ box-sizing:border-box; }
        .careerpg-page button{ font-family:inherit; cursor:pointer; border:none; }

        /* HERO */
        .careerpg-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:var(--careerpg-black);
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){
          .careerpg-hero-section{ padding:120px 0; }
        }
        .careerpg-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(
            to bottom,
            rgba(10,10,10,0.72),
            rgba(10,10,10,0.60)
          );
        }
        .careerpg-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:var(--careerpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .careerpg-hero-inner-container{ padding:0 40px; }
        }
        .careerpg-hero-heading{
          margin:0;
          text-align:center;
          font-family:var(--careerpg-font);
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .careerpg-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .careerpg-hero-heading{ font-size:56px; } }

        /* OPENINGS */
        .careerpg-openings-section{ padding:64px 0 88px; }
        .careerpg-wrap{
          max-width:var(--careerpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .careerpg-wrap{ padding:0 40px; }
        }

        .careerpg-eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--careerpg-brass-deep);
        }
        .careerpg-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--careerpg-brass);
          border-radius:1px;
        }
        .careerpg-openings-heading{
          margin:16px 0 0;
          font-weight:600;
          font-size:30px;
          line-height:1.3;
          color:var(--careerpg-ink);
        }
        @media (min-width:640px){ .careerpg-openings-heading{ font-size:36px; } }
        .careerpg-openings-count{
          margin:8px 0 0;
          font-size:14.5px;
          color:var(--careerpg-gray-500);
        }

        .careerpg-job-list{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
          margin-top:36px;
          align-items:start;
        }

        .careerpg-job-card{
          background:#FFFFFF;
          border:1px solid var(--careerpg-gray-200);
          border-radius:8px;
          padding:28px 26px;
          transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        .careerpg-job-card:hover{
          border-color:rgba(169,121,63,0.55);
          box-shadow:0 14px 30px -18px rgba(0,0,0,0.25);
          transform:translateY(-2px);
        }
        .careerpg-job-top{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:16px;
        }
        .careerpg-job-title{
          margin:0;
          font-weight:700;
          font-size:19px;
          line-height:1.35;
          color:var(--careerpg-ink);
        }
        .careerpg-job-date{
          flex-shrink:0;
          display:inline-flex;
          align-items:center;
          gap:6px;
          background:var(--careerpg-gray-100);
          color:var(--careerpg-gray-500);
          font-size:12px;
          font-weight:600;
          padding:6px 10px;
          border-radius:100px;
          white-space:nowrap;
        }

        .careerpg-job-meta{
          display:flex;
          flex-wrap:wrap;
          gap:10px 22px;
          margin-top:18px;
          padding:0;
          list-style:none;
        }
        .careerpg-job-meta-item{
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-size:14px;
          color:var(--careerpg-gray-500);
        }
        .careerpg-job-meta-item svg{ color:var(--careerpg-brass-deep); flex-shrink:0; }
        .careerpg-job-meta-item strong{ color:var(--careerpg-ink); font-weight:600; }

        .careerpg-job-about{
          margin-top:18px;
          padding-top:18px;
          border-top:1px solid var(--careerpg-gray-200);
        }
        .careerpg-job-about-title{
          margin:0 0 8px;
          font-size:14px;
          font-weight:700;
          color:var(--careerpg-ink);
        }
        .careerpg-job-about-copy{
          margin:0;
          font-size:14px;
          line-height:1.7;
          color:var(--careerpg-gray-500);
          white-space:pre-line;
        }

        .careerpg-job-actions{
          display:flex;
          align-items:center;
          gap:12px;
          margin-top:22px;
        }
        .careerpg-details-btn{
          background:transparent;
          color:var(--careerpg-ink);
          border:1px solid var(--careerpg-gray-200) !important;
          border-radius:6px;
          padding:12px 20px;
          font-size:13.5px;
          font-weight:600;
          transition:border-color .15s ease, color .15s ease;
        }
        .careerpg-details-btn:hover{
          border-color:var(--careerpg-brass) !important;
          color:var(--careerpg-brass-deep);
        }
        .careerpg-apply-btn{
          background:var(--careerpg-black);
          color:var(--careerpg-ink);
          border-radius:6px;
          padding:13px 26px;
          font-size:13.5px;
          font-weight:700;
          transition:background-color .15s ease;
        }
        .careerpg-apply-btn:hover{ background:var(--careerpg-brass); }

        /* EMPTY / ERROR STATE */
        .careerpg-empty-box{
          margin-top:36px;
          text-align:center;
          background:var(--careerpg-gray-50);
          border-radius:10px;
          padding:56px 24px;
        }
        .careerpg-empty-image{
          width:140px;
          max-width:50%;
          margin:0 auto 20px;
          display:block;
        }
        .careerpg-empty-title{
          margin:0;
          font-size:20px;
          font-weight:700;
        }
        .careerpg-empty-copy{
          margin:10px auto 0;
          max-width:460px;
          font-size:14.5px;
          line-height:1.7;
          color:var(--careerpg-gray-500);
        }
        .careerpg-error-copy{ color:#DC2626; }

        /* HOW TO APPLY MODAL */
        .careerpg-modal-overlay{
          position:fixed;
          inset:0;
          z-index:99999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          background:rgba(10,10,10,0.6);
        }
        .careerpg-modal{
          position:relative;
          width:100%;
          max-width:520px;
          max-height:92vh;
          overflow-y:auto;
          background:#FFFFFF;
          border-radius:10px;
          padding:32px 28px 28px;
          box-shadow:0 30px 60px -25px rgba(0,0,0,0.5);
        }
        .careerpg-modal-close{
          position:absolute;
          top:14px;
          right:14px;
          width:36px;
          height:36px;
          display:flex;
          align-items:center;
          justify-content:center;
          background:transparent;
          color:var(--careerpg-gray-500);
          border-radius:50%;
          transition:background-color .15s ease, color .15s ease;
        }
        .careerpg-modal-close:hover{
          background:var(--careerpg-gray-100);
          color:var(--careerpg-ink);
        }
        .careerpg-modal-title{
          margin:0 36px 0 0;
          font-size:22px;
          font-weight:700;
          line-height:1.3;
          color:var(--careerpg-ink);
        }
        .careerpg-modal-role{
          margin:6px 0 0;
          font-size:13.5px;
          font-weight:600;
          color:var(--careerpg-brass-deep);
        }
        .careerpg-modal-copy{
          margin:18px 0 0;
          font-size:14.5px;
          line-height:1.7;
          color:var(--careerpg-gray-500);
        }
        .careerpg-modal-copy a{
          color:var(--careerpg-brass-deep);
          font-weight:600;
          word-break:break-all;
        }
        .careerpg-modal-subject{
          margin:10px 0 0;
          padding:12px 14px;
          background:var(--careerpg-gray-50);
          border:1px solid var(--careerpg-gray-200);
          border-radius:6px;
          font-size:14px;
          font-weight:600;
          line-height:1.5;
          color:var(--careerpg-ink);
          word-break:break-word;
        }
        .careerpg-modal-actions{
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          margin-top:24px;
        }
        .careerpg-mail-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:var(--careerpg-black);
          color:var(--careerpg-ink);
          border-radius:6px;
          padding:13px 22px;
          font-size:13.5px;
          font-weight:700;
          text-decoration:none;
          transition:background-color .15s ease;
        }
        .careerpg-mail-btn:hover{ background:var(--careerpg-brass); }
        @media (prefers-reduced-motion: reduce){
          .careerpg-job-card,
          .careerpg-details-btn,
          .careerpg-apply-btn,
          .careerpg-modal-close,
          .careerpg-mail-btn{ transition:none; }
          .careerpg-job-card:hover{ transform:none; }
        }
      `}</style>

      {/* HERO BAND */}
      <section
        className="careerpg-hero-section"
        style={{ backgroundImage: `url(${CAREER_HERO_BG_IMAGE})` }}
      >
        <div className="careerpg-hero-dark-overlay" />
        <div className="careerpg-hero-inner-container">
          <h1 className="careerpg-hero-heading">Shape Your Career</h1>
        </div>
      </section>

      {/* CURRENT OPENINGS */}
      <section className="careerpg-openings-section">
        <div className="careerpg-wrap">
          <div className="careerpg-eyebrow">
            <span className="careerpg-eyebrow-bar" />
            Careers
          </div>
          <h2 className="careerpg-openings-heading">Current Openings</h2>
          {vacancyData.length > 0 && (
            <p className="careerpg-openings-count">
              {vacancyData.length} open{" "}
              {vacancyData.length === 1 ? "position" : "positions"}
            </p>
          )}

          {error && vacancyData.length === 0 ? (
            <div className="careerpg-empty-box">
              <h4 className="careerpg-empty-title">Something went wrong</h4>
              <p className="careerpg-empty-copy careerpg-error-copy">{error}</p>
            </div>
          ) : vacancyData.length === 0 ? (
            <div className="careerpg-empty-box">
              <img
                className="careerpg-empty-image"
                src="/static/no-jobs.svg"
                alt="No Jobs"
              />
              <h4 className="careerpg-empty-title">
                No current openings that suit you?
              </h4>
              <p className="careerpg-empty-copy">
                Stay ahead! Create a job alert and get notified as soon as we
                post relevant roles.
              </p>
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
                          <strong>Positions:</strong> {job.numberOfPositions}
                        </span>
                      </li>
                      <li className="careerpg-job-meta-item">
                        <FiBriefcase size={15} />
                        <span>
                          <strong>Experience:</strong> {job.experience} years
                        </span>
                      </li>
                      <li className="careerpg-job-meta-item">
                        <FiMapPin size={15} />
                        <span>
                          <strong>Location:</strong> {job.location}
                        </span>
                      </li>
                      {closing && (
                        <li className="careerpg-job-meta-item">
                          <FiClock size={15} />
                          <span>
                            <strong>Apply by:</strong> {closing}
                          </span>
                        </li>
                      )}
                    </ul>

                    {isOpen && (
                      <div className="careerpg-job-about">
                        <p className="careerpg-job-about-title">
                          About Position
                        </p>
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
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        className="careerpg-details-btn"
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

            <h3 className="careerpg-modal-title" id="careerpg-apply-title">
              How to Apply
            </h3>
            {applyId?.positionName && (
              <p className="careerpg-modal-role">{applyId.positionName}</p>
            )}

            <p className="careerpg-modal-copy">
              Interested candidates are invited to send their updated CV to{" "}
              <a href={applyMailto}>{APPLY_EMAIL}</a>.
            </p>

            <p className="careerpg-modal-copy">
              Please use the following subject line when applying:
            </p>
            <p className="careerpg-modal-subject">{applySubject}</p>

            <p className="careerpg-modal-copy">
              Only shortlisted candidates will be contacted.
            </p>

            <div className="careerpg-modal-actions">
              <a className="careerpg-mail-btn" href={applyMailto}>
                <FiMail size={16} />
                Email your CV
              </a>
              <button
                type="button"
                className="careerpg-details-btn"
                onClick={closeApply}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
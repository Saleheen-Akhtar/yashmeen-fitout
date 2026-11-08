import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  quoteAPI,
  enquiryAPI,
  projectAPI,
  webDetailsAPI,
  itemPath,
} from "../../services/api";
import { toast } from "sonner";
import {
  FiExternalLink,
  FiSearch,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUpRight,
  FiEye,
  FiClock,
} from "react-icons/fi";

const TABS = [
  { id: "overview", num: "(01)", label: "DISPATCH OVERVIEW" },
  { id: "quotes", num: "(02)", label: "COMMISSIONS" },
  { id: "enquiries", num: "(03)", label: "INQUIRIES" },
  { id: "projects", num: "(04)", label: "PORTFOLIO" },
  { id: "settings", num: "(05)", label: "ATELIER DIRECTORY" },
];

const emptyDetails = {
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United Arab Emirates",
  },
  email: "",
  mobile: "",
  whatsapp: "",
  socialLinks: [],
};

const URL_RE = /^https?:\/\/.+/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const normalizeDetails = (data = {}) => ({
  address: { ...emptyDetails.address, ...(data.address || {}) },
  email: data.email || "",
  mobile: data.mobile || "",
  whatsapp: data.whatsapp || "",
  socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
});

const imageUrl = (path = "") =>
  /^https?:\/\//i.test(path)
    ? path
    : `${itemPath ?? ""}/${String(path).replace(/^\/+/, "")}`;

const formatDate = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Live dynamic data states
  const [quotes, setQuotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [details, setDetails] = useState(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Quote detail inspection modal
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("ALL");

  // Enquiry search
  const [enquirySearch, setEnquirySearch] = useState("");

  // Settings form errors
  const [settingsErrors, setSettingsErrors] = useState({});

  // Fetch all live data on mount
  useEffect(() => {
    let cancelled = false;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [quotesRes, enquiriesRes, projectsRes, detailsRes] =
          await Promise.allSettled([
            quoteAPI.getAll({ limit: 100 }),
            enquiryAPI.getAll(),
            projectAPI.getAll(),
            webDetailsAPI.details(),
          ]);

        if (!cancelled) {
          if (quotesRes.status === "fulfilled" && quotesRes.value?.data) {
            const raw = quotesRes.value.data;
            setQuotes(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
          }
          if (enquiriesRes.status === "fulfilled" && enquiriesRes.value?.data) {
            const raw = enquiriesRes.value.data;
            setEnquiries(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
          }
          if (projectsRes.status === "fulfilled" && projectsRes.value?.data) {
            const raw = projectsRes.value.data;
            setProjects(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
          }
          if (detailsRes.status === "fulfilled" && detailsRes.value?.data?.data) {
            setDetails(normalizeDetails(detailsRes.value.data.data));
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchSearch =
        !quoteSearch.trim() ||
        [q.name, q.email, q.mobile, q.location, q.projectType]
          .filter(Boolean)
          .some((val) =>
            String(val).toLowerCase().includes(quoteSearch.toLowerCase())
          );

      const matchFilter =
        quoteFilter === "ALL" ||
        (q.projectType &&
          q.projectType.toUpperCase().includes(quoteFilter.toUpperCase()));

      return matchSearch && matchFilter;
    });
  }, [quotes, quoteSearch, quoteFilter]);

  // Filtered enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      if (!enquirySearch.trim()) return true;
      return [e.name, e.email, e.mobile, e.services, e.message]
        .filter(Boolean)
        .some((val) =>
          String(val).toLowerCase().includes(enquirySearch.toLowerCase())
        );
    });
  }, [enquiries, enquirySearch]);

  // Delete old quotes handler
  const handleDeleteOldQuotes = async () => {
    if (!window.confirm("Permanently delete quotations older than 1 month?")) return;
    try {
      await quoteAPI.deleteOlderThanMonth();
      toast.success("Old quotations purged successfully.");
      const { data } = await quoteAPI.getAll({ limit: 100 });
      setQuotes(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to delete old quotations.");
    }
  };

  // Delete old enquiries handler
  const handleDeleteOldEnquiries = async () => {
    if (!window.confirm("Permanently delete old inquiries?")) return;
    try {
      await enquiryAPI.deleteOld();
      toast.success("Old inquiries purged successfully.");
      const { data } = await enquiryAPI.getAll();
      setEnquiries(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to delete old inquiries.");
    }
  };

  // Settings form handlers
  const setAddressField = (field) => (e) => {
    const val = e.target.value;
    setDetails((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: val },
    }));
  };

  const setContactField = (field) => (e) => {
    const val = e.target.value;
    setDetails((prev) => ({ ...prev, [field]: val }));
    setSettingsErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setSocialField = (idx, field) => (e) => {
    const val = e.target.value;
    setDetails((prev) => {
      const socialLinks = [...prev.socialLinks];
      socialLinks[idx] = { ...socialLinks[idx], [field]: val };
      return { ...prev, socialLinks };
    });
  };

  const addSocialLink = () => {
    setDetails((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
  };

  const removeSocialLink = (idx) => {
    setDetails((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (details.email && !EMAIL_RE.test(details.email)) {
      nextErrors.email = "Valid email required.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setSettingsErrors(nextErrors);
      return;
    }

    setSavingSettings(true);
    try {
      const payload = {
        address: details.address,
        email: details.email.trim(),
        mobile: details.mobile.trim(),
        whatsapp: details.whatsapp.trim(),
        socialLinks: details.socialLinks.map((s) => ({
          platform: s.platform.trim(),
          url: s.url.trim(),
        })),
      };
      await webDetailsAPI.update(payload);
      toast.success("Atelier directory & public details updated.");
    } catch {
      toast.error("Failed to save atelier details.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="atelier-console-root">
      {/* ====================================================================
          1. BRUTALIST EDITORIAL HERO & MANIFESTO (Exact Website Home Vibe)
          ==================================================================== */}
      <section className="atelier-manifesto-hero">
        <div className="manifesto-left">
          <div className="manifesto-eyebrow">
            <span>(AL QUOZ ATELIER · ARCHITECTURAL CONTROL SYSTEM)</span>
            <div className="manifesto-hairline"></div>
          </div>
          <h1 className="manifesto-display-title">
            ATELIER
            <br />
            DISPATCH & CONTROL
          </h1>
          <p className="manifesto-description">
            From brief to built. Real-time telemetry, spatial portfolio curation, quotation review, client inquiries, and official atelier directory settings.
          </p>
        </div>

        <div className="manifesto-right-proof">
          <div className="proof-box">
            <span className="proof-num">35,000 SQ. FT.</span>
            <span className="proof-label">AL QUOZ ATELIER & JOINERY BAY</span>
            <div className="proof-status-row">
              <span className="proof-dot"></span>
              <span className="proof-status-text">MUNICIPALITY REGISTERED · IN-HOUSE MEP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. LIVE METRIC BENTO GRID (Wired to Real MongoDB Data!)
          ==================================================================== */}
      <section className="atelier-bento-grid">
        {/* Metric 1: Quotes */}
        <div
          className={`bento-card ${activeTab === "quotes" ? "is-active-tile" : ""}`}
          onClick={() => setActiveTab("quotes")}
        >
          <div className="bento-card-top">
            <span className="bento-badge">COMMISSIONS</span>
            <span className="bento-arrow">↗</span>
          </div>
          <div className="bento-metric">{quotes.length}</div>
          <div className="bento-label">QUOTATION BRIEFS LOGGED</div>
          <div className="bento-sub">
            {quotes.length > 0 ? `Latest: ${quotes[0]?.name || "Client"}` : "No pending quotes"}
          </div>
        </div>

        {/* Metric 2: Inquiries */}
        <div
          className={`bento-card ${activeTab === "enquiries" ? "is-active-tile" : ""}`}
          onClick={() => setActiveTab("enquiries")}
        >
          <div className="bento-card-top">
            <span className="bento-badge">INQUIRIES</span>
            <span className="bento-arrow">↗</span>
          </div>
          <div className="bento-metric">{enquiries.length}</div>
          <div className="bento-label">ACTIVE CLIENT INQUIRIES</div>
          <div className="bento-sub">
            {enquiries.length > 0 ? `Latest: ${enquiries[0]?.name || "Client"}` : "All inquiries cleared"}
          </div>
        </div>

        {/* Metric 3: Spatial Projects */}
        <div
          className={`bento-card ${activeTab === "projects" ? "is-active-tile" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          <div className="bento-card-top">
            <span className="bento-badge">PORTFOLIO</span>
            <span className="bento-arrow">↗</span>
          </div>
          <div className="bento-metric">{projects.length}</div>
          <div className="bento-label">SPATIAL WORKS ARCHIVED</div>
          <div className="bento-sub">Bespoke Commercial & Residential</div>
        </div>

        {/* Metric 4: Atelier Status */}
        <div
          className={`bento-card ${activeTab === "settings" ? "is-active-tile" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <div className="bento-card-top">
            <span className="bento-badge">DIRECTORY</span>
            <span className="bento-arrow">↗</span>
          </div>
          <div className="bento-metric" style={{ fontSize: "24px", paddingTop: "6px" }}>
            DUBAI, UAE
          </div>
          <div className="bento-label">PUBLIC PROFILE & CHANNELS</div>
          <div className="bento-sub">{details.email || "Official contact active"}</div>
        </div>
      </section>

      {/* ====================================================================
          3. INTERACTIVE BRUTALIST PILL CONTROLLER (Same as Homepage Bento)
          ==================================================================== */}
      <section className="atelier-tab-controller">
        <div className="controller-track">
          {TABS.map((t) => {
            const count =
              t.id === "quotes"
                ? quotes.length
                : t.id === "enquiries"
                ? enquiries.length
                : t.id === "projects"
                ? projects.length
                : null;
            return (
              <button
                key={t.id}
                type="button"
                className={`controller-pill ${activeTab === t.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span className="pill-num">{t.num}</span>
                <span className="pill-label">{t.label}</span>
                {count !== null && <span className="pill-count">({count})</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          4. TAB MODULES (WIRED UP TO LIVE BACKEND APIS)
          ==================================================================== */}

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeTab === "overview" && (
        <section className="atelier-tab-module">
          <div className="dispatch-overview-grid">
            {/* Left Col: Recent Commission & Inquiries Feed */}
            <div className="dispatch-col">
              <div className="cad-box">
                <div className="cad-box-header">
                  <span className="cad-box-num">(01)</span>
                  <h3 className="cad-box-title">RECENT COMMISSIONS & QUOTES</h3>
                  <button
                    type="button"
                    className="cad-action-link"
                    onClick={() => setActiveTab("quotes")}
                  >
                    VIEW ALL ↗
                  </button>
                </div>

                {quotes.length === 0 ? (
                  <div className="empty-cad-state">No commissions received yet.</div>
                ) : (
                  <div className="briefs-stream">
                    {quotes.slice(0, 3).map((q) => (
                      <div
                        key={q._id}
                        className="brief-card"
                        onClick={() => setSelectedQuote(q)}
                      >
                        <div className="brief-card-header">
                          <span className="brief-client-name">{q.name}</span>
                          <span className="brief-type-badge">
                            {q.projectType || "COMMERCIAL"}
                          </span>
                        </div>
                        <div className="brief-meta-row">
                          <span>{q.location || "Dubai"}</span>
                          <span>·</span>
                          <span>{q.budget || "Budget Unspecified"}</span>
                          <span>·</span>
                          <span style={{ color: "#777777" }}>{formatDate(q.createdAt)}</span>
                        </div>
                        {q.message && (
                          <p className="brief-excerpt">{q.message}</p>
                        )}
                        <div className="brief-inspect-cta">INSPECT BRIEF ↗</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Inquiries */}
              <div className="cad-box" style={{ marginTop: "24px" }}>
                <div className="cad-box-header">
                  <span className="cad-box-num">(02)</span>
                  <h3 className="cad-box-title">RECENT CLIENT INQUIRIES</h3>
                  <button
                    type="button"
                    className="cad-action-link"
                    onClick={() => setActiveTab("enquiries")}
                  >
                    VIEW ALL ↗
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <div className="empty-cad-state">No inquiries in register.</div>
                ) : (
                  <div className="inquiries-stream">
                    {enquiries.slice(0, 3).map((e) => (
                      <div key={e._id} className="inquiry-item">
                        <div className="inquiry-header">
                          <span className="inquiry-name">{e.name}</span>
                          <span className="inquiry-date">{formatDate(e.createdAt)}</span>
                        </div>
                        <div className="inquiry-contacts">
                          {e.email && <span>{e.email}</span>}
                          {e.mobile && <span>· {e.mobile}</span>}
                        </div>
                        <p className="inquiry-msg">{e.message || "Requested interior fit-out consultation."}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Spatial Portfolio & Atelier Direct Info */}
            <div className="dispatch-col">
              <div className="cad-box">
                <div className="cad-box-header">
                  <span className="cad-box-num">(03)</span>
                  <h3 className="cad-box-title">SPATIAL PORTFOLIO PREVIEW</h3>
                  <Link to="/dashboard/project-manager" className="cad-action-link">
                    PORTFOLIO MANAGER ↗
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <div className="empty-cad-state">No spatial projects registered.</div>
                ) : (
                  <div className="portfolio-preview-grid">
                    {projects.slice(0, 4).map((p) => (
                      <div key={p._id} className="portfolio-thumb-card">
                        <div className="portfolio-thumb-img">
                          <img
                            src={imageUrl(p.image)}
                            alt={p.title}
                            onError={(e) => {
                              e.target.src = "/static/hero-aperture.png";
                            }}
                          />
                        </div>
                        <div className="portfolio-thumb-info">
                          <div className="portfolio-thumb-title">{p.title}</div>
                          <div className="portfolio-thumb-loc">
                            {p.location || "Dubai, UAE"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Atelier Details */}
              <div className="cad-box" style={{ marginTop: "24px" }}>
                <div className="cad-box-header">
                  <span className="cad-box-num">(04)</span>
                  <h3 className="cad-box-title">ATELIER DIRECT CONTACT & LOCATION</h3>
                  <button
                    type="button"
                    className="cad-action-link"
                    onClick={() => setActiveTab("settings")}
                  >
                    EDIT DETAILS ↗
                  </button>
                </div>

                <div className="atelier-contact-summary">
                  <div className="contact-summary-row">
                    <span className="contact-summary-label">ADDRESS:</span>
                    <span className="contact-summary-val">
                      {details.address.street}, {details.address.city}, {details.address.country}
                    </span>
                  </div>
                  <div className="contact-summary-row">
                    <span className="contact-summary-label">OFFICIAL EMAIL:</span>
                    <span className="contact-summary-val">{details.email || "info@yfbfitoutcontracting.com"}</span>
                  </div>
                  <div className="contact-summary-row">
                    <span className="contact-summary-label">PHONE:</span>
                    <span className="contact-summary-val">{details.mobile || "+971 54 386 2870"}</span>
                  </div>
                  <div className="contact-summary-row">
                    <span className="contact-summary-label">WHATSAPP:</span>
                    <span className="contact-summary-val">{details.whatsapp || "+971 54 386 2870"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CLIENT COMMISSIONS (QUOTATIONS) */}
      {activeTab === "quotes" && (
        <section className="atelier-tab-module">
          <div className="module-topbar">
            <div className="module-title-group">
              <span className="module-eyebrow">(COMMISSIONS REGISTER · 02)</span>
              <h2 className="module-heading">CLIENT QUOTATION COMMISSIONS</h2>
            </div>
            <div className="module-actions-row">
              <button
                type="button"
                className="btn-brutalist-outline"
                onClick={handleDeleteOldQuotes}
              >
                <FiTrash2 size={13} />
                <span>PURGE OLDER THAN 1 MONTH</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="filter-bar">
            <div className="search-wrap">
              <FiSearch size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search commissions by client, location, or email…"
                value={quoteSearch}
                onChange={(e) => setQuoteSearch(e.target.value)}
                className="cad-search-input"
              />
            </div>

            <div className="filter-pills">
              {["ALL", "COMMERCIAL", "RESIDENTIAL", "VILLA", "OFFICE"].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-pill ${quoteFilter === f ? "is-active" : ""}`}
                  onClick={() => setQuoteFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredQuotes.length === 0 ? (
            <div className="empty-cad-state" style={{ minHeight: "240px" }}>
              No commissions matching search query.
            </div>
          ) : (
            <div className="cad-table-wrap">
              <table className="cad-table">
                <thead>
                  <tr>
                    <th>CLIENT NAME</th>
                    <th>PROJECT TYPE</th>
                    <th>SERVICES REQUIRED</th>
                    <th>LOCATION</th>
                    <th>BUDGET</th>
                    <th>LOGGED DATE</th>
                    <th style={{ textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((q) => (
                    <tr
                      key={q._id}
                      onClick={() => setSelectedQuote(q)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: 700 }}>{q.name}</td>
                      <td>
                        <span className="table-badge">
                          {q.projectType || "Commercial"}
                        </span>
                      </td>
                      <td style={{ maxWidth: "240px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {Array.isArray(q.services) ? q.services.join(", ") : q.services || "-"}
                      </td>
                      <td>{q.location || "Dubai"}</td>
                      <td style={{ fontWeight: 700 }}>{q.budget || "-"}</td>
                      <td style={{ color: "#777777" }}>{formatDate(q.createdAt)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn-inspect-pill"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuote(q);
                          }}
                        >
                          <FiEye size={12} />
                          <span>INSPECT</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: INCOMING INQUIRIES */}
      {activeTab === "enquiries" && (
        <section className="atelier-tab-module">
          <div className="module-topbar">
            <div className="module-title-group">
              <span className="module-eyebrow">(COMMUNICATIONS REGISTER · 03)</span>
              <h2 className="module-heading">CLIENT INQUIRIES & MESSAGES</h2>
            </div>
            <div className="module-actions-row">
              <button
                type="button"
                className="btn-brutalist-outline"
                onClick={handleDeleteOldEnquiries}
              >
                <FiTrash2 size={13} />
                <span>PURGE OLD INQUIRIES</span>
              </button>
            </div>
          </div>

          <div className="search-wrap" style={{ marginBottom: "20px" }}>
            <FiSearch size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search inquiries by client name, email, or message…"
              value={enquirySearch}
              onChange={(e) => setEnquirySearch(e.target.value)}
              className="cad-search-input"
            />
          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="empty-cad-state" style={{ minHeight: "240px" }}>
              No inquiries matching query.
            </div>
          ) : (
            <div className="cad-grid-cards">
              {filteredEnquiries.map((e) => (
                <div key={e._id} className="inquiry-card">
                  <div className="inquiry-card-header">
                    <div>
                      <h4 className="inquiry-card-name">{e.name}</h4>
                      <div className="inquiry-card-meta">
                        {e.email && <a href={`mailto:${e.email}`}>{e.email}</a>}
                        {e.mobile && <span>· <a href={`tel:${e.mobile}`}>{e.mobile}</a></span>}
                      </div>
                    </div>
                    <span className="inquiry-card-date">{formatDate(e.createdAt)}</span>
                  </div>

                  <div className="inquiry-card-service">
                    SERVICE: <strong>{e.services || "General Fit-Out"}</strong>
                  </div>

                  <p className="inquiry-card-msg">
                    "{e.message || "Consultation requested."}"
                  </p>

                  <div className="inquiry-card-actions">
                    <a
                      href={`mailto:${e.email}?subject=Yashmeen Fit-Out Follow-up`}
                      className="btn-inquiry-action"
                    >
                      <FiMail size={12} />
                      <span>REPLY VIA EMAIL</span>
                    </a>
                    {e.mobile && (
                      <a href={`tel:${e.mobile}`} className="btn-inquiry-action">
                        <FiPhone size={12} />
                        <span>CALL</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: SPATIAL PORTFOLIO */}
      {activeTab === "projects" && (
        <section className="atelier-tab-module">
          <div className="module-topbar">
            <div className="module-title-group">
              <span className="module-eyebrow">(SPATIAL WORKS ARCHIVE · 04)</span>
              <h2 className="module-heading">ACTIVE SPATIAL PORTFOLIO ({projects.length})</h2>
            </div>
            <div className="module-actions-row">
              <Link to="/dashboard/project-manager" className="btn-brutalist-solid">
                <FiPlus size={13} />
                <span>OPEN PROJECT MANAGER</span>
              </Link>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="empty-cad-state" style={{ minHeight: "240px" }}>
              No projects recorded in database.
            </div>
          ) : (
            <div className="projects-gallery-grid">
              {projects.map((p) => (
                <div key={p._id} className="project-display-card">
                  <div className="project-display-img">
                    <img
                      src={imageUrl(p.image)}
                      alt={p.title}
                      onError={(e) => {
                        e.target.src = "/static/hero-aperture.png";
                      }}
                    />
                    <span className="project-display-badge">
                      {p.category?.name || "FIT-OUT"}
                    </span>
                  </div>
                  <div className="project-display-body">
                    <h4 className="project-display-title">{p.title}</h4>
                    <div className="project-display-loc">
                      <FiMapPin size={12} />
                      <span>{p.location || "Dubai, UAE"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 5: ATELIER DIRECTORY & LOCATION SETTINGS */}
      {activeTab === "settings" && (
        <section className="atelier-tab-module">
          <div className="module-topbar">
            <div className="module-title-group">
              <span className="module-eyebrow">(PUBLIC IDENTITY & ATELIER · 05)</span>
              <h2 className="module-heading">ATELIER DIRECTORY & CONTACT SETTINGS</h2>
            </div>
          </div>

          <div className="settings-card">
            <form onSubmit={handleSettingsSubmit} className="cad-form">
              {/* Section 01: Physical Address */}
              <div className="form-section">
                <div className="form-section-header">
                  <span className="form-section-num">(01)</span>
                  <h3 className="form-section-title">PHYSICAL LOCATION & ATELIER</h3>
                </div>

                <div className="form-group">
                  <label>Street / Building Details</label>
                  <input
                    type="text"
                    value={details.address.street}
                    onChange={setAddressField("street")}
                    placeholder="Municipality Building 2nd floor, Al Quoz, Dubai"
                    className="cad-input"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>City / Emirate</label>
                    <input
                      type="text"
                      value={details.address.city}
                      onChange={setAddressField("city")}
                      placeholder="Dubai"
                      className="cad-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>State / Region</label>
                    <input
                      type="text"
                      value={details.address.state}
                      onChange={setAddressField("state")}
                      placeholder="Dubai"
                      className="cad-input"
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Postal Code / P.O. Box</label>
                    <input
                      type="text"
                      value={details.address.zipCode}
                      onChange={setAddressField("zipCode")}
                      placeholder="67 Dubai UAE"
                      className="cad-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={details.address.country}
                      onChange={setAddressField("country")}
                      placeholder="United Arab Emirates"
                      className="cad-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section 02: Public Contact Lines */}
              <div className="form-section">
                <div className="form-section-header">
                  <span className="form-section-num">(02)</span>
                  <h3 className="form-section-title">PUBLIC CONTACT LINES</h3>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Public Official Email</label>
                    <input
                      type="email"
                      value={details.email}
                      onChange={setContactField("email")}
                      placeholder="info@yfbfitoutcontracting.com"
                      className="cad-input"
                    />
                    {settingsErrors.email && (
                      <span className="form-error">{settingsErrors.email}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Phone / Mobile</label>
                    <input
                      type="text"
                      value={details.mobile}
                      onChange={setContactField("mobile")}
                      placeholder="+971 54 386 2870"
                      className="cad-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Business</label>
                    <input
                      type="text"
                      value={details.whatsapp}
                      onChange={setContactField("whatsapp")}
                      placeholder="+971 54 386 2870"
                      className="cad-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section 03: Digital Channels */}
              <div className="form-section">
                <div className="form-section-header" style={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="form-section-num">(03)</span>
                    <h3 className="form-section-title">DIGITAL CHANNELS & SOCIALS</h3>
                  </div>
                  <button
                    type="button"
                    className="btn-brutalist-outline"
                    onClick={addSocialLink}
                  >
                    <FiPlus size={12} />
                    <span>ADD CHANNEL</span>
                  </button>
                </div>

                {details.socialLinks.length === 0 ? (
                  <p style={{ color: "#888888", fontStyle: "italic", fontSize: "13px" }}>
                    No channels registered yet.
                  </p>
                ) : (
                  <div className="social-links-list">
                    {details.socialLinks.map((s, i) => (
                      <div key={i} className="social-link-row">
                        <div style={{ flex: "0 0 160px" }}>
                          <input
                            type="text"
                            value={s.platform}
                            onChange={setSocialField(i, "platform")}
                            placeholder="instagram"
                            className="cad-input"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={s.url}
                            onChange={setSocialField(i, "url")}
                            placeholder="https://instagram.com/yashmeenfuture"
                            className="cad-input"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn-remove-row"
                          onClick={() => removeSocialLink(i)}
                          aria-label="Remove channel"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="form-actions-bar">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="btn-brutalist-solid"
                  style={{ padding: "12px 36px" }}
                >
                  {savingSettings ? "UPDATING DIRECTORY…" : "SAVE CHANGES ↗"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ====================================================================
          5. FULL BRIEFING INSPECTION DRAWER / MODAL
          ==================================================================== */}
      {selectedQuote && (
        <div className="modal-backdrop" onClick={() => setSelectedQuote(null)}>
          <div className="modal-cad-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cad-header">
              <div>
                <span className="modal-eyebrow">(COMMISSION SPECIFICATION)</span>
                <h3 className="modal-title">{selectedQuote.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedQuote(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="modal-cad-body">
              <div className="modal-grid-2">
                <div className="modal-meta-item">
                  <span className="modal-meta-label">PROJECT TYPE</span>
                  <span className="modal-meta-val">{selectedQuote.projectType || "Commercial"}</span>
                </div>
                <div className="modal-meta-item">
                  <span className="modal-meta-label">LOCATION</span>
                  <span className="modal-meta-val">{selectedQuote.location || "Dubai"}</span>
                </div>
                <div className="modal-meta-item">
                  <span className="modal-meta-label">BUDGET ESTIMATE</span>
                  <span className="modal-meta-val" style={{ fontWeight: 800 }}>
                    {selectedQuote.budget || "Unspecified"}
                  </span>
                </div>
                <div className="modal-meta-item">
                  <span className="modal-meta-label">TARGET TIMELINE</span>
                  <span className="modal-meta-val">{selectedQuote.timeline || "Immediate"}</span>
                </div>
              </div>

              <div className="modal-meta-item" style={{ marginTop: "16px" }}>
                <span className="modal-meta-label">CLIENT CONTACT DETAILS</span>
                <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
                  {selectedQuote.email && (
                    <a
                      href={`mailto:${selectedQuote.email}`}
                      className="cad-link-pill"
                    >
                      <FiMail size={12} />
                      <span>{selectedQuote.email}</span>
                    </a>
                  )}
                  {selectedQuote.mobile && (
                    <a
                      href={`tel:${selectedQuote.mobile}`}
                      className="cad-link-pill"
                    >
                      <FiPhone size={12} />
                      <span>{selectedQuote.mobile}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="modal-meta-item" style={{ marginTop: "16px" }}>
                <span className="modal-meta-label">SERVICES REQUIRED</span>
                <div className="services-chips-row">
                  {Array.isArray(selectedQuote.services) ? (
                    selectedQuote.services.map((s, idx) => (
                      <span key={idx} className="service-chip">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="service-chip">
                      {selectedQuote.services || "General Interior Fit-Out"}
                    </span>
                  )}
                </div>
              </div>

              <div className="modal-meta-item" style={{ marginTop: "16px" }}>
                <span className="modal-meta-label">CLIENT BRIEF & SPECIFICATIONS</span>
                <div className="modal-message-box">
                  {selectedQuote.message || "No additional text provided in brief."}
                </div>
              </div>

              <div className="modal-meta-item" style={{ marginTop: "16px" }}>
                <span className="modal-meta-label">TIMESTAMP RECORDED</span>
                <div style={{ fontSize: "12px", color: "#666666" }}>
                  {formatDate(selectedQuote.createdAt)} ({new Date(selectedQuote.createdAt).toLocaleTimeString()})
                </div>
              </div>
            </div>

            <div className="modal-cad-footer">
              <button
                type="button"
                className="btn-brutalist-solid"
                onClick={() => setSelectedQuote(null)}
              >
                CLOSE BRIEF SPECIFICATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Styles */}
      <style>{`
        .atelier-console-root {
          width: 100%;
          box-sizing: border-box;
        }

        /* 1. Manifesto Hero */
        .atelier-manifesto-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 32px;
          padding-bottom: 36px;
          border-bottom: 1px solid #000000;
          margin-bottom: 36px;
          flex-wrap: wrap;
        }
        .manifesto-left {
          max-width: 780px;
        }
        .manifesto-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #000000;
          margin-bottom: 12px;
        }
        .manifesto-hairline {
          flex: 1;
          height: 1px;
          background: #000000;
        }
        .manifesto-display-title {
          font-size: clamp(36px, 4.5vw, 64px);
          font-weight: 900;
          line-height: 1.02;
          letter-spacing: -0.03em;
          color: #000000;
          margin: 0 0 16px 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .manifesto-description {
          font-size: 15px;
          line-height: 1.6;
          color: #444444;
          margin: 0;
          max-width: 640px;
        }
        .proof-box {
          border: 1px solid #000000;
          background: #ffffff;
          padding: 24px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 260px;
        }
        .proof-num {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .proof-label {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #666666;
        }
        .proof-status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          padding-top: 8px;
          border-top: 1px solid #e0e0e0;
        }
        .proof-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #000000;
        }
        .proof-status-text {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #000000;
        }

        /* 2. Metric Bento Grid */
        .atelier-bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 36px;
        }
        .bento-card {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .bento-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        .bento-card.is-active-tile {
          background: #000000;
          color: #ffffff;
        }
        .bento-card.is-active-tile .bento-badge,
        .bento-card.is-active-tile .bento-arrow,
        .bento-card.is-active-tile .bento-metric,
        .bento-card.is-active-tile .bento-label,
        .bento-card.is-active-tile .bento-sub {
          color: #ffffff;
        }
        .bento-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .bento-badge {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #666666;
        }
        .bento-arrow {
          font-size: 14px;
          font-weight: 700;
        }
        .bento-metric {
          font-size: 40px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .bento-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin-top: 6px;
        }
        .bento-sub {
          font-size: 12px;
          color: #777777;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* 3. Controller Pills */
        .atelier-tab-controller {
          margin-bottom: 32px;
          border-bottom: 1px solid #000000;
          padding-bottom: 16px;
          overflow-x: auto;
        }
        .controller-track {
          display: flex;
          align-items: center;
          gap: 10px;
          white-space: nowrap;
        }
        .controller-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #000000;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .controller-pill:hover {
          background: #f0f0f0;
        }
        .controller-pill.is-active {
          background: #000000;
          color: #ffffff;
        }
        .controller-pill.is-active .pill-num,
        .controller-pill.is-active .pill-count {
          color: #ffffff;
        }
        .pill-num {
          font-size: 10px;
          color: #777777;
        }
        .pill-count {
          font-weight: 700;
          color: #666666;
        }

        /* 4. Tab Modules Layout */
        .dispatch-overview-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 28px;
        }
        .cad-box {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          padding: 24px;
        }
        .cad-box-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 14px;
          border-bottom: 1px solid #000000;
          margin-bottom: 18px;
        }
        .cad-box-num {
          font-size: 11px;
          font-weight: 800;
          color: #000000;
        }
        .cad-box-title {
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
          flex: 1;
        }
        .cad-action-link {
          background: none;
          border: none;
          font-size: 11px;
          font-weight: 800;
          color: #000000;
          cursor: pointer;
          text-decoration: underline;
          letter-spacing: 0.06em;
        }

        /* Brief Card */
        .briefs-stream {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .brief-card {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .brief-card:hover {
          border-color: #000000;
          background: #fafafa;
        }
        .brief-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .brief-client-name {
          font-size: 14.5px;
          font-weight: 800;
          color: #000000;
        }
        .brief-type-badge {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          border: 1px solid #000000;
          padding: 2px 7px;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .brief-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #444444;
          margin-bottom: 8px;
        }
        .brief-excerpt {
          font-size: 12.5px;
          color: #666666;
          line-height: 1.5;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .brief-inspect-cta {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #000000;
          text-decoration: underline;
        }

        /* Inquiries stream */
        .inquiries-stream {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .inquiry-item {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 14px;
        }
        .inquiry-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .inquiry-name {
          font-size: 13.5px;
          font-weight: 800;
        }
        .inquiry-date {
          font-size: 11px;
          color: #777777;
        }
        .inquiry-contacts {
          font-size: 11.5px;
          color: #666666;
          margin-bottom: 6px;
        }
        .inquiry-msg {
          font-size: 12.5px;
          color: #333333;
          line-height: 1.45;
          margin: 0;
        }

        /* Portfolio Preview Grid */
        .portfolio-preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .portfolio-thumb-card {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }
        .portfolio-thumb-img {
          width: 100%;
          height: 100px;
          background: #eeeeee;
        }
        .portfolio-thumb-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .portfolio-thumb-info {
          padding: 10px;
        }
        .portfolio-thumb-title {
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .portfolio-thumb-loc {
          font-size: 10.5px;
          color: #777777;
          margin-top: 2px;
        }

        /* Atelier Contact Summary */
        .atelier-contact-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .contact-summary-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 12.5px;
        }
        .contact-summary-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #777777;
        }
        .contact-summary-val {
          color: #000000;
          font-weight: 600;
        }

        /* Top bar within module */
        .module-topbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 18px;
          border-bottom: 1px solid #000000;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .module-eyebrow {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #666666;
        }
        .module-heading {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.02em;
          margin: 4px 0 0 0;
        }
        .module-actions-row {
          display: flex;
          gap: 10px;
        }

        /* Buttons */
        .btn-brutalist-solid {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #000000;
          color: #ffffff;
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-brutalist-solid:hover {
          background: #ffffff;
          color: #000000;
        }
        .btn-brutalist-outline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #000000;
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 8px 18px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-brutalist-outline:hover {
          background: #000000;
          color: #ffffff;
        }

        /* Filter bar */
        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .search-wrap {
          position: relative;
          flex: 1;
          max-width: 440px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #000000;
        }
        .cad-search-input {
          width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 10px 16px 10px 38px;
          font-size: 13px;
          color: #000000;
          outline: none;
        }
        .filter-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-pill {
          background: #ffffff;
          border: 1px solid #cccccc;
          border-radius: 9999px;
          padding: 6px 14px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          color: #000000;
        }
        .filter-pill.is-active {
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        }

        /* Table */
        .cad-table-wrap {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          overflow: hidden;
        }
        .cad-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .cad-table th {
          background: #f8f8f8;
          border-bottom: 1px solid #000000;
          text-align: left;
          padding: 12px 16px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #000000;
        }
        .cad-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #eeeeee;
          vertical-align: middle;
        }
        .cad-table tr:hover td {
          background: #fafafa;
        }
        .table-badge {
          display: inline-block;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          border: 1px solid #000000;
          padding: 2px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .btn-inspect-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          cursor: pointer;
        }
        .btn-inspect-pill:hover {
          background: #000000;
          color: #ffffff;
        }

        /* Inquiries Grid */
        .cad-grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 16px;
        }
        .inquiry-card {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .inquiry-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #eeeeee;
          padding-bottom: 10px;
        }
        .inquiry-card-name {
          font-size: 16px;
          font-weight: 800;
          margin: 0;
        }
        .inquiry-card-meta {
          font-size: 11.5px;
          color: #666666;
          margin-top: 3px;
        }
        .inquiry-card-meta a {
          color: #000000;
          text-decoration: underline;
        }
        .inquiry-card-date {
          font-size: 10.5px;
          color: #888888;
        }
        .inquiry-card-service {
          font-size: 11.5px;
          color: #444444;
        }
        .inquiry-card-msg {
          font-size: 13px;
          line-height: 1.5;
          color: #222222;
          margin: 0;
          background: #f9f9f9;
          padding: 12px;
          border-radius: 6px;
          border-left: 2px solid #000000;
        }
        .inquiry-card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }
        .btn-inquiry-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 6px 12px;
          border: 1px solid #000000;
          border-radius: 9999px;
          color: #000000;
          text-decoration: none;
        }
        .btn-inquiry-action:hover {
          background: #000000;
          color: #ffffff;
        }

        /* Projects Gallery Grid */
        .projects-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .project-display-card {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          overflow: hidden;
        }
        .project-display-img {
          position: relative;
          width: 100%;
          height: 190px;
          background: #eeeeee;
        }
        .project-display-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .project-display-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #000000;
          color: #ffffff;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          padding: 3px 8px;
          border-radius: 9999px;
        }
        .project-display-body {
          padding: 16px;
        }
        .project-display-title {
          font-size: 14px;
          font-weight: 800;
          margin: 0 0 6px 0;
          letter-spacing: -0.01em;
        }
        .project-display-loc {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #666666;
        }

        /* Settings Card & Form */
        .settings-card {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          padding: clamp(24px, 4vw, 44px);
        }
        .cad-form {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #000000;
          padding-bottom: 10px;
          margin-bottom: 8px;
        }
        .form-section-num {
          font-size: 11px;
          font-weight: 800;
        }
        .form-section-title {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cad-input {
          width: 100%;
          box-sizing: border-box;
          background: #ffffff;
          border: 1px solid #cccccc;
          border-radius: 6px;
          padding: 11px 14px;
          font-size: 13.5px;
          color: #000000;
          outline: none;
        }
        .cad-input:focus {
          border-color: #000000;
          box-shadow: 0 0 0 2px #000000;
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .form-error {
          font-size: 11px;
          color: #000000;
          font-weight: 700;
        }
        .social-links-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .social-link-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-remove-row {
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 6px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-remove-row:hover {
          background: #000000;
          color: #ffffff;
        }
        .form-actions-bar {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #000000;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 20px;
        }
        .modal-cad-panel {
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border: 1px solid #000000;
          border-radius: 8px;
          padding: 28px;
          box-sizing: border-box;
        }
        .modal-cad-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #000000;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        .modal-eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #666666;
        }
        .modal-title {
          font-size: 22px;
          font-weight: 900;
          margin: 4px 0 0 0;
        }
        .modal-close-btn {
          background: none;
          border: 1px solid #000000;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          display: flex;
        }
        .modal-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .modal-meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .modal-meta-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #777777;
        }
        .modal-meta-val {
          font-size: 14px;
          color: #000000;
          font-weight: 600;
        }
        .cad-link-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 5px 12px;
          font-size: 11.5px;
          color: #000000;
          text-decoration: none;
          font-weight: 700;
        }
        .services-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .service-chip {
          border: 1px solid #000000;
          border-radius: 9999px;
          padding: 3px 10px;
          font-size: 10.5px;
          font-weight: 700;
        }
        .modal-message-box {
          background: #f7f7f7;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 14px;
          font-size: 13px;
          line-height: 1.55;
          color: #222222;
          margin-top: 4px;
          white-space: pre-wrap;
        }
        .modal-cad-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #000000;
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 1024px) {
          .atelier-bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dispatch-overview-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .atelier-bento-grid {
            grid-template-columns: 1fr;
          }
          .form-grid-2,
          .form-grid-3 {
            grid-template-columns: 1fr;
          }
          .modal-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

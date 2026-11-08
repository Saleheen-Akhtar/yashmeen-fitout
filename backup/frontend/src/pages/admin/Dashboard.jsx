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
  FiChevronLeft,
  FiChevronRight,
  FiSend,
} from "react-icons/fi";
import "../../styles/home.css";

const STAGES = [
  {
    id: "intake",
    num: "(01)",
    name: "Intake & Briefs",
    desc: "Raw client submissions & quotation requests",
  },
  {
    id: "estimation",
    num: "(02)",
    name: "Estimation & MEP",
    desc: "Spatial feasibility, CAD drafting & technical costing",
  },
  {
    id: "proposals",
    num: "(03)",
    name: "Client Proposals",
    desc: "Turnkey concept proposals & contract review",
  },
  {
    id: "production",
    num: "(04)",
    name: "Atelier Production",
    desc: "Bespoke Al Quoz joinery fabrication & on-site build",
  },
  {
    id: "delivered",
    num: "(05)",
    name: "Delivered & Handover",
    desc: "Snag-free handover & catalogued spatial archive",
  },
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
  // View mode: 'bento' (Editorial Bento matching Selected Works) or 'lanes' (Multi-lane kanban)
  const [viewMode, setViewMode] = useState("bento");

  // Selected stage filter ('ALL' or stage id)
  const [selectedStage, setSelectedStage] = useState("ALL");

  // Active section tab: 'pipeline', 'telemetry', 'directory'
  const [sectionTab, setSectionTab] = useState("pipeline");

  // Live dynamic data states
  const [quotes, setQuotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [details, setDetails] = useState(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Kanban persistent stages mapping: { [itemId]: stageId }
  const [stageMap, setStageMap] = useState(() => {
    try {
      const saved = localStorage.getItem("yashmeen_kanban_stage_map");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom Atelier Dispatches
  const [customDispatches, setCustomDispatches] = useState(() => {
    try {
      const saved = localStorage.getItem("yashmeen_custom_dispatches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  // Slide-over inspection drawer
  const [inspectedItem, setInspectedItem] = useState(null);

  // Quick Add Commission Modal
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newDispatchForm, setNewDispatchForm] = useState({
    title: "",
    client: "",
    type: "COMMISSION BRIEF",
    location: "Dubai, UAE",
    budget: "Under AED 150,000",
    scope: "Turnkey Interior Fit-Out",
    notes: "",
    stage: "intake",
  });

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

  // Update item stage
  const updateItemStage = (itemId, targetStageId, itemTitle = "Item") => {
    setStageMap((prev) => {
      const next = { ...prev, [itemId]: targetStageId };
      try {
        localStorage.setItem("yashmeen_kanban_stage_map", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save stage map:", e);
      }
      return next;
    });

    const targetStage = STAGES.find((s) => s.id === targetStageId);
    toast.success(`Moved "${itemTitle}" to ${targetStage?.name || targetStageId}`);
  };

  // Advance to next stage helper
  const advanceStage = (item) => {
    const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
    if (currentIndex >= 0 && currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1];
      updateItemStage(item.id, nextStage.id, item.title);
    }
  };

  // Regress to prev stage helper
  const regressStage = (item) => {
    const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
    if (currentIndex > 0) {
      const prevStage = STAGES[currentIndex - 1];
      updateItemStage(item.id, prevStage.id, item.title);
    }
  };

  // Convert raw Mongo items + custom items into Unified Pipeline Items
  const allItems = useMemo(() => {
    const list = [];

    // 1. Quotes
    quotes.forEach((q, idx) => {
      const id = `quote-${q._id}`;
      const assignedStage = stageMap[id] || "intake";
      const stageObj = STAGES.find((s) => s.id === assignedStage);
      list.push({
        id,
        rawId: q._id,
        itemType: "QUOTE",
        typeBadge: "COMMISSION BRIEF",
        num: `(${String(idx + 1).padStart(2, "0")})`,
        title: q.name || "Bespoke Commission",
        client: q.name,
        subtitle: q.projectType ? `${q.projectType} Fit-Out` : "Commercial & Residential",
        location: q.location || "Dubai, UAE",
        budget: q.budget || "Custom Budget",
        services: Array.isArray(q.services) ? q.services : q.services ? [q.services] : [],
        message: q.message || "",
        email: q.email || "",
        mobile: q.mobile || "",
        timeline: q.timeline || "Within 1-3 months",
        date: q.createdAt,
        stage: assignedStage,
        stageName: stageObj ? stageObj.name : "Intake",
        image: null,
      });
    });

    // 2. Enquiries
    enquiries.forEach((e, idx) => {
      const id = `enquiry-${e._id}`;
      const assignedStage = stageMap[id] || "intake";
      const stageObj = STAGES.find((s) => s.id === assignedStage);
      list.push({
        id,
        rawId: e._id,
        itemType: "ENQUIRY",
        typeBadge: "CLIENT INQUIRY",
        num: `(${String(quotes.length + idx + 1).padStart(2, "0")})`,
        title: e.name || "Client Inquiry",
        client: e.name,
        subtitle: e.services || "Interior Fit-Out Consultation",
        location: "Dubai, UAE",
        budget: "Direct Inquiry",
        services: e.services ? [e.services] : ["Turnkey Fit-Out"],
        message: e.message || "",
        email: e.email || "",
        mobile: e.mobile || "",
        timeline: "Immediate Consultation",
        date: e.createdAt,
        stage: assignedStage,
        stageName: stageObj ? stageObj.name : "Intake",
        image: null,
      });
    });

    // 3. Projects (Sample first 8 for spatial execution)
    projects.slice(0, 8).forEach((p, idx) => {
      const id = `project-${p._id}`;
      const defaultStage =
        idx % 4 === 0
          ? "production"
          : idx % 4 === 1
          ? "estimation"
          : idx % 4 === 2
          ? "proposals"
          : "delivered";

      const assignedStage = stageMap[id] || defaultStage;
      const stageObj = STAGES.find((s) => s.id === assignedStage);
      list.push({
        id,
        rawId: p._id,
        itemType: "PROJECT",
        typeBadge: "SPATIAL WORK",
        num: `(${String(quotes.length + enquiries.length + idx + 1).padStart(2, "0")})`,
        title: p.title || "Spatial Project",
        client: "Yashmeen Atelier Archive",
        subtitle: p.category || "Fit-Out & Joinery",
        location: p.location || "Dubai, UAE",
        budget: "Turnkey Fit-Out",
        image: p.image,
        services: ["Spatial Architecture", "Bespoke Joinery & MEP"],
        message: p.description || "",
        email: details.email || "info@yfbfitoutcontracting.com",
        mobile: details.mobile || "+971543862870",
        timeline: "Completed or In-Build",
        date: p.createdAt,
        stage: assignedStage,
        stageName: stageObj ? stageObj.name : "Production",
      });
    });

    // 4. Custom Dispatches
    customDispatches.forEach((c, idx) => {
      const id = `custom-${c.id}`;
      const assignedStage = stageMap[id] || c.stage || "intake";
      const stageObj = STAGES.find((s) => s.id === assignedStage);
      list.push({
        id,
        rawId: c.id,
        itemType: "CUSTOM",
        typeBadge: c.type || "ATELIER DISPATCH",
        num: `(C${idx + 1})`,
        title: c.title || "Custom Brief",
        client: c.client || "Studio Team",
        subtitle: c.scope || "Architectural Task",
        location: c.location || "Dubai, UAE",
        budget: c.budget || "Internal Atelier",
        services: [c.scope || "Joinery Specification"],
        message: c.notes || "",
        email: details.email || "",
        mobile: details.mobile || "",
        timeline: "Active Milestone",
        date: c.createdAt,
        stage: assignedStage,
        stageName: stageObj ? stageObj.name : "Intake",
        image: null,
      });
    });

    return list;
  }, [quotes, enquiries, projects, customDispatches, stageMap, details]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (selectedStage !== "ALL" && item.stage !== selectedStage) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.client && item.client.toLowerCase().includes(q)) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.message && item.message.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [allItems, selectedStage, searchQuery]);

  // Handle Quick Add Dispatch
  const handleCreateDispatch = (e) => {
    e.preventDefault();
    if (!newDispatchForm.title.trim()) {
      toast.error("Please enter a brief or project title.");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      title: newDispatchForm.title.trim(),
      client: newDispatchForm.client.trim() || "Private Client",
      type: newDispatchForm.type,
      location: newDispatchForm.location.trim() || "Dubai, UAE",
      budget: newDispatchForm.budget.trim() || "Under AED 150,000",
      scope: newDispatchForm.scope.trim() || "Turnkey Fit-Out & Joinery",
      notes: newDispatchForm.notes.trim() || "Logged from Atelier CMS console.",
      createdAt: new Date().toISOString(),
      stage: newDispatchForm.stage,
    };

    const updated = [newEntry, ...customDispatches];
    setCustomDispatches(updated);
    try {
      localStorage.setItem("yashmeen_custom_dispatches", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    updateItemStage(`custom-${newEntry.id}`, newDispatchForm.stage, newEntry.title);
    setQuickAddOpen(false);
    setNewDispatchForm({
      title: "",
      client: "",
      type: "COMMISSION BRIEF",
      location: "Dubai, UAE",
      budget: "Under AED 150,000",
      scope: "Turnkey Interior Fit-Out",
      notes: "",
      stage: "intake",
    });
    toast.success(`Logged "${newEntry.title}" into pipeline.`);
  };

  // Drag and Drop Handlers for Lanes view
  const handleDragStart = (e, item) => {
    setDraggingItemId(item.id);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setDragOverColId(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain") || draggingItemId;
    setDragOverColId(null);
    setDraggingItemId(null);

    if (!itemId) return;
    const item = allItems.find((i) => i.id === itemId);
    if (item && item.stage !== targetColId) {
      updateItemStage(itemId, targetColId, item.title);
    }
  };

  // Settings form handlers
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (details.email && !EMAIL_RE.test(details.email)) {
      setSettingsErrors({ email: "Valid email required." });
      return;
    }
    setSavingSettings(true);
    try {
      await webDetailsAPI.update(details);
      toast.success("Atelier directory updated successfully.");
    } catch {
      toast.error("Failed to update atelier directory.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ paddingBottom: "120px" }}>
      {/* ======================================================================
          1. HERO HEADER (Matches Home Page: "From brief to built.")
          ====================================================================== */}
      <section
        className="wrap"
        style={{
          paddingTop: "clamp(3rem, 6vw, 6rem)",
          paddingBottom: "clamp(2.5rem, 4vw, 4.5rem)",
          borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "28px",
          }}
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "1rem" }}>
              (AL QUOZ ATELIER · CMS ARCHITECTURAL PIPELINE)
            </span>
            <h1
              className="u-text-h2"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.04em",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              FROM BRIEF TO BUILT.
            </h1>
            <p
              style={{
                fontSize: "clamp(1rem, 1.25vw, 1.15rem)",
                color: "var(--muted, #545454)",
                lineHeight: 1.6,
                marginTop: "1.25rem",
                maxWidth: "680px",
                marginBottom: 0,
              }}
            >
              One team shapes the space, makes the details and delivers the finished interior.
              Real-time architectural control for quotation commissions, client consultations,
              joinery fabrication, and spatial delivery across Dubai.
            </p>
          </div>

          {/* Right Action & Proof */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "20px",
            }}
          >
            <button
              type="button"
              className="btn-pill btn-pill-dark"
              onClick={() => setQuickAddOpen(true)}
            >
              <span>+ LOG NEW COMMISSION</span>
              <span className="g-circle" aria-hidden="true" />
            </button>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                textAlign: "right",
                gap: "4px",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--ink, #080807)",
                }}
              >
                35,000 SQ. FT.
              </div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--muted, #545454)",
                }}
              >
                AL QUOZ ATELIER & JOINERY BAY
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs: Pipeline / Telemetry / Directory */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "40px",
          }}
        >
          {[
            { id: "pipeline", label: `Commission Pipeline (${allItems.length})` },
            { id: "telemetry", label: "Atelier Telemetry & Feeds" },
            { id: "directory", label: "Studio Profile & Directory" },
          ].map((tab) => {
            const active = sectionTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`works-switch-btn ${active ? "active" : ""}`}
                onClick={() => setSectionTab(tab.id)}
                style={{
                  fontSize: "12px",
                  padding: "8px 18px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ======================================================================
          2. COMMISSION PIPELINE SECTION (Exact Works Bento / Lanes Vibe)
          ====================================================================== */}
      {sectionTab === "pipeline" && (
        <section
          className="works-bento-section wrap"
          id="pipeline"
          aria-label="Commission Pipeline"
          style={{ paddingTop: "clamp(3rem, 6vw, 5rem)" }}
        >
          {/* Bento Header */}
          <div className="works-bento-header" style={{ alignItems: "flex-end" }}>
            <div>
              <span className="eyebrow">(SPACES IN PROGRESS · FROM FIRST MEETING TO HANDOVER)</span>
              <h2 className="u-text-h2">Selected workflow</h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div className="works-view-switcher">
                <button
                  type="button"
                  className={`works-switch-btn ${viewMode === "bento" ? "active" : ""}`}
                  onClick={() => setViewMode("bento")}
                >
                  Editorial Bento
                </button>
                <button
                  type="button"
                  className={`works-switch-btn ${viewMode === "lanes" ? "active" : ""}`}
                  onClick={() => setViewMode("lanes")}
                >
                  Pipeline Lanes
                </button>
              </div>
              <span
                className="works-bento-count"
                aria-label={`${filteredItems.length} commissions`}
              >
                ({String(filteredItems.length).padStart(2, "0")})
              </span>
            </div>
          </div>

          {/* Stage Filter Rail & Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "clamp(2.5rem, 5vw, 4rem)",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
            }}
          >
            {/* Stage Selector Pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className={`works-switch-btn ${selectedStage === "ALL" ? "active" : ""}`}
                onClick={() => setSelectedStage("ALL")}
                style={{ fontSize: "11px", padding: "6px 14px" }}
              >
                ALL STAGES ({allItems.length})
              </button>

              {STAGES.map((stg) => {
                const count = allItems.filter((i) => i.stage === stg.id).length;
                const active = selectedStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    className={`works-switch-btn ${active ? "active" : ""}`}
                    onClick={() => setSelectedStage(stg.id)}
                    style={{
                      fontSize: "11px",
                      padding: "6px 14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{stg.num}</span>
                    <span>{stg.name}</span>
                    <span style={{ opacity: 0.65 }}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Clean Architectural Search */}
            <div style={{ position: "relative", minWidth: "240px" }}>
              <FiSearch
                size={13}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted, #545454)",
                }}
              />
              <input
                type="text"
                placeholder="Search pipeline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "36px",
                  paddingRight: "14px",
                  paddingTop: "7px",
                  paddingBottom: "7px",
                  fontSize: "12px",
                  borderRadius: "var(--radius-pill, 9999px)",
                  border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                  background: "var(--surface, #ffffff)",
                  color: "var(--ink, #080807)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* ==================================================================
              VIEW MODE A: EDITORIAL BENTO GRID (Matches Website Selected Works)
              ================================================================== */}
          {viewMode === "bento" && (
            <div className="works-bento-grid">
              {filteredItems.length === 0 ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "80px 20px",
                    textAlign: "center",
                    color: "var(--muted, #545454)",
                    border: "1px dashed var(--line, rgba(8, 8, 7, 0.12))",
                    borderRadius: "var(--radius, 10px)",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    No commissions in this stage filter.
                  </div>
                  <button
                    onClick={() => setSelectedStage("ALL")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--ink, #080807)",
                      fontWeight: 700,
                      marginTop: "10px",
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    View all pipeline commissions ↗
                  </button>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isLandscape = idx % 2 === 0;
                  const isOffset = idx % 3 === 1;
                  return (
                    <article
                      key={item.id}
                      className={`works-card ${
                        isLandscape ? "is-landscape" : "is-portrait is-monumental"
                      } ${isOffset ? "offset-top" : ""}`}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Image Frame or Architectural Paper Canvas */}
                      <div
                        className="works-card-image-wrap"
                        style={{
                          background: item.image
                            ? "var(--surface-alt, #f1f0ee)"
                            : "var(--ink, #080807)",
                          minHeight: "280px",
                          position: "relative",
                        }}
                        onClick={() => setInspectedItem(item)}
                      >
                        {item.image ? (
                          <img
                            src={imageUrl(item.image)}
                            alt={item.title}
                            onError={(e) => {
                              e.target.src = "/static/hero-aperture.png";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "36px 32px",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              color: "#ffffff",
                              boxSizing: "border-box",
                              minHeight: "300px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  color: "rgba(255, 255, 255, 0.7)",
                                }}
                              >
                                {item.typeBadge}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "rgba(255, 255, 255, 0.5)",
                                }}
                              >
                                {formatDate(item.date)}
                              </span>
                            </div>

                            {item.message ? (
                              <blockquote
                                style={{
                                  fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
                                  fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                                  fontStyle: "italic",
                                  lineHeight: 1.4,
                                  margin: "24px 0",
                                  color: "#f0f0ee",
                                  fontWeight: 400,
                                }}
                              >
                                "{item.message.slice(0, 180)}..."
                              </blockquote>
                            ) : (
                              <div
                                style={{
                                  fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
                                  fontSize: "1.4rem",
                                  fontStyle: "italic",
                                  color: "rgba(255,255,255,0.7)",
                                  margin: "24px 0",
                                }}
                              >
                                Bespoke Architectural Commission Brief
                              </div>
                            )}

                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                  letterSpacing: "0.04em",
                                  textTransform: "uppercase",
                                  background: "rgba(255, 255, 255, 0.12)",
                                  padding: "4px 10px",
                                  borderRadius: "var(--radius-pill, 9999px)",
                                }}
                              >
                                {item.location}
                              </span>
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  fontWeight: 600,
                                  letterSpacing: "0.04em",
                                  textTransform: "uppercase",
                                  background: "rgba(255, 255, 255, 0.12)",
                                  padding: "4px 10px",
                                  borderRadius: "var(--radius-pill, 9999px)",
                                }}
                              >
                                {item.budget}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Meta Row */}
                      <div className="works-card-meta">
                        <span>
                          {item.num} / {item.subtitle}
                        </span>
                        <span>{item.stageName}</span>
                      </div>

                      {/* Card Title */}
                      <h3
                        className="works-card-title"
                        onClick={() => setInspectedItem(item)}
                      >
                        {item.title}
                      </h3>

                      {/* Interactive Stage Advancement Bar */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "16px",
                          paddingTop: "14px",
                          borderTop: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            title="Regress stage"
                            disabled={item.stage === "intake"}
                            onClick={() => regressStage(item)}
                            style={{
                              background: "transparent",
                              border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                              borderRadius: "50%",
                              width: "28px",
                              height: "28px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: item.stage === "intake" ? "not-allowed" : "pointer",
                              opacity: item.stage === "intake" ? 0.3 : 1,
                              color: "var(--ink, #080807)",
                            }}
                          >
                            <FiChevronLeft size={13} />
                          </button>

                          <button
                            type="button"
                            disabled={item.stage === "delivered"}
                            onClick={() => advanceStage(item)}
                            className="btn-pill btn-pill-outline-dark"
                            style={{
                              minHeight: "30px",
                              padding: "0 12px",
                              fontSize: "10.5px",
                              opacity: item.stage === "delivered" ? 0.4 : 1,
                            }}
                          >
                            <span>
                              {item.stage === "delivered"
                                ? "HANDED OVER ✓"
                                : "NEXT STAGE →"}
                            </span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setInspectedItem(item)}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "var(--ink, #080807)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "underline",
                          }}
                        >
                          INSPECT <FiArrowUpRight size={11} />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* ==================================================================
              VIEW MODE B: PIPELINE LANES (Spacious Architectural Kanban Columns)
              ================================================================== */}
          {viewMode === "lanes" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
                alignItems: "start",
              }}
            >
              {STAGES.map((stg) => {
                const colItems = allItems.filter((i) => i.stage === stg.id);
                const isOver = dragOverColId === stg.id;
                return (
                  <div
                    key={stg.id}
                    onDragOver={(e) => handleDragOver(e, stg.id)}
                    onDragLeave={() => setDragOverColId(null)}
                    onDrop={(e) => handleDrop(e, stg.id)}
                    style={{
                      background: isOver
                        ? "var(--surface-alt, #f1f0ee)"
                        : "var(--surface, #ffffff)",
                      border: "1px solid",
                      borderColor: isOver
                        ? "var(--ink, #080807)"
                        : "var(--line, rgba(8, 8, 7, 0.12))",
                      borderRadius: "var(--radius, 10px)",
                      padding: "20px",
                      minHeight: "480px",
                      transition: "all 0.25s ease",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: isOver
                        ? "0 12px 32px rgba(0,0,0,0.06)"
                        : "0 2px 10px rgba(0,0,0,0.02)",
                    }}
                  >
                    {/* Lane Header */}
                    <div
                      style={{
                        paddingBottom: "14px",
                        borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: "var(--muted, #545454)",
                          }}
                        >
                          {stg.num}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            background: "var(--ink, #080807)",
                            color: "#ffffff",
                            padding: "2px 7px",
                            borderRadius: "var(--radius-pill, 9999px)",
                          }}
                        >
                          {colItems.length}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontFamily: "var(--font-display, sans-serif)",
                          fontSize: "15px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          margin: "6px 0 2px 0",
                          color: "var(--ink, #080807)",
                        }}
                      >
                        {stg.name}
                      </h4>
                      <div style={{ fontSize: "11px", color: "var(--muted, #545454)" }}>
                        {stg.desc}
                      </div>
                    </div>

                    {/* Lane Items */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        flex: 1,
                      }}
                    >
                      {colItems.length === 0 ? (
                        <div
                          style={{
                            border: "1px dashed var(--line, rgba(8, 8, 7, 0.12))",
                            borderRadius: "8px",
                            padding: "36px 12px",
                            textAlign: "center",
                            color: "var(--muted-light, #8a8a86)",
                            fontSize: "11px",
                            background: "var(--bg, #fcfcfc)",
                          }}
                        >
                          + Drop commission here
                        </div>
                      ) : (
                        colItems.map((item) => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            style={{
                              background: "var(--surface, #ffffff)",
                              border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                              borderRadius: "8px",
                              padding: "16px",
                              cursor: "grab",
                              transition: "all 0.2s ease",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "var(--ink, #080807)";
                              e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--line, rgba(8, 8, 7, 0.12))";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "10px",
                                textTransform: "uppercase",
                                color: "var(--muted, #545454)",
                                marginBottom: "6px",
                              }}
                            >
                              <span>{item.typeBadge}</span>
                              <span>{formatDate(item.date)}</span>
                            </div>

                            <h5
                              style={{
                                margin: "0 0 4px 0",
                                fontSize: "13.5px",
                                fontWeight: 700,
                                color: "var(--ink, #080807)",
                              }}
                            >
                              {item.title}
                            </h5>
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "var(--muted, #545454)",
                                marginBottom: "8px",
                              }}
                            >
                              {item.subtitle}
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "10px",
                                paddingTop: "8px",
                                borderTop: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                              }}
                            >
                              <div style={{ display: "flex", gap: "4px" }}>
                                <button
                                  type="button"
                                  disabled={stg.id === "intake"}
                                  onClick={() => regressStage(item)}
                                  style={{
                                    background: "transparent",
                                    border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                                    borderRadius: "4px",
                                    padding: "3px 6px",
                                    cursor: stg.id === "intake" ? "not-allowed" : "pointer",
                                    opacity: stg.id === "intake" ? 0.3 : 1,
                                  }}
                                >
                                  <FiChevronLeft size={11} />
                                </button>
                                <button
                                  type="button"
                                  disabled={stg.id === "delivered"}
                                  onClick={() => advanceStage(item)}
                                  style={{
                                    background: "transparent",
                                    border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                                    borderRadius: "4px",
                                    padding: "3px 6px",
                                    cursor: stg.id === "delivered" ? "not-allowed" : "pointer",
                                    opacity: stg.id === "delivered" ? 0.3 : 1,
                                  }}
                                >
                                  <FiChevronRight size={11} />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => setInspectedItem(item)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  fontSize: "10.5px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                INSPECT ↗
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ======================================================================
          3. ATELIER TELEMETRY SECTION (Matches Studio.jsx on website)
          ====================================================================== */}
      {sectionTab === "telemetry" && (
        <section
          className="wrap"
          style={{
            paddingTop: "clamp(3rem, 6vw, 5rem)",
            borderTop: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
          }}
        >
          <div style={{ marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}>
            <span className="eyebrow">(AL QUOZ 35,000 SQ. FT. ATELIER & STUDIO)</span>
            <h2 className="u-text-h2">Studio manifesto & feeds</h2>
          </div>

          {/* 4 Metric Bento Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                borderRadius: "var(--radius, 10px)",
                padding: "28px",
                background: "var(--surface, #ffffff)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--muted, #545454)",
                  letterSpacing: "0.06em",
                }}
              >
                (01) / COMMISSIONS
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 500,
                  margin: "8px 0",
                  lineHeight: 1,
                }}
              >
                {quotes.length}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted, #545454)" }}>
                Active quotation briefs logged
              </div>
              {quotes[0] && (
                <div style={{ fontSize: "12px", marginTop: "12px", fontWeight: 600 }}>
                  Latest: {quotes[0].name}
                </div>
              )}
            </div>

            <div
              style={{
                border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                borderRadius: "var(--radius, 10px)",
                padding: "28px",
                background: "var(--surface, #ffffff)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--muted, #545454)",
                  letterSpacing: "0.06em",
                }}
              >
                (02) / INQUIRIES
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 500,
                  margin: "8px 0",
                  lineHeight: 1,
                }}
              >
                {enquiries.length}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted, #545454)" }}>
                Direct client messages recorded
              </div>
              {enquiries[0] && (
                <div style={{ fontSize: "12px", marginTop: "12px", fontWeight: 600 }}>
                  Latest: {enquiries[0].name}
                </div>
              )}
            </div>

            <div
              style={{
                border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                borderRadius: "var(--radius, 10px)",
                padding: "28px",
                background: "var(--surface, #ffffff)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--muted, #545454)",
                  letterSpacing: "0.06em",
                }}
              >
                (03) / SPATIAL ARCHIVE
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  fontWeight: 500,
                  margin: "8px 0",
                  lineHeight: 1,
                }}
              >
                {projects.length}
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted, #545454)" }}>
                Archived projects & built spaces
              </div>
              <Link
                to="/dashboard/project-manager"
                style={{
                  display: "inline-block",
                  fontSize: "11.5px",
                  marginTop: "12px",
                  color: "var(--ink, #080807)",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Manage Portfolio ↗
              </Link>
            </div>

            <div
              style={{
                border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                borderRadius: "var(--radius, 10px)",
                padding: "28px",
                background: "var(--surface, #ffffff)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--muted, #545454)",
                  letterSpacing: "0.06em",
                }}
              >
                (04) / DIRECTORY
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: 500,
                  margin: "8px 0",
                  lineHeight: 1.1,
                }}
              >
                DUBAI, UAE
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted, #545454)" }}>
                {details.email || "info@yfbfitoutcontracting.com"}
              </div>
              <button
                type="button"
                onClick={() => setSectionTab("directory")}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "11.5px",
                  marginTop: "12px",
                  color: "var(--ink, #080807)",
                  fontWeight: 700,
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Edit Studio Details ↗
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================
          4. ATELIER DIRECTORY SETTINGS
          ====================================================================== */}
      {sectionTab === "directory" && (
        <section
          className="wrap"
          style={{
            paddingTop: "clamp(3rem, 6vw, 5rem)",
            borderTop: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
          }}
        >
          <div style={{ marginBottom: "clamp(2rem, 4vw, 3.5rem)" }}>
            <span className="eyebrow">(PUBLIC PROFILE & ATELIER IDENTITY)</span>
            <h2 className="u-text-h2">Studio directory settings</h2>
          </div>

          <form onSubmit={handleSettingsSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "36px",
              }}
            >
              {/* Location Card */}
              <div
                style={{
                  border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                  borderRadius: "var(--radius, 10px)",
                  padding: "28px",
                  background: "var(--surface, #ffffff)",
                }}
              >
                <div className="eyebrow" style={{ marginBottom: "16px" }}>
                  (01) PHYSICAL LOCATION
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label>STREET / BUILDING DETAILS</label>
                  <input
                    type="text"
                    value={details.address?.street || ""}
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <label>CITY / EMIRATE</label>
                    <input
                      type="text"
                      value={details.address?.city || ""}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                  <div>
                    <label>POSTAL CODE / P.O. BOX</label>
                    <input
                      type="text"
                      value={details.address?.zipCode || ""}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value },
                        }))
                      }
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                </div>
                <div>
                  <label>COUNTRY</label>
                  <input
                    type="text"
                    value={details.address?.country || "United Arab Emirates"}
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>

              {/* Contact Card */}
              <div
                style={{
                  border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                  borderRadius: "var(--radius, 10px)",
                  padding: "28px",
                  background: "var(--surface, #ffffff)",
                }}
              >
                <div className="eyebrow" style={{ marginBottom: "16px" }}>
                  (02) DIRECT CONTACT LINES
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label>OFFICIAL EMAIL</label>
                  <input
                    type="email"
                    value={details.email || ""}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, email: e.target.value }));
                      setSettingsErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                  {settingsErrors.email && (
                    <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "4px" }}>
                      {settingsErrors.email}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label>PHONE</label>
                  <input
                    type="text"
                    value={details.mobile || ""}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, mobile: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div>
                  <label>WHATSAPP BUSINESS</label>
                  <input
                    type="text"
                    value={details.whatsapp || ""}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <button
                type="submit"
                disabled={savingSettings}
                className="btn-pill btn-pill-dark"
              >
                <span>{savingSettings ? "SAVING..." : "SAVE DIRECTORY CHANGES"}</span>
                <span className="g-circle" aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================================================
          5. SLIDE-OVER INSPECTION SHEET (Exact Questionnaire Modal Vibe)
          ====================================================================== */}
      {inspectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 8, 7, 0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setInspectedItem(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "var(--bg, #fcfcfc)",
              height: "100%",
              overflowY: "auto",
              padding: "clamp(2rem, 4vw, 3.5rem)",
              boxShadow: "-12px 0 36px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingBottom: "24px",
                borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                marginBottom: "28px",
              }}
            >
              <div>
                <span className="eyebrow" style={{ marginBottom: "8px" }}>
                  ({inspectedItem.typeBadge})
                </span>
                <h2
                  className="u-text-h2"
                  style={{
                    fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                    lineHeight: 1.05,
                    margin: "4px 0",
                    textTransform: "uppercase",
                  }}
                >
                  {inspectedItem.title}
                </h2>
                <div style={{ fontSize: "13px", color: "var(--muted, #545454)" }}>
                  {inspectedItem.subtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Pipeline Stage Shifter */}
            <div
              style={{
                border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                borderRadius: "var(--radius, 10px)",
                padding: "18px",
                background: "var(--surface, #ffffff)",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "12px",
                }}
              >
                CURRENT PIPELINE STAGE
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {STAGES.map((stg) => {
                  const active = inspectedItem.stage === stg.id;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      className={`works-switch-btn ${active ? "active" : ""}`}
                      onClick={() => {
                        updateItemStage(inspectedItem.id, stg.id, inspectedItem.title);
                        setInspectedItem((prev) => ({
                          ...prev,
                          stage: stg.id,
                          stageName: stg.name,
                        }));
                      }}
                      style={{ fontSize: "11px", padding: "6px 12px" }}
                    >
                      {stg.num} {stg.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Client Contact Lines */}
            {(inspectedItem.email || inspectedItem.mobile) && (
              <div
                style={{
                  border: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
                  borderRadius: "var(--radius, 10px)",
                  padding: "18px",
                  background: "var(--surface, #ffffff)",
                  marginBottom: "28px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "12px",
                  }}
                >
                  DIRECT CLIENT CONTACT
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {inspectedItem.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FiMail size={13} color="var(--muted, #545454)" />
                      <a
                        href={`mailto:${inspectedItem.email}`}
                        style={{
                          color: "var(--ink, #080807)",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        {inspectedItem.email}
                      </a>
                    </div>
                  )}
                  {inspectedItem.mobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FiPhone size={13} color="var(--muted, #545454)" />
                      <a
                        href={`tel:${inspectedItem.mobile}`}
                        style={{
                          color: "var(--ink, #080807)",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        {inspectedItem.mobile}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brief Specification Notes in Serif */}
            {inspectedItem.message && (
              <div style={{ marginBottom: "28px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "10px",
                  }}
                >
                  CLIENT BRIEF & SPECIFICATION
                </div>
                <blockquote
                  style={{
                    fontFamily: "var(--font-serif, 'Cormorant Garamond', serif)",
                    fontSize: "1.3rem",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    color: "var(--ink-soft, #30302e)",
                    background: "var(--surface-alt, #f1f0ee)",
                    padding: "20px",
                    borderRadius: "8px",
                    margin: 0,
                  }}
                >
                  "{inspectedItem.message}"
                </blockquote>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
              {inspectedItem.email && (
                <a
                  href={`mailto:${inspectedItem.email}?subject=Yashmeen%20Fit-Out%20Brief%20Follow-up`}
                  className="btn-pill btn-pill-dark"
                  style={{ flex: 1, textDecoration: "none" }}
                >
                  <span>SEND PROPOSAL ↗</span>
                  <span className="g-circle" aria-hidden="true" />
                </a>
              )}
              {inspectedItem.mobile && (
                <a
                  href={`tel:${inspectedItem.mobile}`}
                  className="btn-pill btn-pill-outline-dark"
                  style={{ textDecoration: "none" }}
                >
                  <span>CALL CLIENT</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          6. QUICK ADD COMMISSION MODAL
          ====================================================================== */}
      {quickAddOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 8, 7, 0.45)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setQuickAddOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
              borderRadius: "var(--radius, 10px)",
              padding: "32px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingBottom: "14px",
                borderBottom: "1px solid var(--line, rgba(8, 8, 7, 0.12))",
              }}
            >
              <div>
                <span className="eyebrow" style={{ marginBottom: "4px" }}>
                  (NEW COMMISSION)
                </span>
                <h3
                  className="u-text-h2"
                  style={{
                    fontSize: "20px",
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  Log pipeline commission
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line-strong, rgba(8, 8, 7, 0.22))",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch}>
              <div style={{ marginBottom: "16px" }}>
                <label>PROJECT / COMMISSION TITLE *</label>
                <input
                  type="text"
                  placeholder="e.g. Palm Jumeirah Penthouse Joinery"
                  value={newDispatchForm.title}
                  onChange={(e) =>
                    setNewDispatchForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  style={{ width: "100%", marginTop: "6px" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label>CLIENT NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Private Homeowner"
                    value={newDispatchForm.client}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, client: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div>
                  <label>INITIAL STAGE</label>
                  <select
                    value={newDispatchForm.stage}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, stage: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.num} {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label>LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai Hills"
                    value={newDispatchForm.location}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div>
                  <label>BUDGET</label>
                  <input
                    type="text"
                    placeholder="e.g. Under AED 250,000"
                    value={newDispatchForm.budget}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, budget: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>BRIEF & SPECIFICATION NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Architectural scope, materials, MEP requirements..."
                  value={newDispatchForm.notes}
                  onChange={(e) =>
                    setNewDispatchForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  style={{ width: "100%", marginTop: "6px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn-pill btn-pill-dark"
                  style={{ flex: 1 }}
                >
                  <span>LOG TO PIPELINE</span>
                  <span className="g-circle" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(false)}
                  className="btn-pill btn-pill-outline-dark"
                >
                  <span>CANCEL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  FiSearch,
  FiPlus,
  FiMail,
  FiPhone,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiArrowUpRight,
  FiLayers,
  FiFileText,
  FiMessageSquare,
  FiSettings,
  FiCheckCircle,
  FiDollarSign,
  FiBriefcase,
  FiCalendar,
} from "react-icons/fi";

const STAGES = [
  {
    id: "leads",
    name: "New Leads",
    badgeClass: "badge-lavender",
    color: "#58437d",
    bg: "#f4f2f9",
    border: "#e4def1",
    desc: "Incoming quotation briefs & web inquiries",
  },
  {
    id: "feasibility",
    name: "Feasibility & Costing",
    badgeClass: "badge-mist",
    color: "#1e5c8a",
    bg: "#edf5fc",
    border: "#d2e6f7",
    desc: "CAD site survey, MEP planning & spatial pricing",
  },
  {
    id: "proposal",
    name: "Proposal & Consultation",
    badgeClass: "badge-amber",
    color: "#8c581e",
    bg: "#fdf6ec",
    border: "#fae5cb",
    desc: "Turnkey fit-out quotes sent & negotiations",
  },
  {
    id: "construction",
    name: "In Construction",
    badgeClass: "badge-neutral",
    color: "#374151",
    bg: "#f0f2f5",
    border: "#e2e5e9",
    desc: "Al Quoz joinery fabrication & on-site build",
  },
  {
    id: "completed",
    name: "Completed & Handed Over",
    badgeClass: "badge-sage",
    color: "#2e6930",
    bg: "#edf6ee",
    border: "#d4ebd5",
    desc: "Snag-free handover & signed off spaces",
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
  });
};

export default function Dashboard() {
  // Current view: 'pipeline' (Kanban), 'table' (List), 'inquiries', 'directory'
  const [activeTab, setActiveTab] = useState("pipeline");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  // Live dynamic data states
  const [quotes, setQuotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [details, setDetails] = useState(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Persistent stage map: { [itemId]: stageId }
  const [stageMap, setStageMap] = useState(() => {
    try {
      const saved = localStorage.getItem("yashmeen_crm_stages");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom Leads
  const [customLeads, setCustomLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("yashmeen_crm_custom_leads");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Drag and drop states
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  // Slide-over inspection drawer
  const [inspectedItem, setInspectedItem] = useState(null);

  // Quick Add Lead Modal
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    title: "",
    client: "",
    type: "COMMISSION BRIEF",
    location: "Dubai, UAE",
    budget: "Under AED 150,000",
    scope: "Turnkey Interior Fit-Out",
    notes: "",
    stage: "leads",
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
        console.error("CRM data load error:", err);
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
  const updateItemStage = (itemId, targetStageId, itemTitle = "Lead") => {
    setStageMap((prev) => {
      const next = { ...prev, [itemId]: targetStageId };
      try {
        localStorage.setItem("yashmeen_crm_stages", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save stage map:", e);
      }
      return next;
    });

    const targetStage = STAGES.find((s) => s.id === targetStageId);
    toast.success(`Moved "${itemTitle}" to ${targetStage?.name || targetStageId}`);
  };

  // Move forward / backward
  const handleStepMove = (item, direction) => {
    const currentIndex = STAGES.findIndex((s) => s.id === item.stage);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      updateItemStage(item.id, STAGES[nextIndex].id, item.title);
    }
  };

  // Compile all CRM items from quotes, enquiries, projects, and custom leads
  const allCRMItems = useMemo(() => {
    const list = [];

    // 1. Quotes
    quotes.forEach((q) => {
      const id = `quote-${q._id}`;
      const assignedStage = stageMap[id] || "leads";
      list.push({
        id,
        rawId: q._id,
        itemType: "QUOTE",
        typeBadge: "Commission",
        badgeStyle: "badge-amber",
        title: q.name || "Client Commission",
        client: q.name,
        subtitle: q.projectType ? `${q.projectType} Fit-Out` : "Turnkey Fit-Out",
        location: q.location || "Dubai",
        budget: q.budget || "Custom Budget",
        services: Array.isArray(q.services) ? q.services : q.services ? [q.services] : [],
        message: q.message || "",
        email: q.email || "",
        mobile: q.mobile || "",
        timeline: q.timeline || "Within 1-3 months",
        date: q.createdAt,
        stage: assignedStage,
      });
    });

    // 2. Enquiries
    enquiries.forEach((e) => {
      const id = `enquiry-${e._id}`;
      const assignedStage = stageMap[id] || "leads";
      list.push({
        id,
        rawId: e._id,
        itemType: "ENQUIRY",
        typeBadge: "Inquiry",
        badgeStyle: "badge-lavender",
        title: e.name || "Client Inquiry",
        client: e.name,
        subtitle: e.services || "Fit-Out Consultation",
        location: "Dubai, UAE",
        budget: "Direct Inquiry",
        services: e.services ? [e.services] : ["Turnkey Fit-Out"],
        message: e.message || "",
        email: e.email || "",
        mobile: e.mobile || "",
        timeline: "Immediate Consultation",
        date: e.createdAt,
        stage: assignedStage,
      });
    });

    // 3. Projects (Sample first 8 for studio progress)
    projects.slice(0, 8).forEach((p, idx) => {
      const id = `project-${p._id}`;
      const defaultStage =
        idx % 4 === 0
          ? "construction"
          : idx % 4 === 1
          ? "feasibility"
          : idx % 4 === 2
          ? "proposal"
          : "completed";

      const assignedStage = stageMap[id] || defaultStage;
      list.push({
        id,
        rawId: p._id,
        itemType: "PROJECT",
        typeBadge: "Spatial Fit-Out",
        badgeStyle: "badge-mist",
        title: p.title || "Spatial Project",
        client: "Yashmeen Atelier",
        subtitle: p.category || "Fit-Out & Joinery",
        location: p.location || "Dubai, UAE",
        budget: "Turnkey Execution",
        image: p.image,
        services: ["Spatial Architecture", "Bespoke Joinery & MEP"],
        message: p.description || "",
        email: details.email || "info@yfbfitoutcontracting.com",
        mobile: details.mobile || "+971543862870",
        timeline: "In-Progress / Handed Over",
        date: p.createdAt,
        stage: assignedStage,
      });
    });

    // 4. Custom Leads
    customLeads.forEach((c) => {
      const id = `custom-${c.id}`;
      const assignedStage = stageMap[id] || c.stage || "leads";
      list.push({
        id,
        rawId: c.id,
        itemType: "CUSTOM",
        typeBadge: c.type || "Lead",
        badgeStyle: "badge-neutral",
        title: c.title || "Custom Lead",
        client: c.client || "Private Client",
        subtitle: c.scope || "Architectural Task",
        location: c.location || "Dubai, UAE",
        budget: c.budget || "AED 150,000",
        services: [c.scope || "Joinery Specification"],
        message: c.notes || "",
        email: details.email || "",
        mobile: details.mobile || "",
        timeline: "Active Milestone",
        date: c.createdAt,
        stage: assignedStage,
      });
    });

    return list;
  }, [quotes, enquiries, projects, customLeads, stageMap, details]);

  // Filtered CRM Items
  const filteredItems = useMemo(() => {
    return allCRMItems.filter((item) => {
      if (stageFilter !== "ALL" && item.stage !== stageFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.client && item.client.toLowerCase().includes(q)) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          (item.location && item.location.toLowerCase().includes(q)) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.message && item.message.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [allCRMItems, stageFilter, searchQuery]);

  // Drag and drop handlers
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
    const item = allCRMItems.find((i) => i.id === itemId);
    if (item && item.stage !== targetColId) {
      updateItemStage(itemId, targetColId, item.title);
    }
  };

  // Add new lead handler
  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.title.trim()) {
      toast.error("Please enter a lead or project name.");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      title: newLeadForm.title.trim(),
      client: newLeadForm.client.trim() || "Private Client",
      type: newLeadForm.type,
      location: newLeadForm.location.trim() || "Dubai, UAE",
      budget: newLeadForm.budget.trim() || "Under AED 150,000",
      scope: newLeadForm.scope.trim() || "Turnkey Fit-Out & Joinery",
      notes: newLeadForm.notes.trim() || "Logged into Atelier CRM.",
      createdAt: new Date().toISOString(),
      stage: newLeadForm.stage,
    };

    const updated = [newEntry, ...customLeads];
    setCustomLeads(updated);
    try {
      localStorage.setItem("yashmeen_crm_custom_leads", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    updateItemStage(`custom-${newEntry.id}`, newLeadForm.stage, newEntry.title);
    setQuickAddOpen(false);
    setNewLeadForm({
      title: "",
      client: "",
      type: "COMMISSION BRIEF",
      location: "Dubai, UAE",
      budget: "Under AED 150,000",
      scope: "Turnkey Interior Fit-Out",
      notes: "",
      stage: "leads",
    });
    toast.success(`Created "${newEntry.title}" in pipeline.`);
  };

  // Delete handlers
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

  // Settings submit handler
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
    <div style={{ maxWidth: "1480px", margin: "0 auto", padding: "32px 28px" }}>
      {/* ======================================================================
          1. CALMING HEADER & KPI METRICS
          ====================================================================== */}
      <section style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#18181b",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Atelier Operations & CRM
            </h1>
            <p
              style={{
                fontSize: "13.5px",
                color: "#6b7280",
                margin: "4px 0 0 0",
              }}
            >
              Manage quotations, active client inquiries, joinery production, and spatial handovers.
            </p>
          </div>

          {/* Quick Actions Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setQuickAddOpen(true)}
              style={{
                background: "#18181b",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#27272a";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#18181b";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FiPlus size={14} />
              <span>New Lead / Deal</span>
            </button>
          </div>
        </div>

        {/* 4 Soft & Soothing KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Card 1 */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                Total Deals in Pipeline
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#edf5fc",
                  color: "#1e5c8a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiLayers size={14} />
              </div>
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#18181b",
                lineHeight: 1.1,
              }}
            >
              {allCRMItems.length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
              Active quotes, messages & works
            </div>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                Quotation Briefs
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#fdf6ec",
                  color: "#8c581e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiFileText size={14} />
              </div>
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#18181b",
                lineHeight: 1.1,
              }}
            >
              {quotes.length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
              {quotes[0] ? `Latest: ${quotes[0].name}` : "Awaiting requests"}
            </div>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                Client Inquiries
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#f4f2f9",
                  color: "#58437d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiMessageSquare size={14} />
              </div>
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#18181b",
                lineHeight: 1.1,
              }}
            >
              {enquiries.length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
              {enquiries[0] ? `Latest: ${enquiries[0].name}` : "All responded"}
            </div>
          </div>

          {/* Card 4 */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                Spatial Works
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#edf6ee",
                  color: "#2e6930",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiCheckCircle size={14} />
              </div>
            </div>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#18181b",
                lineHeight: 1.1,
              }}
            >
              {projects.length}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
              Archived portfolio & fit-out projects
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          2. VIEW CONTROLS (TABS & SEARCH)
          ====================================================================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* View Switchers */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {[
            { id: "pipeline", label: `Kanban Pipeline (${allCRMItems.length})` },
            { id: "table", label: `Quotes Register (${quotes.length})` },
            { id: "inquiries", label: `Inquiries Feed (${enquiries.length})` },
            { id: "directory", label: "Studio Profile & Directory" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? "#ffffff" : "transparent",
                  color: active ? "#18181b" : "#6b7280",
                  border: active ? "1px solid #e5e7eb" : "1px solid transparent",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  fontSize: "12.5px",
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <FiSearch
            size={13}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search leads, clients, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "34px",
              paddingRight: "14px",
              paddingTop: "7px",
              paddingBottom: "7px",
              fontSize: "12.5px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#18181b",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* ======================================================================
          3. MAIN VIEW TAB A: SOFT & SOOTHING KANBAN PIPELINE
          ====================================================================== */}
      {activeTab === "pipeline" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            alignItems: "start",
          }}
        >
          {STAGES.map((stg) => {
            const colItems = filteredItems.filter((i) => i.stage === stg.id);
            const isOver = dragOverColId === stg.id;
            return (
              <div
                key={stg.id}
                onDragOver={(e) => handleDragOver(e, stg.id)}
                onDragLeave={() => setDragOverColId(null)}
                onDrop={(e) => handleDrop(e, stg.id)}
                style={{
                  background: isOver ? "#f3f4f6" : "#f8f9fa",
                  border: "1px solid",
                  borderColor: isOver ? "#d1d5db" : "rgba(0, 0, 0, 0.05)",
                  borderRadius: "12px",
                  padding: "16px",
                  minHeight: "520px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: stg.color,
                        display: "inline-block",
                      }}
                    />
                    <h3
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#1f2937",
                        margin: 0,
                      }}
                    >
                      {stg.name}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: stg.color,
                      background: stg.bg,
                      border: `1px solid ${stg.border}`,
                      padding: "2px 7px",
                      borderRadius: "9999px",
                    }}
                  >
                    {colItems.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  {colItems.length === 0 ? (
                    <div
                      style={{
                        border: "1px dashed rgba(0, 0, 0, 0.08)",
                        borderRadius: "8px",
                        padding: "36px 12px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "12px",
                        background: "rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      No active deals in stage
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        style={{
                          background: "#ffffff",
                          border: "1px solid rgba(0, 0, 0, 0.06)",
                          borderRadius: "10px",
                          padding: "14px",
                          cursor: "grab",
                          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 18px rgba(0, 0, 0, 0.05)";
                          e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 1px 4px rgba(0, 0, 0, 0.02)";
                          e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.06)";
                        }}
                      >
                        {/* Card Header: Type chip + Date */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            className={item.badgeStyle}
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "9999px",
                            }}
                          >
                            {item.typeBadge}
                          </span>
                          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                            {formatDate(item.date)}
                          </span>
                        </div>

                        {/* Title & Scope */}
                        <h4
                          onClick={() => setInspectedItem(item)}
                          style={{
                            fontSize: "13.5px",
                            fontWeight: 600,
                            color: "#18181b",
                            margin: "0 0 2px 0",
                            cursor: "pointer",
                          }}
                        >
                          {item.title}
                        </h4>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "#6b7280",
                            marginBottom: "10px",
                          }}
                        >
                          {item.subtitle}
                        </div>

                        {/* Meta Tags: Location & Budget */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginBottom: "10px",
                            fontSize: "11px",
                            color: "#4b5563",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <FiMapPin size={10} color="#9ca3af" />
                            {item.location}
                          </span>
                          {item.budget && (
                            <span
                              style={{
                                background: "#f3f4f6",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10.5px",
                                fontWeight: 500,
                              }}
                            >
                              {item.budget}
                            </span>
                          )}
                        </div>

                        {/* Brief Excerpt */}
                        {item.message && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              lineHeight: 1.45,
                              marginBottom: "12px",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              background: "#f9fafb",
                              padding: "6px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            "{item.message}"
                          </div>
                        )}

                        {/* Card Footer: Step Movers & Inspect */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "8px",
                            borderTop: "1px solid #f3f4f6",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <button
                              type="button"
                              title="Previous stage"
                              disabled={stg.id === "leads"}
                              onClick={() => handleStepMove(item, -1)}
                              style={{
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                width: "22px",
                                height: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: stg.id === "leads" ? "not-allowed" : "pointer",
                                opacity: stg.id === "leads" ? 0.35 : 1,
                                color: "#4b5563",
                              }}
                            >
                              <FiChevronLeft size={11} />
                            </button>
                            <button
                              type="button"
                              title="Next stage"
                              disabled={stg.id === "completed"}
                              onClick={() => handleStepMove(item, 1)}
                              style={{
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                borderRadius: "4px",
                                width: "22px",
                                height: "22px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: stg.id === "completed" ? "not-allowed" : "pointer",
                                opacity: stg.id === "completed" ? 0.35 : 1,
                                color: "#4b5563",
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
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "#4b5563",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#18181b")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
                          >
                            <span>Inspect</span>
                            <FiArrowUpRight size={11} />
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

      {/* ======================================================================
          4. TAB B: QUOTATIONS LIST REGISTER
          ====================================================================== */}
      {activeTab === "table" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                Client Quotation Requests
              </h3>
              <p style={{ fontSize: "12.5px", color: "#6b7280", margin: "2px 0 0 0" }}>
                Received from public quotation questionnaire.
              </p>
            </div>
            <button
              onClick={handleDeleteOldQuotes}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#6b7280",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            >
              Purge older than 1 month
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Project Type</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Pipeline Stage</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                      No quotations received yet.
                    </td>
                  </tr>
                ) : (
                  quotes.map((q) => {
                    const match = allCRMItems.find((i) => i.rawId === q._id);
                    const stageObj = STAGES.find((s) => s.id === match?.stage);
                    return (
                      <tr key={q._id}>
                        <td style={{ fontWeight: 600 }}>{q.name}</td>
                        <td>{q.projectType || "Bespoke"}</td>
                        <td>{q.location || "Dubai"}</td>
                        <td>{q.budget || "Custom"}</td>
                        <td>
                          <span
                            className={stageObj?.badgeClass || "badge-neutral"}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "9999px",
                            }}
                          >
                            {stageObj?.name || "New Leads"}
                          </span>
                        </td>
                        <td style={{ color: "#6b7280" }}>{formatDate(q.createdAt)}</td>
                        <td>
                          <button
                            onClick={() => {
                              if (match) setInspectedItem(match);
                            }}
                            style={{
                              background: "#f9fafb",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              fontSize: "11.5px",
                              fontWeight: 600,
                              color: "#374151",
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================
          5. TAB C: INQUIRIES FEED
          ====================================================================== */}
      {activeTab === "inquiries" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
              Client Messages & Inquiries
            </h3>
            <p style={{ fontSize: "12.5px", color: "#6b7280", margin: "2px 0 0 0" }}>
              Direct submissions from the contact page.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {enquiries.map((e) => (
              <div
                key={e._id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "18px",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "8px",
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
                    {e.name}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {formatDate(e.createdAt)}
                  </span>
                </div>

                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>
                  <a href={`mailto:${e.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                    {e.email}
                  </a>
                  {e.mobile && ` · ${e.mobile}`}
                </div>

                {e.services && (
                  <div style={{ fontSize: "11.5px", marginBottom: "8px" }}>
                    <strong>Service:</strong> <span style={{ color: "#4b5563" }}>{e.services}</span>
                  </div>
                )}

                {e.message && (
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "#374151",
                      background: "#f9fafb",
                      padding: "10px",
                      borderRadius: "6px",
                      lineHeight: 1.45,
                      marginBottom: "12px",
                    }}
                  >
                    "{e.message}"
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={`mailto:${e.email}?subject=Yashmeen%20Fit-Out%20Follow-up`}
                    style={{
                      background: "#18181b",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Reply via Email
                  </a>
                  {e.mobile && (
                    <a
                      href={`tel:${e.mobile}`}
                      style={{
                        background: "#ffffff",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================================
          6. TAB D: STUDIO DIRECTORY SETTINGS
          ====================================================================== */}
      {activeTab === "directory" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
              Atelier Directory & Public Profile
            </h3>
            <p style={{ fontSize: "12.5px", color: "#6b7280", margin: "2px 0 0 0" }}>
              Official contact numbers, address, and channels displayed across the website.
            </p>
          </div>

          <form onSubmit={handleSettingsSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "24px",
              }}
            >
              {/* Address */}
              <div
                style={{
                  border: "1px solid #f3f4f6",
                  borderRadius: "10px",
                  padding: "18px",
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: 700, marginBottom: "14px", color: "#374151" }}>
                  Physical Location
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label>Street / Building</label>
                  <input
                    type="text"
                    value={details.address?.street || ""}
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label>City / Emirate</label>
                    <input
                      type="text"
                      value={details.address?.city || ""}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label>Postal Code / P.O. Box</label>
                    <input
                      type="text"
                      value={details.address?.zipCode || ""}
                      onChange={(e) =>
                        setDetails((prev) => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value },
                        }))
                      }
                      style={{ width: "100%", marginTop: "4px" }}
                    />
                  </div>
                </div>
                <div>
                  <label>Country</label>
                  <input
                    type="text"
                    value={details.address?.country || "United Arab Emirates"}
                    onChange={(e) =>
                      setDetails((prev) => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Contact */}
              <div
                style={{
                  border: "1px solid #f3f4f6",
                  borderRadius: "10px",
                  padding: "18px",
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: 700, marginBottom: "14px", color: "#374151" }}>
                  Direct Contact Lines
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label>Official Email</label>
                  <input
                    type="email"
                    value={details.email || ""}
                    onChange={(e) => {
                      setDetails((prev) => ({ ...prev, email: e.target.value }));
                      setSettingsErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                  {settingsErrors.email && (
                    <div style={{ color: "#dc2626", fontSize: "11px", marginTop: "4px" }}>
                      {settingsErrors.email}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label>Phone / Mobile</label>
                  <input
                    type="text"
                    value={details.mobile || ""}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, mobile: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>WhatsApp Business</label>
                  <input
                    type="text"
                    value={details.whatsapp || ""}
                    onChange={(e) =>
                      setDetails((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <button
                type="submit"
                disabled={savingSettings}
                style={{
                  background: "#18181b",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {savingSettings ? "Saving..." : "Save Directory Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================================
          7. SLIDE-OVER INSPECTION SHEET (SOFT & SOOTHING)
          ====================================================================== */}
      {inspectedItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setInspectedItem(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              height: "100%",
              overflowY: "auto",
              padding: "32px 28px",
              boxShadow: "-8px 0 28px rgba(0, 0, 0, 0.12)",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingBottom: "18px",
                borderBottom: "1px solid #f3f4f6",
                marginBottom: "20px",
              }}
            >
              <div>
                <span
                  className={inspectedItem.badgeStyle}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "9999px",
                  }}
                >
                  {inspectedItem.typeBadge}
                </span>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#18181b",
                    margin: "10px 0 2px 0",
                  }}
                >
                  {inspectedItem.title}
                </h2>
                <div style={{ fontSize: "12.5px", color: "#6b7280" }}>
                  {inspectedItem.subtitle}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedItem(null)}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={15} color="#4b5563" />
              </button>
            </div>

            {/* Pipeline Stage Shifter */}
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: "10px",
                }}
              >
                Pipeline Stage Position
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {STAGES.map((stg) => {
                  const isCurrent = inspectedItem.stage === stg.id;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => {
                        updateItemStage(inspectedItem.id, stg.id, inspectedItem.title);
                        setInspectedItem((prev) => ({ ...prev, stage: stg.id }));
                      }}
                      style={{
                        background: isCurrent ? "#18181b" : "#ffffff",
                        color: isCurrent ? "#ffffff" : "#4b5563",
                        border: isCurrent ? "1px solid #18181b" : "1px solid #d1d5db",
                        borderRadius: "6px",
                        padding: "5px 10px",
                        fontSize: "11.5px",
                        fontWeight: isCurrent ? 600 : 500,
                        cursor: "pointer",
                      }}
                    >
                      {stg.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Details Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Location</div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>
                  {inspectedItem.location}
                </div>
              </div>
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Budget Estimate</div>
                <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>
                  {inspectedItem.budget || "Custom"}
                </div>
              </div>
            </div>

            {/* Direct Contact */}
            {(inspectedItem.email || inspectedItem.mobile) && (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  Client Contact
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                  {inspectedItem.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiMail size={13} color="#9ca3af" />
                      <a
                        href={`mailto:${inspectedItem.email}`}
                        style={{ color: "#2563eb", textDecoration: "none" }}
                      >
                        {inspectedItem.email}
                      </a>
                    </div>
                  )}
                  {inspectedItem.mobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <FiPhone size={13} color="#9ca3af" />
                      <a
                        href={`tel:${inspectedItem.mobile}`}
                        style={{ color: "#374151", textDecoration: "none" }}
                      >
                        {inspectedItem.mobile}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brief Notes */}
            {inspectedItem.message && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  Brief & Notes
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    background: "#f9fafb",
                    padding: "14px",
                    borderRadius: "8px",
                    lineHeight: 1.5,
                  }}
                >
                  "{inspectedItem.message}"
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
              {inspectedItem.email && (
                <a
                  href={`mailto:${inspectedItem.email}?subject=Yashmeen%20Fit-Out%20Brief%20Follow-up`}
                  style={{
                    flex: 1,
                    background: "#18181b",
                    color: "#ffffff",
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Send Proposal ↗
                </a>
              )}
              {inspectedItem.mobile && (
                <a
                  href={`tel:${inspectedItem.mobile}`}
                  style={{
                    background: "#ffffff",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          8. QUICK ADD LEAD MODAL (SOFT & CLEAN)
          ====================================================================== */}
      {quickAddOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
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
              maxWidth: "480px",
              background: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
                  Create New Lead / Deal
                </h3>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>
                  Log a prospective client or custom fit-out project.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickAddOpen(false)}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={14} color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div style={{ marginBottom: "12px" }}>
                <label>Lead / Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Palm Jumeirah Penthouse Fit-Out"
                  value={newLeadForm.title}
                  onChange={(e) =>
                    setNewLeadForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label>Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Emaar Private Client"
                    value={newLeadForm.client}
                    onChange={(e) =>
                      setNewLeadForm((prev) => ({ ...prev, client: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Pipeline Stage</label>
                  <select
                    value={newLeadForm.stage}
                    onChange={(e) =>
                      setNewLeadForm((prev) => ({ ...prev, stage: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai Hills"
                    value={newLeadForm.location}
                    onChange={(e) =>
                      setNewLeadForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Budget Estimate</label>
                  <input
                    type="text"
                    placeholder="e.g. Under AED 250,000"
                    value={newLeadForm.budget}
                    onChange={(e) =>
                      setNewLeadForm((prev) => ({ ...prev, budget: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label>Brief / Scope Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key requirements, joinery scope, MEP specifications..."
                  value={newLeadForm.notes}
                  onChange={(e) =>
                    setNewLeadForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "#18181b",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Create Lead
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  FiColumns,
  FiGrid,
  FiLayers,
  FiActivity,
  FiSend,
} from "react-icons/fi";

const KANBAN_STAGES = [
  {
    id: "intake",
    index: "01",
    title: "INTAKE & BRIEFS",
    subtitle: "New client submissions & incoming briefs",
  },
  {
    id: "estimation",
    index: "02",
    title: "ESTIMATION & MEP",
    subtitle: "CAD drafting, spatial costing & MEP site surveys",
  },
  {
    id: "proposal",
    index: "03",
    title: "CLIENT PROPOSALS",
    subtitle: "Turnkey fit-out quotes sent & negotiations",
  },
  {
    id: "production",
    index: "04",
    title: "ATELIER PRODUCTION",
    subtitle: "Joinery fabrication & active on-site fit-out",
  },
  {
    id: "delivered",
    index: "05",
    title: "ARCHIVED & DELIVERED",
    subtitle: "Handed over spaces & catalogued archives",
  },
];

const TABS = [
  { id: "kanban", num: "(01)", label: "CMS KANBAN PIPELINE" },
  { id: "telemetry", num: "(02)", label: "CAD TELEMETRY & FEEDS" },
  { id: "quotes", num: "(03)", label: "COMMISSIONS" },
  { id: "enquiries", num: "(04)", label: "INQUIRIES" },
  { id: "projects", num: "(05)", label: "SPATIAL PORTFOLIO" },
  { id: "settings", num: "(06)", label: "ATELIER DIRECTORY" },
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

const formatTime = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("kanban");

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

  // Custom Atelier Dispatches (stored locally)
  const [customDispatches, setCustomDispatches] = useState(() => {
    try {
      const saved = localStorage.getItem("yashmeen_custom_dispatches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Kanban filters & drag state
  const [kanbanFilter, setKanbanFilter] = useState("ALL");
  const [kanbanSearch, setKanbanSearch] = useState("");
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  // Selected item inspection drawer
  const [inspectedItem, setInspectedItem] = useState(null);

  // Quick Add Dispatch Modal
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddStage, setQuickAddStage] = useState("intake");
  const [newDispatchForm, setNewDispatchForm] = useState({
    title: "",
    client: "",
    type: "COMMISSION BRIEF",
    location: "Dubai, UAE",
    budget: "Under AED 150,000",
    scope: "",
    notes: "",
  });

  // Dedicated Tab Filters
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("ALL");
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

  // Sync stageMap to localStorage
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

    const targetStage = KANBAN_STAGES.find((s) => s.id === targetStageId);
    toast.success(`Moved "${itemTitle}" to ${targetStage?.title || targetStageId}`);
  };

  // Convert raw Mongo items + custom items into Unified Kanban Items
  const allKanbanItems = useMemo(() => {
    const list = [];

    // 1. Quotes
    quotes.forEach((q) => {
      const id = `quote-${q._id}`;
      const assignedStage = stageMap[id] || "intake";
      list.push({
        id,
        rawId: q._id,
        itemType: "QUOTE",
        typeBadge: "COMMISSION BRIEF",
        title: q.name || "Untitled Commission",
        client: q.name,
        subtitle: q.projectType ? `${q.projectType} Fit-Out` : "Bespoke Fit-Out",
        location: q.location || "Dubai, UAE",
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
      const assignedStage = stageMap[id] || "intake";
      list.push({
        id,
        rawId: e._id,
        itemType: "ENQUIRY",
        typeBadge: "CLIENT INQUIRY",
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
      });
    });

    // 3. Projects (Sample first 10 for Kanban production flow)
    projects.slice(0, 10).forEach((p, idx) => {
      const id = `project-${p._id}`;
      // default projects across estimation, proposal, production, delivered
      const defaultProjectStage =
        idx % 4 === 0
          ? "production"
          : idx % 4 === 1
          ? "estimation"
          : idx % 4 === 2
          ? "proposal"
          : "delivered";

      const assignedStage = stageMap[id] || defaultProjectStage;
      list.push({
        id,
        rawId: p._id,
        itemType: "PROJECT",
        typeBadge: "SPATIAL WORK",
        title: p.title || "Spatial Project",
        client: "Yashmeen Atelier Archive",
        subtitle: p.category || "Fit-Out & Joinery",
        location: p.location || "Dubai, UAE",
        budget: "Architectural Commission",
        image: p.image,
        services: ["Spatial Architecture", "Joinery & MEP"],
        message: p.description || "",
        email: details.email || "info@yfbfitoutcontracting.com",
        mobile: details.mobile || "+971543862870",
        timeline: "Completed or In-Build",
        date: p.createdAt,
        stage: assignedStage,
      });
    });

    // 4. Custom Dispatches
    customDispatches.forEach((c) => {
      const id = `custom-${c.id}`;
      const assignedStage = stageMap[id] || c.stage || "intake";
      list.push({
        id,
        rawId: c.id,
        itemType: "CUSTOM",
        typeBadge: c.type || "ATELIER DISPATCH",
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
      });
    });

    return list;
  }, [quotes, enquiries, projects, customDispatches, stageMap, details]);

  // Filtered items based on filter chips & search input
  const filteredKanbanItems = useMemo(() => {
    return allKanbanItems.filter((item) => {
      // Type filter
      if (kanbanFilter === "COMMISSIONS" && item.itemType !== "QUOTE") return false;
      if (kanbanFilter === "INQUIRIES" && item.itemType !== "ENQUIRY") return false;
      if (kanbanFilter === "PROJECTS" && item.itemType !== "PROJECT") return false;
      if (kanbanFilter === "CUSTOM" && item.itemType !== "CUSTOM") return false;

      // Search query
      if (kanbanSearch.trim()) {
        const query = kanbanSearch.toLowerCase();
        const match =
          (item.title && item.title.toLowerCase().includes(query)) ||
          (item.client && item.client.toLowerCase().includes(query)) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query)) ||
          (item.location && item.location.toLowerCase().includes(query)) ||
          (item.email && item.email.toLowerCase().includes(query)) ||
          (item.message && item.message.toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });
  }, [allKanbanItems, kanbanFilter, kanbanSearch]);

  // Group items by stage column
  const kanbanColumns = useMemo(() => {
    return KANBAN_STAGES.map((stage) => {
      const itemsInStage = filteredKanbanItems.filter(
        (item) => item.stage === stage.id
      );
      return {
        ...stage,
        items: itemsInStage,
      };
    });
  }, [filteredKanbanItems]);

  // Drag and Drop Handlers
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

  const handleDragLeave = (e, colId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain") || draggingItemId;
    setDragOverColId(null);
    setDraggingItemId(null);

    if (!itemId) return;
    const item = allKanbanItems.find((i) => i.id === itemId);
    if (item && item.stage !== targetColId) {
      updateItemStage(itemId, targetColId, item.title);
    }
  };

  // Step Move Handler (Left / Right arrows)
  const handleStepMove = (item, direction) => {
    const currentIndex = KANBAN_STAGES.findIndex((s) => s.id === item.stage);
    if (currentIndex === -1) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < KANBAN_STAGES.length) {
      const targetStage = KANBAN_STAGES[newIndex];
      updateItemStage(item.id, targetStage.id, item.title);
    }
  };

  // Quick Add Dispatch submission
  const handleCreateDispatch = (e) => {
    e.preventDefault();
    if (!newDispatchForm.title.trim()) {
      toast.error("Please enter a dispatch title or project name.");
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
      notes: newDispatchForm.notes.trim() || "Logged from Atelier Command console.",
      createdAt: new Date().toISOString(),
      stage: quickAddStage,
    };

    const updated = [newEntry, ...customDispatches];
    setCustomDispatches(updated);
    try {
      localStorage.setItem("yashmeen_custom_dispatches", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    // Assign stage in stageMap
    updateItemStage(`custom-${newEntry.id}`, quickAddStage, newEntry.title);
    setQuickAddOpen(false);
    setNewDispatchForm({
      title: "",
      client: "",
      type: "COMMISSION BRIEF",
      location: "Dubai, UAE",
      budget: "Under AED 150,000",
      scope: "",
      notes: "",
    });
    toast.success(`Logged "${newEntry.title}" onto Kanban board.`);
  };

  // Dedicated Tab Data Handlers
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

  // Settings handlers
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
      await webDetailsAPI.update(details);
      toast.success("Atelier directory & contact profile updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update atelier directory.");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* ======================================================================
          TOP MANIFESTO & REAL-TIME ARCHITECTURAL TELEMETRY
          ====================================================================== */}
      <section
        style={{
          borderBottom: "1px solid #111111",
          paddingBottom: "32px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              fontFamily: "Outfit, 'Plus Jakarta Sans', monospace",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#555555",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#000000",
                display: "inline-block",
                boxShadow: "0 0 0 2px rgba(0,0,0,0.15)",
              }}
            />
            (AL QUOZ ATELIER · CMS ARCHITECTURAL PIPELINE)
          </div>

          {/* Quick Action: New Dispatch */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => {
                setQuickAddStage("intake");
                setQuickAddOpen(true);
              }}
              style={{
                background: "#000000",
                color: "#ffffff",
                border: "1px solid #000000",
                borderRadius: "9999px",
                padding: "8px 18px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#000000";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#000000";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FiPlus size={14} />
              + NEW CMS DISPATCH
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            alignItems: "end",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(32px, 4.5vw, 54px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.02,
                color: "#000000",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              CMS KANBAN PIPELINE
            </h1>
            <p
              style={{
                fontSize: "14.5px",
                color: "#444444",
                lineHeight: 1.6,
                marginTop: "12px",
                maxWidth: "680px",
                marginBottom: 0,
              }}
            >
              Smooth workflow pipeline for quotation commissions, client inquiries,
              and bespoke Al Quoz fit-out production. Drag items between columns to
              advance stages in real time.
            </p>
          </div>

          {/* Quick Stage Stats Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
              gap: "8px",
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.14)",
              borderRadius: "10px",
              padding: "12px 14px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            {KANBAN_STAGES.map((stg) => {
              const count = allKanbanItems.filter((i) => i.stage === stg.id).length;
              return (
                <div
                  key={stg.id}
                  style={{
                    textAlign: "center",
                    borderRight: "1px solid rgba(0,0,0,0.08)",
                    padding: "4px 8px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Outfit, monospace",
                      fontSize: "10px",
                      fontWeight: 800,
                      color: "#666666",
                    }}
                  >
                    {stg.index}
                  </div>
                  <div
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "20px",
                      fontWeight: 900,
                      color: "#000000",
                      lineHeight: 1.2,
                    }}
                  >
                    {count}
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#888888",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stg.title.split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================================
          CONTROLLER NAVIGATION TABS (BRUTALIST EDITORIAL PILLS)
          ====================================================================== */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "14px",
          marginBottom: "28px",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: "Outfit, 'Plus Jakarta Sans', monospace",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "10px 18px",
                borderRadius: "9999px",
                border: "1px solid #000000",
                background: isActive ? "#000000" : "#ffffff",
                color: isActive ? "#ffffff" : "#000000",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: isActive
                  ? "0 4px 12px rgba(0,0,0,0.14)"
                  : "0 2px 6px rgba(0,0,0,0.03)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f0f0ef";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <span
                style={{
                  color: isActive ? "rgba(255,255,255,0.7)" : "#777777",
                  fontSize: "10px",
                }}
              >
                {tab.num}
              </span>
              <span>{tab.label}</span>
              {tab.id === "kanban" && (
                <span
                  style={{
                    background: isActive ? "#ffffff" : "#000000",
                    color: isActive ? "#000000" : "#ffffff",
                    borderRadius: "9999px",
                    padding: "2px 7px",
                    fontSize: "10px",
                    fontWeight: 800,
                  }}
                >
                  {allKanbanItems.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================================
          TAB 1: CMS KANBAN BOARD (SMOOTH SOFT ANIMATED PIPELINE)
          ====================================================================== */}
      {activeTab === "kanban" && (
        <section>
          {/* Kanban Filter & Search Control Bar */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.14)",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            {/* Filter Pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                  marginRight: "4px",
                }}
              >
                FILTER BY:
              </span>
              {[
                { id: "ALL", label: `ALL PIPELINE (${allKanbanItems.length})` },
                {
                  id: "COMMISSIONS",
                  label: `COMMISSIONS (${quotes.length})`,
                },
                {
                  id: "INQUIRIES",
                  label: `INQUIRIES (${enquiries.length})`,
                },
                {
                  id: "PROJECTS",
                  label: `SPATIAL PROJECTS (${Math.min(projects.length, 10)})`,
                },
                {
                  id: "CUSTOM",
                  label: `CUSTOM (${customDispatches.length})`,
                },
              ].map((flt) => {
                const isSelected = kanbanFilter === flt.id;
                return (
                  <button
                    key={flt.id}
                    onClick={() => setKanbanFilter(flt.id)}
                    style={{
                      fontFamily: "Outfit, monospace",
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      border: "1px solid",
                      borderColor: isSelected ? "#000000" : "rgba(0,0,0,0.15)",
                      background: isSelected ? "#000000" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#333333",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "#000000";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                    }}
                  >
                    {flt.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div
              style={{
                position: "relative",
                minWidth: "260px",
                maxWidth: "360px",
                flex: "1 1 260px",
              }}
            >
              <FiSearch
                size={14}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#777777",
                }}
              />
              <input
                type="text"
                placeholder="Search pipeline by client, location, brief..."
                value={kanbanSearch}
                onChange={(e) => setKanbanSearch(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "38px",
                  paddingRight: "14px",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                  fontSize: "13px",
                  border: "1px solid rgba(0,0,0,0.18)",
                  borderRadius: "9999px",
                  background: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Kanban Multi-Column Track */}
          <div className="kanban-board-scroll">
            {kanbanColumns.map((col) => {
              const isOver = dragOverColId === col.id;
              return (
                <div
                  key={col.id}
                  className={`kanban-column-box ${isOver ? "drag-over" : ""}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  {/* Column Header */}
                  <div className="kanban-column-header">
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "3px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "Outfit, monospace",
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#666666",
                          }}
                        >
                          ({col.index})
                        </span>
                        <h3
                          style={{
                            fontFamily: "Outfit, sans-serif",
                            fontSize: "13.5px",
                            fontWeight: 900,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                            margin: 0,
                            color: "#000000",
                          }}
                        >
                          {col.title}
                        </h3>
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#777777",
                          lineHeight: 1.3,
                        }}
                      >
                        {col.subtitle}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Outfit, monospace",
                          fontSize: "11px",
                          fontWeight: 800,
                          background: "#000000",
                          color: "#ffffff",
                          borderRadius: "9999px",
                          padding: "3px 8px",
                        }}
                      >
                        {col.items.length}
                      </span>
                      <button
                        title={`Add dispatch to ${col.title}`}
                        onClick={() => {
                          setQuickAddStage(col.id);
                          setQuickAddOpen(true);
                        }}
                        style={{
                          background: "#ffffff",
                          border: "1px solid rgba(0,0,0,0.2)",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#000000",
                          transition: "all 0.18s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#000000";
                          e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#ffffff";
                          e.currentTarget.style.color = "#000000";
                        }}
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div
                    style={{
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                      flex: 1,
                    }}
                  >
                    {col.items.length === 0 ? (
                      <div
                        style={{
                          border: "1px dashed rgba(0,0,0,0.18)",
                          borderRadius: "8px",
                          padding: "36px 16px",
                          textAlign: "center",
                          color: "#888888",
                          fontSize: "12px",
                          background: "#fafaf9",
                          marginTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "Outfit, monospace",
                            fontSize: "18px",
                            marginBottom: "6px",
                            color: "#bbbbbb",
                          }}
                        >
                          +
                        </div>
                        <div>No briefs in this stage</div>
                        <div style={{ fontSize: "10.5px", marginTop: "4px" }}>
                          Drag a card here or click + to add
                        </div>
                      </div>
                    ) : (
                      col.items.map((item, idx) => {
                        const isDragging = draggingItemId === item.id;
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            className={`kanban-card-item kanban-card-animated ${
                              isDragging ? "is-dragging" : ""
                            }`}
                            style={{
                              animationDelay: `${idx * 0.04}s`,
                            }}
                          >
                            {/* Card Top: Type Badge & Date */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "6px",
                                marginBottom: "10px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "Outfit, monospace",
                                  fontSize: "9.5px",
                                  fontWeight: 800,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  padding: "3px 8px",
                                  borderRadius: "9999px",
                                  border: "1px solid #000000",
                                  background: "#ffffff",
                                  color: "#000000",
                                }}
                              >
                                {item.typeBadge}
                              </span>
                              <span
                                style={{
                                  fontSize: "10.5px",
                                  color: "#777777",
                                  fontFamily: "Outfit, monospace",
                                }}
                              >
                                {formatDate(item.date)}
                              </span>
                            </div>

                            {/* Optional Project Thumbnail */}
                            {item.image && (
                              <div
                                style={{
                                  width: "100%",
                                  height: "110px",
                                  borderRadius: "6px",
                                  overflow: "hidden",
                                  marginBottom: "10px",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                  background: "#111111",
                                }}
                              >
                                <img
                                  src={imageUrl(item.image)}
                                  alt={item.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    e.target.src = "/static/hero-aperture.png";
                                  }}
                                />
                              </div>
                            )}

                            {/* Client & Title */}
                            <h4
                              style={{
                                fontFamily: "Outfit, 'Plus Jakarta Sans', sans-serif",
                                fontSize: "14px",
                                fontWeight: 800,
                                color: "#000000",
                                margin: "0 0 4px 0",
                                lineHeight: 1.3,
                              }}
                            >
                              {item.title}
                            </h4>

                            <div
                              style={{
                                fontSize: "12px",
                                color: "#555555",
                                marginBottom: "8px",
                              }}
                            >
                              {item.subtitle}
                            </div>

                            {/* Location & Budget Tags */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flexWrap: "wrap",
                                fontSize: "11px",
                                color: "#444444",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <FiMapPin size={11} color="#666666" />
                                {item.location}
                              </span>
                              {item.budget && (
                                <span
                                  style={{
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: "#f0f0ef",
                                    fontWeight: 600,
                                    fontSize: "10px",
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
                                  fontSize: "11.5px",
                                  color: "#666666",
                                  lineHeight: 1.45,
                                  marginBottom: "14px",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  fontStyle: "italic",
                                  borderLeft: "2px solid #000000",
                                  paddingLeft: "8px",
                                }}
                              >
                                "{item.message}"
                              </div>
                            )}

                            {/* Card Footer: Stage Step Movers + Inspect Button */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "6px",
                                borderTop: "1px solid rgba(0,0,0,0.08)",
                                paddingTop: "10px",
                              }}
                            >
                              {/* Stage Mover Arrows */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <button
                                  title="Move to previous stage"
                                  disabled={col.id === "intake"}
                                  onClick={() => handleStepMove(item, -1)}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid rgba(0,0,0,0.18)",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: col.id === "intake" ? "not-allowed" : "pointer",
                                    opacity: col.id === "intake" ? 0.35 : 1,
                                    color: "#000000",
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (col.id !== "intake") {
                                      e.currentTarget.style.background = "#000000";
                                      e.currentTarget.style.color = "#ffffff";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (col.id !== "intake") {
                                      e.currentTarget.style.background = "#ffffff";
                                      e.currentTarget.style.color = "#000000";
                                    }
                                  }}
                                >
                                  <FiChevronLeft size={12} />
                                </button>
                                <button
                                  title="Move to next stage"
                                  disabled={col.id === "delivered"}
                                  onClick={() => handleStepMove(item, 1)}
                                  style={{
                                    background: "#ffffff",
                                    border: "1px solid rgba(0,0,0,0.18)",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    cursor: col.id === "delivered" ? "not-allowed" : "pointer",
                                    opacity: col.id === "delivered" ? 0.35 : 1,
                                    color: "#000000",
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (col.id !== "delivered") {
                                      e.currentTarget.style.background = "#000000";
                                      e.currentTarget.style.color = "#ffffff";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (col.id !== "delivered") {
                                      e.currentTarget.style.background = "#ffffff";
                                      e.currentTarget.style.color = "#000000";
                                    }
                                  }}
                                >
                                  <FiChevronRight size={12} />
                                </button>
                              </div>

                              {/* Inspect Full Brief Drawer */}
                              <button
                                onClick={() => setInspectedItem(item)}
                                style={{
                                  fontFamily: "Outfit, monospace",
                                  fontSize: "10px",
                                  fontWeight: 800,
                                  letterSpacing: "0.06em",
                                  textTransform: "uppercase",
                                  background: "#ffffff",
                                  border: "1px solid #000000",
                                  borderRadius: "9999px",
                                  padding: "4px 10px",
                                  cursor: "pointer",
                                  color: "#000000",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  transition: "all 0.18s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#000000";
                                  e.currentTarget.style.color = "#ffffff";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#ffffff";
                                  e.currentTarget.style.color = "#000000";
                                }}
                              >
                                INSPECT <FiArrowUpRight size={11} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================================
          TAB 2: CAD TELEMETRY & DISPATCH OVERVIEW
          ====================================================================== */}
      {activeTab === "telemetry" && (
        <section>
          {/* Bento Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                  marginBottom: "8px",
                }}
              >
                <span>COMMISSIONS</span>
                <span>↗</span>
              </div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "44px",
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1,
                  margin: "8px 0",
                }}
              >
                {quotes.length}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#888888" }}>
                QUOTATION BRIEFS LOGGED
              </div>
              {quotes[0] && (
                <div style={{ fontSize: "12px", color: "#333333", marginTop: "10px" }}>
                  Latest: <strong>{quotes[0].name}</strong>
                </div>
              )}
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                  marginBottom: "8px",
                }}
              >
                <span>INQUIRIES</span>
                <span>↗</span>
              </div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "44px",
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1,
                  margin: "8px 0",
                }}
              >
                {enquiries.length}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#888888" }}>
                ACTIVE CLIENT INQUIRIES
              </div>
              {enquiries[0] && (
                <div style={{ fontSize: "12px", color: "#333333", marginTop: "10px" }}>
                  Latest: <strong>{enquiries[0].name}</strong>
                </div>
              )}
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                  marginBottom: "8px",
                }}
              >
                <span>PORTFOLIO</span>
                <span>↗</span>
              </div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "44px",
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1,
                  margin: "8px 0",
                }}
              >
                {projects.length}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#888888" }}>
                SPATIAL WORKS ARCHIVED
              </div>
              <div style={{ fontSize: "12px", color: "#333333", marginTop: "10px" }}>
                Bespoke Commercial & Residential
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                  marginBottom: "8px",
                }}
              >
                <span>DIRECTORY</span>
                <span>↗</span>
              </div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#000000",
                  lineHeight: 1.2,
                  margin: "8px 0",
                }}
              >
                DUBAI, UAE
              </div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#888888" }}>
                PUBLIC PROFILE & CHANNELS
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#333333",
                  marginTop: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {details.email || "info@yfbfitoutcontracting.com"}
              </div>
            </div>
          </div>

          {/* Feeds: Quotes & Inquiries */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Recent Briefs Feed */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  paddingBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "Outfit, monospace",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#666666",
                    }}
                  >
                    (01)
                  </span>
                  <h3
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "14px",
                      fontWeight: 800,
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    RECENT COMMISSIONS & QUOTES
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("quotes")}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontFamily: "Outfit, monospace",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  VIEW ALL ↗
                </button>
              </div>

              {quotes.slice(0, 3).map((q) => (
                <div
                  key={q._id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "12px",
                    background: "#fdfdfd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <strong>{q.name}</strong>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        background: "#000000",
                        color: "#ffffff",
                        padding: "2px 7px",
                        borderRadius: "9999px",
                      }}
                    >
                      {q.projectType || "Commercial"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#555555", marginBottom: "8px" }}>
                    {q.location || "Dubai"} · {q.budget || "Custom"} · {formatDate(q.createdAt)}
                  </div>
                  {q.message && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#444444",
                        fontStyle: "italic",
                        lineHeight: 1.45,
                      }}
                    >
                      "{q.message.slice(0, 160)}..."
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Inquiries Feed */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.14)",
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  paddingBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: "Outfit, monospace",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#666666",
                    }}
                  >
                    (02)
                  </span>
                  <h3
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: "14px",
                      fontWeight: 800,
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    RECENT CLIENT INQUIRIES
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("enquiries")}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontFamily: "Outfit, monospace",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  VIEW ALL ↗
                </button>
              </div>

              {enquiries.slice(0, 3).map((e) => (
                <div
                  key={e._id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "12px",
                    background: "#fdfdfd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <strong>{e.name}</strong>
                    <span style={{ fontSize: "11px", color: "#777777" }}>
                      {formatDate(e.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#555555", marginBottom: "8px" }}>
                    {e.email} · {e.mobile}
                  </div>
                  {e.message && (
                    <div style={{ fontSize: "12px", color: "#444444", fontStyle: "italic" }}>
                      "{e.message}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================
          TAB 3: COMMISSIONS (DEDICATED TABLE REGISTER)
          ====================================================================== */}
      {activeTab === "quotes" && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                }}
              >
                (COMMISSIONS REGISTER · 03)
              </div>
              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "22px",
                  fontWeight: 900,
                  margin: "4px 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                CLIENT QUOTATION COMMISSIONS
              </h2>
            </div>
            <button
              onClick={handleDeleteOldQuotes}
              style={{
                background: "#ffffff",
                border: "1px solid #000000",
                borderRadius: "9999px",
                padding: "8px 18px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              PURGE OLDER THAN 1 MONTH
            </button>
          </div>

          {/* Search & Type filter */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Search commissions by client, location, or email…"
              value={quoteSearch}
              onChange={(e) => setQuoteSearch(e.target.value)}
              style={{
                flex: "1 1 300px",
                padding: "10px 16px",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "9999px",
                outline: "none",
                fontSize: "13px",
              }}
            />
            {["ALL", "COMMERCIAL", "RESIDENTIAL", "VILLA", "OFFICE"].map((typ) => (
              <button
                key={typ}
                onClick={() => setQuoteFilter(typ)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  border: "1px solid #000000",
                  background: quoteFilter === typ ? "#000000" : "#ffffff",
                  color: quoteFilter === typ ? "#ffffff" : "#000000",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {typ}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>CLIENT NAME</th>
                  <th>PROJECT TYPE</th>
                  <th>SERVICES REQUIRED</th>
                  <th>LOCATION</th>
                  <th>BUDGET</th>
                  <th>LOGGED DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px" }}>
                      No quotations match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q._id}>
                      <td style={{ fontWeight: 700 }}>{q.name}</td>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            background: "#000000",
                            color: "#ffffff",
                            fontSize: "10px",
                            fontWeight: 800,
                          }}
                        >
                          {q.projectType || "Bespoke"}
                        </span>
                      </td>
                      <td style={{ maxWidth: "220px" }}>
                        {Array.isArray(q.services) ? q.services.join(", ") : q.services || "-"}
                      </td>
                      <td>{q.location || "Dubai"}</td>
                      <td style={{ fontWeight: 600 }}>{q.budget || "Custom"}</td>
                      <td>{formatDate(q.createdAt)}</td>
                      <td>
                        <button
                          onClick={() => {
                            const found = allKanbanItems.find((i) => i.rawId === q._id);
                            if (found) setInspectedItem(found);
                          }}
                          style={{
                            background: "#ffffff",
                            border: "1px solid #000000",
                            borderRadius: "9999px",
                            padding: "4px 12px",
                            fontSize: "11px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ======================================================================
          TAB 4: INQUIRIES REGISTER
          ====================================================================== */}
      {activeTab === "enquiries" && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                }}
              >
                (COMMUNICATIONS REGISTER · 04)
              </div>
              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "22px",
                  fontWeight: 900,
                  margin: "4px 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                CLIENT INQUIRIES & MESSAGES
              </h2>
            </div>
            <button
              onClick={handleDeleteOldEnquiries}
              style={{
                background: "#ffffff",
                border: "1px solid #000000",
                borderRadius: "9999px",
                padding: "8px 18px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              PURGE OLD INQUIRIES
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search inquiries by client name, email, or message…"
              value={enquirySearch}
              onChange={(e) => setEnquirySearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "480px",
                padding: "10px 16px",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "9999px",
                outline: "none",
                fontSize: "13px",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredEnquiries.map((e) => (
              <div
                key={e._id}
                style={{
                  border: "1px solid rgba(0,0,0,0.14)",
                  borderRadius: "10px",
                  padding: "20px",
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
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 800 }}>
                    {e.name}
                  </h4>
                  <span style={{ fontSize: "11px", color: "#777777" }}>
                    {formatDate(e.createdAt)}
                  </span>
                </div>
                <div style={{ fontSize: "12.5px", color: "#555555", marginBottom: "12px" }}>
                  <a href={`mailto:${e.email}`} style={{ color: "#000000", fontWeight: 600 }}>
                    {e.email}
                  </a>
                  {e.mobile && ` · ${e.mobile}`}
                </div>
                {e.services && (
                  <div style={{ fontSize: "11.5px", fontWeight: 700, marginBottom: "8px" }}>
                    SERVICE: <span style={{ color: "#555555" }}>{e.services}</span>
                  </div>
                )}
                {e.message && (
                  <div
                    style={{
                      fontSize: "12.5px",
                      lineHeight: 1.5,
                      color: "#333333",
                      background: "#fafaf9",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "14px",
                    }}
                  >
                    "{e.message}"
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={`mailto:${e.email}?subject=Yashmeen%20Fit-Out%20Follow-up`}
                    style={{
                      background: "#000000",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "6px 14px",
                      fontSize: "10.5px",
                      fontWeight: 800,
                      textDecoration: "none",
                      textTransform: "uppercase",
                    }}
                  >
                    REPLY VIA EMAIL
                  </a>
                  {e.mobile && (
                    <a
                      href={`tel:${e.mobile}`}
                      style={{
                        background: "#ffffff",
                        color: "#000000",
                        border: "1px solid #000000",
                        borderRadius: "9999px",
                        padding: "6px 14px",
                        fontSize: "10.5px",
                        fontWeight: 800,
                        textDecoration: "none",
                        textTransform: "uppercase",
                      }}
                    >
                      CALL
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================================
          TAB 5: SPATIAL PORTFOLIO
          ====================================================================== */}
      {activeTab === "projects" && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Outfit, monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#666666",
                }}
              >
                (SPATIAL WORKS ARCHIVE · 05)
              </div>
              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "22px",
                  fontWeight: 900,
                  margin: "4px 0 0 0",
                  textTransform: "uppercase",
                }}
              >
                ACTIVE SPATIAL PORTFOLIO ({projects.length})
              </h2>
            </div>
            <Link
              to="/dashboard/project-manager"
              style={{
                background: "#000000",
                color: "#ffffff",
                border: "1px solid #000000",
                borderRadius: "9999px",
                padding: "8px 18px",
                fontSize: "11px",
                fontWeight: 800,
                textDecoration: "none",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              OPEN PROJECT MANAGER
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {projects.map((proj) => (
              <div
                key={proj._id}
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    height: "180px",
                    width: "100%",
                    background: "#111111",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={imageUrl(proj.image)}
                    alt={proj.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "/static/hero-aperture.png";
                    }}
                  />
                </div>
                <div style={{ padding: "16px" }}>
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: "#666666",
                      letterSpacing: "0.06em",
                      marginBottom: "4px",
                    }}
                  >
                    {proj.category || "Fit-Out"}
                  </div>
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#000000",
                    }}
                  >
                    {proj.title}
                  </h4>
                  <div style={{ fontSize: "12px", color: "#666666" }}>
                    {proj.location || "UAE"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================================
          TAB 6: ATELIER DIRECTORY & CONTACT SETTINGS
          ====================================================================== */}
      {activeTab === "settings" && (
        <section
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.14)",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontFamily: "Outfit, monospace",
                fontSize: "11px",
                fontWeight: 800,
                color: "#666666",
              }}
            >
              (PUBLIC IDENTITY & ATELIER · 06)
            </div>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "22px",
                fontWeight: 900,
                margin: "4px 0 0 0",
                textTransform: "uppercase",
              }}
            >
              ATELIER DIRECTORY & CONTACT SETTINGS
            </h2>
          </div>

          <form onSubmit={handleSettingsSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "28px",
              }}
            >
              {/* Location */}
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "10px",
                  padding: "20px",
                  background: "#fafaf9",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 800, marginBottom: "14px" }}>
                  (01) PHYSICAL LOCATION & ATELIER
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label>STREET / BUILDING DETAILS</label>
                  <input
                    type="text"
                    value={details.address?.street || ""}
                    onChange={setAddressField("street")}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label>CITY / EMIRATE</label>
                    <input
                      type="text"
                      value={details.address?.city || ""}
                      onChange={setAddressField("city")}
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                  <div>
                    <label>STATE / REGION</label>
                    <input
                      type="text"
                      value={details.address?.state || ""}
                      onChange={setAddressField("state")}
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label>POSTAL CODE / P.O. BOX</label>
                    <input
                      type="text"
                      value={details.address?.zipCode || ""}
                      onChange={setAddressField("zipCode")}
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                  <div>
                    <label>COUNTRY</label>
                    <input
                      type="text"
                      value={details.address?.country || "United Arab Emirates"}
                      onChange={setAddressField("country")}
                      style={{ width: "100%", marginTop: "6px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Public Contact */}
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: "10px",
                  padding: "20px",
                  background: "#fafaf9",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 800, marginBottom: "14px" }}>
                  (02) PUBLIC CONTACT LINES
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label>PUBLIC OFFICIAL EMAIL</label>
                  <input
                    type="email"
                    value={details.email || ""}
                    onChange={setContactField("email")}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                  {settingsErrors.email && (
                    <div style={{ color: "#d32f2f", fontSize: "11px", marginTop: "4px" }}>
                      {settingsErrors.email}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label>PHONE / MOBILE</label>
                  <input
                    type="text"
                    value={details.mobile || ""}
                    onChange={setContactField("mobile")}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div>
                  <label>WHATSAPP BUSINESS</label>
                  <input
                    type="text"
                    value={details.whatsapp || ""}
                    onChange={setContactField("whatsapp")}
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>
            </div>

            {/* Social channels */}
            <div
              style={{
                marginTop: "24px",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "10px",
                padding: "20px",
                background: "#fafaf9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 800 }}>
                  (03) DIGITAL CHANNELS & SOCIALS
                </div>
                <button
                  type="button"
                  onClick={addSocialLink}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #000000",
                    borderRadius: "9999px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ADD CHANNEL
                </button>
              </div>

              {details.socialLinks.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr 40px",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="text"
                    value={s.platform || ""}
                    placeholder="Platform"
                    onChange={setSocialField(idx, "platform")}
                  />
                  <input
                    type="text"
                    value={s.url || ""}
                    placeholder="URL"
                    onChange={setSocialField(idx, "url")}
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(idx)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(0,0,0,0.2)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiTrash2 size={14} color="#666666" />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                type="submit"
                disabled={savingSettings}
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  border: "1px solid #000000",
                  borderRadius: "9999px",
                  padding: "12px 28px",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {savingSettings ? "SAVING..." : "SAVE CHANGES ↗"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================================================
          SLIDE-OVER INSPECTION DRAWER (SMOOTH SOFT ANIMATED)
          ====================================================================== */}
      {inspectedItem && (
        <div
          className="kanban-drawer-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setInspectedItem(null)}
        >
          <div
            className="kanban-drawer-panel"
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              height: "100%",
              overflowY: "auto",
              padding: "36px 32px",
              boxShadow: "-12px 0 36px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                paddingBottom: "18px",
                marginBottom: "24px",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: "Outfit, monospace",
                    fontSize: "10.5px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    background: "#000000",
                    color: "#ffffff",
                  }}
                >
                  {inspectedItem.typeBadge}
                </span>
                <h2
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "24px",
                    fontWeight: 900,
                    margin: "12px 0 4px 0",
                    color: "#000000",
                  }}
                >
                  {inspectedItem.title}
                </h2>
                <div style={{ fontSize: "13px", color: "#666666" }}>
                  {inspectedItem.subtitle}
                </div>
              </div>

              <button
                onClick={() => setInspectedItem(null)}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.2)",
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

            {/* Quick Stage Shifter inside Drawer */}
            <div
              style={{
                background: "#fafaf9",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <label style={{ display: "block", marginBottom: "8px" }}>
                PIPELINE STAGE POSITION
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                {KANBAN_STAGES.map((stg) => {
                  const isCurrent = inspectedItem.stage === stg.id;
                  return (
                    <button
                      key={stg.id}
                      onClick={() => {
                        updateItemStage(inspectedItem.id, stg.id, inspectedItem.title);
                        setInspectedItem((prev) => ({ ...prev, stage: stg.id }));
                      }}
                      className="kanban-stage-pill"
                      style={{
                        fontFamily: "Outfit, monospace",
                        fontSize: "10.5px",
                        fontWeight: 800,
                        padding: "6px 12px",
                        borderRadius: "9999px",
                        border: "1px solid",
                        borderColor: isCurrent ? "#000000" : "rgba(0,0,0,0.2)",
                        background: isCurrent ? "#000000" : "#ffffff",
                        color: isCurrent ? "#ffffff" : "#000000",
                      }}
                    >
                      {stg.index} {stg.title.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specifications Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#888888" }}>
                  LOCATION
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, marginTop: "2px" }}>
                  {inspectedItem.location}
                </div>
              </div>
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#888888" }}>
                  BUDGET ESTIMATE
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, marginTop: "2px" }}>
                  {inspectedItem.budget || "Custom"}
                </div>
              </div>
            </div>

            {/* Client Contact Lines */}
            {(inspectedItem.email || inspectedItem.mobile) && (
              <div
                style={{
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "24px",
                  background: "#ffffff",
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 800, marginBottom: "10px" }}>
                  DIRECT CLIENT CONTACT
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  {inspectedItem.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FiMail size={14} color="#555555" />
                      <a
                        href={`mailto:${inspectedItem.email}`}
                        style={{ color: "#000000", fontWeight: 700 }}
                      >
                        {inspectedItem.email}
                      </a>
                    </div>
                  )}
                  {inspectedItem.mobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FiPhone size={14} color="#555555" />
                      <a
                        href={`tel:${inspectedItem.mobile}`}
                        style={{ color: "#000000", fontWeight: 700 }}
                      >
                        {inspectedItem.mobile}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scope / Services */}
            {inspectedItem.services && inspectedItem.services.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, marginBottom: "8px" }}>
                  SERVICES IN SCOPE
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {inspectedItem.services.map((srv, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        background: "#f0f0ef",
                        color: "#000000",
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Client Brief or Notes */}
            {inspectedItem.message && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, marginBottom: "8px" }}>
                  SPECIFICATION & BRIEF NOTES
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "#333333",
                    background: "#fafaf9",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  {inspectedItem.message}
                </div>
              </div>
            )}

            {/* Direct Outreach Trigger Buttons */}
            <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
              {inspectedItem.email && (
                <a
                  href={`mailto:${inspectedItem.email}?subject=Yashmeen%20Fit-Out%20Brief%20Follow-up`}
                  style={{
                    flex: 1,
                    background: "#000000",
                    color: "#ffffff",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  SEND PROPOSAL ↗
                </a>
              )}
              {inspectedItem.mobile && (
                <a
                  href={`tel:${inspectedItem.mobile}`}
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    border: "1px solid #000000",
                    padding: "12px 20px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: 800,
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  CALL CLIENT
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          QUICK ADD CMS DISPATCH MODAL
          ====================================================================== */}
      {quickAddOpen && (
        <div
          className="kanban-drawer-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
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
              maxWidth: "520px",
              background: "#ffffff",
              border: "1px solid #000000",
              borderRadius: "14px",
              padding: "28px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                paddingBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "Outfit, monospace",
                    fontSize: "10.5px",
                    fontWeight: 800,
                    color: "#666666",
                  }}
                >
                  (NEW DISPATCH LOG)
                </div>
                <h3
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "18px",
                    fontWeight: 900,
                    margin: "4px 0 0 0",
                    textTransform: "uppercase",
                  }}
                >
                  LOG CMS PIPELINE DISPATCH
                </h3>
              </div>
              <button
                onClick={() => setQuickAddOpen(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.2)",
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
              <div style={{ marginBottom: "14px" }}>
                <label>PROJECT / BRIEF TITLE *</label>
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
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label>CLIENT NAME</label>
                  <input
                    type="text"
                    placeholder="e.g. Emaar Private Client"
                    value={newDispatchForm.client}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, client: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div>
                  <label>DISPATCH TYPE</label>
                  <select
                    value={newDispatchForm.type}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, type: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  >
                    <option value="COMMISSION BRIEF">COMMISSION BRIEF</option>
                    <option value="CLIENT INQUIRY">CLIENT INQUIRY</option>
                    <option value="SPATIAL FIT-OUT">SPATIAL FIT-OUT</option>
                    <option value="ATELIER JOINERY">ATELIER JOINERY</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label>LOCATION</label>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Dubai"
                    value={newDispatchForm.location}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, location: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
                <div>
                  <label>BUDGET ESTIMATE</label>
                  <input
                    type="text"
                    placeholder="e.g. AED 250,000"
                    value={newDispatchForm.budget}
                    onChange={(e) =>
                      setNewDispatchForm((prev) => ({ ...prev, budget: e.target.value }))
                    }
                    style={{ width: "100%", marginTop: "6px" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label>INITIAL PIPELINE COLUMN</label>
                <select
                  value={quickAddStage}
                  onChange={(e) => setQuickAddStage(e.target.value)}
                  style={{ width: "100%", marginTop: "6px" }}
                >
                  {KANBAN_STAGES.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.index} · {stg.title}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>SPECIFICATION BRIEF & NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Key architectural requirements, MEP specs, or client notes..."
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
                  style={{
                    flex: 1,
                    background: "#000000",
                    color: "#ffffff",
                    border: "1px solid #000000",
                    borderRadius: "9999px",
                    padding: "12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  DISPATCH TO KANBAN BOARD ↗
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.2)",
                    borderRadius: "9999px",
                    padding: "12px 18px",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

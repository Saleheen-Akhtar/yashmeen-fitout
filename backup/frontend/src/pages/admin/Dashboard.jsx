import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  quoteAPI,
  enquiryAPI,
  projectAPI,
  categoryAPI,
  webDetailsAPI,
  itemPath,
} from "../../services/api";
import {
  DEFAULT_WEBSITE_CONTENT,
  notifyWebsiteContentUpdated,
} from "../../hooks/useWebsiteContent";
import {
  clearProjectsCache,
  clearProjectDetailsCache,
} from "../../lib/publicCache";
import { toast } from "sonner";
import useCreateStore from "../../store";
import {
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiPlay,
  FiPause,
  FiClock,
  FiLayers,
  FiBriefcase,
  FiFileText,
  FiMoreVertical,
  FiX,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSearch,
  FiGlobe,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";

const STAGES = [
  { id: "leads", name: "New Leads", badgeClass: "badge-lavender" },
  { id: "feasibility", name: "Feasibility & Costing", badgeClass: "badge-mist" },
  { id: "proposal", name: "Proposal & Quotes", badgeClass: "badge-amber" },
  { id: "construction", name: "In Construction", badgeClass: "badge-brass" },
  { id: "completed", name: "Completed & Handed Over", badgeClass: "badge-sage" },
];

const SERVICE_IMAGE_PRESETS = [
  { label: "Villa Aperture", value: "/static/hero-aperture-v2.webp" },
  { label: "Al Quoz Atelier", value: "/static/studio.jpg" },
  { label: "Joinery Bay", value: "/static/joinery-bay.jpg" },
  { label: "DIFC Office Fit-Out", value: "/static/Office-fit-out.jpg" },
  { label: "Luxury Residence", value: "/static/hero-editorial.webp" },
  { label: "Showroom Gallery", value: "/static/work-oh-office.jpg" },
];

const FALLBACK_PROJECT_IMG = "/static/hero-aperture-v2.webp";

const resolveImage = (img) => {
  if (!img) return FALLBACK_PROJECT_IMG;
  if (/^https?:\/\//i.test(img) || /^\/static\//i.test(img) || /^\/images\//i.test(img)) {
    return img;
  }
  return `${itemPath ?? "/uploads"}/${String(img).replace(/^\/+/, "")}`;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "YA";

const formatDateShort = (dateStr) => {
  if (!dateStr) return "Recent";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "Recent";
  }
};

const fetchDashboardBundle = async () => {
  const [qRes, eRes, pRes, cRes, wRes] = await Promise.allSettled([
    quoteAPI.getAll({ limit: 100 }),
    enquiryAPI.getAll(),
    projectAPI.getAll({ limit: 100 }),
    categoryAPI.getAll(),
    webDetailsAPI.details(),
  ]);

  let mergedWeb = null;
  if (wRes.status === "fulfilled" && wRes.value?.data?.data) {
    const w = wRes.value.data.data;
    mergedWeb = {
      ...DEFAULT_WEBSITE_CONTENT,
      ...w,
      address: { ...DEFAULT_WEBSITE_CONTENT.address, ...(w.address || {}) },
      hero: { ...DEFAULT_WEBSITE_CONTENT.hero, ...(w.hero || {}) },
      studio: { ...DEFAULT_WEBSITE_CONTENT.studio, ...(w.studio || {}) },
      services:
        Array.isArray(w.services) && w.services.length > 0
          ? w.services
          : DEFAULT_WEBSITE_CONTENT.services,
      crmTasks: Array.isArray(w.crmTasks) ? w.crmTasks : [],
      calendarEvents: Array.isArray(w.calendarEvents) ? w.calendarEvents : [],
    };
  }

  return {
    quotes: qRes.status === "fulfilled" ? qRes.value?.data?.data || qRes.value?.data || [] : null,
    enquiries: eRes.status === "fulfilled" ? eRes.value?.data?.data || eRes.value?.data || [] : null,
    projects: pRes.status === "fulfilled" ? pRes.value?.data?.data || [] : null,
    categories: cRes.status === "fulfilled" ? cRes.value?.data?.data || cRes.value?.data || [] : null,
    webDetails: mergedWeb,
  };
};

export default function Dashboard() {
  const { user } = useCreateStore();
  const location = useLocation();

  // Remote MongoDB State
  const [quotes, setQuotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [webDetails, setWebDetails] = useState(DEFAULT_WEBSITE_CONTENT);
  const webDetailsRef = useRef(DEFAULT_WEBSITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [savingCms, setSavingCms] = useState(false);

  // Interactive Bento Widgets State
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState("services");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(155); // 02:35 display match
  const [monthOffset, setMonthOffset] = useState(0);

  // Lower Section Tab State
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' | 'services' | 'kanban' | 'leads'
  const [searchQuery, setSearchQuery] = useState("");
  const [stageMap, setStageMap] = useState(() => {
    try {
      const saved = localStorage.getItem("yashmeen_crm_stages");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [draggedId, setDraggedId] = useState(null);

  // Modals & Drawers State
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    categoryId: "",
    size: "",
    location: "Dubai, UAE",
    scope: "Turnkey Design & Fit-Out",
    sector: "Commercial",
    description: "",
  });
  const [projectFiles, setProjectFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef = useRef(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceIdx, setEditingServiceIdx] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    slug: "",
    eyebrow: "",
    shortDesc: "",
    description: "",
    image: "/static/studio.jpg",
    highlightsText: "",
    active: true,
  });

  const [siteModalOpen, setSiteModalOpen] = useState(() =>
    location.search.includes("open=site-settings")
  );
  const [siteForm, setSiteForm] = useState(DEFAULT_WEBSITE_CONTENT);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarForm, setCalendarForm] = useState({
    title: "",
    subtitle: "",
    dayIndex: 2,
    timeSlot: "10:00 am",
    variant: "dark",
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);

  const applyDashboardBundle = (bundle) => {
    if (bundle.quotes !== null) setQuotes(bundle.quotes);
    if (bundle.enquiries !== null) setEnquiries(bundle.enquiries);
    if (bundle.projects !== null) setProjects(bundle.projects);
    if (bundle.categories !== null) setCategories(bundle.categories);
    if (bundle.webDetails) {
      setWebDetails(bundle.webDetails);
      setSiteForm(bundle.webDetails);
    }
  };

  // Load All Live MongoDB Data
  const loadDashboardData = async () => {
    try {
      const bundle = await fetchDashboardBundle();
      applyDashboardBundle(bundle);
    } catch {
      toast.error("Could not refresh some CRM streams.");
    } finally {
      setLoading(false);
    }
  };

  const [prevSearch, setPrevSearch] = useState(location.search);
  if (prevSearch !== location.search) {
    setPrevSearch(location.search);
    if (location.search.includes("open=site-settings")) {
      setSiteForm(webDetails);
      setSiteModalOpen(true);
    }
  }

  useEffect(() => {
    webDetailsRef.current = webDetails;
  }, [webDetails]);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardBundle()
      .then((bundle) => {
        if (!cancelled) applyDashboardBundle(bundle);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not refresh some CRM streams.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const onOpenSettings = () => {
      setSiteForm(webDetailsRef.current);
      setSiteModalOpen(true);
    };
    window.addEventListener("open-cms-settings", onOpenSettings);
    return () => {
      cancelled = true;
      window.removeEventListener("open-cms-settings", onOpenSettings);
    };
  }, []);

  // Studio Session Stopwatch Effect
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [timerSeconds]);

  // Persist Kanban stage changes locally
  useEffect(() => {
    try {
      localStorage.setItem("yashmeen_crm_stages", JSON.stringify(stageMap));
    } catch {
      /* ignore */
    }
  }, [stageMap]);

  // Unified CRM Pipeline Items (Quotes + Enquiries + Recent Projects)
  const allCRMItems = useMemo(() => {
    const list = [];
    quotes.forEach((q) => {
      const id = `quote_${q._id}`;
      const servicesList = Array.isArray(q.services) ? q.services : [];
      const subtitleText = q.projectType
        ? `${q.projectType}${servicesList.length ? ` · ${servicesList.slice(0, 2).join(", ")}` : " Fit-Out"}`
        : servicesList.join(", ") || "Turnkey Brief";
      list.push({
        id,
        rawId: q._id,
        type: "quote",
        typeBadge: "Quote",
        badgeStyle: "badge-amber",
        title: q.name || "Untitled Brief",
        subtitle: subtitleText,
        location: q.location || "Dubai, UAE",
        budget: q.budget || "Custom Brief",
        timeline: q.timeline || "",
        servicesList,
        email: q.email,
        mobile: q.mobile,
        message: q.message || q.notes || q.specifications || q.details,
        date: q.createdAt,
        stage: stageMap[id] || "leads",
        initials: getInitials(q.name || "Q"),
      });
    });

    enquiries.forEach((e) => {
      const id = `enq_${e._id}`;
      list.push({
        id,
        rawId: e._id,
        type: "enquiry",
        typeBadge: "Inquiry",
        badgeStyle: "badge-lavender",
        title: e.name || "Client Inquiry",
        subtitle: e.services || "Interior & Fit-Out",
        location: "Dubai, UAE",
        budget: "Direct Web Form",
        email: e.email,
        mobile: e.mobile,
        message: e.message,
        date: e.createdAt,
        stage: stageMap[id] || "leads",
        initials: getInitials(e.name || "IN"),
      });
    });

    projects.slice(0, 6).forEach((p, idx) => {
      const id = `proj_${p._id}`;
      const defaultStage = idx % 2 === 0 ? "construction" : "completed";
      list.push({
        id,
        rawId: p._id,
        type: "project",
        typeBadge: "Live Work",
        badgeStyle: "badge-sage",
        title: p.title,
        subtitle: p.sector || "Architectural Works",
        location: p.location || "Dubai",
        budget: p.size || "Atelier Delivery",
        message: p.description,
        image: p.images?.[0],
        date: p.createdAt,
        stage: stageMap[id] || defaultStage,
        initials: getInitials(p.title),
      });
    });

    return list;
  }, [quotes, enquiries, projects, stageMap]);

  const filteredCRMItems = useMemo(() => {
    if (!searchQuery.trim()) return allCRMItems;
    const q = searchQuery.toLowerCase();
    return allCRMItems.filter(
      (i) =>
        (i.title || "").toLowerCase().includes(q) ||
        (i.subtitle || "").toLowerCase().includes(q) ||
        (i.location || "").toLowerCase().includes(q)
    );
  }, [allCRMItems, searchQuery]);

  // Derived Statistics & Progress Distributions
  const services = webDetails.services || DEFAULT_WEBSITE_CONTENT.services;
  const activeServicesCount = services.filter((s) => s.active !== false).length;
  const tasks =
    Array.isArray(webDetails.crmTasks) && webDetails.crmTasks.length > 0
      ? webDetails.crmTasks
      : [
          {
            id: "t-1",
            title: "Verify Al Quoz Joinery Drawings",
            subtitle: "Atelier · Today, 10:30 AM",
            completed: true,
          },
          {
            id: "t-2",
            title: "Sync Selected Website Works",
            subtitle: "Live Website · Published",
            completed: true,
          },
          {
            id: "t-3",
            title: "Review New Client Quotations",
            subtitle: `${quotes.length} Brief(s) awaiting review`,
            completed: false,
          },
          {
            id: "t-4",
            title: "Update Service Offerings Copy",
            subtitle: `${activeServicesCount} Live Disciplines`,
            completed: false,
          },
          {
            id: "t-5",
            title: "Publish Latest Project Case Study",
            subtitle: "Portfolio · Draft ready",
            completed: false,
          },
        ];

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const syncScore = tasks.length
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : 40;

  const calendarEvents =
    Array.isArray(webDetails.calendarEvents) && webDetails.calendarEvents.length > 0
      ? webDetails.calendarEvents
      : [
          {
            id: "ev-1",
            dayIndex: 1,
            timeSlot: "9:00 am",
            title: "Site Sync · Acacia Tower",
            subtitle: "Discuss fit-out progress & joinery",
            variant: "dark",
          },
          {
            id: "ev-2",
            dayIndex: 3,
            timeSlot: "10:00 am",
            title: "Client Consultation",
            subtitle: "Review architectural layout brief",
            variant: "light",
          },
        ];

  const featuredProj = projects[featuredIndex % Math.max(projects.length, 1)] || {
    title: "Atelier Showcase",
    sector: "Luxury Residential",
    location: "Dubai, UAE",
    size: "14,500 sq.ft",
    images: ["/static/hero-aperture-v2.webp"],
  };

  // Horizontal Capsule Strip Percentages (derived dynamically from real database totals)
  const totalEntities = Math.max(
    quotes.length + enquiries.length + projects.length + activeServicesCount,
    1
  );
  const leadsPct = Math.max(Math.round((enquiries.length / totalEntities) * 100), 12);
  const quotesPct = Math.max(Math.round((quotes.length / totalEntities) * 100), 14);
  const siteSyncPct = Math.max(
    100 - leadsPct - quotesPct - 10,
    Math.round(((projects.length + activeServicesCount) / totalEntities) * 100)
  );
  const outputPct = Math.max(100 - leadsPct - quotesPct - siteSyncPct, 10);

  // Weekly Bar Chart Data (7 days aligned to real pipeline & project cadence)
  const weeklyBars = useMemo(() => {
    const base = [
      { day: "S", count: 2, h: 28, highlight: false, label: "2 leads" },
      { day: "M", count: Math.max(enquiries.length + 2, 4), h: 52, highlight: false, label: `${enquiries.length + 2} leads` },
      { day: "T", count: Math.max(quotes.length + 3, 4), h: 46, highlight: false, label: `${quotes.length + 3} quotes` },
      { day: "W", count: 3, h: 34, highlight: false, label: "3 briefs" },
      { day: "T", count: Math.max(projects.length, 6), h: 66, highlight: false, label: `${projects.length} works` },
      { day: "F", count: Math.max(activeServicesCount + quotes.length + 3, 7), h: 86, highlight: true, label: `${projects.length} live` },
      { day: "S", count: 1, h: 22, highlight: false, label: "1 review" },
    ];
    return base;
  }, [enquiries.length, quotes.length, projects.length, activeServicesCount]);

  // Month Label & Days Calculation
  const currentCalendarDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { month: "long" });
    const prevD = new Date(currentCalendarDate);
    prevD.setMonth(prevD.getMonth() - 1);
    const nextD = new Date(currentCalendarDate);
    nextD.setMonth(nextD.getMonth() + 1);
    return {
      prev: fmt.format(prevD),
      curr: `${fmt.format(currentCalendarDate)} ${currentCalendarDate.getFullYear()}`,
      next: fmt.format(nextD),
    };
  }, [currentCalendarDate]);

  const weekColumns = useMemo(() => {
    const start = new Date();
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) + monthOffset * 7;
    const monday = new Date(start.setDate(diff));
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return { name, num: d.getDate() };
    });
  }, [monthOffset]);

  // Helper to save partial updates to WebDetails -> Live Website
  const saveWebDetailsPatch = async (patch, successMessage = "Published to live website") => {
    setSavingCms(true);
    try {
      const payload = { ...webDetails, ...patch };
      const res = await webDetailsAPI.update(patch);
      const updated = res?.data?.data ? { ...payload, ...res.data.data } : payload;
      setWebDetails(updated);
      setSiteForm(updated);
      notifyWebsiteContentUpdated(updated);
      toast.success(successMessage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to publish website update.");
    } finally {
      setSavingCms(false);
    }
  };

  // Toggle Dark Queue Task Completion (persisted to MongoDB)
  const handleToggleTask = async (taskId) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setWebDetails((prev) => ({ ...prev, crmTasks: updatedTasks }));
    await saveWebDetailsPatch({ crmTasks: updatedTasks }, "Task status synced");
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskText.trim(),
      subtitle: "Atelier · Just added",
      category: "studio",
      completed: false,
    };
    const updatedTasks = [newTask, ...tasks];
    setWebDetails((prev) => ({ ...prev, crmTasks: updatedTasks }));
    setNewTaskText("");
    setAddingTask(false);
    await saveWebDetailsPatch({ crmTasks: updatedTasks }, "Task added to studio queue");
  };

  // Project CRUD Handlers (Directly Reflected on Homepage Works.jsx & /projects)
  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      categoryId: categories[0]?._id || "",
      size: "12,000 sq.ft",
      location: "Dubai, UAE",
      scope: "Turnkey Design & Fit-Out",
      sector: "Residential",
      description: "",
    });
    setProjectFiles([]);
    setExistingImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setProjectModalOpen(true);
  };

  const openEditProjectModal = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title || "",
      categoryId:
        typeof proj.categoryId === "object" ? proj.categoryId?._id || "" : proj.categoryId || "",
      size: proj.size || "",
      location: proj.location || "",
      scope: proj.scope || "",
      sector: proj.sector || "",
      description: proj.description || "",
    });
    setProjectFiles([]);
    setExistingImages(proj.images || []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!projectForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    setSavingCms(true);
    try {
      const fd = new FormData();
      fd.append("title", projectForm.title.trim());
      fd.append("categoryId", projectForm.categoryId);
      fd.append("size", projectForm.size || "");
      fd.append("location", projectForm.location || "");
      fd.append("scope", projectForm.scope || "");
      fd.append("sector", projectForm.sector || "");
      fd.append("description", projectForm.description || "");
      projectFiles.forEach((f) => fd.append("images", f));

      if (editingProject?._id) {
        fd.append("existingImages", JSON.stringify(existingImages));
        await projectAPI.update(editingProject._id, fd);
        toast.success("Project updated & synced to public website!");
      } else {
        await projectAPI.create(fd);
        toast.success("New project published to public website!");
      }

      setProjectModalOpen(false);
      clearProjectsCache();
      clearProjectDetailsCache(editingProject?._id);
      window.dispatchEvent(new CustomEvent("projects-updated"));
      await loadDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save project.");
    } finally {
      setSavingCms(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project from website & database?")) return;
    try {
      await projectAPI.delete(id);
      toast.success("Project removed from website");
      clearProjectsCache();
      clearProjectDetailsCache(id);
      window.dispatchEvent(new CustomEvent("projects-updated"));
      await loadDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  // Service CRUD Handlers (Directly Reflected on Homepage, Services & Contact pages)
  const openCreateServiceModal = () => {
    setEditingServiceIdx(null);
    setServiceForm({
      title: "",
      slug: "",
      eyebrow: "BESPOKE ARCHITECTURE",
      shortDesc: "",
      description: "",
      image: "/static/studio.jpg",
      highlightsText: "Concept Design\nAuthority Approvals\nTurnkey Fit-Out",
      active: true,
    });
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (srv, idx) => {
    setEditingServiceIdx(idx);
    setServiceForm({
      title: srv.title || "",
      slug: srv.slug || "",
      eyebrow: srv.eyebrow || "",
      shortDesc: srv.shortDesc || "",
      description: srv.description || "",
      image: srv.image || "/static/studio.jpg",
      highlightsText: (srv.highlights || []).join("\n"),
      active: srv.active !== false,
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      toast.error("Service title is required");
      return;
    }

    const cleanSlug =
      serviceForm.slug.trim() ||
      serviceForm.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newServiceObj = {
      id:
        editingServiceIdx !== null
          ? services[editingServiceIdx]?.id || `srv-${Date.now()}`
          : `srv-${Date.now()}`,
      title: serviceForm.title.trim(),
      slug: cleanSlug,
      eyebrow: serviceForm.eyebrow.trim() || "YASHMEEN DISCIPLINE",
      shortDesc: serviceForm.shortDesc.trim(),
      description: serviceForm.description.trim(),
      image: serviceForm.image || "/static/studio.jpg",
      route: `/services/${cleanSlug}`,
      active: serviceForm.active,
      highlights: serviceForm.highlightsText
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean),
    };

    const nextServices = [...services];
    if (editingServiceIdx !== null) {
      nextServices[editingServiceIdx] = newServiceObj;
    } else {
      nextServices.push(newServiceObj);
    }

    await saveWebDetailsPatch(
      { services: nextServices },
      "Service published to live website!"
    );
    setServiceModalOpen(false);
  };

  const handleDeleteService = async (idx) => {
    if (!window.confirm("Remove this service from the live website?")) return;
    const nextServices = services.filter((_, i) => i !== idx);
    await saveWebDetailsPatch({ services: nextServices }, "Service removed from website");
  };

  // Calendar Event Handler
  const handleAddCalendarEvent = async (e) => {
    e.preventDefault();
    if (!calendarForm.title.trim()) return;
    const newEvt = {
      id: `evt-${Date.now()}`,
      ...calendarForm,
    };
    const nextEvents = [...calendarEvents, newEvt];
    await saveWebDetailsPatch({ calendarEvents: nextEvents }, "Schedule updated");
    setCalendarModalOpen(false);
    setCalendarForm({
      title: "",
      subtitle: "",
      dayIndex: 2,
      timeSlot: "10:00 am",
      variant: "dark",
    });
  };

  const handleDeleteCalendarEvent = async (evtId) => {
    const nextEvents = calendarEvents.filter((ev) => ev.id !== evtId);
    await saveWebDetailsPatch({ calendarEvents: nextEvents }, "Schedule event removed");
  };

  // Pipeline Drag & Drop
  const updateItemStage = (id, stageId, label) => {
    setStageMap((prev) => ({ ...prev, [id]: stageId }));
    const stageName = STAGES.find((s) => s.id === stageId)?.name || stageId;
    toast.success(`Moved "${label}" to ${stageName}`);
  };

  // Progress Dial SVG Geometry
  const dialTicks = Array.from({ length: 44 }, (_, i) => i);
  const progressFraction = timerRunning ? Math.min(((timerSeconds % 360) / 360) * 0.75 + 0.2, 0.92) : 0.68;

  return (
    <div className="crex-dash-wrap">
      {/* =====================================================================
          1. GREETING HEADER + CAPSULE PROGRESS STRIP + THIN ARCHITECTURAL STATS
          ===================================================================== */}
      <section
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
          marginBottom: "26px",
        }}
      >
        {/* Left: Greeting + Status Capsules */}
        <div style={{ flex: "1 1 520px", maxWidth: "700px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", margin: "0 0 18px 0" }}>
            <h1
              style={{
                fontSize: "clamp(26px, 3.2vw, 40px)",
                fontWeight: 500,
                color: "var(--crex-ink)",
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Welcome in, {user?.name || "Yashmeen"}
            </h1>
            {loading && (
              <span
                className="badge-brass"
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "9999px",
                }}
              >
                Syncing…
              </span>
            )}
          </div>

          {/* Segmented Horizontal Progress Strip */}
          <div
            className="crex-progress-strip"
            style={{
              gridTemplateColumns: `${leadsPct}fr ${quotesPct}fr ${siteSyncPct}fr ${outputPct}fr`,
            }}
          >
            {/* Bar 1: Leads (Obsidian Ink) */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
                Inquiries
              </div>
              <div
                style={{
                  height: "30px",
                  borderRadius: "9999px",
                  background: "var(--crex-dark)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                }}
              >
                {leadsPct}%
              </div>
            </div>

            {/* Bar 2: Quotes (Brushed Champagne Brass) */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
                Quotes
              </div>
              <div
                style={{
                  height: "30px",
                  borderRadius: "9999px",
                  background: "var(--crex-brass)",
                  color: "var(--crex-ink)",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                }}
              >
                {quotesPct}%
              </div>
            </div>

            {/* Bar 3: Site Sync (Signature Diagonal Hatched Capsule) */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
                Site Works
              </div>
              <div
                className="crex-hatched-bar"
                style={{
                  height: "30px",
                  borderRadius: "9999px",
                  color: "var(--crex-muted)",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                }}
              >
                {siteSyncPct}%
              </div>
            </div>

            {/* Bar 4: Services Ready (Hairline Outline Pill) */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--crex-muted)", marginBottom: "6px", paddingLeft: "4px" }}>
                Services
              </div>
              <div
                style={{
                  height: "30px",
                  borderRadius: "9999px",
                  border: "1px solid var(--crex-line-strong)",
                  background: "rgba(255, 255, 255, 0.55)",
                  color: "var(--crex-ink)",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                }}
              >
                {outputPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Right: Thin Giant Architectural Numerals */}
        <div className="crex-stats-row">
          <div
            onClick={() => {
              setActiveTab("projects");
              document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <FiLayers size={15} color="#8a8a86" />
              <span style={{ fontSize: "42px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {projects.length}
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px", paddingLeft: "23px" }}>
              Projects
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab("services");
              document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <FiBriefcase size={15} color="#8a8a86" />
              <span style={{ fontSize: "42px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {activeServicesCount}
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px", paddingLeft: "23px" }}>
              Services
            </div>
          </div>

          <div
            onClick={() => {
              setActiveTab("leads");
              document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <FiFileText size={15} color="#8a8a86" />
              <span style={{ fontSize: "42px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {quotes.length + enquiries.length}
              </span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px", paddingLeft: "23px" }}>
              Requests
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. 4-COLUMN CREXTIO BENTO GRID
          ===================================================================== */}
      <section className="crex-bento-grid" style={{ marginBottom: "32px" }}>
        {/* CARD 1: FEATURED WEBSITE PROJECT SHOWCASE (Portrait Photo Card) */}
        <div
          className="crex-card"
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "290px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "18px",
            background: "#141311",
          }}
        >
          <img
            src={resolveImage(featuredProj.images?.[0])}
            alt={featuredProj.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_PROJECT_IMG;
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(8,8,7,0.24) 0%, rgba(8,8,7,0.06) 45%, rgba(8,8,7,0.84) 100%)",
            }}
          />

          {/* Top Controls inside Photo Card */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() =>
                  setFeaturedIndex((i) =>
                    i === 0 ? Math.max(projects.length - 1, 0) : i - 1
                  )
                }
                className="crex-icon-circle"
                style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.24)", color: "#fff", border: "none", backdropFilter: "blur(8px)" }}
                title="Previous live project"
              >
                <FiChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setFeaturedIndex((i) => i + 1)}
                className="crex-icon-circle"
                style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.24)", color: "#fff", border: "none", backdropFilter: "blur(8px)" }}
                title="Next live project"
              >
                <FiChevronRight size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                featuredProj._id
                  ? openEditProjectModal(featuredProj)
                  : openCreateProjectModal()
              }
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                borderRadius: "9999px",
                padding: "5px 12px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <FiEdit2 size={11} />
              <span>Edit Live</span>
            </button>
          </div>

          {/* Bottom Typography + Frosted Size Pill */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: "0 0 3px 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {featuredProj.title}
              </h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.82)", margin: 0 }}>
                {featuredProj.sector || "Architectural Works"} · {featuredProj.location || "Dubai"}
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateProjectModal}
              style={{
                background: "rgba(255, 255, 255, 0.16)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                color: "#ffffff",
                borderRadius: "9999px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Add new project to website"
            >
              {featuredProj.size || "+ New"}
            </button>
          </div>
        </div>

        {/* CARD 2: PIPELINE VELOCITY BAR CHART ("Progress" Visual Match) */}
        <div
          className="crex-card"
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "290px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--crex-ink)" }}>
                Progress
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "8px" }}>
                <span style={{ fontSize: "34px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {allCRMItems.length}
                </span>
                <span style={{ fontSize: "11px", color: "var(--crex-muted)", lineHeight: 1.3 }}>
                  Active Deals
                  <br />
                  in pipeline
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab("kanban");
                document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="crex-icon-circle"
              title="Open Pipeline Kanban"
            >
              <FiArrowUpRight size={15} />
            </button>
          </div>

          {/* 7 Vertical Dotted Tracks with Obsidian & Champagne Brass Capsule Bars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              alignItems: "end",
              height: "145px",
              gap: "8px",
              marginTop: "12px",
              paddingTop: "16px",
            }}
          >
            {weeklyBars.map((bar, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "flex-end",
                  position: "relative",
                }}
                title={`${bar.day}: ${bar.label}`}
              >
                {/* Floating Brass Badge above Peak Bar */}
                {bar.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-6px",
                      background: "var(--crex-brass)",
                      color: "var(--crex-ink)",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "9999px",
                      whiteSpace: "nowrap",
                      boxShadow: "0 2px 8px rgba(197, 160, 89, 0.34)",
                      zIndex: 2,
                    }}
                  >
                    {bar.label}
                  </div>
                )}

                {/* Dotted Spine Behind Capsule */}
                <div
                  style={{
                    position: "relative",
                    width: "10px",
                    height: "102px",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      bottom: "8px",
                      width: "2px",
                      borderLeft: "2px dotted rgba(8, 8, 7, 0.14)",
                    }}
                  />
                  {/* Solid Pill Bar */}
                  <div
                    style={{
                      position: "relative",
                      width: "10px",
                      height: `${bar.h}%`,
                      borderRadius: "9999px",
                      background: bar.highlight ? "var(--crex-brass)" : "var(--crex-dark)",
                      transition: "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                      zIndex: 1,
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: bar.highlight ? "var(--crex-ink)" : "var(--crex-muted-soft)",
                    marginTop: "8px",
                  }}
                >
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: TURNKEY STUDIO TRACKER DIAL */}
        <div
          className="crex-card"
          style={{
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "290px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--crex-ink)" }}>
              Site tracker
            </div>
            <button
              type="button"
              onClick={() => window.open("/", "_blank")}
              className="crex-icon-circle"
              title="Open Public Website"
            >
              <FiArrowUpRight size={15} />
            </button>
          </div>

          {/* Radial Tick Gauge with Champagne Brass Progress Arc */}
          <div
            style={{
              position: "relative",
              width: "152px",
              height: "152px",
              margin: "6px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", transform: "rotate(-110deg)" }}>
              {/* Radial Ticks */}
              {dialTicks.map((t) => {
                const angle = (t / dialTicks.length) * 360;
                return (
                  <line
                    key={t}
                    x1="80"
                    y1="10"
                    x2="80"
                    y2="19"
                    stroke="rgba(8,8,7,0.18)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 80 80)`}
                  />
                );
              })}
              {/* Champagne Brass Progress Overlay Arc */}
              <circle
                cx="80"
                cy="80"
                r="64"
                fill="none"
                stroke="#c5a059"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${progressFraction * 402} 402`}
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            </svg>

            <div
              style={{
                position: "absolute",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  color: "var(--crex-ink)",
                  lineHeight: 1.05,
                }}
              >
                {formattedTimer}
              </div>
              <div style={{ fontSize: "11px", color: "var(--crex-muted)", marginTop: "2px" }}>
                Atelier Time
              </div>
            </div>
          </div>

          {/* Timer Controls Bottom Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setTimerRunning(true)}
                className="crex-icon-circle"
                style={{
                  background: timerRunning ? "var(--crex-dark)" : "#ffffff",
                  color: timerRunning ? "#ffffff" : "var(--crex-ink)",
                }}
                title="Start site work timer"
              >
                <FiPlay size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTimerRunning(false)}
                className="crex-icon-circle"
                title="Pause timer"
              >
                <FiPause size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setTimerSeconds(155)}
              className="crex-icon-circle is-dark"
              title="Reset studio session clock"
            >
              <FiClock size={14} />
            </button>
          </div>
        </div>

        {/* COLUMN 4 RIGHT STACK (Spans 2 Rows): TOP WEBSITE SYNC + TALL OBSIDIAN TASK QUEUE */}
        <div className="crex-col-right-stack">
          {/* Top-Right Onboarding / Website CMS Sync Card */}
          <div className="crex-card" style={{ padding: "20px 22px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontSize: "17px", fontWeight: 500, color: "var(--crex-ink)" }}>
                Web Sync
              </span>
              <span style={{ fontSize: "28px", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {syncScore}%
              </span>
            </div>

            {/* 3 Stacked Capsule Bars (Brass, Obsidian Ink, Muted Stone) */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2.2fr 1.2fr", gap: "6px" }}>
              <div>
                <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", marginBottom: "5px" }}>
                  Services ({activeServicesCount})
                </div>
                <div
                  onClick={() => setActiveTab("services")}
                  style={{
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--crex-brass)",
                    color: "var(--crex-ink)",
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    cursor: "pointer",
                  }}
                >
                  Live
                </div>
              </div>

              <div>
                <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", marginBottom: "5px" }}>
                  Works ({projects.length})
                </div>
                <div
                  onClick={() => setActiveTab("projects")}
                  style={{
                    height: "36px",
                    borderRadius: "10px",
                    background: "var(--crex-dark)",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 10px",
                    cursor: "pointer",
                  }}
                >
                  DB
                </div>
              </div>

              <div>
                <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", marginBottom: "5px" }}>
                  Queue
                </div>
                <div
                  style={{
                    height: "36px",
                    borderRadius: "10px",
                    background: "#545454",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tasks.length - completedTasksCount}
                </div>
              </div>
            </div>
          </div>

          {/* Tall Matte Obsidian Ink Task Queue Card */}
          <div
            className="crex-card-dark"
            style={{
              padding: "22px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "16.5px", fontWeight: 500, color: "#ffffff" }}>
                  Studio & Web Queue
                </span>
                <span style={{ fontSize: "24px", fontWeight: 400, color: "#ffffff", letterSpacing: "-0.02em" }}>
                  {completedTasksCount}/{tasks.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {tasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "10px 4px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      transition: "opacity 0.15s ease",
                      opacity: task.completed ? 0.68 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0 }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.08)",
                          color: "#d6d4ce",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FiCheckCircle size={13} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 500,
                            color: "#ffffff",
                            textDecoration: task.completed ? "line-through" : "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {task.title}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "#a1a09b", marginTop: "2px" }}>
                          {task.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Check Circle */}
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: task.completed ? "#c5a059" : "rgba(255, 255, 255, 0.14)",
                        color: task.completed ? "#080807" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <FiCheck size={11} strokeWidth={3} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Quick Task Adder */}
            <div style={{ marginTop: "14px" }}>
              {addingTask ? (
                <form onSubmit={handleAddTask} style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    placeholder="New task or web update..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#ffffff",
                      borderRadius: "9999px",
                      padding: "6px 12px",
                      fontSize: "11.5px",
                    }}
                  />
                  <button
                    type="submit"
                    className="crex-btn-accent"
                    style={{ padding: "5px 12px", fontSize: "11px" }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingTask(false)}
                    style={{ background: "transparent", border: "none", color: "#a1a09b", cursor: "pointer" }}
                  >
                    <FiX size={14} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingTask(true)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px dashed rgba(255,255,255,0.18)",
                    borderRadius: "9999px",
                    color: "#e6e4de",
                    padding: "7px 12px",
                    fontSize: "11.5px",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <FiPlus size={12} />
                  <span>Add Action Task</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARD 5 (Bottom-Left): COLLAPSIBLE LIVE WEBSITE CMS ACCORDIONS */}
        <div
          className="crex-card"
          style={{
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Accordion 1: Live Website Projects */}
          <div style={{ borderBottom: "1px solid var(--crex-line)", paddingBottom: "10px", marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === "projects" ? "" : "projects")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "var(--crex-ink)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <span>Website Projects ({projects.length})</span>
              {openAccordion === "projects" ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
            </button>

            {openAccordion === "projects" && (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {projects.slice(0, 2).map((p) => (
                  <div
                    key={p._id}
                    onClick={() => openEditProjectModal(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "6px 8px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid var(--crex-line)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                      <img
                        src={resolveImage(p.images?.[0])}
                        alt={p.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_PROJECT_IMG;
                        }}
                        style={{ width: "36px", height: "28px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "var(--crex-muted)" }}>{p.location || "Dubai"}</div>
                      </div>
                    </div>
                    <FiEdit2 size={12} color="#8a8a86" style={{ flexShrink: 0 }} />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={openCreateProjectModal}
                  className="crex-btn-dark"
                  style={{ width: "100%", justifyContent: "center", padding: "7px 12px", fontSize: "11.5px" }}
                >
                  <FiPlus size={12} />
                  <span>Add Website Project</span>
                </button>
              </div>
            )}
          </div>

          {/* Accordion 2: Services (Default Open - mirrors "Devices -> MacBook Air" card) */}
          <div style={{ borderBottom: "1px solid var(--crex-line)", paddingBottom: "12px", marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === "services" ? "" : "services")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "var(--crex-ink)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <span>Live Services ({services.length})</span>
              {openAccordion === "services" ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
            </button>

            {openAccordion === "services" && (
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {services.slice(0, 2).map((srv, idx) => (
                  <div
                    key={srv.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "4px 2px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <img
                        src={srv.image || FALLBACK_PROJECT_IMG}
                        alt={srv.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_PROJECT_IMG;
                        }}
                        style={{
                          width: "40px",
                          height: "32px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          border: "1px solid var(--crex-line)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--crex-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {srv.title}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {srv.route}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditServiceModal(srv, idx)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--crex-muted)", padding: "4px", flexShrink: 0 }}
                      title="Edit service on live website"
                    >
                      <FiMoreVertical size={15} />
                    </button>
                  </div>
                ))}

                <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={openCreateServiceModal}
                    className="crex-btn-ghost"
                    style={{ flex: 1, justifyContent: "center", padding: "6px 10px", fontSize: "11.5px" }}
                  >
                    <FiPlus size={12} />
                    <span>New Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("services");
                      document.getElementById("crm-cms-workspace")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="crex-btn-ghost"
                    style={{ padding: "6px 10px", fontSize: "11.5px" }}
                  >
                    All ({services.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Hero & Studio Copy */}
          <div style={{ borderBottom: "1px solid var(--crex-line)", paddingBottom: "10px", marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === "hero" ? "" : "hero")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "var(--crex-ink)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <span>Hero & Manifesto Copy</span>
              {openAccordion === "hero" ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
            </button>

            {openAccordion === "hero" && (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  value={siteForm.hero?.title || ""}
                  onChange={(e) =>
                    setSiteForm((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value },
                    }))
                  }
                  placeholder="Homepage Hero Title"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                />
                <input
                  type="text"
                  value={siteForm.hero?.kicker || ""}
                  onChange={(e) =>
                    setSiteForm((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, kicker: e.target.value },
                    }))
                  }
                  placeholder="Kicker subtitle"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                />
                <button
                  type="button"
                  disabled={savingCms}
                  onClick={() =>
                    saveWebDetailsPatch({ hero: siteForm.hero }, "Homepage Hero published!")
                  }
                  className="crex-btn-dark"
                  style={{ justifyContent: "center", padding: "6px 12px", fontSize: "11.5px" }}
                >
                  Save to Homepage
                </button>
              </div>
            )}
          </div>

          {/* Accordion 4: Contact & Web Info */}
          <div>
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === "contact" ? "" : "contact")}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13.5px",
                fontWeight: 500,
                color: "var(--crex-ink)",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <span>Studio Contact & Details</span>
              {openAccordion === "contact" ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
            </button>

            {openAccordion === "contact" && (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  value={siteForm.mobile || ""}
                  onChange={(e) => setSiteForm((p) => ({ ...p, mobile: e.target.value }))}
                  placeholder="Studio Phone"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                />
                <input
                  type="email"
                  value={siteForm.email || ""}
                  onChange={(e) => setSiteForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Studio Email"
                  style={{ fontSize: "12px", padding: "6px 10px" }}
                />
                <button
                  type="button"
                  disabled={savingCms}
                  onClick={() =>
                    saveWebDetailsPatch(
                      { mobile: siteForm.mobile, email: siteForm.email },
                      "Contact info updated on Website & Footer!"
                    )
                  }
                  className="crex-btn-dark"
                  style={{ justifyContent: "center", padding: "6px 12px", fontSize: "11.5px" }}
                >
                  Update Contact Live
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CARD 6 (Bottom-Center, Span 2 Cols): CALENDAR & SITE VISITS TIMELINE */}
        <div
          className="crex-card crex-calendar-span"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Calendar Header Strip (Prev Month | Active Month Year | Next Month + Schedule Pill) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              marginBottom: "18px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m - 1)}
              className="crex-btn-ghost"
              style={{ fontSize: "11.5px", padding: "5px 12px" }}
            >
              {monthNames.prev}
            </button>

            <div style={{ fontSize: "15.5px", fontWeight: 500, color: "var(--crex-ink)" }}>
              {monthNames.curr}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setMonthOffset((m) => m + 1)}
                className="crex-btn-ghost"
                style={{ fontSize: "11.5px", padding: "5px 12px" }}
              >
                {monthNames.next}
              </button>
              <button
                type="button"
                onClick={() => setCalendarModalOpen(true)}
                className="crex-btn-dark"
                style={{ fontSize: "11px", padding: "5px 12px" }}
                title="Add site visit or consultation"
              >
                <FiCalendar size={12} />
                <span>Schedule</span>
              </button>
            </div>
          </div>

          {/* 6-Day Column Grid with Time Axis (Desktop & Tablet) */}
          <div className="crex-calendar-desktop" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "520px" }}>
              {/* Day Names Header */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ width: "68px", flexShrink: 0 }} />
                <div
                  style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                    textAlign: "center",
                  }}
                >
                  {weekColumns.map((col, idx) => {
                    const isWed = idx === 2;
                    return (
                      <div key={col.name} style={{ paddingBottom: "4px" }}>
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: isWed ? "var(--crex-ink)" : "var(--crex-muted-soft)",
                            fontWeight: isWed ? 700 : 500,
                          }}
                        >
                          {col.name}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: isWed ? 700 : 500,
                            color: isWed ? "var(--crex-ink)" : "var(--crex-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {col.num}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline Matrix Rows */}
              <div style={{ position: "relative" }}>
                {["9:00 am", "10:00 am", "11:00 am"].map((timeSlot) => {
                  const rowEvents = calendarEvents.filter((ev) => ev.timeSlot === timeSlot);
                  return (
                    <div
                      key={timeSlot}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minHeight: "54px",
                      }}
                    >
                      <span style={{ width: "68px", flexShrink: 0, fontSize: "11px", color: "var(--crex-muted-soft)", fontWeight: 500 }}>
                        {timeSlot}
                      </span>

                      <div
                        style={{
                          flex: 1,
                          display: "grid",
                          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                          minHeight: "54px",
                          alignItems: "center",
                          position: "relative",
                        }}
                      >
                        {/* Grid Cells */}
                        {weekColumns.map((_, dayIdx) => (
                          <div
                            key={dayIdx}
                            style={{
                              borderLeft: "1px dashed var(--crex-line)",
                              height: "100%",
                              minHeight: "54px",
                            }}
                          />
                        ))}

                        {/* Render Floating Event Pills aligned accurately to 1/6 day columns */}
                        {rowEvents.map((ev) => {
                          const colIdx = Math.min(Math.max(Number(ev.dayIndex) || 0, 0), 5);
                          const rawLeft = (colIdx / 6) * 100;
                          const widthPct = colIdx >= 4 ? 33.33 : 36;
                          const leftPct = Math.min(rawLeft, 100 - widthPct);
                          const isDark = ev.variant !== "light";
                          return (
                            <div
                              key={ev.id}
                              style={{
                                position: "absolute",
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                zIndex: 3,
                                background: isDark ? "var(--crex-dark)" : "#ffffff",
                                color: isDark ? "#ffffff" : "var(--crex-ink)",
                                border: isDark ? "none" : "1px solid var(--crex-line-strong)",
                                borderRadius: "14px",
                                padding: "8px 12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "8px",
                                boxSizing: "border-box",
                                boxShadow: isDark
                                  ? "0 8px 20px rgba(8,8,7,0.18)"
                                  : "0 4px 12px rgba(8,8,7,0.05)",
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: "11.5px",
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {ev.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: isDark ? "#b8b6af" : "var(--crex-muted)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {ev.subtitle}
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                                {/* Micro Team Avatar Monograms */}
                                <div style={{ display: "flex", marginRight: "4px" }}>
                                  <span
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "50%",
                                      background: "var(--crex-brass)",
                                      color: "var(--crex-ink)",
                                      fontSize: "9px",
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: isDark ? "1.5px solid #080807" : "1.5px solid #ffffff",
                                    }}
                                  >
                                    YA
                                  </span>
                                  <span
                                    style={{
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "50%",
                                      background: "#eae7df",
                                      color: "var(--crex-ink)",
                                      fontSize: "9px",
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      marginLeft: "-6px",
                                      border: isDark ? "1.5px solid #080807" : "1.5px solid #ffffff",
                                    }}
                                  >
                                    PM
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCalendarEvent(ev.id)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: isDark ? "#b8b6af" : "var(--crex-muted)",
                                    cursor: "pointer",
                                    padding: "2px",
                                  }}
                                  title="Remove event"
                                >
                                  <FiX size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Stacked Agenda View (< 640px) */}
          <div className="crex-agenda-mobile">
            {calendarEvents.map((ev) => {
              const colIdx = Math.min(Math.max(Number(ev.dayIndex) || 0, 0), 5);
              const dayInfo = weekColumns[colIdx] || weekColumns[0];
              const isDark = ev.variant !== "light";
              return (
                <div
                  key={ev.id}
                  style={{
                    background: isDark ? "var(--crex-dark)" : "#ffffff",
                    color: isDark ? "#ffffff" : "var(--crex-ink)",
                    border: isDark ? "none" : "1px solid var(--crex-line-strong)",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 600,
                        color: isDark ? "var(--crex-brass)" : "var(--crex-brass-deep)",
                        marginBottom: "2px",
                      }}
                    >
                      {dayInfo.name} {dayInfo.num} · {ev.timeSlot}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>{ev.title}</div>
                    {ev.subtitle && (
                      <div style={{ fontSize: "11px", color: isDark ? "#b8b6af" : "var(--crex-muted)", marginTop: "2px" }}>
                        {ev.subtitle}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCalendarEvent(ev.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: isDark ? "#b8b6af" : "var(--crex-muted)",
                      cursor: "pointer",
                      padding: "4px",
                      flexShrink: 0,
                    }}
                    title="Remove event"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. LIVE WEBSITE CMS & CRM WORKSPACE (PROJECTS, SERVICES, KANBAN, LEADS)
          ===================================================================== */}
      <section
        id="crm-cms-workspace"
        className="crex-card"
        style={{ padding: "clamp(16px, 2.5vw, 26px)" }}
      >
        {/* Header Bar & Pill Tab Switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
            paddingBottom: "18px",
            borderBottom: "1px solid var(--crex-line)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "projects", label: `Website Projects (${projects.length})` },
              { id: "services", label: `Services & Copy (${services.length})` },
              { id: "kanban", label: `CRM Pipeline (${allCRMItems.length})` },
              { id: "leads", label: `Quotes & Inquiries (${quotes.length + enquiries.length})` },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: active ? "var(--crex-dark)" : "rgba(255,255,255,0.7)",
                    color: active ? "#ffffff" : "var(--crex-muted)",
                    border: active ? "1px solid var(--crex-dark)" : "1px solid var(--crex-line)",
                    borderRadius: "9999px",
                    padding: "8px 16px",
                    fontSize: "12.5px",
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", maxWidth: "100%" }}>
            <div style={{ position: "relative", width: "min(220px, 100%)", flex: "1 1 180px" }}>
              <FiSearch
                size={13}
                color="#8a8a86"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "32px", borderRadius: "9999px", width: "100%", fontSize: "12.5px" }}
              />
            </div>

            {activeTab === "projects" && (
              <button type="button" onClick={openCreateProjectModal} className="crex-btn-accent">
                <FiPlus size={14} />
                <span>Publish Project</span>
              </button>
            )}

            {activeTab === "services" && (
              <button type="button" onClick={openCreateServiceModal} className="crex-btn-accent">
                <FiPlus size={14} />
                <span>Add Service</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSiteForm(webDetails);
                setSiteModalOpen(true);
              }}
              className="crex-btn-ghost"
            >
              <FiGlobe size={13} />
              <span>Edit Website Copy & Info</span>
            </button>
          </div>
        </div>

        {/* ---------------- TAB 1: WEBSITE PROJECTS CMS ---------------- */}
        {activeTab === "projects" && (
          <div className="crex-animate-in">
            <div style={{ marginBottom: "16px", fontSize: "12.5px", color: "var(--crex-muted)" }}>
              Any project created, edited, or deleted here updates the live Homepage Selected Works and{" "}
              <a href="/projects" target="_blank" rel="noreferrer" style={{ color: "var(--crex-ink)", fontWeight: 600 }}>
                /projects
              </a>{" "}
              immediately.
            </div>

            <div className="crex-card-grid-projects">
              {projects
                .filter(
                  (p) =>
                    !searchQuery.trim() ||
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.location || "").toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((proj) => {
                  const catName =
                    typeof proj.categoryId === "object"
                      ? proj.categoryId?.categoryName
                      : categories.find((c) => c._id === proj.categoryId)?.categoryName || "Fit-Out";
                  return (
                    <div key={proj._id} className="crm-bezel-wrapper">
                      <div className="crm-bezel-inner" style={{ overflow: "hidden" }}>
                        <div style={{ height: "145px", position: "relative", background: "#eae7df" }}>
                          <img
                            src={resolveImage(proj.images?.[0])}
                            alt={proj.title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_PROJECT_IMG;
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "rgba(8,8,7,0.84)",
                              color: "#ffffff",
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "3px 9px",
                              borderRadius: "9999px",
                            }}
                          >
                            {catName}
                          </span>
                        </div>

                        <div style={{ padding: "14px 16px" }}>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "14.5px", fontWeight: 600 }}>
                            {proj.title}
                          </h4>
                          <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginBottom: "12px" }}>
                            {proj.location || "Dubai, UAE"} · {proj.size || "Turnkey"}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingTop: "10px",
                              borderTop: "1px solid var(--crex-line)",
                            }}
                          >
                            <a
                              href={`/project/details/${proj._id}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 600,
                                color: "var(--crex-ink)",
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <span>Preview</span>
                              <FiArrowUpRight size={12} />
                            </a>

                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                onClick={() => openEditProjectModal(proj)}
                                className="crex-btn-ghost"
                                style={{ padding: "5px 10px", fontSize: "11px" }}
                              >
                                <FiEdit2 size={11} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(proj._id)}
                                style={{
                                  background: "#fef2f2",
                                  color: "#b91c1c",
                                  border: "1px solid rgba(185, 28, 28, 0.28)",
                                  borderRadius: "9999px",
                                  padding: "5px 9px",
                                  cursor: "pointer",
                                }}
                                title="Delete Project"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: SERVICES & WEBSITE SECTIONS ---------------- */}
        {activeTab === "services" && (
          <div className="crex-animate-in">
            <div style={{ marginBottom: "16px", fontSize: "12.5px", color: "var(--crex-muted)" }}>
              Services edited or added here synchronize directly with the Homepage Core Disciplines, dedicated{" "}
              <a href="/services/architecture" target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: "var(--crex-ink)" }}>
                /services/*
              </a>{" "}
              pages, and Contact Enquiry forms.
            </div>

            <div className="crex-card-grid-services">
              {services.map((srv, idx) => (
                <div key={srv.id || idx} className="crm-bezel-wrapper">
                  <div className="crm-bezel-inner" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "10px" }}>
                      <img
                        src={srv.image || FALLBACK_PROJECT_IMG}
                        alt={srv.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_PROJECT_IMG;
                        }}
                        style={{ width: "54px", height: "42px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--crex-brass-deep)", letterSpacing: "0.06em" }}>
                          {srv.eyebrow || "SERVICE"}
                        </div>
                        <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {srv.title}
                        </h4>
                      </div>
                      <span
                        className={srv.active !== false ? "badge-sage" : "badge-neutral"}
                        style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px", flexShrink: 0 }}
                      >
                        {srv.active !== false ? "Live" : "Hidden"}
                      </span>
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--crex-muted)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                      {srv.shortDesc}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "10px",
                        borderTop: "1px solid var(--crex-line)",
                      }}
                    >
                      <a
                        href={srv.route || `/services/${srv.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "11.5px",
                          fontWeight: 600,
                          color: "var(--crex-ink)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>View Live Page</span>
                        <FiArrowUpRight size={12} />
                      </a>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => openEditServiceModal(srv, idx)}
                          className="crex-btn-ghost"
                          style={{ padding: "5px 10px", fontSize: "11px" }}
                        >
                          <FiEdit2 size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(idx)}
                          style={{
                            background: "#fef2f2",
                            color: "#b91c1c",
                            border: "1px solid rgba(185, 28, 28, 0.28)",
                            borderRadius: "9999px",
                            padding: "5px 9px",
                            cursor: "pointer",
                          }}
                          title="Delete Service"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: CRM DRAG & DROP KANBAN ---------------- */}
        {activeTab === "kanban" && (
          <div className="crex-animate-in">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(230px, 1fr))",
                gap: "14px",
                overflowX: "auto",
                paddingBottom: "8px",
              }}
            >
              {STAGES.map((stage) => {
                const colItems = filteredCRMItems.filter((i) => i.stage === stage.id);
                return (
                  <div
                    key={stage.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedId) {
                        const found = allCRMItems.find((i) => i.id === draggedId);
                        if (found) updateItemStage(draggedId, stage.id, found.title);
                        setDraggedId(null);
                      }
                    }}
                    style={{
                      background: "rgba(241, 240, 238, 0.55)",
                      border: "1px solid var(--crex-line)",
                      borderRadius: "18px",
                      padding: "12px",
                      minHeight: "360px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 6px",
                      }}
                    >
                      <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{stage.name}</span>
                      <span
                        className={stage.badgeClass}
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                        }}
                      >
                        {colItems.length}
                      </span>
                    </div>

                    {colItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => setDraggedId(item.id)}
                        onClick={() => setInspectedItem(item)}
                        className="crm-bezel-wrapper"
                        style={{ cursor: "pointer" }}
                      >
                        <div className="crm-bezel-inner" style={{ padding: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                              <div
                                className="crm-avatar"
                                style={{ width: "26px", height: "26px", fontSize: "10px" }}
                              >
                                {item.initials}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: "12.5px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {item.title}
                                </div>
                                <div style={{ fontSize: "10.5px", color: "var(--crex-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {item.subtitle}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10.5px", color: "var(--crex-muted)", gap: "6px" }}>
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.location}</span>
                            <span className={item.badgeStyle} style={{ padding: "1px 6px", borderRadius: "9999px", fontWeight: 600, flexShrink: 0 }}>
                              {item.typeBadge}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- TAB 4: QUOTES & INQUIRIES TABLE ---------------- */}
        {activeTab === "leads" && (
          <div className="crex-animate-in adm-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Scope / Service</th>
                  <th>Source</th>
                  <th>Location / Budget</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCRMItems
                  .filter((i) => i.type !== "project")
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="crm-avatar">{item.initials}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: "11px", color: "var(--crex-muted)" }}>{item.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.subtitle}</td>
                      <td>
                        <span className={item.badgeStyle} style={{ padding: "3px 9px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600 }}>
                          {item.typeBadge}
                        </span>
                      </td>
                      <td>{item.budget || item.location}</td>
                      <td>{formatDateShort(item.date)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setInspectedItem(item)}
                          className="crex-btn-ghost"
                          style={{ padding: "5px 12px", fontSize: "11px" }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =====================================================================
          MODAL A: CREATE / EDIT WEBSITE PROJECT (Syncs to Homepage & /projects)
          ===================================================================== */}
      {projectModalOpen && (
        <div
          onClick={() => setProjectModalOpen(false)}
          className="adm-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="crex-card crex-animate-in crex-modal-box"
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {editingProject ? "Edit Live Website Project" : "Publish New Website Project"}
              </h3>
              <button
                type="button"
                onClick={() => setProjectModalOpen(false)}
                className="crex-icon-circle"
              >
                <FiX size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: "grid", gap: "12px" }}>
              <div className="crm-form-grid-2">
                <div>
                  <label>Project Title *</label>
                  <input
                    required
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Palm Jumeirah Villa"
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Category *</label>
                  <select
                    required
                    value={projectForm.categoryId}
                    onChange={(e) => setProjectForm((p) => ({ ...p, categoryId: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="crm-form-grid-2">
                <div>
                  <label>Location</label>
                  <input
                    type="text"
                    value={projectForm.location}
                    onChange={(e) => setProjectForm((p) => ({ ...p, location: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Area / Size</label>
                  <input
                    type="text"
                    value={projectForm.size}
                    onChange={(e) => setProjectForm((p) => ({ ...p, size: e.target.value }))}
                    placeholder="e.g. 14,500 sq.ft"
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div className="crm-form-grid-2">
                <div>
                  <label>Sector</label>
                  <input
                    type="text"
                    value={projectForm.sector}
                    onChange={(e) => setProjectForm((p) => ({ ...p, sector: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Scope</label>
                  <input
                    type="text"
                    value={projectForm.scope}
                    onChange={(e) => setProjectForm((p) => ({ ...p, scope: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label>Architectural Description</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Materials, joinery craft, MEP delivery scope..."
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div>
                <label>Upload Photography</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setProjectFiles(Array.from(e.target.files || []))}
                  style={{ marginTop: "6px", width: "100%" }}
                />
                {existingImages.length > 0 && (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                    {existingImages.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={resolveImage(img)}
                          alt=""
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_PROJECT_IMG;
                          }}
                          style={{ width: "54px", height: "42px", objectFit: "cover", borderRadius: "8px" }}
                        />
                        <button
                          type="button"
                          onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
                          style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: "#b91c1c",
                            color: "#fff",
                            border: "none",
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={savingCms}
                  className="crex-btn-dark"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {savingCms ? "Publishing..." : editingProject ? "Save Changes to Site" : "Publish to Live Website"}
                </button>
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="crex-btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL B: CREATE / EDIT SERVICE (Syncs to Services Pages & Homepage)
          ===================================================================== */}
      {serviceModalOpen && (
        <div
          onClick={() => setServiceModalOpen(false)}
          className="adm-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="crex-card crex-animate-in crex-modal-box"
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {editingServiceIdx !== null ? "Edit Website Service" : "Create New Service"}
              </h3>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="crex-icon-circle"
              >
                <FiX size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: "grid", gap: "12px" }}>
              <div className="crm-form-grid-2">
                <div>
                  <label>Service Title *</label>
                  <input
                    required
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Custom Joinery"
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>URL Slug</label>
                  <input
                    type="text"
                    value={serviceForm.slug}
                    onChange={(e) => setServiceForm((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="architecture"
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label>Eyebrow Tagline</label>
                <input
                  type="text"
                  value={serviceForm.eyebrow}
                  onChange={(e) => setServiceForm((p) => ({ ...p, eyebrow: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div>
                <label>Short Headline (Shown on Homepage & Service Intro)</label>
                <input
                  type="text"
                  value={serviceForm.shortDesc}
                  onChange={(e) => setServiceForm((p) => ({ ...p, shortDesc: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div>
                <label>Full Discipline Description</label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div>
                <label>Key Deliverables / Bullet Points (One per line)</label>
                <textarea
                  rows={3}
                  value={serviceForm.highlightsText}
                  onChange={(e) => setServiceForm((p) => ({ ...p, highlightsText: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div>
                <label>Featured Visual</label>
                <select
                  value={serviceForm.image}
                  onChange={(e) => setServiceForm((p) => ({ ...p, image: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  {SERVICE_IMAGE_PRESETS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={serviceForm.active}
                  onChange={(e) => setServiceForm((p) => ({ ...p, active: e.target.checked }))}
                />
                <span>Display live on Website Homepage & Menus</span>
              </label>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={savingCms}
                  className="crex-btn-dark"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {savingCms ? "Syncing..." : "Publish Service Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="crex-btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL C: FULL WEBSITE SETTINGS & MANIFESTO EDITOR
          ===================================================================== */}
      {siteModalOpen && (
        <div
          onClick={() => setSiteModalOpen(false)}
          className="adm-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="crex-card crex-animate-in crex-modal-box"
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 600 }}>
                  Live Website Controls
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--crex-muted)" }}>
                  Updates sync immediately across Hero, Footer, Studio, and Contact pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSiteModalOpen(false)}
                className="crex-icon-circle"
              >
                <FiX size={15} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveWebDetailsPatch(
                  {
                    brandName: siteForm.brandName,
                    cityLabel: siteForm.cityLabel,
                    email: siteForm.email,
                    mobile: siteForm.mobile,
                    whatsapp: siteForm.whatsapp,
                    workingHours: siteForm.workingHours,
                    address: siteForm.address,
                    hero: siteForm.hero,
                    studio: siteForm.studio,
                  },
                  "All Website copy & contact info published!"
                );
                setSiteModalOpen(false);
              }}
              style={{ display: "grid", gap: "14px" }}
            >
              <div className="crm-form-grid-2">
                <div>
                  <label>Header Brand Label</label>
                  <input
                    type="text"
                    value={siteForm.brandName || ""}
                    onChange={(e) => setSiteForm((p) => ({ ...p, brandName: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>City Label</label>
                  <input
                    type="text"
                    value={siteForm.cityLabel || ""}
                    onChange={(e) => setSiteForm((p) => ({ ...p, cityLabel: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div className="crm-form-grid-2">
                <div>
                  <label>Hero Headline (use Enter for line break)</label>
                  <textarea
                    rows={2}
                    value={siteForm.hero?.title || ""}
                    onChange={(e) =>
                      setSiteForm((p) => ({
                        ...p,
                        hero: { ...p.hero, title: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Hero Eyebrow Kicker</label>
                  <input
                    type="text"
                    value={siteForm.hero?.kicker || ""}
                    onChange={(e) =>
                      setSiteForm((p) => ({
                        ...p,
                        hero: { ...p.hero, kicker: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div>
                <label>Hero Intro Copy</label>
                <input
                  type="text"
                  value={siteForm.hero?.intro || ""}
                  onChange={(e) =>
                    setSiteForm((p) => ({
                      ...p,
                      hero: { ...p.hero, intro: e.target.value },
                    }))
                  }
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div>
                <label>Studio Manifesto Paragraph</label>
                <textarea
                  rows={3}
                  value={siteForm.studio?.paragraph1 || ""}
                  onChange={(e) =>
                    setSiteForm((p) => ({
                      ...p,
                      studio: { ...p.studio, paragraph1: e.target.value },
                    }))
                  }
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div className="crm-form-grid-2">
                <div>
                  <label>Studio Email</label>
                  <input
                    type="email"
                    value={siteForm.email || ""}
                    onChange={(e) => setSiteForm((p) => ({ ...p, email: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Phone & WhatsApp</label>
                  <input
                    type="text"
                    value={siteForm.mobile || ""}
                    onChange={(e) =>
                      setSiteForm((p) => ({
                        ...p,
                        mobile: e.target.value,
                        whatsapp: e.target.value,
                      }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div className="crm-form-grid-2-1">
                <div>
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={siteForm.address?.street || ""}
                    onChange={(e) =>
                      setSiteForm((p) => ({
                        ...p,
                        address: { ...p.address, street: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label>Working Hours</label>
                  <input
                    type="text"
                    value={siteForm.workingHours || ""}
                    onChange={(e) => setSiteForm((p) => ({ ...p, workingHours: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={savingCms}
                  className="crex-btn-dark"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {savingCms ? "Publishing..." : "Publish All Changes to Website"}
                </button>
                <button
                  type="button"
                  onClick={() => setSiteModalOpen(false)}
                  className="crex-btn-ghost"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL D: SCHEDULE MILESTONE EVENT
          ===================================================================== */}
      {calendarModalOpen && (
        <div
          onClick={() => setCalendarModalOpen(false)}
          className="adm-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="crex-card crex-animate-in crex-modal-box"
            style={{ background: "#ffffff", width: "100%", maxWidth: "420px", padding: "24px" }}
          >
            <h3 style={{ margin: "0 0 14px 0", fontSize: "17px", fontWeight: 600 }}>
              Schedule Site Visit / Sync
            </h3>
            <form onSubmit={handleAddCalendarEvent} style={{ display: "grid", gap: "12px" }}>
              <div>
                <label>Event Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Site Survey · Business Bay"
                  value={calendarForm.title}
                  onChange={(e) => setCalendarForm((p) => ({ ...p, title: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>
              <div>
                <label>Notes / Attendees</label>
                <input
                  type="text"
                  placeholder="MEP inspection & client walkthrough"
                  value={calendarForm.subtitle}
                  onChange={(e) => setCalendarForm((p) => ({ ...p, subtitle: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>
              <div className="crm-form-grid-2">
                <div>
                  <label>Day</label>
                  <select
                    value={calendarForm.dayIndex}
                    onChange={(e) =>
                      setCalendarForm((p) => ({ ...p, dayIndex: Number(e.target.value) }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    {weekColumns.map((w, idx) => (
                      <option key={w.name} value={idx}>
                        {w.name} {w.num}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Time Slot</label>
                  <select
                    value={calendarForm.timeSlot}
                    onChange={(e) => setCalendarForm((p) => ({ ...p, timeSlot: e.target.value }))}
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    <option value="9:00 am">9:00 am</option>
                    <option value="10:00 am">10:00 am</option>
                    <option value="11:00 am">11:00 am</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                <button type="submit" className="crex-btn-dark" style={{ flex: 1, justifyContent: "center" }}>
                  Add to Schedule
                </button>
                <button type="button" onClick={() => setCalendarModalOpen(false)} className="crex-btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          DRAWER: SLIDE-OVER INSPECTION FOR QUOTES & LEADS
          ===================================================================== */}
      {inspectedItem && (
        <div
          onClick={() => setInspectedItem(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(8, 8, 7, 0.42)",
            backdropFilter: "blur(5px)",
            zIndex: 1050,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "#ffffff",
              height: "100%",
              padding: "clamp(18px, 3vw, 28px)",
              overflowY: "auto",
              boxShadow: "-12px 0 40px rgba(8,8,7,0.16)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <div className="crm-avatar" style={{ width: "40px", height: "40px" }}>
                  {inspectedItem.initials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{inspectedItem.title}</h2>
                  <span style={{ fontSize: "12px", color: "var(--crex-muted)" }}>
                    {inspectedItem.subtitle} · {inspectedItem.location}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setInspectedItem(null)} className="crex-icon-circle">
                <FiX size={16} />
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ marginBottom: "8px" }}>Move Pipeline Stage</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {STAGES.map((stg) => {
                  const current = inspectedItem.stage === stg.id;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => {
                        updateItemStage(inspectedItem.id, stg.id, inspectedItem.title);
                        setInspectedItem((prev) => ({ ...prev, stage: stg.id }));
                      }}
                      style={{
                        background: current ? "var(--crex-dark)" : "var(--crex-limestone)",
                        color: current ? "#ffffff" : "var(--crex-ink)",
                        border: "1px solid var(--crex-line)",
                        borderRadius: "9999px",
                        padding: "6px 12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {stg.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {(inspectedItem.budget || inspectedItem.timeline || inspectedItem.location || (inspectedItem.servicesList && inspectedItem.servicesList.length > 0)) && (
              <div
                style={{
                  background: "var(--crex-limestone)",
                  border: "1px solid var(--crex-line)",
                  borderRadius: "16px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                  display: "grid",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "var(--crex-ink)" }}>
                  {inspectedItem.location && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <FiMapPin size={13} color="#8a8a86" />
                      <strong>{inspectedItem.location}</strong>
                    </span>
                  )}
                  {inspectedItem.budget && (
                    <span>Budget: <strong>{inspectedItem.budget}</strong></span>
                  )}
                  {inspectedItem.timeline && (
                    <span>Timeline: <strong>{inspectedItem.timeline}</strong></span>
                  )}
                </div>
                {inspectedItem.servicesList && inspectedItem.servicesList.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {inspectedItem.servicesList.map((srv, idx) => (
                      <span
                        key={idx}
                        className="badge-brass"
                        style={{ padding: "2px 9px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600 }}
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(inspectedItem.email || inspectedItem.mobile) && (
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--crex-line)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "18px",
                  display: "grid",
                  gap: "8px",
                }}
              >
                {inspectedItem.email && (
                  <a href={`mailto:${inspectedItem.email}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--crex-ink)", fontSize: "13px", textDecoration: "none" }}>
                    <FiMail size={14} color="#8a8a86" />
                    <span>{inspectedItem.email}</span>
                  </a>
                )}
                {inspectedItem.mobile && (
                  <a href={`tel:${inspectedItem.mobile}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--crex-ink)", fontSize: "13px", textDecoration: "none" }}>
                    <FiPhone size={14} color="#8a8a86" />
                    <span>{inspectedItem.mobile}</span>
                  </a>
                )}
              </div>
            )}

            {inspectedItem.message && (
              <div>
                <label style={{ marginBottom: "6px" }}>Project Brief & Notes</label>
                <div
                  style={{
                    background: "var(--crex-limestone)",
                    border: "1px solid var(--crex-line)",
                    borderRadius: "16px",
                    padding: "14px",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "var(--crex-muted)",
                  }}
                >
                  {inspectedItem.message}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import DashboardHeader from '../../components/admin/dashboard/DashboardHeader';
import FeaturedProjectCard from '../../components/admin/dashboard/FeaturedProjectCard';
import PipelineProgressCard from '../../components/admin/dashboard/PipelineProgressCard';
import TaskQueueCard from '../../components/admin/dashboard/TaskQueueCard';
import WebsiteContentCard from '../../components/admin/dashboard/WebsiteContentCard';
import CalendarCard from '../../components/admin/dashboard/CalendarCard';
import DashboardTabs from '../../components/admin/dashboard/DashboardTabs';
import ProjectEditorModal from '../../components/admin/dashboard/ProjectEditorModal';
import ServiceEditorModal from '../../components/admin/dashboard/ServiceEditorModal';
import SiteSettingsModal from '../../components/admin/dashboard/SiteSettingsModal';
import CalendarEventModal from '../../components/admin/dashboard/CalendarEventModal';
import PipelineItemModal from '../../components/admin/dashboard/PipelineItemModal';
import { STAGES, getInitials, fetchDashboardBundle } from "../../components/admin/dashboard/dashboardData";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { enquiryAPI, projectAPI, quoteAPI, webDetailsAPI } from "../../services/api";
import {
  DEFAULT_WEBSITE_CONTENT,
  notifyWebsiteContentUpdated,
} from "../../hooks/useWebsiteContent";
import {
  clearProjectsCache,
  clearProjectDetailsCache,
} from "../../lib/publicCache";
import { mergeWebsiteContent } from "../../../../../shared/siteContent.js";
import { toast } from "sonner";
import useCreateStore from "../../store";

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PREVIEW_QUOTES = [
  { _id: "prev_q1", name: "Sahil", email: "sahil@fitout.ae", mobile: "+971 50 123 4567", projectType: "Retail", services: ["Retail Fit-Out"], location: "Downtown Dubai", budget: "Custom Brief", createdAt: new Date().toISOString() },
  { _id: "prev_q2", name: "Raqhib Husain", email: "hussain@fitout.ae", mobile: "+971 52 987 6543", projectType: "Interior", services: ["Interior Fit-Out"], location: "Dubai, UAE", budget: "Turnkey", createdAt: new Date().toISOString() },
  { _id: "prev_q3", name: "Emaar Hospitality", email: "procurement@emaar.ae", mobile: "+971 55 456 7890", projectType: "Renovation", services: ["Luxury Suite Fit-Out"], location: "Dubai Marina", budget: "Commercial Brief", createdAt: new Date().toISOString() },
  { _id: "prev_q4", name: "Dr. Tariq Al Mansoori", email: "tariq.mansoori@gmail.com", mobile: "+971 50 888 9999", projectType: "Residential", services: ["Villa Joinery", "Master Suite"], location: "Emirates Hills", budget: "High-End Brief", createdAt: new Date().toISOString() },
];

const PREVIEW_ENQUIRIES = [
  {
    _id: "prev_e1",
    name: "Al Futtaim Group",
    email: "facilities@alfuttaim.ae",
    mobile: "+971 50 443 2190",
    services: "Office Fit-Out & Turnkey MEP",
    message: "Requesting site survey for 8,500 sq ft office in Festival City. Need design and build quotation.",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    crmStage: "feasibility",
  },
  {
    _id: "prev_e2",
    name: "Dr. Mona Al Shamsi",
    email: "mona.shamsi@gmail.com",
    mobile: "+971 55 912 3456",
    services: "Residential Architecture & Joinery",
    message: "Luxury villa renovation in Palm Jumeirah Frond N. Need bespoke millwork and master suite architectural glazing.",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    crmStage: "proposal",
  },
];

export default function Dashboard() {
  const { user } = useCreateStore();
  const location = useLocation();

  // Remote MongoDB State
  const [quotes, setQuotes] = useState(() =>
    import.meta.env.DEV && location.search.includes("preview=dashboard")
      ? PREVIEW_QUOTES
      : []
  );
  const [enquiries, setEnquiries] = useState(() =>
    import.meta.env.DEV && location.search.includes("preview=dashboard")
      ? PREVIEW_ENQUIRIES
      : []
  );
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [webDetails, setWebDetails] = useState(DEFAULT_WEBSITE_CONTENT);
  const webDetailsRef = useRef(DEFAULT_WEBSITE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [savingCms, setSavingCms] = useState(false);

  // Interactive Bento Widgets State
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState("services");
  const [weekOffset, setWeekOffset] = useState(0);

  // Lower Section Tab State
  const [activeTab, setActiveTab] = useState("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [stageMap, setStageMap] = useState({});
  const [savingStageId, setSavingStageId] = useState(null);
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
    duration: "",
    videoUrl: "",
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
    eyebrow: "BESPOKE ARCHITECTURE",
    shortDesc: "",
    description: "",
    image: "/static/studio.jpg",
    highlightsText: "Concept Design\nAuthority Approvals\nTurnkey Fit-Out",
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
    date: toDateInputValue(new Date()),
    timeSlot: "10:00 am",
    variant: "dark",
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);

  const applyDashboardBundle = useCallback((bundle) => {
    if (bundle.quotes !== null && (bundle.quotes.length > 0 || !location.search.includes("preview=dashboard"))) {
      setQuotes(bundle.quotes);
    }
    if (bundle.enquiries !== null && (bundle.enquiries.length > 0 || !location.search.includes("preview=dashboard"))) {
      setEnquiries(bundle.enquiries);
    }
    if (bundle.projects !== null) setProjects(bundle.projects);
    if (bundle.categories !== null) setCategories(bundle.categories);
    if (bundle.webDetails) {
      setWebDetails(mergeWebsiteContent(bundle.webDetails));
      setSiteForm(mergeWebsiteContent(bundle.webDetails));
    }
  }, [location.search]);

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
  }, [applyDashboardBundle]);

  // Unified CRM pipeline. 100% real prospective client leads from Quotes and Contact inquiries.
  const allCRMItems = useMemo(() => {
    const list = [];
    quotes.forEach((q) => {
      const id = `quote_${q._id}`;
      const servicesList = Array.isArray(q.services) ? q.services : [];
      const subtitleText = q.projectType
        ? `${q.projectType}${servicesList.length ? ` · ${servicesList.slice(0, 2).join(", ")}` : " Fit-Out"}`
        : servicesList.join(", ") || "Turnkey Brief";
      const currentStageId = stageMap[id] ?? q.crmStage ?? "leads";
      const currentStage = STAGES.find((s) => s.id === currentStageId) || STAGES[0];

      list.push({
        id,
        rawId: q._id,
        type: "quote",
        sourceName: "Quote Request",
        sourceBadge: "Quote",
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
        stage: currentStage.id,
        stageName: currentStage.name,
        stageBadgeStyle: currentStage.badgeClass,
        typeBadge: currentStage.name,
        badgeStyle: currentStage.badgeClass,
        initials: getInitials(q.name || "Q"),
      });
    });

    enquiries.forEach((e) => {
      const id = `enq_${e._id}`;
      const currentStageId = stageMap[id] ?? e.crmStage ?? "leads";
      const currentStage = STAGES.find((s) => s.id === currentStageId) || STAGES[0];

      list.push({
        id,
        rawId: e._id,
        type: "enquiry",
        sourceName: "Contact Form",
        sourceBadge: "Contact",
        title: e.name || "Client Inquiry",
        subtitle: e.services || "Interior & Fit-Out",
        location: "Dubai, UAE",
        budget: "Direct Web Form",
        email: e.email,
        mobile: e.mobile,
        message: e.message,
        date: e.createdAt,
        stage: currentStage.id,
        stageName: currentStage.name,
        stageBadgeStyle: currentStage.badgeClass,
        typeBadge: currentStage.name,
        badgeStyle: currentStage.badgeClass,
        initials: getInitials(e.name || "IN"),
      });
    });

    return list;
  }, [quotes, enquiries, stageMap]);

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

  const services = webDetails.services || DEFAULT_WEBSITE_CONTENT.services;
  const activeServicesCount = services.filter((s) => s.active !== false).length;
  const tasks = webDetails.crmTasks || [];
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const calendarEvents = webDetails.calendarEvents || [];

  const featuredProj = projects[featuredIndex % Math.max(projects.length, 1)] || {
    title: "Atelier Showcase",
    sector: "Luxury Residential",
    location: "Dubai, UAE",
    size: "14,500 sq.ft",
    images: ["/static/hero-aperture-v2.webp"],
  };

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

  const weekColumns = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return {
        name,
        num: d.getDate(),
        month: d.toLocaleDateString("en-GB", { month: "short" }),
        isoDate: toDateInputValue(d),
        isToday: toDateInputValue(d) === toDateInputValue(today),
      };
    });
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const first = weekColumns[0];
    const last = weekColumns[weekColumns.length - 1];
    if (!first || !last) return "This week";
    return `${first.num} ${first.month} - ${last.num} ${last.month}`;
  }, [weekColumns]);

  const openCalendarModal = () => {
    const preferredIndex = weekColumns.findIndex((column) => column.isToday);
    const dayIndex = preferredIndex >= 0 ? preferredIndex : 0;
    setCalendarForm((current) => ({
      ...current,
      dayIndex,
      date: weekColumns[dayIndex]?.isoDate || toDateInputValue(new Date()),
    }));
    setCalendarModalOpen(true);
  };

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
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to publish website update.");
      return false;
    } finally {
      setSavingCms(false);
    }
  };

  // Toggle Task Completion
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

  // Project CRUD Handlers
  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      categoryId: categories[0]?._id || "",
      size: "12,000 sq.ft",
      location: "Dubai, UAE",
      scope: "Turnkey Design & Fit-Out",
      duration: "",
      videoUrl: "",
      sector: "Residential",
      description: "",
      isFeatured: false,
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
      duration: proj.duration || "",
      videoUrl: proj.videoUrl || "",
      sector: proj.sector || "",
      description: proj.description || "",
      isFeatured: Boolean(proj.isFeatured),
    });
    setProjectFiles([]);
    setExistingImages(proj.images || []);
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
      fd.append("duration", projectForm.duration || "");
      fd.append("videoUrl", projectForm.videoUrl || "");
      fd.append("sector", projectForm.sector || "");
      fd.append("description", projectForm.description || "");
      fd.append("isFeatured", Boolean(projectForm.isFeatured));
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

  // Service CRUD Handlers
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
      ...srv,
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

    const serviceContent = { ...serviceForm };
    delete serviceContent.highlightsText;
    const newServiceObj = {
      ...serviceContent,
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

    const saved = await saveWebDetailsPatch(
      { services: nextServices },
      "Service published to live website!"
    );
    if (saved) setServiceModalOpen(false);
  };

  const handleDeleteService = async (idx) => {
    if (!window.confirm("Remove this service from the live website?")) return;
    const nextServices = services.filter((_, i) => i !== idx);
    await saveWebDetailsPatch({ services: nextServices }, "Service removed from website");
  };

  // Calendar Event Handler
  const cleanCalendarEvent = (evt) => ({
    id: String(evt.id || `evt-${Date.now()}`),
    dayIndex: Number(evt.dayIndex ?? 0),
    date: String(evt.date || ""),
    timeSlot: String(evt.timeSlot || "10:00 am"),
    title: String(evt.title || "").trim(),
    subtitle: String(evt.subtitle || "").trim(),
    variant: String(evt.variant || "dark"),
    phone: String(evt.phone || "").trim(),
    location: String(evt.location || "").trim(),
  });

  const handleAddCalendarEvent = async (e) => {
    e.preventDefault();
    if (!calendarForm.title.trim() || !calendarForm.date) {
      toast.error("Add a title and date for this visit.");
      return;
    }
    const newEvt = cleanCalendarEvent({
      ...calendarForm,
      id: `evt-${Date.now()}`,
    });
    const nextEvents = calendarEvents.map(cleanCalendarEvent).concat(newEvt);
    const saved = await saveWebDetailsPatch(
      { calendarEvents: nextEvents },
      "Schedule updated"
    );
    if (!saved) return;
    setCalendarModalOpen(false);
    setCalendarForm({
      title: "",
      subtitle: "",
      dayIndex: 2,
      date: weekColumns[2]?.isoDate || toDateInputValue(new Date()),
      timeSlot: "10:00 am",
      variant: "dark",
      phone: "",
      location: "",
    });
  };

  const handleDeleteCalendarEvent = async (evtId) => {
    const nextEvents = calendarEvents.filter((ev) => ev.id !== evtId).map(cleanCalendarEvent);
    await saveWebDetailsPatch({ calendarEvents: nextEvents }, "Schedule event removed");
  };

  const scheduleVisitForClient = (client) => {
    const preferredIndex = weekColumns.findIndex((column) => column.isToday);
    const dayIndex = preferredIndex >= 0 ? preferredIndex : 0;
    setCalendarForm({
      title: `${client.title} · Site Visit`,
      subtitle: `${client.subtitle || "Initial Fit-Out Survey"} · ${client.location || "Dubai"}`,
      phone: client.mobile || "",
      location: client.location || "Dubai, UAE",
      dayIndex,
      date: weekColumns[dayIndex]?.isoDate || toDateInputValue(new Date()),
      timeSlot: "10:00 am",
      variant: "dark",
    });
    setInspectedItem(null);
    setCalendarModalOpen(true);
  };

  // Pipeline Drag & Drop. Real-time stage update persisted to MongoDB.
  const updateItemStage = async (id, stageId, label) => {
    const item = allCRMItems.find((candidate) => candidate.id === id);
    if (!item || item.stage === stageId || savingStageId) return item?.stage === stageId;

    const previousStage = item.stage;
    const stageObj = STAGES.find((stage) => stage.id === stageId);
    const stageName = stageObj?.name || stageId;

    setSavingStageId(id);
    setStageMap((prev) => ({ ...prev, [id]: stageId }));

    const isDevPreview = import.meta.env.DEV && location.search.includes("preview=dashboard");
    if (item.type === "project" || isDevPreview) {
      if (item.type === "quote") {
        setQuotes((prev) =>
          prev.map((q) => (q._id === item.rawId ? { ...q, crmStage: stageId } : q))
        );
      } else if (item.type === "enquiry") {
        setEnquiries((prev) =>
          prev.map((e) => (e._id === item.rawId ? { ...e, crmStage: stageId } : e))
        );
      }
      setSavingStageId(null);
      toast.success(`Moved "${label}" to ${stageName}`);
      return true;
    }

    try {
      const api = item.type === "quote" ? quoteAPI : enquiryAPI;
      const response = await api.stage(item.rawId, stageId);
      const savedItem = response?.data?.data;
      const mergeSavedStage = (record) =>
        record._id === item.rawId
          ? { ...record, ...(savedItem || {}), crmStage: stageId }
          : record;

      if (item.type === "quote") {
        setQuotes((prev) => prev.map(mergeSavedStage));
      } else {
        setEnquiries((prev) => prev.map(mergeSavedStage));
      }

      toast.success(`Moved "${label}" to ${stageName}`);
      return true;
    } catch (error) {
      setStageMap((prev) => ({ ...prev, [id]: previousStage }));
      toast.error(error?.response?.data?.message || "Could not save the CRM stage.");
      return false;
    } finally {
      setSavingStageId(null);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1480px",
        margin: "0 auto",
        padding: "0 28px 60px",
      }}
    >
      {/* 1. OPERATIONS HEADER & QUICK STATS */}
      <DashboardHeader
        user={user}
        loading={loading}
        setActiveTab={setActiveTab}
        projects={projects}
        activeServicesCount={activeServicesCount}
        quotes={quotes}
        enquiries={enquiries}
      />

      {/* 2. ARCHITECTURAL BENTO GRID */}
      <section className="crex-bento-grid" style={{ marginBottom: "28px" }}>
        {/* CARD 1: FEATURED ATELIER SHOWCASE */}
        <FeaturedProjectCard
          featuredProj={featuredProj}
          setFeaturedIndex={setFeaturedIndex}
          projects={projects}
          openEditProjectModal={openEditProjectModal}
          openCreateProjectModal={openCreateProjectModal}
        />

        {/* CARD 2: PIPELINE VELOCITY OVERVIEW (Spans 2 columns) */}
        <PipelineProgressCard
          allCRMItems={allCRMItems}
          setActiveTab={setActiveTab}
          weeklyBars={weeklyBars}
        />

        {/* COLUMN 4 RIGHT STACK: TASK QUEUE (Spans 2 Rows) */}
        <TaskQueueCard
          activeServicesCount={activeServicesCount}
          setActiveTab={setActiveTab}
          projects={projects}
          tasks={tasks}
          completedTasksCount={completedTasksCount}
          handleToggleTask={handleToggleTask}
          addingTask={addingTask}
          handleAddTask={handleAddTask}
          newTaskText={newTaskText}
          setNewTaskText={setNewTaskText}
          setAddingTask={setAddingTask}
        />

        {/* CARD 5: LIVE WEBSITE CMS ACCORDIONS */}
        <WebsiteContentCard
          setOpenAccordion={setOpenAccordion}
          openAccordion={openAccordion}
          projects={projects}
          openEditProjectModal={openEditProjectModal}
          openCreateProjectModal={openCreateProjectModal}
          services={services}
          openEditServiceModal={openEditServiceModal}
          openCreateServiceModal={openCreateServiceModal}
          setActiveTab={setActiveTab}
          siteForm={siteForm}
          setSiteForm={setSiteForm}
          savingCms={savingCms}
          saveWebDetailsPatch={saveWebDetailsPatch}
        />

        {/* CARD 6: CALENDAR & SITE VISITS TIMELINE */}
        <CalendarCard
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          weekLabel={weekLabel}
          openCalendarModal={openCalendarModal}
          weekColumns={weekColumns}
          calendarEvents={calendarEvents}
          handleDeleteCalendarEvent={handleDeleteCalendarEvent}
        />
      </section>

      {/* 3. LIVE WEBSITE CMS & CRM WORKSPACE (REQUESTS, PIPELINE, PROJECTS, SERVICES) */}
      <DashboardTabs
        projects={projects}
        services={services}
        allCRMItems={allCRMItems}
        quotes={quotes}
        enquiries={enquiries}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openCreateProjectModal={openCreateProjectModal}
        openCreateServiceModal={openCreateServiceModal}
        setSiteForm={setSiteForm}
        webDetails={webDetails}
        setSiteModalOpen={setSiteModalOpen}
        categories={categories}
        openEditProjectModal={openEditProjectModal}
        handleDeleteProject={handleDeleteProject}
        openEditServiceModal={openEditServiceModal}
        handleDeleteService={handleDeleteService}
        filteredCRMItems={filteredCRMItems}
        draggedId={draggedId}
        updateItemStage={updateItemStage}
        savingStageId={savingStageId}
        setDraggedId={setDraggedId}
        setInspectedItem={setInspectedItem}
      />

      {/* =====================================================================
          MODAL A: CREATE / EDIT WEBSITE PROJECT
          ===================================================================== */}
      <ProjectEditorModal
        projectModalOpen={projectModalOpen}
        setProjectModalOpen={setProjectModalOpen}
        editingProject={editingProject}
        handleSaveProject={handleSaveProject}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        categories={categories}
        fileInputRef={fileInputRef}
        setProjectFiles={setProjectFiles}
        existingImages={existingImages}
        setExistingImages={setExistingImages}
        savingCms={savingCms}
      />

      {/* =====================================================================
          MODAL B: CREATE / EDIT SERVICE
          ===================================================================== */}
      <ServiceEditorModal
        serviceModalOpen={serviceModalOpen}
        setServiceModalOpen={setServiceModalOpen}
        editingServiceIdx={editingServiceIdx}
        handleSaveService={handleSaveService}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        savingCms={savingCms}
      />

      {/* =====================================================================
          MODAL C: FULL WEBSITE SETTINGS & MANIFESTO EDITOR
          ===================================================================== */}
      <SiteSettingsModal
        siteModalOpen={siteModalOpen}
        setSiteModalOpen={setSiteModalOpen}
        saveWebDetailsPatch={saveWebDetailsPatch}
        siteForm={siteForm}
        setSiteForm={setSiteForm}
        savingCms={savingCms}
      />

      {/* =====================================================================
          MODAL D: SCHEDULE MILESTONE EVENT
          ===================================================================== */}
      <CalendarEventModal
        calendarModalOpen={calendarModalOpen}
        setCalendarModalOpen={setCalendarModalOpen}
        handleAddCalendarEvent={handleAddCalendarEvent}
        calendarForm={calendarForm}
        setCalendarForm={setCalendarForm}
        weekColumns={weekColumns}
        allCRMItems={allCRMItems}
        projects={projects}
      />

      {/* =====================================================================
          DRAWER: SLIDE-OVER INSPECTION FOR QUOTES & LEADS
          ===================================================================== */}
      <PipelineItemModal
        inspectedItem={inspectedItem}
        setInspectedItem={setInspectedItem}
        updateItemStage={updateItemStage}
        savingStageId={savingStageId}
        onScheduleVisit={scheduleVisitForClient}
      />
    </div>
  );
}

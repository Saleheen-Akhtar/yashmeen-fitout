import DashboardHeader from '../../components/admin/dashboard/DashboardHeader';
import FeaturedProjectCard from '../../components/admin/dashboard/FeaturedProjectCard';
import PipelineProgressCard from '../../components/admin/dashboard/PipelineProgressCard';
import StudioTimerCard from '../../components/admin/dashboard/StudioTimerCard';
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
import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { projectAPI, webDetailsAPI } from "../../services/api";
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
      setWebDetails(mergeWebsiteContent(bundle.webDetails));
      setSiteForm(mergeWebsiteContent(bundle.webDetails));
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
  const tasks = webDetails.crmTasks || [];

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const syncScore = tasks.length
    ? Math.round((completedTasksCount / tasks.length) * 100)
    : 40;

  const calendarEvents = webDetails.calendarEvents || [];

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
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to publish website update.");
      return false;
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
      duration: proj.duration || "",
      videoUrl: proj.videoUrl || "",
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
      fd.append("duration", projectForm.duration || "");
      fd.append("videoUrl", projectForm.videoUrl || "");
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
      <DashboardHeader
        user={user}
        loading={loading}
        leadsPct={leadsPct}
        quotesPct={quotesPct}
        siteSyncPct={siteSyncPct}
        outputPct={outputPct}
        setActiveTab={setActiveTab}
        projects={projects}
        activeServicesCount={activeServicesCount}
        quotes={quotes}
        enquiries={enquiries}
      />

      {/* =====================================================================
          2. 4-COLUMN CREXTIO BENTO GRID
          ===================================================================== */}
      <section className="crex-bento-grid" style={{ marginBottom: "32px" }}>
        {/* CARD 1: FEATURED WEBSITE PROJECT SHOWCASE (Portrait Photo Card) */}
        <FeaturedProjectCard
          featuredProj={featuredProj}
          setFeaturedIndex={setFeaturedIndex}
          projects={projects}
          openEditProjectModal={openEditProjectModal}
          openCreateProjectModal={openCreateProjectModal}
        />

        {/* CARD 2: PIPELINE VELOCITY BAR CHART ("Progress" Visual Match) */}
        <PipelineProgressCard
          allCRMItems={allCRMItems}
          setActiveTab={setActiveTab}
          weeklyBars={weeklyBars}
        />

        {/* CARD 3: TURNKEY STUDIO TRACKER DIAL */}
        <StudioTimerCard
          dialTicks={dialTicks}
          progressFraction={progressFraction}
          formattedTimer={formattedTimer}
          setTimerRunning={setTimerRunning}
          timerRunning={timerRunning}
          setTimerSeconds={setTimerSeconds}
        />

        {/* COLUMN 4 RIGHT STACK (Spans 2 Rows): TOP WEBSITE SYNC + TALL OBSIDIAN TASK QUEUE */}
        <TaskQueueCard
          syncScore={syncScore}
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

        {/* CARD 5 (Bottom-Left): COLLAPSIBLE LIVE WEBSITE CMS ACCORDIONS */}
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

        {/* CARD 6 (Bottom-Center, Span 2 Cols): CALENDAR & SITE VISITS TIMELINE */}
        <CalendarCard
          setMonthOffset={setMonthOffset}
          monthNames={monthNames}
          setCalendarModalOpen={setCalendarModalOpen}
          weekColumns={weekColumns}
          calendarEvents={calendarEvents}
          handleDeleteCalendarEvent={handleDeleteCalendarEvent}
        />
      </section>

      {/* =====================================================================
          3. LIVE WEBSITE CMS & CRM WORKSPACE (PROJECTS, SERVICES, KANBAN, LEADS)
          ===================================================================== */}
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
        setDraggedId={setDraggedId}
        setInspectedItem={setInspectedItem}
      />

      {/* =====================================================================
          MODAL A: CREATE / EDIT WEBSITE PROJECT (Syncs to Homepage & /projects)
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
          MODAL B: CREATE / EDIT SERVICE (Syncs to Services Pages & Homepage)
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
      />

      {/* =====================================================================
          DRAWER: SLIDE-OVER INSPECTION FOR QUOTES & LEADS
          ===================================================================== */}
      <PipelineItemModal
        inspectedItem={inspectedItem}
        setInspectedItem={setInspectedItem}
        updateItemStage={updateItemStage}
      />
    </div>
  );
}

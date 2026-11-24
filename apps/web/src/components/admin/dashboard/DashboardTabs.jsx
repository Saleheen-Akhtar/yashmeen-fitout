import { useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiEdit2,
  FiGlobe,
  FiGrid,
  FiList,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import AdminPager from "../AdminPager";
import AdminMediaImage from "../AdminMediaImage";
import {
  FALLBACK_PROJECT_IMG,
  STAGES,
  formatDateShort,
  resolveImage,
} from "./dashboardData";
import { createWhatsAppUrl } from "../../../lib/calendarExport";

const DEFAULT_PAGE_SIZES = {
  projects: 6,
  services: 6,
  leads: 5,
};

const pageSlice = (items, requestedPage, pageSize) => {
  const totalPages = Math.max(Math.ceil(items.length / pageSize), 1);
  const page = Math.min(Math.max(requestedPage, 1), totalPages);
  return {
    page,
    items: items.slice((page - 1) * pageSize, page * pageSize),
  };
};

export default function DashboardTabs({
  projects,
  services,
  allCRMItems,
  quotes,
  enquiries,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  openCreateProjectModal,
  openCreateServiceModal,
  setSiteForm,
  webDetails,
  setSiteModalOpen,
  categories,
  openEditProjectModal,
  handleDeleteProject,
  openEditServiceModal,
  handleDeleteService,
  filteredCRMItems,
  draggedId,
  updateItemStage,
  savingStageId,
  setDraggedId,
  setInspectedItem,
}) {
  const [pages, setPages] = useState({ projects: 1, services: 1, leads: 1 });
  const [pageSizes, setPageSizes] = useState(DEFAULT_PAGE_SIZES);

  // Filters per tab for maximum efficiency
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const [leadStageFilter, setLeadStageFilter] = useState("all");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");
  const [projectViewMode, setProjectViewMode] = useState("grid");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");
  const [kanbanTypeFilter, setKanbanTypeFilter] = useState("all");

  const query = searchQuery.trim().toLowerCase();

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesQuery =
        !query ||
        project.title?.toLowerCase().includes(query) ||
        project.location?.toLowerCase().includes(query) ||
        project.sector?.toLowerCase().includes(query);

      const categoryId =
        typeof project.categoryId === "object"
          ? project.categoryId?._id
          : project.categoryId;
      const matchesCategory =
        projectCategoryFilter === "all" || categoryId === projectCategoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [projects, query, projectCategoryFilter]);

  const filteredServices = useMemo(() => {
    return services
      .map((service, index) => ({ service, index }))
      .filter(({ service }) => {
        const matchesQuery =
          !query ||
          service.title?.toLowerCase().includes(query) ||
          service.shortDesc?.toLowerCase().includes(query);

        const isLive = service.active !== false;
        const matchesStatus =
          serviceStatusFilter === "all" ||
          (serviceStatusFilter === "live" && isLive) ||
          (serviceStatusFilter === "hidden" && !isLive);

        return matchesQuery && matchesStatus;
      });
  }, [services, query, serviceStatusFilter]);

  const allLeadItems = useMemo(
    () => filteredCRMItems.filter((item) => item.type !== "project"),
    [filteredCRMItems],
  );

  const filteredLeadItems = useMemo(() => {
    return allLeadItems.filter((item) => {
      const matchesSource =
        leadSourceFilter === "all" || item.type === leadSourceFilter;
      const matchesStage =
        leadStageFilter === "all" || item.stage === leadStageFilter;
      return matchesSource && matchesStage;
    });
  }, [allLeadItems, leadSourceFilter, leadStageFilter]);

  const filteredKanbanItems = useMemo(() => {
    if (kanbanTypeFilter === "all") return filteredCRMItems;
    return filteredCRMItems.filter((item) => item.type === kanbanTypeFilter);
  }, [filteredCRMItems, kanbanTypeFilter]);

  const projectPage = pageSlice(
    filteredProjects,
    pages.projects,
    pageSizes.projects,
  );
  const servicePage = pageSlice(
    filteredServices,
    pages.services,
    pageSizes.services,
  );
  const leadsPage = pageSlice(
    filteredLeadItems,
    pages.leads,
    pageSizes.leads,
  );

  const tabs = [
    { id: "leads", label: "Requests", count: quotes.length + enquiries.length },
    { id: "kanban", label: "Pipeline", count: allCRMItems.length },
    { id: "projects", label: "Projects", count: projects.length },
    { id: "services", label: "Services", count: services.length },
  ];

  const setPage = (key, value) =>
    setPages((current) => ({ ...current, [key]: value }));

  const setPageSize = (key, value) => {
    setPageSizes((current) => ({ ...current, [key]: value }));
    setPages((current) => ({ ...current, [key]: 1 }));
  };

  return (
    <section id="crm-cms-workspace" className="workspace-panel">
      {/* Top Toolbar: Tabs + Search + Actions */}
      <header className="workspace-toolbar">
        <nav className="workspace-tabs" aria-label="Dashboard workspace">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`workspace-tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setPages((current) => ({ ...current, [tab.id]: 1 }));
              }}
              aria-pressed={activeTab === tab.id}
            >
              <span>{tab.label}</span>
              <span className="workspace-tab-count">{tab.count}</span>
            </button>
          ))}
        </nav>

        <div className="workspace-actions">
          <div className="workspace-search">
            <FiSearch size={14} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search this view"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPages((current) => ({ ...current, [activeTab]: 1 }));
              }}
              aria-label="Search dashboard workspace"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--crex-muted)",
                  padding: "2px",
                  display: "inline-flex",
                }}
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {activeTab === "projects" && (
            <button type="button" onClick={openCreateProjectModal} className="adm-btn-primary">
              <FiPlus size={14} />
              <span>New project</span>
            </button>
          )}

          {activeTab === "services" && (
            <button type="button" onClick={openCreateServiceModal} className="adm-btn-primary">
              <FiPlus size={14} />
              <span>New service</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setSiteForm(webDetails);
              setSiteModalOpen(true);
            }}
            className="adm-btn-secondary"
          >
            <FiGlobe size={14} />
            <span>Website content</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          TAB 1: REQUESTS (QUOTES & INQUIRIES) - OPTIMIZED TABLE
          ===================================================================== */}
      {activeTab === "leads" && (
        <div className="workspace-view crex-animate-in">
          <div className="workspace-view-head">
            <div>
              <span className="workspace-kicker">Client intake</span>
              <h2>Quotes and inquiries</h2>
            </div>
          </div>

          {/* Quick Filter Bar: Source & Stage Pills */}
          <div className="workspace-filter-bar">
            <div className="workspace-filter-group">
              <button
                type="button"
                className={`workspace-filter-pill ${leadSourceFilter === "all" ? "is-active" : ""}`}
                onClick={() => {
                  setLeadSourceFilter("all");
                  setPage("leads", 1);
                }}
              >
                <span>All sources</span>
                <span className="pill-count">{allLeadItems.length}</span>
              </button>
              <button
                type="button"
                className={`workspace-filter-pill ${leadSourceFilter === "quote" ? "is-active" : ""}`}
                onClick={() => {
                  setLeadSourceFilter("quote");
                  setPage("leads", 1);
                }}
              >
                <span>Quotes</span>
                <span className="pill-count">{quotes.length}</span>
              </button>
              <button
                type="button"
                className={`workspace-filter-pill ${leadSourceFilter === "enquiry" ? "is-active" : ""}`}
                onClick={() => {
                  setLeadSourceFilter("enquiry");
                  setPage("leads", 1);
                }}
              >
                <span>Inquiries</span>
                <span className="pill-count">{enquiries.length}</span>
              </button>
            </div>

            <div className="workspace-filter-group">
              <select
                className="workspace-select-filter"
                value={leadStageFilter}
                onChange={(e) => {
                  setLeadStageFilter(e.target.value);
                  setPage("leads", 1);
                }}
                aria-label="Filter requests by stage"
              >
                <option value="all">All stages ({allLeadItems.length})</option>
                {STAGES.map((stg) => {
                  const count = allLeadItems.filter((i) => i.stage === stg.id).length;
                  return (
                    <option key={stg.id} value={stg.id}>
                      {stg.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Requests Table */}
          {leadsPage.items.length === 0 ? (
            <div className="workspace-empty">No requests match the selected filters.</div>
          ) : (
            <div className="workspace-table-shell adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Scope / Service</th>
                    <th>Source</th>
                    <th>Stage (One-click update)</th>
                    <th>Received</th>
                    <th aria-label="Actions" style={{ textAlign: "right" }}>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsPage.items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Client">
                        <div className="workspace-client">
                          <span className="crm-avatar" aria-hidden="true">{item.initials}</span>
                          <div>
                            <strong>{item.title}</strong>
                            <span>{item.email || item.mobile}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Scope">{item.subtitle}</td>
                      <td data-label="Source">
                        <span className="card-source-pill">{item.sourceName || "Lead"}</span>
                      </td>
                      <td data-label="Stage">
                        <select
                          className="table-stage-select"
                          value={item.stage}
                          disabled={savingStageId === item.id}
                          onChange={(e) => updateItemStage(item.id, e.target.value, item.title)}
                          aria-label={`Change stage for ${item.title}`}
                        >
                          {STAGES.map((stage) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Received">{formatDateShort(item.date)}</td>
                      <td data-label="Action" style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                          {item.mobile && (
                            <a
                              href={createWhatsAppUrl(
                                item.mobile,
                                `Hello ${item.title}, thank you for contacting Yashmeen Future Building & Fit-Out regarding your ${item.subtitle} brief. We would like to discuss your project requirements.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="table-action-whatsapp"
                              title={`Chat with ${item.title} on WhatsApp`}
                              aria-label={`Chat with ${item.title} on WhatsApp`}
                            >
                              <FaWhatsapp size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="workspace-inspect"
                            onClick={() => setInspectedItem(item)}
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AdminPager
            page={leadsPage.page}
            pageSize={pageSizes.leads}
            pageSizeOptions={[5, 10, 20]}
            onPageSizeChange={(newSize) => setPageSize("leads", newSize)}
            totalItems={filteredLeadItems.length}
            onPageChange={(value) => setPage("leads", value)}
            noun="requests"
          />
        </div>
      )}

      {/* =====================================================================
          TAB 2: PIPELINE (KANBAN BOARD) - SCROLLABLE & ACCESSIBLE
          ===================================================================== */}
      {activeTab === "kanban" && (
        <div className="workspace-view crex-animate-in">
          <div className="workspace-view-head">
            <div>
              <span className="workspace-kicker">Sales workflow</span>
              <h2>CRM pipeline</h2>
            </div>
            <span className="workspace-help">Drag cards or use the stage selector inside</span>
          </div>

          {/* Quick Filter Bar for Pipeline */}
          <div className="workspace-filter-bar">
            <div className="workspace-filter-group">
              <button
                type="button"
                className={`workspace-filter-pill ${kanbanTypeFilter === "all" ? "is-active" : ""}`}
                onClick={() => setKanbanTypeFilter("all")}
              >
                <span>All records</span>
                <span className="pill-count">{filteredCRMItems.length}</span>
              </button>
              <button
                type="button"
                className={`workspace-filter-pill ${kanbanTypeFilter === "quote" ? "is-active" : ""}`}
                onClick={() => setKanbanTypeFilter("quote")}
              >
                <span>Quotes only</span>
                <span className="pill-count">
                  {filteredCRMItems.filter((i) => i.type === "quote").length}
                </span>
              </button>
              <button
                type="button"
                className={`workspace-filter-pill ${kanbanTypeFilter === "enquiry" ? "is-active" : ""}`}
                onClick={() => setKanbanTypeFilter("enquiry")}
              >
                <span>Inquiries only</span>
                <span className="pill-count">
                  {filteredCRMItems.filter((i) => i.type === "enquiry").length}
                </span>
              </button>
            </div>
          </div>

          <div className="crm-board">
            {STAGES.map((stage) => {
              const columnItems = filteredKanbanItems.filter((item) => item.stage === stage.id);
              return (
                <section
                  key={stage.id}
                  className={`crm-stage ${columnItems.length === 0 ? "is-empty" : ""}`}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedId) {
                      const item = allCRMItems.find((candidate) => candidate.id === draggedId);
                      if (item) updateItemStage(draggedId, stage.id, item.title);
                      setDraggedId(null);
                    }
                  }}
                >
                  <header>
                    <span>{stage.name}</span>
                    <strong>{columnItems.length}</strong>
                  </header>
                  <div className="crm-stage-list">
                    {columnItems.length === 0 ? (
                      <div className="crm-stage-empty">No records</div>
                    ) : (
                      columnItems.map((item) => (
                        <article
                          key={item.id}
                          className="crm-request-card"
                          draggable={!savingStageId}
                          onDragStart={() => setDraggedId(item.id)}
                          onDragEnd={() => setDraggedId(null)}
                          onClick={() => setInspectedItem(item)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") setInspectedItem(item);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-busy={savingStageId === item.id}
                        >
                          <div className="crm-request-head">
                            <span className="crm-avatar">{item.initials}</span>
                            <div>
                              <h3>{item.title}</h3>
                              <p>{item.subtitle}</p>
                            </div>
                          </div>
                          <footer>
                            <span>{item.location}</span>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              {item.mobile && (
                                <a
                                  href={createWhatsAppUrl(
                                    item.mobile,
                                    `Hello ${item.title}, this is Yashmeen Future Building & Fit-Out following up on your project status.`
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="card-action-whatsapp"
                                  title={`Message ${item.title} on WhatsApp`}
                                  aria-label={`Message ${item.title} on WhatsApp`}
                                >
                                  <FaWhatsapp size={11} />
                                </a>
                              )}
                              <span className="card-source-pill">{item.sourceName || "Lead"}</span>
                              <span className={item.stageBadgeStyle || item.badgeStyle}>{item.stageName}</span>
                            </div>
                          </footer>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: PROJECTS (GRID VS COMPACT LIST VIEW)
          ===================================================================== */}
      {activeTab === "projects" && (
        <div className="workspace-view crex-animate-in">
          <div className="workspace-view-head">
            <div>
              <span className="workspace-kicker">Live portfolio</span>
              <h2>Selected work</h2>
            </div>
            <a href="/projects" target="_blank" rel="noreferrer" className="workspace-text-link">
              View public page <FiArrowUpRight size={13} />
            </a>
          </div>

          {/* Quick Filter Bar: Category Select & View Switcher */}
          <div className="workspace-filter-bar">
            <div className="workspace-filter-group">
              <select
                className="workspace-select-filter"
                value={projectCategoryFilter}
                onChange={(e) => {
                  setProjectCategoryFilter(e.target.value);
                  setPage("projects", 1);
                }}
                aria-label="Filter projects by category"
              >
                <option value="all">All categories ({projects.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="workspace-filter-group">
              <div className="workspace-view-toggle" role="group" aria-label="Project view mode">
                <button
                  type="button"
                  className={projectViewMode === "grid" ? "is-active" : ""}
                  onClick={() => setProjectViewMode("grid")}
                  title="Grid view"
                >
                  <FiGrid size={13} />
                </button>
                <button
                  type="button"
                  className={projectViewMode === "list" ? "is-active" : ""}
                  onClick={() => setProjectViewMode("list")}
                  title="Compact list view"
                >
                  <FiList size={13} />
                </button>
              </div>
            </div>
          </div>

          {projectPage.items.length === 0 ? (
            <div className="workspace-empty">No projects match this search or filter.</div>
          ) : projectViewMode === "grid" ? (
            <div className="workspace-project-grid">
              {projectPage.items.map((project) => {
                const categoryName =
                  typeof project.categoryId === "object"
                    ? project.categoryId?.categoryName
                    : categories.find((c) => c._id === project.categoryId)?.categoryName ||
                      "Fit-Out";
                return (
                  <article key={project._id} className="workspace-project-card">
                    <AdminMediaImage
                      src={resolveImage(project.images?.[0])}
                      fallbackSrc={FALLBACK_PROJECT_IMG}
                      alt={project.title}
                    />
                    <div className="workspace-project-copy">
                      <span className="workspace-kicker">{categoryName}</span>
                      <h3>{project.title}</h3>
                      <p>
                        {project.location || "Dubai, UAE"} · {project.size || "Turnkey"}
                      </p>
                      <div className="workspace-card-actions">
                        <a href={`/project/details/${project._id}`} target="_blank" rel="noreferrer">
                          Preview <FiArrowUpRight size={12} />
                        </a>
                        <div>
                          <button
                            type="button"
                            onClick={() => openEditProjectModal(project)}
                            aria-label={`Edit ${project.title}`}
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="is-danger"
                            onClick={() => handleDeleteProject(project._id)}
                            aria-label={`Delete ${project.title}`}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* Compact Efficient Table View */
            <div className="workspace-table-shell adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Scope / Size</th>
                    <th aria-label="Actions" style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projectPage.items.map((project) => {
                    const categoryName =
                      typeof project.categoryId === "object"
                        ? project.categoryId?.categoryName
                        : categories.find((c) => c._id === project.categoryId)?.categoryName ||
                          "Fit-Out";
                    return (
                      <tr key={project._id}>
                        <td data-label="Project">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <AdminMediaImage
                              src={resolveImage(project.images?.[0])}
                              fallbackSrc={FALLBACK_PROJECT_IMG}
                              alt={project.title}
                              style={{
                                width: "42px",
                                height: "32px",
                                borderRadius: "6px",
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <strong>{project.title}</strong>
                              <div style={{ fontSize: "11px", color: "var(--crex-muted)" }}>
                                {project.sector || "Architectural"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Category">
                          <span className="adm-chip">{categoryName}</span>
                        </td>
                        <td data-label="Location">{project.location || "Dubai, UAE"}</td>
                        <td data-label="Scope">{project.size || "Turnkey"}</td>
                        <td data-label="Actions" style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              className="adm-action-btn"
                              onClick={() => openEditProjectModal(project)}
                              aria-label={`Edit ${project.title}`}
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              type="button"
                              className="adm-action-btn is-danger"
                              onClick={() => handleDeleteProject(project._id)}
                              aria-label={`Delete ${project.title}`}
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <AdminPager
            page={projectPage.page}
            pageSize={pageSizes.projects}
            pageSizeOptions={projectViewMode === "grid" ? [6, 12, 24] : [5, 10, 20]}
            onPageSizeChange={(newSize) => setPageSize("projects", newSize)}
            totalItems={filteredProjects.length}
            onPageChange={(value) => setPage("projects", value)}
            noun="projects"
          />
        </div>
      )}

      {/* =====================================================================
          TAB 4: SERVICES & COPY - OPTIMIZED WITH STATUS FILTERS
          ===================================================================== */}
      {activeTab === "services" && (
        <div className="workspace-view crex-animate-in">
          <div className="workspace-view-head">
            <div>
              <span className="workspace-kicker">Website offer</span>
              <h2>Services and copy</h2>
            </div>
          </div>

          {/* Quick Filter Bar for Services */}
          <div className="workspace-filter-bar">
            <div className="workspace-filter-group">
              <button
                type="button"
                className={`workspace-filter-pill ${serviceStatusFilter === "all" ? "is-active" : ""}`}
                onClick={() => {
                  setServiceStatusFilter("all");
                  setPage("services", 1);
                }}
              >
                <span>All services</span>
                <span className="pill-count">{services.length}</span>
              </button>
              <button
                type="button"
                className={`workspace-filter-pill ${serviceStatusFilter === "live" ? "is-active" : ""}`}
                onClick={() => {
                  setServiceStatusFilter("live");
                  setPage("services", 1);
                }}
              >
                <span>Live only</span>
                <span className="pill-count">
                  {services.filter((s) => s.active !== false).length}
                </span>
              </button>
              <button
                type="button"
                className={`workspace-filter-pill ${serviceStatusFilter === "hidden" ? "is-active" : ""}`}
                onClick={() => {
                  setServiceStatusFilter("hidden");
                  setPage("services", 1);
                }}
              >
                <span>Hidden</span>
                <span className="pill-count">
                  {services.filter((s) => s.active === false).length}
                </span>
              </button>
            </div>
          </div>

          {servicePage.items.length === 0 ? (
            <div className="workspace-empty">No services match this filter.</div>
          ) : (
            <div className="workspace-service-grid">
              {servicePage.items.map(({ service, index }) => (
                <article key={service.id || index} className="workspace-service-card">
                  <img
                    src={service.image || FALLBACK_PROJECT_IMG}
                    alt={service.title}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_PROJECT_IMG;
                    }}
                  />
                  <div>
                    <span className="workspace-kicker">{service.eyebrow || "Service"}</span>
                    <h3>{service.title}</h3>
                    <p>{service.shortDesc}</p>
                  </div>
                  <span className={`workspace-status ${service.active !== false ? "is-live" : ""}`}>
                    {service.active !== false ? "Live" : "Hidden"}
                  </span>
                  <div className="workspace-card-actions">
                    <a href={service.route || `/services/${service.slug}`} target="_blank" rel="noreferrer">
                      Public page <FiArrowUpRight size={12} />
                    </a>
                    <div>
                      <button
                        type="button"
                        onClick={() => openEditServiceModal(service, index)}
                        aria-label={`Edit ${service.title}`}
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => handleDeleteService(index)}
                        aria-label={`Delete ${service.title}`}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <AdminPager
            page={servicePage.page}
            pageSize={pageSizes.services}
            pageSizeOptions={[4, 6, 12]}
            onPageSizeChange={(newSize) => setPageSize("services", newSize)}
            totalItems={filteredServices.length}
            onPageChange={(value) => setPage("services", value)}
            noun="services"
          />
        </div>
      )}
    </section>
  );
}

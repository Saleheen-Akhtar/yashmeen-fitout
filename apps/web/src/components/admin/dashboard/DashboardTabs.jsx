import { FiSearch, FiPlus, FiGlobe, FiArrowUpRight, FiEdit2, FiTrash2 } from "react-icons/fi";
import { resolveImage, FALLBACK_PROJECT_IMG, STAGES, formatDateShort } from './dashboardData';

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
  setDraggedId,
  setInspectedItem,
}) {
  return (
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
  );
}

import { FiChevronUp, FiChevronDown, FiEdit2, FiPlus, FiMoreVertical } from "react-icons/fi";
import { resolveImage, FALLBACK_PROJECT_IMG } from './dashboardData';

export default function WebsiteContentCard({
  setOpenAccordion,
  openAccordion,
  projects,
  openEditProjectModal,
  openCreateProjectModal,
  services,
  openEditServiceModal,
  openCreateServiceModal,
  setActiveTab,
  siteForm,
  setSiteForm,
  savingCms,
  saveWebDetailsPatch,
}) {
  return (
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
  );
}

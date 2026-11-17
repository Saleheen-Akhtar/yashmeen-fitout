import ContentFields from "./ContentFields";
import { DEFAULT_WEBSITE_CONTENT } from "../../../../../../shared/siteContent.js";
import "./content-fields.css";
import { FiX } from "react-icons/fi";
import { SERVICE_IMAGE_PRESETS } from './dashboardData';

export default function ServiceEditorModal({
  serviceModalOpen,
  setServiceModalOpen,
  editingServiceIdx,
  handleSaveService,
  serviceForm,
  setServiceForm,
  savingCms,
}) {
  return (
    serviceModalOpen && (
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

            <details className="cms-settings-section"><summary>Metrics, disciplines, process, projects and FAQs</summary>
              {["kicker","introImage","videoUrl","stats","disciplines","process","projects","faqs"].map(key => <ContentFields key={key} label={key} template={DEFAULT_WEBSITE_CONTENT.services[0][key]} value={serviceForm[key] ?? (Array.isArray(DEFAULT_WEBSITE_CONTENT.services[0][key]) ? [] : "")} onChange={value => setServiceForm(previous => ({...previous,[key]:value}))} />)}
            </details>
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
    )
  );
}

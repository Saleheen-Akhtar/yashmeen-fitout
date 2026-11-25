import { FiX } from "react-icons/fi";
import { resolveImage, FALLBACK_PROJECT_IMG } from './dashboardData';

export default function ProjectEditorModal({
  projectModalOpen,
  setProjectModalOpen,
  editingProject,
  handleSaveProject,
  projectForm,
  setProjectForm,
  categories,
  fileInputRef,
  setProjectFiles,
  existingImages,
  setExistingImages,
  savingCms,
}) {
  return (
    projectModalOpen && (
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

            {["duration", "videoUrl"].map(key => <label key={key} className="cms-fields-field">{key === "duration" ? "Project duration" : "Project video URL"}<input type="text" value={projectForm[key] || ""} onChange={event => setProjectForm(previous => ({...previous,[key]:event.target.value}))} /></label>)}

            <div
              style={{
                display: "grid",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: projectForm.isFeatured ? "rgba(186, 153, 94, 0.12)" : "rgba(0, 0, 0, 0.03)",
                border: projectForm.isFeatured ? "1px solid rgba(186, 153, 94, 0.4)" : "1px solid rgba(0, 0, 0, 0.08)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: projectForm.isFeatured ? "#8b6f3c" : "#1a1a1a" }}>
                    Feature on Homepage Showcase
                  </div>
                  <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
                    Pin this project to the 3D gallery and flagship curation on the home screen
                  </div>
                </div>
                <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(projectForm.isFeatured)}
                    onChange={(e) => setProjectForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#ba995e" }}
                  />
                </label>
              </div>

              {projectForm.isFeatured && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px dashed rgba(186, 153, 94, 0.3)" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#8b6f3c" }}>
                    Showcase Sequence (Position 1 to 6)
                  </label>
                  <select
                    value={projectForm.featuredOrder || 1}
                    onChange={(e) => setProjectForm((p) => ({ ...p, featuredOrder: Number(e.target.value) }))}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid rgba(186, 153, 94, 0.5)",
                      fontSize: "12px",
                      fontWeight: 600,
                      background: "#fff",
                      color: "#1a1a1a",
                      cursor: "pointer",
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        Position #{num} {num === 1 ? "(Initial Center)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ margin: 0 }}>Upload Photography</label>
                <span style={{ fontSize: "11px", color: "#8b6f3c", fontWeight: 500 }}>
                  Optimal 4:5 portrait (e.g. 1600 x 2000px)
                </span>
              </div>
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
    )
  );
}

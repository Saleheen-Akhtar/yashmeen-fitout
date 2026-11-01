import React, { useEffect, useRef, useState } from "react";
import { projectAPI, categoryAPI, itemPath } from "../../services/api";

const palette = {
  blue500: "#3B82F6",
  blue400: "#60A5FA",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate900: "#0F172A",
  white: "#FFFFFF",
  red600: "#DC2626",
  red50: "rgba(220,38,38,0.08)",
  green600: "#16A34A",
  green50: "rgba(22,163,74,0.08)",
};

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// categoryId can come back as a plain id or a populated { _id, name } object
const getCategoryId = (p) =>
  typeof p.categoryId === "object" && p.categoryId !== null
    ? p.categoryId._id
    : p.categoryId;

// Stored paths look like "/projects/abc.jpg"; absolute URLs are used as-is
const imageUrl = (path = "") =>
  /^https?:\/\//i.test(path)
    ? path
    : `${itemPath ?? ""}/${String(path).replace(/^\/+/, "")}`;

// Ask for more than the default page size so the list is not cut off
const FETCH_PARAMS = { limit: 1000, page: 1 };

const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 5;

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [banner, setBanner] = useState(null); // { type, text }

  // modal state (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null => create mode
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formScope, setFormScope] = useState("");
  const [formSector, setFormSector] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImages, setFormImages] = useState([]); // already-saved image paths
  const [newFiles, setNewFiles] = useState([]); // [{ id, file, preview }] to upload
  const fileRef = useRef(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getCategoryLabel = (id) =>
    categories.find((c) => c._id === id)?.categoryName || "-";

  const fetchProjects = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await projectAPI.getAll(FETCH_PARAMS);
      setProjects(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load projects.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: res } = await categoryAPI.getAll(FETCH_PARAMS);
      setCategories(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load categories.",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const resetNewFiles = () => {
    setNewFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.preview));
      return [];
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormCategory("");
    setFormTitle("");
    setFormSize("");
    setFormLocation("");
    setFormScope("");
    setFormSector("");
    setFormVideoUrl("");
    setFormDescription("");
    setFormImages([]);
    resetNewFiles();
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setFormCategory(getCategoryId(p) || "");
    setFormTitle(p.title || "");
    setFormSize(p.size || "");
    setFormLocation(p.location || "");
    setFormScope(p.scope || "");
    setFormSector(p.sector || "");
    setFormVideoUrl(p.videoUrl || "");
    setFormDescription(p.description || "");
    setFormImages(Array.isArray(p.images) ? p.images : []);
    resetNewFiles();
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetNewFiles();
    setModalOpen(false);
  };

  const clearError = () => setFormError("");

  // handles both single and multiple selection
  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow picking the same file again later
    if (!picked.length) return;

    let error = "";
    const accepted = [];
    let room = MAX_IMAGES - formImages.length - newFiles.length;

    for (const file of picked) {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (!file.type.startsWith("image/")) {
        error = `${file.name} is not an image.`;
      } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        error = `${file.name} is larger than ${MAX_IMAGE_MB} MB.`;
      } else if (newFiles.some((f) => f.id === id) || accepted.some((f) => f.id === id)) {
        continue; // already selected
      } else if (room <= 0) {
        error = `You can add up to ${MAX_IMAGES} images.`;
      } else {
        accepted.push({ id, file, preview: URL.createObjectURL(file) });
        room -= 1;
      }
    }

    if (accepted.length) setNewFiles((prev) => [...prev, ...accepted]);
    setFormError(error);
  };

  const removeExisting = (url) =>
    setFormImages((prev) => prev.filter((i) => i !== url));

  const removeNew = (id) =>
    setNewFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const title = formTitle.trim();
    const size = formSize.trim();
    const location = formLocation.trim();
    const scope = formScope.trim();
    const sector = formSector.trim();
    const videoUrl = formVideoUrl.trim();
    const description = formDescription.trim();

    if (!formCategory) return setFormError("Category is required.");
    if (!title) return setFormError("Title is required.");
    if (videoUrl && !isValidUrl(videoUrl)) {
      return setFormError("Video URL must start with http or https.");
    }

    setSaving(true);
    setFormError("");

    // multipart body: text fields + new files under the "images" key
    const payload = new FormData();
    payload.append("categoryId", formCategory);
    payload.append("title", title);
    // sent even when empty, so clearing a field on edit actually clears it
    payload.append("size", size);
    payload.append("location", location);
    payload.append("scope", scope);
    payload.append("sector", sector);
    payload.append("videoUrl", videoUrl);
    payload.append("description", description);
    // images already saved that the user kept (used on edit)
    payload.append("existingImages", JSON.stringify(formImages));
    newFiles.forEach((f) => payload.append("images", f.file));

    try {
      if (editingId) {
        await projectAPI.update(editingId, payload);
        setBanner({ type: "success", text: "Project updated." });
      } else {
        await projectAPI.create(payload);
        setBanner({ type: "success", text: "Project created." });
      }
      await fetchProjects({ silent: true });
      resetNewFiles();
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p) => setDeleteTarget(p);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectAPI.delete(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setBanner({ type: "success", text: `"${deleteTarget.title}" deleted.` });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete project.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    const matchesSearch = !q || p.title?.toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === "all" || getCategoryId(p) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="projPage" style={styles.page}>
      <style>{css}</style>

      <div className="projContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Projects</h2>
            <p style={styles.subtitle}>
              Add your work with images and videos, and organise it by category.
            </p>
          </div>
          <button
            type="button"
            className="projBtnPrimary"
            style={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <PlusIcon /> New project
          </button>
        </div>

        {banner && (
          <div
            style={{
              ...styles.banner,
              background: banner.type === "success" ? palette.green50 : palette.red50,
              border: `1px solid ${banner.type === "success" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
              color: banner.type === "success" ? palette.green600 : palette.red600,
            }}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              style={styles.bannerClose}
              aria-label="Dismiss"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        <div style={styles.filtersRow}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              className="projInput"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
            className="projInput"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading projects…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {projects.length === 0
                ? "No projects yet. Add your first one."
                : "No projects match your filters."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Project</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Images</th>
                    <th style={styles.th}>Video</th>
                    <th style={styles.th}>Added</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const cover = p.images?.[0] ? imageUrl(p.images[0]) : "";
                    const catLabel =
                      typeof p.categoryId === "object" && p.categoryId
                        ? p.categoryId.categoryName
                        : getCategoryLabel(p.categoryId);
                    return (
                      <tr key={p._id} className="projRow">
                        <td style={{ ...styles.td, minWidth: "240px" }}>
                          <div style={styles.projectCell}>
                            {cover ? (
                              <img src={cover} alt="" style={styles.thumb} />
                            ) : (
                              <div style={{ ...styles.thumb, ...styles.thumbEmpty }}>
                                No image
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 500 }}>{p.title}</div>
                              {p.description && (
                                <div style={styles.descPreview}>{p.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{catLabel || "-"}</td>
                        <td style={styles.td}>{p.location || "-"}</td>
                        <td style={styles.td}>{p.images?.length || 0}</td>
                        <td style={styles.td}>
                          {p.videoUrl ? (
                            <a
                              href={p.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.link}
                            >
                              Watch
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={styles.actionsRow}>
                            <button
                              type="button"
                              className="projIconBtn"
                              style={styles.iconBtn}
                              onClick={() => openEditModal(p)}
                              aria-label="Edit project"
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="projIconBtnDanger"
                              style={styles.iconBtn}
                              onClick={() => confirmDelete(p)}
                              aria-label="Delete project"
                            >
                              <TrashIcon />
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
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="projModalOverlay" style={styles.overlay} onClick={closeModal}>
          <div
            className="projModal"
            style={{ ...styles.modal, maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingId ? "Edit project" : "New project"}
              </h3>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={closeModal}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Title</label>
                <input
                  type="text"
                  className="projInput"
                  style={styles.input}
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    clearError();
                  }}
                  placeholder="e.g. EDC Headquarters"
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select
                  className="projInput"
                  style={styles.input}
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    clearError();
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="projFieldRow">
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Size (optional)</label>
                  <input
                    type="text"
                    className="projInput"
                    style={styles.input}
                    value={formSize}
                    onChange={(e) => {
                      setFormSize(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. 15210 Sq. ft"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Location (optional)</label>
                  <input
                    type="text"
                    className="projInput"
                    style={styles.input}
                    value={formLocation}
                    onChange={(e) => {
                      setFormLocation(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Abu Dhabi"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Scope (optional)</label>
                  <input
                    type="text"
                    className="projInput"
                    style={styles.input}
                    value={formScope}
                    onChange={(e) => {
                      setFormScope(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Design and Built Project"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Sector (optional)</label>
                  <input
                    type="text"
                    className="projInput"
                    style={styles.input}
                    value={formSector}
                    onChange={(e) => {
                      setFormSector(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Commercial"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Video URL (optional)</label>
                <input
                  type="url"
                  className="projInput"
                  style={styles.input}
                  value={formVideoUrl}
                  onChange={(e) => {
                    setFormVideoUrl(e.target.value);
                    clearError();
                  }}
                  placeholder="https://youtube.com/watch?v=…"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  className="projInput"
                  style={styles.textarea}
                  rows={4}
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    clearError();
                  }}
                  placeholder="What the project covers and any key details."
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Images</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="projDrop"
                  style={styles.dropzone}
                  onClick={() => fileRef.current?.click()}
                >
                  <span style={{ fontWeight: 500, color: palette.slate900 }}>
                    Choose images
                  </span>
                  <span style={styles.dropHint}>
                    Select one or several. Up to {MAX_IMAGES} images, {MAX_IMAGE_MB} MB each.
                  </span>
                </button>

                {(formImages.length > 0 || newFiles.length > 0) && (
                  <div style={styles.imageGrid}>
                    {formImages.map((url) => (
                      <div key={url} style={styles.imageItem}>
                        <img src={imageUrl(url)} alt="" style={styles.imageThumb} />
                        <button
                          type="button"
                          className="projImgRemove"
                          style={styles.imageRemove}
                          onClick={() => removeExisting(url)}
                          aria-label="Remove image"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                    {newFiles.map((f) => (
                      <div key={f.id} style={styles.imageItem}>
                        <img src={f.preview} alt="" style={styles.imageThumb} />
                        <span style={styles.newBadge}>New</span>
                        <button
                          type="button"
                          className="projImgRemove"
                          style={styles.imageRemove}
                          onClick={() => removeNew(f.id)}
                          aria-label="Remove image"
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {formError && <span style={styles.errorMsg}>{formError}</span>}
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="projBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="projModalOverlay" style={styles.overlay} onClick={cancelDelete}>
          <div
            className="projModal"
            style={{ ...styles.modal, maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete project</h3>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={cancelDelete}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <p style={styles.confirmText}>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
              This can't be undone.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                style={styles.btnDanger}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#fff",
    boxSizing: "border-box",
  },
  container: { width: "100%", padding: 15 },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  title: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "24px",
    color: palette.slate900,
    margin: "0 0 4px 0",
  },
  subtitle: { fontSize: "14px", color: palette.slate500, margin: 0 },
  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  bannerClose: {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    opacity: 0.7,
  },
  filtersRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" },
  searchWrap: { position: "relative", flex: "1 1 260px", maxWidth: "340px" },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: palette.slate400,
    display: "flex",
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${palette.slate200}`,
    background: palette.white,
    borderRadius: "10px",
    padding: "10px 14px 10px 38px",
    fontSize: "14px",
    color: palette.slate900,
    outline: "none",
  },
  filterSelect: {
    border: `1px solid ${palette.slate200}`,
    background: palette.white,
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    color: palette.slate900,
    outline: "none",
    minWidth: "180px",
    cursor: "pointer",
  },
  tableCard: {
    background: palette.white,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "14px",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: palette.slate500,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    padding: "12px 20px",
    background: palette.slate50,
    borderBottom: `1px solid ${palette.slate200}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
    color: palette.slate900,
    borderBottom: `1px solid ${palette.slate200}`,
    verticalAlign: "middle",
  },
  projectCell: { display: "flex", alignItems: "center", gap: "12px" },
  thumb: {
    width: "56px",
    height: "42px",
    borderRadius: "8px",
    objectFit: "cover",
    flexShrink: 0,
    background: palette.slate100,
    border: `1px solid ${palette.slate200}`,
  },
  thumbEmpty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    color: palette.slate400,
    textAlign: "center",
  },
  descPreview: {
    fontSize: "12px",
    color: palette.slate500,
    marginTop: "2px",
    maxWidth: "320px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  link: { color: palette.blue500, textDecoration: "none", fontWeight: 500 },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    fontSize: "14px",
    color: palette.slate500,
  },
  actionsRow: { display: "flex", gap: "6px", justifyContent: "flex-end" },
  iconBtn: {
    background: "transparent",
    border: `1px solid ${palette.slate200}`,
    borderRadius: "8px",
    padding: "7px",
    display: "flex",
    color: palette.slate500,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 999950,
  },
  modal: {
    width: "100%",
    maxWidth: "440px",
    maxHeight: "92vh",
    overflowY: "auto",
    background: palette.white,
    borderRadius: "16px",
    padding: "24px",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },
  modalTitle: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "18px",
    color: palette.slate900,
    margin: 0,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: palette.slate400,
    cursor: "pointer",
    display: "flex",
  },
  modalForm: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 500, color: palette.slate900 },
  input: {
    border: `1px solid ${palette.slate200}`,
    background: palette.slate100,
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    color: palette.slate900,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    border: `1px solid ${palette.slate200}`,
    background: palette.slate100,
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    fontFamily: "inherit",
    lineHeight: 1.5,
    color: palette.slate900,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
  },
  dropzone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "18px 14px",
    border: `1.5px dashed ${palette.slate200}`,
    borderRadius: "10px",
    background: palette.slate50,
    fontFamily: "inherit",
    fontSize: "14px",
    cursor: "pointer",
  },
  dropHint: { fontSize: "12px", color: palette.slate500 },
  newBadge: {
    position: "absolute",
    left: "4px",
    bottom: "4px",
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: "999px",
    background: palette.blue500,
    color: palette.white,
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
    gap: "10px",
    marginTop: "6px",
  },
  imageItem: {
    position: "relative",
    aspectRatio: "4 / 3",
    borderRadius: "10px",
    overflow: "hidden",
    border: `1px solid ${palette.slate200}`,
    background: palette.slate100,
  },
  imageThumb: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  imageRemove: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "22px",
    height: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "999px",
    background: "rgba(15,23,42,0.7)",
    color: palette.white,
    cursor: "pointer",
    padding: 0,
  },
  errorMsg: { fontSize: "12px", color: palette.red600 },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "4px",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'Sora', 'Inter', sans-serif",
    background: palette.blue500,
    color: palette.white,
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    background: palette.white,
    color: palette.slate900,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnDanger: {
    background: palette.red600,
    color: palette.white,
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmText: { fontSize: "14px", color: palette.slate500, lineHeight: 1.5 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  .projInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .projBtnPrimary:hover:not(:disabled) { background: ${palette.blue400} !important; }
  .projBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .projIconBtn:hover { background: ${palette.slate100} !important; color: ${palette.slate900} !important; }
  .projIconBtnDanger:hover { background: ${palette.red50} !important; color: ${palette.red600} !important; border-color: rgba(220,38,38,0.3) !important; }
  .projRow:hover { background: ${palette.slate50}; }
  .projDrop:hover { border-color: ${palette.blue500}; background: rgba(59,130,246,0.05); }
  .projImgRemove svg { width: 12px; height: 12px; }

  /* size / location / scope / sector: two columns, one on small screens */
  .projFieldRow { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 14px; }
  @media (max-width: 560px) {
    .projFieldRow { grid-template-columns: 1fr; }
    .projContainer table { font-size: 13px; }
  }
`;
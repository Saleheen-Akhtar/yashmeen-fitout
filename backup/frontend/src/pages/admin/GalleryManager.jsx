import React, { useEffect, useState } from "react";
import { galleryAPI, categoryAPI, itemPath } from "../../services/api";

const MAX_FILE_MB = 5;

const resolveImage = (photo) => {
  if (!photo) return "";
  if (/^(https?:|data:|blob:)/i.test(photo)) return photo;
  return `${itemPath}/${photo.replace(/^\/+/, "")}`;
};

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
const ImageIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

// Reusable sliding toggle switch
const ToggleSwitch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    style={{
      width: "40px",
      height: "22px",
      borderRadius: "999px",
      border: "none",
      padding: "2px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      background: checked ? palette.blue500 : palette.slate200,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "background 0.18s ease",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: palette.white,
        boxShadow: "0 1px 2px rgba(15,23,42,0.25)",
      }}
    />
  </button>
);

export default function GalleryManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [banner, setBanner] = useState(null); // { type, text }

  // modal state (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null => create mode
  const [formTitle, setFormTitle] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formFile, setFormFile] = useState(null); // newly chosen file
  const [formPreview, setFormPreview] = useState(""); // blob: URL or existing photo URL
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // per-row status toggle in-flight
  const [togglingId, setTogglingId] = useState(null);

  // full image preview
  const [previewSrc, setPreviewSrc] = useState("");

  const fetchItems = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await galleryAPI.getAll();
      setItems(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load gallery.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: res } = await categoryAPI.getAll();
      setCategories(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load categories.",
      });
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  // release the object URL created for a newly chosen file
  useEffect(() => {
    return () => {
      if (formPreview.startsWith("blob:")) URL.revokeObjectURL(formPreview);
    };
  }, [formPreview]);

  // categoryId may come back populated (object) or as a plain id string
  const getCategoryId = (item) =>
    typeof item.categoryId === "object" && item.categoryId !== null
      ? item.categoryId._id
      : item.categoryId;

  const getCategoryName = (item) => {
    if (item.categoryId && typeof item.categoryId === "object") {
      return item.categoryId.categoryName || "-";
    }
    const match = categories.find((c) => c._id === item.categoryId);
    return match?.categoryName || "-";
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormCategoryId("");
    setFormStatus(true);
    setFormFile(null);
    setFormPreview("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormTitle(item.title || "");
    setFormCategoryId(getCategoryId(item) || "");
    setFormStatus(!!item.status);
    setFormFile(null);
    setFormPreview(resolveImage(item.photo));
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setFormError(`Image must be smaller than ${MAX_FILE_MB} MB.`);
      return;
    }
    setFormError("");
    setFormFile(file);
    setFormPreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const title = formTitle.trim();

    if (!formCategoryId) {
      setFormError("Please select a category.");
      return;
    }
    if (!title) {
      setFormError("Photo title is required.");
      return;
    }
    // photo is required on create; on edit the existing one is kept
    if (!editingId && !formFile) {
      setFormError("Please upload a photo.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      // Sent as multipart/form-data. The file field name is "photo" -
      // it must match upload.single("photo") on the backend.
      const fd = new FormData();
      fd.append("categoryId", formCategoryId);
      fd.append("title", title);
      fd.append("status", formStatus);
      if (formFile) fd.append("photo", formFile);

      if (editingId) {
        await galleryAPI.update(editingId, fd);
        setBanner({ type: "success", text: "Photo updated." });
      } else {
        await galleryAPI.create(fd);
        setBanner({ type: "success", text: "Photo added." });
      }
      // Refetch so populated category data and the new photo path are correct.
      await fetchItems({ silent: true });
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => setDeleteTarget(item);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await galleryAPI.delete(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setBanner({
        type: "success",
        text: `"${deleteTarget.title}" deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete photo.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (item) => {
    setTogglingId(item._id);
    const nextStatus = !item.status;
    // optimistic update
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, status: nextStatus } : i)),
    );
    try {
      await galleryAPI.status(item._id);
    } catch (err) {
      // revert on failure
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, status: item.status } : i,
        ),
      );
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to update status.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = items.filter((i) => {
    const matchesSearch = i.title
      ?.toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || getCategoryId(i) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="galPage" style={styles.page}>
      <style>{css}</style>

      <div className="galContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Gallery</h2>
            <p style={styles.subtitle}>
              Upload, edit, and manage gallery photos by category.
            </p>
          </div>
          <button
            type="button"
            className="galBtnPrimary"
            style={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <PlusIcon /> New photo
          </button>
        </div>

        {banner && (
          <div
            style={{
              ...styles.banner,
              background:
                banner.type === "success" ? palette.green50 : palette.red50,
              border: `1px solid ${banner.type === "success" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
              color:
                banner.type === "success" ? palette.green600 : palette.red600,
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
              placeholder="Search photos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              className="galInput"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
            className="galInput"
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
            <div style={styles.emptyState}>Loading gallery…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {items.length === 0
                ? "No photos yet. Add your first one."
                : "No photos match your filters."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Photo</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item._id} className="galRow">
                      <td style={styles.td}>
                        {item.photo ? (
                          <img
                            src={resolveImage(item.photo)}
                            alt={item.title}
                            style={styles.thumb}
                            className="galThumb"
                            onClick={() => setPreviewSrc(resolveImage(item.photo))}
                          />
                        ) : (
                          <div style={styles.thumbEmpty}>
                            <ImageIcon />
                          </div>
                        )}
                      </td>
                      <td style={{ ...styles.td, minWidth: "180px" }}>
                        {item.title}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.chip}>{getCategoryName(item)}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.statusCell}>
                          <ToggleSwitch
                            checked={!!item.status}
                            onChange={() => toggleStatus(item)}
                            disabled={togglingId === item._id}
                            label={`Toggle status for ${item.title}`}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: item.status
                                ? palette.green600
                                : palette.slate500,
                            }}
                          >
                            {item.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actionsRow}>
                          <button
                            type="button"
                            className="galIconBtn"
                            style={styles.iconBtn}
                            onClick={() => openEditModal(item)}
                            aria-label="Edit photo"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="galIconBtnDanger"
                            style={styles.iconBtn}
                            onClick={() => confirmDelete(item)}
                            aria-label="Delete photo"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="galModalOverlay" style={styles.overlay} onClick={closeModal}>
          <div
            className="galModal"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingId ? "Edit photo" : "New photo"}
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
                <label style={styles.label}>Category</label>
                <select
                  className="galInput"
                  style={styles.input}
                  value={formCategoryId}
                  onChange={(e) => {
                    setFormCategoryId(e.target.value);
                    setFormError("");
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categoryName}
                      {c.status ? "" : " (inactive)"}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Photo title</label>
                <input
                  type="text"
                  className="galInput"
                  style={styles.input}
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Annual day 2026"
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Photo</label>
                <label className="galDrop" style={styles.dropzone}>
                  {formPreview ? (
                    <img src={formPreview} alt="Preview" style={styles.dropPreview} />
                  ) : (
                    <span style={styles.dropHint}>
                      <ImageIcon />
                      <span>Click to choose an image</span>
                      <span style={{ fontSize: "12px", color: palette.slate400 }}>
                        PNG, JPG or WebP, up to {MAX_FILE_MB} MB
                      </span>
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
                {formPreview && (
                  <span style={{ fontSize: "12px", color: palette.slate500 }}>
                    {formFile
                      ? `${formFile.name} · click the image to replace it`
                      : "Click the image to replace it"}
                  </span>
                )}
                {formError && <span style={styles.errorMsg}>{formError}</span>}
              </div>

              <div style={styles.toggleRow}>
                <ToggleSwitch
                  checked={formStatus}
                  onChange={setFormStatus}
                  label="Active status"
                />
                <span style={styles.toggleLabel}>Active</span>
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
                  className="galBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Add photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="galModalOverlay" style={styles.overlay} onClick={cancelDelete}>
          <div
            className="galModal"
            style={{ ...styles.modal, maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete photo</h3>
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

      {/* Full image preview */}
      {previewSrc && (
        <div
          className="galModalOverlay"
          style={styles.overlay}
          onClick={() => setPreviewSrc("")}
        >
          <div
            className="galModal"
            style={{ ...styles.modal, maxWidth: "640px", padding: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...styles.modalHeader, marginBottom: "12px" }}>
              <h3 style={styles.modalTitle}>Photo preview</h3>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() => setPreviewSrc("")}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <img
              src={previewSrc}
              alt="Gallery"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "10px",
                background: palette.slate100,
              }}
            />
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
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
  filtersRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  searchWrap: {
    position: "relative",
    flex: "1 1 240px",
    maxWidth: "320px",
  },
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
  thumb: {
    width: "56px",
    height: "56px",
    objectFit: "cover",
    borderRadius: "10px",
    border: `1px solid ${palette.slate200}`,
    display: "block",
    cursor: "zoom-in",
  },
  thumbEmpty: {
    width: "56px",
    height: "56px",
    borderRadius: "10px",
    border: `1px dashed ${palette.slate200}`,
    background: palette.slate50,
    color: palette.slate400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    display: "inline-block",
    fontSize: "12px",
    fontWeight: 500,
    color: palette.slate900,
    background: palette.slate100,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "999px",
    padding: "3px 10px",
    whiteSpace: "nowrap",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    fontSize: "14px",
    color: palette.slate500,
  },
  statusCell: { display: "flex", alignItems: "center", gap: "10px" },
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
  dropzone: {
    border: `1.5px dashed ${palette.slate200}`,
    background: palette.slate50,
    borderRadius: "12px",
    minHeight: "150px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  dropHint: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: palette.slate500,
    padding: "20px",
    textAlign: "center",
  },
  dropPreview: {
    width: "100%",
    maxHeight: "220px",
    objectFit: "contain",
    display: "block",
  },
  errorMsg: { fontSize: "12px", color: palette.red600 },
  toggleRow: { display: "flex", alignItems: "center", gap: "10px" },
  toggleLabel: { fontSize: "14px", color: palette.slate900 },
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

  .galInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .galBtnPrimary:hover:not(:disabled) { background: ${palette.blue400} !important; }
  .galBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .galIconBtn:hover { background: ${palette.slate100} !important; color: ${palette.slate900} !important; }
  .galIconBtnDanger:hover { background: ${palette.red50} !important; color: ${palette.red600} !important; border-color: rgba(220,38,38,0.3) !important; }
  .galRow:hover { background: ${palette.slate50}; }
  .galDrop:hover { border-color: ${palette.blue500} !important; background: ${palette.slate100} !important; }
  .galThumb:hover { opacity: 0.85; }

  @media (max-width: 560px) {
    .galContainer table { font-size: 13px; }
  }
`;
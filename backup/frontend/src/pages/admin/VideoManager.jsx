import React, { useEffect, useState } from "react";
import { videoAPI, categoryAPI } from "../../services/api";

// If `path` is stored as a relative file path (e.g. "uploads/intro.mp4"),
// set this to your server origin, e.g. "http://localhost:5000".
// Leave "" when `path` is a full URL (YouTube, Vimeo, CDN, etc.).
const VIDEO_BASE = "";

const resolveVideoUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${VIDEO_BASE}/${path.replace(/^\/+/, "")}`;
};

// Returns a YouTube video id for common URL shapes, otherwise null.
const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i,
  );
  return m ? m[1] : null;
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
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.8-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" />
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

// Small thumbnail: YouTube still if we can derive one, otherwise a play tile.
const VideoThumb = ({ path, title }) => {
  const url = resolveVideoUrl(path);
  const ytId = getYouTubeId(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open video: ${title}`}
      style={styles.thumbLink}
      className="vidThumb"
    >
      {ytId ? (
        <img
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt={title}
          style={styles.thumbImg}
        />
      ) : (
        <span style={styles.thumbFallback}>
          <PlayIcon />
        </span>
      )}
    </a>
  );
};

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
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
  const [formPath, setFormPath] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // per-row status toggle in-flight
  const [togglingId, setTogglingId] = useState(null);

  const fetchVideos = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await videoAPI.getAll();
      setVideos(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load videos.",
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
    fetchVideos();
    fetchCategories();
  }, []);

  // categoryId may come back populated (object) or as a plain id string
  const getCategoryId = (video) =>
    typeof video.categoryId === "object" && video.categoryId !== null
      ? video.categoryId._id
      : video.categoryId;

  const getCategoryName = (video) => {
    if (video.categoryId && typeof video.categoryId === "object") {
      return video.categoryId.categoryName || "—";
    }
    const match = categories.find((c) => c._id === video.categoryId);
    return match?.categoryName || "—";
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormCategoryId("");
    setFormPath("");
    setFormStatus(true);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (video) => {
    setEditingId(video._id);
    setFormTitle(video.title || "");
    setFormCategoryId(getCategoryId(video) || "");
    setFormPath(video.path || "");
    setFormStatus(!!video.status);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const title = formTitle.trim();
    const path = formPath.trim();

    if (!formCategoryId) {
      setFormError("Please select a category.");
      return;
    }
    if (!title) {
      setFormError("Video title is required.");
      return;
    }
    if (!path) {
      setFormError("Video link is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      categoryId: formCategoryId,
      title,
      path,
      status: formStatus,
    };

    try {
      if (editingId) {
        await videoAPI.update(editingId, payload);
        setBanner({ type: "success", text: "Video updated." });
      } else {
        await videoAPI.create(payload);
        setBanner({ type: "success", text: "Video created." });
      }
      // Refetch so populated category data is always correct in the table.
      await fetchVideos({ silent: true });
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (video) => setDeleteTarget(video);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await videoAPI.delete(deleteTarget._id);
      setVideos((prev) => prev.filter((v) => v._id !== deleteTarget._id));
      setBanner({
        type: "success",
        text: `"${deleteTarget.title}" deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete video.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (video) => {
    setTogglingId(video._id);
    const nextStatus = !video.status;
    // optimistic update
    setVideos((prev) =>
      prev.map((v) => (v._id === video._id ? { ...v, status: nextStatus } : v)),
    );
    try {
      await videoAPI.status(video._id);
    } catch (err) {
      // revert on failure
      setVideos((prev) =>
        prev.map((v) =>
          v._id === video._id ? { ...v, status: video.status } : v,
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

  const filtered = videos.filter((v) => {
    const matchesSearch = v.title
      ?.toLowerCase()
      .includes(search.trim().toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || getCategoryId(v) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="vidPage" style={styles.page}>
      <style>{css}</style>

      <div className="vidContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Videos</h2>
            <p style={styles.subtitle}>
              Add, edit, and manage videos by category.
            </p>
          </div>
          <button
            type="button"
            className="vidBtnPrimary"
            style={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <PlusIcon /> New video
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
              placeholder="Search videos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              className="vidInput"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
            className="vidInput"
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
            <div style={styles.emptyState}>Loading videos…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {videos.length === 0
                ? "No videos yet. Add your first one."
                : "No videos match your filters."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Video</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((video) => (
                    <tr key={video._id} className="vidRow">
                      <td style={styles.td}>
                        <VideoThumb path={video.path} title={video.title} />
                      </td>
                      <td style={{ ...styles.td, minWidth: "180px" }}>
                        {video.title}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.chip}>{getCategoryName(video)}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.statusCell}>
                          <ToggleSwitch
                            checked={!!video.status}
                            onChange={() => toggleStatus(video)}
                            disabled={togglingId === video._id}
                            label={`Toggle status for ${video.title}`}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: video.status
                                ? palette.green600
                                : palette.slate500,
                            }}
                          >
                            {video.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actionsRow}>
                          <button
                            type="button"
                            className="vidIconBtn"
                            style={styles.iconBtn}
                            onClick={() => openEditModal(video)}
                            aria-label="Edit video"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="vidIconBtnDanger"
                            style={styles.iconBtn}
                            onClick={() => confirmDelete(video)}
                            aria-label="Delete video"
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
        <div className="vidModalOverlay" style={styles.overlay} onClick={closeModal}>
          <div
            className="vidModal"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingId ? "Edit video" : "New video"}
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
                  className="vidInput"
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
                <label style={styles.label}>Video title</label>
                <input
                  type="text"
                  className="vidInput"
                  style={styles.input}
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Campus tour 2026"
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Video link</label>
                <input
                  type="text"
                  className="vidInput"
                  style={styles.input}
                  value={formPath}
                  onChange={(e) => {
                    setFormPath(e.target.value);
                    setFormError("");
                  }}
                  placeholder="https://www.youtube.com/watch?v=…"
                />
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
                  className="vidBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Create video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="vidModalOverlay" style={styles.overlay} onClick={cancelDelete}>
          <div
            className="vidModal"
            style={{ ...styles.modal, maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete video</h3>
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
  thumbLink: {
    width: "88px",
    height: "50px",
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid ${palette.slate200}`,
    display: "block",
    background: palette.slate100,
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  thumbFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: palette.slate400,
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

  .vidInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .vidBtnPrimary:hover:not(:disabled) { background: ${palette.blue400} !important; }
  .vidBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .vidIconBtn:hover { background: ${palette.slate100} !important; color: ${palette.slate900} !important; }
  .vidIconBtnDanger:hover { background: ${palette.red50} !important; color: ${palette.red600} !important; border-color: rgba(220,38,38,0.3) !important; }
  .vidRow:hover { background: ${palette.slate50}; }
  .vidThumb:hover { opacity: 0.85; }

  @media (max-width: 560px) {
    .vidContainer table { font-size: 13px; }
  }
`;
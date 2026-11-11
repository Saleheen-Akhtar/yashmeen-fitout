import { useEffect, useState } from "react";
import { videoAPI, categoryAPI } from "../../services/api";
import { clearVideoGalleryCache } from "../../libs/publicCache";
import { FiEdit2, FiPlay, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const VIDEO_BASE = "";

const loadVideosData = async () => {
  const { data: res } = await videoAPI.getAll();
  return res?.data ?? [];
};

const loadVideoCategoriesData = async () => {
  const { data: res } = await categoryAPI.getAll();
  return res?.data ?? [];
};

const resolveVideoUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${VIDEO_BASE}/${String(path).replace(/^\/+/, "")}`;
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/i,
  );
  return m ? m[1] : null;
};

const ToggleSwitch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    style={{
      width: "42px",
      height: "24px",
      borderRadius: "9999px",
      border: "none",
      padding: "3px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: checked ? "flex-end" : "flex-start",
      background: checked ? "#080807" : "#d8d5ce",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "background 0.2s ease",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: checked ? "#c5a059" : "#ffffff",
        boxShadow: "0 1px 2px rgba(8,8,7,0.28)",
      }}
    />
  </button>
);

const VideoThumb = ({ path, title }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = resolveVideoUrl(path);
  const ytId = getYouTubeId(url);
  return (
    <a
      href={url || "#"}
      target={url ? "_blank" : undefined}
      rel="noreferrer"
      aria-label={`Open video: ${title}`}
      style={{
        width: "88px",
        height: "50px",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid var(--crex-line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--crex-dark)",
        color: "#c5a059",
      }}
    >
      {ytId && !imgFailed ? (
        <img
          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
          alt={title}
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <FiPlay size={18} />
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
  const [banner, setBanner] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPath, setFormPath] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchVideos = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const list = await loadVideosData();
      setVideos(list);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load videos.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadVideosData()
      .then((list) => {
        if (!cancelled) setVideos(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load videos.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    loadVideoCategoriesData()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load categories.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getCategoryId = (video) =>
    typeof video.categoryId === "object" && video.categoryId !== null
      ? video.categoryId._id
      : video.categoryId;

  const getCategoryName = (video) => {
    if (video.categoryId && typeof video.categoryId === "object") {
      return video.categoryId.categoryName || "-";
    }
    const match = categories.find((c) => c._id === video.categoryId);
    return match?.categoryName || "-";
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

    if (!formCategoryId) return setFormError("Please select a category.");
    if (!title) return setFormError("Video title is required.");
    if (!path) return setFormError("Video link is required.");

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
      clearVideoGalleryCache();
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
      clearVideoGalleryCache();
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
    setVideos((prev) =>
      prev.map((v) => (v._id === video._id ? { ...v, status: nextStatus } : v)),
    );
    try {
      await videoAPI.status(video._id);
      clearVideoGalleryCache();
    } catch (err) {
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
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Videos</h2>
            <p className="adm-subtitle">
              Add, edit, and organise architectural walkthrough videos by category.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New video</span>
          </button>
        </div>

        {banner && (
          <div className={`adm-banner ${banner.type === "success" ? "is-success" : "is-error"}`}>
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                display: "flex",
                padding: "4px",
              }}
              aria-label="Dismiss"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        <div className="adm-filters">
          <div className="adm-search-wrap">
            <span className="adm-search-icon">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="Search videos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="adm-filter-select"
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

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading videos…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {videos.length === 0
                ? "No videos yet. Add your first one."
                : "No videos match your filters."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((video) => (
                    <tr key={video._id}>
                      <td>
                        <VideoThumb path={video.path} title={video.title} />
                      </td>
                      <td style={{ fontWeight: 600, minWidth: "180px" }}>{video.title}</td>
                      <td>
                        <span className="adm-chip">{getCategoryName(video)}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <ToggleSwitch
                            checked={!!video.status}
                            onChange={() => toggleStatus(video)}
                            disabled={togglingId === video._id}
                            label={`Toggle status for ${video.title}`}
                          />
                          <span
                            style={{
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: video.status ? "#285234" : "var(--crex-muted)",
                            }}
                          >
                            {video.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="adm-icon-btn"
                            onClick={() => openEditModal(video)}
                            aria-label="Edit video"
                            title="Edit video"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="adm-icon-btn is-danger"
                            onClick={() => confirmDelete(video)}
                            aria-label="Delete video"
                            title="Delete video"
                          >
                            <FiTrash2 size={15} />
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
        <div className="adm-overlay" onClick={closeModal}>
          <div
            className="adm-modal"
            style={{ maxWidth: "460px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 600 }}>
                {editingId ? "Edit video" : "New video"}
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={closeModal}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ marginBottom: "6px" }}>Category *</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => {
                    setFormCategoryId(e.target.value);
                    setFormError("");
                  }}
                  style={{ width: "100%" }}
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

              <div>
                <label style={{ marginBottom: "6px" }}>Video title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. DIFC Penthouse Walkthrough"
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Video link *</label>
                <input
                  type="text"
                  value={formPath}
                  onChange={(e) => {
                    setFormPath(e.target.value);
                    setFormError("");
                  }}
                  placeholder="https://www.youtube.com/watch?v=…"
                  style={{ width: "100%" }}
                />
                {formError && (
                  <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "6px", fontWeight: 500 }}>
                    {formError}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ToggleSwitch
                  checked={formStatus}
                  onChange={setFormStatus}
                  label="Active status"
                />
                <span style={{ fontSize: "13.5px", fontWeight: 500 }}>
                  {formStatus ? "Active (visible)" : "Inactive"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="adm-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="adm-overlay" onClick={cancelDelete}>
          <div
            className="adm-modal"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                Delete video
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={cancelDelete}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--crex-muted)", lineHeight: 1.55 }}>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-danger-solid"
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

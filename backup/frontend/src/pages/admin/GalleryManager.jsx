import { useEffect, useState } from "react";
import { galleryAPI, categoryAPI, itemPath } from "../../services/api";
import { clearGalleryCache } from "../../lib/publicCache";
import { FiEdit2, FiImage, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const MAX_FILE_MB = 5;
const FALLBACK_IMG = "/static/hero-aperture-v2.webp";

const invalidateSiteCaches = () => {
  clearGalleryCache();
  window.dispatchEvent(new CustomEvent("projects-updated"));
};

const loadGalleryItemsData = async () => {
  const { data: res } = await galleryAPI.getAll();
  return res?.data ?? [];
};

const loadGalleryCategoriesData = async () => {
  const { data: res } = await categoryAPI.getAll();
  return res?.data ?? [];
};

const resolveImage = (photo) => {
  if (!photo) return "";
  if (/^(https?:|data:|blob:|\/static\/|\/images\/)/i.test(photo)) return photo;
  return `${itemPath ?? ""}/${String(photo).replace(/^\/+/, "")}`;
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

export default function GalleryManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [banner, setBanner] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");

  const fetchItems = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const list = await loadGalleryItemsData();
      setItems(list);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load gallery.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadGalleryItemsData()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load gallery.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    loadGalleryCategoriesData()
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

  useEffect(() => {
    return () => {
      if (formPreview.startsWith("blob:")) URL.revokeObjectURL(formPreview);
    };
  }, [formPreview]);

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
    e.target.value = "";
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
    if (!editingId && !formFile) {
      setFormError("Please upload a photo.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
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
        setBanner({ type: "success", text: "Photo added to gallery." });
      }
      await fetchItems({ silent: true });
      invalidateSiteCaches();
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
      invalidateSiteCaches();
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
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, status: nextStatus } : i)),
    );
    try {
      await galleryAPI.status(item._id);
      invalidateSiteCaches();
    } catch (err) {
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
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Gallery</h2>
            <p className="adm-subtitle">
              Upload, edit, and curate architectural photography across categories.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New photo</span>
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
              placeholder="Search photos…"
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
            <div className="adm-empty">Loading gallery…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {items.length === 0
                ? "No photos yet. Add your first one."
                : "No photos match your filters."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const src = resolveImage(item.photo);
                    return (
                      <tr key={item._id}>
                        <td>
                          {item.photo ? (
                            <img
                              src={src}
                              alt={item.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                              onClick={() => setPreviewSrc(src)}
                              style={{
                                width: "68px",
                                height: "48px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                border: "1px solid var(--crex-line)",
                                display: "block",
                                cursor: "zoom-in",
                                background: "var(--crex-limestone)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "68px",
                                height: "48px",
                                borderRadius: "10px",
                                border: "1px dashed var(--crex-line-strong)",
                                background: "var(--crex-limestone)",
                                color: "var(--crex-muted-soft)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FiImage size={18} />
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, minWidth: "180px" }}>{item.title}</td>
                        <td>
                          <span className="adm-chip">{getCategoryName(item)}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <ToggleSwitch
                              checked={!!item.status}
                              onChange={() => toggleStatus(item)}
                              disabled={togglingId === item._id}
                              label={`Toggle status for ${item.title}`}
                            />
                            <span
                              style={{
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: item.status ? "#285234" : "var(--crex-muted)",
                              }}
                            >
                              {item.status ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="adm-icon-btn"
                              onClick={() => openEditModal(item)}
                              aria-label="Edit photo"
                              title="Edit photo"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="adm-icon-btn is-danger"
                              onClick={() => confirmDelete(item)}
                              aria-label="Delete photo"
                              title="Delete photo"
                            >
                              <FiTrash2 size={15} />
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
                {editingId ? "Edit photo" : "New photo"}
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
                <label style={{ marginBottom: "6px" }}>Photo title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Bespoke Marble Foyer · Downtown"
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Photo</label>
                <label className="adm-dropzone" style={{ display: "flex" }}>
                  {formPreview ? (
                    <img
                      src={formPreview}
                      alt="Preview"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                      style={{
                        maxHeight: "170px",
                        maxWidth: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "var(--crex-muted)" }}>
                      <FiImage size={22} />
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--crex-ink)" }}>
                        Click to choose an image
                      </span>
                      <span style={{ fontSize: "11.5px" }}>
                        PNG, JPG or WebP, up to {MAX_FILE_MB} MB
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
                {formPreview && (
                  <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "6px" }}>
                    {formFile ? `${formFile.name} · ` : ""}Click above to replace photo
                  </div>
                )}
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
                  {formStatus ? "Active (visible on site)" : "Inactive (hidden)"}
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
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add photo"}
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
                Delete photo
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

      {/* Full image preview modal */}
      {previewSrc && (
        <div className="adm-overlay" onClick={() => setPreviewSrc("")}>
          <div
            className="adm-modal"
            style={{ maxWidth: "660px", padding: "18px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>
                Photo preview
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setPreviewSrc("")}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <img
              src={previewSrc}
              alt="Gallery preview"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "12px",
                background: "var(--crex-limestone)",
                display: "block",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

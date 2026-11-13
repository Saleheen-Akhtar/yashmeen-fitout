import { useEffect, useState } from "react";
import { bannerAPI, itemPath } from "../../services/api";
import { FiImage, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const MAX_FILE_MB = 5;
const FALLBACK_IMG = "/static/hero-aperture-v2.webp";

const loadBannersData = async () => {
  const { data: res } = await bannerAPI.getAll();
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

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formOrder, setFormOrder] = useState("0");
  const [formStatus, setFormStatus] = useState(true);
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");

  const fetchBanners = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const list = await loadBannersData();
      setBanners(list);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load banners.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadBannersData()
      .then((list) => {
        if (!cancelled) setBanners(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load banners.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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

  const openCreateModal = () => {
    const maxOrder = banners.reduce(
      (max, b) => Math.max(max, Number(b.order) || 0),
      -1,
    );
    setFormTitle("");
    setFormLink("");
    setFormOrder(String(maxOrder + 1));
    setFormStatus(true);
    setFormFile(null);
    setFormPreview("");
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
    const link = formLink.trim();
    const order = Number(formOrder);

    if (!title) return setFormError("Banner title is required.");
    if (!formFile) return setFormError("Please upload a banner image.");
    if (link && !/^(https?:\/\/|\/)/i.test(link)) {
      return setFormError("Link must start with http://, https:// or /.");
    }
    if (formOrder === "" || !Number.isFinite(order)) {
      return setFormError("Order must be a number.");
    }

    setSaving(true);
    setFormError("");

    try {
      const fd = new FormData();
      fd.append("title", title);
      if (link) fd.append("link", link);
      fd.append("order", order);
      fd.append("status", formStatus);
      fd.append("photo", formFile);

      await bannerAPI.create(fd);
      await fetchBanners({ silent: true });
      setBanner({ type: "success", text: "Banner created." });
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
      await bannerAPI.delete(deleteTarget._id);
      setBanners((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      setBanner({
        type: "success",
        text: `"${deleteTarget.title}" deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete banner.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (item) => {
    setTogglingId(item._id);
    const nextStatus = !item.status;
    setBanners((prev) =>
      prev.map((b) => (b._id === item._id ? { ...b, status: nextStatus } : b)),
    );
    try {
      await bannerAPI.status(item._id);
    } catch (err) {
      setBanners((prev) =>
        prev.map((b) =>
          b._id === item._id ? { ...b, status: item.status } : b,
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

  const filtered = [...banners]
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    .filter((b) =>
      b.title?.toLowerCase().includes(search.trim().toLowerCase()),
    );

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Banners</h2>
            <p className="adm-subtitle">
              Upload, order, and toggle promotional hero banners.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New banner</span>
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
              placeholder="Search banners…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading banners…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {banners.length === 0
                ? "No banners yet. Create your first one."
                : "No banners match your search."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Link</th>
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
                          <span className="adm-chip-neutral">{item.order ?? 0}</span>
                        </td>
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
                                width: "112px",
                                height: "52px",
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
                                width: "112px",
                                height: "52px",
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
                        <td style={{ fontWeight: 600, minWidth: "160px" }}>{item.title}</td>
                        <td style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.link ? (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="adm-link"
                              title={item.link}
                            >
                              {item.link}
                            </a>
                          ) : (
                            <span style={{ color: "var(--crex-muted-soft)" }}>-</span>
                          )}
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
                              className="adm-icon-btn is-danger"
                              onClick={() => confirmDelete(item)}
                              aria-label="Delete banner"
                              title="Delete banner"
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

      {/* Create Modal */}
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
              <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 600 }}>New banner</h3>
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
                <label style={{ marginBottom: "6px" }}>Banner title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Bespoke Joinery Showcase"
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>
                  Link <span style={{ fontWeight: 400, color: "var(--crex-muted-soft)" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => {
                    setFormLink(e.target.value);
                    setFormError("");
                  }}
                  placeholder="https://example.com/projects or /projects"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Display order</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formOrder}
                  onChange={(e) => {
                    setFormOrder(e.target.value);
                    setFormError("");
                  }}
                  style={{ width: "140px" }}
                />
                <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "4px" }}>
                  Lower numbers appear first.
                </div>
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Banner image *</label>
                <label className="adm-dropzone" style={{ display: "flex" }}>
                  {formPreview ? (
                    <img
                      src={formPreview}
                      alt="Banner preview"
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
                    {formFile?.name} · click image to replace
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
                  {saving ? "Saving…" : "Create banner"}
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
                Delete banner
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

      {/* Full image preview */}
      {previewSrc && (
        <div className="adm-overlay" onClick={() => setPreviewSrc("")}>
          <div
            className="adm-modal"
            style={{ maxWidth: "740px", padding: "18px" }}
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
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>Banner preview</h3>
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
              alt="Banner"
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

import React, { useEffect, useState } from "react";
import { itemPath, popupAPI } from "../../services/api";
import { FiImage, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const MAX_FILE_MB = 5;
const FALLBACK_IMG = "/static/hero-aperture.png";

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

export default function PopupManager() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formStatus, setFormStatus] = useState(false);
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");

  const fetchPopups = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await popupAPI.getAll();
      setPopups(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load popups.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  useEffect(() => {
    return () => {
      if (formPreview.startsWith("blob:")) URL.revokeObjectURL(formPreview);
    };
  }, [formPreview]);

  const openCreateModal = () => {
    setFormTitle("");
    setFormStatus(false);
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
    const trimmed = formTitle.trim();
    if (!trimmed) return setFormError("Popup title is required.");
    if (!formFile) return setFormError("Please upload a popup image.");

    setSaving(true);
    setFormError("");

    try {
      const fd = new FormData();
      fd.append("title", trimmed);
      fd.append("status", formStatus);
      fd.append("photo", formFile);

      await popupAPI.create(fd);
      await fetchPopups({ silent: true });
      setBanner({ type: "success", text: "Popup created." });
      setModalOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      if (err?.response?.status === 409 || /duplicate/i.test(msg)) {
        setFormError("A popup with this title already exists.");
      } else {
        setFormError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (popup) => setDeleteTarget(popup);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await popupAPI.delete(deleteTarget._id);
      setPopups((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setBanner({
        type: "success",
        text: `"${deleteTarget.title}" deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete popup.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (popup) => {
    setTogglingId(popup._id);
    const nextStatus = !popup.status;
    setPopups((prev) =>
      prev.map((p) => (p._id === popup._id ? { ...p, status: nextStatus } : p)),
    );
    try {
      await popupAPI.status(popup._id);
      await fetchPopups({ silent: true });
    } catch (err) {
      setPopups((prev) =>
        prev.map((p) =>
          p._id === popup._id ? { ...p, status: popup.status } : p,
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

  const filtered = popups.filter((p) =>
    p.title?.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Popups</h2>
            <p className="adm-subtitle">
              Upload, activate, and remove announcement overlays on the live site.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New popup</span>
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
              placeholder="Search popups…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading popups…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {popups.length === 0
                ? "No popups yet. Create your first one."
                : "No popups match your search."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((popup) => {
                    const src = resolveImage(popup.photo);
                    return (
                      <tr key={popup._id}>
                        <td>
                          {popup.photo ? (
                            <img
                              src={src}
                              alt={popup.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                              onClick={() => setPreviewSrc(src)}
                              style={{
                                width: "56px",
                                height: "56px",
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
                                width: "56px",
                                height: "56px",
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
                        <td style={{ fontWeight: 600, minWidth: "160px" }}>{popup.title}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <ToggleSwitch
                              checked={!!popup.status}
                              onChange={() => toggleStatus(popup)}
                              disabled={togglingId === popup._id}
                              label={`Toggle status for ${popup.title}`}
                            />
                            <span
                              style={{
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: popup.status ? "#285234" : "var(--crex-muted)",
                              }}
                            >
                              {popup.status ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="adm-icon-btn is-danger"
                              onClick={() => confirmDelete(popup)}
                              aria-label="Delete popup"
                              title="Delete popup"
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
              <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 600 }}>New popup</h3>
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
                <label style={{ marginBottom: "6px" }}>Popup title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Dubai Design Week Studio Exhibition"
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Popup image *</label>
                <label className="adm-dropzone" style={{ display: "flex" }}>
                  {formPreview ? (
                    <img
                      src={formPreview}
                      alt="Popup preview"
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
                  {formStatus ? "Active (will display on site)" : "Inactive"}
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
                  {saving ? "Saving…" : "Create popup"}
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
                Delete popup
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
            style={{ maxWidth: "560px", padding: "18px" }}
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
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 600 }}>Popup preview</h3>
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
              alt="Popup"
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

import React, { useEffect, useState } from "react";
import { itemPath, popupAPI } from "../../services/api";

// If the backend returns a relative path for `photo` (e.g. "uploads/abc.jpg"),
// set this to your server origin, e.g. "http://localhost:5000".
// Leave "" if it already returns a full URL (Cloudinary, S3, etc.).

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

export default function PopupManager() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState(null); // { type, text }

  // create modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formStatus, setFormStatus] = useState(false);
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // per-row status toggle in-flight
  const [togglingId, setTogglingId] = useState(null);

  // image preview modal
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

  // release object URL created for the file preview
  useEffect(() => {
    return () => {
      if (formPreview) URL.revokeObjectURL(formPreview);
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
    if (!trimmed) {
      setFormError("Popup title is required.");
      return;
    }
    if (!formFile) {
      setFormError("Please upload a popup image.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      // Sent as multipart/form-data. The file field name is "photo" —
      // it must match upload.single("photo") on the backend.
      const fd = new FormData();
      fd.append("title", trimmed);
      fd.append("status", formStatus);
      fd.append("photo", formFile);

      await popupAPI.create(fd);
      // Refetch so the list reflects server state (e.g. if only one popup
      // can be active at a time, other rows may have been switched off).
      await fetchPopups({ silent: true });
      setBanner({ type: "success", text: "Popup created." });
      setModalOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      // Mongo duplicate key error for `unique: true` on title
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
    // optimistic update
    setPopups((prev) =>
      prev.map((p) => (p._id === popup._id ? { ...p, status: nextStatus } : p)),
    );
    try {
      await popupAPI.status(popup._id);
      // sync with server in case other popups were deactivated
      await fetchPopups({ silent: true });
    } catch (err) {
      // revert on failure
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
    <div className="popPage" style={styles.page}>
      <style>{css}</style>

      <div className="popContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Popups</h2>
            <p style={styles.subtitle}>
              Upload, activate, and remove website popups.
            </p>
          </div>
          <button
            type="button"
            className="popBtnPrimary"
            style={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <PlusIcon /> New popup
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

        <div style={styles.searchWrap} className="popSearchWrap">
          <span style={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search popups…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            className="popInput"
          />
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading popups…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {popups.length === 0
                ? "No popups yet. Create your first one."
                : "No popups match your search."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Image</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((popup) => (
                    <tr key={popup._id} className="popRow">
                      <td style={styles.td}>
                        {popup.photo ? (
                          <img
                            src={resolveImage(popup.photo)}
                            alt={popup.title}
                            style={styles.thumb}
                            className="popThumb"
                            onClick={() => setPreviewSrc(resolveImage(popup.photo))}
                          />
                        ) : (
                          <div style={styles.thumbEmpty}>
                            <ImageIcon />
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>{popup.title}</td>
                      <td style={styles.td}>
                        <div style={styles.statusCell}>
                          <ToggleSwitch
                            checked={!!popup.status}
                            onChange={() => toggleStatus(popup)}
                            disabled={togglingId === popup._id}
                            label={`Toggle status for ${popup.title}`}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: popup.status
                                ? palette.green600
                                : palette.slate500,
                            }}
                          >
                            {popup.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actionsRow}>
                          <button
                            type="button"
                            className="popIconBtnDanger"
                            style={styles.iconBtn}
                            onClick={() => confirmDelete(popup)}
                            aria-label="Delete popup"
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

      {/* Create Modal */}
      {modalOpen && (
        <div className="popModalOverlay" style={styles.overlay} onClick={closeModal}>
          <div
            className="popModal"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New popup</h3>
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
                <label style={styles.label}>Popup title</label>
                <input
                  type="text"
                  className="popInput"
                  style={styles.input}
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Diwali offer"
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Popup image</label>
                <label className="popDrop" style={styles.dropzone}>
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
                    {formFile?.name} · click the image to replace it
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
                  className="popBtnPrimary"
                  style={styles.btnPrimary}
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
        <div className="popModalOverlay" style={styles.overlay} onClick={cancelDelete}>
          <div
            className="popModal"
            style={{ ...styles.modal, maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete popup</h3>
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
          className="popModalOverlay"
          style={styles.overlay}
          onClick={() => setPreviewSrc("")}
        >
          <div
            className="popModal"
            style={{ ...styles.modal, maxWidth: "560px", padding: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ ...styles.modalHeader, marginBottom: "12px" }}>
              <h3 style={styles.modalTitle}>Popup preview</h3>
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
              alt="Popup"
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
  searchWrap: {
    position: "relative",
    marginBottom: "16px",
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

  .popInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .popBtnPrimary:hover:not(:disabled) { background: ${palette.blue400} !important; }
  .popBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .popIconBtnDanger:hover { background: ${palette.red50} !important; color: ${palette.red600} !important; border-color: rgba(220,38,38,0.3) !important; }
  .popRow:hover { background: ${palette.slate50}; }
  .popDrop:hover { border-color: ${palette.blue500} !important; background: ${palette.slate100} !important; }
  .popThumb:hover { opacity: 0.85; }

  @media (max-width: 560px) {
    .popContainer table { font-size: 13px; }
  }
`;
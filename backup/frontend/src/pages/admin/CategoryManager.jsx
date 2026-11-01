import React, { useEffect, useState } from "react";
import { categoryAPI } from "../../services/api";

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
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const EditIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
);
const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
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
        transition: "transform 0.18s ease",
      }}
    />
  </button>
);

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState(null); // { type, text }

  // modal state (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null => create mode
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null); // category object
  const [deleting, setDeleting] = useState(false);

  // per-row status toggle in-flight
  const [togglingId, setTogglingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data: res } = await categoryAPI.getAll();
      setCategories(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load categories.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormName("");
    setFormStatus(true);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category._id);
    setFormName(category.categoryName);
    setFormStatus(!!category.status);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        // FIX: destructure axios response the same way fetchCategories does,
        // then unwrap the API body's `data` field to get the actual category.
        const { data: res } = await categoryAPI.update(editingId, {
          categoryName: trimmed,
          status: formStatus,
        });
        const updated = res?.data;
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingId
              ? { ...c, ...updated, categoryName: trimmed, status: formStatus }
              : c,
          ),
        );
        setBanner({ type: "success", text: "Category updated." });
      } else {
        // FIX: same unwrapping issue existed here — `res` was the full axios
        // response, so `res?.data` was `{ success, data: {...} }`, not the
        // category. That's why new categories didn't render properly.
        const { data: res } = await categoryAPI.create({
          categoryName: trimmed,
          status: formStatus,
        });
        const created = res?.data;
        setCategories((prev) => [created, ...prev]);
        setBanner({ type: "success", text: "Category created." });
      }
      setModalOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
      // Mongo duplicate key error for `unique: true` on categoryName
      if (err?.response?.status === 409 || /duplicate/i.test(msg)) {
        setFormError("A category with this name already exists.");
      } else {
        setFormError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category) => setDeleteTarget(category);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryAPI.delete(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setBanner({
        type: "success",
        text: `"${deleteTarget.categoryName}" deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete category.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (category) => {
    setTogglingId(category._id);
    const nextStatus = !category.status;
    // optimistic update
    setCategories((prev) =>
      prev.map((c) =>
        c._id === category._id ? { ...c, status: nextStatus } : c,
      ),
    );
    try {
      await categoryAPI.update(category._id, { status: nextStatus });
    } catch (err) {
      // revert on failure
      setCategories((prev) =>
        prev.map((c) =>
          c._id === category._id ? { ...c, status: category.status } : c,
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

  const filtered = categories.filter((c) =>
    c.categoryName?.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="catPage" style={styles.page}>
      <style>{css}</style>

      <div className="catContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Categories</h2>
            <p style={styles.subtitle}>
              Create, edit, and manage product categories.
            </p>
          </div>
          <button
            type="button"
            className="catBtnPrimary"
            style={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <PlusIcon /> New category
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

        <div style={styles.searchWrap} className="catSearchWrap">
          <span style={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            className="catInput"
          />
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading categories…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {categories.length === 0
                ? "No categories yet. Create your first one."
                : "No categories match your search."}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Category name</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr key={category._id} className="catRow">
                    <td style={styles.td}>{category.categoryName}</td>
                    <td style={styles.td}>
                      <div style={styles.statusCell}>
                        <ToggleSwitch
                          checked={!!category.status}
                          onChange={() => toggleStatus(category)}
                          disabled={togglingId === category._id}
                          label={`Toggle status for ${category.categoryName}`}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: category.status
                              ? palette.green600
                              : palette.slate500,
                          }}
                        >
                          {category.status ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={styles.actionsRow}>
                        <button
                          type="button"
                          className="catIconBtn"
                          style={styles.iconBtn}
                          onClick={() => openEditModal(category)}
                          aria-label="Edit category"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="catIconBtnDanger"
                          style={styles.iconBtn}
                          onClick={() => confirmDelete(category)}
                          aria-label="Delete category"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="catModalOverlay"
          style={styles.overlay}
          onClick={closeModal}
        >
          <div
            className="catModal"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingId ? "Edit category" : "New category"}
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
                <label style={styles.label}>Category name</label>
                <input
                  type="text"
                  className="catInput"
                  style={styles.input}
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Electronics"
                  autoFocus
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
                  className="catBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          className="catModalOverlay"
          style={styles.overlay}
          onClick={cancelDelete}
        >
          <div
            className="catModal"
            style={{ ...styles.modal, maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete category</h3>
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
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.categoryName}</strong>? This can't be
              undone.
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
  container: { width: "100%", padding: 15  },
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
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
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

  .catInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .catBtnPrimary:hover:not(:disabled) { background: ${palette.blue400}; }
  .catBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .catIconBtn:hover { background: ${palette.slate100}; color: ${palette.slate900}; }
  .catIconBtnDanger:hover { background: ${palette.red50}; color: ${palette.red600}; border-color: rgba(220,38,38,0.3); }
  .catRow:hover { background: ${palette.slate50}; }

  @media (max-width: 560px) {
    .catContainer table { font-size: 13px; }
  }
`;

import React, { useEffect, useState } from "react";
import { vacancyAPI } from "../../services/api";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "filled", label: "Filled" },
];

const palette = {
  blue500: "#3B82F6",
  blue400: "#60A5FA",
  blue50: "rgba(59,130,246,0.08)",
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

// colours for each status pill
const statusTone = {
  open: { color: palette.green600, bg: palette.green50, border: "rgba(22,163,74,0.3)" },
  closed: { color: palette.red600, bg: palette.red50, border: "rgba(220,38,38,0.3)" },
  filled: { color: palette.blue500, bg: palette.blue50, border: "rgba(59,130,246,0.3)" },
};

// "2026-10-31T00:00:00.000Z" -> "2026-10-31" (value for <input type="date">)
const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isPast = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
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

export default function VacancyManager() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [banner, setBanner] = useState(null); // { type, text }

  // modal state (create/edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null => create mode
  const [formPosition, setFormPosition] = useState("");
  const [formCount, setFormCount] = useState("1");
  const [formExperience, setFormExperience] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formAbout, setFormAbout] = useState("");
  const [formStatus, setFormStatus] = useState("open");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // per-row status change in-flight
  const [updatingId, setUpdatingId] = useState(null);

  const fetchVacancies = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await vacancyAPI.getAll();
      setVacancies(res?.data ?? []);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load vacancies.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormPosition("");
    setFormCount("1");
    setFormExperience("");
    setFormLocation("");
    setFormEndDate("");
    setFormAbout("");
    setFormStatus("open");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingId(v._id);
    setFormPosition(v.positionName || "");
    setFormCount(String(v.numberOfPositions ?? 1));
    setFormExperience(v.experience || "");
    setFormLocation(v.location || "");
    setFormEndDate(toDateInput(v.endDate));
    setFormAbout(v.aboutPosition || "");
    setFormStatus(v.status || "open");
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const clearError = () => setFormError("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const positionName = formPosition.trim();
    const experience = formExperience.trim();
    const location = formLocation.trim();
    const aboutPosition = formAbout.trim();
    const numberOfPositions = Number(formCount);

    if (!positionName) return setFormError("Position name is required.");
    if (
      formCount === "" ||
      !Number.isInteger(numberOfPositions) ||
      numberOfPositions < 1
    ) {
      return setFormError("Number of positions must be a whole number, 1 or more.");
    }
    if (!experience) return setFormError("Experience is required.");
    if (!location) return setFormError("Location is required.");
    if (!formEndDate) return setFormError("Last date to apply is required.");
    if (!aboutPosition) return setFormError("About the position is required.");

    setSaving(true);
    setFormError("");

    const payload = {
      positionName,
      numberOfPositions,
      experience,
      location,
      aboutPosition,
      endDate: formEndDate,
      status: formStatus,
    };

    try {
      if (editingId) {
        await vacancyAPI.update(editingId, payload);
        setBanner({ type: "success", text: "Vacancy updated." });
      } else {
        await vacancyAPI.create(payload);
        setBanner({ type: "success", text: "Vacancy created." });
      }
      await fetchVacancies({ silent: true });
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (v) => setDeleteTarget(v);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vacancyAPI.delete(deleteTarget._id);
      setVacancies((prev) => prev.filter((v) => v._id !== deleteTarget._id));
      setBanner({
        type: "success",
        text: `"${deleteTarget.positionName}" deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete vacancy.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const changeStatus = async (vacancy, nextStatus) => {
    if (nextStatus === vacancy.status) return;
    setUpdatingId(vacancy._id);
    // optimistic update
    setVacancies((prev) =>
      prev.map((v) => (v._id === vacancy._id ? { ...v, status: nextStatus } : v)),
    );
    try {
      // NOTE: vacancyAPI.status must accept a second `data` argument
      // and pass it as the PATCH body - see the note after this file.
      await vacancyAPI.status(vacancy._id, { status: nextStatus });
    } catch (err) {
      // revert on failure
      setVacancies((prev) =>
        prev.map((v) =>
          v._id === vacancy._id ? { ...v, status: vacancy.status } : v,
        ),
      );
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to update status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = vacancies.filter((v) => {
    const matchesSearch =
      !q ||
      v.positionName?.toLowerCase().includes(q) ||
      v.location?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vacPage" style={styles.page}>
      <style>{css}</style>

      <div className="vacContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Vacancies</h2>
            <p style={styles.subtitle}>
              Post job openings and track whether they're open, closed, or filled.
            </p>
          </div>
          <button
            type="button"
            className="vacBtnPrimary"
            style={styles.btnPrimary}
            onClick={openCreateModal}
          >
            <PlusIcon /> New vacancy
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
              placeholder="Search by position or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
              className="vacInput"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
            className="vacInput"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading vacancies…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {vacancies.length === 0
                ? "No vacancies yet. Create your first one."
                : "No vacancies match your filters."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Position</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Openings</th>
                    <th style={styles.th}>Experience</th>
                    <th style={styles.th}>Last date</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const tone = statusTone[v.status] || statusTone.open;
                    const expired = v.status === "open" && isPast(v.endDate);
                    return (
                      <tr key={v._id} className="vacRow">
                        <td style={{ ...styles.td, minWidth: "180px", fontWeight: 500 }}>
                          {v.positionName}
                        </td>
                        <td style={styles.td}>{v.location}</td>
                        <td style={styles.td}>{v.numberOfPositions}</td>
                        <td style={styles.td}>{v.experience}</td>
                        <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                          <span style={{ color: expired ? palette.red600 : "inherit" }}>
                            {formatDate(v.endDate)}
                          </span>
                          {expired && (
                            <div style={styles.expiredNote}>Past last date</div>
                          )}
                        </td>
                        <td style={styles.td}>
                          <select
                            value={v.status}
                            disabled={updatingId === v._id}
                            onChange={(e) => changeStatus(v, e.target.value)}
                            aria-label={`Status for ${v.positionName}`}
                            className="vacStatusSelect"
                            style={{
                              ...styles.statusSelect,
                              color: tone.color,
                              background: tone.bg,
                              border: `1px solid ${tone.border}`,
                              opacity: updatingId === v._id ? 0.6 : 1,
                            }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right" }}>
                          <div style={styles.actionsRow}>
                            <button
                              type="button"
                              className="vacIconBtn"
                              style={styles.iconBtn}
                              onClick={() => openEditModal(v)}
                              aria-label="Edit vacancy"
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className="vacIconBtnDanger"
                              style={styles.iconBtn}
                              onClick={() => confirmDelete(v)}
                              aria-label="Delete vacancy"
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
        <div className="vacModalOverlay" style={styles.overlay} onClick={closeModal}>
          <div
            className="vacModal"
            style={{ ...styles.modal, maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingId ? "Edit vacancy" : "New vacancy"}
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
                <label style={styles.label}>Position name</label>
                <input
                  type="text"
                  className="vacInput"
                  style={styles.input}
                  value={formPosition}
                  onChange={(e) => {
                    setFormPosition(e.target.value);
                    clearError();
                  }}
                  placeholder="e.g. React Developer"
                  autoFocus
                />
              </div>

              <div className="vacGrid2" style={styles.grid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Number of positions</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="vacInput"
                    style={styles.input}
                    value={formCount}
                    onChange={(e) => {
                      setFormCount(e.target.value);
                      clearError();
                    }}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Experience</label>
                  <input
                    type="text"
                    className="vacInput"
                    style={styles.input}
                    value={formExperience}
                    onChange={(e) => {
                      setFormExperience(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. 1-3 years"
                  />
                </div>
              </div>

              <div className="vacGrid2" style={styles.grid2}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Location</label>
                  <input
                    type="text"
                    className="vacInput"
                    style={styles.input}
                    value={formLocation}
                    onChange={(e) => {
                      setFormLocation(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Patna, Bihar"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Last date to apply</label>
                  <input
                    type="date"
                    className="vacInput"
                    style={styles.input}
                    value={formEndDate}
                    onChange={(e) => {
                      setFormEndDate(e.target.value);
                      clearError();
                    }}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>About the position</label>
                <textarea
                  className="vacInput"
                  style={styles.textarea}
                  rows={5}
                  value={formAbout}
                  onChange={(e) => {
                    setFormAbout(e.target.value);
                    clearError();
                  }}
                  placeholder="Responsibilities, required skills, and anything applicants should know."
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select
                  className="vacInput"
                  style={{ ...styles.input, maxWidth: "200px" }}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
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
                  className="vacBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Create vacancy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="vacModalOverlay" style={styles.overlay} onClick={cancelDelete}>
          <div
            className="vacModal"
            style={{ ...styles.modal, maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete vacancy</h3>
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
              <strong>{deleteTarget.positionName}</strong>? This can't be undone.
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
    flex: "1 1 260px",
    maxWidth: "340px",
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
    minWidth: "160px",
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
  expiredNote: { fontSize: "11px", color: palette.red600, marginTop: "2px" },
  statusSelect: {
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "999px",
    padding: "5px 10px",
    outline: "none",
    cursor: "pointer",
  },
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
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
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

  .vacInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .vacBtnPrimary:hover:not(:disabled) { background: ${palette.blue400} !important; }
  .vacBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .vacIconBtn:hover { background: ${palette.slate100} !important; color: ${palette.slate900} !important; }
  .vacIconBtnDanger:hover { background: ${palette.red50} !important; color: ${palette.red600} !important; border-color: rgba(220,38,38,0.3) !important; }
  .vacRow:hover { background: ${palette.slate50}; }
  .vacStatusSelect:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  .vacStatusSelect:disabled { cursor: not-allowed; }

  @media (max-width: 560px) {
    .vacContainer table { font-size: 13px; }
    .vacGrid2 { grid-template-columns: 1fr !important; }
  }
`;
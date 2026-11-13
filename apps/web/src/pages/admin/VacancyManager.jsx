import { useEffect, useState } from "react";
import { vacancyAPI } from "../../services/api";
import { clearVacancyCache } from "../../lib/publicCache";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const loadVacanciesData = async () => {
  const { data: res } = await vacancyAPI.getAll();
  return res?.data ?? [];
};

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "filled", label: "Filled" },
];

const statusTone = {
  open: { color: "#285234", bg: "#ecf2ed", border: "rgba(40, 82, 52, 0.25)" },
  closed: { color: "#b91c1c", bg: "#fef2f2", border: "rgba(185, 28, 28, 0.28)" },
  filled: { color: "#6b501f", bg: "#f5efe2", border: "rgba(197, 160, 89, 0.42)" },
};

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

export default function VacancyManager() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [banner, setBanner] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formPosition, setFormPosition] = useState("");
  const [formCount, setFormCount] = useState("1");
  const [formExperience, setFormExperience] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formAbout, setFormAbout] = useState("");
  const [formStatus, setFormStatus] = useState("open");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchVacancies = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const list = await loadVacanciesData();
      setVacancies(list);
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
    let cancelled = false;
    loadVacanciesData()
      .then((list) => {
        if (!cancelled) setVacancies(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load vacancies.",
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
      clearVacancyCache();
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
      clearVacancyCache();
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
    setVacancies((prev) =>
      prev.map((v) => (v._id === vacancy._id ? { ...v, status: nextStatus } : v)),
    );
    try {
      await vacancyAPI.status(vacancy._id, { status: nextStatus });
      clearVacancyCache();
    } catch (err) {
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
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Vacancies</h2>
            <p className="adm-subtitle">
              Publish studio &amp; engineering roles and track open, closed, or filled openings.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New vacancy</span>
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
              placeholder="Search by position or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="adm-filter-select"
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

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading vacancies…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {vacancies.length === 0
                ? "No vacancies yet. Create your first one."
                : "No vacancies match your filters."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Openings</th>
                    <th>Experience</th>
                    <th>Last date</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => {
                    const tone = statusTone[v.status] || statusTone.open;
                    const expired = v.status === "open" && isPast(v.endDate);
                    return (
                      <tr key={v._id}>
                        <td style={{ fontWeight: 600, minWidth: "180px" }}>{v.positionName}</td>
                        <td>{v.location}</td>
                        <td>
                          <span className="adm-chip-neutral">{v.numberOfPositions}</span>
                        </td>
                        <td>{v.experience}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span style={{ color: expired ? "#b91c1c" : "var(--crex-ink)" }}>
                            {formatDate(v.endDate)}
                          </span>
                          {expired && (
                            <div style={{ fontSize: "11px", color: "#b91c1c", fontWeight: 600, marginTop: "2px" }}>
                              Past last date
                            </div>
                          )}
                        </td>
                        <td>
                          <select
                            value={v.status}
                            disabled={updatingId === v._id}
                            onChange={(e) => changeStatus(v, e.target.value)}
                            aria-label={`Status for ${v.positionName}`}
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "9999px",
                              padding: "5px 12px",
                              color: tone.color,
                              background: tone.bg,
                              border: `1px solid ${tone.border}`,
                              cursor: "pointer",
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
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="adm-icon-btn"
                              onClick={() => openEditModal(v)}
                              aria-label="Edit vacancy"
                              title="Edit vacancy"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="adm-icon-btn is-danger"
                              onClick={() => confirmDelete(v)}
                              aria-label="Delete vacancy"
                              title="Delete vacancy"
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
            style={{ maxWidth: "560px" }}
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
                {editingId ? "Edit vacancy" : "New vacancy"}
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
                <label style={{ marginBottom: "6px" }}>Position name *</label>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(e) => {
                    setFormPosition(e.target.value);
                    clearError();
                  }}
                  placeholder="e.g. Senior Interior Architect"
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div className="adm-grid-2">
                <div>
                  <label style={{ marginBottom: "6px" }}>Number of positions *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formCount}
                    onChange={(e) => {
                      setFormCount(e.target.value);
                      clearError();
                    }}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ marginBottom: "6px" }}>Experience *</label>
                  <input
                    type="text"
                    value={formExperience}
                    onChange={(e) => {
                      setFormExperience(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. 3-5 years"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="adm-grid-2">
                <div>
                  <label style={{ marginBottom: "6px" }}>Location *</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => {
                      setFormLocation(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Al Quoz, Dubai"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ marginBottom: "6px" }}>Last date to apply *</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => {
                      setFormEndDate(e.target.value);
                      clearError();
                    }}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>About the position *</label>
                <textarea
                  rows={5}
                  value={formAbout}
                  onChange={(e) => {
                    setFormAbout(e.target.value);
                    clearError();
                  }}
                  placeholder="Responsibilities, technical qualifications, and requirements."
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={{ width: "200px" }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {formError && (
                  <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "6px", fontWeight: 500 }}>
                    {formError}
                  </div>
                )}
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
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create vacancy"}
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
                Delete vacancy
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
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.positionName}</strong>? This action cannot be undone.
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

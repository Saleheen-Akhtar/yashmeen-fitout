import React, { useEffect, useState } from "react";
import { categoryAPI } from "../../services/api";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const invalidateSiteCaches = () => {
  try {
    localStorage.removeItem("photogallery:data:v1");
    localStorage.removeItem("photogallery:data:v5");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent("projects-updated"));
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

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState(null); // { type, text }

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formStatus, setFormStatus] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
    setFormName(category.categoryName || "");
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
        invalidateSiteCaches();
        setBanner({ type: "success", text: "Category updated." });
      } else {
        const { data: res } = await categoryAPI.create({
          categoryName: trimmed,
          status: formStatus,
        });
        const created = res?.data;
        setCategories((prev) => [created, ...prev]);
        invalidateSiteCaches();
        setBanner({ type: "success", text: "Category created." });
      }
      setModalOpen(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong.";
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
      invalidateSiteCaches();
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
    setCategories((prev) =>
      prev.map((c) =>
        c._id === category._id ? { ...c, status: nextStatus } : c,
      ),
    );
    try {
      await categoryAPI.update(category._id, { status: nextStatus });
      invalidateSiteCaches();
    } catch (err) {
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
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Categories</h2>
            <p className="adm-subtitle">
              Create, edit, and organise portfolio and gallery categories across the site.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New category</span>
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
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading categories…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {categories.length === 0
                ? "No categories yet. Create your first one."
                : "No categories match your search."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category name</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((category) => (
                    <tr key={category._id}>
                      <td style={{ fontWeight: 600, minWidth: "180px" }}>
                        {category.categoryName}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <ToggleSwitch
                            checked={!!category.status}
                            onChange={() => toggleStatus(category)}
                            disabled={togglingId === category._id}
                            label={`Toggle status for ${category.categoryName}`}
                          />
                          <span
                            style={{
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: category.status ? "#285234" : "var(--crex-muted)",
                            }}
                          >
                            {category.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="adm-icon-btn"
                            onClick={() => openEditModal(category)}
                            aria-label="Edit category"
                            title="Edit category"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="adm-icon-btn is-danger"
                            onClick={() => confirmDelete(category)}
                            aria-label="Delete category"
                            title="Delete category"
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
            style={{ maxWidth: "440px" }}
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
                {editingId ? "Edit category" : "New category"}
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
                <label style={{ marginBottom: "6px" }}>Category name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError("");
                  }}
                  placeholder="e.g. Residential Villas"
                  autoFocus
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
                Delete category
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
              <strong>{deleteTarget.categoryName}</strong>? This action cannot be undone.
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

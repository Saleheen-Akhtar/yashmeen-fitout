import { useEffect, useRef, useState } from "react";
import { projectAPI, categoryAPI, itemPath } from "../../services/api";
import { clearProjectsCache, clearProjectDetailsCache } from "../../lib/publicCache";
import { FiEdit2, FiImage, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import AdminPager from "../../components/admin/AdminPager";
import AdminMediaImage from "../../components/admin/AdminMediaImage";

const FALLBACK_IMG = "/static/hero-aperture-v2.webp";
const FETCH_PARAMS = { limit: 1000, page: 1 };
const PAGE_SIZE = 8;
const MAX_IMAGES = 10;
const MAX_IMAGE_MB = 5;

const invalidateSiteCaches = (projectId) => {
  clearProjectsCache();
  clearProjectDetailsCache(projectId);
  window.dispatchEvent(new CustomEvent("projects-updated"));
};

const loadProjectsData = async () => {
  const { data: res } = await projectAPI.getAll(FETCH_PARAMS);
  return res?.data ?? [];
};

const loadProjectCategoriesData = async () => {
  const { data: res } = await categoryAPI.getAll(FETCH_PARAMS);
  return res?.data ?? [];
};

const getCategoryId = (p) =>
  typeof p?.categoryId === "object" && p.categoryId !== null
    ? p.categoryId._id
    : p?.categoryId;

const imageUrl = (path = "") => {
  if (!path) return "";
  if (/^(https?:|data:|blob:|\/static\/|\/images\/)/i.test(path)) return path;
  return `${itemPath ?? ""}/${String(path).replace(/^\/+/, "")}`;
};

const isValidUrl = (value) => {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [banner, setBanner] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSize, setFormSize] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formScope, setFormScope] = useState("");
  const [formSector, setFormSector] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formFeaturedOrder, setFormFeaturedOrder] = useState(0);
  const [formImages, setFormImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const fileRef = useRef(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const getCategoryLabel = (id) =>
    categories.find((c) => c._id === id)?.categoryName || "-";

  const fetchProjects = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const list = await loadProjectsData();
      setProjects(list);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load projects.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadProjectsData()
      .then((list) => {
        if (!cancelled) setProjects(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load projects.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    loadProjectCategoriesData()
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

  const resetNewFiles = () => {
    setNewFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.preview));
      return [];
    });
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormCategory("");
    setFormTitle("");
    setFormSize("");
    setFormLocation("");
    setFormScope("");
    setFormSector("");
    setFormVideoUrl("");
    setFormDescription("");
    setFormIsFeatured(false);
    setFormFeaturedOrder(0);
    setFormImages([]);
    resetNewFiles();
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setFormCategory(getCategoryId(p) || "");
    setFormTitle(p.title || "");
    setFormSize(p.size || "");
    setFormLocation(p.location || "");
    setFormScope(p.scope || "");
    setFormSector(p.sector || "");
    setFormVideoUrl(p.videoUrl || "");
    setFormDescription(p.description || "");
    setFormIsFeatured(Boolean(p.isFeatured));
    setFormFeaturedOrder(Number(p.featuredOrder) || 1);
    setFormImages(Array.isArray(p.images) ? p.images : []);
    resetNewFiles();
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    resetNewFiles();
    setModalOpen(false);
  };

  const clearError = () => setFormError("");

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;

    let error = "";
    const accepted = [];
    let room = MAX_IMAGES - formImages.length - newFiles.length;

    for (const file of picked) {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (!file.type.startsWith("image/")) {
        error = `${file.name} is not an image.`;
      } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        error = `${file.name} is larger than ${MAX_IMAGE_MB} MB.`;
      } else if (newFiles.some((f) => f.id === id) || accepted.some((f) => f.id === id)) {
        continue;
      } else if (room <= 0) {
        error = `You can add up to ${MAX_IMAGES} images.`;
      } else {
        accepted.push({ id, file, preview: URL.createObjectURL(file) });
        room -= 1;
      }
    }

    if (accepted.length) setNewFiles((prev) => [...prev, ...accepted]);
    setFormError(error);
  };

  const removeExisting = (url) =>
    setFormImages((prev) => prev.filter((i) => i !== url));

  const removeNew = (id) =>
    setNewFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const title = formTitle.trim();
    const size = formSize.trim();
    const location = formLocation.trim();
    const scope = formScope.trim();
    const sector = formSector.trim();
    const videoUrl = formVideoUrl.trim();
    const description = formDescription.trim();

    if (!formCategory) return setFormError("Category is required.");
    if (!title) return setFormError("Title is required.");
    if (videoUrl && !isValidUrl(videoUrl)) {
      return setFormError("Video URL must start with http or https.");
    }

    setSaving(true);
    setFormError("");

    const payload = new FormData();
    payload.append("categoryId", formCategory);
    payload.append("title", title);
    payload.append("size", size);
    payload.append("location", location);
    payload.append("scope", scope);
    payload.append("sector", sector);
    payload.append("videoUrl", videoUrl);
    payload.append("description", description);
    payload.append("isFeatured", formIsFeatured);
    payload.append("featuredOrder", formFeaturedOrder);
    payload.append("existingImages", JSON.stringify(formImages));
    newFiles.forEach((f) => payload.append("images", f.file));

    try {
      if (editingId) {
        await projectAPI.update(editingId, payload);
        setBanner({ type: "success", text: "Project updated and synced with live site." });
      } else {
        await projectAPI.create(payload);
        setBanner({ type: "success", text: "Project created and published to live site." });
      }
      await fetchProjects({ silent: true });
      invalidateSiteCaches(editingId || undefined);
      resetNewFiles();
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err?.message || "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (p) => setDeleteTarget(p);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectAPI.delete(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      invalidateSiteCaches(deleteTarget._id);
      setBanner({ type: "success", text: `"${deleteTarget.title}" deleted.` });
      setDeleteTarget(null);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete project.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    const matchesSearch = !q || p.title?.toLowerCase().includes(q);
    const matchesCategory =
      categoryFilter === "all" || getCategoryId(p) === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const pagedProjects = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Projects</h2>
            <p className="adm-subtitle">
              Add architectural fit-out works with images and videos, organised by category.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={openCreateModal}
          >
            <FiPlus size={15} />
            <span>New project</span>
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
              placeholder="Search by title…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="adm-search-input"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
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
            <div className="adm-empty">Loading projects…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {projects.length === 0
                ? "No projects yet. Add your first one."
                : "No projects match your filters."}
            </div>
          ) : (
            <>
              <div className="adm-table-wrap">
                <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Images</th>
                    <th>Video</th>
                    <th>Added</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProjects.map((p) => {
                    const cover = p.images?.[0] ? imageUrl(p.images[0]) : "";
                    const catLabel =
                      typeof p.categoryId === "object" && p.categoryId
                        ? p.categoryId.categoryName
                        : getCategoryLabel(p.categoryId);
                    return (
                      <tr key={p._id}>
                        <td style={{ minWidth: "240px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {cover ? (
                              <AdminMediaImage
                                src={cover}
                                fallbackSrc={FALLBACK_IMG}
                                alt={p.title || "project"}
                                style={{
                                  width: "56px",
                                  height: "44px",
                                  borderRadius: "10px",
                                  objectFit: "cover",
                                  border: "1px solid var(--crex-line)",
                                  flexShrink: 0,
                                  background: "var(--crex-limestone)",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "56px",
                                  height: "44px",
                                  borderRadius: "10px",
                                  background: "var(--crex-limestone)",
                                  border: "1px dashed var(--crex-line-strong)",
                                  color: "var(--crex-muted-soft)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <FiImage size={16} />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 600 }}>{p.title}</span>
                                {p.isFeatured && (
                                  <span
                                    className="adm-chip"
                                    style={{
                                      background: "rgba(186, 153, 94, 0.15)",
                                      color: "#8b6f3c",
                                      border: "1px solid rgba(186, 153, 94, 0.35)",
                                      fontSize: "10px",
                                      padding: "1px 6px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.04em",
                                    }}
                                  >
                                    Featured {p.featuredOrder > 0 ? `#${p.featuredOrder}` : ""}
                                  </span>
                                )}
                              </div>
                              {p.description && (
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--crex-muted)",
                                    marginTop: "2px",
                                    maxWidth: "300px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {catLabel && catLabel !== "-" ? (
                            <span className="adm-chip">{catLabel}</span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{p.location || "-"}</td>
                        <td>
                          <span className="adm-chip-neutral">{p.images?.length || 0}</span>
                        </td>
                        <td>
                          {p.videoUrl ? (
                            <a
                              href={p.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="adm-link"
                            >
                              Watch
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td style={{ whiteSpace: "nowrap", color: "var(--crex-muted)" }}>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="adm-icon-btn"
                              onClick={() => openEditModal(p)}
                              aria-label="Edit project"
                              title="Edit project"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="adm-icon-btn is-danger"
                              onClick={() => confirmDelete(p)}
                              aria-label="Delete project"
                              title="Delete project"
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
              <AdminPager
                page={safePage}
                pageSize={PAGE_SIZE}
                totalItems={filtered.length}
                onPageChange={setPage}
                noun="projects"
              />
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="adm-overlay" onClick={closeModal}>
          <div
            className="adm-modal"
            style={{ maxWidth: "580px" }}
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
                {editingId ? "Edit project" : "New project"}
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
                <label style={{ marginBottom: "6px" }}>Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    clearError();
                  }}
                  placeholder="e.g. EDC Headquarters"
                  autoFocus
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    clearError();
                  }}
                  style={{ width: "100%" }}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="adm-grid-2">
                <div>
                  <label style={{ marginBottom: "6px" }}>Size (optional)</label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => {
                      setFormSize(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. 15,210 Sq. ft"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ marginBottom: "6px" }}>Location (optional)</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => {
                      setFormLocation(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Abu Dhabi"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ marginBottom: "6px" }}>Scope (optional)</label>
                  <input
                    type="text"
                    value={formScope}
                    onChange={(e) => {
                      setFormScope(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Design and Build"
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ marginBottom: "6px" }}>Sector (optional)</label>
                  <input
                    type="text"
                    value={formSector}
                    onChange={(e) => {
                      setFormSector(e.target.value);
                      clearError();
                    }}
                    placeholder="e.g. Commercial"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Video URL (optional)</label>
                <input
                  type="url"
                  value={formVideoUrl}
                  onChange={(e) => {
                    setFormVideoUrl(e.target.value);
                    clearError();
                  }}
                  placeholder="https://youtube.com/watch?v=…"
                  style={{ width: "100%" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: formIsFeatured ? "rgba(186, 153, 94, 0.12)" : "rgba(0, 0, 0, 0.03)",
                  border: formIsFeatured ? "1px solid rgba(186, 153, 94, 0.4)" : "1px solid rgba(0, 0, 0, 0.08)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: formIsFeatured ? "#8b6f3c" : "inherit" }}>
                      Feature on Homepage Showcase
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--crex-muted)", marginTop: "2px" }}>
                      Pin this project to the 3D gallery and flagship curation on the home screen
                    </div>
                  </div>
                  <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={Boolean(formIsFeatured)}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#ba995e" }}
                    />
                  </label>
                </div>

                {formIsFeatured && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px dashed rgba(186, 153, 94, 0.3)" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#8b6f3c" }}>
                      Showcase Sequence (Position 1 to 6)
                    </label>
                    <select
                      value={formFeaturedOrder || 1}
                      onChange={(e) => setFormFeaturedOrder(Number(e.target.value))}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        border: "1px solid rgba(186, 153, 94, 0.5)",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: "#fff",
                        color: "#1a1a1a",
                        cursor: "pointer",
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          Position #{num} {num === 1 ? "(Initial Center)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Description</label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    clearError();
                  }}
                  placeholder="Scope summary, finishes, and key architectural details."
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ marginBottom: "6px" }}>Images</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="adm-dropzone"
                  style={{ width: "100%", minHeight: "100px" }}
                  onClick={() => fileRef.current?.click()}
                >
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--crex-ink)" }}>
                    Choose images
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--crex-muted)" }}>
                    Select one or several. Up to {MAX_IMAGES} images, {MAX_IMAGE_MB} MB each.
                  </span>
                  <span style={{ fontSize: "11px", color: "#8b6f3c", fontWeight: 500, marginTop: "4px" }}>
                    Optimal for 3D Carousel: 4:5 portrait (e.g. 1600 x 2000px).
                  </span>
                </button>

                {(formImages.length > 0 || newFiles.length > 0) && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >
                    {formImages.map((url) => (
                      <div key={url} style={thumbWrapStyle}>
                        <AdminMediaImage
                          src={imageUrl(url)}
                          fallbackSrc={FALLBACK_IMG}
                          alt="Saved project"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExisting(url)}
                          style={removeImgBtnStyle}
                          aria-label="Remove image"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                    {newFiles.map((f) => (
                      <div key={f.id} style={thumbWrapStyle}>
                        <img
                          src={f.preview}
                          alt="Upload preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            left: "4px",
                            bottom: "4px",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "9999px",
                            background: "#1b1a17",
                            color: "#8a6a28",
                          }}
                        >
                          New
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNew(f.id)}
                          style={removeImgBtnStyle}
                          aria-label="Remove image"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formError && (
                  <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "8px", fontWeight: 500 }}>
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
                  {saving
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Create project"}
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
                Delete project
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

const thumbWrapStyle = {
  position: "relative",
  height: "76px",
  borderRadius: "10px",
  overflow: "hidden",
  border: "1px solid var(--crex-line-strong)",
  background: "var(--crex-limestone)",
};

const removeImgBtnStyle = {
  position: "absolute",
  top: "4px",
  right: "4px",
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  border: "none",
  background: "rgba(8,8,7,0.75)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

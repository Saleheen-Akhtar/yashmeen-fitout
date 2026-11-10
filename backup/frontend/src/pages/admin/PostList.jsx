import React, { useEffect, useState } from "react";
import { itemPath, postAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { tokenExpired } from "../../libs/helpers";
import { toast } from "sonner";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const FALLBACK_IMG = "/static/hero-aperture.png";

const resolvePostImg = (file) => {
  if (!file) return "";
  if (/^(https?:|data:|blob:|\/static\/|\/images\/)/i.test(file)) return file;
  return `${itemPath ?? "/uploads"}/${String(file).replace(/^\/+/, "")}`;
};

export default function PostList() {
  const [postData, setPostData] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchPosts = async ({ silent = false } = {}) => {
    try {
      if (!silent) setPageLoading(true);
      const { data: res } = await postAPI.getAll();
      setPostData((res?.data || []).slice().reverse());
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to load journal posts.";
      tokenExpired(msg);
      toast.error(msg);
    } finally {
      if (!silent) setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const updatePostStatus = async (post) => {
    if (!post?._id || togglingId === post._id) return;
    const prevStatus = Boolean(post.status);
    setTogglingId(post._id);
    setPostData((prev) =>
      prev.map((item) =>
        item._id === post._id ? { ...item, status: !prevStatus } : item,
      ),
    );
    try {
      await postAPI.status(post._id);
      toast.success(!prevStatus ? "Post published." : "Post moved to draft.");
    } catch (error) {
      setPostData((prev) =>
        prev.map((item) =>
          item._id === post._id ? { ...item, status: prevStatus } : item,
        ),
      );
      toast.error(error?.response?.data?.message || "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePost = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await postAPI.delete(deleteTarget._id);
      setPostData((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  };

  if (pageLoading) return <Loading />;

  const q = search.trim().toLowerCase();
  const filtered = postData.filter(
    (p) => !q || (p?.title || "").toLowerCase().includes(q),
  );

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Journal &amp; Blog</h2>
            <p className="adm-subtitle">
              Publish architectural articles, insights, and studio dispatches.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={() => navigate("/dashboard/create-blog")}
          >
            <FiPlus size={15} />
            <span>New Blog Post</span>
          </button>
        </div>

        <div className="adm-filters">
          <div className="adm-search-wrap">
            <span className="adm-search-icon">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="Search articles by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card">
          {filtered.length === 0 ? (
            <div className="adm-empty">
              {postData.length === 0
                ? "No journal articles yet. Create your first post."
                : "No posts match your search."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post) => {
                    const active = Boolean(post?.status);
                    const isBusy = togglingId === post?._id;
                    return (
                      <tr key={post?._id}>
                        <td>
                          {post?.file ? (
                            <img
                              src={resolvePostImg(post.file)}
                              alt={post?.title || "post"}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_IMG;
                              }}
                              style={{
                                width: "68px",
                                height: "48px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                border: "1px solid var(--crex-line)",
                                display: "block",
                                background: "var(--crex-limestone)",
                              }}
                            />
                          ) : (
                            <span style={{ color: "var(--crex-muted-soft)" }}>-</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, minWidth: "200px" }}>
                          {post?.title}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={active}
                              aria-label={`Toggle status for ${post?.title}`}
                              disabled={isBusy}
                              onClick={() => updatePostStatus(post)}
                              style={{
                                width: "42px",
                                height: "24px",
                                borderRadius: "9999px",
                                border: "none",
                                padding: "3px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: active ? "flex-end" : "flex-start",
                                background: active ? "#080807" : "#d8d5ce",
                                cursor: isBusy ? "not-allowed" : "pointer",
                                opacity: isBusy ? 0.6 : 1,
                                transition: "background 0.2s ease",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "50%",
                                  background: active ? "#c5a059" : "#ffffff",
                                  boxShadow: "0 1px 2px rgba(8,8,7,0.28)",
                                }}
                              />
                            </button>
                            <span
                              style={{
                                fontSize: "12.5px",
                                fontWeight: 600,
                                color: active ? "#285234" : "var(--crex-muted)",
                              }}
                            >
                              {active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="adm-icon-btn"
                              onClick={() => navigate(`/dashboard/update-blog/${post?._id}`)}
                              title="Edit post"
                              aria-label="Edit post"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              type="button"
                              className="adm-icon-btn is-danger"
                              onClick={() => setDeleteTarget(post)}
                              title="Delete post"
                              aria-label="Delete post"
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

      {deleteTarget && (
        <div
          className="adm-overlay"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="adm-modal"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Delete post</h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => !deleting && setDeleteTarget(null)}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--crex-muted)", lineHeight: 1.55 }}>
              Are you sure you want to permanently delete <strong>{deleteTarget.title}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-danger-solid"
                onClick={handleDeletePost}
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

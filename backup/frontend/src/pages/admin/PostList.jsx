import React, { useEffect, useState } from "react";
import { itemPath, postAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import { tokenExpired } from "../../libs/helpers";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

export default function PostList() {
  const [postData, setPostData] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);

  const navigate = useNavigate();

  const updatePostStatus = async (id) => {
    try {
      await postAPI.status(id);
      fetchPosts();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to update status");
    }
  };

  const fetchPosts = async () => {
    try {
      setPageLoading(true);
      const { data: res } = await postAPI.getAll();
      setPostData((res?.data || []).slice().reverse());
    } catch (error) {
      console.error(error?.response?.data?.message);
      tokenExpired(error?.response?.data?.message);
    } finally {
      setPageLoading(false);
    }
  };

  const deletePost = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await postAPI.delete(id);
      alert("Post deleted");
      fetchPosts();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to delete post");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (pageLoading) return <Loading />;

  const styles = {
    pageHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    heading: {
      margin: 0,
      fontSize: "22px",
      fontWeight: 600,
      color: "#1f2328",
    },
    addBtn: {
      padding: "10px 18px",
      fontSize: "14px",
      fontWeight: 600,
      color: "#fff",
      backgroundColor: "#4f46e5",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    tableWrap: {
      backgroundColor: "#fff",
      borderRadius: "10px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "14px 16px",
      fontSize: "13px",
      fontWeight: 600,
      color: "#6b7280",
      borderBottom: "1px solid #e5e7eb",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "14px 16px",
      fontSize: "14px",
      color: "#1f2328",
      borderBottom: "1px solid #f0f1f3",
      verticalAlign: "middle",
    },
    poster: {
      width: "56px",
      height: "56px",
      objectFit: "cover",
      borderRadius: "6px",
    },
    // toggle switch, driven purely by boolean `active`
    toggleWrap: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    toggleTrack: (active) => ({
      position: "relative",
      width: "42px",
      height: "24px",
      borderRadius: "999px",
      backgroundColor: active ? "#4f46e5" : "#d1d5db",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      flexShrink: 0,
    }),
    toggleThumb: (active) => ({
      position: "absolute",
      top: "3px",
      left: active ? "21px" : "3px",
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      backgroundColor: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
      transition: "left 0.2s ease",
    }),
    toggleLabel: (active) => ({
      fontSize: "13px",
      fontWeight: 600,
      color: active ? "#065f46" : "#6b7280",
    }),
    actions: {
      display: "flex",
      gap: "10px",
    },
    iconBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      backgroundColor: "#fff",
      cursor: "pointer",
      color: "#374151",
    },
    deleteBtn: {
      color: "#dc2626",
      borderColor: "#fecaca",
    },
    empty: {
      padding: "48px 16px",
      textAlign: "center",
      color: "#6b7280",
      fontSize: "14px",
    },
  };

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.heading}>Blog List</h2>
        <button
          type="button"
          style={styles.addBtn}
          onClick={() => navigate("/dashboard/create-blog")}
        >
          + Add Blog
        </button>
      </div>

      <div style={styles.tableWrap}>
        {postData.length === 0 ? (
          <div style={styles.empty}>
            No blogs yet. Create your first blog to see it here.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Poster</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {postData.map((post) => {
                const active = Boolean(post?.status);
                return (
                  <tr key={post?._id}>
                    <td style={styles.td}>
                      {post?.file ? (
                        <img
                          src={`${itemPath}/${post.file}`}
                          alt={post?.title || "post"}
                          style={styles.poster}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={styles.td}>{post?.title}</td>
                    <td style={styles.td}>
                      <div style={styles.toggleWrap}>
                        <div
                          style={styles.toggleTrack(active)}
                          onClick={() => updatePostStatus(post?.pageUrl)}
                          role="switch"
                          aria-checked={active}
                          title="Click to toggle status"
                        >
                          <div style={styles.toggleThumb(active)} />
                        </div>
                        <span style={styles.toggleLabel(active)}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          type="button"
                          style={styles.iconBtn}
                          onClick={() =>
                            navigate(`/dashboard/update-blog/${post?._id}`)
                          }
                          title="Edit post"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          style={{ ...styles.iconBtn, ...styles.deleteBtn }}
                          onClick={() => deletePost(post?._id)}
                          title="Delete post"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

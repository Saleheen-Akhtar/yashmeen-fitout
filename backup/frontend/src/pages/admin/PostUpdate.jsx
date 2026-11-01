import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapterPlugin } from "../../libs/uploader";
import { tokenExpired } from "../../libs/helpers";
import { itemPath, postAPI } from "../../services/api";
import Loading from "../../components/Loading";

const DEFAULT_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <rect width="150" height="150" fill="#F1F3F5"/>
      <path d="M45 100 L65 75 L80 92 L100 65 L115 100 Z" fill="#C6CBD1"/>
      <circle cx="55" cy="55" r="9" fill="#C6CBD1"/>
    </svg>`,
  );

export default function PostUpdate() {
  const [title, setTitle] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const { postId } = useParams();
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      setPageLoading(true);
      const { data: res } = await postAPI.getBy(postId);
      
      const post = res.data;
      setTitle(post.title);
      setPreviewImage(post.file);
      setContent(post.content);
    } catch (error) {
      console.error(error?.response?.data?.message);
      tokenExpired(error?.response?.data?.message);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      if (featuredImage) fd.append("file", featuredImage);

      await postAPI.update(postId, fd);

      alert("Post updated");
      navigate("/dashboard/blog-manager");
    } catch (error) {
      console.error(error?.response?.data?.message);
      alert(error?.response?.data?.message || "Failed to update post");
      tokenExpired(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFeaturedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (pageLoading) return <Loading />;

  const styles = {
    pageHeader: {
      marginBottom: "24px",
    },
    heading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: 0,
      fontSize: "22px",
      fontWeight: 600,
      color: "#1f2328",
    },
    manage: {
      padding: "24px",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    },
    formRow: {
      display: "flex",
      gap: "20px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    inptRow: {
      display: "flex",
      flexDirection: "column",
      flex: "1 1 260px",
      gap: "6px",
    },
    label: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#333",
    },
    input: {
      padding: "10px 12px",
      fontSize: "14px",
      border: "1px solid #d0d5dd",
      borderRadius: "6px",
      outline: "none",
      color: "#1f2328",
      backgroundColor: "#fff",
    },
    select: {
      padding: "10px 12px",
      fontSize: "14px",
      border: "1px solid #d0d5dd",
      borderRadius: "6px",
      outline: "none",
      color: "#1f2328",
      backgroundColor: "#fff",
    },
    previewWrap: {
      marginBottom: "10px",
    },
    previewImg: {
      width: "150px",
      height: "150px",
      objectFit: "cover",
      borderRadius: "8px",
      border: "1px solid #ddd",
      display: "block",
    },
    spin: {
      animation: "spin 1s linear infinite",
    },
    submitBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "11px 26px",
      fontSize: "14px",
      fontWeight: 600,
      color: "#ffffff",
      backgroundColor: loading ? "#7EA6F0" : "#2563EB",
      border: "none",
      borderRadius: "8px",
      cursor: loading ? "default" : "pointer",
      boxShadow: "0 1px 2px rgba(37, 99, 235, 0.3)",
      transition: "background-color 0.15s ease",
    },
    spinnerIcon: {
      width: "14px",
      height: "14px",
      border: "2px solid rgba(255,255,255,0.4)",
      borderTopColor: "#ffffff",
      borderRadius: "50%",
    },
  };

  return (
    <>
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>

      <div style={styles.pageHeader}>
        <h2 style={styles.heading}>Update Blog</h2>
      </div>

      <div style={styles.manage}>
        <div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formRow}>
              <div style={styles.inptRow}>
                <label style={styles.label}>Title</label>
                <input
                  style={styles.input}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  required
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.inptRow}>
                <label style={styles.label}>Poster</label>
                <div style={styles.previewWrap}>
                  <img
                    src={`${itemPath}/${previewImage}`}
                    alt="Preview"
                    style={styles.previewImg}
                  />
                </div>
                <input
                  style={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.inptRow, flex: "1 1 100%" }}>
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    extraPlugins: [CustomUploadAdapterPlugin],
                  }}
                  data={content}
                  onChange={(event, editor) => setContent(editor.getData())}
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading && (
                <span style={{ ...styles.spin, ...styles.spinnerIcon }} />
              )}
              {loading ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

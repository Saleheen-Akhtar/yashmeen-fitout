import { useState } from "react";
import { postAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { tokenExpired } from "../../libs/helpers";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapterPlugin } from "../../libs/uploader";

export default function PostCreate() {
  const [title, setTitle] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", title);
      fd.append("content", content);
      if (featuredImage) fd.append("file", featuredImage);

      await postAPI.create(fd);
      setTitle("");
      setContent("");
      navigate("/dashboard/blog-manager");
    } catch (error) {
      console.error(error?.response?.data?.message);
      tokenExpired(
        error?.response?.data?.message ||
          "Something went wrong, please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    heading: {
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
    editorWrap: {
      width: "100%",
    },
    footer: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "24px",
    },
    submitBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 22px",
      fontSize: "14px",
      fontWeight: 600,
      color: "#fff",
      backgroundColor: loading ? "#93a5f5" : "#4f46e5",
      border: "none",
      borderRadius: "6px",
      cursor: loading ? "not-allowed" : "pointer",
      transition: "background-color 0.15s ease",
    },
    spin: {
      animation: "spin 1s linear infinite",
    },
  };

  return (
    <>
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>

      <div style={styles.pageHeader}>
        <h2 style={styles.heading}>Create Blog</h2>
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
                <input
                  style={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFeaturedImage(e.target.files[0])}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={{ ...styles.inptRow, flex: "1 1 100%" }}>
                <div style={styles.editorWrap}>
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
            </div>

            <div style={styles.footer}>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

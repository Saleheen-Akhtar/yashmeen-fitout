import { useEffect, useState } from "react";
import { postAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { tokenExpired } from "../../libs/helpers";
import { clearPostsCache } from "../../libs/publicCache";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapterPlugin } from "../../libs/uploader";
import { toast } from "sonner";
import { FiArrowLeft, FiImage } from "react-icons/fi";

export default function PostCreate() {
  const [title, setTitle] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFeaturedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Article title is required.");
      return;
    }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", content);
      if (featuredImage) fd.append("file", featuredImage);

      await postAPI.create(fd);
      clearPostsCache();
      toast.success("Article published to live website!");
      navigate("/dashboard/blog-manager");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Something went wrong, please try again.";
      tokenExpired(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Create Journal Post</h2>
            <p className="adm-subtitle">
              Compose an article with cover artwork and rich typography.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => navigate("/dashboard/blog-manager")}
          >
            <FiArrowLeft size={15} />
            <span>Back to Journal</span>
          </button>
        </div>

        <div className="adm-card" style={{ padding: "clamp(18px, 3vw, 28px)" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
            <div>
              <label style={{ marginBottom: "6px" }}>Article Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sculpted Limestone & Warm Brass Fit-Outs in DIFC"
                required
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ marginBottom: "6px" }}>Cover Poster Image</label>
              <label className="adm-dropzone">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    style={{
                      maxHeight: "190px",
                      maxWidth: "100%",
                      borderRadius: "10px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "var(--crex-muted)" }}>
                    <FiImage size={22} />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--crex-ink)" }}>
                      Click to upload cover image
                    </span>
                    <span style={{ fontSize: "11.5px" }}>PNG, JPG or WebP</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div>
              <label style={{ marginBottom: "6px" }}>Article Content</label>
              <div className="adm-editor-wrap">
                <CKEditor
                  editor={ClassicEditor}
                  config={{
                    extraPlugins: [CustomUploadAdapterPlugin],
                  }}
                  data={content}
                  onChange={(_event, editor) => setContent(editor.getData())}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => navigate("/dashboard/blog-manager")}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="adm-btn-primary" disabled={loading}>
                {loading ? "Publishing…" : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

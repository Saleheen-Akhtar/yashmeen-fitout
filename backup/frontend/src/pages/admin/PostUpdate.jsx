import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CustomUploadAdapterPlugin } from "../../libs/uploader";
import { tokenExpired } from "../../libs/helpers";
import { itemPath, postAPI } from "../../services/api";
import Loading from "../../components/Loading";
import { toast } from "sonner";
import { FiArrowLeft, FiImage } from "react-icons/fi";

const FALLBACK_POSTER = "/static/hero-aperture.png";

const resolvePostImg = (src) => {
  if (!src) return FALLBACK_POSTER;
  if (/^(https?:|data:|blob:|\/static\/|\/images\/)/i.test(src)) return src;
  return `${itemPath ?? "/uploads"}/${String(src).replace(/^\/+/, "")}`;
};

export default function PostUpdate() {
  const [title, setTitle] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const blobUrlRef = useRef("");
  const { postId } = useParams();
  const navigate = useNavigate();

  const fetchPost = async () => {
    try {
      setPageLoading(true);
      const { data: res } = await postAPI.getBy(postId);
      const post = res?.data;
      if (post) {
        setTitle(post.title || "");
        setPreviewImage(post.file || "");
        setContent(post.content || "");
      }
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to load article.";
      tokenExpired(msg);
      toast.error(msg);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const objUrl = URL.createObjectURL(file);
    blobUrlRef.current = objUrl;
    setFeaturedImage(file);
    setPreviewImage(objUrl);
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

      await postAPI.update(postId, fd);
      toast.success("Post updated.");
      navigate("/dashboard/blog-manager");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to update post.";
      toast.error(msg);
      tokenExpired(msg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Loading />;

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Update Journal Post</h2>
            <p className="adm-subtitle">
              Edit headline, cover poster artwork, or article body copy.
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
              <label style={{ marginBottom: "6px" }}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ marginBottom: "6px" }}>Cover Poster</label>
              <label className="adm-dropzone">
                {previewImage ? (
                  <img
                    src={resolvePostImg(previewImage)}
                    alt="Poster preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_POSTER;
                    }}
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
                      Click to choose replacement poster
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
              {previewImage && (
                <div style={{ fontSize: "11.5px", color: "var(--crex-muted)", marginTop: "6px" }}>
                  Click the image area above to upload a replacement poster.
                </div>
              )}
            </div>

            <div>
              <label style={{ marginBottom: "6px" }}>Content</label>
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
                {loading ? "Updating…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

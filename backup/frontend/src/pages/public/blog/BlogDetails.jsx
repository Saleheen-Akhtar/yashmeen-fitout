import "../../../styles/blog.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock } from "react-icons/fi";
// TODO: adjust this path to where your API module lives
import { postAPI, itemPath } from "../../../services/api";

// Route: /blog/details/:blogId  (the param name must be blogId)
const BLOG_LIST_PATH = "/blogs";
const FALLBACK_HERO = "/static/hero-bg.jpg";

// Absolute / local static URLs are used as-is; stored paths are resolved via itemPath
const fileUrl = (path = "") =>
  /^(https?:|data:|blob:|\/static\/|\/images\/|\/uploads\/)/i.test(path)
    ? path
    : `${itemPath}/${String(path).replace(/^\/+/, "")}`;

const textOf = (html = "") =>
  new DOMParser()
    .parseFromString(String(html), "text/html")
    .body.textContent.replace(/\s+/g, " ")
    .trim();

// Drops the empty spacer paragraphs the editor leaves behind (<p>&nbsp;</p>)
const cleanContent = (html = "") =>
  String(html).replace(/<p>(\s|&nbsp;)*<\/p>/gi, "");

const formatDate = (d) => {
  const date = new Date(d);
  return isNaN(date)
    ? ""
    : date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
};

// Accepts `{ data: post }`, `{ data: { data: post } }` or an array
const toPost = (res) => {
  const body = res?.data;
  const post = body?.data ?? body;
  return Array.isArray(post) ? post[0] : post;
};

export default function BlogDetails() {
  const { blogId } = useParams();
  return <BlogDetailsInner key={blogId} blogId={blogId} />;
}

function BlogDetailsInner({ blogId }) {
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    window.scrollTo?.({ top: 0 });

    (async () => {
      try {
        const res = await postAPI.getBy(blogId);
        const data = toPost(res);
        if (cancelled) return;
        // unpublished or missing posts are treated as not found
        if (!data || !data._id || data.status !== true) {
          setError("This article could not be found.");
        } else {
          setPost(data);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? "This article could not be found."
              : err?.response?.data?.message || "Could not load this article.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blogId]);

  const meta = useMemo(() => {
    if (!post) return null;
    const words = textOf(post.content).split(" ").filter(Boolean).length;
    return {
      date: formatDate(post.createdAt),
      readTime: words ? `${Math.max(1, Math.round(words / 200))} min read` : "",
      hero: post.file ? fileUrl(post.file) : FALLBACK_HERO,
      html: cleanContent(post.content),
    };
  }, [post]);

  useEffect(() => {
    if (loading) return;
    if (error || !post) {
      window.dispatchEvent(
        new CustomEvent("seo-update", {
          detail: {
            pathname: location.pathname,
            title: "Article Not Found | Yashmeen Fit-Out Dubai",
            description:
              "The requested architectural article could not be found on Yashmeen Future Building.",
            robots: "noindex, follow",
          },
        }),
      );
      return;
    }

    const excerpt = textOf(post.content).slice(0, 160);
    window.dispatchEvent(
      new CustomEvent("seo-update", {
        detail: {
          pathname: location.pathname,
          title: `${post.title} | Yashmeen Fit-Out Dubai`,
          description:
            excerpt ||
            `${post.title} - Architectural insights and interior fit-out execution guidance from Yashmeen Future Building.`,
          image: meta?.hero || FALLBACK_HERO,
          robots: "index, follow",
        },
      }),
    );
  }, [loading, error, post, meta, location.pathname]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent("seo-update", { detail: null }));
    };
  }, []);

  return (
    <div className="bd-page">

      {loading ? (
        <div className="bd-state">Loading article…</div>
      ) : error ? (
        <div className="bd-state error">
          <h1 className="bd-title" style={{ color: "var(--ink)", marginBottom: "14px" }}>
            Article Not Found
          </h1>
          <p style={{ margin: 0 }}>{error}</p>
          <Link to={BLOG_LIST_PATH}>Back to all articles</Link>
        </div>
      ) : (
        post &&
        meta && (
          <>
            <header
              className="bd-hero"
              style={{ backgroundImage: `url(${meta.hero})` }}
            >
              <div className="bd-container">
                <Link to={BLOG_LIST_PATH} className="bd-back">
                  <FiArrowLeft size={15} /> All articles
                </Link>
                <h1 className="bd-title">{post.title}</h1>
                <div className="bd-meta">
                  {meta.date && (
                    <span>
                      <FiCalendar size={15} /> {meta.date}
                    </span>
                  )}
                  {meta.readTime && (
                    <span>
                      <FiClock size={15} /> {meta.readTime}
                    </span>
                  )}
                </div>
              </div>
            </header>

            <article className="bd-article">
              <div className="bd-container">
                {/* Content is HTML written in your admin editor */}
                <div
                  className="bd-content"
                  dangerouslySetInnerHTML={{ __html: meta.html }}
                />
                <div className="bd-foot">
                  <Link to={BLOG_LIST_PATH}>
                    <FiArrowLeft size={15} /> Back to all articles
                  </Link>
                </div>
              </div>
            </article>
          </>
        )
      )}
    </div>
  );
}
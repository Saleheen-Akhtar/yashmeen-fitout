import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock } from "react-icons/fi";
// TODO: adjust this path to where your API module lives
import { postAPI, itemPath } from "../../services/api";

// Route: /blob/details/:blogId  (the param name must be blogId)
const BLOG_LIST_PATH = "/blogs";
const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

// Absolute URLs are used as-is; stored paths are resolved via itemPath
const fileUrl = (path = "") =>
  /^https?:\/\//i.test(path)
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
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setPost(null);
    window.scrollTo({ top: 0 });

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

  // browser tab title
  useEffect(() => {
    if (!post?.title) return;
    const previous = document.title;
    document.title = post.title;
    return () => {
      document.title = previous;
    };
  }, [post]);

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

  return (
    <div className="bd-page">
      <style>{`

        .bd-page{
          --ink:#17140f; --ink-soft:#4f483c; --paper:#faf7f0; --line:#e4dfd2;
          --brass:#b9905a; --brass-deep:#8a6a28; --err:#b3261e;
          background:var(--paper); color:var(--ink); min-height:60vh;
          font-family:var(--font-sans);
        }
        .bd-page *{ box-sizing:border-box; }

        /* HERO */
        .bd-hero{
          position:relative; isolation:isolate; background:#0A0A0A center/cover no-repeat;
          padding:72px 0 84px; color:#fff;
        }
        .bd-hero::before{
          content:""; position:absolute; inset:0; z-index:-1;
          background:linear-gradient(180deg,rgba(10,10,10,.78),rgba(10,10,10,.68));
        }
        @media(min-width:768px){ .bd-hero{ padding:110px 0 120px; } }
        .bd-container{ max-width:820px; margin:0 auto; padding:0 24px; }
        .bd-back{
          display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:600;
          color:rgba(255,255,255,.8); text-decoration:none; margin-bottom:26px; transition:color .2s, gap .2s;
        }
        .bd-back:hover{ color:var(--brass); gap:11px; }
        .bd-title{
          margin:0; font-family:var(--font-serif); font-weight:800; line-height:1.18;
          letter-spacing:-.01em; font-size:30px;
        }
        @media(min-width:640px){ .bd-title{ font-size:40px; } }
        @media(min-width:1024px){ .bd-title{ font-size:46px; } }
        .bd-meta{ margin-top:22px; display:flex; flex-wrap:wrap; gap:18px; font-size:13.5px; color:rgba(255,255,255,.78); }
        .bd-meta span{ display:inline-flex; align-items:center; gap:7px; }

        /* ARTICLE */
        .bd-article{ padding:56px 0 96px; }
        .bd-content{ font-size:17px; line-height:1.85; color:var(--ink-soft); overflow-wrap:anywhere; }
        .bd-content > *:first-child{ margin-top:0; }
        .bd-content p{ margin:0 0 1.35em; }
        .bd-content strong{ color:var(--ink); font-weight:700; }
        .bd-content h1,.bd-content h2,.bd-content h3,.bd-content h4{
          font-family:var(--font-serif); color:var(--ink); line-height:1.3; margin:1.9em 0 .6em;
        }
        .bd-content h2{ font-size:26px; }
        .bd-content h3{ font-size:21px; }
        .bd-content h4{ font-size:18px; }
        .bd-content a{ color:var(--brass-deep); text-decoration:underline; text-underline-offset:3px; }
        .bd-content a:hover{ color:var(--brass); }
        .bd-content ul,.bd-content ol{ margin:0 0 1.35em; padding-left:1.4em; }
        .bd-content li{ margin-bottom:.5em; }
        .bd-content blockquote{
          margin:1.8em 0; padding:6px 0 6px 22px; border-left:3px solid var(--brass);
          font-size:19px; color:var(--ink); font-style:italic;
        }
        .bd-content figure{ margin:2em 0; }
        .bd-content figure.image,.bd-content figure{ width:100%; }
        .bd-content img{
          display:block; max-width:100%; height:auto !important; border-radius:3px;
        }
        .bd-content figcaption{ margin-top:10px; font-size:13px; color:#7a7263; text-align:center; }
        .bd-content table{ width:100%; border-collapse:collapse; margin:0 0 1.6em; font-size:15px; display:block; overflow-x:auto; }
        .bd-content th,.bd-content td{ border:1px solid var(--line); padding:10px 12px; text-align:left; }
        .bd-content th{ background:#f1ecdf; color:var(--ink); }

        .bd-foot{ margin-top:48px; padding-top:28px; border-top:1px solid var(--line); }
        .bd-foot a{
          display:inline-flex; align-items:center; gap:8px; font-size:13px; font-weight:700;
          letter-spacing:.05em; text-transform:uppercase; color:var(--ink); text-decoration:none; transition:color .2s, gap .2s;
        }
        .bd-foot a:hover{ color:var(--brass); gap:11px; }

        /* STATES */
        .bd-state{ padding:120px 24px; text-align:center; font-size:15px; color:var(--ink-soft); }
        .bd-state.error{ color:var(--err); }
        .bd-state a{ display:inline-block; margin-top:18px; color:var(--ink); font-weight:700; text-decoration:underline; }
      `}</style>

      {loading ? (
        <div className="bd-state">Loading article…</div>
      ) : error ? (
        <div className="bd-state error">
          {error}
          <br />
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

            <main className="bd-article">
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
            </main>
          </>
        )
      )}
    </div>
  );
}
import "../../../styles/blog.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
// TODO: adjust this path to where your hook lives
import useLatestPosts from "../../../lib/cacheLatestBlog";

// Details page route: /blob/details/:blogId (change here if the route is /blog/details)
const BLOG_DETAILS_PATH = "/blog/details";
const PAGE_SIZE = 9;
const HERO_BG = "/static/pages-bg.webp";

export default function BlogsPage() {
  // null = all active posts (status === true), newest first, cached until data changes
  const { posts, loading, error } = useLatestPosts(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const shown = posts.slice(0, visible);

  return (
    <div className="bp-page">

      <header className="bp-hero" style={{ backgroundImage: `url(${HERO_BG})` }}>
        <div className="bp-wrap">
          <h1>From the journal.</h1>
          <p>
            Ideas, guides and updates on fit-out, interior design and building
            well in the UAE.
          </p>
        </div>
      </header>

      <div className="bp-section">
        <div className="bp-wrap">
          {loading ? (
            <div className="bp-state">Loading articles…</div>
          ) : error ? (
            <div className="bp-state error">{error}</div>
          ) : posts.length === 0 ? (
            <div className="bp-state">No articles published yet.</div>
          ) : (
            <>
              <div className="bp-grid">
                {shown.map((post) => {
                  const href = `${BLOG_DETAILS_PATH}/${post.id}`;
                  const meta = [post.date, post.readTime]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <article className="bp-card" key={post.id}>
                      <Link to={href} className="bp-poster" aria-label={post.title}>
                        {post.image && (
                          <img src={post.image} alt={post.title} loading="lazy" />
                        )}
                      </Link>
                      {meta && <div className="bp-meta">{meta}</div>}
                      <h2>
                        <Link to={href}>{post.title}</Link>
                      </h2>
                      {post.excerpt && <p>{post.excerpt}</p>}
                      <Link to={href} className="bp-rm">
                        Read Article <FiArrowRight size={14} />
                      </Link>
                    </article>
                  );
                })}
              </div>

              {visible < posts.length && (
                <div className="bp-more">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Load more articles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
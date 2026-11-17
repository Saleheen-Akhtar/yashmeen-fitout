import useWebsiteContent from "../../../hooks/useWebsiteContent";
import "../../../styles/blog.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
// TODO: adjust this path to where your hook lives
import useLatestPosts from "../../../lib/cacheLatestBlog";

// Details page route: /blob/details/:blogId (change here if the route is /blog/details)
const BLOG_DETAILS_PATH = "/blog/details";
const PAGE_SIZE = 9;

export default function BlogsPage() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.BlogPage;

  // null = all active posts (status === true), newest first, cached until data changes
  const { posts, loading, error } = useLatestPosts(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const shown = posts.slice(0, visible);

  return (
    <div className="bp-page">


      <header className="bp-hero" style={{ backgroundImage: `url(${pageCopy.heroImage})` }}>
        <div className="bp-wrap">
          <h1>{pageCopy.from_the_journal}</h1>
          <p>{pageCopy.ideas_guides_and_updates_on}</p>
        </div>
      </header>

      <div className="bp-section">
        <div className="bp-wrap">
          {loading ? (
            <div className="bp-state">{pageCopy.loading_articles}</div>
          ) : error ? (
            <div className="bp-state error">{error}</div>
          ) : posts.length === 0 ? (
            <div className="bp-state">{pageCopy.no_articles_published_yet}</div>
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
                      <Link to={href} className={`bp-poster${post.image ? "" : " is-media-unavailable"}`} aria-label={post.title}>
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.hidden = true;
                              event.currentTarget.parentElement?.classList.add("is-media-unavailable");
                            }}
                          />
                        )}
                      </Link>
                      {meta && <div className="bp-meta">{meta}</div>}
                      <h2>
                        <Link to={href}>{post.title}</Link>
                      </h2>
                      {post.excerpt && <p>{post.excerpt}</p>}
                      <Link to={href} className="bp-rm">{pageCopy.read_article}<FiArrowRight size={14} />
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
                  >{pageCopy.load_more_articles}</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
// TODO: adjust this path to where your hook lives
import useLatestPosts from "../../hooks/cacheLatestBlog";

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
      <style>{`

        .bp-page{
          --ink:#17140f; --ink-soft:#6b6255; --paper:#faf7f0; --line:#e4dfd2;
          --brass:#a9832e; --brass-deep:#8a6a28; --err:#b3261e;
          background:var(--paper); color:var(--ink); min-height:60vh; font-family:var(--font-sans);
        }
        .bp-page *{ box-sizing:border-box; }
        .bp-wrap{ max-width:1180px; margin:0 auto; padding:0 24px; }
        @media(min-width:768px){ .bp-wrap{ padding:0 40px; } }

        /* HERO */
        .bp-hero{
          position:relative; isolation:isolate; text-align:center; color:#fff;
          padding:80px 0; background:#0A0A0A center/cover no-repeat;
        }
        .bp-hero::before{
          content:""; position:absolute; inset:0; z-index:-1;
          background:linear-gradient(180deg,rgba(10,10,10,.76),rgba(10,10,10,.64));
        }
        @media(min-width:768px){ .bp-hero{ padding:120px 0; } }
        .bp-hero h1{
          margin:0; font-family:var(--font-serif); font-weight:800; line-height:1.15;
          letter-spacing:-.01em; font-size:34px;
        }
        @media(min-width:640px){ .bp-hero h1{ font-size:46px; } }
        @media(min-width:1024px){ .bp-hero h1{ font-size:56px; } }
        .bp-hero p{
          margin:20px auto 0; max-width:620px; font-size:15.5px; line-height:1.7; color:rgba(255,255,255,.82);
        }

        /* LIST */
        .bp-section{ padding:72px 0 110px; }
        .bp-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:32px 28px; }
        @media(max-width:900px){ .bp-grid{ grid-template-columns:1fr 1fr; } }
        @media(max-width:600px){ .bp-grid{ grid-template-columns:1fr; } }

        .bp-card{ display:flex; flex-direction:column; min-width:0; }
        .bp-poster{
          display:block; width:100%; aspect-ratio:16/10; position:relative; overflow:hidden; flex:none;
          border-radius:2px; background:linear-gradient(135deg,#2a261f,#14120f);
        }
        .bp-poster img{
          position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center;
          display:block; transition:transform .5s ease;
        }
        .bp-poster:hover img{ transform:scale(1.05); }
        .bp-poster::after{
          content:""; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(180deg,rgba(23,20,15,0) 65%,rgba(23,20,15,.55) 100%);
        }
        .bp-meta{
          margin-top:18px; font-size:11.5px; letter-spacing:.08em; text-transform:uppercase;
          color:var(--brass-deep); font-weight:700;
        }
        .bp-card h2{
          margin:10px 0 0; font-family:var(--font-serif); font-size:19px; font-weight:700; line-height:1.35;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bp-card h2 a{ color:inherit; text-decoration:none; }
        .bp-card h2 a:hover{ color:var(--brass-deep); }
        .bp-card p{
          margin:10px 0 0; font-size:14px; line-height:1.65; color:var(--ink-soft);
          display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bp-rm{
          margin-top:auto; padding-top:16px; align-self:flex-start; display:inline-flex; align-items:center; gap:7px;
          font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em;
          color:var(--ink); text-decoration:none; transition:gap .25s, color .25s;
        }
        .bp-rm:hover{ gap:11px; color:var(--brass); }

        .bp-more{ margin-top:56px; text-align:center; }
        .bp-more button{
          font:inherit; font-size:13px; font-weight:700; letter-spacing:.05em; text-transform:uppercase;
          padding:15px 30px; background:transparent; color:var(--ink); border:1.5px solid var(--ink);
          border-radius:2px; cursor:pointer; transition:background .2s, color .2s;
        }
        .bp-more button:hover{ background:var(--ink); color:var(--paper); }

        .bp-state{ padding:80px 0; text-align:center; font-size:15px; color:var(--ink-soft); }
        .bp-state.error{ color:var(--err); }
      `}</style>

      <header className="bp-hero" style={{ backgroundImage: `url(${HERO_BG})` }}>
        <div className="bp-wrap">
          <h1>From the journal.</h1>
          <p>
            Ideas, guides and updates on fit-out, interior design and building
            well in the UAE.
          </p>
        </div>
      </header>

      <main className="bp-section">
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
      </main>
    </div>
  );
}
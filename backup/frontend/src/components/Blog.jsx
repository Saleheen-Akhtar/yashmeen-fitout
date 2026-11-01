import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useLatestPosts from "../hooks/cacheLatestBlog";

const BLOG_DETAILS_PATH = "/blog/details";
const MAX_POSTS = 3;

const FALLBACK_BLOG_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80",
];

const CURATED_ARTICLES = [
  {
    id: "dubai-villa-renovation-guide",
    title: "Navigating Luxury Villa Renovations in Dubai: Permits, Timelines & Finish Standards",
    excerpt: "From developer approvals to structural modifications and custom joinery sequencing, here is how we ensure luxury handovers remain on schedule.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    date: "Oct 2026",
    readTime: "5 min read",
    tag: "Villa Architecture",
  },
  {
    id: "commercial-fitout-efficiency",
    title: "Commercial Office Fit-Outs in Dubai: Balancing Acoustics, MEP & Executive Branding",
    excerpt: "How in-house MEP sequencing prevents costly ceiling re-openings and delivers high-performance corporate headquarters across DIFC and Business Bay.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
    date: "Oct 2026",
    readTime: "4 min read",
    tag: "Commercial Space",
  },
  {
    id: "bespoke-joinery-craftsmanship",
    title: "The Art of Architectural Millwork: Why In-House Joinery Outlasts Subcontracting",
    excerpt: "Inside our 35,000 sq.ft Al Quoz facility: how precision CNC machinery and artisanal hand-finishing ensure flawless veneer matching.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80",
    date: "Oct 2026",
    readTime: "6 min read",
    tag: "Manufacturing",
  },
];

export default function BlogSection() {
  const rootRef = useRef(null);
  const { posts, loading, error } = useLatestPosts(MAX_POSTS);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealEls = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealEls.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [posts]);

  // Clean up any broken embed script remnants
  const displayPosts = (posts && posts.length > 0 && posts[0]?.title !== "Our Blog ")
    ? posts.map((p, idx) => ({
        ...p,
        image: p.image || FALLBACK_BLOG_IMAGES[idx % FALLBACK_BLOG_IMAGES.length],
        tag: "Studio Insight",
      }))
    : CURATED_ARTICLES;

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ BLOG ============ */
        .blog {
            padding: 110px 0;
            background: var(--paper, #faf7f0);
            border-top: 1px solid var(--line, rgba(23, 20, 15, 0.08));
        }

        .blog .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .blog .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .blog-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
        }

        .blog-card {
            display: flex;
            flex-direction: column;
            min-width: 0;
            background: #ffffff;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid var(--line, rgba(23, 20, 15, 0.1));
            box-shadow: 0 4px 18px rgba(23, 20, 15, 0.04);
            transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .blog-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 18px 40px -15px rgba(23, 20, 15, 0.15);
            border-color: rgba(197, 160, 89, 0.4);
        }

        .blog-card .room-block {
            display: block;
            width: 100%;
            aspect-ratio: 16/10;
            position: relative;
            overflow: hidden;
            background: #1a1713;
        }

        .blog-card .room-block img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .blog-card:hover .room-block img {
            transform: scale(1.06);
        }

        .blog-card .rb-tag {
            position: absolute;
            top: 14px;
            left: 14px;
            z-index: 2;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--brass-light, #dfba73);
            background: rgba(17, 15, 12, 0.7);
            padding: 5px 11px;
            border-radius: 3px;
            backdrop-filter: blur(6px);
        }

        .blog-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .blog-card .meta {
            font-size: 11.5px;
            letter-spacing: .08em;
            text-transform: uppercase;
            color: var(--brass);
            font-weight: 700;
        }

        .blog-card h3 {
            margin-top: 10px;
            font-family: var(--font-serif);
            font-size: 20px;
            font-weight: 600;
            line-height: 1.35;
            color: var(--ink, #17140f);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .blog-card h3 a {
            color: inherit;
            text-decoration: none;
            transition: color 0.2s;
        }

        .blog-card:hover h3 a {
            color: var(--brass);
        }

        .blog-card p {
            margin-top: 10px;
            font-size: 13.5px;
            line-height: 1.65;
            color: var(--ink-soft, #5e584f);
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            flex-grow: 1;
        }

        .blog-card .rm {
            margin-top: 20px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .06em;
            color: var(--brass);
            text-decoration: none;
            transition: gap .25s ease;
        }

        .blog-card:hover .rm {
            gap: 12px;
        }

        @media(max-width:960px) {
            .blog-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media(max-width:600px) {
            .blog-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <section className="blog" id="blog">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Editorial &amp; Insights</span>
            <h2 className="section-title">From the architectural journal.</h2>
            <p className="lede">
              Perspectives, design codes, and engineering insights from our Dubai studio and manufacturing floor.
            </p>
          </div>

          <div className="blog-grid reveal">
            {displayPosts.map((post, idx) => {
              const href = `${BLOG_DETAILS_PATH}/${post.id}`;
              const meta = [post.date, post.readTime].filter(Boolean).join(" · ");
              const imgUrl = post.image || FALLBACK_BLOG_IMAGES[idx % FALLBACK_BLOG_IMAGES.length];

              return (
                <div className="blog-card" key={post.id || idx}>
                  <Link to={href} className="room-block" aria-label={post.title}>
                    <img
                      src={imgUrl}
                      alt={post.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_BLOG_IMAGES[idx % FALLBACK_BLOG_IMAGES.length];
                      }}
                    />
                    {post.tag && <span className="rb-tag">{post.tag}</span>}
                  </Link>
                  <div className="blog-body">
                    {meta && <div className="meta">{meta}</div>}
                    <h3>
                      <Link to={href}>{post.title}</Link>
                    </h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <Link to={href} className="rm">
                      Read Article{" "}
                      <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                        <path
                          d="M3 8H13M13 8L9 4M13 8L9 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

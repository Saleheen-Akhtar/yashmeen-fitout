import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger, useGSAP);
import { projectAPI, itemPath } from "../services/api";

const FALLBACK_PROJECTS = [
  {
    id: "p1",
    label: "Private Residence",
    location: "Emirates Hills, Dubai",
    scope: "Full Turnkey Villa Fit-Out",
    tag: "Residential",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    label: "Boutique Executive Suite",
    location: "DIFC Gate Precinct, Dubai",
    scope: "Grade-A Corporate HQ",
    tag: "Commercial",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    label: "Waterfront Villa Atelier",
    location: "Palm Jumeirah, Dubai",
    scope: "Joinery & Interior Architecture",
    tag: "Residential",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    label: "Haute Cuisine Dining Lounge",
    location: "Downtown Dubai",
    scope: "F&B Turnkey Contracting",
    tag: "Hospitality",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },
];

const toList = (res) => {
  if (Array.isArray(res)) return res;
  const body = res?.data ?? res;
  if (Array.isArray(body)) return body;
  const list = body?.data ?? body?.projects ?? body?.items ?? body?.results ?? body;
  if (Array.isArray(list)) return list;
  return [];
};

const fileUrl = (path = "") =>
  /^https?:\/\//i.test(path) ? path : `${itemPath}/${String(path).replace(/^\/+/, "")}`;

export default function ShowcaseSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const root = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await projectAPI.getAll();
        const list = toList(res)
          .slice(0, 6)
          .map((p, idx) => {
            const cat = p.categoryId ?? p.category;
            const catName =
              typeof cat === "object" ? cat?.categoryName ?? cat?.name ?? "" : cat ?? "";
            const imagePath =
              p.file ?? p.image ?? p.thumbnail ?? p.coverImage ?? p.images?.[0] ?? "";
            return {
              id: p._id,
              label: p.title ?? p.name ?? "Luxury Fit-Out",
              tag: catName || "Turnkey",
              location: p.location || "Dubai, UAE",
              img: imagePath
                ? fileUrl(imagePath)
                : FALLBACK_PROJECTS[idx % FALLBACK_PROJECTS.length].img,
            };
          });
        if (!cancelled && list.length > 0) setProjects(list);
        else if (!cancelled) setProjects(FALLBACK_PROJECTS);
      } catch {
        if (!cancelled) setProjects(FALLBACK_PROJECTS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = (projects.length ? projects : FALLBACK_PROJECTS).slice(0, 6);

  // Horizontal pinned gallery on large screens; native swipe row elsewhere
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const track = root.current.querySelector(".hs-track");
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + dist(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        // Each image drifts inside its frame while the row moves
        gsap.utils.toArray(".hs-card img").forEach((img) => {
          gsap.fromTo(img, { xPercent: -4 }, {
            xPercent: 4, ease: "none",
            scrollTrigger: { trigger: img.closest(".hs-card"), containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          });
        });
        // Progress line
        gsap.fromTo(".hs-progress-bar", { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [items.length, loading], revertOnUpdate: true }
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [items.length, loading]);

  return (
    <section className="hs" id="projects" ref={root} aria-busy={loading}>
      <div className="hs-inner">
        <div className="wrap hs-head">
          <div>
            <p className="eyebrow" data-reveal>Selected work</p>
            <h2 className="section-title" data-split>Recent projects across Dubai.</h2>
          </div>
          <Link to="/projects" className="link-arrow">
            All projects <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <ul className="hs-track">
          {items.map((p, i) => {
            const isFallback = String(p.id).startsWith("p") && !/^[0-9a-f]{24}$/.test(String(p.id));
            return (
              <li key={p.id} className="hs-card">
                <Link to={isFallback ? "/projects" : `/project/details/${p.id}`}>
                  <div className="hs-img">
                    <img
                      src={p.img}
                      alt={`${p.label}, ${p.location}`}
                      loading="lazy"
                      width="1200"
                      height="900"
                      onError={(e) => { e.currentTarget.src = FALLBACK_PROJECTS[i % FALLBACK_PROJECTS.length].img; }}
                    />
                  </div>
                  <div className="hs-meta">
                    <span className="hs-idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{p.label}</h3>
                    <p>{p.location}<span aria-hidden="true"> / </span>{p.tag}</p>
                  </div>
                </Link>
              </li>
            );
          })}
          <li className="hs-card hs-end">
            <Link to="/projects" className="hs-end-link" data-magnetic>
              <span>See every project</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </li>
        </ul>

        <div className="wrap hs-foot" aria-hidden="true">
          <div className="hs-progress"><span className="hs-progress-bar" /></div>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HERO_COMMISSIONS = [
  {
    id: 1,
    index: "(01/03)",
    title: "Emirates Hills Residence",
    location: "Emirates Hills, Dubai",
    scope: "Turnkey Architecture & Bespoke Joinery",
    year: "2026",
    facadeImg: "/static/pages-bg.webp",
    interiorImg: "/static/hero.jpg",
    detailsLink: "/project/details/2",
  },
  {
    id: 2,
    index: "(02/03)",
    title: "Palm Jumeirah Atelier",
    location: "Palm Jumeirah, Dubai",
    scope: "Waterfront Villa & Millwork Bench",
    year: "2026",
    facadeImg: "/static/work-myrtle.jpg",
    interiorImg: "/static/work-oh-office.jpg",
    detailsLink: "/project/details/1",
  },
  {
    id: 3,
    index: "(03/03)",
    title: "DIFC Corporate Headquarters",
    location: "Gate Precinct, DIFC, Dubai",
    scope: "Acoustic Engineering & Turnkey Fit-Out",
    year: "2025",
    facadeImg: "/static/work-runic.jpg",
    interiorImg: "/static/work-clifton.jpg",
    detailsLink: "/project/details/3",
  },
];

export default function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showInterior, setShowInterior] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);
  const facadeRef = useRef(null);
  const interiorRef = useRef(null);

  const activeCommission = HERO_COMMISSIONS[activeIdx];

  // Switch commission with cinematic scale and de-blur transition
  const switchCommission = (idx) => {
    if (idx === activeIdx || isTransitioning) return;
    setIsTransitioning(true);

    const activeImg = showInterior ? interiorRef.current : facadeRef.current;
    if (activeImg) {
      gsap.to(activeImg, {
        scale: 1.08,
        filter: "blur(6px)",
        duration: 0.35,
        ease: "power2.inOut",
        onComplete: () => {
          setActiveIdx(idx);
          gsap.fromTo(
            activeImg,
            { scale: 1.08, filter: "blur(6px)" },
            { scale: 1.0, filter: "blur(0px)", duration: 0.7, ease: "cubic-bezier(0.16, 1, 0.35, 1)" }
          );
          setIsTransitioning(false);
        },
      });
    } else {
      setActiveIdx(idx);
      setIsTransitioning(false);
    }
  };

  // Toggle between exterior facade and interior joinery
  const toggleViewLayer = (e) => {
    e.stopPropagation();
    setShowInterior((prev) => !prev);
  };

  const scrollToManifesto = () => {
    const el = document.getElementById("manifesto");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openEnquiry = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  // Pinned scroll-driven scrub unmasking
  useEffect(() => {
    const container = containerRef.current;
    const facade = facadeRef.current;
    if (!container || !facade) return;

    // As user scrolls through the hero, the facade smoothly slides up to reveal interior
    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top+=80px",
      end: "+=600px",
      scrub: 0.6,
      onUpdate: (self) => {
        if (!showInterior) {
          // Translate facade upwards on scroll to reveal interior beneath
          const progress = self.progress;
          gsap.set(facade, {
            clipPath: `polygon(0% 0%, 100% 0%, 100% ${Math.max(0, (1 - progress) * 100)}%, 0% ${Math.max(0, (1 - progress) * 100)}%)`,
          });
        }
      },
    });

    return () => st.kill();
  }, [showInterior, activeIdx]);

  return (
    <section className="hero-master-section" ref={containerRef} aria-label="Architectural Fit-Out Showcase">
      <div className="wrap">
        {/* Top Telemetry Header */}
        <div className="hero-top-meta-row">
          <div className="hero-meta-item">
            <span className="hero-meta-coord">[25.1872° N, 55.2638° E]</span>
            <span className="hero-meta-sep">/</span>
            <span>DUBAI, UAE</span>
          </div>

          <div className="hero-meta-center">
            <span>TURNKEY ARCHITECTURAL FIT-OUT &amp; BESPOKE JOINERY</span>
          </div>

          <div className="hero-meta-item hero-meta-right">
            <span>AL QUOZ 35,000 SQ.FT WORKSHOP BENCH</span>
          </div>
        </div>

        {/* Master Architectural Stage */}
        <div className="hero-stage-container">
          {/* Layer 2: Handcrafted Interior Fit-Out (Underneath) */}
          <div className="hero-layer-interior">
            <img
              ref={interiorRef}
              src={activeCommission.interiorImg}
              alt={`${activeCommission.title} bespoke interior joinery`}
              className="hero-stage-img"
              loading="eager"
            />
            <div className="hero-stage-badge">
              <span className="g-circle is-red" aria-hidden="true" />
              <span>INTERIOR FIT-OUT: AL QUOZ BESPOKE BENCH</span>
            </div>
          </div>

          {/* Layer 1: Exterior Architectural Facade (Slides Up on Scroll / Toggle) */}
          <div
            className={`hero-layer-facade ${showInterior ? "is-unmasked" : ""}`}
            style={{
              clipPath: showInterior
                ? "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"
                : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }}
          >
            <img
              ref={facadeRef}
              src={activeCommission.facadeImg}
              alt={`${activeCommission.title} architectural facade`}
              className="hero-stage-img"
              loading="eager"
            />
            <div className="hero-stage-badge">
              <span className="g-circle" aria-hidden="true" />
              <span>ARCHITECTURAL EXTERIOR: SIGNATURE COMMISSION</span>
            </div>
          </div>

          {/* Top-Right Commission Switcher Tabs */}
          <div className="hero-commission-tabs" aria-label="Commission Selector">
            {HERO_COMMISSIONS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={`hero-tab-btn ${idx === activeIdx ? "active" : ""}`}
                onClick={() => switchCommission(idx)}
                aria-label={`Select ${item.title}`}
              >
                <span className="hero-tab-num">{String(idx + 1).padStart(2, "0")}</span>
                <span className="hero-tab-title">{item.title}</span>
              </button>
            ))}
          </div>

          {/* Interactive Layer Toggle Button (Facade vs Interior) */}
          <button
            type="button"
            className="hero-layer-toggle-btn"
            onClick={toggleViewLayer}
            aria-label="Toggle between exterior facade and interior fit-out"
          >
            <span>{showInterior ? "SHOW EXTERIOR FACADE" : "REVEAL INTERIOR FIT-OUT"}</span>
            <span className="hero-toggle-arrow" aria-hidden="true">
              {showInterior ? "↑" : "↓"}
            </span>
          </button>

          {/* Floating Glass Telemetry Sub-Bar */}
          <div className="hero-master-telemetry-bar">
            <div className="hero-telemetry-left-group">
              <span className="hero-telemetry-pill-tag">{activeCommission.index}</span>
              <span className="hero-telemetry-title">{activeCommission.title}</span>
              <span className="hero-telemetry-sep">|</span>
              <span className="hero-telemetry-scope">{activeCommission.scope}</span>
              <span className="hero-telemetry-sep">|</span>
              <span className="hero-telemetry-year">{activeCommission.year}</span>
            </div>

            <div className="hero-telemetry-right-group">
              <Link to={activeCommission.detailsLink} className="hero-action-link">
                <span>VIEW CASE STUDY</span>
                <span className="g-circle" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={openEnquiry}
                className="btn-pill btn-pill-dark"
                style={{ height: 36, padding: "0 18px", fontSize: 12 }}
              >
                <span>COMMISSION ATELIER</span>
                <span className="g-circle is-red" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Lower Hero Manifesto & Scroll Cue */}
        <div className="hero-bottom-manifesto-row">
          <div className="hero-bottom-manifesto-text">
            <span className="eyebrow">(OUR PHILOSOPHY)</span>
            <h1 className="hero-manifesto-statement u-text-h2">
              The Yashmeen style is defined by strong, solid forms with subtle elegance,
              natural balance and enduring appeal.
            </h1>
          </div>

          <div className="hero-bottom-aside">
            <div className="hero-accreditation-tags">
              <span>DUBAI MUNICIPALITY LICENSED</span>
              <span>·</span>
              <span>DCD APPROVED</span>
              <span>·</span>
              <span>ISO 9001:2015</span>
            </div>

            <button
              type="button"
              onClick={scrollToManifesto}
              className="hero-scroll-down-cue"
              aria-label="Scroll down to studio manifesto"
            >
              <span>(SCROLL DOWN)</span>
              <span className="hero-scroll-down-arrow" aria-hidden="true">
                ↓
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

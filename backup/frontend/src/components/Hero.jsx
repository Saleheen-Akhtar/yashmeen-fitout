import { useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { FiArrowRight } from "react-icons/fi";
import "../styles/home.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HeroSection() {
  const root = useRef(null);

  useGSAP(
    () => {
      // Entrance choreography
      gsap.from(".hero2-meta > *", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.9, clearProps: "transform,opacity" });
      gsap.from(".hero2-cue", { opacity: 0, duration: 1, delay: 1.6, clearProps: "opacity" });

      // Media starts inset and opens to full bleed as you scroll
      gsap.fromTo(".hero2-media", { clipPath: "inset(0 9vw 0 9vw round 20px)" }, {
        clipPath: "inset(0 0vw 0 0vw round 0px)", ease: "none",
        scrollTrigger: { trigger: ".hero2-media", start: "top 92%", end: "top 8%", scrub: true },
      });
      gsap.fromTo(".hero2-media img", { scale: 1.25, yPercent: -6 }, {
        scale: 1, yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".hero2-media", start: "top bottom", end: "bottom top", scrub: true },
      });
      // Headline drifts up slightly faster than the page
      gsap.to(".hero2-title", {
        yPercent: -12, ease: "none",
        scrollTrigger: { trigger: ".hero2", start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section className="hero2" ref={root}>
      <div className="hero2-wrap">
        <p className="eyebrow hero2-eyebrow" data-reveal data-delay="0.2">Fit-out contractor / Dubai, UAE</p>
        <h1 className="hero2-title" data-split data-hero data-delay="0.25">
          Interiors, built <em>end to end.</em>
        </h1>
        <div className="hero2-meta">
          <p className="hero2-lede">
            Design, approvals, joinery and construction under one roof. One team, one contract, and a handover date we keep.
          </p>
          <div className="hero2-actions">
            <Link to="/quote" className="btn btn-primary" data-magnetic>
              Get a quote <FiArrowRight aria-hidden="true" />
            </Link>
            <Link to="/projects" className="btn btn-outline" data-magnetic>View projects</Link>
          </div>
          <a href="#services" className="hero2-cue" aria-label="Scroll to services">
            <span className="hero2-cue-line" aria-hidden="true" />
            Scroll
          </a>
        </div>
      </div>
      <figure className="hero2-media">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=80"
          alt="Finished waterfront villa interior with timber joinery"
          width="2200"
          height="1300"
          fetchPriority="high"
        />
        <figcaption>Waterfront villa, Palm Jumeirah</figcaption>
      </figure>
    </section>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { Building2, Sparkles, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import '../../styles/yashmeen-parallax.css';

interface YashmeenParallaxProps {
  title?: string;
  tagline?: string;
  eyebrow?: string;
  backgroundImage?: string;
  foregroundImage?: string;
}

export function YashmeenParallax({
  title = "YASHMEEN",
  tagline = "Dubai's fit-out partner for considered interiors",
  eyebrow = "Yashmeen Future Building & Fit-Out Contracting",
  backgroundImage = "/static/hero-cinematic.jpg",
  foregroundImage = "/static/yashmeen-layer-counter.png"
}: YashmeenParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = containerRef.current?.querySelector('[data-parallax-layers]');
    let tl: gsap.core.Timeline | null = null;

    if (triggerElement) {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 65 },
        { layer: "2", yPercent: 50 },
        { layer: "3", yPercent: 35 },
        { layer: "4", yPercent: 12 }
      ];

      layers.forEach((layerObj, idx) => {
        tl!.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    // Reuse existing Lenis if globally available from MotionProvider, otherwise create standalone instance
    let localLenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    if (typeof window !== 'undefined' && !(window as any).__lenis) {
      localLenis = new Lenis();
      localLenis.on('scroll', ScrollTrigger.update);
      tickerCallback = (time: number) => { localLenis?.raf(time * 1000); };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      if (tl) {
        tl.scrollTrigger?.kill();
        tl.kill();
      }
      if (triggerElement) {
        gsap.killTweensOf(triggerElement.querySelectorAll('[data-parallax-layer]'));
      }
      if (localLenis && tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        localLenis.destroy();
      }
    };
  }, []);

  return (
    <div className="yashmeen-parallax" ref={containerRef}>
      {/* 2.5D Parallax Hero Viewport */}
      <section className="yp__header">
        <div className="yp__visuals">
          <div className="yp__subpixel-fix"></div>
          <div data-parallax-layers className="yp__layers">
            {/* Plane 1: Deep Villa Interior & Dubai Skyline */}
            <div data-parallax-layer="1" style={{ position: 'absolute', inset: 0 }}>
              <img
                src={backgroundImage}
                loading="eager"
                width="1920"
                height="1080"
                alt="Double height luxury villa interior with Dubai skyline view"
                className="yp__layer-bg"
              />
            </div>

            {/* Plane 2: Ambient Vignette Scrim */}
            <div data-parallax-layer="2" className="yp__layer-scrim"></div>

            {/* Plane 3: Brand Display Typography */}
            <div data-parallax-layer="3" className="yp__layer-title">
              {eyebrow && <span className="yp__eyebrow">{eyebrow}</span>}
              <h1 className="yp__title">{title}</h1>
              {tagline && <p className="yp__tagline">{tagline}</p>}
            </div>

            {/* Plane 4: Foreground Fluted Walnut Joinery & Waterfall Travertine Counter */}
            <div data-parallax-layer="4" style={{ position: 'absolute', inset: 0 }}>
              <img
                src={foregroundImage}
                loading="eager"
                width="1920"
                height="1080"
                alt="Foreground bespoke joinery and curved travertine reception counter"
                className="yp__layer-fg"
              />
            </div>
          </div>

          <div className="yp__fade"></div>
        </div>
      </section>

      {/* Brand Narrative & Operational Pillars */}
      <section className="yp__content">
        <div className="yp__content-inner">
          <div className="yp__content-header">
            <span className="yp__lead-eyebrow">Single-Source Accountability • Dubai, UAE</span>
            <h2 className="yp__lead-h2">
              Six disciplines under one roof. Zero subcontractor blame-shifting.
            </h2>
            <p className="yp__lead-p">
              From concept visualization and authority approvals to bespoke joinery fabrication in Al Quoz 
              and precision on-site construction. We deliver turnkey interior spaces on schedule.
            </p>
          </div>

          {/* Operational Pillars Grid */}
          <div className="yp__pillars">
            <div className="yp__pillar-card">
              <div className="yp__pillar-icon-wrap">
                <Building2 size={24} strokeWidth={1.5} />
              </div>
              <span className="yp__pillar-num">PILLAR 01</span>
              <h3 className="yp__pillar-title">35,000 sq.ft Manufacturing</h3>
              <p className="yp__pillar-text">
                In-house joinery, upholstery, architectural metalwork, and glass solutions fabricated directly 
                at our Al Quoz Industrial Area 3 facility.
              </p>
            </div>

            <div className="yp__pillar-card">
              <div className="yp__pillar-icon-wrap">
                <Sparkles size={24} strokeWidth={1.5} />
              </div>
              <span className="yp__pillar-num">PILLAR 02</span>
              <h3 className="yp__pillar-title">Single Accountable Studio</h3>
              <p className="yp__pillar-text">
                Architecture, 3D visualization, MEP engineering, and Dubai authority approvals handled 
                by one dedicated in-house project director.
              </p>
            </div>

            <div className="yp__pillar-card">
              <div className="yp__pillar-icon-wrap">
                <Clock size={24} strokeWidth={1.5} />
              </div>
              <span className="yp__pillar-num">PILLAR 03</span>
              <h3 className="yp__pillar-title">Guaranteed Handover</h3>
              <p className="yp__pillar-text">
                Milestone-based scheduling and on-site superintendents deliver turnkey completion within 
                60 to 90 days with ISO-audited quality rigor.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="yp__cta-row">
            <Link to="/quote" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Request a Quote</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/projects" className="btn btn-outline">
              View Completed Projects
            </Link>
          </div>

          {/* Authority Accreditations Bar */}
          <div className="yp__accreditations">
            <div className="yp__acc-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#8a6a28" />
              <span>Dubai Municipality Approved</span>
            </div>
            <div className="yp__acc-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#8a6a28" />
              <span>Civil Defence (DCD) Certified</span>
            </div>
            <div className="yp__acc-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#8a6a28" />
              <span>Tecom & Concordia Certified</span>
            </div>
            <div className="yp__acc-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#8a6a28" />
              <span>ISO 9001 / 14001 / 45001</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default YashmeenParallax;

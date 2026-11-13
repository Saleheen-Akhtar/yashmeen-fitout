import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import useWebsiteContent from "../../hooks/useWebsiteContent";

export default function Hero() {
  const { content } = useWebsiteContent();
  const hero = content?.hero || {};
  const rawTitle = hero.title || "From brief\nto built.";
  const titleLines = String(rawTitle).split(/\r?\n/);
  const stageRef = useRef(null);

  const titleTokens = [];
  let globalWordIdx = 0;
  titleLines.forEach((line, lineIdx) => {
    const words = line.trim().split(/\s+/).filter(Boolean);
    words.forEach((word, wordIdx) => {
      titleTokens.push({ type: "word", word, key: `w-${globalWordIdx}-${word}` });
      globalWordIdx += 1;
      if (wordIdx < words.length - 1) {
        titleTokens.push({ type: "space", key: `s-${lineIdx}-${wordIdx}` });
      }
    });
    if (lineIdx < titleLines.length - 1) {
      titleTokens.push({ type: "br", key: `br-${lineIdx}` });
    }
  });

  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof window === "undefined") return undefined;

    let ctx = null;

    if (stage.getBoundingClientRect().bottom > 0) {
      ctx = gsap.context(() => {
        const words = stage.querySelectorAll(".aperture-word");
        const kicker = stage.querySelector(".aperture-kicker");
        const intro = stage.querySelector(".aperture-intro");
        const actions = stage.querySelector(".aperture-actions");
        const cornerMeta = stage.querySelectorAll(
          ".aperture-project-link, .aperture-proof"
        );
        const bgPhoto = stage.querySelector(".aperture-hero-photo img");

        const tl = gsap.timeline({
          defaults: { overwrite: "auto" },
        });

        if (bgPhoto) {
          tl.fromTo(
            bgPhoto,
            { scale: 1.06, opacity: 0.76 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.55,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
            0
          );
        }

        if (kicker) {
          tl.from(
            kicker,
            {
              y: 16,
              opacity: 0,
              duration: 0.75,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
            0.06
          );
        }

        if (words.length) {
          tl.from(
            words,
            {
              yPercent: 122,
              opacity: 0,
              duration: 1.05,
              stagger: 0.085,
              ease: "power4.out",
              clearProps: "transform,opacity",
            },
            0.14
          );
        }

        if (intro) {
          tl.from(
            intro,
            {
              y: 20,
              opacity: 0,
              duration: 0.9,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
            0.42
          );
        }

        if (actions) {
          tl.from(
            actions,
            {
              y: 18,
              opacity: 0,
              duration: 0.85,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
            0.54
          );
        }

        if (cornerMeta.length) {
          tl.from(
            cornerMeta,
            {
              y: 14,
              opacity: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
            0.62
          );
        }
      }, stageRef);
    }

    return () => {
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
    };
  }, []);

  return (
    <section className="aperture-hero" aria-labelledby="aperture-hero-title">
      <div className="aperture-hero-stage" data-parallax-layers ref={stageRef}>
        <div className="aperture-hero-photo" aria-hidden="true">
          <img
            src="/static/hero-aperture-v2.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = "1";
                e.currentTarget.src = "/static/hero-bg.jpg";
              }
            }}
          />
        </div>

        <div className="aperture-copy">
          <div className="aperture-copy-parallax" data-parallax-layer="4">
            <div className="aperture-copy-inner">
              <p className="aperture-kicker">{hero.kicker || "DUBAI · DESIGN / ENGINEERING / FIT-OUT"}</p>
              <h1 id="aperture-hero-title" className="no-split">
                {titleTokens.map((token) => {
                  if (token.type === "space") return <Fragment key={token.key}>{" "}</Fragment>;
                  if (token.type === "br") return <br key={token.key} />;
                  return (
                    <span key={token.key} className="aperture-word-mask">
                      <span className="aperture-word">{token.word}</span>
                    </span>
                  );
                })}
              </h1>
              <p className="aperture-intro">
                {hero.intro || "One team shapes the space, makes the details and delivers the finished interior."}
              </p>
              <div className="aperture-actions">
                <button type="button" className="aperture-cta" onClick={openEnquiry}>
                  {hero.ctaText || "START A PROJECT"} <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <p className="aperture-proof">
          <strong>{hero.proofMetric || "35,000 sq. ft."}</strong>
          <span>{hero.proofLabel || "Al Quoz atelier"}</span>
        </p>
        <a
          className="aperture-project-link"
          href="#manifesto"
          aria-label="Scroll to explore studio manifesto"
        >
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}

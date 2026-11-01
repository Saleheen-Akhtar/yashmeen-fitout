import { useEffect, useRef, useState } from "react";

const FAQS = [
  {
    q: "How much does a fit-out cost in Dubai?",
    a: "Office fit-out costs in Dubai typically range from AED 1,800 to AED 4,000 per square metre, driven mainly by design complexity and material quality. Minimalist setups sit toward the lower end; premium finishes can exceed it.",
  },
  {
    q: "Why work with a dedicated fit-out company?",
    a: "A dedicated studio coordinates design, MEP, joinery and construction as one schedule instead of several separate contracts — which usually means fewer delays and a single point of accountability.",
  },
  {
    q: "How long does a fit-out project take?",
    a: "Most projects are delivered within 60–90 days from design sign-off to handover, depending on size and complexity. We agree a fixed schedule before work begins and manage all trades in-house to hold it.",
  },
  {
    q: "Do you handle design as well as construction?",
    a: "Yes — interior design, 3D visualisation, fit-out construction, MEP works, joinery manufacturing and smart-home installation are all delivered in-house, so you work with one team from concept to completion.",
  },
  {
    q: "Which areas do you cover?",
    a: "We work across all major Dubai districts — Business Bay, DIFC, Dubai Marina, Palm Jumeirah, Emirates Hills and Downtown Dubai — plus projects in Abu Dhabi and Sharjah.",
  },
  {
    q: "Are you licensed to work in the UAE?",
    a: "Yes, Yashmeen Future Building is a fully licensed contracting company operating in the UAE, holding ISO 9001, ISO 14001 and ISO 45001 certifications.",
  },
];

export default function FaqSection() {
  const rootRef = useRef(null);
  const answerRefs = useRef([]);
  const [openIndex, setOpenIndex] = useState(0);

  // reveal-on-scroll — same fix as every other section
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
  }, []);

  // accordion open/close height sync — this whole mechanism was missing
  useEffect(() => {
    answerRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.maxHeight = i === openIndex ? el.scrollHeight + "px" : "0px";
    });
  }, [openIndex]);

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ FAQ ============ */
        .faq {
            padding: 110px 0;
            background: var(--stone, #f4f1ea);
        }

        /*
          Same fix as every other section: .reveal needs the .in-view
          class (added by the observer above) to fade in.
        */
        .faq .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .faq .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .faq-shell {
            max-width: 820px;
        }

        .faq-item {
            border-bottom: 1px solid var(--line-strong, #d8d2c4);
        }

        .faq-q {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            padding: 24px 4px;
            background: none;
            border: none;
            text-align: left;
            font-family: var(--serif, Georgia, serif);
            font-size: 17px;
            font-weight: 500;
            color: var(--ink, #17140f);
            cursor: pointer;
        }

        .faq-plus {
            position: relative;
            width: 18px;
            height: 18px;
            flex: none;
        }

        .faq-plus::before,
        .faq-plus::after {
            content: "";
            position: absolute;
            background: var(--brass-dim, #8a6a28);
            transition: transform .3s var(--ease, ease), opacity .3s var(--ease, ease);
        }

        .faq-plus::before {
            width: 100%;
            height: 1.5px;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
        }

        .faq-plus::after {
            height: 100%;
            width: 1.5px;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
        }

        .faq-item.open .faq-plus::after {
            transform: translateX(-50%) rotate(90deg);
            opacity: 0;
        }

        .faq-a {
            max-height: 0;
            overflow: hidden;
            transition: max-height .4s var(--ease, ease);
        }

        .faq-a p {
            padding: 0 4px 24px;
            font-size: 14.5px;
            line-height: 1.75;
            color: var(--ink-soft, #6b6255);
            max-width: 66ch;
        }
      `}</style>

      <section className="faq" id="faq">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">FAQs</span>
            <h2 className="section-title">Frequently asked questions.</h2>
          </div>
          <div className="faq-shell reveal">
            {FAQS.map((item, i) => (
              <div
                key={item.q}
                className={"faq-item" + (openIndex === i ? " open" : "")}
              >
                <button
                  className="faq-q"
                  onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  aria-expanded={openIndex === i}
                >
                  <span>{item.q}</span>
                  <span className="faq-plus"></span>
                </button>
                <div
                  className="faq-a"
                  ref={(el) => (answerRefs.current[i] = el)}
                >
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

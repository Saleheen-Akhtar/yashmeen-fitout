import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const FAQ_GROUPS = [
  {
    category: "General",
    items: [
      {
        q: "Which areas do you serve?",
        a: "We're based in Business Bay, Dubai, and deliver turnkey interior fit-out projects across Dubai, Abu Dhabi, and the surrounding UAE region - for residential, commercial, and hospitality spaces alike.",
      },
      {
        q: "Are you ISO certified?",
        a: "Yes. Every project we run follows ISO 9001:2015 (Quality Management), ISO 14001:2015 (Environmental Management), and ISO 45001:2015 (Health & Safety) - regardless of project size.",
      },
      {
        q: "What types of projects do you take on?",
        a: "Offices, retail stores, restaurants, hotels, and residences - from full turnkey fit-outs to smaller renovations like kitchen, bathroom, or living room refurbishments.",
      },
    ],
  },
  {
    category: "Our Process",
    items: [
      {
        q: "Do you offer a free initial consultation?",
        a: "Yes. We start with an on-site visit to understand your brief, scope the budget, and outline a realistic timeline before any commitment is made.",
      },
      {
        q: "How long does a typical fit-out take?",
        a: "It depends on scope - a single-room renovation can take a few weeks, while a full commercial turnkey fit-out typically runs 8-16 weeks. We'll give you a firm timeline once the scope is confirmed.",
      },
      {
        q: "Do you handle MEP works like electrical, AC, and plumbing?",
        a: "Yes, MEP services are included as part of our turnkey contracts. Our in-house team coordinates electrical, air conditioning, and plumbing work alongside partitions, ceilings, and finishes.",
      },
      {
        q: "Can you also customise furniture and joinery?",
        a: "Absolutely. We design and manufacture customised joinery and furniture in-house, so pieces are built to fit your exact space rather than adapted from stock.",
      },
    ],
  },
  {
    category: "Pricing & Payment",
    items: [
      {
        q: "Can you work within my budget?",
        a: "Yes. We handle projects of all sizes and specifications, and offer affordable costs with flexible payment plans to fit a range of budgets.",
      },
      {
        q: "How is pricing structured?",
        a: "You'll receive an itemised quote before work begins - no hidden variations. What you approve is what you're billed for, with payment released in stages tied to project milestones.",
      },
      {
        q: "Do you provide a written contract?",
        a: "Every project is backed by a signed contract outlining scope, timeline, payment schedule, and warranty terms, so expectations are clear on both sides from day one.",
      },
    ],
  },
  {
    category: "After Handover",
    items: [
      {
        q: "Is there a warranty after handover?",
        a: "Yes. All fit-out work is covered by a warranty period, and our team remains reachable for snagging and warranty callbacks after you've moved in.",
      },
      {
        q: "What if something needs fixing after we move in?",
        a: "Just reach out - snagging and minor post-handover fixes are part of our service, and we'll schedule a visit to resolve it promptly.",
      },
    ],
  },
];

function FaqPlusMinusIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <line
        x1="2.5"
        y1="9"
        x2="15.5"
        y2="9"
        stroke="var(--faq-brass)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="2.5"
        x2="9"
        y2="15.5"
        stroke="var(--faq-brass)"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{
          transformOrigin: "9px 9px",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease, opacity 0.25s ease",
          opacity: open ? 0 : 1,
        }}
      />
    </svg>
  );
}

function FaqAccordionItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="faq-page-item">
      <button type="button" className="faq-page-question" onClick={onToggle}>
        <span>{item.q}</span>
        <FaqPlusMinusIcon open={isOpen} />
      </button>
      <div
        className="faq-page-answer-wrap"
        style={{ maxHeight: height }}
        ref={contentRef}
      >
        <p className="faq-page-answer">{item.a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState("General-0");

  return (
    <div className="faq-page-root">
      <style>{`

        .faq-page-root{
          --faq-ink:#1b1a17;
          --faq-black:#fbfaf7;
          --faq-gray-50:#f4f1ea;
          --faq-gray-100:rgba(27,26,23,0.04);
          --faq-gray-200:#e6e1d6;
          --faq-gray-500:#6b665c;
          --faq-brass:#8a6a28;
          --faq-brass-deep:#6f541d;
          --faq-font-display:var(--font-sans);
          --faq-font-body:var(--font-sans);
          --faq-max-w:1180px;
          --faq-max-w-narrow:900px;

          box-sizing:border-box;
          min-height:100vh;
          width:100%;
          background:var(--faq-black);
          color:var(--faq-ink);
          font-family:var(--faq-font-body);
        }

        .faq-page-root *{ box-sizing:border-box; }
        .faq-page-root a{ text-decoration:none; color:inherit; }
        .faq-page-root button{ font-family:inherit; cursor:pointer; border:none; }

        .faq-page-wrap{
          max-width:var(--faq-max-w-narrow);
          margin:0 auto;
          padding:0 24px;
        }
        .faq-page-wrap-wide{
          max-width:var(--faq-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .faq-page-wrap, .faq-page-wrap-wide{ padding:0 40px; }
        }

        .faq-page-eyebrow{
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--faq-brass-deep);
        }
        .faq-page-eyebrow-center{ justify-content:center; }
        .faq-page-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--faq-brass);
          border-radius:1px;
        }

        /* PAGE INTRO (no hero band) */
        .faq-page-intro{
          padding:56px 0 8px;
          text-align:center;
        }
        @media (min-width:768px){ .faq-page-intro{ padding:80px 0 8px; } }
        .faq-page-intro-title{
          margin:16px 0 0;
          font-family:var(--faq-font-display);
          font-weight:800;
          color:var(--faq-ink);
          font-size:32px;
          line-height:1.2;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .faq-page-intro-title{ font-size:42px; } }
        .faq-page-intro-copy{
          margin:16px auto 0;
          max-width:560px;
          font-size:15px;
          line-height:1.75;
          color:var(--faq-gray-500);
        }
        @media (min-width:640px){ .faq-page-intro-copy{ font-size:16px; } }

        /* BODY */
        .faq-page-section{ padding:48px 0 88px; }
        @media (min-width:768px){ .faq-page-section{ padding:64px 0 112px; } }
        .faq-page-group{ margin-bottom:44px; }
        @media (min-width:768px){ .faq-page-group{ margin-bottom:52px; } }
        .faq-page-group-heading{
          margin:0;
          font-family:var(--faq-font-display);
          font-size:20px;
          font-weight:700;
          color:var(--faq-ink);
        }
        @media (min-width:640px){ .faq-page-group-heading{ font-size:23px; } }
        .faq-page-group-bar{
          width:36px;
          height:3px;
          background:var(--faq-brass);
          margin:10px 0 18px;
          border-radius:2px;
        }
        .faq-page-list{ border-top:1px solid var(--faq-gray-200); }

        .faq-page-item{ border-bottom:1px solid var(--faq-gray-200); }
        .faq-page-question{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          background:none;
          text-align:left;
          padding:18px 4px;
          font-family:var(--faq-font-body);
          font-size:15.5px;
          font-weight:700;
          color:var(--faq-ink);
        }
        @media (min-width:768px){
          .faq-page-question{ padding:22px 4px; font-size:16.5px; }
        }
        .faq-page-answer-wrap{
          overflow:hidden;
          transition:max-height 0.3s ease;
        }
        .faq-page-answer{
          margin:0;
          padding:0 4px 18px;
          font-size:14.5px;
          line-height:1.8;
          color:var(--faq-gray-500);
          max-width:760px;
        }
        @media (min-width:768px){
          .faq-page-answer{ padding:0 4px 22px; }
        }

        /* CTA */
        .faq-page-cta-section{
          background:var(--faq-gray-50);
          border-top:1px solid var(--faq-gray-200);
          padding:48px 0;
          text-align:center;
        }
        @media (min-width:768px){ .faq-page-cta-section{ padding:64px 0; } }
        .faq-page-cta-heading{
          margin:0;
          font-family:var(--faq-font-display);
          font-size:22px;
          font-weight:800;
          color:var(--faq-ink);
        }
        @media (min-width:640px){ .faq-page-cta-heading{ font-size:28px; } }
        .faq-page-cta-copy{
          margin:10px auto 0;
          max-width:460px;
          font-size:14.5px;
          line-height:1.7;
          color:var(--faq-gray-500);
        }
        .faq-page-cta-btn{
          margin-top:24px;
          display:inline-flex;
          align-items:center;
          background:linear-gradient(180deg, var(--faq-brass), var(--faq-brass-deep));
          color:#FFFFFF;
          padding:15px 30px;
          border-radius:6px;
          font-size:13px;
          font-weight:700;
          letter-spacing:0.08em;
          transition:opacity .15s ease;
        }
        .faq-page-cta-btn:hover{ opacity:0.9; }
      `}</style>

      {/* PAGE INTRO */}
      <section className="faq-page-intro">
        <div className="faq-page-wrap-wide">
          <h1 className="faq-page-intro-title">Frequently Asked Questions</h1>
          <p className="faq-page-intro-copy">
            Answers to what clients ask Yashmeen Future Building & Fit-Out
            Company most before starting a fit-out project. Can&rsquo;t find
            yours? Reach out and we&rsquo;ll help directly.
          </p>
        </div>
      </section>

      {/* BODY */}
      <section className="faq-page-section">
        <div className="faq-page-wrap">
          {FAQ_GROUPS.map((group) => (
            <div key={group.category} className="faq-page-group">
              <h2 className="faq-page-group-heading">{group.category}</h2>
              <div className="faq-page-group-bar" />

              <div className="faq-page-list">
                {group.items.map((item, i) => {
                  const key = `${group.category}-${i}`;
                  return (
                    <FaqAccordionItem
                      key={key}
                      item={item}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="faq-page-cta-section">
        <div className="faq-page-wrap-wide">
          <h2 className="faq-page-cta-heading">Still have questions?</h2>
          <p className="faq-page-cta-copy">
            Our team is happy to walk you through anything specific to your
            project - no obligation, just answers.
          </p>
          <Link to="/contact" className="faq-page-cta-btn">
            ENQUIRE NOW
          </Link>
        </div>
      </section>
    </div>
  );
}

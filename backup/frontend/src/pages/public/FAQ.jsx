import "../../styles/faq.css";
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

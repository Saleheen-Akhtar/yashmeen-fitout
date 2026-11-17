import useWebsiteContent from "../../hooks/useWebsiteContent";
import "../../styles/faq.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";



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
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.FAQ;


  const [openKey, setOpenKey] = useState("General-0");

  return (
    <div className="faq-page-root">


      {/* PAGE INTRO */}
      <section className="faq-page-intro">
        <div className="faq-page-wrap-wide">
          <h1 className="faq-page-intro-title">{pageCopy.frequently_asked_questions}</h1>
          <p className="faq-page-intro-copy">{pageCopy.answers_to_what_clients_ask}</p>
        </div>
      </section>

      {/* BODY */}
      <section className="faq-page-section">
        <div className="faq-page-wrap">
          {content.faqGroups.map((group) => (
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
          <h2 className="faq-page-cta-heading">{pageCopy.still_have_questions}</h2>
          <p className="faq-page-cta-copy">{pageCopy.our_team_is_happy_to}</p>
          <Link to="/contact" className="faq-page-cta-btn">{pageCopy.enquire_now}</Link>
        </div>
      </section>
    </div>
  );
}

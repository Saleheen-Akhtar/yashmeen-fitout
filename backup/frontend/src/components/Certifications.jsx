import { useEffect, useRef } from "react";

export default function CertificationsSection() {
  const rootRef = useRef(null);

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

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ CERTIFICATIONS ============ */
        .certs {
            padding: 80px 0;
            background: var(--stone, #f4f1ea);
        }

        /*
          Same fix as every other section: .reveal needs the .in-view
          class (added by the observer above) to fade in. Scoped locally
          so this section works standalone.
        */
        .certs .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .certs .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .certs-row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 1px;
            background: var(--line-strong, #d8d2c4);
            border: 1px solid var(--line-strong, #d8d2c4);
        }

        .cert-card {
            background: var(--paper, #ffffff);
            padding: 30px 18px;
            text-align: center;
        }

        .cert-card .ring {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 1.5px solid var(--brass, #a9832e);
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cert-card .ring svg {
            width: 24px;
            height: 24px;
            color: var(--brass-dim, #8a6a28);
        }

        .cert-card p {
            font-size: 12.5px;
            font-weight: 700;
            letter-spacing: .02em;
            line-height: 1.4;
            color: var(--ink, #17140f);
        }

        @media(max-width:860px) {
            .certs-row {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media(max-width:560px) {
            .certs-row {
                grid-template-columns: repeat(2, 1fr);
            }
        }
      `}</style>

      <section className="certs" id="certifications">
        <div className="wrap">
          <div
            className="section-head reveal"
            style={{ textAlign: "center", margin: "0 auto 40px" }}
          >
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              Certifications &amp; Awards
            </span>
            <h2
              className="section-title"
              style={{
                maxWidth: "none",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Independently audited, consistently recognised.
            </h2>
          </div>
          <div className="certs-row reveal">
            <div className="cert-card">
              <div className="ring">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>
                ISO 9001
                <br />
                Quality Management
              </p>
            </div>
            <div className="cert-card">
              <div className="ring">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <p>
                ISO 14001
                <br />
                Environmental Mgmt
              </p>
            </div>
            <div className="cert-card">
              <div className="ring">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l2.4 6.6L21 9l-5 4.6L17.4 21 12 17.3 6.6 21 8 13.6 3 9l6.6-.4L12 2z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p>
                ISO 45001
                <br />
                Health &amp; Safety
              </p>
            </div>
            <div className="cert-card">
              <div className="ring">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <p>
                Best Office Fit-Out
                <br />
                Regional Awards 2022
              </p>
            </div>
            <div className="cert-card">
              <div className="ring">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>
              <p>
                Top 5 Design
                <br />
                Inspiration 2021
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

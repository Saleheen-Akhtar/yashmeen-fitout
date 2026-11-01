import { useEffect, useMemo, useRef, useState } from "react";
// TODO: adjust these paths to match your project
import useWebDetails from "../hooks/cacheStore";
import { enquiryAPI } from "../services/api";

// Shown until the API data arrives (and if the API has no value for a field)
const FALLBACK = {
  mobile: "+971 54 386 2870",
  email: "info@yfbfitoutcontracting.com",
  addressText:
    "Bay Square, Building 12 - Office G01, Marasi Dr - Business Bay, Bay Square - Dubai - UAE",
};

const SERVICES = [
  "Interior Fit-Out",
  "Interior Design",
  "Villa Renovation",
  "Office Fit-Out",
  "Joinery Works",
  "MEP",
];

const INITIAL = {
  name: "",
  mobile: "",
  email: "",
  service: SERVICES[0],
  message: "",
};

export default function ContactSection() {
  const rootRef = useRef(null);
  const details = useWebDetails();

  const [form, setForm] = useState(INITIAL);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const { mobile, email, addressText, mapQuery } = useMemo(() => {
    const a = details?.address;
    const apiAddress = a
      ? [a.street, a.city, a.state, a.zipCode, a.country]
          .filter(Boolean)
          .join(", ")
      : "";
    let text = apiAddress || FALLBACK.addressText;
    if (text.includes("Dubai , Dubai") || text.includes("Office0q")) {
      text = FALLBACK.addressText;
    }
    return {
      mobile: details?.mobile || FALLBACK.mobile,
      email: details?.email || FALLBACK.email,
      addressText: text,
      mapQuery: encodeURIComponent(text),
    };
  }, [details]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;

    const data = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      services: form.service, // schema: services is a String
      message: form.message.trim(),
    };

    setStatus("sending");
    setErrorMsg("");
    try {
      await enquiryAPI.create(data);
      setStatus("sent");
      setForm(INITIAL);
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      const res = err?.response?.data;
      const firstFieldError =
        res?.errors && Object.values(res.errors).find(Boolean);
      setErrorMsg(
        firstFieldError ||
          res?.message ||
          "We couldn't send your enquiry. Please try again or call us.",
      );
      setStatus("error");
    }
  };

  // reveal-on-scroll
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealEls = root.querySelectorAll(".reveal");
    let io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
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
    } else {
      revealEls.forEach((el) => el.classList.add("in-view"));
    }

    return () => {
      if (io) io.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <style>{`
        /* ============ CONTACT ============ */
        .contact {
            padding: 110px 0;
            background: var(--ink, #17140f);
            color: var(--paper, #faf7f0);
        }

        .contact .reveal {
            opacity: 0;
            transform: translateY(18px);
            transition: opacity .7s ease, transform .7s ease;
        }

        .contact .reveal.in-view {
            opacity: 1;
            transform: none;
        }

        .contact .eyebrow {
            color: var(--brass-light, #d8b568);
        }

        .contact .eyebrow::before {
            background: var(--brass-light, #d8b568);
        }

        .contact-grid {
            display: grid;
            grid-template-columns: .9fr 1.1fr;
            gap: 60px;
            margin-top: 44px;
        }

        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 26px;
        }

        .cinfo-item {
            display: flex;
            gap: 16px;
            padding-bottom: 24px;
            border-bottom: 1px solid rgba(250, 247, 240, .14);
        }

        .cinfo-item svg {
            width: 20px;
            height: 20px;
            color: var(--brass-light, #d8b568);
            flex: none;
            margin-top: 22px;
        }

        .cinfo-item h5 {
            font-size: 13px;
            letter-spacing: .06em;
            text-transform: uppercase;
            color: rgba(250, 247, 240, .55);
            font-weight: 700;
        }

        .cinfo-item p {
            margin-top: 6px;
            font-size: 15.5px;
            font-family: var(--serif, Georgia, serif);
            overflow-wrap: anywhere;
        }

        .map-block {
            margin-top: 6px;
            height: 170px;
            position: relative;
            border: 1px solid rgba(250, 247, 240, .16);
            overflow: hidden;
        }

        .map-block iframe {
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
            filter: grayscale(.15) contrast(1.05);
        }

        form.contact-form {
            background: #ffffff;
            color: var(--ink, #17140f);
            padding: 44px;
            border-radius: 8px;
            box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.45);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
        }

        .field {
            margin-bottom: 18px;
        }

        .field label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: .05em;
            text-transform: uppercase;
            margin-bottom: 8px;
            color: var(--ink-soft, #6b6255);
        }

        .field input,
        .field select,
        .field textarea {
            width: 100%;
            padding: 14px 16px;
            border: 1px solid var(--line-strong, rgba(23, 20, 15, 0.18));
            background: #ffffff;
            font-family: var(--font-sans);
            font-size: 14.5px;
            color: var(--ink, #17140f);
            border-radius: 6px;
            transition: all .25s ease;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
            border-color: var(--brass);
            outline: none;
            box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.2);
        }

        .field textarea {
            resize: vertical;
            min-height: 110px;
        }

        .form-msg {
            margin-top: 14px;
            font-size: 13.5px;
            color: var(--brass-dim, #8a6a28);
            font-weight: 600;
        }

        .form-msg.error {
            color: #b3261e;
        }

        .contact .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 15px 26px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: .04em;
            text-transform: uppercase;
            border: none;
            border-radius: 1px;
            cursor: pointer;
            transition: background .25s, transform .2s;
        }

        .contact .btn:disabled {
            opacity: .65;
            cursor: not-allowed;
        }

        .contact .btn-brass {
            background: linear-gradient(135deg, var(--brass-light), var(--brass));
            color: #ffffff;
            border-radius: 6px;
            font-weight: 700;
            box-shadow: 0 6px 18px rgba(197, 160, 89, 0.35);
        }

        .contact .btn-brass:hover:not(:disabled) {
            background: var(--brass-light, #d8b568);
        }

        @media(max-width:900px) {
            .contact-grid {
                grid-template-columns: 1fr;
            }
        }

        @media(max-width:560px) {
            .form-row {
                grid-template-columns: 1fr;
            }

            form.contact-form {
                padding: 26px;
            }
        }
      `}</style>

      <section className="contact" id="contact">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Get In Touch</span>
            <h2 className="section-title" style={{ color: "#faf7f0" }}>
              Start your project.
            </h2>
          </div>
          <div className="contact-grid">
            <div className="contact-info reveal">
              <div className="cinfo-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.2 2h3a2 2 0 012 1.7c.1 1 .3 2 .7 3a2 2 0 01-.5 2.1L8 10.3a16 16 0 006 6l1.5-1.5a2 2 0 012.1-.4c1 .3 2 .5 3 .6a2 2 0 011.7 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <h5>Call the Studio</h5>
                  <p>
                    <a href={`tel:${mobile}`} style={{ color: "inherit" }}>
                      {mobile}
                    </a>
                  </p>
                </div>
              </div>
              <div className="cinfo-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4h16v16H4V4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4 6l8 7 8-7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <h5>Email</h5>
                  <p>
                    <a href={`mailto:${email}`} style={{ color: "inherit" }}>
                      {email}
                    </a>
                  </p>
                </div>
              </div>
              <div className="cinfo-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2a7 7 0 017 7.5C19 14.8 12 21 12 21z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="9.5"
                    r="2.3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <div>
                  <h5>Studio &amp; Factory</h5>
                  <p>{addressText}</p>
                </div>
              </div>
              <div className="map-block">
                <iframe
                  title="YFB Fitout Contracting location"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <form
              className="contact-form reveal"
              id="contactForm"
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="field">
                  <label htmlFor="fname">Full Name</label>
                  <input
                    id="fname"
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={set("name")}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fphone">Phone</label>
                  <input
                    id="fphone"
                    type="tel"
                    required
                    placeholder="+971"
                    value={form.mobile}
                    onChange={set("mobile")}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="femail">Email</label>
                  <input
                    id="femail"
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={set("email")}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fservice">Service</label>
                  <select
                    id="fservice"
                    value={form.service}
                    onChange={set("service")}
                  >
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="fmsg">Tell us about your project</label>
                <textarea
                  id="fmsg"
                  placeholder="Space type, size, timeline..."
                  value={form.message}
                  onChange={set("message")}
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-brass"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send Enquiry"}
              </button>
              {status === "sent" && (
                <p className="form-msg" role="status">
                  Thank you — your enquiry has been received. Our team will be
                  in touch shortly.
                </p>
              )}
              {status === "error" && (
                <p className="form-msg error" role="alert">
                  {errorMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
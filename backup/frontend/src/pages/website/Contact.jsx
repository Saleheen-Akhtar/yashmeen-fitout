import { useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiArrowRight } from "react-icons/fi";
import { enquiryAPI } from "../../services/api";
import { SERVICES } from "../../libs/static";
import useWebsiteContent from "../../hooks/useWebsiteContent";

const INFO_BLOCKS = [
  {
    icon: FiPhone,
    label: "Call Us",
    lines: ["+971 54 386 2870"],
  },
  {
    icon: FiMail,
    label: "Email Us",
    lines: ["info@yfbfitoutcontracting.com"],
  },
  {
    icon: FiMapPin,
    label: "Address",
    lines: [
      "Bay Square, Building 12 - Office G01, Marasi Dr - Business Bay, Bay Square - Dubai - UAE",
    ],
  },
];

const MAP_EMBED_SRC =
  "https://maps.google.com/maps?q=Bay%20Square%2C%20Building%2012%20-%20Office%20G01%2C%20Marasi%20Dr%20-%20Business%20Bay%2C%20Bay%20Square%20-%20Dubai%20-%20UAE&t=&z=16&ie=UTF8&iwloc=&output=embed";

// Replace with your own fit-out / interior image (best: a local asset)
// e.g. import heroBg from "../../assets/contact-hero.jpg";
const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  services: "",
  message: "",
};

export default function ContactPage() {
  const { content } = useWebsiteContent();
  const addr = content?.address || {};
  const liveAddress = [addr.street, addr.city, addr.country].filter(Boolean).join(", ") || "Bay Square, Building 12 - Office G01, Marasi Dr - Business Bay, Bay Square - Dubai - UAE";
  const liveBlocks = [
    { icon: FiPhone, label: "Call Us", lines: [content?.mobile || "+971 54 386 2870"] },
    { icon: FiMail, label: "Email Us", lines: [content?.email || "info@yfbfitoutcontracting.com"] },
    { icon: FiMapPin, label: "Address", lines: [liveAddress] },
  ];
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      services: formData.services,
      message: formData.message.trim(),
    };

    const digits = payload.mobile.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      const { data: res } = await enquiryAPI.create(payload);
      setSuccessMsg(res?.message || "");
      setSubmitted(true);
      setFormData(INITIAL_FORM);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contactpg-page">
      <style>{`

        .contactpg-page{
          --contactpg-ink:#1b1a17;
          --contactpg-black:#fbfaf7;
          --contactpg-gray-50:#f4f1ea;
          --contactpg-gray-100:rgba(27,26,23,0.04);
          --contactpg-gray-200:#e6e1d6;
          --contactpg-gray-500:#6b665c;
          --contactpg-brass:#8a6a28;
          --contactpg-brass-deep:#6f541d;
          --contactpg-font-display:var(--font-sans);
          --contactpg-font-serif:var(--font-sans);
          --contactpg-font-body:var(--font-sans);
          --contactpg-max-w:1180px;

          min-height:100vh;
          width:100%;
          background:var(--contactpg-black);
          color:var(--contactpg-ink);
          font-family:var(--contactpg-font-body);
        }

        .contactpg-page *{ box-sizing:border-box; }
        .contactpg-page a{ text-decoration:none; color:inherit; }
        .contactpg-page button{ font-family:inherit; cursor:pointer; border:none; }
        .contactpg-page input,
        .contactpg-page textarea,
        .contactpg-page select{ font-family:inherit; color:inherit; }

        .contactpg-wrap{
          max-width:var(--contactpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .contactpg-wrap{ padding:0 40px; }
        }

        /* HERO */
        .contactpg-hero-section{
          position:relative;
          isolation:isolate;
          padding:80px 0;
          background-color:var(--contactpg-black);
          background-size:cover;
          background-position:center;
          background-repeat:no-repeat;
        }
        @media (min-width:768px){
          .contactpg-hero-section{ padding:120px 0; }
        }

        .contactpg-hero-dark-overlay{
          position:absolute;
          inset:0;
          z-index:0;
          background:linear-gradient(
            to bottom,
            rgba(10,10,10,0.72),
            rgba(10,10,10,0.60)
          );
        }

        .contactpg-hero-inner-container{
          position:relative;
          z-index:1;
          max-width:var(--contactpg-max-w);
          margin:0 auto;
          padding:0 24px;
        }
        @media (min-width:768px){
          .contactpg-hero-inner-container{ padding:0 40px; }
        }

        .contactpg-hero-heading{
          margin:0;
          text-align:center;
          font-family:var(--contactpg-font-display);
          font-weight:800;
          color:#FFFFFF;
          font-size:34px;
          line-height:1.15;
          letter-spacing:-0.01em;
        }
        @media (min-width:640px){ .contactpg-hero-heading{ font-size:46px; } }
        @media (min-width:1024px){ .contactpg-hero-heading{ font-size:56px; } }

        /* INFO CARDS */
        .contactpg-info-section{ padding:48px 0 0; }
        .contactpg-info-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:20px;
        }
        @media (min-width:768px){
          .contactpg-info-grid{ grid-template-columns:repeat(3,1fr); }
        }
        .contactpg-info-card{
          display:flex;
          align-items:flex-start;
          gap:18px;
          background:#ffffff;
          border:1px solid var(--contactpg-gray-200);
          backdrop-filter:blur(16px);
          border-radius:6px;
          padding:28px 24px;
        }
        .contactpg-info-icon-circle{
          flex-shrink:0;
          width:52px;
          height:52px;
          border-radius:50%;
          background:rgba(197,160,89,0.12);
          display:flex;
          align-items:center;
          justify-content:center;
          color:var(--contactpg-brass-deep);
        }
        .contactpg-info-label{
          margin:0;
          font-family:var(--contactpg-font-body);
          font-weight:700;
          font-size:17px;
          color:var(--contactpg-ink);
        }
        .contactpg-info-lines{
          margin-top:6px;
          font-size:14.5px;
          line-height:1.6;
          color:var(--contactpg-gray-500);
        }
        .contactpg-info-lines p{ margin:0; }

        /* MAP */
        .contactpg-map-section{ padding:32px 0 0; }
        .contactpg-map-frame{
          width:100%;
          height:340px;
          border:1px solid var(--contactpg-gray-200);
          overflow:hidden;
        }
        @media (min-width:768px){
          .contactpg-map-frame{ height:400px; }
        }
        .contactpg-map-frame iframe{
          width:100%;
          height:100%;
          border:0;
          display:block;
        }

        /* MESSAGE SECTION */
        .contactpg-message-section{ padding:64px 0 88px; }
        .contactpg-message-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:40px;
          align-items:start;
        }
        @media (min-width:960px){
          .contactpg-message-grid{
            grid-template-columns:0.85fr 1.15fr;
            gap:56px;
            align-items:center;
          }
        }

        .contactpg-eyebrow{
          display:flex;
          align-items:center;
          gap:8px;
          font-family:var(--contactpg-font-body);
          font-size:13px;
          font-weight:600;
          text-transform:uppercase;
          letter-spacing:0.14em;
          color:var(--contactpg-brass-deep);
        }
        .contactpg-eyebrow-bar{
          width:4px;
          height:16px;
          background:var(--contactpg-brass);
          border-radius:1px;
        }
        .contactpg-message-heading{
          margin:18px 0 0;
          font-family:var(--contactpg-font-serif);
          font-weight:500;
          font-size:32px;
          line-height:1.3;
          color:var(--contactpg-ink);
        }
        @media (min-width:640px){ .contactpg-message-heading{ font-size:38px; } }

        .contactpg-form-card{
          background:var(--contactpg-gray-50);
          border-radius:10px;
          padding:32px;
        }
        @media (min-width:640px){ .contactpg-form-card{ padding:40px; } }

        .contactpg-form-card-title{
          margin:0 0 24px;
          font-family:var(--contactpg-font-display);
          font-weight:700;
          font-size:22px;
          color:var(--contactpg-ink);
        }

        .contactpg-form{ display:flex; flex-direction:column; gap:16px; }
        .contactpg-form-row{
          display:grid;
          grid-template-columns:1fr;
          gap:16px;
        }
        @media (min-width:560px){
          .contactpg-form-row{ grid-template-columns:1fr 1fr; }
        }

        .contactpg-field-input{
          width:100%;
          background:var(--contactpg-black);
          color:var(--contactpg-ink);
          border:1px solid var(--contactpg-gray-200);
          border-radius:6px;
          padding:14px 16px;
          font-size:14.5px;
          transition:border-color .15s ease, box-shadow .15s ease;
        }
        .contactpg-field-input::placeholder{ color:#9A9892; }
        .contactpg-field-input:focus{
          outline:none;
          border-color:var(--contactpg-brass);
          box-shadow:0 0 0 3px rgba(169,121,63,0.12);
        }
        .contactpg-field-input:disabled{
          opacity:0.6;
          cursor:not-allowed;
        }
        textarea.contactpg-field-input{
          resize:vertical;
          min-height:120px;
        }

        .contactpg-submit-row{
          display:flex;
          align-items:stretch;
          margin-top:8px;
          width:fit-content;
        }
        .contactpg-submit-btn{
          display:flex;
          align-items:center;
          background:var(--contactpg-black);
          color:var(--contactpg-ink);
          padding:15px 26px;
          font-size:14.5px;
          font-weight:700;
          border-radius:6px 0 0 6px;
          transition:background-color .15s ease;
        }
        .contactpg-submit-btn:hover{ background:#000000; }
        .contactpg-submit-btn:disabled{
          opacity:0.65;
          cursor:not-allowed;
        }
        .contactpg-submit-icon{
          display:flex;
          align-items:center;
          justify-content:center;
          width:52px;
          background:var(--contactpg-brass);
          color:#FFFFFF;
          border-radius:0 6px 6px 0;
          transition:background-color .15s ease;
        }
        .contactpg-submit-row:hover .contactpg-submit-icon{
          background:var(--contactpg-brass-deep);
        }

        .contactpg-success-box{
          border:1px solid rgba(169,121,63,0.35);
          background:rgba(169,121,63,0.08);
          padding:22px;
          border-radius:6px;
        }
        .contactpg-success-title{
          margin:0;
          font-family:var(--contactpg-font-display);
          font-weight:700;
          font-size:17px;
        }
        .contactpg-success-copy{
          margin:8px 0 0;
          font-size:14px;
          color:var(--contactpg-gray-500);
        }

        .contactpg-error-box{
          border:1px solid rgba(200,60,50,0.35);
          background:rgba(200,60,50,0.08);
          padding:14px 16px;
          border-radius:6px;
          font-size:13.5px;
          color:#B23A2E;
        }
      `}</style>

      {/* HERO BAND */}
      <section
        className="contactpg-hero-section"
        style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
      >
        <div className="contactpg-hero-dark-overlay" />
        <div className="contactpg-hero-inner-container">
          <h1 className="contactpg-hero-heading">
            Contact Us - Yashmeen Future Building & Fit-Out Company
          </h1>
        </div>
      </section>

      {/* INFO CARDS */}
      <section className="contactpg-info-section">
        <div className="contactpg-wrap">
          <div className="contactpg-info-grid">
            {liveBlocks.map(({ icon: Icon, label, lines }) => (
              <div key={label} className="contactpg-info-card">
                <div className="contactpg-info-icon-circle">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="contactpg-info-label">{label}</p>
                  <div className="contactpg-info-lines">
                    {lines.map((l) => (
                      <p key={l}>{l}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="contactpg-map-section">
        <div className="contactpg-wrap">
          <div className="contactpg-map-frame">
            <iframe
              title="Studio location map"
              src={MAP_EMBED_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* HAPPY TO ANSWER / SEND A MESSAGE */}
      <section className="contactpg-message-section">
        <div className="contactpg-wrap">
          <div className="contactpg-message-grid">
            <div>
              <div className="contactpg-eyebrow">
                <span className="contactpg-eyebrow-bar" />
                Contact Us
              </div>
              <h2 className="contactpg-message-heading">
                Happy to answer all your questions.
              </h2>
            </div>

            <div className="contactpg-form-card">
              <h3 className="contactpg-form-card-title">Send a Message</h3>

              {submitted ? (
                <div className="contactpg-success-box">
                  <p className="contactpg-success-title">Message received.</p>
                  <p className="contactpg-success-copy">
                    {successMsg ||
                      "Thank you - a member of the studio will be in touch within one working day."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    style={{
                      marginTop: 14,
                      background: "transparent",
                      color: "var(--contactpg-brass-deep)",
                      fontWeight: 700,
                      fontSize: 14,
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contactpg-form">
                  {error && <div className="contactpg-error-box">{error}</div>}

                  <div className="contactpg-form-row">
                    <input
                      required
                      type="text"
                      name="name"
                      placeholder="Your Name *"
                      className="contactpg-field-input"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="Your Email *"
                      className="contactpg-field-input"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="contactpg-form-row">
                    <input
                      required
                      type="tel"
                      name="mobile"
                      placeholder="Your Mobile *"
                      className="contactpg-field-input"
                      value={formData.mobile}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <select
                      required
                      name="services"
                      className="contactpg-field-input"
                      value={formData.services}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select a Service *
                      </option>
                      {Array.from(new Set([...(content?.services || []).filter((s) => s.active !== false).map((s) => s.title), ...SERVICES])).map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    name="message"
                    placeholder="Message"
                    className="contactpg-field-input"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    disabled={loading}
                  />

                  <div className="contactpg-submit-row">
                    <button
                      type="submit"
                      className="contactpg-submit-btn"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Now"}
                    </button>
                    <span className="contactpg-submit-icon">
                      <FiArrowRight size={18} />
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

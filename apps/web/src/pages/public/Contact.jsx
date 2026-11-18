import { useEffect, useRef, useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiArrowRight } from "react-icons/fi";
import { enquiryAPI } from "../../services/api";
import { SERVICES } from "../../lib/static";
import useWebsiteContent from "../../hooks/useWebsiteContent";
import { trackEvent } from "../../lib/analytics";
import "../../styles/contact.css";


const INITIAL_FORM = {
  name: "",
  email: "",
  mobile: "",
  services: "",
  message: "",
  website: "",
};

export default function ContactPage() {
  const { content } = useWebsiteContent();
  const pageCopy = content.pageCopy.Contact;

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
  const formStartedAtRef = useRef(0);

  useEffect(() => {
    formStartedAtRef.current = Date.now();
  }, []);

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
      website: formData.website,
      formStartedAt: formStartedAtRef.current,
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
      trackEvent("generate_lead", { method: "contact_form" });
      setSubmitted(true);
      setFormData(INITIAL_FORM);
      formStartedAtRef.current = Date.now();
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

      {/* HERO BAND */}
      <section
        className="contactpg-hero-section"
        style={{ backgroundImage: `url(${pageCopy.heroImage})` }}
      >
        <div className="contactpg-hero-dark-overlay" />
        <div className="contactpg-hero-inner-container">
          <h1 className="contactpg-hero-heading">{pageCopy.contact_us}</h1>
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
                      <p key={l}>{label === 'Call Us' ? <a href={`tel:${l.replace(/\s+/g, '')}`}>{l}</a> : label === 'Email Us' ? <a href={`mailto:${l}`}>{l}</a> : l}</p>
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
              src={`https://maps.google.com/maps?q=${encodeURIComponent(liveAddress)}&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <a className="contactpg-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(liveAddress)}`} target="_blank" rel="noreferrer">{pageCopy.open_location_in_google_maps}<FiArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      {/* HAPPY TO ANSWER / SEND A MESSAGE */}
      <section className="contactpg-message-section">
        <div className="contactpg-wrap">
          <div className="contactpg-message-grid">
            <div>
              <div className="contactpg-eyebrow">
                <span className="contactpg-eyebrow-bar" />{pageCopy.contact_us_2}</div>
              <h2 className="contactpg-message-heading">{pageCopy.happy_to_answer_all_your}</h2>
            </div>

            <div className="contactpg-form-card">
              <h3 className="contactpg-form-card-title">{pageCopy.send_a_message}</h3>

              {submitted ? (
                <div className="contactpg-success-box">
                  <p className="contactpg-success-title">{pageCopy.message_received}</p>
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
                  >{pageCopy.send_another_message}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contactpg-form">
                  <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
                    <label htmlFor="contact-website">{pageCopy.website}</label>
                    <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
                  </div>
                  {error && <div className="contactpg-error-box" role="alert">{error}</div>}

                  <div className="contactpg-form-row">
                    <div>
                      <label htmlFor="contact-name" className="contactpg-field-label">{pageCopy.your_name}</label>
                      <input
                        id="contact-name"
                        required
                        type="text"
                        name="name"
                        placeholder="Your Name *"
                        className="contactpg-field-input"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="contactpg-field-label">{pageCopy.your_email}</label>
                      <input
                        id="contact-email"
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
                  </div>
                  <div className="contactpg-form-row">
                    <div>
                      <label htmlFor="contact-mobile" className="contactpg-field-label">{pageCopy.your_mobile}</label>
                      <input
                        id="contact-mobile"
                        required
                        type="tel"
                        name="mobile"
                        placeholder="Your Mobile *"
                        className="contactpg-field-input"
                        value={formData.mobile}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-services" className="contactpg-field-label">{pageCopy.select_a_service}</label>
                      <select
                        id="contact-services"
                        required
                        name="services"
                        className="contactpg-field-input"
                        value={formData.services}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="" disabled>{pageCopy.select_a_service_}</option>
                        {Array.from(new Set([...(content?.services || []).filter((s) => s.active !== false).map((s) => s.title), ...SERVICES])).map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="contactpg-field-label">{pageCopy.message}</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      placeholder="Message"
                      className="contactpg-field-input"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

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

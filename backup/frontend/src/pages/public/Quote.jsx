import "../../styles/quote.css";
import { useState, useMemo } from "react";
import {
  FiCheck, FiPhone, FiMail, FiMapPin, FiClock, FiArrowRight, FiArrowLeft,
  FiHome, FiBriefcase, FiCoffee, FiShoppingBag, FiMoreHorizontal,
} from "react-icons/fi";
import { quoteAPI } from "../../services/api";
// TODO: adjust this path to where your hook lives
import useWebDetails from "../../lib/cacheStore";

const HERO_BG = "/static/pages-bg.webp";

// Shown until the API data arrives (and for any field the API doesn't return).
// Working hours are not part of the web details API, so they stay fixed here.
const FALLBACK_CONTACT = {
  phone: "+971 54 386 2870",
  email: "info@yfbfitoutcontracting.com",
  address: "Bay Square, Building 12 - Office G01, Business Bay, Dubai - UAE",
  hours: "Sat - Thu, 9:00 AM - 6:00 PM",
};

// Values must match the PROJECT_TYPES enum in the quote schema
const PROJECT_TYPES = [
  { label: "Residential", icon: FiHome },
  { label: "Commercial", icon: FiBriefcase },
  { label: "Hospitality", icon: FiCoffee },
  { label: "Retail", icon: FiShoppingBag },
  { label: "Other", icon: FiMoreHorizontal },
];

const SERVICES = [
  "Turnkey fit-out",
  "Customised joinery and furniture",
  "Villa extension or renovation",
  "Kitchen enhancement",
  "Living and dining spaces",
  "Swimming pool and landscape",
  "Luxury bathroom",
  "Exhibition stand or kiosk",
  "MEP (Electrical, AC, Plumbing)",
  "Home or office automation",
];

const BUDGETS = ["Under AED 50,000", "AED 50,000 - 150,000", "AED 150,000 - 500,000", "AED 500,000+", "Not sure yet"];
const TIMELINES = ["As soon as possible", "Within 1-3 months", "3-6 months", "Just exploring"];
const STEPS = ["Your details", "Your project", "Final details"];
const NEXT = [
  "We review your enquiry within one working day.",
  "A specialist calls you to discuss the brief.",
  "You receive a site visit and clear quotation.",
];

// Which step each schema field is shown on (used to jump to the right step on server errors)
const FIELD_STEP = {
  name: 0, mobile: 0, email: 0,
  projectType: 1, services: 1,
  location: 2, budget: 2, timeline: 2, message: 2,
};

const INITIAL = {
  name: "", mobile: "", email: "",
  projectType: "", services: [],
  location: "", budget: "", timeline: "", message: "",
};

export default function QuotePage() {
  // Contact details come from the shared, cached web details
  const details = useWebDetails();
  const CONTACT = useMemo(() => {
    const a = details?.address;
    const apiAddress = a
      ? [a.street, a.city, a.state, a.zipCode, a.country].filter(Boolean).join(", ")
      : "";
    return {
      phone: details?.mobile || FALLBACK_CONTACT.phone,
      email: details?.email || FALLBACK_CONTACT.email,
      address: apiAddress || FALLBACK_CONTACT.address,
      hours: FALLBACK_CONTACT.hours,
    };
  }, [details]);

  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [serverError, setServerError] = useState("");

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const toggleService = (s) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
    if (errors.services) setErrors((er) => ({ ...er, services: undefined }));
  };

  const validate = (s) => {
    const er = {};
    if (s === 0) {
      if (!form.name.trim()) er.name = "Enter your full name.";
      if (form.mobile.replace(/\D/g, "").length < 7) er.mobile = "Enter a valid mobile number.";
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = "Enter a valid email address.";
    }
    if (s === 1) {
      if (!form.projectType) er.projectType = "Select a project type.";
      if (form.services.length === 0) er.services = "Choose at least one service.";
    }
    if (s === 2 && form.message.trim().length < 10) er.message = "Tell us a little about your project.";
    return er;
  };

  const goNext = () => {
    const er = validate(step);
    setErrors(er);
    if (Object.keys(er).length === 0) setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    if (step < STEPS.length - 1) return goNext();

    const er = validate(step);
    setErrors(er);
    if (Object.keys(er).length) return;

    // Matches the quote schema exactly: services is an array, extra fields are sent as their own fields
    const data = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      projectType: form.projectType,
      services: form.services,
      location: form.location.trim(),
      budget: form.budget,
      timeline: form.timeline,
      message: form.message.trim(),
    };

    setStatus("sending");
    setServerError("");
    try {
      await quoteAPI.create(data);
      setStatus("sent");
    } catch (err) {
      const res = err?.response?.data;

      // Field-level validation errors from the API: show them on the matching fields
      if (res?.errors && Object.keys(res.errors).length) {
        setErrors(res.errors);
        const firstStep = Math.min(...Object.keys(res.errors).map((k) => FIELD_STEP[k] ?? step));
        setStep(firstStep);
        setStatus("idle");
        return;
      }

      setServerError(res?.message || "We couldn't send your quote request. Please try again or call us.");
      setStatus("error");
    }
  };

  const reset = () => {
    setForm(INITIAL);
    setStep(0);
    setErrors({});
    setServerError("");
    setStatus("idle");
  };

  return (
    <div className="enqpg-page">

      <section className="enqpg-hero" style={{ backgroundImage: `url(${HERO_BG})` }}>
        <div className="enqpg-wrap">
          <div className="enqpg-kicker">Free consultation &amp; quotation</div>
          <h1>Tell Us About Your Space</h1>
          <p>Three short steps. Share your details and our team will respond with advice, a site visit and a clear quotation.</p>
        </div>
      </section>

      <div className="enqpg-wrap">
        <div className="enqpg-shell">
          {/* Side panel */}
          <aside className="enqpg-side">
            <h2>Let&rsquo;s plan your project together.</h2>
            <p className="enqpg-side-copy">
              From a single room to a full turnkey fit-out, the more you tell us, the more accurate our first response will be.
            </p>

            <ul className="enqpg-contacts">
              <li className="enqpg-contact">
                <span className="enqpg-contact-icon"><FiPhone size={17} /></span>
                <div><small>Call us</small><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a></div>
              </li>
              <li className="enqpg-contact">
                <span className="enqpg-contact-icon"><FiMail size={17} /></span>
                <div><small>Email us</small><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
              </li>
              <li className="enqpg-contact">
                <span className="enqpg-contact-icon"><FiMapPin size={17} /></span>
                <div><small>Visit us</small>{CONTACT.address}</div>
              </li>
              <li className="enqpg-contact">
                <span className="enqpg-contact-icon"><FiClock size={17} /></span>
                <div><small>Working hours</small>{CONTACT.hours}</div>
              </li>
            </ul>

            <h3>What happens next</h3>
            <ol className="enqpg-next">
              {NEXT.map((n) => <li key={n}>{n}</li>)}
            </ol>
          </aside>

          {/* Form */}
          <div className="enqpg-main">
            {status === "sent" ? (
              <div className="enqpg-done" role="status">
                <div className="enqpg-done-icon"><FiCheck size={36} strokeWidth={3} /></div>
                <h3>Quote request sent</h3>
                <p>Thank you. We&rsquo;ve received your details and will contact you within one working day.</p>
                <button type="button" className="enqpg-btn primary" onClick={reset}>Send another request</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="enqpg-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
                  {STEPS.map((label, i) => (
                    <div key={label} style={{ display: "contents" }}>
                      <div className={`enqpg-pstep ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
                        <span className="enqpg-pdot">{i < step ? <FiCheck size={14} strokeWidth={3} /> : i + 1}</span>
                        <span className="enqpg-plabel">{label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`enqpg-pline ${i < step ? "full" : ""}`}><i /></div>
                      )}
                    </div>
                  ))}
                </div>

                {step === 0 && (
                  <div className="enqpg-panel" key="s0">
                    <h3 className="enqpg-title">Who are we speaking to?</h3>
                    <p className="enqpg-sub">We&rsquo;ll use these details only to reply to your request.</p>
                    <div className="enqpg-grid">
                      <div className={`enqpg-field ${errors.name ? "enqpg-bad" : ""}`}>
                        <label className="enqpg-label" htmlFor="enq-name">Full name *</label>
                        <input id="enq-name" className="enqpg-input" autoComplete="name" value={form.name} onChange={set("name")} />
                        {errors.name && <span className="enqpg-err">{errors.name}</span>}
                      </div>
                      <div className={`enqpg-field ${errors.mobile ? "enqpg-bad" : ""}`}>
                        <label className="enqpg-label" htmlFor="enq-mobile">Mobile *</label>
                        <input id="enq-mobile" className="enqpg-input" type="tel" autoComplete="tel" placeholder="+971" value={form.mobile} onChange={set("mobile")} />
                        {errors.mobile && <span className="enqpg-err">{errors.mobile}</span>}
                      </div>
                      <div className={`enqpg-field enqpg-full ${errors.email ? "enqpg-bad" : ""}`}>
                        <label className="enqpg-label" htmlFor="enq-email">Email *</label>
                        <input id="enq-email" className="enqpg-input" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
                        {errors.email && <span className="enqpg-err">{errors.email}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="enqpg-panel" key="s1">
                    <h3 className="enqpg-title">What are we building?</h3>
                    <p className="enqpg-sub">Pick the project type and everything you need help with.</p>
                    <div className="enqpg-grid">
                      <fieldset className={`enqpg-field enqpg-full ${errors.projectType ? "enqpg-bad" : ""}`}>
                        <legend className="enqpg-label" style={{ marginBottom: 10 }}>Project type *</legend>
                        <div className="enqpg-types">
                          {PROJECT_TYPES.map(({ label, icon: Icon }) => (
                            <label key={label} className="enqpg-type">
                              <input type="radio" name="projectType" value={label} checked={form.projectType === label}
                                onChange={set("projectType")} />
                              <span><Icon size={22} />{label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.projectType && <span className="enqpg-err">{errors.projectType}</span>}
                      </fieldset>

                      <fieldset className={`enqpg-field enqpg-full ${errors.services ? "enqpg-bad" : ""}`}>
                        <legend className="enqpg-label" style={{ marginBottom: 10 }}>
                          Services needed * <span className="enqpg-opt">(select all that apply)</span>
                        </legend>
                        <div className="enqpg-chips">
                          {SERVICES.map((s) => (
                            <label key={s} className="enqpg-chip">
                              <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)} />
                              <span>{s}</span>
                            </label>
                          ))}
                        </div>
                        {errors.services && <span className="enqpg-err">{errors.services}</span>}
                      </fieldset>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="enqpg-panel" key="s2">
                    <h3 className="enqpg-title">A few final details</h3>
                    <p className="enqpg-sub">Optional details help us prepare a more accurate first response.</p>
                    <div className="enqpg-grid">
                      <div className="enqpg-field enqpg-full">
                        <label className="enqpg-label" htmlFor="enq-loc">Project location <span className="enqpg-opt">(optional)</span></label>
                        <input id="enq-loc" className="enqpg-input" placeholder="e.g. Dubai Hills, Abu Dhabi" value={form.location} onChange={set("location")} />
                      </div>
                      <div className="enqpg-field">
                        <label className="enqpg-label" htmlFor="enq-budget">Estimated budget <span className="enqpg-opt">(optional)</span></label>
                        <select id="enq-budget" className="enqpg-input" value={form.budget} onChange={set("budget")}>
                          <option value="">Select a range</option>
                          {BUDGETS.map((b) => <option key={b}>{b}</option>)}
                        </select>
                      </div>
                      <div className="enqpg-field">
                        <label className="enqpg-label" htmlFor="enq-time">Preferred start <span className="enqpg-opt">(optional)</span></label>
                        <select id="enq-time" className="enqpg-input" value={form.timeline} onChange={set("timeline")}>
                          <option value="">Select a timeframe</option>
                          {TIMELINES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className={`enqpg-field enqpg-full ${errors.message ? "enqpg-bad" : ""}`}>
                        <label className="enqpg-label" htmlFor="enq-msg">About your project *</label>
                        <textarea id="enq-msg" className="enqpg-input" placeholder="Size of the space, style you like, current stage of the project…"
                          value={form.message} onChange={set("message")} />
                        {errors.message && <span className="enqpg-err">{errors.message}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {status === "error" && <div className="enqpg-banner" role="alert">{serverError}</div>}

                <div className="enqpg-actions">
                  <p className="enqpg-privacy">Step {step + 1} of {STEPS.length}. Your details are used only to respond to this request.</p>
                  <div className="enqpg-btns">
                    {step > 0 && (
                      <button type="button" className="enqpg-btn ghost" onClick={goBack} disabled={status === "sending"}>
                        <FiArrowLeft size={16} /> Back
                      </button>
                    )}
                    <button type="submit" className="enqpg-btn primary" disabled={status === "sending"}>
                      {status === "sending" ? "Sending…" : step < STEPS.length - 1 ? "Continue" : "Send"}
                      {status !== "sending" && <FiArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
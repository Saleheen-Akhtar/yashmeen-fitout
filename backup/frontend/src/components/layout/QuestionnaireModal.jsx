import { useState, useEffect, useRef, useCallback } from "react";

const PROJECT_TYPES = [
  "Residential Villa",
  "Commercial Office",
  "Retail & Showroom",
  "Hospitality & F&B",
  "Bespoke Joinery Only",
  "Other / Unsure",
];

const BUDGET_RANGES = [
  "< AED 500,000",
  "AED 500,000 - 1.5 Mil",
  "AED 1.5 Mil - 3 Mil",
  "AED 3 Mil - 5 Mil",
  "AED 5 Mil+",
];

const TIMELINES = [
  "Immediate (Within 30 Days)",
  "1 - 3 Months",
  "3 - 6 Months",
  "6 - 12 Months",
  "Planning Phase",
];

const DRAWING_STATUSES = [
  "Yes, we have approved drawings ready",
  "Drawings in progress with architect",
  "Concept sketches only",
  "No, we need complete turnkey design and approvals",
];

const REFERRAL_SOURCES = [
  "Client Referral / Word of Mouth",
  "Google Search",
  "Instagram",
  "Architect / Consultant Partner",
  "Industry Publication",
  "Other",
];

const EMAIL_RE = /^\S+@\S+\.\S{2,}$/;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const mapProjectSector = (raw = "") => {
  if (raw.includes("Residential")) return "Residential";
  if (raw.includes("Commercial")) return "Commercial";
  if (raw.includes("Retail")) return "Retail";
  if (raw.includes("Hospitality")) return "Hospitality";
  return "Other";
};

const mapServiceScope = (raw = "") => {
  if (raw.includes("Joinery")) return "Bespoke Joinery";
  if (raw.includes("Commercial")) return "Commercial Fit-Out";
  if (raw.includes("Retail")) return "Retail Fit-Out";
  if (raw.includes("Hospitality")) return "Hospitality Fit-Out";
  if (raw.includes("Residential")) return "Residential Fit-Out";
  return "Turnkey Fit-Out";
};

export default function QuestionnaireModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const cardRef = useRef(null);
  const doneBtnRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    workedWithArchitect: "Yes",
    projectType: "Residential Villa",
    location: "Dubai",
    timeline: "1 - 3 Months",
    budget: "AED 1.5 Mil - 3 Mil",
    drawingStatus: "No, we need complete turnkey design and approvals",
    brief: "",
    referral: "Client Referral / Word of Mouth",
    otherReferral: "",
  });

  const resetAndClose = useCallback(() => {
    setSubmitted(false);
    setStep(1);
    setErrorMsg("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resetAndClose();
        return;
      }

      if (e.key === "Tab" && cardRef.current) {
        const focusables = Array.from(cardRef.current.querySelectorAll(FOCUSABLE_SELECTOR));
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, resetAndClose]);

  useEffect(() => {
    if (isOpen && submitted) {
      requestAnimationFrame(() => doneBtnRef.current?.focus());
    }
  }, [isOpen, submitted]);

  if (!isOpen) return null;

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errorMsg) setErrorMsg("");
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!EMAIL_RE.test(formData.email.trim())) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        setErrorMsg("Please enter a valid phone number (7 to 15 digits with country code).");
        return;
      }
    }
    if (step < 8) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanMobile = formData.phone.trim();
    const serviceScope = mapServiceScope(formData.projectType);
    const composedMessage = `[Questionnaire Submission]
Worked with Architect: ${formData.workedWithArchitect}
Project Type: ${formData.projectType}
Location: ${formData.location || "Dubai"}
Timeline: ${formData.timeline}
Budget: ${formData.budget}
Drawings Status: ${formData.drawingStatus}
Design Brief: ${formData.brief.trim() || "Initial project inquiry"}
Referral: ${formData.referral}${formData.otherReferral ? ` (${formData.otherReferral.trim()})` : ""}`;

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        projectType: mapProjectSector(formData.projectType),
        services: [serviceScope],
        budget: formData.budget,
        location: formData.location.trim() || "Dubai",
        timeline: formData.timeline,
        message: composedMessage,
      };

      const res = await fetch("/api/quote/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const quoteData = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitted(true);
        return;
      }

      if (res.status >= 400 && res.status < 500) {
        const fieldErrors = quoteData?.errors
          ? Object.values(quoteData.errors).filter(Boolean).join(" ")
          : "";
        setErrorMsg(
          fieldErrors ||
            quoteData?.message ||
            "Please verify your contact details and project brief before submitting."
        );
        return;
      }

      // Secondary endpoint fallback when quote service is unavailable
      const fallbackRes = await fetch("/api/enquiry/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          mobile: cleanMobile,
          services: serviceScope,
          message: composedMessage,
        }),
      });
      const enqData = await fallbackRes.json().catch(() => ({}));

      if (!fallbackRes.ok) {
        setErrorMsg(
          enqData?.message ||
            "We could not record your brief right now. Please try again or reach us at info@yfbfitoutcontracting.com."
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg(
        "Unable to reach our server right now. Please check your connection or email info@yfbfitoutcontracting.com."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`modal-overlay ${isOpen ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="questionnaire-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="modal-card" ref={cardRef}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span id="questionnaire-modal-title" className="modal-eyebrow">
              (PROJECT ENQUIRY)
            </span>
            <p className="modal-header-desc">
              Provide initial details about your space. Our senior directors review every brief
              and respond within one working day.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            CLOSE
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "48px 16px" }}>
              <span className="step-indicator">(CONFIRMATION)</span>
              <h3 className="step-heading" style={{ fontSize: "2rem", marginTop: 12 }}>
                Thank You. Your Project Brief Has Been Received.
              </h3>
              <p
                style={{
                  color: "var(--muted)",
                  maxWidth: "54ch",
                  margin: "16px auto 32px",
                  lineHeight: 1.6,
                }}
              >
                Our team at Yashmeen Atelier will review your requirements, spatial parameters,
                and authority schedule. A senior project lead will contact you within one business
                day.
              </p>
              <button
                ref={doneBtnRef}
                type="button"
                onClick={resetAndClose}
                className="btn-pill btn-pill-dark"
              >
                RETURN TO ATELIER
              </button>
            </div>
          ) : (
            <>
              <div className="step-indicator">
                {step === 1 && "YOUR PERSONAL DETAILS (01/08)"}
                {step === 2 && "PREVIOUS EXPERIENCE (02/08)"}
                {step === 3 && "PROJECT PARTICULARS (03/08)"}
                {step === 4 && "LOCATION & TIMELINE (04/08)"}
                {step === 5 && "ESTIMATED BUDGET RANGE (05/08)"}
                {step === 6 && "DRAWINGS & APPROVALS (06/08)"}
                {step === 7 && "DESIGN BRIEF & VISION (07/08)"}
                {step === 8 && "ADDITIONAL INFORMATION (08/08)"}
              </div>

              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div>
                  <h3 className="step-heading">Who are we designing with?</h3>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div className="field">
                      <label htmlFor="modal-name">Full Name *</label>
                      <input
                        id="modal-name"
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="modal-email">Email Address *</label>
                      <input
                        id="modal-email"
                        type="email"
                        placeholder="e.g. sarah@example.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="modal-phone">Phone Number * (with country code)</label>
                      <input
                        id="modal-phone"
                        type="tel"
                        placeholder="+971 50 000 0000"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <h3 className="step-heading">
                    Have you worked with an architect or fit-out contractor before?
                  </h3>
                  <div className="options-grid">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={formData.workedWithArchitect === opt}
                        className={`option-box ${formData.workedWithArchitect === opt ? "is-selected" : ""}`}
                        onClick={() => updateField("workedWithArchitect", opt)}
                      >
                        <span>{opt}</span>
                        {formData.workedWithArchitect === opt && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <h3 className="step-heading">What type of project are you looking for?</h3>
                  <div className="options-grid">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={formData.projectType === type}
                        className={`option-box ${formData.projectType === type ? "is-selected" : ""}`}
                        onClick={() => updateField("projectType", type)}
                      >
                        <span>{type}</span>
                        {formData.projectType === type && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div>
                  <h3 className="step-heading">
                    Where is your project located, and what is your timeline?
                  </h3>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div className="field">
                      <label htmlFor="modal-loc">
                        Project Location (Community, Tower, or City)
                      </label>
                      <input
                        id="modal-loc"
                        type="text"
                        placeholder="e.g. Palm Jumeirah, Emirates Hills, DIFC, or Downtown Dubai"
                        value={formData.location}
                        onChange={(e) => updateField("location", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="modal-time">Desired Timeline</label>
                      <select
                        id="modal-time"
                        value={formData.timeline}
                        onChange={(e) => updateField("timeline", e.target.value)}
                      >
                        {TIMELINES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {step === 5 && (
                <div>
                  <h3 className="step-heading">What is your anticipated project budget?</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: 16 }}>
                    Yashmeen operates an in-house 35,000 sq.ft Al Quoz workshop. Direct bench
                    fabrication maximizes value and architectural finish within your allocated
                    investment.
                  </p>
                  <div className="options-grid">
                    {BUDGET_RANGES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        aria-pressed={formData.budget === b}
                        className={`option-box ${formData.budget === b ? "is-selected" : ""}`}
                        onClick={() => updateField("budget", b)}
                      >
                        <span>{b}</span>
                        {formData.budget === b && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6 */}
              {step === 6 && (
                <div>
                  <h3 className="step-heading">
                    Do you currently have approved architectural drawings?
                  </h3>
                  <div style={{ display: "grid", gap: 12 }}>
                    {DRAWING_STATUSES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        aria-pressed={formData.drawingStatus === d}
                        className={`option-box ${formData.drawingStatus === d ? "is-selected" : ""}`}
                        onClick={() => updateField("drawingStatus", d)}
                      >
                        <span>{d}</span>
                        {formData.drawingStatus === d && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7 */}
              {step === 7 && (
                <div>
                  <h3 className="step-heading">Share key details or ideas for your brief</h3>
                  <div className="field">
                    <label htmlFor="modal-brief">Design Brief &amp; Spatial Needs (Optional)</label>
                    <textarea
                      id="modal-brief"
                      rows={5}
                      placeholder="Tell us about the space: estimated square footage, desired aesthetics, specific joinery requirements, or authority milestone targets."
                      value={formData.brief}
                      onChange={(e) => updateField("brief", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 8 */}
              {step === 8 && (
                <div>
                  <h3 className="step-heading">How did you hear about Yashmeen?</h3>
                  <div className="options-grid">
                    {REFERRAL_SOURCES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={formData.referral === r}
                        className={`option-box ${formData.referral === r ? "is-selected" : ""}`}
                        onClick={() => updateField("referral", r)}
                      >
                        <span>{r}</span>
                        {formData.referral === r && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                  {formData.referral === "Other" && (
                    <div className="field" style={{ marginTop: 12 }}>
                      <label htmlFor="modal-other-referral">Please tell us how:</label>
                      <input
                        id="modal-other-referral"
                        type="text"
                        value={formData.otherReferral}
                        onChange={(e) => updateField("otherReferral", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  style={{
                    color: "#d30000",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    marginTop: 16,
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Navigation Footer */}
        {!submitted && (
          <div className="modal-footer">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="btn-pill btn-pill-light">
                ← BACK
              </button>
            ) : (
              <div />
            )}

            {step < 8 ? (
              <button type="button" onClick={handleNext} className="btn-pill btn-pill-dark">
                NEXT STEP →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-pill btn-pill-dark"
              >
                {loading ? "SUBMITTING..." : "SUBMIT PROJECT BRIEF →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

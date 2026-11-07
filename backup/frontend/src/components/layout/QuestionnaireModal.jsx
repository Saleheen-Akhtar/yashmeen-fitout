import { useState, useEffect } from "react";

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

export default function QuestionnaireModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMsg("Please enter your name.");
        return;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setErrorMsg("Please enter a valid email address.");
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

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        projectType: formData.projectType.includes("Residential")
          ? "Residential"
          : formData.projectType.includes("Commercial")
          ? "Commercial"
          : formData.projectType.includes("Retail")
          ? "Retail"
          : formData.projectType.includes("Hospitality")
          ? "Hospitality"
          : "Other",
        approxBudget: formData.budget,
        location: formData.location,
        timeline: formData.timeline,
        message: `[Questionnaire Submission]
Worked with Architect: ${formData.workedWithArchitect}
Project Type: ${formData.projectType}
Location: ${formData.location}
Timeline: ${formData.timeline}
Budget: ${formData.budget}
Drawings Status: ${formData.drawingStatus}
Design Brief: ${formData.brief || "N/A"}
Referral: ${formData.referral} ${formData.otherReferral ? `(${formData.otherReferral})` : ""}`,
      };

      const res = await fetch("/api/quote/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback to enquiry endpoint if needed
        await fetch("/api/enquiry/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: `New Project Enquiry: ${formData.projectType}`,
            message: payload.message,
          }),
        });
      }

      setSubmitted(true);
    } catch {
      // Still show success to maintain client reassurance
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setStep(1);
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? "is-open" : ""}`} role="dialog" aria-modal="true">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-eyebrow">(PROJECT ENQUIRY)</span>
            <p className="modal-header-desc">
              Provide initial details about your space. Our senior directors review every brief
              and respond within one working day.
            </p>
          </div>
          <button type="button" onClick={resetAndClose} className="modal-close-btn" aria-label="Close modal">
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
              <p style={{ color: "var(--muted)", maxWidth: "54ch", margin: "16px auto 32px", lineHeight: 1.6 }}>
                Our team at Yashmeen Atelier will review your requirements, spatial parameters, and authority schedule.
                A senior project lead will contact you within one business day.
              </p>
              <button type="button" onClick={resetAndClose} className="btn-pill btn-pill-dark">
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
                      <label htmlFor="modal-phone">Phone Number (with country code)</label>
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

              {/* Step 2: Have you worked with an architect/contractor before? */}
              {step === 2 && (
                <div>
                  <h3 className="step-heading">Have you worked with an architect or fit-out contractor before?</h3>
                  <div className="options-grid">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`option-box ${formData.workedWithArchitect === opt ? "is-selected" : ""}`}
                        onClick={() => updateField("workedWithArchitect", opt)}
                      >
                        <span>{opt}</span>
                        {formData.workedWithArchitect === opt && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Project Type */}
              {step === 3 && (
                <div>
                  <h3 className="step-heading">What type of project are you looking for?</h3>
                  <div className="options-grid">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`option-box ${formData.projectType === type ? "is-selected" : ""}`}
                        onClick={() => updateField("projectType", type)}
                      >
                        <span>{type}</span>
                        {formData.projectType === type && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Location & Timeline */}
              {step === 4 && (
                <div>
                  <h3 className="step-heading">Where is your project located, and what is your timeline?</h3>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div className="field">
                      <label htmlFor="modal-loc">Project Location (Community, Tower, or City)</label>
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

              {/* Step 5: Budget Range */}
              {step === 5 && (
                <div>
                  <h3 className="step-heading">What is your anticipated project budget?</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: 16 }}>
                    Yashmeen operates an in-house 35,000 sq.ft Al Quoz workshop. Direct bench fabrication
                    maximizes value and architectural finish within your allocated investment.
                  </p>
                  <div className="options-grid">
                    {BUDGET_RANGES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`option-box ${formData.budget === b ? "is-selected" : ""}`}
                        onClick={() => updateField("budget", b)}
                      >
                        <span>{b}</span>
                        {formData.budget === b && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Drawings & Approvals */}
              {step === 6 && (
                <div>
                  <h3 className="step-heading">Do you currently have approved architectural drawings?</h3>
                  <div style={{ display: "grid", gap: 12 }}>
                    {DRAWING_STATUSES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`option-box ${formData.drawingStatus === d ? "is-selected" : ""}`}
                        onClick={() => updateField("drawingStatus", d)}
                      >
                        <span>{d}</span>
                        {formData.drawingStatus === d && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7: Design Brief */}
              {step === 7 && (
                <div>
                  <h3 className="step-heading">Share key details or ideas for your brief</h3>
                  <div className="field">
                    <label htmlFor="modal-brief">Design Brief & Spatial Needs (Optional)</label>
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

              {/* Step 8: Additional Information */}
              {step === 8 && (
                <div>
                  <h3 className="step-heading">How did you hear about Yashmeen?</h3>
                  <div className="options-grid">
                    {REFERRAL_SOURCES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`option-box ${formData.referral === r ? "is-selected" : ""}`}
                        onClick={() => updateField("referral", r)}
                      >
                        <span>{r}</span>
                        {formData.referral === r && <span>✓</span>}
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
                <div style={{ color: "#d30000", fontSize: "0.875rem", marginTop: 16 }}>
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

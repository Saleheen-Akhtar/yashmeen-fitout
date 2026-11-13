import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { grantConsent, denyConsent } from "../../lib/analytics";

export default function CookieConsentBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("yashmeen_consent");
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // Ignore storage restrictions
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    grantConsent();
    setVisible(false);
  };

  const handleDecline = () => {
    denyConsent();
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Privacy & Cookie Preferences"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 95,
        background: "rgba(14, 13, 11, 0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.14)",
        padding: "14px 24px",
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 1.5,
            maxWidth: "760px",
            fontFamily: "var(--font-sans)",
          }}
        >
          We use strictly necessary cookies and anonymous metrics to optimize your studio browsing experience.
          Read our{" "}
          <Link
            to="/privacy-policy"
            style={{ color: "#e6c77c", textDecoration: "underline" }}
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={handleDecline}
            style={{
              padding: "7px 16px",
              borderRadius: "9999px",
              background: "transparent",
              color: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Decline
          </button>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              padding: "7px 18px",
              borderRadius: "9999px",
              background: "#ffffff",
              color: "#080807",
              border: "none",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { grantConsent, denyConsent } from "../../lib/analytics";

const hasStoredPreference = () => {
  try {
    return Boolean(localStorage.getItem("yashmeen_consent"));
  } catch {
    return false;
  }
};

export default function CookieConsentBar() {
  const bannerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(!hasStoredPreference()));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const openPreferences = () => setVisible(true);
    window.addEventListener("open-cookie-preferences", openPreferences);
    document.documentElement.classList.toggle("cookie-consent-visible", visible);
    const measure = () => {
      if (bannerRef.current) {
        document.documentElement.style.setProperty("--cookie-banner-height", `${bannerRef.current.getBoundingClientRect().height}px`);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (bannerRef.current) observer.observe(bannerRef.current);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--cookie-banner-height");
      window.removeEventListener("open-cookie-preferences", openPreferences);
      document.documentElement.classList.remove("cookie-consent-visible");
    };
  }, [visible]);

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
    <div ref={bannerRef} className="cookie-consent" role="region" aria-label="Privacy & Cookie Preferences">
      <div className="cookie-consent-inner">
        <p>
          We use necessary cookies and anonymous metrics to improve your browsing experience.
          Read our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
        <div className="cookie-consent-actions">
          <button type="button" onClick={handleDecline} className="btn btn-outline">Decline</button>
          <button type="button" onClick={handleAccept} className="btn btn-primary">Accept</button>
        </div>
      </div>
    </div>
  );
}

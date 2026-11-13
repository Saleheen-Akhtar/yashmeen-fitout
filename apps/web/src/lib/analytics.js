// Google Analytics 4 Consent Mode v2 & Event Tracking
export const GA_MEASUREMENT_ID = "G-N2BTZPHMXP";

export function hasConsent() {
  try {
    return localStorage.getItem("yashmeen_consent") === "granted";
  } catch {
    return false;
  }
}

export function grantConsent() {
  try {
    localStorage.setItem("yashmeen_consent", "granted");
  } catch {
    // Ignore localStorage restrictions
  }

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function denyConsent() {
  try {
    localStorage.setItem("yashmeen_consent", "denied");
  } catch {
    // Ignore localStorage restrictions
  }

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

export function trackEvent(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

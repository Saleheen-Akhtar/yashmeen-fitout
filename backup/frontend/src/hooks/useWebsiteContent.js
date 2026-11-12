import { useState, useEffect, useCallback } from "react";
import { webDetailsAPI } from "../services/api";
import { clearProjectsCache } from "../lib/publicCache";

export const DEFAULT_WEBSITE_CONTENT = {
  brandName: "YASHMEEN FIT-OUT",
  cityLabel: "DUBAI",
  workingHours: "Monday to Friday, 8:30am - 6:00pm",
  address: {
    street: "Bay Square, Building 12, Office G01, Business Bay",
    city: "Dubai",
    state: "Dubai",
    zipCode: "",
    country: "UAE",
  },
  email: "info@yfbfitoutcontracting.com",
  mobile: "+971 54 386 2870",
  whatsapp: "+971 54 386 2870",
  socialLinks: [],
  hero: {
    kicker: "DUBAI · DESIGN / ENGINEERING / FIT-OUT",
    title: "From brief\nto built.",
    intro:
      "One team shapes the space, makes the details and delivers the finished interior.",
    proofMetric: "35,000 sq. ft.",
    proofLabel: "Al Quoz atelier",
    ctaText: "START A PROJECT",
  },
  studio: {
    eyebrow: "(ONE TEAM. EVERY STAGE.)",
    headline: "DESIGN TO\nDELIVERY",
    paragraph1:
      "Yashmeen Future Building brings Dubai fit-out delivery together under one team. Design, spatial engineering, bespoke joinery, architectural glazing, and authority approvals move together under one accountable team, from the first brief to site handover.",
    paragraph2:
      "In our 35,000 sq. ft. Al Quoz atelier, craftspeople fabricate custom millwork, curved timber, metalwork and acoustic panels. Our MEP and site teams carry those details into the finished space, keeping the approved design and the built result connected.",
  },
  services: [
    {
      id: "srv-architecture",
      slug: "architecture",
      title: "Architecture",
      eyebrow: "CONCEPT TO AUTHORITIES",
      shortDesc:
        "Concept planning, Dubai Municipality & developer approvals, and structural coordination.",
      description:
        "End-to-end architectural planning, authority submissions, structural design and build coordination for luxury residential villas and flagship commercial developments across the UAE.",
      image: "/static/hero-aperture-v2.webp",
      route: "/services/architecture",
      active: true,
      highlights: [
        "Concept & Master Planning",
        "Dubai Municipality & DCD Approvals",
        "Structural & MEP Coordination",
        "Turnkey Design & Build Delivery",
      ],
    },
    {
      id: "srv-interior-design",
      slug: "interior-design",
      title: "Interior Design",
      eyebrow: "BESPOKE SPATIAL FIT-OUT",
      shortDesc:
        "Luxury interiors, bespoke joinery crafted in our Al Quoz facility, and fine lighting.",
      description:
        "Turnkey luxury interior architecture and custom millwork fabricated in our 35,000 sq. ft. Al Quoz atelier. From stone selection to final snag-free handover.",
      image: "/static/studio.jpg",
      route: "/services/interior-design",
      active: true,
      highlights: [
        "3D Photorealistic Visualization",
        "Bespoke Timber & Metalwork Joinery",
        "Architectural Lighting & Acoustic Systems",
        "Complete Authority Permitting",
      ],
    },
    {
      id: "srv-construction",
      slug: "construction",
      title: "Construction",
      eyebrow: "STRUCTURAL & CIVIL WORKS",
      shortDesc:
        "Commercial & villa turnkey contracting, structural modifications, and MEP engineering.",
      description:
        "Disciplined general contracting across Dubai with full civil works, waterproofing, structural slabs, and integrated MEP systems under a single critical path.",
      image: "/static/joinery-bay.jpg",
      route: "/services/construction",
      active: true,
      highlights: [
        "Civil & Structural Contracting",
        "MEP System Engineering",
        "Authority Clearances & Testing",
        "12-Month Defect Liability Guarantee",
      ],
    },
    {
      id: "srv-office-renovation",
      slug: "office-renovation",
      title: "Office Renovation",
      eyebrow: "CORPORATE HEADQUARTERS",
      shortDesc:
        "DIFC & Business Bay acoustic workspaces, executive suites, and modular glazing.",
      description:
        "High-speed corporate workplace transformations across DIFC, Business Bay, and Tecom. Framed acoustic glazing, micro-cement reception counters, and executive boardrooms.",
      image: "/static/Office-fit-out.jpg",
      route: "/services/office-renovation",
      active: true,
      highlights: [
        "Acoustic Double-Glazed Partitions",
        "Tecom, DIFC & DDA Fit-Out",
        "Smart Automation & AV Integration",
        "Zero-Disruption Phased Execution",
      ],
    },
  ],
  processSteps: [
    {
      num: "(01)",
      title: "Consultation & Spatial Feasibility",
      desc: "Site survey, spatial zoning, landlord criteria, and statutory authority pre-assessment across Dubai.",
    },
    {
      num: "(02)",
      title: "Concept Design & Material Selection",
      desc: "Curated materiality boards, architectural layouts, bespoke joinery details, and photorealistic 3D renders.",
    },
    {
      num: "(03)",
      title: "Dubai Authority Approvals",
      desc: "Direct submission and expedited clearances through Dubai Municipality, Civil Defence, Tecom, and Master Developers.",
    },
    {
      num: "(04)",
      title: "Bespoke Joinery & Factory Fabrication",
      desc: "Precision millwork, timber panelling, and metalwork fabricated in our 35,000 sq.ft Al Quoz manufacturing facility.",
    },
    {
      num: "(05)",
      title: "Turnkey Site Construction & MEP Integration",
      desc: "Comprehensive site execution with dedicated mechanical, electrical, and plumbing engineering on a single critical path.",
    },
    {
      num: "(06)",
      title: "Snag-Free Handover & 12-Month Guarantee",
      desc: "Full testing, commissioning approvals, operation manuals, and an unconditional 12-month defect liability guarantee.",
    },
  ],
};

const STORAGE_CACHE_KEY = "yashmeen:webContent:v1";
const CONTENT_TTL = 60 * 1000;

function mergeContent(remote) {
  if (!remote || typeof remote !== "object") return DEFAULT_WEBSITE_CONTENT;
  return {
    ...DEFAULT_WEBSITE_CONTENT,
    ...remote,
    address: {
      ...DEFAULT_WEBSITE_CONTENT.address,
      ...(remote.address || {}),
    },
    hero: {
      ...DEFAULT_WEBSITE_CONTENT.hero,
      ...(remote.hero || {}),
    },
    studio: {
      ...DEFAULT_WEBSITE_CONTENT.studio,
      ...(remote.studio || {}),
    },
    services:
      Array.isArray(remote.services) && remote.services.length > 0
        ? remote.services
        : DEFAULT_WEBSITE_CONTENT.services,
    processSteps:
      Array.isArray(remote.processSteps) && remote.processSteps.length > 0
        ? remote.processSteps
        : DEFAULT_WEBSITE_CONTENT.processSteps,
  };
}

function readInitialContent() {
  try {
    const cached = localStorage.getItem(STORAGE_CACHE_KEY);
    if (cached) return mergeContent(JSON.parse(cached));
  } catch {
    /* ignore */
  }
  return DEFAULT_WEBSITE_CONTENT;
}

// Shared module store so multiple mounted components (Header, Hero, Studio, Process, Footer)
// never trigger redundant API calls on mount or window focus.
let sharedContent = readInitialContent();
let inflightRequest = null;
let lastFetchedAt = 0;
let globalListenersAttached = false;
const subscribers = new Set();

function publishContent(next) {
  sharedContent = next;
  subscribers.forEach((fn) => {
    try {
      fn(next);
    } catch {
      /* ignore */
    }
  });
}

async function fetchSharedContent({ force = false } = {}) {
  if (!force && Date.now() - lastFetchedAt < CONTENT_TTL && lastFetchedAt > 0) {
    return sharedContent;
  }
  if (inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    try {
      const res = await webDetailsAPI.details();
      const raw = res?.data?.data ?? res?.data;
      if (raw && typeof raw === "object") {
        const merged = mergeContent(raw);
        lastFetchedAt = Date.now();
        try {
          localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(merged));
        } catch {
          /* ignore */
        }
        publishContent(merged);
      }
    } catch {
      /* keep cached/default gracefully */
    } finally {
      inflightRequest = null;
    }
    return sharedContent;
  })();

  return inflightRequest;
}

function ensureGlobalListeners() {
  if (globalListenersAttached || typeof window === "undefined") return;
  globalListenersAttached = true;

  window.addEventListener("site-content-updated", (e) => {
    if (e?.detail) {
      lastFetchedAt = Date.now();
      publishContent(mergeContent(e.detail));
    } else {
      fetchSharedContent({ force: true });
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_CACHE_KEY || e.key === "yashmeen:syncPing") {
      fetchSharedContent({ force: true });
    }
  });

  window.addEventListener("focus", () => {
    fetchSharedContent({ force: false });
  });
}

export function notifyWebsiteContentUpdated(newContent) {
  const merged = newContent ? mergeContent(newContent) : null;
  if (merged) {
    lastFetchedAt = Date.now();
    publishContent(merged);
  }
  try {
    if (merged) {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(merged));
    }
    localStorage.setItem("yashmeen:syncPing", String(Date.now()));
  } catch {
    /* ignore */
  }
  clearProjectsCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("site-content-updated", { detail: merged || newContent }));
  }
}

export default function useWebsiteContent() {
  const [content, setContent] = useState(() => sharedContent);

  const refresh = useCallback(() => fetchSharedContent({ force: true }), []);

  useEffect(() => {
    ensureGlobalListeners();
    subscribers.add(setContent);
    fetchSharedContent({ force: false });
    return () => {
      subscribers.delete(setContent);
    };
  }, []);

  return { content, refresh };
}

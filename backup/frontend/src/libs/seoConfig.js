export const SITE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  "https://yashmeen-fitout.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Yashmeen Future Building & Fit-Out Contracting LLC";
export const DEFAULT_OG_IMAGE = "/static/hero-aperture-v2.webp";

export const ROUTE_SEO = {
  "/": {
    title: "Yashmeen Future Building & Fit-Out Contracting LLC | Dubai",
    description:
      "Turnkey interior architecture, authority approvals, bespoke Al Quoz joinery, and luxury fit-out contracting across Dubai and the UAE.",
    robots: "index, follow",
    image: "/static/hero-aperture-v2.webp",
  },
  "/about": {
    title: "About Our Studio | Yashmeen Fit-Out Dubai",
    description:
      "Discover Yashmeen Future Building: our Business Bay design studio, 35,000 sq. ft. Al Quoz joinery facility, and turnkey UAE fit-out leadership.",
    robots: "index, follow",
    image: "/static/about-us.webp",
  },
  "/projects": {
    title: "Selected Projects | Yashmeen Fit-Out Dubai",
    description:
      "Explore completed residential villas, DIFC corporate headquarters, luxury retail flagships, and architectural joinery commissions across the UAE.",
    robots: "index, follow",
    image: "/static/hero-editorial.webp",
  },
  "/services/architecture": {
    title: "Architecture & Authority Approvals | Yashmeen Fit-Out Dubai",
    description:
      "Concept planning, technical coordination, and expedited Dubai Municipality, Civil Defence, DDA, and developer submissions under one roof.",
    robots: "index, follow",
    image: "/static/hero-aperture-v2.webp",
  },
  "/services/interior-design": {
    title: "Luxury Interior Design & Bespoke Joinery | Yashmeen Fit-Out Dubai",
    description:
      "Editorial interior architecture, stone and timber specification, lighting coordination, and custom millwork fabricated in our Al Quoz atelier.",
    robots: "index, follow",
    image: "/static/studio.jpg",
  },
  "/services/construction": {
    title: "Turnkey Construction & MEP Engineering | Yashmeen Fit-Out Dubai",
    description:
      "Disciplined civil contracting, structural alterations, HVAC, electrical, and testing & commissioning for residential and commercial spaces in Dubai.",
    robots: "index, follow",
    image: "/static/joinery-bay.jpg",
  },
  "/services/office-renovation": {
    title: "Commercial Office Fit-Out & Renovation | Yashmeen Fit-Out Dubai",
    description:
      "Acoustic double-glazed workspaces, executive suites, and modular corporate headquarters delivered across DIFC, Business Bay, and Tecom.",
    robots: "index, follow",
    image: "/static/Office-fit-out.jpg",
  },
  "/photo-gallery": {
    title: "Photo Gallery | Yashmeen Fit-Out Dubai",
    description:
      "Browse interior fit-out photography, custom millwork finishes, and spatial installations crafted across Dubai residences and workplaces.",
    robots: "index, follow",
    image: "/static/work-oh-office.jpg",
  },
  "/video-gallery": {
    title: "Video Gallery & Walkthroughs | Yashmeen Fit-Out Dubai",
    description:
      "Watch project walkthroughs, Al Quoz joinery fabrication reels, and handover tours from Yashmeen Future Building in Dubai.",
    robots: "index, follow",
    image: "/static/production-facility.jpg",
  },
  "/blogs": {
    title: "Architectural Journal & Guides | Yashmeen Fit-Out Dubai",
    description:
      "Read practical guides on Dubai fit-out approvals, bespoke joinery craft, acoustic workplaces, and turnkey project delivery across the UAE.",
    robots: "index, follow",
    image: "/static/design-desk.jpg",
  },
  "/founders-message": {
    title: "Founder's Message | Yashmeen Fit-Out Dubai",
    description:
      "Leadership vision and accountability principles behind Yashmeen Future Building & Fit-Out Contracting LLC in Dubai.",
    robots: "index, follow",
    image: "/static/founder.jpg",
  },
  "/why-us": {
    title: "Why Choose Yashmeen | Turnkey Fit-Out Partner Dubai",
    description:
      "See why developers, founders, and homeowners choose Yashmeen's single-team design, in-house fabrication, and turnkey delivery model.",
    robots: "index, follow",
    image: "/static/why-us.jpg",
  },
  "/faq": {
    title: "Fit-Out & Authority Approvals FAQ | Yashmeen Fit-Out Dubai",
    description:
      "Answers on Dubai Municipality permits, Tecom and DIFC fit-out timelines, Al Quoz joinery lead times, and turnkey handover guarantees.",
    robots: "index, follow",
    image: "/static/studio.jpg",
  },
  "/careers": {
    title: "Careers in Interior Architecture & Fit-Out | Yashmeen Dubai",
    description:
      "Join our Dubai studio and Al Quoz joinery team. View open roles in interior design, site engineering, MEP, and custom cabinetry.",
    robots: "index, follow",
    image: "/static/joinery-bay.jpg",
  },
  "/quote": {
    title: "Request a Project Quotation | Yashmeen Fit-Out Dubai",
    description:
      "Submit your fit-out scope, sector, target budget, and timeline for a structured turnkey quotation from our Business Bay estimation team.",
    robots: "index, follow",
    image: "/static/hero-bg.jpg",
  },
  "/contact": {
    title: "Contact Yashmeen Fit-Out | Business Bay Studio, Dubai",
    description:
      "Reach our Business Bay office or schedule a tour of our 35,000 sq. ft. Al Quoz manufacturing atelier in Dubai.",
    robots: "index, follow",
    image: "/static/studio.jpg",
  },
  "/experience": {
    title: "Atelier Spatial Experience | Yashmeen Fit-Out Dubai",
    description:
      "An interactive editorial exploration of architecture, joinery craftsmanship, and built form across Dubai by Yashmeen Future Building.",
    robots: "index, follow",
    image: "/static/hero-cinematic.jpg",
  },
  "/normal-is-boring": {
    title: "Atelier Spatial Experience | Yashmeen Fit-Out Dubai",
    description:
      "An interactive editorial exploration of architecture, joinery craftsmanship, and built form across Dubai by Yashmeen Future Building.",
    robots: "noindex, follow",
    image: "/static/hero-cinematic.jpg",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Yashmeen Fit-Out Dubai",
    description:
      "How Yashmeen Future Building & Fit-Out Contracting LLC collects, protects, and processes project enquiry and recruitment contact details.",
    robots: "index, follow",
    image: "/static/logo.jpg",
  },
  "/login": {
    title: "Admin Sign In | Yashmeen Fit-Out",
    description: "Authorized portal sign in for Yashmeen Future Building management.",
    robots: "noindex, nofollow",
    image: "/static/logo.jpg",
  },
  "/forgot-password": {
    title: "Reset Password | Yashmeen Fit-Out",
    description: "Request a password recovery link for the Yashmeen management portal.",
    robots: "noindex, nofollow",
    image: "/static/logo.jpg",
  },
  "/svg": {
    title: "Vector Specimen | Yashmeen Fit-Out",
    description: "Internal brand graphic preview.",
    robots: "noindex, nofollow",
    image: "/static/logo.jpg",
  },
  "/parallax-demo": {
    title: "Motion Specimen | Yashmeen Fit-Out",
    description: "Internal architectural motion preview.",
    robots: "noindex, nofollow",
    image: "/static/hero-aperture-v2.webp",
  },
};

export function normalizePathname(pathname = "/") {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function getRouteSeo(pathname = "/") {
  const cleanPath = normalizePathname(pathname);

  if (ROUTE_SEO[cleanPath]) {
    return { ...ROUTE_SEO[cleanPath], canonicalPath: cleanPath };
  }

  if (cleanPath.startsWith("/project/details/")) {
    return {
      title: "Project Case Study | Yashmeen Fit-Out Dubai",
      description:
        "Architectural specifications, scope, and photography from a completed Yashmeen Future Building commission in Dubai.",
      robots: "index, follow",
      image: "/static/hero-editorial.webp",
      canonicalPath: cleanPath,
    };
  }

  if (cleanPath.startsWith("/blog/details/")) {
    return {
      title: "Architectural Article | Yashmeen Fit-Out Dubai",
      description:
        "Insights on interior fit-out execution, joinery detailing, and regulatory approvals in Dubai from Yashmeen Future Building.",
      robots: "index, follow",
      image: "/static/design-desk.jpg",
      canonicalPath: cleanPath,
    };
  }

  if (cleanPath.startsWith("/services/")) {
    const rawSlug = cleanPath.replace("/services/", "").replace(/-/g, " ");
    const formatted = rawSlug.replace(/\b\w/g, (c) => c.toUpperCase()) || "Service";
    return {
      title: `${formatted} | Yashmeen Fit-Out Dubai`,
      description: `${formatted} delivered turnkey across Dubai by Yashmeen Future Building & Fit-Out Contracting LLC.`,
      robots: "index, follow",
      image: DEFAULT_OG_IMAGE,
      canonicalPath: cleanPath,
    };
  }

  if (cleanPath.startsWith("/dashboard")) {
    return {
      title: "Admin Workspace | Yashmeen Fit-Out",
      description: "Internal CMS and lead management console.",
      robots: "noindex, nofollow",
      image: "/static/logo.jpg",
      canonicalPath: cleanPath,
    };
  }

  return {
    title: "Page Not Found | Yashmeen Fit-Out Dubai",
    description:
      "The requested page could not be found. Browse completed projects, services, or contact our Dubai fit-out studio.",
    robots: "noindex, follow",
    image: DEFAULT_OG_IMAGE,
    canonicalPath: cleanPath,
  };
}

export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: SITE_NAME,
  url: SITE_URL,
  image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
  telephone: "+971 54 386 2870",
  email: "info@yfbfitoutcontracting.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bay Square, Building 12, Office G01, Business Bay",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:30",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/yashmeenfuture",
    "https://www.facebook.com/profile.php?id=61595342604561",
    "https://www.youtube.com/@YashmeenFuture",
  ],
};

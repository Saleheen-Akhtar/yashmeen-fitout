import { quoteAPI, enquiryAPI, projectAPI, categoryAPI, webDetailsAPI, itemPath } from '../../../services/api';
import { mergeWebsiteContent } from '../../../../../../shared/siteContent.js';

export const STAGES = [
  { id: "leads", name: "New Leads", badgeClass: "badge-lavender" },
  { id: "feasibility", name: "Feasibility & Costing", badgeClass: "badge-mist" },
  { id: "proposal", name: "Proposal & Quotes", badgeClass: "badge-amber" },
  { id: "construction", name: "In Construction", badgeClass: "badge-brass" },
  { id: "completed", name: "Completed & Handed Over", badgeClass: "badge-sage" },
];

export const SERVICE_IMAGE_PRESETS = [
  { label: "Villa Aperture", value: "/static/hero-aperture-v2.webp" },
  { label: "Al Quoz Atelier", value: "/static/studio.jpg" },
  { label: "Joinery Bay", value: "/static/joinery-bay.jpg" },
  { label: "DIFC Office Fit-Out", value: "/static/Office-fit-out.jpg" },
  { label: "Luxury Residence", value: "/static/hero-editorial.webp" },
  { label: "Showroom Gallery", value: "/static/work-oh-office.jpg" },
];

export const FALLBACK_PROJECT_IMG = "/static/hero-aperture-v2.webp";

export const resolveImage = (img) => {
  if (!img) return FALLBACK_PROJECT_IMG;
  if (/^https?:\/\//i.test(img) || /^\/static\//i.test(img) || /^\/images\//i.test(img)) {
    return img;
  }
  return `${itemPath ?? "/uploads"}/${String(img).replace(/^\/+/, "")}`;
};

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "YA";

export const formatDateShort = (dateStr) => {
  if (!dateStr) return "Recent";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "Recent";
  }
};

export const fetchDashboardBundle = async () => {
  const [qRes, eRes, pRes, cRes, wRes] = await Promise.allSettled([
    quoteAPI.getAll({ limit: 100 }),
    enquiryAPI.getAll(),
    projectAPI.getAll({ limit: 100 }),
    categoryAPI.getAll(),
    webDetailsAPI.adminDetails(),
  ]);

  let mergedWeb = null;
  if (wRes.status === "fulfilled" && wRes.value?.data?.data) {
    mergedWeb = mergeWebsiteContent(wRes.value.data.data);
  }

  return {
    quotes: qRes.status === "fulfilled" ? qRes.value?.data?.data || qRes.value?.data || [] : null,
    enquiries: eRes.status === "fulfilled" ? eRes.value?.data?.data || eRes.value?.data || [] : null,
    projects: pRes.status === "fulfilled" ? pRes.value?.data?.data || [] : null,
    categories: cRes.status === "fulfilled" ? cRes.value?.data?.data || cRes.value?.data || [] : null,
    webDetails: mergedWeb,
  };
};

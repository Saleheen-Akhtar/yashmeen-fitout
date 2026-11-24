import "../../../styles/projects.css";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  FiMaximize,
  FiMaximize2,
  FiMapPin,
  FiTarget,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiLayers,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiTool,
  FiPhoneCall,
  FiAward,
} from "react-icons/fi";
import { projectAPI } from "../../../services/api";
import { resolveMediaUrl, mediaFallback } from "../../../lib/media";
import { categoryLabel } from "../../../lib/mediaLabels";
import { subscribeCacheInvalidation } from "../../../lib/publicCache";
import { getPrerenderData, getPrerenderProject } from "../../../lib/prerenderData";
import { SITE_NAME, SITE_URL } from "../../../lib/seoConfig";
import useDialogFocus from "../../../hooks/useDialogFocus";

const hideBrokenProjectImage = mediaFallback;

/* ---------------- helpers: map whatever the API returns ---------------- */

// Absolute / local static URLs are used as-is; stored paths are resolved via itemPath
const photoUrl = resolveMediaUrl;

const LIST_KEYS = ["data", "items", "results", "docs", "rows", "records", "projects"];
const toList = (res) => {
  const body = res?.data;
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];
  for (const k of LIST_KEYS) {
    const v = body[k];
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const k2 of LIST_KEYS) if (Array.isArray(v[k2])) return v[k2];
    }
  }
  return Object.values(body).find(Array.isArray) ?? [];
};

const getId = (x) => x?._id ?? x?.id ?? x?.ID;

let allProjectsCache = null;
async function fetchAllProjectsForNavigation() {
  if (allProjectsCache && allProjectsCache.length > 0) return allProjectsCache;
  const prerendered = getPrerenderData().projects;
  if (Array.isArray(prerendered) && prerendered.length > 0) {
    allProjectsCache = prerendered;
    return allProjectsCache;
  }
  try {
    const res = await projectAPI.getAll({ limit: 100 });
    const list = toList(res);
    if (Array.isArray(list) && list.length > 0) {
      allProjectsCache = list;
    }
  } catch {
    /* ignore */
  }
  return allProjectsCache || [];
}

function formatArchitecturalStory(rawDesc, title, categoryName) {
  const cat = (categoryName || "").toLowerCase();
  const t = (title || "").toLowerCase();
  const raw = String(rawDesc || "").trim();

  // Strip hashtags, informal emojis, and URLs
  const sanitized = raw
    .replace(/#[a-zA-Z0-9_]+/g, "")
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/(?:https?|ftp):\/\/[\S\n]+/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .trim();

  const isPetition =
    sanitized.toLowerCase().includes("darkness takes over") ||
    sanitized.toLowerCase().includes("safety should be a priority") ||
    sanitized.toLowerCase().includes("we request the local");

  if (isPetition) {
    return [
      "Commissioned to deliver comprehensive exterior illumination and safety infrastructure, this project addressed critical pedestrian visibility and vehicle transit requirements along the designated corridor.",
      "Our civil and electrical engineering team installed heavy-duty architectural luminaires, precision-engineered optical distribution heads, and weather-sealed underground conduit networks compliant with local municipal and utility codes."
    ];
  }

  const paragraphs = sanitized
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 25);

  if (paragraphs.length >= 2) {
    return paragraphs.map((p) => p.replace(/[\u2013\u2014]/g, "-"));
  }

  if (paragraphs.length === 1 && paragraphs[0].length > 70) {
    const p1 = paragraphs[0].replace(/[\u2013\u2014]/g, "-");
    let p2 = "Every structural interface, concealed service route, and custom finish was coordinated in-house by Yashmeen, delivering turnkey architectural fit-out and joinery crafted to millimeter tolerances.";
    if (cat.includes("joinery") || cat.includes("carpenter") || t.includes("tv wall") || t.includes("panel")) {
      p2 = "Engineered with integrated cable management, acoustic fluted timber battens, and warm ambient LED reveals, the bespoke unit delivers both architectural grandeur and practical utility.";
    } else if (cat.includes("kitchen")) {
      p2 = "Customized with moisture-resistant marine core substrates, soft-closing European mechanisms, and heat-resistant quartz surfaces, the installation balances culinary workflow with timeless aesthetics.";
    } else if (cat.includes("gypsum") || cat.includes("decor") || cat.includes("ceiling")) {
      p2 = "Executed with laser-aligned drywall perimeters, flush architectural shadow reveals, and seamless acoustic plasterboard, the finishes provide an immaculate foundation for indirect lighting.";
    }
    return [p1, p2];
  }

  if (cat.includes("joinery") || cat.includes("carpenter") || t.includes("tv wall") || t.includes("panel")) {
    return [
      "Designed as a focal architectural feature within the residence, this bespoke joinery installation balances clean geometric proportions with warm textural layering.",
      "Our atelier craftsmen integrated vertical fluted acoustic profiles, book-matched composite surfaces, and recessed warm 3000K LED illumination with complete concealment of power and audiovisual infrastructure."
    ];
  }

  if (cat.includes("kitchen")) {
    return [
      "A bespoke culinary fit-out tailored to maximize spatial ergonomics, clean storage volumes, and seamless appliance integration.",
      "Engineered with marine-grade moisture-resistant carcase substrates, anti-scratch matte lacquers, and hard-wearing composite quartz worktops installed to exacting standards."
    ];
  }

  if (cat.includes("gypsum") || cat.includes("ceiling") || cat.includes("decor")) {
    return [
      "A sophisticated architectural ceiling and wall contouring project executed with precision plasterboard craftsmanship and integrated lighting coves.",
      "Featuring 10mm negative shadow lines, reinforced acoustic partition systems, and Level-5 skim-coated mineral finishes that provide clean, monolithic planes."
    ];
  }

  if (cat.includes("electrical") || cat.includes("mep") || t.includes("light") || t.includes("dewa")) {
    return [
      "An infrastructure and engineering delivery addressing high-efficiency power distribution, civil trenching, and architectural illumination.",
      "Executed to stringent DEWA and civil safety regulations with armored XLPE cabling, weather-resistant IP65 distribution enclosures, and automated dusk-to-dawn controls."
    ];
  }

  return [
    "Demonstrating turnkey interior fit-out craftsmanship, this project was executed from initial conceptual drafting through to fine fabrication and handover.",
    "Our multidisciplinary team coordinated spatial planning, bespoke joinery, and specialized finishes to deliver a cohesive, refined architectural environment."
  ];
}

function getExecutionPillars(categoryName, title) {
  const cat = (categoryName || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (cat.includes("joinery") || cat.includes("carpenter") || t.includes("tv wall") || t.includes("wood") || t.includes("panel")) {
    return [
      {
        phase: "Phase 01",
        title: "Spatial CAD & Elevation Drafting",
        desc: "Millimeter-accurate shop drawings establishing sightlines, recessed clearances, and concealed cable routes.",
        tag: "Precision CAD Modeling"
      },
      {
        phase: "Phase 02",
        title: "Atelier Joinery & Fluted Milling",
        desc: "In-house CNC milling of vertical fluted timber battens, book-matched composite cladding, and mitred storage reveals.",
        tag: "Custom Woodwork & Cladding"
      },
      {
        phase: "Phase 03",
        title: "Indirect Illumination & Turnkey Fit",
        desc: "Integration of warm 3000K indirect LED cove lighting, flush faceplate mounting, and flawless touch-latch hardware.",
        tag: "Turnkey Installation"
      }
    ];
  }

  if (cat.includes("kitchen") || cat.includes("bathroom") || t.includes("bath") || t.includes("kitchen")) {
    return [
      {
        phase: "Phase 01",
        title: "Ergonomic Layout & Service Routing",
        desc: "Spatial optimization of the work triangle, primary drainage runs, and dedicated circuit allocations.",
        tag: "MEP & Ergonomics"
      },
      {
        phase: "Phase 02",
        title: "Marine Substrates & CNC Cabinetry",
        desc: "High-grade moisture resistant carcase fabrication with soft-close mechanisms and non-porous quartz surfaces.",
        tag: "Marine Substrates"
      },
      {
        phase: "Phase 03",
        title: "Sealing, Snagging & Commissioning",
        desc: "Precision silicone reveals, appliance flush fitting, and pressure-tested plumbing handover.",
        tag: "Turnkey Commissioning"
      }
    ];
  }

  if (cat.includes("electrical") || cat.includes("mep") || t.includes("light") || t.includes("dewa")) {
    return [
      {
        phase: "Phase 01",
        title: "Load Calculation & Schematic Design",
        desc: "Comprehensive photometric calculations, single-line diagrams, and civil trenching plans compliant with DEWA standards.",
        tag: "Engineering Schematics"
      },
      {
        phase: "Phase 02",
        title: "Armored Conduit & Heavy-Duty Cabling",
        desc: "Installation of UV-resistant conduit pathways, low-loss armored XLPE cabling, and weatherproof IP65 junction enclosures.",
        tag: "DEWA Certified Infrastructure"
      },
      {
        phase: "Phase 03",
        title: "Lux Verification & Safe Commissioning",
        desc: "On-site photometric lux-level testing, automated sensor calibration, and full municipal compliance sign-off.",
        tag: "Safety & Energization"
      }
    ];
  }

  return [
    {
      phase: "Phase 01",
      title: "Site Survey & 3D Spatial Modeling",
      desc: "Comprehensive laser-measured site survey establishing structural boundaries, MEP access points, and material approvals.",
      tag: "Site Survey & Prototyping"
    },
    {
      phase: "Phase 02",
      title: "Structural Partitioning & Joinery",
      desc: "Class-A drywall perimeter alignments, acoustic insulation installation, and custom in-house joinery fabrication.",
      tag: "Atelier Fabrication"
    },
    {
      phase: "Phase 03",
      title: "Fine Surface Skim & Turnkey Handover",
      desc: "Level-5 skim coating, zero-VOC mineral paint finishing, and pre-handover white-glove quality inspection.",
      tag: "White-Glove Handover"
    }
  ];
}

function getContextStandards(categoryName, title) {
  const cat = (categoryName || "").toLowerCase();
  const t = (title || "").toLowerCase();

  if (cat.includes("joinery") || cat.includes("carpenter") || t.includes("tv wall") || t.includes("wood") || t.includes("panel")) {
    return "Bespoke Millwork & Atelier Joinery Standards";
  }
  if (cat.includes("kitchen") || cat.includes("bathroom")) {
    return "Moisture-Resistant Marine Substrates & European Hardware";
  }
  if (cat.includes("gypsum") || cat.includes("ceiling") || cat.includes("decor")) {
    return "Class-A Fire-Rated Drywall & 10mm Reveal Standards";
  }
  if (cat.includes("electrical") || cat.includes("mep") || t.includes("light") || t.includes("dewa")) {
    return "DEWA & Dubai Civil Defence Electrical Standards";
  }
  return "Dubai Municipality Code & Civil Compliance";
}

// Works with `{ data: { data: {...} } }`, `{ data: {...} }` and `{ data: { project: {...} } }`
const toProject = (res) => {
  let body = res?.data;
  for (const k of ["data", "project", "item", "result", "record"]) {
    if (body && typeof body === "object" && !Array.isArray(body) && body[k] && typeof body[k] === "object") {
      body = body[k];
    }
  }
  if (Array.isArray(body)) body = body[0];
  return body && typeof body === "object" ? body : null;
};

const pick = (obj, keys) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
};

// Collects every photo from photo / image / images / photos / gallery ... (string, array, or objects)
const getImages = (p) => {
  const out = [];
  const add = (v) => {
    if (!v) return;
    if (Array.isArray(v)) return v.forEach(add);
    if (typeof v === "object") return add(v.url ?? v.path ?? v.src ?? v.file ?? v.photo ?? v.image);
    if (typeof v === "string") out.push(photoUrl(v.trim()));
  };
  ["photo", "image", "img", "thumbnail", "images", "photos", "gallery", "galleryImages", "files"].forEach((k) =>
    add(p?.[k])
  );
  return [...new Set(out)];
};

const getYouTubeId = (url = "") => {
  const m = String(url).match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})(?![\w-])/
  );
  return m ? m[1] : null;
};

/* ---------------- cache layer ----------------
   Goal: projectAPI.getById runs ONLY when the data has changed on the server.

   1. Each project is cached (memory + localStorage) together with the
      server "data version" it was fetched with.
   2. Opening the page again shows the cached project instantly (no spinner).
   3. A tiny version request (projectAPI.getVersion) asks the server whether
      anything changed. Same version -> keep the cache, skip getById.
      Different version -> fetch the project again and update the cache.
   4. The version request is throttled (VERSION_CHECK_INTERVAL), so quickly
      opening several projects sends it at most once per minute.
   5. If the version endpoint is missing or fails, a timer (CACHE_TTL) is used.
   6. Missing / empty projects are never cached.
----------------------------------------------- */
const CACHE_PREFIX = "projectdetails:v1:";
const CACHE_TTL = 10 * 60 * 1000; // fallback only: used when no version endpoint works
const VERSION_CHECK_INTERVAL = 60 * 1000; // ask the server at most once per minute

const memoryCache = new Map(); // projectId -> { project, version, savedAt }
const inflight = new Map(); // projectId -> Promise (de-dupes simultaneous requests)
let lastVersionCheck = 0;
let lastServerVersion; // result of the most recent version request

function readCache(id) {
  const key = String(id);
  const prerendered = getPrerenderProject(key);
  if (prerendered) return { project: prerendered, version: "prerender", savedAt: Date.now() };
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) {
      memoryCache.delete(key);
      return null;
    }
    if (memoryCache.has(key)) return memoryCache.get(key);
    const entry = JSON.parse(raw);
    if (entry?.project) {
      memoryCache.set(key, entry);
      return entry;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeCache(id, project, version) {
  const key = String(id);
  const entry = { project, version, savedAt: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* ignore (storage full / disabled) */
  }
}

// Clear cache entries when triggered via admin invalidation
function clearProjectDetailsCache(id) {
  lastVersionCheck = 0;
  lastServerVersion = undefined;
  try {
    if (id !== undefined) {
      memoryCache.delete(String(id));
      localStorage.removeItem(CACHE_PREFIX + String(id));
      return;
    }
    memoryCache.clear();
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

// Returns the server data version, or undefined if it cannot be read
async function fetchServerVersion() {
  if (typeof projectAPI.getVersion !== "function") return undefined;
  try {
    const res = await projectAPI.getVersion();
    const v = res?.data?.version ?? res?.data?.data?.version;
    return v === undefined || v === null ? undefined : String(v);
  } catch (err) {
    console.warn("Project version check failed, using timer cache:", err);
    return undefined;
  }
}

function fetchProject(id, version) {
  const key = String(id);
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    const res = await projectAPI.getById(id);
    const data = toProject(res);
    if (data) writeCache(id, data, version); // only cache real data
    return data;
  })().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, p);
  return p;
}

async function resolveProjectDetail(projectId, force = false) {
  const cached = force ? null : readCache(projectId);
  try {
    const checkedRecently = !force && Date.now() - lastVersionCheck < VERSION_CHECK_INTERVAL;

    if (cached && checkedRecently) {
      return { skipped: true, hasCache: true };
    }

    let serverVersion;
    if (checkedRecently) {
      serverVersion = lastServerVersion;
    } else {
      serverVersion = await fetchServerVersion();
      lastServerVersion = serverVersion;
      lastVersionCheck = Date.now();
    }

    if (cached) {
      const versionKnown = serverVersion !== undefined;
      const upToDate = versionKnown
        ? cached.version === serverVersion
        : Date.now() - cached.savedAt < CACHE_TTL;
      if (upToDate) return { skipped: true, hasCache: true };
    }

    const data = await fetchProject(projectId, serverVersion);
    return { skipped: false, data, hasCache: !!cached };
  } catch (err) {
    err.hasCache = !!cached;
    throw err;
  }
}

export default function ProjectDetailsPage() {


  const { projectId } = useParams();
  return <ProjectDetailsInner key={projectId} projectId={projectId} />;
}

function ProjectDetailsInner({ projectId }) {
  const location = useLocation();
  const initial = readCache(projectId);
  const [project, setProject] = useState(initial?.project ?? null);
  const [loading, setLoading] = useState(!initial); // no spinner if cache exists
  const [error, setError] = useState("");

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const lightboxRef = useRef(null);
  useDialogFocus(lightbox !== null, lightboxRef);

  const startFetch = useCallback(
    (force = false) => {
      let cancelled = false;
      resolveProjectDetail(projectId, force)
        .then((res) => {
          if (cancelled || res.skipped) return;
          if (!res.data) {
            setProject(null);
            setError("The requested architectural case study could not be found.");
          } else {
            setProject(res.data);
            setError("");
          }
        })
        .catch((err) => {
          console.error("Project load failed:", err);
          if (!cancelled && !err?.hasCache) {
            setProject(null);
            setError("The requested architectural case study could not be found.");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    },
    [projectId],
  );

  /* ---------- load the project (cache first, API only if data changed) ---------- */
  useEffect(() => {
    window.scrollTo?.(0, 0);
    let cancel = startFetch(false);

    const handleSync = () => {
      clearProjectDetailsCache(projectId);
      cancel?.();
      cancel = startFetch(true);
    };
    const unsubscribe = subscribeCacheInvalidation((scope, id) => {
      if (
        (scope === "projects" || scope === "project-details") &&
        (!id || String(id) === String(projectId))
      ) {
        handleSync();
      }
    });
    const onStorage = (e) => {
      if (!e.key || e.key === CACHE_PREFIX + String(projectId)) handleSync();
    };
    window.addEventListener("projects-updated", handleSync);
    window.addEventListener("storage", onStorage);

    return () => {
      cancel?.();
      unsubscribe();
      window.removeEventListener("projects-updated", handleSync);
      window.removeEventListener("storage", onStorage);
    };
  }, [projectId, startFetch]);

  /* ---------- SEO metadata override per project / not-found ---------- */
  useEffect(() => {
    if (loading) return;
    if (error || !project) {
      window.dispatchEvent(
        new CustomEvent("seo-update", {
          detail: {
            pathname: location.pathname,
            title: "Project Not Found | Yashmeen Fit-Out Dubai",
            description:
              "The requested architectural case study could not be found. Browse completed projects by Yashmeen Future Building in Dubai.",
            robots: "noindex, follow",
          },
        }),
      );
      return;
    }

    const projectTitle =
      pick(project, ["title", "name", "projectName", "project_name"]) || "Project Case Study";
    const desc =
      pick(project, ["description", "summary", "scope"]) ||
      `Architectural specifications and fit-out execution for ${projectTitle} in Dubai by Yashmeen Future Building.`;
    const heroImg = getImages(project)[0] || "/static/hero-editorial.webp";
    const absoluteHeroImg = /^https?:\/\//i.test(heroImg)
      ? heroImg
      : `${SITE_URL}${heroImg.startsWith("/") ? "" : "/"}${heroImg}`;
    const description = String(desc).replace(/\s+/g, " ").trim().slice(0, 160);
    window.dispatchEvent(
      new CustomEvent("seo-update", {
        detail: {
          pathname: location.pathname,
          title: `${projectTitle} | Yashmeen Fit-Out Dubai`,
          description,
          image: heroImg,
          robots: "index, follow",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: projectTitle,
            description,
            image: [absoluteHeroImg],
            url: `${SITE_URL}${location.pathname}`,
            creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
        },
      }),
    );
  }, [loading, error, project, location.pathname]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent("seo-update", { detail: null }));
    };
  }, []);

  /* ---------- derived data ---------- */
  const [allProjects, setAllProjects] = useState(() => allProjectsCache || getPrerenderData().projects || []);

  useEffect(() => {
    if (!allProjects.length) {
      fetchAllProjectsForNavigation().then((list) => {
        if (list && list.length) setAllProjects(list);
      });
    }
  }, [allProjects.length]);

  const images = useMemo(() => (project ? getImages(project) : []), [project]);
  const title = project ? pick(project, ["title", "name", "projectName", "project_name"]) : "";
  const videoId = project
    ? getYouTubeId(pick(project, ["youtubeUrl", "youtube_url", "youtube", "videoUrl", "video_url", "video", "videoLink", "link"]))
    : null;

  const rawCategory = typeof project?.categoryId === "object"
    ? (project.categoryId.categoryName || project.categoryId.name || "")
    : (project?.category || project?.categoryName || "");
  const categoryName = categoryLabel(rawCategory) || "Selected Project";

  const locationVal = pick(project, ["location", "city", "address"]) || "Dubai, UAE";
  const scopeVal = pick(project, ["scope", "scopeOfWork", "scope_of_work"]) || "Design & Build";
  const sectorVal = pick(project, ["sector", "type", "projectType", "industry"]);
  const durationVal = pick(project, ["duration", "timeline"]);

  const rawSize = pick(project, ["size", "area", "projectSize"]);
  const isValidSize = rawSize && !["0", "0.0", "0.000", "0.00", "none", "n/a"].includes(String(rawSize).trim().toLowerCase());
  const sizeVal = isValidSize
    ? (/^\d+$/.test(String(rawSize).trim()) ? `${rawSize} sq. ft.` : String(rawSize))
    : null;

  const rawDesc = pick(project, ["description", "summary", "details"]);
  const descriptionParagraphs = useMemo(
    () => formatArchitecturalStory(rawDesc, title, categoryName),
    [rawDesc, title, categoryName]
  );

  const executionPillars = useMemo(
    () => getExecutionPillars(categoryName, title),
    [categoryName, title]
  );

  const standardsVal = useMemo(
    () => getContextStandards(categoryName, title),
    [categoryName, title]
  );

  const specs = [
    sectorVal && { icon: FiLayers, label: "Sector / Space", value: sectorVal },
    locationVal && { icon: FiMapPin, label: "Location", value: locationVal },
    scopeVal && { icon: FiTarget, label: "Scope of Work", value: scopeVal },
    sizeVal && { icon: FiMaximize, label: "Footprint / Area", value: sizeVal },
    durationVal && { icon: FiCalendar, label: "Project Duration", value: durationVal },
    { icon: FiShield, label: "Standards", value: standardsVal },
  ].filter(Boolean);

  const count = images.length;

  const goPrev = () => setActive((i) => (count ? (i - 1 + count) % count : 0));
  const goNext = () => setActive((i) => (count ? (i + 1) % count : 0));

  const openEnquiry = () => {
    window.dispatchEvent(new CustomEvent("open-questionnaire"));
  };

  // Materials & Craftsmanship Palette
  const materials = useMemo(() => {
    const cat = categoryName.toLowerCase();
    if (cat.includes("electrical") || cat.includes("mep")) {
      return [
        { kicker: "Optical Engineering", name: "High-CRI Architectural LED Modules", desc: "Low-glare precision optics with uniform lumen distribution." },
        { kicker: "Protection Standard", name: "IP65 Weatherproof Enclosures", desc: "Heavy-duty UV-stabilized housings engineered for extreme UAE ambient heat." },
        { kicker: "Power Infrastructure", name: "Armored Low-Loss Cabling", desc: "Flame-retardant cabling laid to DEWA and civil safety specifications." },
        { kicker: "Smart Control", name: "DALI & Dusk-to-Dawn Automation", desc: "Intelligent photocell and timer switching for optimized energy lifecycle." },
      ];
    }
    if (cat.includes("joinery") || cat.includes("carpenter")) {
      return [
        { kicker: "Timber & Millwork", name: "Grade-A Natural Hardwoods & Veneers", desc: "Precision CNC milled joints and seamless book-matched grain alignments." },
        { kicker: "Hardware Specs", name: "Concealed Soft-Close Mechanisms", desc: "Austrian architectural hardware mechanisms tested to 200,000 cycles." },
        { kicker: "Surface Treatment", name: "Anti-Fingerprint Matte Polyurethane", desc: "Moisture-resistant, scratch-proof Italian lacquers." },
        { kicker: "Structural Infill", name: "Moisture-Resistant Class E1 Core", desc: "Low-emission, sustainable substrate compliant with green building codes." },
      ];
    }
    if (cat.includes("gypsum") || cat.includes("decor")) {
      return [
        { kicker: "Ceiling & Partitions", name: "Moisture & Fire-Rated Drywall Boards", desc: "Class A acoustic plasterboard with reinforced taped seams." },
        { kicker: "Architectural Lighting", name: "Recessed Plaster-In Trimless Profiles", desc: "Seamless shadow gaps and hidden ambient cove illumination." },
        { kicker: "Detailing", name: "Laser-Aligned Architectural Reveals", desc: "Subtle 10mm negative reveals around door frames and skirting perimeters." },
        { kicker: "Finishing & Coating", name: "Zero-VOC Breathable Mineral Emulsions", desc: "Level 5 skim coat with anti-fungal formulation." },
      ];
    }
    return [
      { kicker: "Turnkey Execution", name: "Architectural Grade Custom Substrates", desc: "Precision fabrication assembled to tolerance thresholds under 1.5mm." },
      { kicker: "Surface & Texture", name: "High-Durability Commercial Finishes", desc: "Stain-resistant and flame-retardant architectural grade surfaces." },
      { kicker: "MEP & Services", name: "Fully Integrated Concealed Services", desc: "Concealed ducting, power runs, and access points hidden within millwork." },
      { kicker: "Handover Quality", name: "Quality Assured Handover Standard", desc: "Pre-handover snag inspection and Dubai civil compliance certification." },
    ];
  }, [categoryName]);

  // Paired plates for curated photographic study
  const studyPairs = useMemo(() => {
    if (images.length <= 2) return [];
    const remaining = images.slice(2);
    const pairs = [];
    for (let i = 0; i < remaining.length; i += 2) {
      pairs.push({
        first: { src: remaining[i], idx: i + 2 },
        second: remaining[i + 1] ? { src: remaining[i + 1], idx: i + 3 } : null,
      });
    }
    return pairs;
  }, [images]);

  // Previous & Next Project Navigation Deck
  const currentIndex = allProjects.findIndex((p) => String(getId(p)) === String(projectId));
  const prevProject = currentIndex > 0
    ? allProjects[currentIndex - 1]
    : allProjects.length > 1 ? allProjects[allProjects.length - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1
    ? allProjects[currentIndex + 1]
    : allProjects.length > 1 ? allProjects[0] : null;

  const closeBox = useCallback(() => setLightbox(null), []);
  const boxPrev = useCallback(
    () => setLightbox((i) => (i === null || !count ? i : (i - 1 + count) % count)),
    [count]
  );
  const boxNext = useCallback(
    () => setLightbox((i) => (i === null || !count ? i : (i + 1) % count)),
    [count]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeBox();
      if (e.key === "ArrowLeft") boxPrev();
      if (e.key === "ArrowRight") boxNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, closeBox, boxPrev, boxNext]);

  return (
    <div className="pd-page">
      {loading ? (
        <div className="pd-status">
          <p>Loading project case study...</p>
        </div>
      ) : error || !project ? (
        <section className="pd-status">
          <div className="pd-nf-card">
            <p className="pd-nf-kicker">Case Study Unavailable</p>
            <h1 className="pd-nf-title">Project Not Found</h1>
            <p className="pd-nf-copy">
              {error || "This architectural project could not be located or may have been archived."}
            </p>
            <div className="pd-nf-actions">
              <Link to="/projects" className="pd-nf-primary">
                Browse Selected Work
              </Link>
              <Link to="/contact" className="pd-nf-secondary">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <>
          <div className="pd-container wrap">
            {/* Top Navigation Bar / Breadcrumbs */}
            <div className="pd-nav-bar">
              <nav className="pd-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/" className="pd-breadcrumb-link">Home</Link>
                <span className="pd-breadcrumb-sep">/</span>
                <Link to="/projects" className="pd-breadcrumb-link">Projects</Link>
                {categoryName && (
                  <>
                    <span className="pd-breadcrumb-sep">/</span>
                    <span className="pd-breadcrumb-current">{categoryName}</span>
                  </>
                )}
              </nav>

              <Link to="/projects" className="pd-back-link">
                <FiArrowLeft size={15} /> All Projects
              </Link>
            </div>

            {/* Case Study Header */}
            <header className="pd-header">
              <span className="eyebrow">{categoryName}</span>
              <h1 className="pd-title">{title}</h1>

              <div className="pd-header-meta">
                {sectorVal && (
                  <div className="pd-header-meta-item">
                    <span className="pd-header-meta-label">Sector</span>
                    <span className="pd-header-meta-value">{sectorVal}</span>
                  </div>
                )}
                {locationVal && (
                  <div className="pd-header-meta-item">
                    <span className="pd-header-meta-label">Location</span>
                    <span className="pd-header-meta-value">{locationVal}</span>
                  </div>
                )}
                {scopeVal && (
                  <div className="pd-header-meta-item">
                    <span className="pd-header-meta-label">Scope</span>
                    <span className="pd-header-meta-value">{scopeVal}</span>
                  </div>
                )}
                {sizeVal && (
                  <div className="pd-header-meta-item">
                    <span className="pd-header-meta-label">Footprint</span>
                    <span className="pd-header-meta-value">{sizeVal}</span>
                  </div>
                )}
                <div className="pd-header-meta-item">
                  <span className="pd-header-meta-label">Atelier Ref</span>
                  <span className="pd-header-meta-value">DXB-YFB-{String(projectId).slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </header>

            {/* Main Architectural Hero Stage */}
            {count > 0 ? (
              <section className="pd-viewer-section" aria-label="Project Gallery">
                <div className="pd-stage-frame">
                  <img
                    className="pd-stage-img"
                    src={images[active] ?? images[0]}
                    alt={`${title}, plate ${active + 1}`}
                    onError={hideBrokenProjectImage}
                  />

                  <button
                    type="button"
                    className="pd-stage-expand"
                    aria-label="Expand full screen image"
                    onClick={() => setLightbox(active)}
                  >
                    <FiMaximize2 size={14} />
                    <span>View Fullscreen</span>
                  </button>

                  <div className="pd-stage-floating-bar">
                    <div className="pd-stage-counter-pill">
                      <span>PLATE {String(active + 1).padStart(2, "0")}</span>
                      <span className="pd-stage-counter-sep">/</span>
                      <span>{String(count).padStart(2, "0")}</span>
                    </div>

                    {count > 1 && (
                      <div className="pd-stage-nav-group">
                        <button
                          type="button"
                          className="pd-stage-nav-btn"
                          aria-label="Previous plate"
                          onClick={goPrev}
                        >
                          <FiChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          className="pd-stage-nav-btn"
                          aria-label="Next plate"
                          onClick={goNext}
                        >
                          <FiChevronRight size={16} />
                        </button>
                        <button
                          type="button"
                          className="pd-stage-gallery-trigger"
                          onClick={() => setLightbox(active)}
                        >
                          <FiLayers size={13} />
                          <span>All Plates ({count})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {count > 1 && (
                  <div className="pd-stage-subbar">
                    <div className="pd-stage-caption">
                      <span className="pd-stage-caption-lead">Plate {String(active + 1).padStart(2, "0")}:</span>
                      <span>
                        {active === 0
                          ? "Architectural overview and ambient spatial harmony"
                          : active === 1
                          ? "Technical elevation and shop drawing alignment"
                          : "Material interfaces, fluting, and joinery details"}
                      </span>
                    </div>

                    <div className="pd-stage-num-strip" role="tablist" aria-label="Quick plate navigation">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          role="tab"
                          aria-selected={i === active}
                          className={`pd-stage-num-btn ${i === active ? "is-active" : ""}`}
                          onClick={() => setActive(i)}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ) : (
              <div className="project-media-unavailable" role="status">
                Project media is currently being archived.
              </div>
            )}

            {/* Asymmetric Two-Column Editorial Grid with Sticky Sidebar */}
            <div className="pd-content-row">
              {/* Left Column: Main Stream */}
              <div className="pd-main-stream">
                {/* 1. Spatial Brief & Design Concept */}
                <span className="eyebrow">The Spatial Brief</span>
                <h2 className="pd-narrative-title">Concept & Architectural Scope</h2>
                <div className="pd-narrative-body">
                  {descriptionParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* 2. Three-Phase Execution Methodology */}
                <section className="pd-pillars-section" aria-label="Scope and Execution Methodology">
                  <span className="eyebrow">Execution Methodology</span>
                  <h3 className="pd-narrative-title">Spatial Engineering & Scope Breakdown</h3>
                  <p className="pd-narrative-body" style={{ marginBottom: "20px" }}>
                    Every architectural intervention follows our rigorous three-phase atelier workflow from initial spatial drafting to final snag-free handover.
                  </p>

                  <div className="pd-pillars-grid">
                    {executionPillars.map((pillar) => (
                      <div key={pillar.phase} className="pd-pillar-card">
                        <span className="pd-pillar-index">{pillar.phase.slice(-2)}</span>
                        <span className="pd-pillar-badge">{pillar.phase}</span>
                        <h4 className="pd-pillar-title">{pillar.title}</h4>
                        <p className="pd-pillar-desc">{pillar.desc}</p>
                        <div className="pd-pillar-tag">{pillar.tag}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Materials, Finishes & Craftsmanship Palette */}
                <section className="pd-materials-section">
                  <span className="eyebrow">Craftsmanship & Materiality</span>
                  <h3 className="pd-narrative-title" style={{ margin: "0 0 8px" }}>
                    Engineered Materials & Specifications
                  </h3>
                  <p className="pd-narrative-body" style={{ fontSize: "14.5px", marginBottom: "0" }}>
                    Components and finishes specified for this project adhere to rigorous environmental and architectural standards.
                  </p>

                  <div className="pd-materials-grid">
                    {materials.map((mat) => (
                      <div key={mat.name} className="pd-material-card">
                        <div className="pd-material-kicker">{mat.kicker}</div>
                        <div className="pd-material-name">{mat.name}</div>
                        <p className="pd-material-desc">{mat.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pd-authorities-strip">
                    <span className="pd-authority-badge">
                      <FiCheckCircle size={13} /> {standardsVal}
                    </span>
                    <span className="pd-authority-badge">
                      <FiAward size={13} /> Quality Assured Delivery
                    </span>
                    <span className="pd-authority-badge">
                      <FiShield size={13} /> ISO 9001:2015 Process
                    </span>
                    <span className="pd-authority-badge">
                      <FiTool size={13} /> Snag-Free Guarantee
                    </span>
                  </div>
                </section>

                {/* 4. Curated Photographic Study */}
                {count > 1 && (
                  <section className="pd-study-section" aria-label="Curated Photographic Study">
                    <span className="eyebrow">Architectural Study</span>
                    <h3 className="pd-narrative-title">Spatial Perspectives & Detail Studies</h3>
                    <p className="pd-narrative-body" style={{ marginBottom: "20px" }}>
                      Examine drawings, elevation profiles, and finished surface alignments. Select any plate to inspect in high resolution.
                    </p>

                    <div className="pd-study-grid">
                      {/* Featured Lead Plate (Plate 02) */}
                      {images[1] && (
                        <div className="pd-study-card is-wide" onClick={() => setLightbox(1)}>
                          <img
                            src={images[1]}
                            alt={`${title} study plate 02`}
                            loading="lazy"
                            onError={hideBrokenProjectImage}
                          />
                          <div className="pd-study-overlay">
                            <span className="pd-study-pill">
                              <FiLayers size={13} />
                              <span>Plate 02 // Spatial Perspective</span>
                            </span>
                            <span className="pd-study-zoom-btn">
                              <FiMaximize2 size={12} />
                              <span>Inspect Plate</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Paired Diptych Studies (Plates 03+) */}
                      {studyPairs.map((pair, pIdx) => (
                        <div key={pIdx} className="pd-study-diptych">
                          <div className="pd-study-card is-diptych" onClick={() => setLightbox(pair.first.idx)}>
                            <img
                              src={pair.first.src}
                              alt={`${title} plate ${pair.first.idx + 1}`}
                              loading="lazy"
                              onError={hideBrokenProjectImage}
                            />
                            <div className="pd-study-overlay">
                              <span className="pd-study-pill">
                                <span>Plate {String(pair.first.idx + 1).padStart(2, "0")}</span>
                              </span>
                              <span className="pd-study-zoom-btn">
                                <FiMaximize2 size={12} />
                              </span>
                            </div>
                          </div>

                          {pair.second && (
                            <div className="pd-study-card is-diptych" onClick={() => setLightbox(pair.second.idx)}>
                              <img
                                src={pair.second.src}
                                alt={`${title} plate ${pair.second.idx + 1}`}
                                loading="lazy"
                                onError={hideBrokenProjectImage}
                              />
                              <div className="pd-study-overlay">
                                <span className="pd-study-pill">
                                  <span>Plate {String(pair.second.idx + 1).padStart(2, "0")}</span>
                                </span>
                                <span className="pd-study-zoom-btn">
                                  <FiMaximize2 size={12} />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Project Video (if available) */}
                {videoId && (
                  <section className="pd-video-section">
                    <span className="eyebrow">Visual Documentation</span>
                    <h3 className="pd-narrative-title">On-Site Video Footage</h3>
                    <div className="pd-video-frame">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                        title={`${title} video`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Sticky Architectural Sidebar */}
              <div className="pd-sticky-sidebar-col">
                <aside className="pd-sticky-sidebar" aria-label="Project Specifications">
                  <div className="pd-specs-card">
                    {/* Architectural CAD Reference */}
                    <div className="pd-cad-meta">
                      <span>ATELIER SPEC // DXB-YFB-{String(projectId).slice(-6).toUpperCase()}</span>
                      <span className="pd-cad-crosshair">+</span>
                    </div>

                    <h3 className="pd-specs-title">Project Data Sheet</h3>

                    <div className="pd-spec-list">
                      {specs.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="pd-spec-item">
                          <div className="pd-spec-icon">
                            <Icon size={16} aria-hidden="true" />
                          </div>
                          <div className="pd-spec-meta">
                            <span className="pd-spec-label">{label}</span>
                            <span className="pd-spec-value">{String(value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pd-specs-cta">
                      <button
                        type="button"
                        onClick={openEnquiry}
                        className="btn-pill btn-pill-dark pd-specs-cta-btn"
                      >
                        <span>Commission Similar Work</span>
                        <FiArrowRight size={15} />
                      </button>
                    </div>

                    <div className="pd-sidebar-direct">
                      <div className="pd-sidebar-direct-title">Dubai Head Office & Atelier</div>
                      <p style={{ margin: "0 0 6px" }}>
                        Business Bay, Dubai. Mon-Fri 8:30am - 6:00pm GST.
                      </p>
                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <Link
                          to="/contact"
                          className="pd-sidebar-contact-link"
                        >
                          <FiPhoneCall size={12} /> Contact Engineering
                        </Link>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* Previous & Next Project Navigation Deck */}
            {(prevProject || nextProject) && (
              <section className="pd-pager-section" aria-label="Project Navigation">
                <div className="pd-pager-header">
                  <span className="eyebrow">Portfolio Navigation</span>
                </div>

                <div className="pd-pager-grid">
                  {prevProject && (
                    <Link
                      to={`/project/details/${getId(prevProject)}`}
                      className="pd-pager-card"
                    >
                      <div className="pd-pager-thumb">
                        <img
                          src={getImages(prevProject)[0] || "/static/hero-editorial.webp"}
                          alt={prevProject.title || "Previous project"}
                          onError={hideBrokenProjectImage}
                        />
                      </div>
                      <div className="pd-pager-info">
                        <span className="pd-pager-kicker">
                          <FiArrowLeft size={12} /> Previous Case Study
                        </span>
                        <h4 className="pd-pager-title">{prevProject.title || "Selected Project"}</h4>
                        <span className="pd-pager-category">
                          {categoryLabel(
                            typeof prevProject.categoryId === "object"
                              ? prevProject.categoryId?.categoryName
                              : prevProject.category
                          ) || "Fit-Out"}
                        </span>
                      </div>
                    </Link>
                  )}

                  {nextProject && (
                    <Link
                      to={`/project/details/${getId(nextProject)}`}
                      className="pd-pager-card"
                    >
                      <div className="pd-pager-thumb">
                        <img
                          src={getImages(nextProject)[0] || "/static/hero-editorial.webp"}
                          alt={nextProject.title || "Next project"}
                          onError={hideBrokenProjectImage}
                        />
                      </div>
                      <div className="pd-pager-info">
                        <span className="pd-pager-kicker" style={{ justifyContent: "flex-start" }}>
                          Next Case Study <FiArrowRight size={12} />
                        </span>
                        <h4 className="pd-pager-title">{nextProject.title || "Selected Project"}</h4>
                        <span className="pd-pager-category">
                          {categoryLabel(
                            typeof nextProject.categoryId === "object"
                              ? nextProject.categoryId?.categoryName
                              : nextProject.category
                          ) || "Fit-Out"}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Bottom Consultation CTA Banner */}
          <section className="pd-bottom-cta">
            <div className="pd-bottom-cta-inner">
              <span className="eyebrow">Dubai Turnkey Delivery</span>
              <h2 className="pd-bottom-cta-title">
                Have a similar fit-out in mind?
              </h2>
              <p className="pd-bottom-cta-desc">
                From luxury commercial joinery to MEP infrastructure, our in-house craftsmen and engineers deliver precision execution from brief to built.
              </p>
              <div className="pd-bottom-cta-actions">
                <button
                  type="button"
                  onClick={openEnquiry}
                  className="btn-pill btn-pill-dark"
                >
                  Request a Consultation
                </button>
                <Link to="/projects" className="btn-pill btn-pill-outline-dark">
                  Browse All Projects
                </Link>
                <Link to="/quote" className="btn-pill btn-pill-outline-dark">
                  Get a Quote
                </Link>
              </div>
            </div>
          </section>

          {/* Fullscreen Lightbox Modal */}
          {lightbox !== null && images[lightbox] && (
            <div
              ref={lightboxRef}
              className="pd-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={closeBox}
            >
              <button
                type="button"
                className="pd-lb-btn pd-lb-close"
                aria-label="Close full screen view"
                autoFocus
                onClick={closeBox}
              >
                <FiX size={22} />
              </button>
              {count > 1 && (
                <>
                  <button
                    type="button"
                    className="pd-lb-btn pd-lb-prev"
                    aria-label="Previous photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      boxPrev();
                    }}
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    className="pd-lb-btn pd-lb-next"
                    aria-label="Next photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      boxNext();
                    }}
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}
              <img
                className="pd-lb-img"
                src={images[lightbox]}
                alt={`${title}, plate ${lightbox + 1}`}
                onClick={(e) => e.stopPropagation()}
                onError={hideBrokenProjectImage}
              />
              <div className="pd-lb-count">
                {String(lightbox + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

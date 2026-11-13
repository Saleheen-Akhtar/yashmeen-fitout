import {
  FiLayout,
  FiPenTool,
  FiFileText,
  FiLayers,
  FiTool,
  FiHome,
  FiGrid,
  FiImage,
  FiBox,
  FiDroplet,
  FiScissors,
  FiBriefcase,
  FiZap,
  FiMaximize,
  FiUsers,
  FiSun,
  FiVolume2,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";

export const SERVICES_DATA = {
  architecture: {
    slug: "architecture",
    kicker: "YASHMEEN ARCHITECTURE",
    title: "Architecture & Authority Approvals",
    heroTitle: "Architecture Design & Build - Yashmeen Future Building & Fit-Out Company",
    heroBgImage: "/static/hero-bg.jpg",
    introImage: "/static/design-desk.jpg",
    videoUrl: "https://www.youtube-nocookie.com/embed/CF97mtu3qlE",
    stats: [
      { value: "150+", label: "Projects Completed" },
      { value: "10+", label: "Years of Experience" },
      { value: "50+", label: "Skilled Professionals" },
      { value: "100%", label: "In-House Delivery" },
    ],
    introTitle: "Spaces designed with purpose, built with precision.",
    introCopy:
      "From a first sketch to the final handover, our architectural team shapes villas, offices and commercial spaces that balance design, function and budget. Because design and construction sit under one roof, what is drawn is exactly what gets built.",
    introPoints: [
      "Concept design through to construction drawings",
      "Authority approvals handled end to end",
      "Structural and MEP coordination in-house",
      "One accountable team from design to handover",
    ],
    disciplines: [
      {
        icon: FiLayout,
        title: "Concept & Master Planning",
        copy: "Site analysis, space planning and massing studies that turn your brief into a clear architectural direction.",
      },
      {
        icon: FiPenTool,
        title: "Architectural Design",
        copy: "Detailed plans, elevations, sections and 3D visuals so every decision is visible before construction begins.",
      },
      {
        icon: FiFileText,
        title: "Authority Approvals",
        copy: "Preparation and submission of drawings to the relevant authorities, with follow-up until approval is issued.",
      },
      {
        icon: FiLayers,
        title: "Structural & MEP Coordination",
        copy: "Engineers, consultants and trades aligned on a single set of drawings to avoid clashes on site.",
      },
      {
        icon: FiTool,
        title: "Design & Build Delivery",
        copy: "Construction, finishing and bespoke joinery delivered by one team against an agreed budget and programme.",
      },
      {
        icon: FiHome,
        title: "Renovation & Extensions",
        copy: "Reworking existing villas and buildings with new layouts, added floors and upgraded finishes.",
      },
    ],
    process: [
      {
        title: "Consultation & Brief",
        copy: "We visit the site, understand your goals, budget and timeline, and confirm the scope of work.",
      },
      {
        title: "Concept Design",
        copy: "Layout options, mood boards and 3D concepts are presented and refined with your feedback.",
      },
      {
        title: "Detailed Design & Approvals",
        copy: "Technical drawings, material specifications and authority submissions are completed.",
      },
      {
        title: "Construction & Fit-Out",
        copy: "Our site team builds, finishes and installs, with regular progress updates and quality checks.",
      },
      {
        title: "Handover",
        copy: "Final inspection, snagging and a complete handover pack so you can move in with confidence.",
      },
    ],
    projects: [
      {
        title: "Contemporary Villa - Full Build",
        tag: "Residential",
        img: "/static/work-myrtle.jpg",
      },
      {
        title: "Corporate Office - Design & Fit-Out",
        tag: "Commercial",
        img: "/static/Office-fit-out.jpg",
      },
      {
        title: "Boutique Retail Space",
        tag: "Retail",
        img: "/static/work-samford.jpg",
      },
    ],
    faqs: [
      {
        q: "Do you handle both design and construction?",
        a: "Yes. We offer a single-team design-and-build service, so the people who design your space are accountable for how it is built.",
      },
      {
        q: "Can you manage authority approvals for me?",
        a: "We prepare and submit the required drawings and documents and follow up with the authorities until the approvals are in place.",
      },
      {
        q: "How long does an architectural project take?",
        a: "Timelines depend on size and complexity. After the initial consultation we provide a programme covering design, approvals and construction.",
      },
      {
        q: "Can you renovate or extend an existing property?",
        a: "Yes. We handle renovations, layout changes and extensions, from small upgrades to full structural remodelling.",
      },
      {
        q: "How do I get a quotation?",
        a: "Send us your requirements through the contact page or call us. We will arrange a consultation and share a detailed quotation afterwards.",
      },
    ],
  },

  "interior-design": {
    slug: "interior-design",
    kicker: "YASHMEEN INTERIORS",
    title: "Luxury Interior Design & Bespoke Joinery",
    heroTitle: "Interior Design & Bespoke Joinery - Yashmeen Future Building & Fit-Out Company",
    heroBgImage: "/static/Residential-Fit-Out.jpg",
    introImage: "/static/studio.jpg",
    videoUrl: "https://www.youtube-nocookie.com/embed/bt7_sYLWhZg",
    stats: [
      { value: "150+", label: "Interiors Delivered" },
      { value: "10+", label: "Years of Experience" },
      { value: "50+", label: "Designers & Craftsmen" },
      { value: "100%", label: "In-House Joinery" },
    ],
    introTitle: "Interiors shaped around how you live and work.",
    introCopy:
      "We design and build bespoke interiors for luxury villas, commercial offices and retail spaces. By combining 3D concept development with our in-house 35,000 sq.ft Al Quoz joinery workshop, we ensure exceptional finish quality and seamless on-time handover.",
    introPoints: [
      "Designs tailored to your lifestyle, brand and budget",
      "Realistic 3D visuals before any work begins",
      "Premium materials and bespoke joinery made in-house",
      "Design and fit-out managed by one accountable team",
    ],
    disciplines: [
      {
        icon: FiGrid,
        title: "Space Planning",
        copy: "Smart layouts that improve flow, light and usability in every room.",
      },
      {
        icon: FiImage,
        title: "Concept & Mood Boards",
        copy: "Colour palettes, textures and references that define the look and feel of your space.",
      },
      {
        icon: FiBox,
        title: "3D Visualisation",
        copy: "Photo-realistic renders so you can see the finished interior before it is built.",
      },
      {
        icon: FiDroplet,
        title: "Materials & Finishes",
        copy: "Careful selection of flooring, wall finishes, lighting and fittings that suit your design and budget.",
      },
      {
        icon: FiHome,
        title: "Furniture & Decor",
        copy: "Furniture, curtains, artwork and accessories sourced or custom-made to complete the space.",
      },
      {
        icon: FiScissors,
        title: "Bespoke Joinery",
        copy: "Wardrobes, kitchens, wall panelling and feature pieces crafted to your exact measurements.",
      },
    ],
    process: [
      {
        title: "Consultation",
        copy: "We learn how you live or work, your taste and your budget.",
      },
      {
        title: "Concept & Layout",
        copy: "Mood boards and space plans are presented and refined together.",
      },
      {
        title: "3D & Detailing",
        copy: "Renders, drawings and material schedules are finalised for approval.",
      },
      {
        title: "Fit-Out & Styling",
        copy: "Our team builds, installs joinery, and styles the finished space.",
      },
      {
        title: "Handover",
        copy: "A final walkthrough and snagging so everything meets the design.",
      },
    ],
    projects: [
      {
        title: "Luxury Villa Living Space",
        tag: "Residential",
        img: "/static/hero-aperture-v2.webp",
      },
      {
        title: "Executive Office Interior",
        tag: "Commercial",
        img: "/static/work-clifton.jpg",
      },
      {
        title: "Fine Dining Restaurant",
        tag: "F & B",
        img: "/static/work-myrtle.jpg",
      },
    ],
    faqs: [
      {
        q: "What does an interior design service include?",
        a: "It covers space planning, concept development, 3D visuals, material selection, furniture and decor, and extends to full turnkey fit-out and joinery.",
      },
      {
        q: "Can you design and also carry out the fit-out?",
        a: "Yes. Design and execution are handled by one team, so the finished space matches the approved design.",
      },
      {
        q: "Do you work on both homes and commercial spaces?",
        a: "Yes. We design villas and apartments as well as offices, retail outlets, restaurants and cafes.",
      },
      {
        q: "How long does an interior design project take?",
        a: "It depends on the size and scope. After the consultation we share a timeline covering design, approvals and fit-out.",
      },
      {
        q: "How do I get started?",
        a: "Contact us through the contact page or by phone. We will arrange a consultation and follow up with a proposal.",
      },
    ],
  },

  construction: {
    slug: "construction",
    kicker: "YASHMEEN CONSTRUCTION",
    title: "Turnkey Construction & Civil Works",
    heroTitle: "General Construction & Civil Works - Yashmeen Future Building & Fit-Out Company",
    heroBgImage: "/static/production-facility.jpg",
    introImage: "/static/joinery-bay.jpg",
    videoUrl: "https://www.youtube-nocookie.com/embed/C0JYhtQcsGk",
    stats: [
      { value: "150+", label: "Projects Built" },
      { value: "10+", label: "Years of Experience" },
      { value: "50+", label: "Engineers & Site Staff" },
      { value: "100%", label: "On-Site Supervision" },
    ],
    introTitle: "Built on solid engineering, delivered on time.",
    introCopy:
      "From ground-up structures to major extensions and civil works, our construction team delivers reliable building services across Dubai and the UAE. With licensed site engineers, rigorous quality control, and safety compliance, every phase is managed with precision.",
    introPoints: [
      "Experienced engineers and site supervisors on every project",
      "Transparent budgets, schedules and progress reporting",
      "Compliance with local authority regulations and standards",
      "Construction, fit-out and joinery handled by one team",
    ],
    disciplines: [
      {
        icon: FiHome,
        title: "Villa Construction",
        copy: "Ground-up villa builds from foundation to finishing, delivered to your design and specification.",
      },
      {
        icon: FiBriefcase,
        title: "Commercial Buildings",
        copy: "Offices, showrooms and mixed-use spaces built to suit your business and operations.",
      },
      {
        icon: FiLayers,
        title: "Structural Works",
        copy: "Foundations, concrete frames, blockwork and structural modifications carried out to engineering standards.",
      },
      {
        icon: FiZap,
        title: "MEP Installation",
        copy: "Mechanical, electrical and plumbing works coordinated with the main construction programme.",
      },
      {
        icon: FiMaximize,
        title: "Extensions & Additions",
        copy: "Added floors, annexes and layout changes to existing properties with minimal disruption.",
      },
      {
        icon: FiTool,
        title: "Renovation & Refurbishment",
        copy: "Upgrading ageing buildings with new structure, services and finishes.",
      },
    ],
    process: [
      {
        title: "Pre-Construction",
        copy: "Site surveys, cost estimating, scheduling and authority approvals are put in place.",
      },
      {
        title: "Groundwork & Structure",
        copy: "Excavation, foundations and the primary structural frame are built to specification.",
      },
      {
        title: "MEP & Enclosure",
        copy: "Blockwork, external cladding and first-fix mechanical and electrical services are installed.",
      },
      {
        title: "Construction",
        copy: "Structure, services and finishes are built with regular inspections and reports.",
      },
      {
        title: "Completion & Handover",
        copy: "Final checks, snagging and handover documentation close out the project.",
      },
    ],
    projects: [
      {
        title: "Private Villa - New Build",
        tag: "Residential",
        img: "/static/work-stanley.jpg",
      },
      {
        title: "Office Building Construction",
        tag: "Commercial",
        img: "/static/work-oh-office.jpg",
      },
      {
        title: "Villa Extension & Renovation",
        tag: "Renovation",
        img: "/static/raw-space.jpg",
      },
    ],
    faqs: [
      {
        q: "What types of construction projects do you handle?",
        a: "We build villas, residential buildings, offices, retail units, restaurants and workshops, and also handle extensions and renovations.",
      },
      {
        q: "Do you manage permits and authority approvals?",
        a: "Yes. We prepare the required documents and follow up with the relevant authorities so work can start on a compliant basis.",
      },
      {
        q: "Can you take care of both construction and interior fit-out?",
        a: "Yes. Construction, MEP, finishing and joinery are coordinated by one team, which keeps the programme and quality under control.",
      },
      {
        q: "How is the project cost determined?",
        a: "After reviewing your drawings and requirements we prepare a detailed quotation covering the scope, materials and timeline.",
      },
      {
        q: "How can I follow progress during construction?",
        a: "We share regular progress updates and site reports so you always know where the project stands.",
      },
    ],
  },

  "office-renovation": {
    slug: "office-renovation",
    kicker: "YASHMEEN COMMERCIAL",
    title: "Commercial Office Renovation & Fit-Out",
    heroTitle: "Office Renovation & Fit-Out Contractors in Dubai - Yashmeen",
    heroBgImage: "/static/Office-fit-out.jpg",
    introImage: "/static/hero-editorial.webp",
    videoUrl: "https://www.youtube-nocookie.com/embed/i7efTJ5hcnM",
    stats: [
      { value: "100+", label: "Offices Renovated" },
      { value: "10+", label: "Years of Experience" },
      { value: "50+", label: "Skilled Professionals" },
      { value: "100%", label: "In-House Joinery" },
    ],
    introTitle: "Workplaces engineered for productivity, focus, and growth.",
    introCopy:
      "Whether modernising a dated floorplate, restructuring for hybrid work, or fitting out a new commercial headquarters, our team delivers complete commercial renovations with minimal business interruption.",
    introPoints: [
      "Optimized workstation layouts and acoustic collaboration zones",
      "Phased and after-hours execution to minimize business downtime",
      "Bespoke reception desks, executive suites, and boardroom joinery",
      "Full MEP, IT cabling, access control, and Civil Defence compliance",
    ],
    disciplines: [
      {
        icon: FiUsers,
        title: "Space Reconfiguration",
        copy: "Restructuring open floorplates into ergonomic workstations, private phone booths, and collaborative lounges.",
      },
      {
        icon: FiSun,
        title: "Smart Architectural Lighting",
        copy: "Replacing outdated fluorescents with circadian LED grids and accent lighting to improve focus.",
      },
      {
        icon: FiVolume2,
        title: "Acoustic Partitioning & Ceilings",
        copy: "Soundproof meeting pods, baffle ceilings, and acoustic wall panels that eliminate echo.",
      },
      {
        icon: FiZap,
        title: "MEP & Data Infrastructure",
        copy: "Concealed underfloor power, server room cooling, and compliant fire suppression systems.",
      },
      {
        icon: FiTool,
        title: "Bespoke Corporate Millwork",
        copy: "Custom reception counters, integrated credenzas, and executive meeting tables built in Al Quoz.",
      },
      {
        icon: FiShield,
        title: "Approvals & Permitting",
        copy: "Fast approvals through DDA, TECOM, DM, Civil Defence, and building management.",
      },
    ],
    process: [
      {
        title: "Audit & Workplace Brief",
        copy: "Evaluating your existing floorplate, team headcount, and functional pain points.",
      },
      {
        title: "3D Space Planning & Permitting",
        copy: "Designing efficient layouts and submitting for swift building management clearances.",
      },
      {
        title: "Phased Execution",
        copy: "Structured scheduling allowing uninterrupted business operations or rapid turnkey shutdown.",
      },
      {
        title: "Joinery & MEP Integration",
        copy: "Installing custom millwork, IT conduits, power drops, and air balance systems.",
      },
      {
        title: "Final Handover & Snag-Free Signoff",
        copy: "Complete as-built drawings, test reports, and zero-defect space handover.",
      },
    ],
    projects: [
      {
        title: "Corporate HQ - Open Floorplate",
        tag: "Commercial Office",
        img: "/static/Office-fit-out.jpg",
      },
      {
        title: "Executive Suites & Boardroom",
        tag: "Tech Workspace",
        img: "/static/work-stanley.jpg",
      },
      {
        title: "Creative Agency Headquarters",
        tag: "Creative Studio",
        img: "/static/work-myrtle.jpg",
      },
    ],
    faqs: [
      {
        q: "Do I need landlord or building management approval?",
        a: "In most buildings, yes. We prepare the drawings and documents and coordinate with building management and the relevant authorities for you.",
      },
      {
        q: "What is the difference between a renovation and a fit-out?",
        a: "A fit-out finishes an empty shell, while a renovation upgrades an existing office, often while keeping parts of it, so planning around what is already there matters.",
      },
      {
        q: "Can the work be done outside our working hours?",
        a: "Yes. Noisy or disruptive tasks can be scheduled after hours or in phases so your team can keep working.",
      },
      {
        q: "Can you reuse our existing furniture?",
        a: "Where it suits the new design we can keep, refurbish or relocate existing pieces, and add new custom items from our joinery workshop.",
      },
      {
        q: "How do I get an estimate for our office renovation?",
        a: "Contact our team to book a site survey. We will review your floorplate, requirements and provide a transparent, itemised proposal.",
      },
    ],
  },
};

import WebDetailsModel from "../models/webDetails.model.js";

export const DEFAULT_SERVICES = [
    {
        id: "srv-architecture",
        slug: "architecture",
        title: "Architecture",
        eyebrow: "CONCEPT TO AUTHORITIES",
        shortDesc: "Concept planning, Dubai Municipality & developer approvals, and structural coordination.",
        description: "End-to-end architectural planning, authority submissions, structural design and build coordination for luxury residential villas and flagship commercial developments across the UAE.",
        image: "/static/hero-aperture.png",
        route: "/services/architecture",
        active: true,
        highlights: [
            "Concept & Master Planning",
            "Dubai Municipality & DCD Approvals",
            "Structural & MEP Coordination",
            "Turnkey Design & Build Delivery"
        ]
    },
    {
        id: "srv-interior-design",
        slug: "interior-design",
        title: "Interior Design",
        eyebrow: "BESPOKE SPATIAL FIT-OUT",
        shortDesc: "Luxury interiors, bespoke joinery crafted in our Al Quoz facility, and fine lighting.",
        description: "Turnkey luxury interior architecture and custom millwork fabricated in our 35,000 sq. ft. Al Quoz atelier. From stone selection to final snag-free handover.",
        image: "/static/studio.jpg",
        route: "/services/interior-design",
        active: true,
        highlights: [
            "3D Photorealistic Visualization",
            "Bespoke Timber & Metalwork Joinery",
            "Architectural Lighting & Acoustic Systems",
            "Complete Authority Permitting"
        ]
    },
    {
        id: "srv-construction",
        slug: "construction",
        title: "Construction",
        eyebrow: "STRUCTURAL & CIVIL WORKS",
        shortDesc: "Commercial & villa turnkey contracting, structural modifications, and MEP engineering.",
        description: "Disciplined general contracting across Dubai with full civil works, waterproofing, structural slabs, and integrated MEP systems under a single critical path.",
        image: "/static/joinery-bay.jpg",
        route: "/services/construction",
        active: true,
        highlights: [
            "Civil & Structural Contracting",
            "MEP System Engineering",
            "Authority Clearances & Testing",
            "12-Month Defect Liability Guarantee"
        ]
    },
    {
        id: "srv-office-renovation",
        slug: "office-renovation",
        title: "Office Renovation",
        eyebrow: "CORPORATE HEADQUARTERS",
        shortDesc: "DIFC & Business Bay acoustic workspaces, executive suites, and modular glazing.",
        description: "High-speed corporate workplace transformations across DIFC, Business Bay, and Tecom. Framed acoustic glazing, micro-cement reception counters, and executive boardrooms.",
        image: "/static/Office-fit-out.jpg",
        route: "/services/office-renovation",
        active: true,
        highlights: [
            "Acoustic Double-Glazed Partitions",
            "Tecom, DIFC & DDA Fit-Out",
            "Smart Automation & AV Integration",
            "Zero-Disruption Phased Execution"
        ]
    }
];

export const DEFAULT_PROCESS_STEPS = [
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
    }
];

export const DEFAULT_CRM_TASKS = [
    {
        id: "task-1",
        title: "Verify Al Quoz Joinery Drawings",
        subtitle: "Production · Today, 10:30 AM",
        category: "atelier",
        completed: true,
    },
    {
        id: "task-2",
        title: "Sync Website Selected Works",
        subtitle: "CMS Sync · Live on Homepage",
        category: "web",
        completed: true,
    },
    {
        id: "task-3",
        title: "Prepare Commercial Quote PDF",
        subtitle: "Client Brief · Due 2:00 PM",
        category: "quote",
        completed: false,
    },
    {
        id: "task-4",
        title: "Update DIFC Service Portfolio",
        subtitle: "Services Page · Pending Review",
        category: "service",
        completed: false,
    },
    {
        id: "task-5",
        title: "DCD Final Fire & Life Safety Signoff",
        subtitle: "Authority · Business Bay",
        category: "site",
        completed: false,
    }
];

export const DEFAULT_CALENDAR_EVENTS = [
    {
        id: "evt-1",
        dayIndex: 1,
        timeSlot: "9:00 am",
        title: "Site Sync · Acacia Tower Fit-Out",
        subtitle: "MEP & custom millwork check",
        variant: "dark"
    },
    {
        id: "evt-2",
        dayIndex: 3,
        timeSlot: "10:00 am",
        title: "Client Consultation",
        subtitle: "Brief & material board review",
        variant: "light"
    }
];

export const getWebDetails = async (req, res) => {
    try {
        let details = await WebDetailsModel.findOne();

        if (!details) {
            details = await WebDetailsModel.create({
                services: DEFAULT_SERVICES,
                processSteps: DEFAULT_PROCESS_STEPS,
                crmTasks: DEFAULT_CRM_TASKS,
                calendarEvents: DEFAULT_CALENDAR_EVENTS
            });
        } else {
            let needsSave = false;
            if (!details.services || details.services.length === 0) {
                details.services = DEFAULT_SERVICES;
                needsSave = true;
            }
            if (!details.processSteps || details.processSteps.length === 0) {
                details.processSteps = DEFAULT_PROCESS_STEPS;
                needsSave = true;
            }
            if (!details.crmTasks || details.crmTasks.length === 0) {
                details.crmTasks = DEFAULT_CRM_TASKS;
                needsSave = true;
            }
            if (!details.calendarEvents || details.calendarEvents.length === 0) {
                details.calendarEvents = DEFAULT_CALENDAR_EVENTS;
                needsSave = true;
            }
            if (needsSave) {
                await details.save();
            }
        }

        return res.status(200).json({
            success: true,
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch website details.",
        });
    }
};

export const updateWebDetails = async (req, res) => {
    try {
        const {
            address,
            email,
            mobile,
            whatsapp,
            socialLinks,
            brandName,
            cityLabel,
            workingHours,
            hero,
            studio,
            services,
            processSteps,
            crmTasks,
            calendarEvents
        } = req.body;

        if (socialLinks !== undefined && !Array.isArray(socialLinks)) {
            return res.status(400).json({
                success: false,
                message: "socialLinks must be an array.",
            });
        }

        if (Array.isArray(socialLinks)) {
            for (const link of socialLinks) {
                if (!link.platform || !link.platform.trim()) {
                    return res.status(400).json({
                        success: false,
                        message: "Each social link requires a platform.",
                    });
                }
                if (!link.url || !/^https?:\/\/.+/.test(link.url.trim())) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid URL for platform "${link.platform}".`,
                    });
                }
            }
        }

        const update = {};
        if (address !== undefined) update.address = address;
        if (email !== undefined) update.email = email;
        if (mobile !== undefined) update.mobile = mobile;
        if (whatsapp !== undefined) update.whatsapp = whatsapp;
        if (socialLinks !== undefined) update.socialLinks = socialLinks;
        if (brandName !== undefined) update.brandName = brandName;
        if (cityLabel !== undefined) update.cityLabel = cityLabel;
        if (workingHours !== undefined) update.workingHours = workingHours;
        if (hero !== undefined) update.hero = hero;
        if (studio !== undefined) update.studio = studio;
        if (services !== undefined) update.services = services;
        if (processSteps !== undefined) update.processSteps = processSteps;
        if (crmTasks !== undefined) update.crmTasks = crmTasks;
        if (calendarEvents !== undefined) update.calendarEvents = calendarEvents;

        const details = await WebDetailsModel.findOneAndUpdate(
            {},
            { $set: update },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Website details updated successfully.",
            data: details,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0]?.message || "Validation failed.";
            return res.status(400).json({
                success: false,
                message: firstError,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update website details.",
        });
    }
};

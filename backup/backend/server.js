import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

import connectDB from "./config/db.config.js";
import videoRouter from "./routes/video.routes.js";
import webDetailsRouter from "./routes/webDetails.routes.js";
import vacancyRouter from "./routes/vacancy.route.js";
import bannerRouter from "./routes/banner.routes.js";
import categoryRouter from "./routes/category.routes.js";
import enquiryRouter from "./routes/enquiry.routes.js";
import galleryRouter from "./routes/gallery.routes.js";
import popupRouter from "./routes/popup.routes.js";
import projectRouter from "./routes/project.routes.js";
import postRoute from "./routes/post.route.js";
import accountRouter from "./routes/account.routes.js";
import { postUpload } from "./middlewares/postUpload.js";
import quoteRouter from "./routes/quote.routes.js";
import { itemPath } from "./utils/control.js";
import { protect, adminOnly } from "./middlewares/auth.js";

const app = express();
const PORT = process.env.PORT || 8000;
const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
    connectDB().catch(() => {});
}

// Security headers (lightweight equivalent to helmet defaults)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
});

const ALLOWED_ORIGINS = new Set(
    [
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        "https://yashmeen-fitout.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
    ]
        .filter(Boolean)
        .map((o) => o.replace(/\/+$/, ""))
);

app.use(
    cors({
        origin(origin, cb) {
            if (!origin) return cb(null, true);
            const normalized = origin.replace(/\/+$/, "");
            if (
                ALLOWED_ORIGINS.has(normalized) ||
                /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized) ||
                /^https:\/\/yashmeen-[a-z0-9-]+\.vercel\.app$/i.test(normalized)
            ) {
                return cb(null, true);
            }
            return cb(null, false);
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Lightweight in-memory IP sliding-window rate limiter
const createRateLimiter = ({ windowMs, max }) => {
    const hits = new Map();
    return (req, res, next) => {
        const key = `${req.ip || req.socket?.remoteAddress || "unknown"}:${req.baseUrl || req.path}`;
        const now = Date.now();
        let entry = hits.get(key);
        if (!entry || now > entry.resetAt) {
            entry = { count: 1, resetAt: now + windowMs };
            hits.set(key, entry);
        } else {
            entry.count += 1;
        }
        if (hits.size > 5000) {
            for (const [k, v] of hits) {
                if (now > v.resetAt) hits.delete(k);
            }
        }
        if (entry.count > max) {
            return res.status(429).json({
                success: false,
                message: "Too many requests, please try again shortly.",
            });
        }
        return next();
    };
};

const apiLimiter = createRateLimiter({ windowMs: 5 * 60 * 1000, max: 600 });
const sensitiveLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 60 });

app.use("/api", apiLimiter);
app.use("/api/account/login", sensitiveLimiter);
app.use("/api/account/forgot-password", sensitiveLimiter);
app.use("/api/account/resend-verification", sensitiveLimiter);
app.use("/api/quote/create", sensitiveLimiter);
app.use("/api/enquiry/create", sensitiveLimiter);

// 📁 Create uploads folder in writable local environments (serverless FS is read-only)
const uploadsFolder = path.join(__dirname, "uploads");
if (!isVercel && !fs.existsSync(uploadsFolder)) {
    try {
        fs.mkdirSync(uploadsFolder, { recursive: true });
    } catch (err) {
        console.warn("Skipped creating uploads directory:", err.message);
    }
}

app.use("/uploads", express.static(uploadsFolder));

// Graceful fallback ONLY in explicit development mode for local offline historical records
const DEV_FALLBACK_IMAGES = [
    "hero-cinematic.jpg",
    "hero-bg.jpg",
    "work-clifton.jpg",
    "work-myrtle.jpg",
    "work-samford.jpg",
    "yashmeen-studio.jpg",
    "Residential-Fit-Out.jpg",
    "studio.jpg",
    "design-desk.jpg",
    "raw-space.jpg",
    "hero-banner.jpg",
    "joinery-bay.jpg",
    "Office-fit-out.jpg",
];

if (process.env.NODE_ENV === "development") {
    app.use("/uploads", (req, res, next) => {
        if (/\.(png|jpe?g|webp|gif|svg)$/i.test(req.path)) {
            // FNV-1a mix spreads close timestamp filenames cleanly across distinct local photos
            let hash = 2166136261;
            for (let i = 0; i < req.path.length; i++) {
                hash ^= req.path.charCodeAt(i);
                hash = Math.imul(hash, 16777619) >>> 0;
            }
            const chosen = DEV_FALLBACK_IMAGES[hash % DEV_FALLBACK_IMAGES.length];
            const fallbackImage = path.join(__dirname, "../frontend/public/static", chosen);
            if (fs.existsSync(fallbackImage)) {
                res.setHeader("Cache-Control", "public, max-age=3600");
                return res.sendFile(fallbackImage);
            }
            res.setHeader("Cache-Control", "public, max-age=3600");
            return res.redirect(302, `/static/${chosen}`);
        }
        return next();
    });
}

// Ensure MongoDB connection is established before API handlers run in serverless invocations
app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        return next();
    } catch (err) {
        const missingEnv = !process.env.MONGO_URI;
        return res.status(503).json({
            success: false,
            message: missingEnv
                ? "Database unavailable: MONGO_URI environment variable is not set"
                : "Database connection unavailable",
            code: missingEnv ? "MISSING_MONGO_URI" : (err?.name || "DB_CONNECT_FAILED"),
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }
});

// 📍 Upload route for CKEditor images
app.post("/api/upload", protect, adminOnly, postUpload.single("upload"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ uploaded: false, error: { message: "No image uploaded" } });
    }
    const fileUrl = `${itemPath}/${req.file.filename}`;
    res.json({
        uploaded: true,
        url: fileUrl
    });
});

// 🌐 Routes
app.use("/api/post", postRoute);
app.use("/api/project", projectRouter);
app.use("/api/account", accountRouter);
app.use("/api/quote", quoteRouter);
app.use("/api/enquiry", enquiryRouter);
app.use("/api/category", categoryRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/vacancy", vacancyRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/video", videoRouter);
app.use("/api/webDetails", webDetailsRouter);
app.use("/api/popup", popupRouter);

// Centralized JSON error handler for Multer & malformed request payloads
app.use((err, req, res, next) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
        const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        const message =
            err.code === "LIMIT_FILE_SIZE"
                ? "Uploaded file exceeds 5MB limit"
                : err.message || "Upload failed";
        return res.status(status).json({
            success: false,
            uploaded: false,
            message,
            error: { message },
        });
    }
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ success: false, message: "Invalid JSON payload" });
    }
    if (err.message && /Invalid file type/i.test(err.message)) {
        return res.status(400).json({
            success: false,
            uploaded: false,
            message: err.message,
            error: { message: err.message },
        });
    }
    console.error("Unhandled API error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
});

// Export app for Vercel serverless runtime
export default app;

// 🚀 Start Server for local standalone execution
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

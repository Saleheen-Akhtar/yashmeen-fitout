import { logError, logInfo } from "./utils/logger.js";
import "./config/env.js";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import { protect, adminOnly } from "./middlewares/auth.js";
import { createDistributedRateLimiter, isPublicReadRequest } from "./services/rateLimiter.service.js";
import { mediaFolders, uploadBuffer } from "./services/media.service.js";
import { reportProductionEnvIssues } from "./config/env.js";

const app = express();
const PORT = process.env.PORT || 8000;
const isVercel = Boolean(process.env.VERCEL);
reportProductionEnvIssues();

if (!isVercel) {
    connectDB().catch(() => {});
}

// Behind Vercel's proxy req.ip is the proxy unless trust proxy is set, which would
// make every visitor share one rate-limit key.
if (isVercel || process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

// Security headers (lightweight equivalent to helmet defaults)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
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
                (process.env.ALLOW_VERCEL_PREVIEWS === "true" &&
                    /^https:\/\/yashmeen-fitout(-[a-z0-9-]+)?\.vercel\.app$/i.test(normalized))
            ) {
                return cb(null, true);
            }
            return cb(null, false);
        },
        credentials: false,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const apiLimiter = createDistributedRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 600,
    prefix: "api",
    sensitive: (req) => !isPublicReadRequest(req),
});
const sensitiveLimiter = createDistributedRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
    prefix: "sensitive",
    sensitive: true,
});
const accountLimiter = createDistributedRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    prefix: "account",
    sensitive: true,
    keyGenerator: (req) => crypto
        .createHash("sha256")
        .update(String(req.body?.email || "unknown").trim().toLowerCase())
        .digest("hex"),
});

app.use("/api", apiLimiter);
app.use("/api/account/login", accountLimiter, sensitiveLimiter);
app.use("/api/account/forgot-password", accountLimiter, sensitiveLimiter);
app.use("/api/account/resend-verification", accountLimiter, sensitiveLimiter);
app.use("/api/account/reset-password", sensitiveLimiter);
app.use("/api/account/verify-email", sensitiveLimiter);
app.use("/api/quote/create", sensitiveLimiter);
app.use("/api/enquiry/create", sensitiveLimiter);

// 📁 Create uploads folder in writable local environments (serverless FS is read-only)
const uploadsFolder = path.join(__dirname, "uploads");
if (!isVercel && !fs.existsSync(uploadsFolder)) {
    try {
        fs.mkdirSync(uploadsFolder, { recursive: true });
    } catch (err) {
        logError("Skipped creating uploads directory:", err);
    }
}

app.use("/uploads", express.static(uploadsFolder));

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
app.post("/api/upload", protect, adminOnly, postUpload.single("upload"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ uploaded: false, error: { message: "No image uploaded" } });
    }
    try {
        const uploaded = await uploadBuffer(req.file.buffer, { folder: mediaFolders.editor });
        return res.json({ uploaded: true, url: uploaded.url });
    } catch (error) {
        if (error?.status === 400) {
            return res.status(400).json({
                uploaded: false,
                error: { message: error.message, code: error.code },
            });
        }
        logError("Editor image upload failed:", error);
        return res.status(502).json({
            uploaded: false,
            error: { message: "Image storage is temporarily unavailable" },
        });
    }
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
    logError("Unhandled API error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
});

// Export app for Vercel serverless runtime
export default app;

// 🚀 Start Server for local standalone execution
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        logInfo(`Server is running on port ${PORT}`);
    });
}

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

const app = express();
const PORT = process.env.PORT || 8000;
const isVercel = Boolean(process.env.VERCEL);

if (!isVercel) {
    connectDB().catch(() => {});
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Graceful fallback for historical DB image records missing locally in development
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
app.post("/api/upload", postUpload.single("upload"), (req, res) => {
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

// Export app for Vercel serverless runtime
export default app;

// 🚀 Start Server for local standalone execution
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

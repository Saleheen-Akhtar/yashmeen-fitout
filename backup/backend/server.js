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

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 📁 Create uploads folder if not exists
const uploadsFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true });
}

// 📍 Upload route for CKEditor images
app.post("/api/upload", postUpload.single("upload"), (req, res) => {
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

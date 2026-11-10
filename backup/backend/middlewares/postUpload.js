import multer from "multer";
import path from "path";
import fs from "fs";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const uploadDir = "uploads/posts";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only JPG, JPEG, PNG, and WebP formats are allowed."
            ),
            false
        );
    }
};

export const postUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

export const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("❌ Error deleting file:", err);
        }
    });
};

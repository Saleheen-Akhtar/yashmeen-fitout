import multer from "multer";
const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});

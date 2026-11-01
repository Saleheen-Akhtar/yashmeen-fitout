import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createUploader = (folder, allowedTypes) => {
    const uploadDir = `uploads/${folder}`;

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `${uniqueSuffix}${ext}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (allowedTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    });
};

export const uploadProjectImages = createUploader('projects', /^image\//);
export const uploadBannerPhoto = createUploader('banners', /^image\//);
export const uploadGalleryPhoto = createUploader('gallery', /^image\//);
export const uploadPopupPhoto = createUploader('popups', /^image\//);
export const uploadResume = createUploader(
    'resumes',
    /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/
);
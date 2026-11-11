import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const isVercel = Boolean(process.env.VERCEL);

const MIME_TO_EXT = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const createUploader = (folder, allowedTypes) => {
    const uploadDir = isVercel ? path.join(os.tmpdir(), 'uploads', folder) : `uploads/${folder}`;

    const ensureUploadDir = () => {
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        } catch (err) {
            console.warn(`Skipped creating upload directory ${uploadDir}:`, err.message);
        }
    };

    if (!isVercel) {
        ensureUploadDir();
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            ensureUploadDir();
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = MIME_TO_EXT[String(file.mimetype || '').toLowerCase()] || '';
            if (!ext) {
                return cb(new Error('Invalid file type'));
            }
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

const IMAGE_MIME_REGEX = /^image\/(jpeg|jpg|png|webp)$/i;

export const uploadProjectImages = createUploader('projects', IMAGE_MIME_REGEX);
export const uploadBannerPhoto = createUploader('banners', IMAGE_MIME_REGEX);
export const uploadGalleryPhoto = createUploader('gallery', IMAGE_MIME_REGEX);
export const uploadPopupPhoto = createUploader('popups', IMAGE_MIME_REGEX);
export const uploadResume = createUploader(
    'resumes',
    /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/
);
import multer from 'multer';

const createUploader = (folder, allowedTypes) => {
    const fileFilter = (req, file, cb) => {
        if (allowedTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    };

    return multer({
        storage: multer.memoryStorage(),
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

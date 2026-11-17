import "../config/env.js";
import { v2 as cloudinary } from "cloudinary";

let configuredSignature = "";

const IMAGE_SIGNATURES = Object.freeze([
    {
        type: "jpeg",
        matches: (buffer) => buffer.length >= 3
            && buffer[0] === 0xff
            && buffer[1] === 0xd8
            && buffer[2] === 0xff,
    },
    {
        type: "png",
        matches: (buffer) => buffer.length >= 8
            && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    },
    {
        type: "webp",
        matches: (buffer) => buffer.length >= 12
            && buffer.subarray(0, 4).toString("ascii") === "RIFF"
            && buffer.subarray(8, 12).toString("ascii") === "WEBP",
    },
]);

export class MediaValidationError extends Error {
    constructor(message, code = "INVALID_IMAGE_SIGNATURE") {
        super(message);
        this.name = "MediaValidationError";
        this.status = 400;
        this.code = code;
    }
}

export const detectImageType = (buffer) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) return null;
    return IMAGE_SIGNATURES.find(({ matches }) => matches(buffer))?.type || null;
};

export const assertSupportedImage = (buffer) => {
    const imageType = detectImageType(buffer);
    if (!imageType) {
        throw new MediaValidationError("Invalid image content. Only JPEG, PNG, and WebP images are allowed.");
    }
    return imageType;
};

const configureCloudinary = () => {
    const cloudName = String(process.env.CLOUDINARY_NAME || "").trim();
    const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
    const apiSecret = String(process.env.CLOUDINARY_SECRET_KEY || "").trim();
    if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured");
    const signature = `${cloudName}:${apiKey}`;
    if (signature !== configuredSignature) {
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
        configuredSignature = signature;
    }
};

export const isCloudinaryUrl = (value = "") =>
    /^https:\/\/res\.cloudinary\.com\//i.test(String(value));

export const cloudinaryPublicIdFromUrl = (value = "") => {
    if (!isCloudinaryUrl(value)) return null;
    try {
        const parts = new URL(value).pathname.split("/").filter(Boolean);
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex < 0) return null;
        const afterUpload = parts.slice(uploadIndex + 1);
        if (/^v\d+$/.test(afterUpload[0])) afterUpload.shift();
        return afterUpload.join("/").replace(/\.[^/.]+$/, "") || null;
    } catch {
        return null;
    }
};

export const uploadBuffer = async (buffer, { folder, resourceType = "image", client = cloudinary }) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new MediaValidationError("Uploaded file is empty", "EMPTY_UPLOAD");
    }
    if (resourceType === "image") assertSupportedImage(buffer);
    if (client === cloudinary) configureCloudinary();
    return new Promise((resolve, reject) => {
        const stream = client.uploader.upload_stream(
            { folder, resource_type: resourceType, use_filename: false, unique_filename: true },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    resourceType: result.resource_type || resourceType,
                });
            },
        );
        stream.end(buffer);
    });
};

export const uploadFiles = async (files = [], options) => {
    const uploaded = [];
    try {
        for (const file of files) uploaded.push(await uploadBuffer(file.buffer, options));
        return uploaded;
    } catch (error) {
        await deleteAssets(uploaded, options?.resourceType || "image", options?.client || cloudinary);
        throw error;
    }
};

export const deleteAsset = async (asset, resourceType = "image", client = cloudinary) => {
    const publicId = typeof asset === "string"
        ? cloudinaryPublicIdFromUrl(asset)
        : asset?.publicId;
    if (!publicId) return false;
    if (client === cloudinary) configureCloudinary();
    await client.uploader.destroy(publicId, {
        resource_type: typeof asset === "object" ? asset.resourceType || resourceType : resourceType,
        invalidate: true,
    });
    return true;
};

export const deleteAssets = async (assets = [], resourceType = "image", client = cloudinary) => {
    await Promise.allSettled(assets.filter(Boolean).map((asset) => deleteAsset(asset, resourceType, client)));
};

export const mediaFolders = Object.freeze({
    projects: "yashmeen/projects",
    gallery: "yashmeen/gallery",
    banners: "yashmeen/banners",
    popups: "yashmeen/popups",
    posts: "yashmeen/posts",
    editor: "yashmeen/posts/editor",
    resumes: "yashmeen/resumes",
});

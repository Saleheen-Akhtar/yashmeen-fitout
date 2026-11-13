import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const uploadToCloudinary = (buffer, folder, publicId = undefined) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder,
            resource_type: "auto",
            ...(publicId && { public_id: publicId }),
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        const readable = new Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(uploadStream);
    });
};

export const deleteFromCloudinary = async (publicIdOrUrl) => {
    try {
        let publicId = publicIdOrUrl;

        // Extract public ID from URL if full URL is passed
        if (publicIdOrUrl.startsWith("http")) {
            const parts = publicIdOrUrl.split("/");
            const uploadIndex = parts.indexOf("upload");
            if (uploadIndex !== -1) {
                // Remove version segment (v1234567890) if present
                const afterUpload = parts.slice(uploadIndex + 1);
                if (/^v\d+$/.test(afterUpload[0])) afterUpload.shift();
                publicId = afterUpload.join("/").replace(/\.[^/.]+$/, ""); // strip extension
            }
        }

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary delete error:", error.message);
    }
};

export default cloudinary;
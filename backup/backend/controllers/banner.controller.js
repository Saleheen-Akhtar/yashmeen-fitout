import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import BannerModel from '../models/banner.model.js'; // adjust path as needed

// Physical folder where multer saves files: <project>/uploads/banners/<filename>
// The DB stores only "/banners/<filename>" (relative to the uploads folder).
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const toDbPath = (file) => `/banners/${file.filename}`;

// Deletes a file given the value stored in DB ("/banners/abc.jpg").
// Also tolerates old records saved as "/uploads/banners/abc.jpg".
const deleteLocalFile = (photo) => {
    if (!photo) return;

    const relative = photo.replace(/^\/?uploads\//, '').replace(/^\/+/, '');
    const fullPath = path.resolve(UPLOADS_DIR, relative);

    // Safety: never delete anything outside the uploads folder
    if (!fullPath.startsWith(UPLOADS_DIR + path.sep)) return;

    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete file: ${fullPath}`, err.message);
        }
    });
};

// Removes a file multer just saved (used when validation fails after upload)
const discardUpload = (file) => {
    if (file?.path) {
        fs.unlink(file.path, () => {});
    }
};

export const createBanner = async (req, res) => {
    try {
        const { title, link, order, status } = req.body;

        if (!title || !title.trim()) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "title is required" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "photo is required" });
        }
        if (order !== undefined && order !== "" && isNaN(order)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "order must be a number" });
        }
        if (status !== undefined && !["true", "false", true, false].includes(status)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "status must be a boolean" });
        }

        const banner = await BannerModel.create({
            title: title.trim(),
            photo: toDbPath(req.file), // "/banners/<filename>"
            link,
            order: order === "" ? undefined : order,
            status,
        });

        return res.status(201).json({ success: true, message: "Banner created successfully", data: banner });
    } catch (error) {
        discardUpload(req.file);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to create banner", error: error.message });
    }
};

export const getAllBanners = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status !== undefined) filter.status = status === "true";

        const banners = await BannerModel.find(filter).sort({ order: 1 });
        return res.status(200).json({ success: true, data: banners });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch banners", error: error.message });
    }
};

export const getBannerById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid banner id" });
        }

        const banner = await BannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        return res.status(200).json({ success: true, data: banner });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch banner", error: error.message });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "Invalid banner id" });
        }

        const { title, link, order, status } = req.body;

        if (title !== undefined && !title.trim()) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }
        if (order !== undefined && order !== "" && isNaN(order)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "order must be a number" });
        }
        if (status !== undefined && !["true", "false", true, false].includes(status)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "status must be a boolean" });
        }

        const banner = await BannerModel.findById(id);
        if (!banner) {
            discardUpload(req.file);
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        const oldPhoto = banner.photo;

        if (req.file) banner.photo = toDbPath(req.file);
        if (title !== undefined) banner.title = title.trim();
        if (link !== undefined) banner.link = link;
        if (order !== undefined && order !== "") banner.order = order;
        if (status !== undefined) banner.status = status;

        await banner.save();

        // Delete the old image only after the new data is saved successfully
        if (req.file) deleteLocalFile(oldPhoto);

        return res.status(200).json({ success: true, message: "Banner updated successfully", data: banner });
    } catch (error) {
        discardUpload(req.file);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to update banner", error: error.message });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid banner id" });
        }

        const banner = await BannerModel.findByIdAndDelete(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        deleteLocalFile(banner.photo);

        return res.status(200).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete banner", error: error.message });
    }
};

export const updateBannerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid banner id" });
        }

        const banner = await BannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        banner.status = !banner.status

        await banner.save()

        return res.status(200).json({ success: true, message: "Banner status updated", data: banner });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update banner status", error: error.message });
    }
};
import { logError } from "../utils/logger.js";
import mongoose from 'mongoose';
import BannerModel from '../models/banner.model.js'; // adjust path as needed
import { deleteAsset, mediaFolders, uploadBuffer } from '../services/media.service.js';

export const createBanner = async (req, res) => {
    let uploadedAsset;
    try {
        const { title, link, order, status } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "title is required" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "photo is required" });
        }
        if (order !== undefined && order !== "" && isNaN(order)) {
            return res.status(400).json({ success: false, message: "order must be a number" });
        }
        if (status !== undefined && !["true", "false", true, false].includes(status)) {
            return res.status(400).json({ success: false, message: "status must be a boolean" });
        }

        uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.banners });
        const banner = await BannerModel.create({
            title: title.trim(),
            photo: uploadedAsset.url,
            link,
            order: order === "" ? undefined : order,
            status,
        });

        return res.status(201).json({ success: true, message: "Banner created successfully", data: banner });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to create banner:", error);
        return res.status(500).json({ success: false, message: "Failed to create banner" });
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
        logError("Failed to fetch banners:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch banners" });
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
        logError("Failed to fetch banner:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch banner" });
    }
};

export const updateBanner = async (req, res) => {
    let uploadedAsset;
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid banner id" });
        }

        const { title, link, order, status } = req.body;

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }
        if (order !== undefined && order !== "" && isNaN(order)) {
            return res.status(400).json({ success: false, message: "order must be a number" });
        }
        if (status !== undefined && !["true", "false", true, false].includes(status)) {
            return res.status(400).json({ success: false, message: "status must be a boolean" });
        }

        const banner = await BannerModel.findById(id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        const oldPhoto = banner.photo;

        if (req.file) {
            uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.banners });
            banner.photo = uploadedAsset.url;
        }
        if (title !== undefined) banner.title = title.trim();
        if (link !== undefined) banner.link = link;
        if (order !== undefined && order !== "") banner.order = order;
        if (status !== undefined) banner.status = status;

        await banner.save();

        // Delete the old image only after the new data is saved successfully
        if (req.file) await deleteAsset(oldPhoto);

        return res.status(200).json({ success: true, message: "Banner updated successfully", data: banner });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to update banner:", error);
        return res.status(500).json({ success: false, message: "Failed to update banner" });
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

        await deleteAsset(banner.photo);

        return res.status(200).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        logError("Failed to delete banner:", error);
        return res.status(500).json({ success: false, message: "Failed to delete banner" });
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
        logError("Failed to update banner status:", error);
        return res.status(500).json({ success: false, message: "Failed to update banner status" });
    }
};

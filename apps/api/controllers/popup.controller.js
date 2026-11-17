import { logError } from "../utils/logger.js";
import mongoose from 'mongoose';
import PopupModel from '../models/popup.model.js'; // adjust path as needed
import { deleteAsset, mediaFolders, uploadBuffer } from '../services/media.service.js';

export const createPopup = async (req, res) => {
    let uploadedAsset;
    try {
        const { title, status } = req.body;

        // Required field check (only title — photo is optional per schema)
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "title is required" });
        }

        if (req.file) uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.popups });
        const photo = uploadedAsset?.url;

        const popup = await PopupModel.create({
            title: title.trim(),
            photo,
            status,
        });

        return res.status(201).json({ success: true, message: "Popup created successfully", data: popup });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "title already exists" });
        }
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to create popup:", error);
        return res.status(500).json({ success: false, message: "Failed to create popup" });
    }
};

export const getAllPopups = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};
        if (status !== undefined) filter.status = status === "true";

        const popups = await PopupModel.find(filter);
        return res.status(200).json({ success: true, data: popups });
    } catch (error) {
        logError("Failed to fetch popups:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch popups" });
    }
};

export const getActivePopup = async (req, res) => {
    try {
        const popup = await PopupModel.findOne({ status: true }).sort({ createdAt: -1 });

        if (!popup) {
            return res.status(404).json({ success: false, message: "No active popup found" });
        }

        return res.status(200).json({ success: true, data: popup });
    } catch (error) {
        logError("Failed to fetch active popup:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch active popup",
        });
    }
};

export const getPopupById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid popup id" });
        }

        const popup = await PopupModel.findById(id);
        if (!popup) {
            return res.status(404).json({ success: false, message: "Popup not found" });
        }

        return res.status(200).json({ success: true, data: popup });
    } catch (error) {
        logError("Failed to fetch popup:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch popup" });
    }
};

export const updatePopup = async (req, res) => {
    let uploadedAsset;
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid popup id" });
        }

        const { title, status } = req.body;

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }

        const popup = await PopupModel.findById(id);
        if (!popup) {
            return res.status(404).json({ success: false, message: "Popup not found" });
        }

        const oldPhoto = popup.photo;

        if (req.file) {
            uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.popups });
            popup.photo = uploadedAsset.url;
        }
        if (title !== undefined) popup.title = title.trim();
        if (status !== undefined) popup.status = status;

        await popup.save();

        // Only remove the old image after the save has succeeded
        if (req.file && oldPhoto) await deleteAsset(oldPhoto);

        return res.status(200).json({ success: true, message: "Popup updated successfully", data: popup });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "title already exists" });
        }
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to update popup:", error);
        return res.status(500).json({ success: false, message: "Failed to update popup" });
    }
};

export const deletePopup = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid popup id" });
        }

        const popup = await PopupModel.findById(id);
        if (!popup) {
            return res.status(404).json({ success: false, message: "Popup not found" });
        }

        await PopupModel.findByIdAndDelete(id);

        // Only clean up the file after the DB delete succeeds
        if (popup.photo) await deleteAsset(popup.photo);

        return res.status(200).json({ success: true, message: "Popup deleted successfully" });
    } catch (error) {
        logError("Failed to delete popup:", error);
        return res.status(500).json({ success: false, message: "Failed to delete popup" });
    }
};

export const updatePopupStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid popup id" });
        }

        const popup = await PopupModel.findById(id);
        if (!popup) {
            return res.status(404).json({ success: false, message: "Popup not found" });
        }

        popup.status = !popup.status;
        await popup.save();

        return res.status(200).json({ success: true, message: "Popup status updated", data: popup });
    } catch (error) {
        logError("Failed to update popup status:", error);
        return res.status(500).json({ success: false, message: "Failed to update popup status" });
    }
};

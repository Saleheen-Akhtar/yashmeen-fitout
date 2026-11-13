import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PopupModel from '../models/popup.model.js'; // adjust path as needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute folder where popup images live on disk.
// IMPORTANT: the upload middleware (multer) must save into this same folder.
const uploadsDir = path.resolve(__dirname, '..', 'uploads', 'popups');

// Turn a stored value ("/popups/a.jpg", "popups/a.jpg" or "a.jpg") into a safe
// absolute path inside uploadsDir, or null if it would escape that folder.
const resolveUploadPath = (stored = '') => {
    try {
        const rel = decodeURIComponent(String(stored).split(/[?#]/)[0])
            .replace(/^\/+/, '')
            .replace(/^popups\//, '');
        if (!rel) return null;
        const full = path.resolve(uploadsDir, rel);
        return full.startsWith(uploadsDir + path.sep) ? full : null;
    } catch {
        return null;
    }
};

const deleteLocalFile = (stored) => {
    const fullPath = resolveUploadPath(stored);
    if (!fullPath) return;
    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error(`Failed to delete file: ${fullPath}`, err.message);
        }
    });
};

// Discard a file multer already wrote to disk for a request that failed.
const discardUpload = (req) => {
    if (req.file) deleteLocalFile(req.file.filename);
};

export const createPopup = async (req, res) => {
    try {
        const { title, status } = req.body;

        // Required field check (only title — photo is optional per schema)
        if (!title || !title.trim()) {
            discardUpload(req);
            return res.status(400).json({ success: false, message: "title is required" });
        }

        const photo = req.file ? `/popups/${req.file.filename}` : undefined;

        const popup = await PopupModel.create({
            title: title.trim(),
            photo,
            status,
        });

        return res.status(201).json({ success: true, message: "Popup created successfully", data: popup });
    } catch (error) {
        discardUpload(req);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "title already exists" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to create popup:", error);
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
        console.error("Failed to fetch popups:", error);
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
        console.error("Failed to fetch active popup:", error);
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
        console.error("Failed to fetch popup:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch popup" });
    }
};

export const updatePopup = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            discardUpload(req);
            return res.status(400).json({ success: false, message: "Invalid popup id" });
        }

        const { title, status } = req.body;

        if (title !== undefined && !title.trim()) {
            discardUpload(req);
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }

        const popup = await PopupModel.findById(id);
        if (!popup) {
            discardUpload(req);
            return res.status(404).json({ success: false, message: "Popup not found" });
        }

        const oldPhoto = popup.photo;

        if (req.file) popup.photo = `/popups/${req.file.filename}`;
        if (title !== undefined) popup.title = title.trim();
        if (status !== undefined) popup.status = status;

        await popup.save();

        // Only remove the old image after the save has succeeded
        if (req.file && oldPhoto) deleteLocalFile(oldPhoto);

        return res.status(200).json({ success: true, message: "Popup updated successfully", data: popup });
    } catch (error) {
        // Save failed -> remove the new image multer already wrote
        discardUpload(req);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "title already exists" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to update popup:", error);
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
        if (popup.photo) deleteLocalFile(popup.photo);

        return res.status(200).json({ success: true, message: "Popup deleted successfully" });
    } catch (error) {
        console.error("Failed to delete popup:", error);
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
        console.error("Failed to update popup status:", error);
        return res.status(500).json({ success: false, message: "Failed to update popup status" });
    }
};
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import GalleryModel from '../models/gallery.model.js'; // adjust path as needed

// Physical folder where multer saves files: <project>/uploads/gallery/<filename>
// The DB stores only "/gallery/<filename>" (relative to the uploads folder).
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const toDbPath = (file) => `/gallery/${file.filename}`;

// Deletes a file given the value stored in DB ("/gallery/abc.jpg").
// Also tolerates old records saved as "/uploads/gallery/abc.jpg".
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

export const createGallery = async (req, res) => {
    try {
        const { categoryId, title, status } = req.body;

        if (!categoryId) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "categoryId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "Invalid categoryId" });
        }
        if (!title || !title.trim()) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "title is required" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "photo is required" });
        }

        const gallery = await GalleryModel.create({
            categoryId,
            title: title.trim(),
            photo: toDbPath(req.file), // "/gallery/<filename>"
            status,
        });

        return res.status(201).json({ success: true, message: "Gallery item created successfully", data: gallery });
    } catch (error) {
        discardUpload(req.file);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to create gallery item:", error);
        return res.status(500).json({ success: false, message: "Failed to create gallery item" });
    }
};

export const getAllGalleries = async (req, res) => {
    try {
        const { categoryId, status } = req.query;

        const filter = {};
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ success: false, message: "Invalid categoryId" });
            }
            filter.categoryId = categoryId;
        }
        if (status !== undefined) filter.status = status === "true";

        const galleries = await GalleryModel.find(filter).populate('categoryId').lean();
        return res.status(200).json({ success: true, data: galleries });
    } catch (error) {
        console.error("Failed to fetch gallery items:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch gallery items" });
    }
};

export const getGalleryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid gallery id" });
        }

        const gallery = await GalleryModel.findById(id).populate('categoryId');
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }

        return res.status(200).json({ success: true, data: gallery });
    } catch (error) {
        console.error("Failed to fetch gallery item:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch gallery item" });
    }
};

export const updateGallery = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "Invalid gallery id" });
        }

        const { categoryId, title, status } = req.body;

        if (categoryId !== undefined) {
            if (!categoryId) {
                discardUpload(req.file);
                return res.status(400).json({ success: false, message: "categoryId cannot be empty" });
            }
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                discardUpload(req.file);
                return res.status(400).json({ success: false, message: "Invalid categoryId" });
            }
        }
        if (title !== undefined && !title.trim()) {
            discardUpload(req.file);
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }

        const gallery = await GalleryModel.findById(id);
        if (!gallery) {
            discardUpload(req.file);
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }

        const oldPhoto = gallery.photo;

        if (req.file) gallery.photo = toDbPath(req.file);
        if (categoryId !== undefined) gallery.categoryId = categoryId;
        if (title !== undefined) gallery.title = title.trim();
        if (status !== undefined) gallery.status = status;

        await gallery.save();

        // Delete the old image only after the new data is saved successfully
        if (req.file) deleteLocalFile(oldPhoto);

        return res.status(200).json({ success: true, message: "Gallery item updated successfully", data: gallery });
    } catch (error) {
        discardUpload(req.file);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to update gallery item:", error);
        return res.status(500).json({ success: false, message: "Failed to update gallery item" });
    }
};

export const deleteGallery = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid gallery id" });
        }

        const gallery = await GalleryModel.findByIdAndDelete(id);
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }

        deleteLocalFile(gallery.photo);

        return res.status(200).json({ success: true, message: "Gallery item deleted successfully" });
    } catch (error) {
        console.error("Failed to delete gallery item:", error);
        return res.status(500).json({ success: false, message: "Failed to delete gallery item" });
    }
};

export const updateGalleryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid gallery id" });
        }

        const gallery = await GalleryModel.findById(id);
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }

        gallery.status = !gallery.status

        await gallery.save()

        return res.status(200).json({ success: true, message: "Gallery item status updated", data: gallery });
    } catch (error) {
        console.error("Failed to update gallery item status:", error);
        return res.status(500).json({ success: false, message: "Failed to update gallery item status" });
    }
};
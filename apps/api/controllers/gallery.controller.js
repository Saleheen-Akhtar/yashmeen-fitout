import { logError } from "../utils/logger.js";
import mongoose from 'mongoose';
import GalleryModel from '../models/gallery.model.js'; // adjust path as needed
import { deleteAsset, mediaFolders, uploadBuffer } from '../services/media.service.js';

export const createGallery = async (req, res) => {
    let uploadedAsset;
    try {
        const { categoryId, title, status } = req.body;

        if (!categoryId) {
            return res.status(400).json({ success: false, message: "categoryId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid categoryId" });
        }
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "title is required" });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "photo is required" });
        }

        uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.gallery });
        const gallery = await GalleryModel.create({
            categoryId,
            title: title.trim(),
            photo: uploadedAsset.url,
            status,
        });

        return res.status(201).json({ success: true, message: "Gallery item created successfully", data: gallery });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to create gallery item:", error);
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
        logError("Failed to fetch gallery items:", error);
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
        logError("Failed to fetch gallery item:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch gallery item" });
    }
};

export const updateGallery = async (req, res) => {
    let uploadedAsset;
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid gallery id" });
        }

        const { categoryId, title, status } = req.body;

        if (categoryId !== undefined) {
            if (!categoryId) {
                return res.status(400).json({ success: false, message: "categoryId cannot be empty" });
            }
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ success: false, message: "Invalid categoryId" });
            }
        }
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }

        const gallery = await GalleryModel.findById(id);
        if (!gallery) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }

        const oldPhoto = gallery.photo;

        if (req.file) {
            uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.gallery });
            gallery.photo = uploadedAsset.url;
        }
        if (categoryId !== undefined) gallery.categoryId = categoryId;
        if (title !== undefined) gallery.title = title.trim();
        if (status !== undefined) gallery.status = status;

        await gallery.save();

        // Delete the old image only after the new data is saved successfully
        if (req.file) await deleteAsset(oldPhoto);

        return res.status(200).json({ success: true, message: "Gallery item updated successfully", data: gallery });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to update gallery item:", error);
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

        await deleteAsset(gallery.photo);

        return res.status(200).json({ success: true, message: "Gallery item deleted successfully" });
    } catch (error) {
        logError("Failed to delete gallery item:", error);
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
        logError("Failed to update gallery item status:", error);
        return res.status(500).json({ success: false, message: "Failed to update gallery item status" });
    }
};

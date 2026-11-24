import { logError } from "../utils/logger.js";
import mongoose from 'mongoose';
import ProjectModel from '../models/project.model.js'; // adjust path as needed
import CategoryModel from '../models/category.model.js';
import { deleteAssets, mediaFolders, uploadFiles } from '../services/media.service.js';

// videoUrl is optional. Empty string is allowed (means "no video");
// anything else must be a valid http(s) URL.
const isValidVideoUrl = (value) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return true;
    try {
        const { protocol } = new URL(trimmed);
        return protocol === 'http:' || protocol === 'https:';
    } catch {
        return false;
    }
};

// Optional text fields stored on the project (all plain strings)
const TEXT_FIELDS = ['size', 'location', 'scope', 'sector', 'duration'];

// Returns false if any provided text field is not a string
const hasValidTextFields = (body) =>
    TEXT_FIELDS.every((f) => body[f] === undefined || typeof body[f] === 'string');

export const createProject = async (req, res) => {
    let uploadedAssets = [];
    try {
        const { categoryId, title, description, videoUrl, isFeatured } = req.body;

        if (!categoryId) {
            return res.status(400).json({ success: false, message: "categoryId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Invalid categoryId" });
        }
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "title is required" });
        }

        if (videoUrl !== undefined && !isValidVideoUrl(videoUrl)) {
            return res.status(400).json({ success: false, message: "videoUrl must be a valid http(s) URL" });
        }

        if (!hasValidTextFields(req.body)) {
            return res.status(400).json({
                success: false,
                message: `${TEXT_FIELDS.join(", ")} must be text`,
            });
        }

        uploadedAssets = await uploadFiles(req.files || [], { folder: mediaFolders.projects });
        const images = uploadedAssets.map((asset) => asset.url);

        const data = {
            categoryId,
            title: title.trim(),
            videoUrl: videoUrl ? videoUrl.trim() : undefined,
            description,
            images,
            isFeatured: isFeatured === true || isFeatured === 'true' || isFeatured === 1 || isFeatured === '1',
        };

        // Empty strings are stored as "not set"
        TEXT_FIELDS.forEach((f) => {
            const value = req.body[f]?.trim();
            if (value) data[f] = value;
        });

        const project = await ProjectModel.create(data);

        return res.status(201).json({ success: true, message: "Project created successfully", data: project });
    } catch (error) {
        await deleteAssets(uploadedAssets);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to create project:", error);
        return res.status(500).json({ success: false, message: "Failed to create project" });
    }
};

export const getProjectsVersion = async (req, res) => {
    try {
        const [pCount, pLatest, cCount, cLatest] = await Promise.all([
            ProjectModel.countDocuments(),
            ProjectModel.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean(),
            CategoryModel.countDocuments(),
            CategoryModel.findOne().sort({ updatedAt: -1 }).select("updatedAt").lean(),
        ]);
        const pMs = pLatest?.updatedAt ? new Date(pLatest.updatedAt).getTime() : 0;
        const cMs = cLatest?.updatedAt ? new Date(cLatest.updatedAt).getTime() : 0;
        return res.status(200).json({ success: true, version: `${pCount}:${pMs}:${cCount}:${cMs}` });
    } catch (error) {
        logError("Failed to compute project version:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch project version" });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const { categoryId, isFeatured } = req.query;

        const filter = {};
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ success: false, message: "Invalid categoryId" });
            }
            filter.categoryId = categoryId;
        }
        if (isFeatured !== undefined) {
            filter.isFeatured = isFeatured === 'true' || isFeatured === true || isFeatured === '1' || isFeatured === 1;
        }

        const projects = await ProjectModel.find(filter).populate('categoryId').sort({ isFeatured: -1, createdAt: -1 });
        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        logError("Failed to fetch projects:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch projects" });
    }
};

export const getProjectById = async (req, res) => {
    try {        
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid project id" });
        }

        const project = await ProjectModel.findById(id).populate('categoryId');
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        return res.status(200).json({ success: true, data: project });
    } catch (error) {
        logError("Failed to fetch project:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
};

export const updateProject = async (req, res) => {
    let uploadedAssets = [];
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid project id" });
        }

        const { categoryId, title, description, videoUrl, isFeatured } = req.body;

        if (videoUrl !== undefined && !isValidVideoUrl(videoUrl)) {
            return res.status(400).json({ success: false, message: "videoUrl must be a valid http(s) URL" });
        }

        if (!hasValidTextFields(req.body)) {
            return res.status(400).json({
                success: false,
                message: `${TEXT_FIELDS.join(", ")} must be text`,
            });
        }

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

        const project = await ProjectModel.findById(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const oldImages = [...(project.images || [])];
        uploadedAssets = await uploadFiles(req.files || [], { folder: mediaFolders.projects });
        const newUploadedPaths = uploadedAssets.map((asset) => asset.url);

        let keptImages = oldImages;
        let hasExplicitExisting = false;
        if (req.body.existingImages !== undefined) {
            try {
                const parsed = typeof req.body.existingImages === 'string'
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages;
                if (Array.isArray(parsed)) {
                    keptImages = parsed.filter((item) => typeof item === 'string' && item.trim().length > 0);
                    hasExplicitExisting = true;
                }
            } catch {
                // Ignore malformed existingImages payload and fall back safely
            }
        }

        let removedImages = [];
        if (hasExplicitExisting) {
            project.images = [...keptImages, ...newUploadedPaths];
            removedImages = oldImages.filter((img) => !keptImages.includes(img));
        } else if (newUploadedPaths.length > 0) {
            project.images = newUploadedPaths;
            removedImages = oldImages;
        }

        if (categoryId !== undefined) project.categoryId = categoryId;
        if (title !== undefined) project.title = title.trim();
        if (videoUrl !== undefined) project.videoUrl = videoUrl.trim(); // "" clears the video
        if (description !== undefined) project.description = description;
        if (isFeatured !== undefined) {
            project.isFeatured = isFeatured === true || isFeatured === 'true' || isFeatured === 1 || isFeatured === '1';
        }

        // size / location / scope / sector: sent -> updated ("" clears it), not sent -> untouched
        TEXT_FIELDS.forEach((f) => {
            if (req.body[f] !== undefined) project[f] = req.body[f].trim();
        });

        await project.save();

        // Delete removed images only after the new data is saved successfully
        if (removedImages.length > 0) await deleteAssets(removedImages);

        return res.status(200).json({ success: true, message: "Project updated successfully", data: project });
    } catch (error) {
        await deleteAssets(uploadedAssets);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to update project:", error);
        return res.status(500).json({ success: false, message: "Failed to update project" });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid project id" });
        }

        const project = await ProjectModel.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        await deleteAssets(project.images);

        return res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        logError("Failed to delete project:", error);
        return res.status(500).json({ success: false, message: "Failed to delete project" });
    }
};

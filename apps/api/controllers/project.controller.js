import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import ProjectModel from '../models/project.model.js'; // adjust path as needed
import CategoryModel from '../models/category.model.js';

// Physical folder where multer saves files: <project>/uploads/projects/<filename>
// The DB stores only "/projects/<filename>" (relative to the uploads folder).
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const toDbPath = (file) => `/projects/${file.filename}`;

// Deletes a file given the value stored in DB ("/projects/abc.jpg").
// Also tolerates old records saved as "/uploads/projects/abc.jpg".
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

const deleteLocalFiles = (photos = []) => photos.forEach(deleteLocalFile);

// Removes files multer just saved (used when validation fails after upload)
const discardUploads = (files) => {
    if (!Array.isArray(files)) return;
    files.forEach((file) => {
        if (file?.path) fs.unlink(file.path, () => {});
    });
};

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
const TEXT_FIELDS = ['size', 'location', 'scope', 'sector'];

// Returns false if any provided text field is not a string
const hasValidTextFields = (body) =>
    TEXT_FIELDS.every((f) => body[f] === undefined || typeof body[f] === 'string');

export const createProject = async (req, res) => {
    try {
        const { categoryId, title, description, videoUrl } = req.body;

        if (!categoryId) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "categoryId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "Invalid categoryId" });
        }
        if (!title || !title.trim()) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "title is required" });
        }

        if (videoUrl !== undefined && !isValidVideoUrl(videoUrl)) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "videoUrl must be a valid http(s) URL" });
        }

        if (!hasValidTextFields(req.body)) {
            discardUploads(req.files);
            return res.status(400).json({
                success: false,
                message: `${TEXT_FIELDS.join(", ")} must be text`,
            });
        }

        const images = (req.files || []).map(toDbPath); // "/projects/<filename>"

        const data = {
            categoryId,
            title: title.trim(),
            videoUrl: videoUrl ? videoUrl.trim() : undefined,
            description,
            images,
        };

        // Empty strings are stored as "not set"
        TEXT_FIELDS.forEach((f) => {
            const value = req.body[f]?.trim();
            if (value) data[f] = value;
        });

        const project = await ProjectModel.create(data);

        return res.status(201).json({ success: true, message: "Project created successfully", data: project });
    } catch (error) {
        discardUploads(req.files);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to create project:", error);
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
        console.error("Failed to compute project version:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch project version" });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const { categoryId } = req.query;

        const filter = {};
        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ success: false, message: "Invalid categoryId" });
            }
            filter.categoryId = categoryId;
        }

        const projects = await ProjectModel.find(filter).populate('categoryId').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: projects });
    } catch (error) {
        console.error("Failed to fetch projects:", error);
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
        console.error("Failed to fetch project:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch project" });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "Invalid project id" });
        }

        const { categoryId, title, description, videoUrl } = req.body;

        if (videoUrl !== undefined && !isValidVideoUrl(videoUrl)) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "videoUrl must be a valid http(s) URL" });
        }

        if (!hasValidTextFields(req.body)) {
            discardUploads(req.files);
            return res.status(400).json({
                success: false,
                message: `${TEXT_FIELDS.join(", ")} must be text`,
            });
        }

        if (categoryId !== undefined) {
            if (!categoryId) {
                discardUploads(req.files);
                return res.status(400).json({ success: false, message: "categoryId cannot be empty" });
            }
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                discardUploads(req.files);
                return res.status(400).json({ success: false, message: "Invalid categoryId" });
            }
        }
        if (title !== undefined && !title.trim()) {
            discardUploads(req.files);
            return res.status(400).json({ success: false, message: "title cannot be empty" });
        }

        const project = await ProjectModel.findById(id);
        if (!project) {
            discardUploads(req.files);
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const oldImages = [...(project.images || [])];
        const newUploadedPaths = (req.files || []).map(toDbPath);

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

        // size / location / scope / sector: sent -> updated ("" clears it), not sent -> untouched
        TEXT_FIELDS.forEach((f) => {
            if (req.body[f] !== undefined) project[f] = req.body[f].trim();
        });

        await project.save();

        // Delete removed images only after the new data is saved successfully
        if (removedImages.length > 0) deleteLocalFiles(removedImages);

        return res.status(200).json({ success: true, message: "Project updated successfully", data: project });
    } catch (error) {
        discardUploads(req.files);
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to update project:", error);
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

        deleteLocalFiles(project.images);

        return res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Failed to delete project:", error);
        return res.status(500).json({ success: false, message: "Failed to delete project" });
    }
};

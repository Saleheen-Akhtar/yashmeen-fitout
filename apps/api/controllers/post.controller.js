import { logError } from "../utils/logger.js";
import mongoose from "mongoose";

import { convertTitleUrl } from "../utils/control.js";
import PostModel from "../models/post.model.js";
import { isAdminRequest } from "../middlewares/auth.js";
import { deleteAsset, deleteAssets, mediaFolders, uploadBuffer } from "../services/media.service.js";
import { blogTextContent, sanitizeBlogHtml } from "../utils/sanitizeBlogHtml.js";

const extractContentImages = (content = "") =>
    [...String(content).matchAll(/<img[^>]+src=["']([^"']+)["']/g)]
        .map((match) => match[1])
        .filter((src) => /^https:\/\/res\.cloudinary\.com\//i.test(src));

const cleanPublishedContent = (content) => {
    const sanitized = sanitizeBlogHtml(content);
    if (!blogTextContent(sanitized)) {
        const error = new Error("Readable article content is required.");
        error.status = 400;
        throw error;
    }
    return sanitized;
};

export const createPost = async (req, res) => {
    let uploadedAsset;
    try {
        const { _id } = req.account;
        const { title, content } = req.body;
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ message: "Title is required." });
        }
        const sanitizedContent = cleanPublishedContent(content);
        if (req.file) uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.posts });
        const post = await PostModel.create({
            title: title.trim(),
            pageUrl: convertTitleUrl(title.trim()),
            content: sanitizedContent,
            authorId: _id,
            file: uploadedAsset?.url || "",
        });
        return res.status(201).json({ status: "success", data: post });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        logError("Error creating post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getPosts = async (req, res) => {
    try {
        const isAdmin = await isAdminRequest(req);
        const posts = await PostModel.find(isAdmin ? {} : { status: true }).sort({ createdAt: -1 });
        return res.status(200).json({ data: posts });
    } catch (error) {
        logError("Error fetching posts:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getActivePosts = async (_req, res) => {
    try {
        const posts = await PostModel.find({ status: true }).sort({ createdAt: -1 });
        return res.status(200).json({ data: posts });
    } catch (error) {
        logError("Error fetching active posts:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getPostDetailsById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid post id." });
        const post = await PostModel.findById(id);
        if (!post || (!post.status && !(await isAdminRequest(req)))) {
            return res.status(404).json({ message: "Post not found." });
        }
        return res.status(200).json({ data: post });
    } catch (error) {
        logError("Error fetching post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getPostDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        if (typeof slug !== "string" || !slug.trim()) return res.status(400).json({ message: "Invalid post slug." });
        const post = await PostModel.findOne({ pageUrl: slug.trim() });
        if (!post || (!post.status && !(await isAdminRequest(req)))) {
            return res.status(404).json({ message: "Post not found." });
        }
        return res.status(200).json({ data: post });
    } catch (error) {
        logError("Error fetching post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const updatePostById = async (req, res) => {
    let uploadedAsset;
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid post id." });
        const { title, content } = req.body;
        const post = await PostModel.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        const oldFeaturedFile = post.file;
        const oldContentImages = extractContentImages(post.content);
        let sanitizedContent;

        if (title !== undefined) {
            if (typeof title !== "string" || !title.trim()) return res.status(400).json({ message: "Title is required." });
            post.title = title.trim();
            post.pageUrl = convertTitleUrl(title.trim());
        }
        if (content !== undefined) {
            sanitizedContent = cleanPublishedContent(content);
            post.content = sanitizedContent;
        }
        if (req.file) {
            uploadedAsset = await uploadBuffer(req.file.buffer, { folder: mediaFolders.posts });
            post.file = uploadedAsset.url;
        }

        await post.save();

        if (req.file && oldFeaturedFile) await deleteAsset(oldFeaturedFile);
        if (content !== undefined) {
            const newContentImages = extractContentImages(sanitizedContent);
            await deleteAssets(oldContentImages.filter((image) => !newContentImages.includes(image)));
        }
        return res.status(200).json({ message: "Post updated successfully." });
    } catch (error) {
        await deleteAsset(uploadedAsset);
        if (error.status === 400 || error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        logError("Error updating post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid post id." });
        const post = await PostModel.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found." });
        if (!post.status && !blogTextContent(post.content)) {
            return res.status(400).json({ message: "Readable article content is required before publishing." });
        }
        post.status = !post.status;
        await post.save();
        return res.status(200).json({ message: "Post status updated successfully." });
    } catch (error) {
        logError("Error updating post status:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const deletePost = async (req, res) => {
    try {
        const id = req.params.id ?? req.params.postId;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid post id." });
        const post = await PostModel.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        await PostModel.findByIdAndDelete(id);
        await deleteAssets([post.file, ...extractContentImages(post.content)]);
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        logError("Error deleting post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

import path from "path";
import { fileURLToPath } from "url";

import { convertTitleUrl } from "../utils/control.js";
import PostModel from "../models/post.model.js";
import { deleteFile } from "../middlewares/postUpload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path of the folder where post images live on disk.
// IMPORTANT: the upload middleware must save into this same folder.
const uploadsDir = path.resolve(__dirname, "..", "uploads", "posts");

// Turn a stored value ("/posts/a.jpg", "posts/a.jpg" or "a.jpg") into a safe
// absolute path inside uploadsDir, or null if it would escape that folder.
const resolveUploadPath = (stored = "") => {
    try {
        const rel = decodeURIComponent(String(stored).split(/[?#]/)[0])
            .replace(/^\/+/, "")
            .replace(/^posts\//, "");
        if (!rel) return null;
        const full = path.resolve(uploadsDir, rel);
        return full.startsWith(uploadsDir + path.sep) ? full : null;
    } catch {
        return null;
    }
};

const removeUploadedFiles = (names = []) => {
    names.filter(Boolean).forEach((name) => {
        const full = resolveUploadPath(name);
        if (full) deleteFile(full);
    });
};

// Pull every filename referenced by an <img> tag that points at our own
// /uploads/posts/ folder, so we can tell which files a post's content uses.
const extractContentImages = (content = "") => {
    if (!content) return [];
    return [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/g)]
        .map((m) => m[1])
        .filter((src) => src.includes("/uploads/posts/"))
        .map((src) => src.split("/uploads/posts/").pop());
};

export const createPost = async (req, res) => {
    try {
        const { _id } = req?.account;
        const { title, content } = req.body;
        const convertTitle = convertTitleUrl(title);
        const newPost = {
            title,
            pageUrl: convertTitle,
            content,
            authorId: _id,
            file: req.file ? `/posts/${req.file.filename}` : "",
        };
        const post = await PostModel.insertOne(newPost);
        res.status(201).json({ status: "success", data: post });
    } catch (err) {
        console.error("Error creating post:", err);
        // Roll back the featured image that multer already wrote to disk
        if (req.file) {
            removeUploadedFiles([req.file.filename]);
        }
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getPosts = async (req, res) => {
    try {
        const post = await PostModel.find();
        return res.status(200).json({ data: post });
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getActivePosts = async (req, res) => {
    try {
        const post = await PostModel.find({ status: true });
        return res.status(200).json({ data: post });
    } catch (err) {
        console.error("Error fetching active posts:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getPostDetailsById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await PostModel.findOne({ _id: id });
        return res.status(200).json({ data: post });
    } catch (err) {
        console.error("Error fetching post:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const getPostDetails = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await PostModel.findOne({ pageUrl: slug });
        return res.status(200).json({ data: post });
    } catch (err) {
        console.error("Error fetching post:", err);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const updatePostById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const post = await PostModel.findById(id);
        if (!post) {
            // Nothing to update -> discard the upload multer already saved
            if (req.file) removeUploadedFiles([req.file.filename]);
            return res.status(404).json({ message: "Post not found." });
        }

        // Snapshot what's currently on disk for this post before we touch anything
        const oldFeaturedFile = post.file;
        const oldContentImages = extractContentImages(post.content);

        post.title = title ? title : post.title;
        post.pageUrl = title ? convertTitleUrl(title) : post.pageUrl;
        post.content = content ? content : post.content;
        // Same format as createPost ("/posts/<filename>")
        post.file = req.file ? `/posts/${req.file.filename}` : post.file;

        await post.save();

        // Only remove old files once the save has actually succeeded

        // Featured image was replaced -> drop the old one
        if (req.file && oldFeaturedFile) {
            removeUploadedFiles([oldFeaturedFile]);
        }

        // Content was replaced -> drop embedded images no longer referenced
        if (content) {
            const newContentImages = extractContentImages(content);
            const removedImages = oldContentImages.filter(
                (img) => !newContentImages.includes(img)
            );
            removeUploadedFiles(removedImages);
        }

        return res.status(200).json({ message: "Post update successfully." });
    } catch (error) {
        console.error("Error updating Post:", error);
        // Save failed -> roll back the new featured image multer already wrote
        if (req.file) {
            removeUploadedFiles([req.file.filename]);
        }
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const updatePostStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await PostModel.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found." });

        post.status = !post.status;
        await post.save();
        return res.status(200).json({ message: "Post status updated successfully." });
    } catch (error) {
        console.error("Error updating Post status:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

export const deletePost = async (req, res) => {
    try {
        // Works with either route style: /delete/:id or /delete/:postId
        const id = req.params.id ?? req.params.postId;

        const isExist = await PostModel.findById(id);
        if (!isExist) return res.status(404).json({ message: "Post not found" });

        await PostModel.findByIdAndDelete(id);

        // Only clean up files after the DB delete succeeds
        removeUploadedFiles([
            isExist.file,
            ...extractContentImages(isExist.content),
        ]);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting Post:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
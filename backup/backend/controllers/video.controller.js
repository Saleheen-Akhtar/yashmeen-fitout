import mongoose from "mongoose";
import VideosModel from "../models/video.model.js"; // adjust path as needed

const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/i;

export const createVideo = async (req, res) => {
  try {
    const { categoryId, title, path, status } = req.body;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "categoryId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid categoryId" });
    }
    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "title is required" });
    }
    if (!path || !path.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "path (YouTube link) is required" });
    }
    if (!YOUTUBE_URL_REGEX.test(path.trim())) {
      return res
        .status(400)
        .json({ success: false, message: "path must be a valid YouTube URL" });
    }

    const video = await VideosModel.create({
      categoryId,
      title: title.trim(),
      path: path.trim(),
      status,
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Video created successfully",
        data: video,
      });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to create video",
        error: error.message,
      });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const { categoryId, status } = req.query;

    const filter = {};
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid categoryId" });
      }
      filter.categoryId = categoryId;
    }
    if (status !== undefined) filter.status = status === "true";

    const videos = await VideosModel.find(filter).populate("categoryId");
    return res.status(200).json({ success: true, data: videos });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch videos",
        error: error.message,
      });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video id" });
    }

    const video = await VideosModel.findById(id).populate("categoryId");
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    return res.status(200).json({ success: true, data: video });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch video",
        error: error.message,
      });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video id" });
    }

    const { categoryId, title, path, status } = req.body;

    if (categoryId !== undefined) {
      if (!categoryId) {
        return res
          .status(400)
          .json({ success: false, message: "categoryId cannot be empty" });
      }
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid categoryId" });
      }
    }
    if (title !== undefined && !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "title cannot be empty" });
    }
    if (path !== undefined) {
      if (!path.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "path cannot be empty" });
      }
      if (!YOUTUBE_URL_REGEX.test(path.trim())) {
        return res
          .status(400)
          .json({
            success: false,
            message: "path must be a valid YouTube URL",
          });
      }
    }

    const video = await VideosModel.findById(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    if (categoryId !== undefined) video.categoryId = categoryId;
    if (title !== undefined) video.title = title.trim();
    if (path !== undefined) video.path = path.trim();
    if (status !== undefined) video.status = status;

    await video.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Video updated successfully",
        data: video,
      });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update video",
        error: error.message,
      });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video id" });
    }

    const video = await VideosModel.findByIdAndDelete(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete video",
        error: error.message,
      });
  }
};

export const updateVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid video id" });
    }

    const video = await VideosModel.findById(id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    video.status = !video.status;
    await video.save();

    return res
      .status(200)
      .json({ success: true, message: "Video status updated", data: video });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to update video status",
        error: error.message,
      });
  }
};

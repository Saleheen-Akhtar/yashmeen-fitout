import mongoose from "mongoose";
import QuoteModel from "../models/quotes.model.js"; // adjust path to your model file
import { sendQuotationEmail } from "../middlewares/sendEmail.js";

const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Hospitality",
  "Retail",
  "Other",
];

// ---------- helpers ----------

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Turns a Mongoose ValidationError into a readable { field: message } object
const formatValidationError = (error) =>
  Object.fromEntries(
    Object.entries(error.errors).map(([field, err]) => [field, err.message]),
  );

const handleError = (res, error, fallbackMessage) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationError(error),
    });
  }
  console.error(`${fallbackMessage}:`, error);
  return res.status(500).json({ success: false, message: fallbackMessage });
};

// services can arrive as an array, a comma-separated string, or a single string
const normalizeServices = (services) => {
  if (Array.isArray(services)) return services;
  if (typeof services === "string" && services.trim()) {
    return services
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

// ---------- controllers ----------

// POST /api/quotes  (public)
export const createQuote = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      projectType,
      services,
      location,
      budget,
      timeline,
      message,
    } = req.body;

    const quote = await QuoteModel.create({
      name,
      mobile,
      email,
      projectType,
      services: normalizeServices(services),
      location,
      budget,
      timeline,
      message,
    });

    try {
      await sendQuotationEmail(quote);
    } catch (emailError) {
      console.error("Failed to send enquiry email:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Quote request submitted successfully",
      data: quote,
    });
  } catch (error) {
    return handleError(res, error, "Failed to submit quote request");
  }
};

// GET /api/quotes  (admin)
// Query params: page, limit, projectType, search, from, to
export const getAllQuotes = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100,
    );
    const { projectType, search, from, to } = req.query;

    const filter = {};

    if (projectType) {
      if (!PROJECT_TYPES.includes(projectType)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid project type" });
      }
      filter.projectType = projectType;
    }

    if (search?.trim()) {
      // escape regex special characters so user input is treated literally
      const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { mobile: regex },
        { location: regex },
      ];
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const [quotes, total] = await Promise.all([
      QuoteModel.find(filter)
        .sort({ createdAt: -1 }) // uses the createdAt index
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QuoteModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: quotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch quote requests");
  }
};

// GET /api/quotes/:id  (admin)
export const getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quote ID" });
    }

    const quote = await QuoteModel.findById(id).lean();
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote request not found" });
    }

    return res.status(200).json({ success: true, data: quote });
  } catch (error) {
    return handleError(res, error, "Failed to fetch quote request");
  }
};

// DELETE /api/quotes/:id  (admin)
export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quote ID" });
    }

    const deleted = await QuoteModel.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Quote request not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Quote request deleted" });
  } catch (error) {
    return handleError(res, error, "Failed to delete quote request");
  }
};

// DELETE /api/quotes/old?days=90  (admin)
// Removes quotes older than N days (default 90) - the "delete-old query" on createdAt
export const deleteOldQuotes = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 90;
    if (days < 1) {
      return res
        .status(400)
        .json({ success: false, message: "days must be at least 1" });
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await QuoteModel.deleteMany({ createdAt: { $lt: cutoff } });

    return res.status(200).json({
      success: true,
      message: `Deleted quote requests older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete old quote requests");
  }
};

// DELETE /api/quotes/older-than-month  (admin)
// Removes every quote created more than one calendar month ago
export const deleteQuotesOlderThanOneMonth = async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 1);

    const result = await QuoteModel.deleteMany({ createdAt: { $lt: cutoff } });

    return res.status(200).json({
      success: true,
      message: "Deleted all quote requests older than one month",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to delete quote requests older than one month",
    );
  }
};

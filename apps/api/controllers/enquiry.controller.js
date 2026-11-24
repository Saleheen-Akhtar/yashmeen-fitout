import { logError } from "../utils/logger.js";
import mongoose from 'mongoose';
import EnquiryModel from '../models/enquiry.model.js';
import { sendEnquiryEmail } from '../middlewares/sendEmail.js';
import { handlePublicSubmissionTrap } from '../utils/publicSubmission.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const CRM_STAGES = ["leads", "feasibility", "proposal", "construction", "completed"];

export const createEnquiry = async (req, res) => {
    try {
        if (handlePublicSubmissionTrap(req, res)) return;
        const { name, mobile, email, services, message } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ success: false, message: "name is required" });
        }
        if (typeof mobile !== "string" || !mobile.trim()) {
            return res.status(400).json({ success: false, message: "mobile is required" });
        }
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ success: false, message: "email is required" });
        }
        if (!EMAIL_REGEX.test(email.trim())) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        if (typeof services !== "string" || !services.trim()) {
            return res.status(400).json({ success: false, message: "services is required" });
        }

        const enquiry = await EnquiryModel.create({
            name: name.trim(),
            mobile: mobile.trim(),
            email: email.trim(),
            services: services.trim(),
            message: typeof message === "string" ? message : undefined,
        });

        // Send email notification — don't let email failure block the saved enquiry
        try {
            await sendEnquiryEmail(enquiry);
        } catch (emailError) {
            logError("Failed to send enquiry email:", emailError);
        }

        return res.status(201).json({ success: true, message: "Enquiry submitted successfully" });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to submit enquiry:", error);
        return res.status(500).json({ success: false, message: "Failed to submit enquiry" });
    }
};

export const getAllEnquiries = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
        const filter = { archivedAt: null };

        if (req.query.search?.trim()) {
            const safe = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(safe, "i");
            filter.$or = [
                { name: regex },
                { mobile: regex },
                { email: regex },
                { services: regex },
            ];
        }

        const [enquiries, total] = await Promise.all([
            EnquiryModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            EnquiryModel.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            data: enquiries,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        logError("Failed to fetch enquiries:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
    }
};

export const updateEnquiryStage = async (req, res) => {
    try {
        const { id } = req.params;
        const { stage } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid enquiry ID" });
        }
        if (!CRM_STAGES.includes(stage)) {
            return res.status(400).json({ success: false, message: "Invalid CRM stage" });
        }
        const enquiry = await EnquiryModel.findByIdAndUpdate(
            id,
            { $set: { crmStage: stage } },
            { returnDocument: "after", runValidators: true },
        ).lean();
        if (!enquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }
        return res.status(200).json({ success: true, data: enquiry });
    } catch (error) {
        logError("Failed to update enquiry stage:", error);
        return res.status(500).json({ success: false, message: "Failed to update enquiry stage" });
    }
};

export const deleteOldEnquiries = async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 1);

    const result = await EnquiryModel.updateMany(
      { createdAt: { $lt: cutoff }, archivedAt: null },
      { $set: { archivedAt: new Date() } },
    );

    res.status(200).json({
      message: `Archived ${result.modifiedCount} enquiries older than one month.`,
      archivedCount: result.modifiedCount,
      cutoffDate: cutoff,
    });
  } catch (err) {
    logError("Failed to delete old enquiries:", err);
    res.status(500).json({ message: "Could not delete old enquiries." });
  }
};

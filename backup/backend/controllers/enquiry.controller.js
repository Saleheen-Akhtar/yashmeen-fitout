import mongoose from 'mongoose';
import EnquiryModel from '../models/enquiry.model.js';
import { sendEnquiryEmail } from '../middlewares/sendEmail.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export const createEnquiry = async (req, res) => {
    try {
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
            console.error("Failed to send enquiry email:", emailError.message);
        }

        return res.status(201).json({ success: true, message: "Enquiry submitted successfully", data: enquiry });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to submit enquiry:", error);
        return res.status(500).json({ success: false, message: "Failed to submit enquiry" });
    }
};

export const getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await EnquiryModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: enquiries });
    } catch (error) {
        console.error("Failed to fetch enquiries:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
    }
};

export const deleteOldEnquiries = async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 1);

    const result = await EnquiryModel.deleteMany({ createdAt: { $lt: cutoff } });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} enquiries older than one month.`,
      deletedCount: result.deletedCount,
      cutoffDate: cutoff,
    });
  } catch (err) {
    console.error("Failed to delete old enquiries:", err);
    res.status(500).json({ message: "Could not delete old enquiries." });
  }
};
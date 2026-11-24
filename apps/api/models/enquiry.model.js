import mongoose from "mongoose";

const CRM_STAGES = ["leads", "feasibility", "proposal", "construction", "completed"];

const enquirySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        maxlength: 32,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        maxlength: 254,
    },
    services: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    message: {
        type: String,
        trim: true,
        maxlength: 5000,
    },
    crmStage: {
        type: String,
        enum: CRM_STAGES,
        default: "leads",
        index: true,
    },
    archivedAt: { type: Date, default: null },
}, { versionKey: false, timestamps: true });

enquirySchema.index({ archivedAt: 1, createdAt: -1 });

const EnquiryModel = mongoose.model("enquiry", enquirySchema);

export default EnquiryModel;

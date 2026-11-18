import mongoose from "mongoose";

const PROJECT_TYPES = ["Residential", "Commercial", "Hospitality", "Retail", "Other"];

const quoteSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 120,
        },
        mobile: {
            type: String,
            required: [true, "Mobile number is required"],
            trim: true,
            maxlength: 32,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
            maxlength: 254,
        },
        projectType: {
            type: String,
            required: [true, "Project type is required"],
            enum: {
                values: PROJECT_TYPES,
                message: "Invalid project type",
            },
        },
        // The page lets visitors tick several services, so this is an array.
        services: {
            type: [{ type: String, trim: true }],
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: "Select at least one service",
            },
        },
        location: {
            type: String,
            trim: true,
            default: "",
            maxlength: 200,
        },
        budget: {
            type: String,
            trim: true,
            default: "",
            maxlength: 120,
        },
        timeline: {
            type: String,
            trim: true,
            default: "",
            maxlength: 120,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [10, "Message must be at least 10 characters"],
            maxlength: [5000, "Message must be 5000 characters or less"],
        },
        archivedAt: { type: Date, default: null },
    },
    { versionKey: false, timestamps: true }
);

// Fast active listing and archive queries on createdAt.
quoteSchema.index({ archivedAt: 1, createdAt: -1 });

const QuoteModel = mongoose.model("quote", quoteSchema);

export default QuoteModel;

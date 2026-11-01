import mongoose from "mongoose";

const enquirySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    services: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        trim: true,
    },
}, { versionKey: false, timestamps: true });

const EnquiryModel = mongoose.model("enquiry", enquirySchema);

export default EnquiryModel;
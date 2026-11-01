import mongoose from 'mongoose';

const socialLinkSchema = mongoose.Schema(
    {
        platform: { type: String, required: true, trim: true, lowercase: true },
        url: {
            type: String,
            required: true,
            trim: true,
            match: [/^https?:\/\/.+/, 'Invalid URL format']
        }
    },
    { _id: false }
);

const webDetailsSchema = mongoose.Schema(
    {
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'IndiaUSA' }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        mobile: { type: String, trim: true },
        whatsapp: { type: String, trim: true },
        socialLinks: [socialLinkSchema]
    },
    { timestamps: false, versionKey: false }
);

const WebDetailsModel = mongoose.model('WebDetails', webDetailsSchema);

export default WebDetailsModel;
import mongoose from 'mongoose';

const bannerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        trim: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: false, versionKey: false })

const BannerModel = mongoose.model('banner', bannerSchema);
export default BannerModel;
import mongoose from 'mongoose';

const gallerySchema = mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    photo: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: false, versionKey: false })

const GalleryModel = mongoose.model('gallery', gallerySchema);
export default GalleryModel;
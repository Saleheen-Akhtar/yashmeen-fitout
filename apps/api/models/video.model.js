import mongoose from 'mongoose';

const videoSchema = mongoose.Schema({
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
    path: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { versionKey: false })

const VideosModel = mongoose.model('Videos', videoSchema);
export default VideosModel;

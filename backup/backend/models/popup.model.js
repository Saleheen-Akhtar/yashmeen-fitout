import mongoose from "mongoose";

const popupSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    photo: {
        type: String,
        trim: true,
    },
    status: {
        type: Boolean,
        default: false,
    }
}, { versionKey: false });

const PopupModel = mongoose.model('popup', popupSchema);

export default PopupModel
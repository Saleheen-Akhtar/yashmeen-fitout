import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    pageUrl: { type: String },
    file: String,
    content: { type: String, required: true },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false });

const PostModel = mongoose.model("Post", postSchema);

export default PostModel
import mongoose from "mongoose";

const categorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: Boolean,
        default: true,
    }
}, { versionKey: false });

const CategoryModel = mongoose.model('category', categorySchema);

export default CategoryModel
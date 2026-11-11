import mongoose from 'mongoose';
import CategoryModel from '../models/category.model.js';

export const createCategory = async (req, res) => {
    try {
        const { categoryName, status } = req.body;

        if (!categoryName || !categoryName.trim()) {
            return res.status(400).json({ success: false, message: "categoryName is required" });
        }

        const category = await CategoryModel.create({
            categoryName: categoryName.trim(),
            status,
        });

        return res.status(201).json({ success: true, message: "Category created successfully", data: category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "categoryName already exists" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to create category:", error);
        return res.status(500).json({ success: false, message: "Failed to create category" });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const { status } = req.query; const filter = {}; if (status !== undefined) filter.status = status === "true";
        const categories = await CategoryModel.find(filter).sort({ categoryName: 1 }).lean();

        return res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch categories" });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid category id" });
        }

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch category" });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid category id" });
        }

        const { categoryName, status } = req.body;

        if (categoryName !== undefined && !categoryName.trim()) {
            return res.status(400).json({ success: false, message: "categoryName cannot be empty" });
        }

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (categoryName !== undefined) category.categoryName = categoryName.trim();
        if (status !== undefined) category.status = status;

        await category.save();

        return res.status(200).json({ success: true, message: "Category updated successfully", data: category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "categoryName already exists" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to update category:", error);
        return res.status(500).json({ success: false, message: "Failed to update category" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid category id" });
        }

        const category = await CategoryModel.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Failed to delete category:", error);
        return res.status(500).json({ success: false, message: "Failed to delete category" });
    }
};

export const updateCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid category id" });
        }

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.status = !category.status;
        await category.save();

        return res.status(200).json({ success: true, message: "Category status updated", data: category });
    } catch (error) {
        console.error("Failed to update category status:", error);
        return res.status(500).json({ success: false, message: "Failed to update category status" });
    }
};
import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    updateCategoryStatus,
} from '../controllers/category.controller.js';
import { protect, adminOnly } from "../middlewares/auth.js";

const categoryRouter = express.Router();

categoryRouter.post('/create', protect, adminOnly, createCategory);
categoryRouter.get('/getAll', getAllCategories);
categoryRouter.get('/getById/:id', getCategoryById);
categoryRouter.put('/update/:id', protect, adminOnly, updateCategory);
categoryRouter.patch('/status/:id', protect, adminOnly, updateCategoryStatus);
categoryRouter.delete('/delete/:id', protect, adminOnly, deleteCategory);

export default categoryRouter;
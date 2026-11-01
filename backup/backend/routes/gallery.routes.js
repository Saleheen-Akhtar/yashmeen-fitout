import express from 'express';
import {
    createGallery,
    getAllGalleries,
    getGalleryById,
    updateGallery,
    deleteGallery,
    updateGalleryStatus,
} from '../controllers/gallery.controller.js';
import { uploadGalleryPhoto } from '../middlewares/multer.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const galleryRouter = express.Router();

galleryRouter.post('/create', protect, adminOnly, uploadGalleryPhoto.single('photo'), createGallery);
galleryRouter.get('/getAll', getAllGalleries);
galleryRouter.get('/getById/:id', getGalleryById);
galleryRouter.put('/update/:id', protect, adminOnly, uploadGalleryPhoto.single('photo'), updateGallery);
galleryRouter.patch('/status/:id', protect, adminOnly, updateGalleryStatus);
galleryRouter.delete('/delete/:id', protect, adminOnly, deleteGallery);

export default galleryRouter;

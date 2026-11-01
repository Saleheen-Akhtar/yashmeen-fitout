import express from 'express';
import {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
    updateBannerStatus,
} from '../controllers/banner.controller.js';
import { uploadBannerPhoto } from '../middlewares/multer.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const bannerRouter = express.Router();

bannerRouter.post('/create', protect, adminOnly, uploadBannerPhoto.single('photo'), createBanner);
bannerRouter.get('/getAll', getAllBanners);
bannerRouter.get('/getById/:id', getBannerById);
bannerRouter.put('/update/:id', protect, adminOnly, uploadBannerPhoto.single('photo'), updateBanner);
bannerRouter.patch('/status/:id', protect, adminOnly, updateBannerStatus);
bannerRouter.delete('/delete/:id', protect, adminOnly, deleteBanner);

export default bannerRouter;

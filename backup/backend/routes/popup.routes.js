import express from 'express';
import {
    createPopup,
    getAllPopups,
    getPopupById,
    updatePopup,
    deletePopup,
    updatePopupStatus,
    getActivePopup
} from '../controllers/popup.controller.js';
import { uploadPopupPhoto } from '../middlewares/multer.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const popupRouter = express.Router();

popupRouter.post('/create', protect, adminOnly, uploadPopupPhoto.single('photo'), createPopup);
popupRouter.get('/getAll', protect, adminOnly, getAllPopups);
popupRouter.get('/getActive', getActivePopup);
popupRouter.get('/getById/:id', protect, adminOnly, getPopupById);
popupRouter.put('/update/:id', protect, adminOnly, uploadPopupPhoto.single('photo'), updatePopup);
popupRouter.patch('/status/:id', protect, adminOnly, updatePopupStatus);
popupRouter.delete('/delete/:id', protect, adminOnly, deletePopup);

export default popupRouter;

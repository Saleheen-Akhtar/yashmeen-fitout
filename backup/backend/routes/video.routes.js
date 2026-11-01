import express from 'express';
import {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    updateVideoStatus,
} from '../controllers/video.controller.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const videoRouter = express.Router();

videoRouter.post('/create', protect, adminOnly, createVideo);
videoRouter.get('/getAll', getAllVideos);
videoRouter.get('/getById/:id', getVideoById);
videoRouter.put('/update/:id', protect, adminOnly, updateVideo);
videoRouter.patch('/status/:id', protect, adminOnly, updateVideoStatus);
videoRouter.delete('/delete/:id', protect, adminOnly, deleteVideo);

export default videoRouter;

import express from 'express';
import {
    createProject,
    getProjectsVersion,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from '../controllers/project.controller.js';
import { uploadProjectImages } from '../middlewares/multer.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const projectRouter = express.Router();

projectRouter.post('/create', protect, adminOnly, uploadProjectImages.array('images', 10), createProject);
projectRouter.get('/version', getProjectsVersion);
projectRouter.get('/getAll', getAllProjects);
projectRouter.get('/getById/:id', getProjectById);
projectRouter.put('/update/:id', protect, adminOnly, uploadProjectImages.array('images', 10), updateProject);
projectRouter.delete('/delete/:id', protect, adminOnly, deleteProject);

export default projectRouter;

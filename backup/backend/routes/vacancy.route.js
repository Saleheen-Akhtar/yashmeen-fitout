import express from 'express';
import {
    createVacancy,
    getAllVacancies,
    getOpenVacancies,
    getVacancyById,
    updateVacancy,
    deleteVacancy,
    updateVacancyStatus,
} from '../controllers/vacancy.controller.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const vacancyRouter = express.Router();

vacancyRouter.post('/create', protect, adminOnly, createVacancy);
vacancyRouter.get('/getAll', protect, adminOnly, getAllVacancies);
vacancyRouter.get('/opens', getOpenVacancies);
vacancyRouter.get('/getById/:id', getVacancyById);
vacancyRouter.put('/update/:id', protect, adminOnly, updateVacancy);
vacancyRouter.patch('/status/:id/status', protect, adminOnly, updateVacancyStatus);
vacancyRouter.delete('/delete/:id', protect, adminOnly, deleteVacancy);

export default vacancyRouter;

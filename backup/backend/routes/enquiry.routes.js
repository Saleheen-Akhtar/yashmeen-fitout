import express from 'express';
import {
    createEnquiry,
    getAllEnquiries,
    deleteOldEnquiries,
} from '../controllers/enquiry.controller.js';
import { protect, adminOnly } from "../middlewares/auth.js";

const enquiryRouter = express.Router();

enquiryRouter.post('/create', createEnquiry);
enquiryRouter.get('/getAll', protect, adminOnly, getAllEnquiries);
enquiryRouter.delete('/delete/old', protect, adminOnly, deleteOldEnquiries);

export default enquiryRouter;

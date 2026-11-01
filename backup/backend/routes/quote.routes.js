import express from 'express';
import {
    createQuote,
    getAllQuotes,
    getQuoteById,
    deleteQuote,
    deleteOldQuotes,
    deleteQuotesOlderThanOneMonth,
} from '../controllers/quote.controller.js';
import { protect, adminOnly } from "../middlewares/auth.js";

const quoteRouter = express.Router();

// Public
quoteRouter.post('/create', createQuote);

// Admin
quoteRouter.get('/getAll', protect, adminOnly, getAllQuotes);
quoteRouter.get('/get/:id', protect, adminOnly, getQuoteById);

// Keep the fixed paths above '/delete/:id' so "old" / "older-than-month" aren't read as an ID
quoteRouter.delete('/delete/old', protect, adminOnly, deleteOldQuotes);
quoteRouter.delete('/delete/older-than-month', protect, adminOnly, deleteQuotesOlderThanOneMonth);
quoteRouter.delete('/delete/:id', protect, adminOnly, deleteQuote);

export default quoteRouter;
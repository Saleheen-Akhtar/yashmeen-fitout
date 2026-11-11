import express from "express";
import {
    register,
    verifyEmail,
    resendVerificationEmail,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
} from "../controllers/account.controller.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const accountRouter = express.Router();

accountRouter.post("/create", protect, adminOnly, register);
accountRouter.get("/verify-email", verifyEmail);
accountRouter.post("/resend-verification", resendVerificationEmail);
accountRouter.post("/login", login);
accountRouter.post("/forgot-password", forgotPassword);
accountRouter.post("/reset-password", resetPassword);
accountRouter.post("/logout", protect, logout);
accountRouter.get("/profile", protect, getProfile);

export default accountRouter;
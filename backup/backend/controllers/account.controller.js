import crypto from "crypto";
import bcrypt from "bcrypt";
import AccountModel from "../models/account.model.js";
import { generateToken } from "../utils/generateToken.js";
import {
    isEmailConfigured,
    sendVerificationEmail,
    sendResetPasswordEmail,
} from "../middlewares/sendEmail.js";

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export const register = async (req, res) => {
    try {
        const { name, email, password, mobile, city } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password ||
            typeof mobile !== "string" || !mobile.trim()
        ) {
            return res.status(400).json({ success: false, message: "Name, email, password and mobile are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingAccount = await AccountModel.findOne({ email: normalizedEmail });
        if (existingAccount) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const account = await AccountModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            mobile: mobile.trim(),
            city: typeof city === "string" ? city.trim() : undefined,
            usertype: "user",
            verificationToken,
            verificationTokenExpiresAt: Date.now() + VERIFICATION_TOKEN_TTL_MS,
        });

        if (isEmailConfigured()) {
            try {
                await sendVerificationEmail(account.email, verificationToken);
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: "Account created.",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Failed to register account:", error);
        return res.status(500).json({ success: false, message: "Failed to register account" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (typeof token !== "string" || !token.trim()) {
            return res.status(400).json({ success: false, message: "Verification token is required" });
        }

        const account = await AccountModel.findOne({
            verificationToken: token.trim(),
            verificationTokenExpiresAt: { $gt: Date.now() },
        }).select("+verificationToken");

        if (!account) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
        }

        account.isVerified = true;
        account.verificationToken = undefined;
        account.verificationTokenExpiresAt = undefined;
        await account.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.error("Failed to verify email:", error);
        return res.status(500).json({ success: false, message: "Failed to verify email" });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        if (!isEmailConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Email service is not configured on this server.",
            });
        }

        const account = await AccountModel.findOne({ email: email.trim().toLowerCase() });
        if (!account) {
            return res.status(404).json({ success: false, message: "No account found with this email" });
        }

        if (account.isVerified) {
            return res.status(400).json({ success: false, message: "This account is already verified" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        account.verificationToken = verificationToken;
        account.verificationTokenExpiresAt = Date.now() + VERIFICATION_TOKEN_TTL_MS;
        await account.save();

        await sendVerificationEmail(account.email, verificationToken);

        return res.status(200).json({ success: true, message: "Verification email resent" });
    } catch (error) {
        console.error("Failed to resend verification email:", error);
        return res.status(500).json({ success: false, message: "Failed to resend verification email" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const account = await AccountModel.findOne({ email: email.trim().toLowerCase() }).select("+password +activeToken");
        if (!account) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (!account.isActive) {
            return res.status(403).json({ success: false, message: "This account has been deactivated" });
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(account._id, account.usertype);

        account.activeToken = token;
        account.lastLogin = Date.now();
        if (account.newAccount) account.newAccount = false;
        await account.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                id: account._id,
                name: account.name,
                email: account.email,
                usertype: account.usertype,
                isVerified: account.isVerified,
            },
        });
    } catch (error) {
        console.error("Failed to login:", error);
        return res.status(500).json({ success: false, message: "Failed to login" });
    }
};

export const logout = async (req, res) => {
    try {
        req.account.activeToken = null;
        await req.account.save();

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Failed to logout:", error);
        return res.status(500).json({ success: false, message: "Failed to logout" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const account = await AccountModel.findById(req.account._id);
        return res.status(200).json({ success: true, data: account });
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch profile" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        if (!isEmailConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Password reset email service is not configured. Please contact an administrator.",
            });
        }

        const account = await AccountModel.findOne({ email: email.trim().toLowerCase() });

        if (!account) {
            return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        account.resetPasswordToken = resetToken;
        account.resetPasswordExpiresAt = Date.now() + RESET_TOKEN_TTL_MS;
        await account.save();

        await sendResetPasswordEmail(account.email, resetToken);

        return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent" });
    } catch (error) {
        console.error("Failed to process forgotPassword:", error);
        return res.status(500).json({ success: false, message: "Failed to process request" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        if (typeof token !== "string" || !token.trim() || typeof newPassword !== "string" || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }

        const account = await AccountModel.findOne({
            resetPasswordToken: token.trim(),
            resetPasswordExpiresAt: { $gt: Date.now() },
        }).select("+resetPasswordToken +activeToken");

        if (!account) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        account.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        account.resetPasswordToken = undefined;
        account.resetPasswordExpiresAt = undefined;
        account.activeToken = null; // force re-login on all devices after password change
        await account.save();

        return res.status(200).json({ success: true, message: "Password reset successful, please log in" });
    } catch (error) {
        console.error("Failed to reset password:", error);
        return res.status(500).json({ success: false, message: "Failed to reset password" });
    }
};
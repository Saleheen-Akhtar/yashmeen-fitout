import { logError } from "../utils/logger.js";
import crypto from "crypto";

// Reset tokens are stored hashed; only the emailed value can be redeemed.
const hashToken = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
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
const MAX_PASSWORD_BYTES = 72;
const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const DUMMY_PASSWORD_HASH = "$2b$10$0mq5RDET2YcFyLIYw25diuHv1lwPXareJh3yso7JZ7lIz7iqh0/fS";
const VERIFICATION_RESEND_MESSAGE = "If that email exists and still needs verification, a link has been sent";

const validPasswordLength = (password) =>
    typeof password === "string" &&
    password.length >= 10 &&
    Buffer.byteLength(password, "utf8") <= MAX_PASSWORD_BYTES;

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
        if (!validPasswordLength(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 10 characters and no more than 72 bytes",
            });
        }

        if (!isEmailConfigured()) {
            return res.status(503).json({
                success: false,
                code: "EMAIL_NOT_CONFIGURED",
                message: "Email verification is not configured on this server.",
            });
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
            verificationToken: hashToken(verificationToken),
            verificationTokenExpiresAt: Date.now() + VERIFICATION_TOKEN_TTL_MS,
        });

        try {
            await sendVerificationEmail(account.email, verificationToken);
        } catch (emailError) {
            await AccountModel.deleteOne({ _id: account._id });
            logError("Failed to send verification email:", emailError);
            return res.status(502).json({
                success: false,
                code: "VERIFICATION_EMAIL_FAILED",
                message: "The account was not created because the verification email could not be sent.",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Account created.",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        logError("Failed to register account:", error);
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
            verificationToken: hashToken(token.trim()),
        }).select("+verificationToken");

        if (!account) {
            return res.status(400).json({
                success: false,
                code: "INVALID_VERIFICATION_TOKEN",
                message: "Invalid verification token",
            });
        }

        if (!account.verificationTokenExpiresAt || account.verificationTokenExpiresAt.getTime() <= Date.now()) {
            return res.status(410).json({
                success: false,
                code: "EXPIRED_VERIFICATION_TOKEN",
                message: "This verification link has expired",
            });
        }

        account.isVerified = true;
        account.verificationToken = undefined;
        account.verificationTokenExpiresAt = undefined;
        await account.save();

        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        logError("Failed to verify email:", error);
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
            return res.status(200).json({
                success: true,
                message: VERIFICATION_RESEND_MESSAGE,
            });
        }

        if (account.isVerified) {
            return res.status(200).json({ success: true, message: VERIFICATION_RESEND_MESSAGE });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        account.verificationToken = hashToken(verificationToken);
        account.verificationTokenExpiresAt = Date.now() + VERIFICATION_TOKEN_TTL_MS;
        await account.save();

        await sendVerificationEmail(account.email, verificationToken);

        return res.status(200).json({ success: true, message: VERIFICATION_RESEND_MESSAGE });
    } catch (error) {
        logError("Failed to resend verification email:", error);
        return res.status(500).json({ success: false, message: "Failed to resend verification email" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const account = await AccountModel.findOne({ email: email.trim().toLowerCase() })
            .select("+password +activeToken +activeTokens +failedLoginAttempts +lockUntil");
        if (!account) {
            await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        if (account.lockUntil && account.lockUntil.getTime() > Date.now()) {
            return res.status(429).json({
                success: false,
                message: "Too many failed sign-in attempts. Please try again later.",
            });
        }

        if (!account.isActive) {
            return res.status(403).json({ success: false, message: "This account has been deactivated" });
        }

        if (account.isVerified === false) {
            return res.status(403).json({
                success: false,
                code: "EMAIL_NOT_VERIFIED",
                message: "Verify your email before signing in",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            account.failedLoginAttempts = (account.failedLoginAttempts || 0) + 1;
            if (account.failedLoginAttempts >= MAX_FAILED_LOGINS) {
                account.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
                account.failedLoginAttempts = 0;
            }
            await account.save();
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = generateToken(account._id, account.usertype);

        const activeTokens = Array.isArray(account.activeTokens) ? account.activeTokens : [];
        if (account.activeToken) activeTokens.push(hashToken(account.activeToken));
        activeTokens.push(hashToken(token));
        account.activeTokens = [...new Set(activeTokens)].slice(-5);
        account.activeToken = null;
        account.failedLoginAttempts = 0;
        account.lockUntil = null;
        account.lastLogin = Date.now();
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
        logError("Failed to login:", error);
        return res.status(500).json({ success: false, message: "Failed to login" });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.authToken || "";
        req.account.activeTokens = (req.account.activeTokens || []).filter(
            (storedHash) => storedHash !== hashToken(token),
        );
        if (req.account.activeToken === token) req.account.activeToken = null;
        await req.account.save();

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        logError("Failed to logout:", error);
        return res.status(500).json({ success: false, message: "Failed to logout" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const account = await AccountModel.findById(req.account._id);
        return res.status(200).json({ success: true, data: account });
    } catch (error) {
        logError("Failed to fetch profile:", error);
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
        account.resetPasswordToken = hashToken(resetToken);
        account.resetPasswordExpiresAt = Date.now() + RESET_TOKEN_TTL_MS;
        await account.save();

        await sendResetPasswordEmail(account.email, resetToken);

        return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent" });
    } catch (error) {
        logError("Failed to process forgotPassword:", error);
        return res.status(500).json({ success: false, message: "Failed to process request" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (typeof token !== "string" || !token.trim() || typeof newPassword !== "string" || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }
        if (!validPasswordLength(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 10 characters and no more than 72 bytes",
            });
        }

        const account = await AccountModel.findOne({
            resetPasswordToken: hashToken(token.trim()),
        }).select("+resetPasswordToken +activeToken");

        if (!account) {
            return res.status(400).json({
                success: false,
                code: "INVALID_RESET_TOKEN",
                message: "Invalid reset token",
            });
        }

        if (!account.resetPasswordExpiresAt || account.resetPasswordExpiresAt.getTime() <= Date.now()) {
            return res.status(410).json({
                success: false,
                code: "EXPIRED_RESET_TOKEN",
                message: "This reset link has expired",
            });
        }

        account.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        account.resetPasswordToken = undefined;
        account.resetPasswordExpiresAt = undefined;
        account.activeToken = null; // force re-login on all devices after password change
        account.activeTokens = [];
        await account.save();

        return res.status(200).json({ success: true, message: "Password reset successful, please log in" });
    } catch (error) {
        logError("Failed to reset password:", error);
        return res.status(500).json({ success: false, message: "Failed to reset password" });
    }
};

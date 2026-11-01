import crypto from "crypto";
import bcrypt from "bcrypt";
import AccountModel from "../models/account.model.js";
import { generateToken } from "../utils/generateToken.js";

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export const register = async (req, res) => {
    try {
        const { name, email, password, mobile, city } = req.body;

        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ success: false, message: "Name, email, password and mobile are required" });
        }

        const existingAccount = await AccountModel.findOne({ email });
        if (existingAccount) {
            return res.status(409).json({ success: false, message: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const account = await AccountModel.create({
            name,
            email,
            password: hashedPassword,
            mobile,
            city,
            // verificationToken,
            // verificationTokenExpiresAt: Date.now() + VERIFICATION_TOKEN_TTL_MS,
        });

        return res.status(201).json({
            success: true,
            message: "Account created.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to register account", error: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: "Verification token is required" });
        }

        const account = await AccountModel.findOne({
            verificationToken: token,
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
        return res.status(500).json({ success: false, message: "Failed to verify email", error: error.message });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const account = await AccountModel.findOne({ email });
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

        //await sendVerificationEmail(account.email, verificationToken);

        return res.status(200).json({ success: true, message: "Verification email resent" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to resend verification email", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const account = await AccountModel.findOne({ email }).select("+password +activeToken");
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
        return res.status(500).json({ success: false, message: "Failed to login", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        req.account.activeToken = null;
        await req.account.save();

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to logout", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const account = await AccountModel.findById(req.account._id);
        return res.status(200).json({ success: true, data: account });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const account = await AccountModel.findOne({ email });

        if (!account) {
            return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        account.resetPasswordToken = resetToken;
        account.resetPasswordExpiresAt = Date.now() + RESET_TOKEN_TTL_MS;
        await account.save();

        // await sendResetPasswordEmail(account.email, resetToken);

        return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to process request", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }

        const account = await AccountModel.findOne({
            resetPasswordToken: token,
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
        return res.status(500).json({ success: false, message: "Failed to reset password", error: error.message });
    }
};
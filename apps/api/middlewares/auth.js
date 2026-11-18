import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import AccountModel from "../models/account.model.js";

const sessionHash = (token) => crypto.createHash("sha256").update(token).digest("hex");

const hasActiveSession = (account, token) =>
    account.activeToken === token || account.activeTokens?.includes(sessionHash(token));

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

        const account = await AccountModel.findById(decoded.id).select("+activeToken +activeTokens");

        if (!account) {
            return res.status(401).json({ success: false, message: "Account not found" });
        }

        if (!account.isActive) {
            return res.status(403).json({ success: false, message: "Account is deactivated" });
        }

        if (!hasActiveSession(account, token)) {
            return res.status(401).json({ success: false, message: "Session expired, please log in again" });
        }

        req.account = account;
        req.authToken = token;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.account?.usertype !== "admin") {
        return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
};

export const isAdminRequest = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
        const token = authHeader.split(" ")[1];
        if (!token) return false;
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        const account = await AccountModel.findById(decoded.id).select("+activeToken +activeTokens");
        return Boolean(
            account &&
            account.isActive &&
            hasActiveSession(account, token) &&
            account.usertype === "admin"
        );
    } catch {
        return false;
    }
};

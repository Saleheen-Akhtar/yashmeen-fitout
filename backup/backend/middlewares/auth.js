import jwt from "jsonwebtoken";
import AccountModel from "../models/account.model.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const account = await AccountModel.findById(decoded.id).select("+activeToken");

        if (!account) {
            return res.status(401).json({ success: false, message: "Account not found" });
        }

        if (!account.isActive) {
            return res.status(403).json({ success: false, message: "Account is deactivated" });
        }

        if (account.activeToken !== token) {
            return res.status(401).json({ success: false, message: "Session expired, please log in again" });
        }

        req.account = account;
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
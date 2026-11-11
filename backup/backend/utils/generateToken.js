import crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateToken = (accountId, usertype) => {
    return jwt.sign(
        { id: accountId, usertype, jti: crypto.randomUUID() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || "7d" }
    );
};

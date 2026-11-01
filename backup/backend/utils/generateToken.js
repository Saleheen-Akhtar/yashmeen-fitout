import jwt from "jsonwebtoken";

export const generateToken = (accountId, usertype) => {
    return jwt.sign(
        { id: accountId, usertype },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};
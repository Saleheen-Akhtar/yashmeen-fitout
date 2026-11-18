import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const API_ROOT = path.resolve(here, "..");

dotenv.config({ path: path.join(API_ROOT, ".env") });

export const requiredProductionEnv = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLOUDINARY_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_SECRET_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "CLIENT_URL",
];

export const getMissingProductionEnv = () =>
    requiredProductionEnv.filter((key) => !String(process.env[key] || "").trim());

export const assertProductionEnv = () => {
    if (process.env.NODE_ENV !== "production") return;
    const missing = getMissingProductionEnv();
    if (missing.length) {
        throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
    }
};

export const reportProductionEnvIssues = () => {
    if (process.env.NODE_ENV !== "production") return [];
    const missing = getMissingProductionEnv();
    if (missing.length) {
        console.error(`[config] Missing production environment variables: ${missing.join(", ")}`);
    }
    return missing;
};

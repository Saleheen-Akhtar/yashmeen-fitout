import { logError } from "../utils/logger.js";
import "../config/env.js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis;
const limiters = new Map();

const getRedis = () => {
    const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
    const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
    if (!url || !token) throw new Error("Upstash Redis is not configured");
    if (!redis) redis = new Redis({ url, token });
    return redis;
};

const getLimiter = ({ windowMs, max, prefix }) => {
    const key = `${prefix}:${windowMs}:${max}`;
    if (!limiters.has(key)) {
        const seconds = Math.max(1, Math.ceil(windowMs / 1000));
        limiters.set(key, new Ratelimit({
            redis: getRedis(),
            limiter: Ratelimit.slidingWindow(max, `${seconds} s`),
            prefix: `yashmeen:${prefix}`,
            analytics: true,
        }));
    }
    return limiters.get(key);
};

const PUBLIC_READ_ROUTES = [
    /^\/webDetails\/details\/?$/,
    /^\/project\/(version|getAll)\/?$/,
    /^\/project\/getById\/[^/]+\/?$/,
    /^\/category\/getAll\/?$/,
    /^\/category\/getById\/[^/]+\/?$/,
    /^\/gallery\/getAll\/?$/,
    /^\/gallery\/getById\/[^/]+\/?$/,
    /^\/video\/(version|getAll)\/?$/,
    /^\/video\/getById\/[^/]+\/?$/,
    /^\/vacancy\/(version|opens)\/?$/,
    /^\/vacancy\/getById\/[^/]+\/?$/,
    /^\/post\/getActivePosts\/?$/,
    /^\/post\/getBy\/[^/]+\/?$/,
    /^\/post\/getBySlug\/[^/]+\/?$/,
    /^\/banner\/getAll\/?$/,
    /^\/popup\/getActive\/?$/,
];

export const isPublicReadRequest = (req) => {
    if (req.method !== "GET") return false;
    const routePath = String(req.path || req.originalUrl || "").split("?")[0].replace(/^\/api/, "");
    return PUBLIC_READ_ROUTES.some((pattern) => pattern.test(routePath));
};

export const createDistributedRateLimiter = ({
    windowMs,
    max,
    prefix,
    sensitive = false,
    limiterProvider = getLimiter,
    keyGenerator,
}) =>
    async (req, res, next) => {
        if (process.env.NODE_ENV === "test" && process.env.RATE_LIMIT_BYPASS === "true") {
            return next();
        }
        try {
            const limiter = limiterProvider({ windowMs, max, prefix });
            const ip = req.ip || req.socket?.remoteAddress || "unknown";
            const customKey = typeof keyGenerator === "function" ? keyGenerator(req) : "";
            const result = await limiter.limit(`${ip}:${req.baseUrl || req.path}:${customKey}`);
            res.setHeader("RateLimit-Limit", String(result.limit));
            res.setHeader("RateLimit-Remaining", String(result.remaining));
            res.setHeader("RateLimit-Reset", String(Math.ceil(result.reset / 1000)));
            if (!result.success) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests, please try again shortly.",
                });
            }
            return next();
        } catch (error) {
            logError(`Rate limiter unavailable (${prefix}):`, error);
            const failClosed = typeof sensitive === "function" ? sensitive(req) : sensitive;
            if (failClosed) {
                return res.status(503).json({
                    success: false,
                    message: "This request is temporarily unavailable. Please try again shortly.",
                });
            }
            return next();
        }
    };

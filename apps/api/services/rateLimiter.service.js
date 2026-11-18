import { logError } from "../utils/logger.js";
import "../config/env.js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis;
const limiters = new Map();
const memoryLimiters = new Map();

class MemoryRatelimit {
    constructor({ windowMs, max }) {
        this.windowMs = windowMs;
        this.max = max;
        this.hits = new Map();
        if (typeof setInterval === "function") {
            const timer = setInterval(() => {
                const now = Date.now();
                for (const [key, timestamps] of this.hits.entries()) {
                    const valid = timestamps.filter((t) => now - t < this.windowMs);
                    if (valid.length === 0) {
                        this.hits.delete(key);
                    } else {
                        this.hits.set(key, valid);
                    }
                }
            }, Math.max(60000, windowMs));
            if (timer && typeof timer.unref === "function") {
                timer.unref();
            }
        }
    }

    async limit(key) {
        const now = Date.now();
        const timestamps = (this.hits.get(key) || []).filter((t) => now - t < this.windowMs);
        if (timestamps.length >= this.max) {
            const oldest = timestamps[0] || now;
            const reset = oldest + this.windowMs;
            return {
                success: false,
                limit: this.max,
                remaining: 0,
                reset,
            };
        }
        timestamps.push(now);
        this.hits.set(key, timestamps);
        const reset = timestamps[0] + this.windowMs;
        return {
            success: true,
            limit: this.max,
            remaining: Math.max(0, this.max - timestamps.length),
            reset,
        };
    }
}

const hasUpstash = () => {
    const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
    const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
    return Boolean(url && token);
};

const getRedis = () => {
    const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
    const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
    if (!url || !token) throw new Error("Upstash Redis is not configured");
    if (!redis) redis = new Redis({ url, token });
    return redis;
};

const getLimiter = ({ windowMs, max, prefix }) => {
    const key = `${prefix}:${windowMs}:${max}`;
    if (hasUpstash()) {
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
    }

    if (!memoryLimiters.has(key)) {
        memoryLimiters.set(key, new MemoryRatelimit({ windowMs, max }));
    }
    return memoryLimiters.get(key);
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

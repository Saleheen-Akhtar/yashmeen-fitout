import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";

if (!process.env.VERCEL) {
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {}
}

dotenv.config();

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        const err = new Error("MONGO_URI environment variable is not configured");
        console.error("❌ MongoDB connection error:", err.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw err;
    }

    if (!globalThis.__yashmeenMongoPromise) {
        const connectWithRetry = async () => {
            try {
                return await mongoose.connect(process.env.MONGO_URI);
            } catch (err) {
                if (process.env.VERCEL && /querySrv|ECONNREFUSED|EREFUSED/i.test(err?.message || "")) {
                    try {
                        dns.setServers(["8.8.8.8", "1.1.1.1"]);
                        return await mongoose.connect(process.env.MONGO_URI);
                    } catch (retryErr) {
                        throw retryErr;
                    }
                }
                throw err;
            }
        };

        globalThis.__yashmeenMongoPromise = connectWithRetry()
            .then((conn) => {
                console.log("✅ MongoDB connected");
                return conn;
            })
            .catch((err) => {
                globalThis.__yashmeenMongoPromise = null;
                console.error("❌ MongoDB connection error:", err.message);
                if (!process.env.VERCEL) {
                    process.exit(1);
                }
                throw err;
            });
    }

    return globalThis.__yashmeenMongoPromise;
};

export default connectDB;
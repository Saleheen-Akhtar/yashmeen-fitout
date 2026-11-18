import "../config/env.js";
import fs from "node:fs/promises";
import path from "node:path";
import connectDB from "../config/db.config.js";
import AccountModel from "../models/account.model.js";
import { API_ROOT } from "../config/env.js";

const apply = process.argv.includes("--apply");
const outputDir = path.resolve(process.env.MIGRATION_OUTPUT_DIR || path.join(API_ROOT, "migration-output"));
await fs.mkdir(outputDir, { recursive: true });
await connectDB();

const accounts = await AccountModel.find({ isVerified: { $exists: false } }).lean();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
await fs.writeFile(
    path.join(outputDir, `account-verification-backup-${stamp}.json`),
    JSON.stringify(accounts, null, 2),
);

let modified = 0;
if (apply && accounts.length) {
    const result = await AccountModel.updateMany(
        { isVerified: { $exists: false } },
        { $set: { isVerified: true } },
    );
    modified = result.modifiedCount;
}

console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", matched: accounts.length, modified }, null, 2));
process.exit(0);

import "../config/env.js";
import fs from "node:fs/promises";
import path from "node:path";
import connectDB from "../config/db.config.js";
import PostModel from "../models/post.model.js";
import { API_ROOT } from "../config/env.js";
import { blogTextContent, sanitizeBlogHtml } from "../utils/sanitizeBlogHtml.js";

const apply = process.argv.includes("--apply");
const outputDir = path.resolve(process.env.MIGRATION_OUTPUT_DIR || path.join(API_ROOT, "migration-output"));
await fs.mkdir(outputDir, { recursive: true });
await connectDB();

const posts = await PostModel.find({}).lean();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
await fs.writeFile(path.join(outputDir, `posts-backup-${stamp}.json`), JSON.stringify(posts, null, 2));

const report = [];
for (const post of posts) {
    const sanitized = sanitizeBlogHtml(post.content);
    const readable = blogTextContent(sanitized);
    const changed = sanitized !== String(post.content || "");
    const shouldUnpublish = post.status === true && !readable;
    report.push({ id: String(post._id), title: post.title, changed, readable: Boolean(readable), shouldUnpublish });
    if (apply && (changed || shouldUnpublish)) {
        await PostModel.updateOne(
            { _id: post._id },
            { $set: { content: sanitized, ...(shouldUnpublish ? { status: false } : {}) } },
        );
    }
}

await fs.writeFile(path.join(outputDir, `posts-sanitization-report-${stamp}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", posts: report.length, unsafe: report.filter((p) => p.changed).length, unpublished: report.filter((p) => p.shouldUnpublish).length }, null, 2));
process.exit(0);

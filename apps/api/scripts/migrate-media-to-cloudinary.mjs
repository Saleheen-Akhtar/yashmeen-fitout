import "../config/env.js";
import fs from "node:fs/promises";
import path from "node:path";
import connectDB from "../config/db.config.js";
import ProjectModel from "../models/project.model.js";
import GalleryModel from "../models/gallery.model.js";
import BannerModel from "../models/banner.model.js";
import PopupModel from "../models/popup.model.js";
import PostModel from "../models/post.model.js";
import { API_ROOT } from "../config/env.js";
import { deleteAssets, mediaFolders, uploadBuffer } from "../services/media.service.js";
import { locateLegacyMediaFile, migrateLegacyMediaValue } from "./lib/media-migration-utils.mjs";

const apply = process.argv.includes("--apply");
const repoRoot = path.resolve(API_ROOT, "..", "..");
const outputDir = path.resolve(process.env.MIGRATION_OUTPUT_DIR || path.join(API_ROOT, "migration-output"));
await fs.mkdir(outputDir, { recursive: true });
await connectDB();

const collections = [
    { name: "projects", model: ProjectModel, fields: [{ key: "images", many: true, folder: mediaFolders.projects }] },
    { name: "gallery", model: GalleryModel, fields: [{ key: "photo", folder: mediaFolders.gallery }] },
    { name: "banners", model: BannerModel, fields: [{ key: "photo", folder: mediaFolders.banners }] },
    { name: "popups", model: PopupModel, fields: [{ key: "photo", folder: mediaFolders.popups }] },
    { name: "posts", model: PostModel, fields: [{ key: "file", folder: mediaFolders.posts }] },
];

const migrateValue = async (value, folder, context) => {
    const result = await migrateLegacyMediaValue({
        value,
        folder,
        apply,
        locateFile: (candidate) => locateLegacyMediaFile(candidate, { apiRoot: API_ROOT, repoRoot }),
        upload: uploadBuffer,
    });
    return { ...result, ...context };
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const report = [];

for (const collection of collections) {
    const docs = await collection.model.find({}).lean();
    await fs.writeFile(path.join(outputDir, `${collection.name}-media-backup-${stamp}.json`), JSON.stringify(docs, null, 2));
    for (const doc of docs) {
        const updates = {};
        const uploadedForDocument = [];
        try {
            for (const field of collection.fields) {
                if (field.many) {
                    const migrated = [];
                    for (const value of doc[field.key] || []) {
                        const result = await migrateValue(value, field.folder, { collection: collection.name, id: String(doc._id), field: field.key });
                        if (result.uploadedAsset) uploadedForDocument.push(result.uploadedAsset);
                        report.push({ ...result, uploadedAsset: undefined, collection: collection.name, id: String(doc._id), field: field.key });
                        migrated.push(result.value);
                    }
                    updates[field.key] = migrated;
                } else {
                    const result = await migrateValue(doc[field.key], field.folder, { collection: collection.name, id: String(doc._id), field: field.key });
                    if (result.uploadedAsset) uploadedForDocument.push(result.uploadedAsset);
                    report.push({ ...result, uploadedAsset: undefined, collection: collection.name, id: String(doc._id), field: field.key });
                    updates[field.key] = result.value;
                }
            }
            if (apply) await collection.model.updateOne({ _id: doc._id }, { $set: updates });
        } catch (error) {
            if (apply) await deleteAssets(uploadedForDocument);
            throw new Error(`${collection.name}:${doc._id} migration failed and uploaded assets were rolled back: ${error.message}`);
        }
    }
}

const posts = await PostModel.find({}).lean();
for (const post of posts) {
    let content = String(post.content || "");
    const uploadedForContent = [];
    const sources = [...content.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((match) => match[1]);
    try {
        for (const source of [...new Set(sources)]) {
            const result = await migrateValue(source, mediaFolders.editor, {
                collection: "posts",
                id: String(post._id),
                field: "content",
            });
            if (result.uploadedAsset) uploadedForContent.push(result.uploadedAsset);
            report.push({ ...result, uploadedAsset: undefined, collection: "posts", id: String(post._id), field: "content" });
            if (result.value !== source) content = content.split(source).join(result.value);
        }
        if (apply && content !== String(post.content || "")) {
            await PostModel.updateOne({ _id: post._id }, { $set: { content } });
        }
    } catch (error) {
        if (apply) await deleteAssets(uploadedForContent);
        throw new Error(`posts:${post._id} embedded media migration failed and uploaded assets were rolled back: ${error.message}`);
    }
}

await fs.writeFile(path.join(outputDir, `media-migration-report-${stamp}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    total: report.length,
    ready: report.filter((item) => item.status === "ready").length,
    migrated: report.filter((item) => item.status === "migrated").length,
    missing: report.filter((item) => item.status === "missing").length,
    skipped: report.filter((item) => item.status === "skipped").length,
}, null, 2));
process.exit(0);

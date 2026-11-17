import fs from "node:fs/promises";
import path from "node:path";
import { isCloudinaryUrl } from "../../services/media.service.js";

export const normalizeLegacyMediaPath = (value) => {
    try {
        const pathname = /^https?:/i.test(value) ? new URL(value).pathname : String(value);
        return decodeURIComponent(pathname)
            .split(/[?#]/)[0]
            .replace(/\\/g, '/')
            .replace(/^\/+/, "")
            .replace(/^(?:backend\/)?uploads\//, "");
    } catch {
        return "";
    }
};

export const locateLegacyMediaFile = async (value, { apiRoot, repoRoot }) => {
    const relative = normalizeLegacyMediaPath(value);
    if (!relative || relative.split('/').some(part=>part==='..') || path.isAbsolute(relative)) return null;
    const publicRoot = path.resolve(repoRoot,'apps/web/public');
    let restored = {};
    try { restored = JSON.parse(await fs.readFile(path.join(repoRoot,'apps/web/src/lib/legacyMedia.json'),'utf8')); } catch {}
    const recovered = restored[`/${relative}`];
    const candidates = [
        // Prefer the verified browser-compatible recovery (including HEIF conversions).
        ...(recovered ? [{root:publicRoot,relative:recovered.replace(/^\/+/, '')}] : []),
        ...(relative.startsWith('static/') || relative.startsWith('images/') ? [{root:publicRoot,relative}] : []),
        {root:path.resolve(apiRoot,'uploads'),relative}, {root:path.resolve(repoRoot,'uploads'),relative},
    ];
    for (const entry of candidates) {
        const candidate = path.resolve(entry.root,entry.relative);
        if (!candidate.startsWith(`${entry.root}${path.sep}`)) continue;
        try {
            const stat = await fs.stat(candidate);
            if (stat.isFile()) return candidate;
        } catch {}
    }
    return null;
};

export const migrateLegacyMediaValue = async ({
    value,
    folder,
    apply,
    locateFile,
    readFile = fs.readFile,
    upload,
}) => {
    if (!value || isCloudinaryUrl(value)) return { value, status: "skipped" };
    const file = await locateFile(value);
    if (!file) return { value, status: "missing" };
    if (!apply) return { value, status: "ready", file };
    const uploaded = await upload(await readFile(file), { folder });
    return {
        value: uploaded.url,
        status: "migrated",
        file,
        previous: value,
        uploadedAsset: uploaded,
    };
};

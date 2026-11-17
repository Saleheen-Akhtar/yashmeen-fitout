import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { blogTextContent, sanitizeBlogHtml } from "../utils/sanitizeBlogHtml.js";
import {
  assertSupportedImage,
  cloudinaryPublicIdFromUrl,
  detectImageType,
  deleteAsset,
  uploadFiles,
} from "../services/media.service.js";
import {
  createDistributedRateLimiter,
  isPublicReadRequest,
} from "../services/rateLimiter.service.js";
import {
  locateLegacyMediaFile,
  migrateLegacyMediaValue,
  normalizeLegacyMediaPath,
} from "../scripts/lib/media-migration-utils.mjs";

const createResponse = () => ({
  headers: {},
  statusCode: 200,
  body: null,
  setHeader(name, value) { this.headers[name] = value; },
  status(value) { this.statusCode = value; return this; },
  json(value) { this.body = value; return this; },
});

describe("P1 blog sanitizer", () => {
  it("removes scripts, event handlers, unsafe URLs and embeds while retaining readable CKEditor markup", () => {
    const dirty = `
      <script>alert(1)</script>
      <h2 onclick="alert(2)">Project update</h2>
      <p>Readable <strong>article copy</strong>.</p>
      <img src="https://res.cloudinary.com/demo/image/upload/sample.jpg" onerror="alert(3)">
      <a href="javascript:alert(4)" target="_blank">unsafe</a>
      <iframe src="https://evil.invalid/embed"></iframe>`;
    const clean = sanitizeBlogHtml(dirty);
    assert.doesNotMatch(clean, /script|onclick|onerror|javascript:|iframe/i);
    assert.match(clean, /<h2>Project update<\/h2>/);
    assert.match(clean, /noopener noreferrer/);
    assert.equal(blogTextContent(clean), "Project update Readable article copy. unsafe");
  });

  it("detects script-only content as unreadable", () => {
    assert.equal(blogTextContent("<script>document.write('bad')</script>"), "");
  });
});

describe("P1 Cloudinary media lifecycle", () => {
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

  it("accepts supported image signatures and rejects spoofed image content before upload", () => {
    assert.equal(detectImageType(jpegBuffer), "jpeg");
    assert.equal(detectImageType(pngBuffer), "png");
    assert.throws(
      () => assertSupportedImage(Buffer.from("<script>alert(1)</script>")),
      (error) => error.status === 400 && error.code === "INVALID_IMAGE_SIGNATURE",
    );
  });

  it("extracts Cloudinary public IDs and ignores legacy relative paths for deletion", async () => {
    assert.equal(
      cloudinaryPublicIdFromUrl("https://res.cloudinary.com/demo/image/upload/v123/yashmeen/projects/sample.webp"),
      "yashmeen/projects/sample",
    );
    let destroyed = false;
    const deleted = await deleteAsset("projects/legacy.jpg", "image", {
      uploader: { destroy: async () => { destroyed = true; } },
    });
    assert.equal(deleted, false);
    assert.equal(destroyed, false);
  });

  it("rolls back successful uploads when a later upload fails", async () => {
    let uploads = 0;
    const destroyed = [];
    const client = {
      uploader: {
        upload_stream(_options, callback) {
          return {
            end() {
              uploads += 1;
              if (uploads === 2) callback(new Error("synthetic upload failure"));
              else callback(null, { secure_url: "https://res.cloudinary.com/demo/image/upload/v1/yashmeen/projects/first.jpg", public_id: "yashmeen/projects/first", resource_type: "image" });
            },
          };
        },
        async destroy(publicId) { destroyed.push(publicId); },
      },
    };

    await assert.rejects(
      uploadFiles([{ buffer: jpegBuffer }, { buffer: pngBuffer }], { folder: "yashmeen/projects", client }),
      /synthetic upload failure/,
    );
    assert.deepEqual(destroyed, ["yashmeen/projects/first"]);
  });
});

describe("P1 distributed rate limiting", () => {
  it("returns the existing 429 response format", async () => {
    const middleware = createDistributedRateLimiter({
      windowMs: 1000,
      max: 1,
      prefix: "test",
      limiterProvider: () => ({ limit: async () => ({ success: false, limit: 1, remaining: 0, reset: 2000 }) }),
    });
    const response = createResponse();
    await middleware({ method: "POST", path: "/account/login", ip: "127.0.0.1" }, response, () => assert.fail("next should not run"));
    assert.equal(response.statusCode, 429);
    assert.deepEqual(response.body, { success: false, message: "Too many requests, please try again shortly." });
  });

  it("fails open for public reads and closed for mutations when Redis is unavailable", async () => {
    const unavailable = () => { throw new Error("Redis offline"); };
    const middleware = createDistributedRateLimiter({
      windowMs: 1000,
      max: 1,
      prefix: "test",
      sensitive: (request) => !isPublicReadRequest(request),
      limiterProvider: unavailable,
    });
    let publicNext = false;
    await middleware({ method: "GET", path: "/project/getAll" }, createResponse(), () => { publicNext = true; });
    assert.equal(publicNext, true);

    const mutationResponse = createResponse();
    await middleware({ method: "POST", path: "/account/login" }, mutationResponse, () => assert.fail("next should not run"));
    assert.equal(mutationResponse.statusCode, 503);
  });
});

describe("P1 media migration dry run", () => {
  it('uses recovered JPEGs for legacy HEIF records and rejects paths outside media roots', async () => {
    const root=await fs.mkdtemp(path.join(os.tmpdir(),'yashmeen-recovered-migration-'));
    try {
      const media=path.join(root,'apps/web/public/images/legacy/projects/fixture.jpg');
      const manifest=path.join(root,'apps/web/src/lib/legacyMedia.json');
      await fs.mkdir(path.dirname(media),{recursive:true}); await fs.mkdir(path.dirname(manifest),{recursive:true});
      await fs.writeFile(media,Buffer.from([0xff,0xd8,0xff]));
      await fs.writeFile(manifest,JSON.stringify({'/projects/fixture.heif':'/images/legacy/projects/fixture.jpg'}));
      const options={apiRoot:path.join(root,'apps/api'),repoRoot:root};
      assert.equal(await locateLegacyMediaFile('/uploads/projects/fixture.heif',options),media);
      assert.equal(await locateLegacyMediaFile('../../.env',options),null);
      assert.equal(await locateLegacyMediaFile('/uploads/%2e%2e/%2e%2e/.env',options),null);
    } finally { await fs.rm(root,{recursive:true,force:true}); }
  });
  it("backs path normalization, missing-file reporting and idempotent Cloudinary skips", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "yashmeen-media-migration-"));
    try {
      const apiRoot = path.join(root, "apps", "api");
      const repoRoot = root;
      const mediaPath = path.join(apiRoot, "uploads", "projects", "legacy.jpg");
      await fs.mkdir(path.dirname(mediaPath), { recursive: true });
      await fs.writeFile(mediaPath, "legacy");
      assert.equal(normalizeLegacyMediaPath("/uploads/projects/legacy.jpg?cache=1"), "projects/legacy.jpg");
      assert.equal(await locateLegacyMediaFile("/uploads/projects/legacy.jpg", { apiRoot, repoRoot }), mediaPath);

      let uploadCalled = false;
      const dryRun = await migrateLegacyMediaValue({
        value: "/uploads/projects/legacy.jpg",
        folder: "yashmeen/projects",
        apply: false,
        locateFile: (value) => locateLegacyMediaFile(value, { apiRoot, repoRoot }),
        upload: async () => { uploadCalled = true; },
      });
      assert.equal(dryRun.status, "ready");
      assert.equal(uploadCalled, false);

      const missing = await migrateLegacyMediaValue({
        value: "/uploads/projects/missing.jpg",
        folder: "yashmeen/projects",
        apply: false,
        locateFile: (value) => locateLegacyMediaFile(value, { apiRoot, repoRoot }),
        upload: async () => assert.fail("missing assets must not upload"),
      });
      assert.equal(missing.status, "missing");

      const rerun = await migrateLegacyMediaValue({
        value: "https://res.cloudinary.com/demo/image/upload/v1/yashmeen/projects/legacy.jpg",
        folder: "yashmeen/projects",
        apply: true,
        locateFile: async () => assert.fail("Cloudinary URLs must be idempotently skipped"),
        upload: async () => assert.fail("Cloudinary URLs must not upload again"),
      });
      assert.equal(rerun.status, "skipped");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});

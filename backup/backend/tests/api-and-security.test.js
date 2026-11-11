import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(BACKEND_ROOT, ".env") });

import connectDB from "../config/db.config.js";
import AccountModel from "../models/account.model.js";
import PostModel from "../models/post.model.js";
import QuoteModel from "../models/quotes.model.js";
import EnquiryModel from "../models/enquiry.model.js";
import VacancyModel from "../models/vacancy.model.js";

const RUN_ID = `qatest-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const TEST_ADMIN_EMAIL = `qa-admin-${RUN_ID}@qa-test.invalid`;
const TEST_USER_EMAIL = `qa-user-${RUN_ID}@qa-test.invalid`;
const TEST_DEACTIVATED_EMAIL = `qa-inactive-${RUN_ID}@qa-test.invalid`;
const TEST_PASS = "QaTest#2026!Pass";

let API_BASE = process.env.TEST_API_URL || "http://localhost:8000";
let spawnedServer = null;

const createdFilesToDelete = new Set();
const createdAccountEmails = new Set([TEST_ADMIN_EMAIL, TEST_USER_EMAIL, TEST_DEACTIVATED_EMAIL]);
const createdQuoteEmails = new Set();
const createdEnquiryEmails = new Set();
const createdPostIds = new Set();
const createdVacancyIds = new Set();

let adminToken = "";
let userToken = "";
let draftPostId = "";
let draftPostSlug = "";
let closedVacancyId = "";

async function httpJson(urlPath, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${urlPath}`, {
    method,
    headers: {
      ...(body !== undefined && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined || body instanceof FormData ? body : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, headers: res.headers, text, json };
}

before(async () => {
  await connectDB();

  // Check if local backend server is already running; otherwise spawn one
  try {
    const ping = await fetch(`${API_BASE}/api/webDetails/details`);
    if (!ping.ok && ping.status >= 500) {
      throw new Error("Server unhealthy");
    }
  } catch {
    const port = 8900 + Math.floor(Math.random() * 900);
    API_BASE = `http://127.0.0.1:${port}`;
    spawnedServer = spawn(process.execPath, ["server.js"], {
      cwd: BACKEND_ROOT,
      env: { ...process.env, PORT: String(port) },
      stdio: "ignore",
    });
    let ready = false;
    for (let i = 0; i < 80; i++) {
      await new Promise((r) => setTimeout(r, 250));
      try {
        const res = await fetch(`${API_BASE}/api/webDetails/details`);
        if (res.status < 500) {
          ready = true;
          break;
        }
      } catch {
        /* wait */
      }
    }
    if (!ready) {
      throw new Error(`Spawned backend server at ${API_BASE} did not become ready in 20s`);
    }
  }

  const passwordHash = await bcrypt.hash(TEST_PASS, 10);

  await AccountModel.create([
    {
      name: `[QA-TEST] Admin ${RUN_ID}`,
      email: TEST_ADMIN_EMAIL,
      password: passwordHash,
      mobile: "+971500000001",
      usertype: "admin",
      isActive: true,
    },
    {
      name: `[QA-TEST] User ${RUN_ID}`,
      email: TEST_USER_EMAIL,
      password: passwordHash,
      mobile: "+971500000002",
      usertype: "user",
      isActive: true,
    },
    {
      name: `[QA-TEST] Deactivated ${RUN_ID}`,
      email: TEST_DEACTIVATED_EMAIL,
      password: passwordHash,
      mobile: "+971500000003",
      usertype: "user",
      isActive: false,
    },
  ]);

  const adminLogin = await httpJson("/api/account/login", {
    method: "POST",
    body: { email: TEST_ADMIN_EMAIL, password: TEST_PASS },
  });
  adminToken = adminLogin.json?.token || "";

  const userLogin = await httpJson("/api/account/login", {
    method: "POST",
    body: { email: TEST_USER_EMAIL, password: TEST_PASS },
  });
  userToken = userLogin.json?.token || "";

  const draftSlug = `qa-secret-draft-${RUN_ID}`;
  const draftPost = await PostModel.create({
    title: `[QA-TEST] Secret Draft ${RUN_ID}`,
    pageUrl: draftSlug,
    content: "<p>Internal draft post that must not leak publicly.</p>",
    status: false,
  });
  draftPostId = String(draftPost._id);
  draftPostSlug = draftSlug;
  createdPostIds.add(draftPostId);

  const closedVacancy = await VacancyModel.create({
    positionName: `[QA-TEST] Closed Role ${RUN_ID}`,
    numberOfPositions: 1,
    experience: "5+",
    location: "Dubai",
    aboutPosition: "Synthetic closed vacancy for RBAC and filter testing.",
    endDate: new Date(Date.now() + 86400000 * 7),
    status: "closed",
  });
  closedVacancyId = String(closedVacancy._id);
  createdVacancyIds.add(closedVacancyId);
});

after(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      if (createdAccountEmails.size > 0) {
        await AccountModel.deleteMany({ email: { $in: [...createdAccountEmails] } });
      }
      if (createdQuoteEmails.size > 0) {
        await QuoteModel.deleteMany({ email: { $in: [...createdQuoteEmails] } });
      }
      if (createdEnquiryEmails.size > 0) {
        await EnquiryModel.deleteMany({ email: { $in: [...createdEnquiryEmails] } });
      }
      if (createdPostIds.size > 0) {
        await PostModel.deleteMany({ _id: { $in: [...createdPostIds] } });
      }
      if (createdVacancyIds.size > 0) {
        await VacancyModel.deleteMany({ _id: { $in: [...createdVacancyIds] } });
      }
    }
  } finally {
    for (const absPath of createdFilesToDelete) {
      try {
        if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
      } catch {
        /* ignore */
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (spawnedServer) {
      spawnedServer.kill();
    }
  }
});

describe("Layer 3A: Public API read endpoints", () => {
  const publicRoutes = [
    "/api/webDetails/details",
    "/api/project/getAll",
    "/api/category/getAll",
    "/api/gallery/getAll",
    "/api/video/getAll",
    "/api/vacancy/opens",
    "/api/project/version",
    "/api/vacancy/version",
    "/api/video/version",
    "/api/post/getActivePosts",
    "/api/banner/getAll",
  ];

  for (const route of publicRoutes) {
    it(`GET ${route} returns HTTP 200 JSON`, async () => {
      const res = await httpJson(route);
      assert.equal(res.status, 200, `Expected 200 for ${route}, got ${res.status}`);
      assert.ok(res.json && typeof res.json === "object", `Expected JSON body for ${route}`);
    });
  }

  it("GET /api/popup/getActive returns 200 (when active) or 404 (when none active), never 5xx", async () => {
    const res = await httpJson("/api/popup/getActive");
    assert.ok([200, 404].includes(res.status), `Expected 200 or 404, got ${res.status}`);
  });
});

describe("Layer 3B: Validation boundaries, ObjectIds, query sanitization & CRUD", () => {
  it("Invalid ObjectIds return 400 across detail endpoints (never unhandled 500 CastError)", async () => {
    const idEndpoints = [
      "/api/project/getById/not-a-valid-object-id",
      "/api/category/getById/not-a-valid-object-id",
      "/api/vacancy/getById/not-a-valid-object-id",
      "/api/gallery/getById/not-a-valid-object-id",
      "/api/video/getById/not-a-valid-object-id",
      "/api/post/getBy/not-a-valid-object-id",
    ];
    const failures = [];
    for (const ep of idEndpoints) {
      const res = await httpJson(ep);
      if (res.status !== 400) {
        failures.push(`${ep} -> ${res.status} (${res.json?.message || "non-400"})`);
      }
    }
    assert.deepEqual(failures, [], `Endpoints returning non-400 on invalid ObjectId: ${failures.join("; ")}`);
  });

  it("POST /api/quote/create rejects QuestionnaireModal broken shape (phone/approxBudget, missing mobile/services) with 400", async () => {
    const res = await httpJson("/api/quote/create", {
      method: "POST",
      body: {
        name: "QA Broken Modal",
        email: "qa-invalid-quote@qa-test.invalid",
        phone: "+971500000000",
        projectType: "Residential",
        approxBudget: "AED 1.5 Mil - 3 Mil",
        message: "Questionnaire probe",
      },
    });
    assert.equal(res.status, 400);
    assert.equal(res.json?.success, false);
    assert.ok(res.json?.errors?.mobile, "Expected mobile validation error");
    assert.ok(res.json?.errors?.services, "Expected services validation error");
  });

  it("POST /api/quote/create rejects short message (<10 chars) and invalid enum projectType", async () => {
    const res = await httpJson("/api/quote/create", {
      method: "POST",
      body: {
        name: "QA Short",
        mobile: "+971501234567",
        email: "qa-short@qa-test.invalid",
        projectType: "InvalidSector",
        services: ["Turnkey fit-out"],
        message: "Too short",
      },
    });
    assert.equal(res.status, 400);
    assert.ok(res.json?.errors?.projectType);
    assert.ok(res.json?.errors?.message);
  });

  it("POST /api/quote/create accepts valid Quote payload (201) and admin DELETE cleans it cleanly", async () => {
    const email = `qa-quote-${RUN_ID}@qa-test.invalid`;
    createdQuoteEmails.add(email);
    const res = await httpJson("/api/quote/create", {
      method: "POST",
      body: {
        name: `[QA-TEST] Quote Probe ${RUN_ID}`,
        mobile: "+971500000099",
        email,
        projectType: "Residential",
        services: ["Turnkey fit-out"],
        location: "Business Bay",
        budget: "AED 150,000 - 500,000",
        timeline: "Within 1-3 months",
        message: "[QA-TEST] Automated integration verification message payload.",
      },
    });
    assert.equal(res.status, 201);
    const id = res.json?.data?._id;
    assert.ok(id, "Expected created quote _id");

    const del = await httpJson(`/api/quote/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(del.status, 200);
  });

  it("POST /api/enquiry/create rejects missing mobile or invalid email (400) and accepts valid payload (201)", async () => {
    const bad = await httpJson("/api/enquiry/create", {
      method: "POST",
      body: {
        name: "QA Missing Mobile",
        email: "bad-email",
        services: "Interior Fit-Out",
      },
    });
    assert.equal(bad.status, 400);

    const email = `qa-enquiry-${RUN_ID}@qa-test.invalid`;
    createdEnquiryEmails.add(email);
    const good = await httpJson("/api/enquiry/create", {
      method: "POST",
      body: {
        name: `[QA-TEST] Enquiry Probe ${RUN_ID}`,
        mobile: "+971500000088",
        email,
        services: "Interior Fit-Out",
        message: "[QA-TEST] Automated integration verification message payload.",
      },
    });
    assert.equal(good.status, 201);
  });

  it("GET /api/vacancy/opens escapes regex metacharacters cleanly and filters out closed roles", async () => {
    const res = await httpJson("/api/vacancy/opens?location=" + encodeURIComponent("Dubai(.*+?[test"));
    assert.equal(res.status, 200);
    const ids = (res.json?.data || []).map((v) => String(v._id));
    assert.ok(!ids.includes(closedVacancyId), "Closed vacancy leaked into /api/vacancy/opens");
  });
});

describe("Layer 3C: Upload limits, Multer error handling, static fallback & traversal", () => {
  it("POST /api/upload returns structured JSON 4xx on disallowed MIME type (not HTML 500)", async () => {
    const fd = new FormData();
    fd.append("upload", new Blob(["%PDF-1.4 qa-test"], { type: "application/pdf" }), "qa-test.pdf");
    const res = await httpJson("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: fd,
    });
    assert.ok(res.status >= 400 && res.status < 500, `Expected 4xx JSON on invalid MIME, got ${res.status}`);
    assert.ok(res.json !== null, `Expected JSON response, got non-JSON (${res.headers.get("content-type")}): ${res.text.slice(0, 120)}`);
  });

  it("POST /api/upload returns structured JSON 4xx/413 on >5MB file limit (not HTML 500)", async () => {
    const bigBuf = Buffer.alloc(5 * 1024 * 1024 + 1024, 0x41);
    const fd = new FormData();
    fd.append("upload", new Blob([bigBuf], { type: "image/png" }), "oversized.png");
    const res = await httpJson("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: fd,
    });
    assert.ok(res.status === 400 || res.status === 413, `Expected 400/413 on >5MB upload, got ${res.status}`);
    assert.ok(res.json !== null, `Expected JSON error for oversized upload, got ${res.headers.get("content-type")}`);
  });

  it("GET /uploads/..%2Fserver.js cannot traverse outside uploads directory", async () => {
    const res = await fetch(`${API_BASE}/uploads/..%2Fserver.js`);
    const body = await res.text();
    assert.ok(!body.includes("express()") && !body.includes("MONGO_URI"), "Path traversal exposed server.js!");
  });

  it("GET /uploads/<nonexistent>.jpg returns 404 in production behavior instead of silently serving fallback stock photo", async () => {
    const res = await fetch(`${API_BASE}/uploads/nonexistent-qa-check-${RUN_ID}.jpg`, { redirect: "manual" });
    assert.equal(
      res.status,
      404,
      `Missing /uploads image returned HTTP ${res.status} (${res.headers.get("content-type")}) due to unrestricted /uploads fallback middleware`
    );
  });
});

describe("Layer 3D: Vercel serverless DB unavailable behavior", () => {
  it("Serverless VERCEL=1 with missing MONGO_URI returns HTTP 503 MISSING_MONGO_URI JSON", async () => {
    const probeScript = `
      import http from "node:http";
      import app from "./server.js";
      const srv = http.createServer(app);
      await new Promise((r) => srv.listen(0, "127.0.0.1", r));
      const { port } = srv.address();
      const res = await fetch(\`http://127.0.0.1:\${port}/api/project/getAll\`);
      const json = await res.json();
      console.log(JSON.stringify({ status: res.status, json }));
      srv.closeAllConnections?.();
      await new Promise((r) => srv.close(r));
      setTimeout(() => process.exit(0), 50).unref();
    `;
    const output = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ["--input-type=module", "-e", probeScript], {
        cwd: BACKEND_ROOT,
        env: { ...process.env, VERCEL: "1", NODE_ENV: "production", MONGO_URI: "" },
      });
      let out = "";
      let err = "";
      child.stdout.on("data", (d) => (out += d));
      child.stderr.on("data", (d) => (err += d));
      child.on("close", (code) => {
        if (code !== 0) reject(new Error(`Exit ${code}: ${err}`));
        else resolve(out.trim());
      });
    });
    const lastLine = output.split(/\r?\n/).pop();
    const parsed = JSON.parse(lastLine);
    assert.equal(parsed.status, 503);
    assert.equal(parsed.json?.code, "MISSING_MONGO_URI");
    assert.equal(parsed.json?.error, undefined);
  });
});

describe("Layer 4: Security, Auth, RBAC, Account Lifecycle & Injection Penetration Tests", () => {
  const adminRoutes = [
    ["GET", "/api/vacancy/getAll"],
    ["POST", "/api/vacancy/create"],
    ["GET", "/api/enquiry/getAll"],
    ["DELETE", "/api/enquiry/delete/old"],
    ["GET", "/api/quote/getAll"],
    ["DELETE", "/api/quote/delete/older-than-month"],
    ["GET", "/api/popup/getAll"],
    ["POST", "/api/popup/create"],
    ["POST", "/api/banner/create"],
    ["POST", "/api/category/create"],
    ["POST", "/api/gallery/create"],
    ["POST", "/api/project/create"],
    ["POST", "/api/post/create"],
    ["POST", "/api/video/create"],
    ["PUT", "/api/webDetails/update"],
  ];

  it("Unauthenticated requests to all admin endpoints return 401 and non-admin user tokens return 403", async () => {
    for (const [method, ep] of adminRoutes) {
      const unauth = await httpJson(ep, { method, body: method !== "GET" && method !== "DELETE" ? {} : undefined });
      assert.equal(unauth.status, 401, `Expected 401 unauthenticated for ${method} ${ep}, got ${unauth.status}`);

      const asUser = await httpJson(ep, {
        method,
        headers: { Authorization: `Bearer ${userToken}` },
        body: method !== "GET" && method !== "DELETE" ? {} : undefined,
      });
      assert.equal(asUser.status, 403, `Expected 403 adminOnly for ${method} ${ep}, got ${asUser.status}`);
    }
  });

  it("POST /api/upload MUST require admin auth and reject spoofed .html extension with image/png MIME", async () => {
    const fd = new FormData();
    fd.append("upload", new Blob(["<script>alert('qa-xss')</script>"], { type: "image/png" }), "qa-xss-probe.html");

    const res = await httpJson("/api/upload", { method: "POST", body: fd });
    try {
      if (res.json?.url) {
        const uploadedRel = res.json.url.replace(/^\/+/, "");
        const candidates = [
          path.join(BACKEND_ROOT, uploadedRel),
          path.join(BACKEND_ROOT, "uploads", uploadedRel),
          path.join(BACKEND_ROOT, "uploads", "posts", path.basename(uploadedRel)),
        ];
        for (const p of candidates) {
          if (fs.existsSync(p)) createdFilesToDelete.add(p);
        }
      }
    } finally {
      for (const f of [...createdFilesToDelete]) {
        if (fs.existsSync(f)) {
          fs.unlinkSync(f);
          createdFilesToDelete.delete(f);
        }
      }
    }

    assert.equal(
      res.status,
      401,
      `CRITICAL: Unauthenticated POST /api/upload with spoofed .html file returned HTTP ${res.status} (${JSON.stringify(res.json)}) instead of 401`
    );
  });

  it("POST /api/account/create ignores mass-assigned usertype:'admin' escalation", async () => {
    const email = `qa-massassign-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(email);
    const res = await httpJson("/api/account/create", {
      method: "POST",
      body: {
        name: "QA Mass Assign",
        email,
        password: TEST_PASS,
        mobile: "+971500000077",
        usertype: "admin",
      },
    });
    if (res.status === 201) {
      const acc = await AccountModel.findOne({ email }).lean();
      assert.equal(acc?.usertype, "user", "Mass-assignment escalated usertype to admin!");
    } else {
      assert.ok([401, 403].includes(res.status));
    }
  });

  it("POST /api/account/create should require admin authorization rather than allowing open public signups", async () => {
    const email = `qa-publicreg-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(email);
    const res = await httpJson("/api/account/create", {
      method: "POST",
      body: {
        name: "QA Public Reg",
        email,
        password: TEST_PASS,
        mobile: "+971500000066",
      },
    });
    assert.ok(
      [401, 403].includes(res.status),
      `POST /api/account/create is publicly open without auth (returned ${res.status})`
    );
  });

  it("Account lifecycle: deactivated accounts blocked (403), superseded activeToken rejected (401), logout invalidates token", async () => {
    // 1. Deactivated account login blocked
    const deactivatedLogin = await httpJson("/api/account/login", {
      method: "POST",
      body: { email: TEST_DEACTIVATED_EMAIL, password: TEST_PASS },
    });
    assert.equal(deactivatedLogin.status, 403);

    // 2. Concurrent login supersedes prior activeToken
    const tempEmail = `qa-session-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(tempEmail);
    const pwHash = await bcrypt.hash(TEST_PASS, 10);
    await AccountModel.create({
      name: "QA Session",
      email: tempEmail,
      password: pwHash,
      mobile: "+971500000055",
      usertype: "user",
      isActive: true,
    });

    const login1 = await httpJson("/api/account/login", { method: "POST", body: { email: tempEmail, password: TEST_PASS } });
    const t1 = login1.json?.token;
    assert.ok(t1);

    const login2 = await httpJson("/api/account/login", { method: "POST", body: { email: tempEmail, password: TEST_PASS } });
    const t2 = login2.json?.token;
    assert.ok(t2 && t2 !== t1);

    const oldProfile = await httpJson("/api/account/profile", { headers: { Authorization: `Bearer ${t1}` } });
    assert.equal(oldProfile.status, 401);

    const activeProfile = await httpJson("/api/account/profile", { headers: { Authorization: `Bearer ${t2}` } });
    assert.equal(activeProfile.status, 200);

    // 3. Logout invalidates active token immediately
    const logoutRes = await httpJson("/api/account/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${t2}` },
    });
    assert.equal(logoutRes.status, 200);

    const afterLogout = await httpJson("/api/account/profile", { headers: { Authorization: `Bearer ${t2}` } });
    assert.equal(afterLogout.status, 401);
  });

  it("Unpublished draft posts are excluded from GET /api/post/getActivePosts", async () => {
    const res = await httpJson("/api/post/getActivePosts");
    assert.equal(res.status, 200);
    const ids = (res.json?.data || []).map((p) => String(p._id));
    assert.ok(!ids.includes(draftPostId), "Draft leaked in getActivePosts");
  });

  it("Unpublished draft posts MUST NOT be exposed via public /getAll, /getBy/:id, or /getBySlug/:slug", async () => {
    const getAllRes = await httpJson("/api/post/getAll");
    const getAllIds = (getAllRes.json?.data || []).map((p) => String(p._id));
    assert.ok(!getAllIds.includes(draftPostId), "Unpublished draft exposed by GET /api/post/getAll");

    const byIdRes = await httpJson(`/api/post/getBy/${draftPostId}`);
    assert.ok(byIdRes.status === 404 || !byIdRes.json?.data, "Unpublished draft exposed by GET /api/post/getBy/:id");

    const bySlugRes = await httpJson(`/api/post/getBySlug/${draftPostSlug}`);
    assert.ok(bySlugRes.status === 404 || !bySlugRes.json?.data, "Unpublished draft exposed by GET /api/post/getBySlug/:slug");
  });

  it("NoSQL operator injection in /api/account/login does not grant access or crash", async () => {
    const res = await httpJson("/api/account/login", {
      method: "POST",
      body: { email: { $gt: "" }, password: { $ne: "" } },
    });
    assert.ok(res.status === 400 || res.status === 401, `Expected 400/401 for NoSQL login injection, got ${res.status}`);
  });

  it("sendEnquiryEmail escapes HTML special characters identically to sendQuotationEmail", () => {
    const sendEmailSrc = fs.readFileSync(path.join(BACKEND_ROOT, "middlewares/sendEmail.js"), "utf8");
    const fnMatch = sendEmailSrc.match(/export const sendEnquiryEmail[\s\S]*?\n\};/);
    assert.ok(fnMatch, "Could not read sendEnquiryEmail source");
    assert.ok(
      fnMatch[0].includes("escapeHtml("),
      "sendEnquiryEmail interpolates raw ${name}/${message} HTML without escapeHtml() whereas sendQuotationEmail uses escapeHtml()"
    );
  });

  it("500 responses do not leak raw error.message to clients", async () => {
    // Check both source and runtime: category/enquiry/account 500 handlers currently include error: error.message
    const accSrc = fs.readFileSync(path.join(BACKEND_ROOT, "controllers/account.controller.js"), "utf8");
    assert.ok(
      !/error:\s*error\.message/.test(accSrc),
      "Controllers return raw `error: error.message` in HTTP 500 JSON responses"
    );
  });
});

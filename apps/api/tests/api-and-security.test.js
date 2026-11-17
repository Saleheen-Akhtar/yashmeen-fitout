import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { SMTPServer } from "smtp-server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const TEST_MONGO_URI = String(process.env.TEST_MONGO_URI || "").trim();
if (!TEST_MONGO_URI) {
  throw new Error("TEST_MONGO_URI is required and must point to a disposable integration-test database");
}
process.env.MONGO_URI = TEST_MONGO_URI;

import connectDB from "../config/db.config.js";
import AccountModel from "../models/account.model.js";
import PostModel from "../models/post.model.js";
import QuoteModel from "../models/quotes.model.js";
import EnquiryModel from "../models/enquiry.model.js";
import VacancyModel from "../models/vacancy.model.js";
import WebDetailsModel from "../models/webDetails.model.js";

const RUN_ID = `qatest-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const TEST_ADMIN_EMAIL = `qa-admin-${RUN_ID}@qa-test.invalid`;
const TEST_USER_EMAIL = `qa-user-${RUN_ID}@qa-test.invalid`;
const TEST_DEACTIVATED_EMAIL = `qa-inactive-${RUN_ID}@qa-test.invalid`;
const TEST_PASS = "QaTest#2026!Pass";

let API_BASE = process.env.TEST_API_URL || "http://localhost:8000";
let spawnedServer = null;
let smtpServer = null;
let initialWebsiteDetails;
let editedWebsiteDetailsId;
const receivedEmails = [];
const rejectEmailSubjects = new Set();

function deliveredEmail(recipient, subject) {
  const message = receivedEmails.findLast((mail) => mail.to.includes(recipient) && mail.raw.includes(`Subject: ${subject}`));
  assert.ok(message, `Expected local SMTP delivery: ${subject}`);
  return message.raw.replace(/=\r?\n/g, "").replace(/=([0-9a-f]{2})/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function emailedToken(recipient, subject, route) {
  const match = deliveredEmail(recipient, subject).match(new RegExp(`http://127\\.0\\.0\\.1:3000/${route}\\?token=([a-f0-9]{64})`));
  assert.ok(match, "Expected an emailed token pointing to the configured frontend");
  return match[1];
}

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
  initialWebsiteDetails = await WebDetailsModel.findOne().lean();

  if (!process.env.TEST_API_URL) {
    smtpServer = new SMTPServer({
      disabledCommands: ["STARTTLS"],
      logger: false,
      onAuth(auth, _session, callback) {
        if (auth.username !== "qa@test.invalid" || auth.password !== "qa-placeholder") return callback(new Error("Invalid local SMTP credentials"));
        callback(null, { user: "qa" });
      },
      onData(stream, session, callback) {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          const subject = raw.match(/^Subject: (.*)$/m)?.[1]?.trim();
          if (rejectEmailSubjects.delete(subject)) return callback(new Error("Synthetic SMTP rejection"));
          receivedEmails.push({ to: session.envelope.rcptTo.map((recipient) => recipient.address), raw });
          callback();
        });
        stream.on("error", callback);
      },
    });
    await new Promise((resolve, reject) => {
      smtpServer.once("error", reject);
      smtpServer.listen(0, "127.0.0.1", resolve);
    });
    const port = 8900 + Math.floor(Math.random() * 900);
    API_BASE = `http://127.0.0.1:${port}`;
    spawnedServer = spawn(process.execPath, ["server.js"], {
      cwd: BACKEND_ROOT,
      env: {
        ...process.env,
        MONGO_URI: TEST_MONGO_URI,
        PORT: String(port),
        NODE_ENV: "test",
        RATE_LIMIT_BYPASS: "true",
        SMTP_HOST: "127.0.0.1",
        SMTP_PORT: String(smtpServer.server.address().port),
        SMTP_USER: "qa@test.invalid",
        SMTP_PASS: "qa-placeholder",
        EMAIL_FROM: "qa@test.invalid",
        CLIENT_URL: "http://127.0.0.1:3000",
        FRONTEND_URL: "http://127.0.0.1:3000",
      },
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
      isVerified: true,
    },
    {
      name: `[QA-TEST] User ${RUN_ID}`,
      email: TEST_USER_EMAIL,
      password: passwordHash,
      mobile: "+971500000002",
      usertype: "user",
      isActive: true,
      isVerified: true,
    },
    {
      name: `[QA-TEST] Deactivated ${RUN_ID}`,
      email: TEST_DEACTIVATED_EMAIL,
      password: passwordHash,
      mobile: "+971500000003",
      usertype: "user",
      isActive: false,
      isVerified: true,
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
      if (editedWebsiteDetailsId) {
        if (initialWebsiteDetails) await WebDetailsModel.replaceOne({ _id: initialWebsiteDetails._id }, initialWebsiteDetails);
        else await WebDetailsModel.deleteOne({ _id: editedWebsiteDetailsId });
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
    if (smtpServer) await new Promise((resolve) => smtpServer.close(resolve));
  }
});

describe("CMS persistence", () => {
  const adminHeaders = () => ({ Authorization: `Bearer ${adminToken}` });

  it("public and admin reads leave the database unchanged", async () => {
    const beforeRead = await WebDetailsModel.find({}).lean();
    const publicRead = await httpJson("/api/webDetails/details");
    const adminRead = await httpJson("/api/webDetails/admin-details", { headers: adminHeaders() });
    assert.equal(publicRead.status, 200);
    assert.equal(adminRead.status, 200);
    assert.deepEqual(await WebDetailsModel.find({}).lean(), beforeRead);
    assert.equal(publicRead.json.data.crmTasks, undefined);
    assert.equal(publicRead.json.data.calendarEvents, undefined);
    assert.ok(Array.isArray(adminRead.json.data.crmTasks));
  });

  it("partial saves preserve nested siblings, empty lists and private/public separation", async () => {
    const save = await httpJson("/api/webDetails/update", {
      method: "PUT", headers: adminHeaders(),
      body: { mobile: "+971500000022", hero: { title: "QA persisted title", intro: "QA preserved sibling" }, socialLinks: [] },
    });
    assert.equal(save.status, 200);
    editedWebsiteDetailsId = save.json.data._id;
    const patch = await httpJson("/api/webDetails/update", {
      method: "PUT", headers: adminHeaders(), body: { hero: { intro: "QA updated intro" } },
    });
    assert.equal(patch.status, 200);
    const stored = await WebDetailsModel.findById(editedWebsiteDetailsId).lean();
    assert.equal(stored.mobile, "+971500000022");
    assert.equal(stored.hero.title, "QA persisted title");
    assert.equal(stored.hero.intro, "QA updated intro");
    assert.deepEqual(stored.socialLinks, []);
    const privateTask = { ...patch.json.data.crmTasks[0], id: `private-${RUN_ID}`, title: `Private task ${RUN_ID}` };
    const privateSave = await httpJson("/api/webDetails/update", {
      method: "PUT", headers: adminHeaders(), body: { crmTasks: [privateTask], calendarEvents: [] },
    });
    assert.equal(privateSave.status, 200);
    const publicRead = await httpJson("/api/webDetails/details");
    assert.equal(publicRead.json.data.mobile, "+971500000022");
    assert.equal(publicRead.json.data.hero.title, "QA persisted title");
    assert.deepEqual(publicRead.json.data.socialLinks, []);
    assert.equal(publicRead.json.data.crmTasks, undefined);
    assert.equal(publicRead.json.data.calendarEvents, undefined);
    assert.ok(!publicRead.text.includes(`Private task ${RUN_ID}`));
    const adminRead = await httpJson("/api/webDetails/admin-details", { headers: adminHeaders() });
    assert.equal(adminRead.json.data.crmTasks[0].title, `Private task ${RUN_ID}`);
    assert.deepEqual(adminRead.json.data.calendarEvents, []);
  });

  it("invalid saves leave previously stored content unchanged", async () => {
    const beforeSave = await WebDetailsModel.find({}).lean();
    for (const body of [{ email: "invalid-email" }, { services: [{ image: "javascript:alert(1)" }] }, { $set: { mobile: "injected" } }, { unknownField: "unsupported" }]) {
      const response = await httpJson("/api/webDetails/update", { method: "PUT", headers: adminHeaders(), body });
      assert.equal(response.status, 400);
    }
    assert.deepEqual(await WebDetailsModel.find({}).lean(), beforeSave);
  });
});

describe("Local SMTP delivery and account workflows", { skip: Boolean(process.env.TEST_API_URL) }, () => {
  it("delivers verification/resend/reset links, rejects replay and revokes prior sessions", async () => {
    const email = `qa-delivery-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(email);
    const registration = await httpJson("/api/account/create", {
      method: "POST", headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: "QA Email Delivery", email, password: TEST_PASS, mobile: "+971500000021", usertype: "admin" },
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.json.token, undefined);
    const originalToken = emailedToken(email, "Verify your email", "verify-email");
    const stored = await AccountModel.findOne({ email }).select("+verificationToken").lean();
    assert.equal(stored.usertype, "user");
    assert.equal(stored.isVerified, false);
    assert.equal(stored.verificationToken, crypto.createHash("sha256").update(originalToken).digest("hex"));
    const blockedLogin = await httpJson("/api/account/login", { method: "POST", body: { email, password: TEST_PASS } });
    assert.equal(blockedLogin.json.code, "EMAIL_NOT_VERIFIED");
    const resend = await httpJson("/api/account/resend-verification", { method: "POST", body: { email } });
    assert.equal(resend.status, 200);
    const token = emailedToken(email, "Verify your email", "verify-email");
    assert.notEqual(token, originalToken);
    assert.equal((await httpJson(`/api/account/verify-email?token=${originalToken}`)).status, 400);
    assert.equal((await httpJson(`/api/account/verify-email?token=${token}`)).status, 200);
    assert.equal((await httpJson(`/api/account/verify-email?token=${token}`)).status, 400);
    const login = await httpJson("/api/account/login", { method: "POST", body: { email, password: TEST_PASS } });
    assert.equal(login.status, 200);
    const forgot = await httpJson("/api/account/forgot-password", { method: "POST", body: { email } });
    assert.equal(forgot.status, 200);
    const resetToken = emailedToken(email, "Reset your password", "reset-password");
    const storedReset = await AccountModel.findOne({ email }).select("+resetPasswordToken").lean();
    assert.equal(storedReset.resetPasswordToken, crypto.createHash("sha256").update(resetToken).digest("hex"));
    const newPassword = `${TEST_PASS}-delivered`;
    const reset = await httpJson("/api/account/reset-password", { method: "POST", body: { token: resetToken, newPassword } });
    assert.equal(reset.status, 200);
    assert.equal((await httpJson("/api/account/reset-password", { method: "POST", body: { token: resetToken, newPassword } })).status, 400);
    assert.equal((await httpJson("/api/account/profile", { headers: { Authorization: `Bearer ${login.json.token}` } })).status, 401);
    assert.equal((await httpJson("/api/account/login", { method: "POST", body: { email, password: TEST_PASS } })).status, 401);
    assert.equal((await httpJson("/api/account/login", { method: "POST", body: { email, password: newPassword } })).status, 200);
  });

  it("rolls back account creation when SMTP rejects verification delivery", async () => {
    const email = `qa-rejected-email-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(email);
    rejectEmailSubjects.add("Verify your email");
    const response = await httpJson("/api/account/create", {
      method: "POST", headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: "QA Rejected Email", email, password: TEST_PASS, mobile: "+971500000020" },
    });
    assert.equal(response.status, 502);
    assert.equal(response.json.code, "VERIFICATION_EMAIL_FAILED");
    assert.equal(await AccountModel.exists({ email }), null);
  });

  it("persists both lead forms and delivers escaped notification HTML", async () => {
    for (const [kind, model, subject, services] of [["enquiry", EnquiryModel, "New Enquiry", "Interior Fit-Out"], ["quote", QuoteModel, "New Quotation Request", ["Turnkey fit-out"]]]) {
      const email = `qa-notification-${kind}-${RUN_ID}@qa-test.invalid`;
      (kind === "quote" ? createdQuoteEmails : createdEnquiryEmails).add(email);
      const response = await httpJson(`/api/${kind}/create`, {
        method: "POST", body: { name: "QA <script>alert(1)</script>", email, mobile: "+971500000019", services, projectType: "Residential", message: "QA <img src=x onerror=alert(1)> notification content." },
      });
      assert.equal(response.status, 201);
      assert.equal(response.json.data, undefined);
      const stored = await model.findOne({ email }).lean();
      assert.equal(stored.email, email);
      const mail = deliveredEmail("qa@test.invalid", subject);
      assert.ok(mail.includes(email));
      assert.ok(mail.includes("&lt;script&gt;"));
      assert.ok(mail.includes("&lt;img"));
      assert.ok(!mail.includes("<script>"));
      assert.ok(!mail.includes("<img src=x"));
    }
  });

  it("keeps both saved leads when SMTP rejects their notifications", async () => {
    for (const [kind, model, subject, services] of [["enquiry", EnquiryModel, "New Enquiry", "Interior Fit-Out"], ["quote", QuoteModel, "New Quotation Request", ["Turnkey fit-out"]]]) {
      const email = `qa-rejected-notification-${kind}-${RUN_ID}@qa-test.invalid`;
      (kind === "quote" ? createdQuoteEmails : createdEnquiryEmails).add(email);
      rejectEmailSubjects.add(subject);
      const response = await httpJson(`/api/${kind}/create`, {
        method: "POST", body: { name: "QA Failed Notification", email, mobile: "+971500000018", services, projectType: "Residential", message: "Lead must survive notification delivery failure." },
      });
      assert.equal(response.status, 201);
      assert.ok(await model.exists({ email }));
    }
  });
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

  it("POST /api/quote/create accepts a valid payload without echoing the saved lead record", async () => {
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
    assert.equal(res.json?.data, undefined);
    assert.ok(await QuoteModel.exists({ email }), "Expected the quote to be stored");
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
    assert.equal(good.json?.data, undefined);
  });

  it("Public lead forms reject instant submissions and silently discard honeypot submissions", async () => {
    const fastEmail = `qa-fast-${RUN_ID}@qa-test.invalid`;
    const fast = await httpJson("/api/enquiry/create", {
      method: "POST",
      body: {
        name: "QA Fast Submit",
        mobile: "+971500000087",
        email: fastEmail,
        services: "Interior Fit-Out",
        message: "Automated submission that completed too quickly.",
        formStartedAt: Date.now(),
      },
    });
    assert.equal(fast.status, 400);
    assert.equal(await EnquiryModel.exists({ email: fastEmail }), null);

    const trappedEmail = `qa-trapped-${RUN_ID}@qa-test.invalid`;
    const trapped = await httpJson("/api/quote/create", {
      method: "POST",
      body: {
        name: "QA Honeypot",
        mobile: "+971500000086",
        email: trappedEmail,
        projectType: "Residential",
        services: ["Turnkey fit-out"],
        message: "Synthetic honeypot submission payload.",
        website: "https://spam.invalid",
        formStartedAt: Date.now() - 10_000,
      },
    });
    assert.equal(trapped.status, 201);
    assert.equal(await QuoteModel.exists({ email: trappedEmail }), null);
  });

  it("Old quote and enquiry cleanup archives records and excludes them from admin listings", async () => {
    const oldDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    const quoteEmail = `qa-archive-quote-${RUN_ID}@qa-test.invalid`;
    const enquiryEmail = `qa-archive-enquiry-${RUN_ID}@qa-test.invalid`;
    createdQuoteEmails.add(quoteEmail);
    createdEnquiryEmails.add(enquiryEmail);

    const quote = await QuoteModel.create({
      name: "QA Archive Quote",
      mobile: "+971500000085",
      email: quoteEmail,
      projectType: "Residential",
      services: ["Turnkey fit-out"],
      message: "Old quote record for archive verification.",
      createdAt: oldDate,
      updatedAt: oldDate,
    });
    const enquiry = await EnquiryModel.create({
      name: "QA Archive Enquiry",
      mobile: "+971500000084",
      email: enquiryEmail,
      services: "Interior Fit-Out",
      message: "Old enquiry record for archive verification.",
      createdAt: oldDate,
      updatedAt: oldDate,
    });

    const [quoteArchive, enquiryArchive] = await Promise.all([
      httpJson("/api/quote/delete/older-than-month", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      httpJson("/api/enquiry/delete/old", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
    ]);
    assert.equal(quoteArchive.status, 200);
    assert.equal(enquiryArchive.status, 200);

    const [storedQuote, storedEnquiry, quoteList, enquiryList] = await Promise.all([
      QuoteModel.findById(quote._id).lean(),
      EnquiryModel.findById(enquiry._id).lean(),
      httpJson("/api/quote/getAll", { headers: { Authorization: `Bearer ${adminToken}` } }),
      httpJson("/api/enquiry/getAll", { headers: { Authorization: `Bearer ${adminToken}` } }),
    ]);
    assert.ok(storedQuote?.archivedAt);
    assert.ok(storedEnquiry?.archivedAt);
    assert.ok(!(quoteList.json?.data || []).some((item) => String(item._id) === String(quote._id)));
    assert.ok(!(enquiryList.json?.data || []).some((item) => String(item._id) === String(enquiry._id)));
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

  it("POST /api/upload rejects spoofed image MIME types using file signatures before Cloudinary", async () => {
    const fd = new FormData();
    fd.append("upload", new Blob(["<script>alert('not-an-image')</script>"], { type: "image/png" }), "spoofed.png");
    const res = await httpJson("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: fd,
    });
    assert.equal(res.status, 400);
    assert.equal(res.json?.uploaded, false);
    assert.equal(res.json?.error?.code, "INVALID_IMAGE_SIGNATURE");
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
    ["GET", "/api/webDetails/admin-details"],
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

  it("Account lifecycle supports multiple device sessions and logout invalidates only the current token", async () => {
    // 1. Deactivated account login blocked
    const deactivatedLogin = await httpJson("/api/account/login", {
      method: "POST",
      body: { email: TEST_DEACTIVATED_EMAIL, password: TEST_PASS },
    });
    assert.equal(deactivatedLogin.status, 403);

    // 2. Concurrent logins remain active on separate devices
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
      isVerified: true,
    });

    const login1 = await httpJson("/api/account/login", { method: "POST", body: { email: tempEmail, password: TEST_PASS } });
    const t1 = login1.json?.token;
    assert.ok(t1);

    const login2 = await httpJson("/api/account/login", { method: "POST", body: { email: tempEmail, password: TEST_PASS } });
    const t2 = login2.json?.token;
    assert.ok(t2 && t2 !== t1);

    const oldProfile = await httpJson("/api/account/profile", { headers: { Authorization: `Bearer ${t1}` } });
    assert.equal(oldProfile.status, 200);

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

    const otherDeviceAfterLogout = await httpJson("/api/account/profile", { headers: { Authorization: `Bearer ${t1}` } });
    assert.equal(otherDeviceAfterLogout.status, 200);
  });

  it("Login locks an account after five failed attempts and rejects passwords over bcrypt's byte limit", async () => {
    const lockEmail = `qa-lockout-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(lockEmail);
    await AccountModel.create({
      name: "QA Lockout",
      email: lockEmail,
      password: await bcrypt.hash(TEST_PASS, 10),
      mobile: "+971500000054",
      usertype: "user",
      isActive: true,
      isVerified: true,
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const failed = await httpJson("/api/account/login", {
        method: "POST",
        body: { email: lockEmail, password: `${TEST_PASS}-wrong` },
      });
      assert.equal(failed.status, 401);
    }
    const locked = await httpJson("/api/account/login", {
      method: "POST",
      body: { email: lockEmail, password: TEST_PASS },
    });
    assert.equal(locked.status, 429);

    const tooLongEmail = `qa-password-limit-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(tooLongEmail);
    const tooLong = await httpJson("/api/account/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: "QA Password Limit",
        email: tooLongEmail,
        password: "🔐".repeat(20),
        mobile: "+971500000053",
      },
    });
    assert.equal(tooLong.status, 400);
    assert.match(tooLong.json?.message || "", /72 bytes/i);
  });

  it("Verification resend does not reveal whether an email exists or is already verified", async () => {
    const unknown = await httpJson("/api/account/resend-verification", {
      method: "POST",
      body: { email: `qa-unknown-${RUN_ID}@qa-test.invalid` },
    });
    const verified = await httpJson("/api/account/resend-verification", {
      method: "POST",
      body: { email: TEST_USER_EMAIL },
    });
    assert.equal(unknown.status, 200);
    assert.equal(verified.status, 200);
    assert.equal(unknown.json?.message, verified.json?.message);
  });

  it("Unverified accounts are blocked, hashed verification tokens redeem once, and reset tokens are accepted only in the POST body", async () => {
    const email = `qa-verification-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(email);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const passwordHash = await bcrypt.hash(TEST_PASS, 10);
    const account = await AccountModel.create({
      name: "QA Verification",
      email,
      password: passwordHash,
      mobile: "+971500000044",
      usertype: "user",
      isActive: true,
      isVerified: false,
      verificationToken: verificationHash,
      verificationTokenExpiresAt: new Date(Date.now() + 60_000),
    });

    const blocked = await httpJson("/api/account/login", {
      method: "POST",
      body: { email, password: TEST_PASS },
    });
    assert.equal(blocked.status, 403);
    assert.equal(blocked.json?.code, "EMAIL_NOT_VERIFIED");

    const stored = await AccountModel.findById(account._id).select("+verificationToken").lean();
    assert.notEqual(stored.verificationToken, verificationToken);
    assert.equal(stored.verificationToken, verificationHash);

    const verified = await httpJson(`/api/account/verify-email?token=${encodeURIComponent(verificationToken)}`);
    assert.equal(verified.status, 200);
    const replay = await httpJson(`/api/account/verify-email?token=${encodeURIComponent(verificationToken)}`);
    assert.equal(replay.status, 400);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    await AccountModel.updateOne(
      { _id: account._id },
      { $set: { resetPasswordToken: resetHash, resetPasswordExpiresAt: new Date(Date.now() + 60_000) } },
    );
    const newPassword = `${TEST_PASS}-new`;
    const reset = await httpJson("/api/account/reset-password", {
      method: "POST",
      body: { token: resetToken, newPassword },
    });
    assert.equal(reset.status, 200);

    const oldLogin = await httpJson("/api/account/login", { method: "POST", body: { email, password: TEST_PASS } });
    assert.equal(oldLogin.status, 401);
    const newLogin = await httpJson("/api/account/login", { method: "POST", body: { email, password: newPassword } });
    assert.equal(newLogin.status, 200);
  });

  it("Expired verification and reset tokens return explicit retryable states", async () => {
    const email = `qa-expired-${RUN_ID}@qa-test.invalid`;
    createdAccountEmails.add(email);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto.randomBytes(32).toString("hex");
    await AccountModel.create({
      name: "QA Expired Tokens",
      email,
      password: await bcrypt.hash(TEST_PASS, 10),
      mobile: "+971500000033",
      usertype: "user",
      isActive: true,
      isVerified: false,
      verificationToken: crypto.createHash("sha256").update(verificationToken).digest("hex"),
      verificationTokenExpiresAt: new Date(Date.now() - 1_000),
      resetPasswordToken: crypto.createHash("sha256").update(resetToken).digest("hex"),
      resetPasswordExpiresAt: new Date(Date.now() - 1_000),
    });

    const verify = await httpJson(`/api/account/verify-email?token=${encodeURIComponent(verificationToken)}`);
    assert.equal(verify.status, 410);
    assert.equal(verify.json?.code, "EXPIRED_VERIFICATION_TOKEN");

    const reset = await httpJson("/api/account/reset-password", {
      method: "POST",
      body: { token: resetToken, newPassword: `${TEST_PASS}-new` },
    });
    assert.equal(reset.status, 410);
    assert.equal(reset.json?.code, "EXPIRED_RESET_TOKEN");
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

// Authenticate SMTP without sending email; report configuration names only.
import '../config/env.js';
import nodemailer from 'nodemailer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { API_ROOT, getMissingProductionEnv } from '../config/env.js';

const report = { generatedAt: new Date().toISOString(), missingProductionEnv: getMissingProductionEnv(), smtp: { configured: false, verified: false, emailsSent: 0 } };
const configured = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'].every(key => Boolean(process.env[key]?.trim()));
report.smtp.configured = configured;
if (configured) {
  const port = Number(process.env.SMTP_PORT) || 587;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port, secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  try { report.smtp.verified = await transport.verify(); }
  catch (error) {
    // SMTP errors may contain account names or server responses.
    report.smtp.error = { type: error.name, code: error.code || null };
  } finally { transport.close(); }
}
const target = path.resolve(API_ROOT, '../../audit/provider-readiness.json');
await fs.writeFile(target, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
if (!report.smtp.verified || report.missingProductionEnv.length) process.exitCode = 1;

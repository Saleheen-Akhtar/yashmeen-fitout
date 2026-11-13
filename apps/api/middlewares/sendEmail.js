import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM in your .env file.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getFrontendBaseUrl = () =>
  (process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");

export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const sendEmail = async (to, subject, html) => {
  if (!isEmailConfigured()) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${getFrontendBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    const safeUrl = escapeHtml(verifyUrl);
    await sendEmail(
        to,
        "Verify your email",
        `<p>Please verify your email by clicking the link below:</p>
         <p><a href="${safeUrl}">${safeUrl}</a></p>
         <p>This link expires in 24 hours.</p>`
    );
};

export const sendResetPasswordEmail = async (to, token) => {
    const resetUrl = `${getFrontendBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    const safeUrl = escapeHtml(resetUrl);
    await sendEmail(
        to,
        "Reset your password",
        `<p>You requested a password reset for your Yashmeen Fit-Out account.</p>
         <p><a href="${safeUrl}">Reset your password</a></p>
         <p>If you did not request this, you can safely ignore this email. This link expires in 1 hour.</p>`
    );
};

export const sendEnquiryEmail = async ({
  name,
  mobile,
  email,
  services,
  message,
}) => {
  const serviceList = Array.isArray(services) ? services.join(", ") : services;

  await sendEmail(
    process.env.SMTP_USER,
    "New Enquiry",
    `<h3>Enquiry Details</h3>
         <ul>
           <li><strong>Name:</strong> ${escapeHtml(name)}</li>
           <li><strong>Mobile:</strong> ${escapeHtml(mobile)}</li>
           <li><strong>Email:</strong> ${escapeHtml(email)}</li>
           <li><strong>Service:</strong> ${escapeHtml(serviceList)}</li>
           <li><strong>Message:</strong> ${escapeHtml(message)}</li>
         </ul>
         <p>&copy; ${new Date().getFullYear()} Yashmeen Future Building. All rights reserved.</p>
         `,
  );
};

export const sendQuotationEmail = async ( {
  name,
  mobile,
  email,
  projectType,
  services,
  location,
  budget,
  timeline,
  message,
}) => {
  const serviceList = Array.isArray(services) ? services.join(", ") : services;

  await sendEmail(
    process.env.SMTP_USER,
    "New Quotation Request",
    `<h3>Quotation Request Details</h3>
         <ul>
           <li><strong>Name:</strong> ${escapeHtml(name)}</li>
           <li><strong>Mobile:</strong> ${escapeHtml(mobile)}</li>
           <li><strong>Email:</strong> ${escapeHtml(email)}</li>
           <li><strong>Project Type:</strong> ${escapeHtml(projectType)}</li>
           <li><strong>Services:</strong> ${escapeHtml(serviceList)}</li>
           <li><strong>Location:</strong> ${escapeHtml(location) || "Not specified"}</li>
           <li><strong>Budget:</strong> ${escapeHtml(budget) || "Not specified"}</li>
           <li><strong>Timeline:</strong> ${escapeHtml(timeline) || "Not specified"}</li>
           <li><strong>Message:</strong> ${escapeHtml(message)}</li>
         </ul>
         <p>&copy; ${new Date().getFullYear()} Yashmeen Future Building. All rights reserved.</p>
         `,
  );
};
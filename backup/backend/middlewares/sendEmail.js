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

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (to, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await sendEmail(
        to,
        "Verify your email",
        `<p>Please verify your email by clicking the link below:</p>
         <p><a href="${verifyUrl}">${verifyUrl}</a></p>
         <p>This link expires in 24 hours.</p>`
    );
};

export const sendEnquiryEmail = async ({
  name,
  mobile,
  email,
  services,
  message,
}) => {
  await sendEmail(
    process.env.SMTP_USER,
    "New Enquiry",
    `<h3>Enquiry Details</h3>
         <ul>
           <li><strong>Name:</strong> ${name}</li>
           <li><strong>Mobile:</strong> ${mobile}</li>
           <li><strong>Email:</strong> ${email}</li>
           <li><strong>Service:</strong> ${services}</li>
           <li><strong>Message:</strong> ${message}</li>
         </ul>
         <p>&copy; ${new Date().getFullYear()} Yashmeen Future Building. All rights reserved.</p>
         `,
  );
};


const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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
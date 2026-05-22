import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import nodemailer from "nodemailer";

const ALLOWED_SUBJECTS = new Set([
  "Job Opportunity",
  "Freelance",
  "Collaboration",
  "Just saying hi!",
]);

const MAX_NAME = 120;
const MAX_MESSAGE = 5000;

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
}

function jsonResponse(statusCode: number, body: Record<string, string>): Handler.Response {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim() || "akiyoshiyapa@gmail.com";

  if (!host || !user || !pass || !from) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1" || port === 465;

  return { host, port, secure, user, pass, from, to };
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: {}, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const smtp = getSmtpConfig();
  if (!smtp) {
    return jsonResponse(503, { error: "Contact form is not configured on the server." });
  }

  let payload: ContactPayload;
  try {
    payload = JSON.parse(event.body ?? "{}") as ContactPayload;
  } catch {
    return jsonResponse(400, { error: "Invalid request body." });
  }

  if (payload.company?.trim()) {
    return jsonResponse(200, { ok: "accepted" });
  }

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const subject = payload.subject?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!name || name.length > MAX_NAME) {
    return jsonResponse(400, { error: "Please provide a valid name." });
  }
  if (!email || !isValidEmail(email) || email.length > 254) {
    return jsonResponse(400, { error: "Please provide a valid email address." });
  }
  if (!subject || !ALLOWED_SUBJECTS.has(subject)) {
    return jsonResponse(400, { error: "Please select a valid subject." });
  }
  if (!message || message.length < 12 || message.length > MAX_MESSAGE) {
    return jsonResponse(400, { error: "Message must be between 12 and 5000 characters." });
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const mailSubject = `Portfolio contact: ${subject}`;
  const text = [
    `New message from your portfolio`,
    ``,
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    ``,
    `Message:`,
    message,
    ``,
    `---`,
    `Sent via akiyoshiyapa.netlify.app`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: smtp.from,
      to: smtp.to,
      replyTo: email,
      subject: mailSubject,
      text,
    });
  } catch (err) {
    console.error("SMTP send failed:", err);
    return jsonResponse(502, { error: "Could not send your message. Please try again later." });
  }

  return jsonResponse(200, { ok: "sent" });
};

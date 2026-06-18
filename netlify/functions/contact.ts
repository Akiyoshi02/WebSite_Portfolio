import type { Handler, HandlerEvent, HandlerContext, HandlerResponse } from "@netlify/functions";
import nodemailer from "nodemailer";
import {
  buildContactEmailHtml,
  buildContactEmailText,
} from "./contactEmailTemplate";
import {
  buildConfirmationEmailHtml,
  buildConfirmationEmailSubject,
  buildConfirmationEmailText,
} from "./confirmationEmailTemplate";
import { SITE_NAME } from "./emailTheme";

const ALLOWED_SUBJECTS = new Set([
  "Job Opportunity",
  "Freelance",
  "Collaboration",
  "Just saying hi!",
]);

const MAX_NAME = 120;
const MAX_MESSAGE = 5000;
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
}

function jsonResponse(
  statusCode: number,
  body: Record<string, string>,
  extraHeaders: Record<string, string> = {},
): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
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

function getClientKey(event: HandlerEvent): string {
  const forwardedFor = event.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  return (
    event.headers["x-nf-client-connection-ip"] ??
    event.headers["client-ip"] ??
    forwardedFor ??
    "unknown"
  );
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  current.count += 1;

  if (current.count > RATE_LIMIT_MAX) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  }

  return null;
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Cache-Control": "no-store" }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const retryAfter = checkRateLimit(getClientKey(event));
  if (retryAfter) {
    return jsonResponse(
      429,
      { error: "Too many messages. Please try again later." },
      { "Retry-After": String(retryAfter) },
    );
  }

  const smtp = getSmtpConfig();
  if (!smtp) {
    return jsonResponse(503, { error: "Contact form is not configured on the server." });
  }

  if (Buffer.byteLength(event.body ?? "", "utf8") > MAX_BODY_BYTES) {
    return jsonResponse(413, { error: "Request body is too large." });
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

  const mailSubject = subject;
  const emailContent = { name, email, subject, message };
  const ownerText = buildContactEmailText(emailContent);
  const ownerHtml = buildContactEmailHtml(emailContent);
  const fromAddress = `"${SITE_NAME}" <${smtp.from}>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: smtp.to,
      replyTo: email,
      subject: mailSubject,
      text: ownerText,
      html: ownerHtml,
    });
  } catch (err) {
    console.error("Owner notification failed:", err);
    return jsonResponse(502, { error: "Could not send your message. Please try again later." });
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      replyTo: smtp.to,
      subject: buildConfirmationEmailSubject(emailContent),
      text: buildConfirmationEmailText(emailContent),
      html: buildConfirmationEmailHtml(emailContent),
    });
  } catch (err) {
    console.error("Confirmation email failed:", err);
  }

  return jsonResponse(200, { ok: "sent" });
};

import type { Session } from "@supabase/supabase-js";

const fallbackAdminEmails = ["akiyoshiyapa@gmail.com"];

function getConfiguredAdminEmails() {
  const configured = import.meta.env.PUBLIC_ADMIN_EMAILS ?? fallbackAdminEmails.join(",");
  return configured
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(window.atob(padded)) as { amr?: Array<{ method?: string }> };
  } catch {
    return null;
  }
}

export function getAdminSessionIssue(session: Session | null) {
  if (!session) return "Sign in to continue.";

  const userEmail = session.user.email?.trim().toLowerCase();
  const allowedEmails = getConfiguredAdminEmails();

  if (!userEmail || !allowedEmails.includes(userEmail)) {
    return "This account is not authorized to access the admin panel.";
  }

  const authMethods = decodeJwtPayload(session.access_token)?.amr?.map((item) => item.method) ?? [];
  if (!authMethods.includes("password")) {
    return "Password recovery links cannot open the admin panel. Reset your password, then sign in with it.";
  }

  return null;
}

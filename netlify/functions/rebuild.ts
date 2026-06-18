import type { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS_FALLBACK = "akiyoshiyapa@gmail.com";

function jsonResponse(statusCode: number, body: Record<string, string>): HandlerResponse {
  return {
    statusCode,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      Vary: "Authorization",
    },
    body: JSON.stringify(body),
  };
}

function getBearerToken(event: HandlerEvent): string | null {
  const header = event.headers.authorization ?? event.headers.Authorization;
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? process.env.PUBLIC_ADMIN_EMAILS ?? ADMIN_EMAILS_FALLBACK)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getRequiredEnv() {
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY?.trim();
  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK_URL?.trim();

  if (!supabaseUrl || !supabaseAnonKey || !buildHookUrl) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey, buildHookUrl };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { "Cache-Control": "no-store" }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const env = getRequiredEnv();
  if (!env) {
    return jsonResponse(503, { error: "Build trigger is not configured." });
  }

  const token = getBearerToken(event);
  if (!token) {
    return jsonResponse(401, { error: "Authentication required." });
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.trim().toLowerCase();

  if (error || !email || !getAdminEmails().includes(email)) {
    return jsonResponse(403, { error: "Not authorized to trigger builds." });
  }

  try {
    const response = await fetch(env.buildHookUrl, { method: "POST" });
    if (!response.ok) {
      console.error("Netlify build hook failed:", response.status, await response.text().catch(() => ""));
      return jsonResponse(502, { error: "Build service did not accept the request." });
    }
  } catch (error) {
    console.error("Netlify build hook request failed:", error);
    return jsonResponse(502, { error: "Could not reach the build service." });
  }

  return jsonResponse(202, { ok: "queued" });
};

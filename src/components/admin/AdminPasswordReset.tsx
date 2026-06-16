import { useEffect, useState } from "react";
import { createEphemeralSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { formatAuthMessage } from "@/lib/authMessages";

type ResetStatus = "checking" | "ready" | "saving" | "success" | "error";

function getAuthParam(name: string) {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return hashParams.get(name) ?? searchParams.get(name);
}

export default function AdminPasswordReset() {
  const [recoveryClient] = useState(() => createEphemeralSupabaseClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<ResetStatus>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function prepareRecoverySession() {
      if (!isSupabaseConfigured) {
        setStatus("error");
        setMessage("Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY before resetting your password.");
        return;
      }

      await supabase.auth.signOut();

      const authError = getAuthParam("error_description") ?? getAuthParam("error");
      if (authError) {
        setStatus("error");
        setMessage(formatAuthMessage(authError));
        return;
      }

      const accessToken = getAuthParam("access_token");
      const refreshToken = getAuthParam("refresh_token");
      const hasRecoveryIntent = getAuthParam("type") === "recovery" || Boolean(accessToken || refreshToken);

      if (accessToken && refreshToken) {
        const { error: sessionError } = await recoveryClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          if (!mounted) return;
          setStatus("error");
          setMessage(formatAuthMessage(sessionError.message));
          return;
        }

        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const { data, error } = await recoveryClient.auth.getSession();
      if (!mounted) return;

      if (error || !data.session) {
        setStatus("error");
        setMessage(
          hasRecoveryIntent
            ? "This recovery link is no longer valid. Request a fresh reset email from the admin sign-in screen."
            : "Request a reset email from the admin sign-in screen, then open the newest link from your inbox.",
        );
        return;
      }

      setStatus("ready");
    }

    void prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [recoveryClient]);

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    if (password.length < 8) {
      setMessage("Use at least 8 characters for the new password.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The password fields do not match.");
      return;
    }

    setStatus("saving");
    setMessage("");
    const { error } = await recoveryClient.auth.updateUser({ password });

    if (error) {
      setStatus("ready");
      setMessage(formatAuthMessage(error.message));
      return;
    }

    await recoveryClient.auth.signOut();
    setPassword("");
    setConfirmPassword("");
    setStatus("success");
    setMessage("Password updated. Sign in with your new password.");
  }

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card glass" aria-labelledby="admin-reset-title">
        <img src="/logo.png" alt="" width="48" height="48" />
        <h1 className="gradient-text" id="admin-reset-title">
          Reset Password
        </h1>
        <p className="admin-login-subtitle">// account.recovery</p>

        {status === "checking" ? <p className="admin-card-note admin-reset-note">Checking recovery link...</p> : null}

        {status === "error" ? (
          <>
            <p className="admin-error">{message}</p>
            <a className="admin-btn-save admin-reset-link" href="/admin-panel">
              Back to sign in
            </a>
          </>
        ) : null}

        {status === "success" ? (
          <>
            <p className="admin-success">{message}</p>
            <a className="admin-btn-save admin-reset-link" href="/admin-panel">
              Back to sign in
            </a>
          </>
        ) : null}

        {status === "ready" || status === "saving" ? (
          <form onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="admin-new-password">New password</label>
              <input
                id="admin-new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="admin-confirm-password">Confirm password</label>
              <input
                id="admin-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {message ? <p className="admin-error">{message}</p> : null}
            <button className="admin-btn-save" type="submit" disabled={status !== "ready"} style={{ width: "100%" }}>
              {status === "saving" ? "Updating..." : "Update password"}
            </button>
            <div className="admin-login-secondary">
              <a className="admin-link-button" href="/admin-panel">
                Back to sign in
              </a>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}

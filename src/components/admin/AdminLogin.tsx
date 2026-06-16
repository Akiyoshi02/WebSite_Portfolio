import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { formatAuthMessage } from "@/lib/authMessages";

type LoginMode = "sign-in" | "reset";

interface Props {
  authError?: string;
}

function getPasswordResetRedirectUrl() {
  return new URL("/admin-panel/reset-password", window.location.origin).toString();
}

export default function AdminLogin({ authError = "" }: Props) {
  const [mode, setMode] = useState<LoginMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY before signing in.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) setError(formatAuthMessage(signInError.message));
  }

  async function handlePasswordReset(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY before resetting your password.");
      setNotice("");
      return;
    }

    setResetLoading(true);
    setError("");
    setNotice("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getPasswordResetRedirectUrl(),
    });
    setResetLoading(false);

    if (resetError) {
      setError(formatAuthMessage(resetError.message));
      return;
    }

    setNotice("Password reset email sent. Open the newest link in your inbox.");
  }

  function showPasswordReset() {
    setMode("reset");
    setPassword("");
    setError("");
    setNotice("");
  }

  function showSignIn() {
    setMode("sign-in");
    setError("");
    setNotice("");
  }

  const isResetMode = mode === "reset";
  const displayedError = error || (!isResetMode ? authError : "");

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card glass" aria-labelledby="admin-login-title">
        <img src="/logo.png" alt="" width="48" height="48" />
        <h1 className="gradient-text" id="admin-login-title">
          {isResetMode ? "Reset Password" : "Admin Panel"}
        </h1>
        <p className="admin-login-subtitle">{isResetMode ? "// account.recovery" : "// portfolio.management"}</p>

        <form onSubmit={isResetMode ? handlePasswordReset : handleSubmit}>
          <div className="admin-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {!isResetMode ? (
            <div className="admin-field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          ) : null}
          {displayedError ? <p className="admin-error">{displayedError}</p> : null}
          {notice ? <p className="admin-success">{notice}</p> : null}
          <button
            className="admin-btn-save"
            type="submit"
            disabled={isResetMode ? resetLoading : loading}
            style={{ width: "100%" }}
          >
            {isResetMode ? (resetLoading ? "Sending..." : "Send reset link") : loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="admin-login-secondary">
            <button className="admin-link-button" type="button" onClick={isResetMode ? showSignIn : showPasswordReset}>
              {isResetMode ? "Back to sign in" : "Forgot password?"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

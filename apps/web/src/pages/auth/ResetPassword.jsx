import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import "../../styles/auth.css";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token")?.trim() || "", [params]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (!token) return setState({ status: "error", message: "This reset link is incomplete." });
    if (password.length < 10) return setState({ status: "error", message: "Use at least 10 characters." });
    if (password !== confirmPassword) return setState({ status: "error", message: "Passwords do not match." });
    setState({ status: "loading", message: "" });
    try {
      const response = await authAPI.resetPassword({ token, newPassword: password });
      setState({ status: "success", message: response.data?.message || "Password reset successfully." });
    } catch (error) {
      const code = error?.response?.data?.code;
      setState({
        status: code === "EXPIRED_RESET_TOKEN" ? "expired" : code === "INVALID_RESET_TOKEN" ? "invalid" : "error",
        message: error?.response?.data?.message || "This reset link could not be used.",
      });
    }
  };

  return (
    <main className="auth-action-page">
      <section className="auth-action-card" aria-live="polite">
        <p className="auth-action-kicker">Yashmeen Fit-Out</p>
        <h1>Set a new password</h1>
        {state.status === "success" ? (
          <>
            <p>{state.message}</p>
            <Link className="auth-action-primary" to="/login">Return to sign in</Link>
          </>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="reset-password">New password</label>
            <input id="reset-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="reset-password-confirm">Confirm password</label>
            <input id="reset-password-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            {state.message && <p className="auth-action-error">{state.message}</p>}
            <button className="auth-action-primary" type="submit" disabled={state.status === "loading" || !token}>
              {state.status === "loading" ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
        {(!token || ["expired", "invalid"].includes(state.status)) && <Link to="/forgot-password">Request a new reset link</Link>}
      </section>
    </main>
  );
}

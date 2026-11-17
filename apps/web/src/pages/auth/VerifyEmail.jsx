import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authAPI } from "../../services/api";
import "../../styles/auth.css";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token")?.trim() || "", [params]);
  const [state, setState] = useState(() => token
    ? { status: "loading", message: "Verifying your email..." }
    : { status: "invalid", message: "This verification link is incomplete." });
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    authAPI.verifyEmail(token)
      .then((response) => {
        if (active) setState({ status: "success", message: response.data?.message || "Email verified successfully." });
      })
      .catch((error) => {
        if (!active) return;
        const code = error?.response?.data?.code;
        setState({
          status: code === "EXPIRED_VERIFICATION_TOKEN" ? "expired" : code === "INVALID_VERIFICATION_TOKEN" ? "invalid" : "error",
          message: error?.response?.data?.message || "This verification link could not be used.",
        });
      });
    return () => { active = false; };
  }, [token]);

  const resend = async (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setState({ status: "retrying", message: "Sending a new verification link..." });
    try {
      const response = await authAPI.resendVerification(email.trim());
      setState({ status: "retry-success", message: response.data?.message || "A new verification link has been sent." });
    } catch (error) {
      setState({ status: "error", message: error?.response?.data?.message || "A new verification link could not be sent." });
    }
  };

  const failed = ["expired", "invalid", "error"].includes(state.status);
  const heading = state.status === "success"
    ? "Email verified"
    : state.status === "expired"
      ? "Verification link expired"
      : state.status === "invalid"
        ? "Verification link invalid"
        : state.status === "retry-success"
          ? "New link sent"
          : state.status === "retrying"
            ? "Sending new link"
            : state.status === "error"
              ? "Verification failed"
              : "Verifying email";

  return (
    <main className="auth-action-page">
      <section className="auth-action-card" aria-live="polite">
        <p className="auth-action-kicker">Yashmeen Fit-Out</p>
        <h1>{heading}</h1>
        <p className={failed ? "auth-action-error" : ""}>{state.message}</p>
        {failed && (
          <form onSubmit={resend}>
            <label htmlFor="verification-email">Account email</label>
            <input
              id="verification-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className="auth-action-primary" type="submit">Send a new verification link</button>
          </form>
        )}
        {["success", "retry-success"].includes(state.status) && <Link className="auth-action-primary" to="/login">Continue to sign in</Link>}
        {failed && <Link to="/login">Return to sign in</Link>}
      </section>
    </main>
  );
}

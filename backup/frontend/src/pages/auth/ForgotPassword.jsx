import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { authAPI } from "../../services/api";
/**
 * ForgotPasswordPage - split-screen "reset password" screen for
 * Yashmeen Future Building, a Dubai-based fit-out and design studio.
 * Shares the same design system as LoginPage.jsx.
 * - Unique class names prefixed with "cryptusLogin" to avoid collisions.
 * - Styling is inline via style objects; a small <style> block only handles
 *   things inline styles cannot do (media queries, :hover/:focus, keyframes).
 * - Left panel uses a real interior photograph with a semi-transparent
 *   color wash on top so brand copy stays legible.
 */

const palette = {
  navy950: "#0B1220",
  navy900: "#101a30",
  navyBorder: "#1E293B",
  blue500: "#3B82F6",
  blue400: "#60A5FA",
  cyan400: "#22D3EE",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate900: "#0F172A",
  white: "#FFFFFF",
};

/* ---------- inline icon components ---------- */

const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const MailOpenIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M2.5 8.5 12 14l9.5-5.5" />
    <path d="M2.5 8.5v9a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-9L12 3 2.5 8.5Z" />
  </svg>
);

/* ---------- main component ---------- */

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | sent

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your work email.");
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      await authAPI.forgotPassword({ email: trimmed });
      setStatus("sent");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Unable to send reset link right now. Please contact an administrator.";
      setError(msg);
      setStatus("idle");
      toast.error(msg);
    }
  };

  return (
    <main className="cryptusLoginPage" style={styles.page}>
      <style>{css}</style>

      {/* LEFT - brand panel */}
      <div className="cryptusLoginLeftPanel" style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brandRow}>
            <div className="cryptusLoginLogoMark" style={styles.logoMark}>
              Y
            </div>
            <div>
              <div style={styles.brandName}>Yashmeen Future Building</div>
              <div style={styles.brandSub}>
                Fit-Out &amp; Design Studio · Dubai
              </div>
            </div>
          </div>

          <div>
            <h1 className="cryptusLoginHeadline" style={styles.headline}>
              From concept sketch to handover.
            </h1>
            <p style={styles.subtext}>
              Bespoke, functional spaces for commercial, hospitality and
              residential clients - designed and built under one roof in Al
              Quoz, Dubai.
            </p>
          </div>

          <ul className="cryptusLoginFeatureList" style={styles.featureList}>
            {[
              "Architecture & 3D visualisation",
              "MEP engineering, in-house",
              "Joinery craftsmanship on site",
            ].map((item) => (
              <li
                key={item}
                className="cryptusLoginFeatureItem"
                style={styles.featureItem}
              >
                <span style={styles.featureCheck}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="cryptusLoginStat" style={styles.statFooter}>
            <div style={styles.statDivider} />
            <p style={styles.statText}>
              One facility in Al Quoz - from drawing to delivery
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT - form panel */}
      <div className="cryptusLoginRightPanel" style={styles.rightPanel}>
        <div className="cryptusLoginCard" style={styles.card}>
          <Link
            to="/login"
            className="cryptusLoginBackLink"
            style={styles.backLink}
          >
            <ArrowLeftIcon />
            Back to sign in
          </Link>

          {status === "sent" ? (
            <div style={styles.successBox}>
              <div style={styles.successIcon}>
                <MailOpenIcon />
              </div>
              <h2 style={styles.cardTitle}>Check your inbox</h2>
              <p style={styles.cardSubtitle}>
                If an account exists for{" "}
                <strong style={styles.emailStrong}>{email}</strong>, we've sent
                a link to reset your password.
              </p>
              <button
                type="button"
                className="cryptusLoginLinkBtn"
                style={styles.linkBtn}
                onClick={() => setStatus("idle")}
              >
                Didn't get it? Try another email
              </button>
            </div>
          ) : (
            <>
              <h2 style={styles.cardTitle}>Forgot your password?</h2>
              <p style={styles.cardSubtitle}>
                Enter the email linked to your account and we'll send you a link
                to reset it.
              </p>

              <form onSubmit={handleSubmit} noValidate style={styles.form}>
                <div
                  className="cryptusLoginInputGroup"
                  style={styles.inputGroup}
                >
                  <label
                    htmlFor="clg-reset-email"
                    className="cryptusLoginLabel"
                    style={styles.label}
                  >
                    Work email
                  </label>
                  <div
                    className={`cryptusLoginInputWrap ${error ? "cryptusLoginInputError" : ""}`}
                    style={styles.inputWrap}
                  >
                    <span style={styles.inputIcon}>
                      <MailIcon />
                    </span>
                    <input
                      id="clg-reset-email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={handleChange}
                      className="cryptusLoginInput"
                      style={styles.input}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <span
                      className="cryptusLoginErrorMsg"
                      style={styles.errorMsg}
                    >
                      {error}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="cryptusLoginBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? "Sending link…"
                    : "Send reset link"}
                </button>
              </form>

              <p style={styles.footerText}>
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="cryptusLoginLink"
                  style={styles.link}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- style objects (inline) ---------- */

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "100vh",
    width: "100%",
    fontFamily: "var(--font-sans, 'Plus Jakarta Sans', system-ui, sans-serif)",
    background: palette.slate50,
  },
  leftPanel: {
    position: "relative",
    backgroundImage: `linear-gradient(160deg, rgba(11,18,32,0.90) 0%, rgba(16,26,48,0.82) 55%, rgba(11,18,32,0.92) 100%), url("/static/hero-bg.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: palette.slate50,
    padding: "clamp(28px, 5vw, 64px)",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "clamp(24px, 4vw, 40px)",
    maxWidth: "480px",
  },
  brandRow: { display: "flex", alignItems: "center", gap: "12px" },
  logoMark: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: `linear-gradient(135deg, ${palette.blue500}, ${palette.cyan400})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "18px",
    color: palette.navy950,
    flexShrink: 0,
  },
  brandName: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "16px",
    letterSpacing: "0.01em",
  },
  brandSub: { fontSize: "12px", color: palette.slate400, marginTop: "1px" },
  headline: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "clamp(28px, 3.4vw, 42px)",
    lineHeight: 1.15,
    margin: "0 0 14px 0",
    color: palette.white,
  },
  subtext: {
    fontSize: "clamp(14px, 1.4vw, 16px)",
    lineHeight: 1.6,
    color: palette.slate400,
    margin: 0,
    maxWidth: "42ch",
  },
  featureList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    color: palette.slate50,
  },
  featureCheck: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "rgba(34, 211, 238, 0.12)",
    color: palette.cyan400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statFooter: { display: "flex", flexDirection: "column", gap: "16px" },
  statDivider: { height: "1px", background: palette.navyBorder, width: "100%" },
  statText: { margin: 0, fontSize: "13px", color: palette.slate500 },

  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(20px, 4vw, 48px)",
    background: palette.slate50,
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: palette.white,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "16px",
    padding: "clamp(28px, 4vw, 40px)",
    boxSizing: "border-box",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 500,
    color: palette.slate500,
    textDecoration: "none",
    marginBottom: "24px",
  },
  cardTitle: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "24px",
    color: palette.slate900,
    margin: "0 0 6px 0",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: palette.slate500,
    margin: "0 0 28px 0",
    lineHeight: 1.6,
  },
  emailStrong: { color: palette.slate900, fontWeight: 600 },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 500, color: palette.slate900 },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: palette.slate100,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "10px",
    padding: "0 14px",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  inputIcon: { color: palette.slate400, display: "flex", flexShrink: 0 },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
    color: palette.slate900,
    minWidth: 0,
  },
  errorMsg: { fontSize: "12px", color: "#DC2626" },
  btnPrimary: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    background: palette.blue500,
    color: palette.white,
    border: "none",
    borderRadius: "10px",
    padding: "13px 0",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s ease, transform 0.1s ease",
  },
  link: {
    fontSize: "13px",
    color: palette.blue500,
    textDecoration: "none",
    fontWeight: 500,
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: palette.slate500,
    marginTop: "24px",
  },
  successBox: { textAlign: "center", padding: "4px 0 8px 0" },
  successIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.1)",
    color: palette.blue500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 18px auto",
  },
  linkBtn: {
    marginTop: "20px",
    background: "transparent",
    border: "none",
    padding: 0,
    fontSize: "13px",
    fontWeight: 500,
    color: palette.blue500,
    cursor: "pointer",
  },
};

/* ---------- CSS block: only what inline style can't do ---------- */

const css = `
  .cryptusLoginPage * { box-sizing: border-box; }

  .cryptusLoginCard {
    animation: cryptusLoginFadeUp 0.5s ease both;
  }
  @keyframes cryptusLoginFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cryptusLoginInputWrap:focus-within {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .cryptusLoginInputError {
    border-color: #DC2626 !important;
  }
  .cryptusLoginInput::placeholder { color: ${palette.slate400}; }

  .cryptusLoginBtnPrimary:hover:not(:disabled) { background: ${palette.blue400}; }
  .cryptusLoginBtnPrimary:active:not(:disabled) { transform: translateY(1px); }
  .cryptusLoginBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .cryptusLoginBtnPrimary:focus-visible,
  .cryptusLoginLink:focus-visible,
  .cryptusLoginBackLink:focus-visible,
  .cryptusLoginLinkBtn:focus-visible {
    outline: 2px solid ${palette.blue500};
    outline-offset: 2px;
  }

  .cryptusLoginLink:hover { text-decoration: underline; }
  .cryptusLoginBackLink:hover { color: ${palette.slate900}; }
  .cryptusLoginLinkBtn:hover { text-decoration: underline; }

  @media (max-width: 960px) {
    .cryptusLoginPage { grid-template-columns: 1fr !important; }
    .cryptusLoginLeftPanel { padding: 32px 24px !important; }
    .cryptusLoginFeatureList { display: none !important; }
    .cryptusLoginStat { display: none !important; }
  }

  @media (max-width: 560px) {
    .cryptusLoginLeftPanel { padding: 24px 20px !important; }
    .cryptusLoginRightPanel { padding: 20px 16px !important; }
    .cryptusLoginCard { padding: 24px 20px !important; border-radius: 12px !important; }
  }
`;

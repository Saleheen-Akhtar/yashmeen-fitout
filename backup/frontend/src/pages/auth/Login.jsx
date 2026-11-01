import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import createStore from "../../store";
import { toast } from "sonner";

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

const LockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
    <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    {off ? (
      <>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c5.5 0 9.5 4.2 10.5 7-.4 1.1-1.1 2.3-2 3.4M6.3 6.5C4.3 7.9 2.9 9.8 1.5 12c1.3 3 5.1 7 10.5 7 1.5 0 2.9-.3 4.1-.8" />
        <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
      </>
    ) : (
      <>
        <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7-10.5-7-10.5-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5Z"
    />
    <path
      fill="#FF3D00"
      d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.6 0-14.1 4.2-17.7 10.4Z"
    />
    <path
      fill="#4CAF50"
      d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4c-2 1.4-4.6 2.3-7.6 2.3-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 40.6 16.3 45 24 45Z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.4C41.6 35.6 45 30.3 45 24c0-1.2-.1-2.4-.4-3.5Z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.7.5.7 5.6.7 12c0 5.1 3.3 9.4 7.8 11 .6.1.8-.2.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.4-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.6 7.8-5.9 7.8-11C23.3 5.6 18.3.5 12 .5Z" />
  </svg>
);

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, setCredentials } = createStore((state) => state);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };
  //
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(formData.email)) {
      toast.error("Enter valid email Id.");
      return;
    }
    try {
      const { data: res } = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (res?.data) {
        const userInfo = { ...res?.data, token: res.token };
        localStorage.setItem("user", JSON.stringify(userInfo));
        setCredentials(res.data, res.token);
        toast.success("Logged In successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="cryptusLoginPage" style={styles.page}>
      <style>{css}</style>

      <div className="cryptusLoginLeftPanel" style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div>
            <h1 className="cryptusLoginHeadline" style={styles.headline}>
              From concept sketch to handover.
            </h1>
            <p style={styles.subtext}>
              Bespoke, functional spaces for commercial, hospitality and
              residential clients — designed and built under one roof in Al
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
              One facility in Al Quoz — from drawing to delivery
            </p>
          </div>
        </div>
      </div>

      <div className="cryptusLoginRightPanel" style={styles.rightPanel}>
        <div className="cryptusLoginCard" style={styles.card}>
          {status === "success" ? (
            <div style={styles.successBox}>
              <div style={styles.successIcon}>
                <CheckIcon />
              </div>
              <h2 style={styles.cardTitle}>You're signed in</h2>
              <p style={styles.cardSubtitle}>
                Redirecting you to your dashboard…
              </p>
            </div>
          ) : (
            <>
              <h2 style={styles.cardTitle}>Welcome back</h2>
              <p style={styles.cardSubtitle}>
                Enter your credentials to access your account
              </p>

              <form onSubmit={handleSubmit} noValidate style={styles.form}>
                <div
                  className="cryptusLoginInputGroup"
                  style={styles.inputGroup}
                >
                  <label
                    htmlFor="clg-email"
                    className="cryptusLoginLabel"
                    style={styles.label}
                  >
                    Work email
                  </label>
                  <div
                    className={`cryptusLoginInputWrap ${errors.email ? "cryptusLoginInputError" : ""}`}
                    style={styles.inputWrap}
                  >
                    <span style={styles.inputIcon}>
                      <MailIcon />
                    </span>
                    <input
                      id="clg-email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange("email")}
                      className="cryptusLoginInput"
                      style={styles.input}
                    />
                  </div>
                  {errors.email && (
                    <span
                      className="cryptusLoginErrorMsg"
                      style={styles.errorMsg}
                    >
                      {errors.email}
                    </span>
                  )}
                </div>

                <div
                  className="cryptusLoginInputGroup"
                  style={styles.inputGroup}
                >
                  <label
                    htmlFor="clg-password"
                    className="cryptusLoginLabel"
                    style={styles.label}
                  >
                    Password
                  </label>
                  <div
                    className={`cryptusLoginInputWrap ${errors.password ? "cryptusLoginInputError" : ""}`}
                    style={styles.inputWrap}
                  >
                    <span style={styles.inputIcon}>
                      <LockIcon />
                    </span>
                    <input
                      id="clg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange("password")}
                      className="cryptusLoginInput"
                      style={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="cryptusLoginEyeBtn"
                      style={styles.eyeBtn}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                  {errors.password && (
                    <span
                      className="cryptusLoginErrorMsg"
                      style={styles.errorMsg}
                    >
                      {errors.password}
                    </span>
                  )}
                </div>

                <div style={styles.rowBetween}>
                  <label
                    className="cryptusLoginCheckboxRow"
                    style={styles.checkboxRow}
                  >
                    <span
                      className="cryptusLoginCheckbox"
                      data-checked={remember}
                      style={{
                        ...styles.checkbox,
                        background: remember ? palette.blue500 : palette.white,
                        borderColor: remember
                          ? palette.blue500
                          : palette.slate200,
                      }}
                      onClick={() => setRemember((r) => !r)}
                    >
                      {remember && <CheckIcon />}
                    </span>
                    <span style={styles.checkboxLabel}>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="cryptusLoginLink"
                    style={styles.link}
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="cryptusLoginBtnPrimary"
                  style={styles.btnPrimary}
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Signing in…" : "Sign in"}
                </button>

                <div className="cryptusLoginDivider" style={styles.divider}>
                  <span style={styles.dividerLine} />
                  <span style={styles.dividerText}>or continue with</span>
                  <span style={styles.dividerLine} />
                </div>

                <div style={styles.socialRow}>
                  <button
                    type="button"
                    className="cryptusLoginSocialBtn"
                    style={styles.socialBtn}
                  >
                    <GoogleIcon /> Google
                  </button>
                  <button
                    type="button"
                    className="cryptusLoginSocialBtn"
                    style={styles.socialBtn}
                  >
                    <GithubIcon /> GitHub
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- style objects (inline) ---------- */

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "100vh",
    width: "100%",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: palette.slate50,
  },
  leftPanel: {
    position: "relative",
    backgroundImage: `linear-gradient(160deg, rgba(11,18,32,0.90) 0%, rgba(16,26,48,0.82) 55%, rgba(11,18,32,0.92) 100%), url("https://images.unsplash.com/photo-1758448500688-3ababa93fd67?fm=jpg&q=80&w=1600&auto=format&fit=crop")`,
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
  },
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
  eyeBtn: {
    background: "transparent",
    border: "none",
    padding: "4px",
    display: "flex",
    color: palette.slate400,
    cursor: "pointer",
    flexShrink: 0,
  },
  errorMsg: { fontSize: "12px", color: "#DC2626" },
  rowBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    borderRadius: "5px",
    border: `1.5px solid ${palette.slate200}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: palette.white,
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
    flexShrink: 0,
  },
  checkboxLabel: { fontSize: "13px", color: palette.slate500 },
  link: {
    fontSize: "13px",
    color: palette.blue500,
    textDecoration: "none",
    fontWeight: 500,
  },
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
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "4px 0",
  },
  dividerLine: { flex: 1, height: "1px", background: palette.slate200 },
  dividerText: {
    fontSize: "12px",
    color: palette.slate500,
    whiteSpace: "nowrap",
  },
  socialRow: { display: "flex", gap: "12px" },
  socialBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 0",
    borderRadius: "10px",
    border: `1px solid ${palette.slate200}`,
    background: palette.white,
    color: palette.slate900,
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: palette.slate500,
    marginTop: "24px",
  },
  successBox: { textAlign: "center", padding: "20px 0" },
  successIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.1)",
    color: palette.blue500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
};

/* ---------- CSS block: only what inline style can't do ---------- */

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

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

  .cryptusLoginEyeBtn:hover { color: ${palette.slate900}; }

  .cryptusLoginBtnPrimary:hover:not(:disabled) { background: ${palette.blue400}; }
  .cryptusLoginBtnPrimary:active:not(:disabled) { transform: translateY(1px); }
  .cryptusLoginBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }
  .cryptusLoginBtnPrimary:focus-visible,
  .cryptusLoginSocialBtn:focus-visible,
  .cryptusLoginLink:focus-visible,
  .cryptusLoginEyeBtn:focus-visible {
    outline: 2px solid ${palette.blue500};
    outline-offset: 2px;
  }

  .cryptusLoginSocialBtn:hover { background: ${palette.slate100}; border-color: ${palette.slate200}; }

  .cryptusLoginLink:hover { text-decoration: underline; }

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

  @media (prefers-reduced-motion: reduce) {
    .cryptusLoginCard { animation: none !important; }
  }
`;

import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import createStore from "../../store";
import { toast } from "sonner";

const palette = {
  black: "#000000",
  white: "#FFFFFF",
  bg: "#f7f7f6",
  cardBg: "#FFFFFF",
  border: "#000000",
  borderLight: "#e0e0e0",
  inputBorder: "#cccccc",
  muted: "#555555",
  mutedLight: "#888888",
};

const MailIcon = () => (
  <svg
    width="17"
    height="17"
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
    width="17"
    height="17"
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
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    {off ? (
      <>
        <path d="m2 2 20 20" />
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      </>
    ) : (
      <>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <path d="M20 6 9 17l-5-5" />
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid work email address.");
      setLoading(false);
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
        toast.success("Welcome back to Yashmeen Atelier");
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="cryptusLoginPage" style={styles.page}>
      <style>{css}</style>

      {/* Left Panel: Stark Architectural Monolith */}
      <div className="cryptusLoginLeftPanel" style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div>
            <div style={styles.brandRow}>
              <span style={styles.brandTitle}>YASHMEEN FIT-OUT</span>
              <span style={styles.cityBadge}>DUBAI</span>
            </div>
            <div style={styles.hairlineRule}></div>
            <div style={styles.atelierLabel}>(ADMIN ATELIER · 01)</div>
          </div>

          <div>
            <h1 className="cryptusLoginHeadline" style={styles.headline}>
              From brief to built.
            </h1>
            <p style={styles.subtext}>
              One team shapes the space, makes the details and delivers the finished interior. Atelier control and turnkey engineering in Al Quoz, Dubai.
            </p>
          </div>

          <ul className="cryptusLoginFeatureList" style={styles.featureList}>
            {[
              "Architecture & 3D Spatial Visualisation",
              "In-House Turnkey MEP Engineering",
              "Bespoke Joinery Atelier on Site",
            ].map((item) => (
              <li
                key={item}
                className="cryptusLoginFeatureItem"
                style={styles.featureItem}
              >
                <span style={styles.featureCheck}>
                  <CheckIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="cryptusLoginStat" style={styles.statFooter}>
            <div style={styles.statDivider} />
            <div style={styles.statRow}>
              <span style={styles.statMetric}>35,000 SQ. FT. ATELIER</span>
              <span style={styles.statSub}>AL QUOZ, DUBAI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Crisp White Minimalist Sign In Form */}
      <div className="cryptusLoginRightPanel" style={styles.rightPanel}>
        <div className="cryptusLoginCard" style={styles.card}>
          {status === "success" ? (
            <div style={styles.successBox}>
              <div style={styles.successIcon}>
                <CheckIcon />
              </div>
              <h2 style={styles.cardTitle}>Session Authenticated</h2>
              <p style={styles.cardSubtitle}>
                Redirecting you to Atelier Dashboard…
              </p>
            </div>
          ) : (
            <>
              <div style={styles.formHeader}>
                <div style={styles.formBadge}>(ADMIN CONSOLE)</div>
                <h2 style={styles.cardTitle}>Atelier Sign In</h2>
                <p style={styles.cardSubtitle}>
                  Enter your credentials to access the Yashmeen administration portal.
                </p>
              </div>

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
                    Work Email
                  </label>
                  <div
                    className={`cryptusLoginInputWrap ${
                      errors.email ? "cryptusLoginInputError" : ""
                    }`}
                    style={styles.inputWrap}
                  >
                    <span style={styles.inputIcon}>
                      <MailIcon />
                    </span>
                    <input
                      id="clg-email"
                      type="email"
                      placeholder="admin@gmail.com"
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
                    className={`cryptusLoginInputWrap ${
                      errors.password ? "cryptusLoginInputError" : ""
                    }`}
                    style={styles.inputWrap}
                  >
                    <span style={styles.inputIcon}>
                      <LockIcon />
                    </span>
                    <input
                      id="clg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange("password")}
                      className="cryptusLoginInput"
                      style={styles.input}
                    />
                    <button
                      type="button"
                      className="cryptusLoginEyeBtn"
                      style={styles.eyeBtn}
                      onClick={() => setShowPassword((prev) => !prev)}
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
                  <label style={styles.checkboxRow}>
                    <div
                      style={{
                        ...styles.checkbox,
                        background: remember ? palette.black : "transparent",
                        borderColor: palette.black,
                      }}
                      onClick={() => setRemember((r) => !r)}
                    >
                      {remember && <CheckIcon />}
                    </div>
                    <span style={styles.checkboxLabel}>Remember me</span>
                  </label>

                  <Link to="/forgot-password" style={styles.link}>
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cryptusLoginBtnPrimary"
                  style={styles.btnPrimary}
                >
                  {loading ? "AUTHENTICATING…" : "SIGN IN ↗"}
                </button>

                <div style={styles.backToSiteRow}>
                  <Link to="/" style={styles.backToSiteLink}>
                    ← Return to Yashmeen Website
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    background: palette.bg,
    boxSizing: "border-box",
  },
  leftPanel: {
    position: "relative",
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "clamp(36px, 5vw, 72px)",
    display: "flex",
    alignItems: "center",
    borderRight: "1px solid #000000",
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "clamp(24px, 3.5vw, 42px)",
    maxWidth: "480px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    fontSize: "17px",
    letterSpacing: "0.08em",
    color: "#ffffff",
  },
  cityBadge: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#ffffff",
    background: "transparent",
    border: "1px solid #ffffff",
    padding: "2px 8px",
    borderRadius: "9999px",
  },
  hairlineRule: {
    height: "1px",
    background: "#ffffff",
    opacity: 0.4,
    margin: "12px 0 8px 0",
    width: "100%",
  },
  atelierLabel: {
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#aaaaaa",
  },
  headline: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    fontSize: "clamp(32px, 3.8vw, 46px)",
    lineHeight: 1.1,
    margin: "0 0 14px 0",
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },
  subtext: {
    fontSize: "14.5px",
    lineHeight: 1.6,
    color: "#bbbbbb",
    margin: 0,
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
    fontWeight: 600,
    color: "#ffffff",
  },
  featureCheck: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: 800,
  },
  statFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  statDivider: {
    height: "1px",
    background: "rgba(255, 255, 255, 0.2)",
    width: "100%",
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statMetric: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#ffffff",
  },
  statSub: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#aaaaaa",
  },

  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(24px, 4vw, 48px)",
    background: palette.bg,
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    border: `1px solid ${palette.borderLight}`,
    borderRadius: "10px",
    padding: "clamp(28px, 4vw, 42px)",
    boxSizing: "border-box",
    boxShadow: "0 4px 18px rgba(0, 0, 0, 0.05)",
  },
  formHeader: {
    marginBottom: "24px",
  },
  formBadge: {
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    color: "#000000",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  cardTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    fontSize: "24px",
    color: "#000000",
    letterSpacing: "-0.02em",
    margin: "0 0 6px 0",
  },
  cardSubtitle: {
    fontSize: "13.5px",
    color: palette.muted,
    lineHeight: 1.5,
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#000000",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #cccccc",
    borderRadius: "6px",
    padding: "0 14px",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  inputIcon: {
    color: "#000000",
    display: "flex",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "13.5px",
    color: "#000000",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    minWidth: 0,
  },
  eyeBtn: {
    background: "transparent",
    border: "none",
    padding: "4px",
    display: "flex",
    color: "#666666",
    cursor: "pointer",
    flexShrink: 0,
  },
  errorMsg: {
    fontSize: "11.5px",
    color: "#000000",
    fontWeight: 600,
  },
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
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    border: "1.5px solid #000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    cursor: "pointer",
    transition: "all 0.15s ease",
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: "12.5px",
    color: "#444444",
    fontWeight: 500,
  },
  link: {
    fontSize: "12.5px",
    color: "#000000",
    textDecoration: "underline",
    fontWeight: 600,
  },
  btnPrimary: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    background: "#000000",
    color: "#ffffff",
    border: "1px solid #000000",
    borderRadius: "9999px",
    padding: "12px 0",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
    marginTop: "6px",
  },
  backToSiteRow: {
    textAlign: "center",
    marginTop: "12px",
  },
  backToSiteLink: {
    fontSize: "12px",
    color: "#666666",
    textDecoration: "none",
    fontWeight: 600,
    transition: "color 0.15s ease",
  },
  successBox: {
    textAlign: "center",
    padding: "24px 0",
  },
  successIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#000000",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
};

const css = `
  .cryptusLoginCard {
    animation: cryptusFade 0.3s ease both;
  }
  @keyframes cryptusFade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .cryptusLoginInputWrap:focus-within {
    border-color: #000000 !important;
    box-shadow: 0 0 0 2px #000000 !important;
  }
  .cryptusLoginInputError {
    border-color: #000000 !important;
  }
  .cryptusLoginBtnPrimary:hover:not(:disabled) {
    background: #ffffff !important;
    border-color: #000000 !important;
    color: #000000 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15) !important;
  }
  .cryptusLoginBackToSiteLink:hover {
    color: #000000 !important;
  }
  @media (max-width: 960px) {
    .cryptusLoginPage { grid-template-columns: 1fr !important; }
    .cryptusLoginLeftPanel { padding: 36px 24px !important; }
    .cryptusLoginFeatureList { display: none !important; }
    .cryptusLoginStat { display: none !important; }
  }
`;

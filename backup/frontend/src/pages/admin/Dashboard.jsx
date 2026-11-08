import React, { useEffect, useState } from "react";
import { webDetailsAPI } from "../../services/api";

const palette = {
  obsidian: "#171613",
  obsidianHover: "#2a2824",
  brass: "#b18a4f",
  brassHover: "#8e6b37",
  brassDim: "rgba(177, 138, 79, 0.12)",
  stoneBg: "#f5f3ef",
  white: "#FFFFFF",
  cardBg: "#FFFFFF",
  border: "#e7e4dc",
  inputBorder: "#e2ded4",
  inputBg: "#ffffff",
  ink: "#171613",
  inkSoft: "#30302e",
  muted: "#6b6860",
  mutedLight: "#9c978b",
  red600: "#c62828",
  green600: "#2e7d32",
};

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const emptyDetails = {
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United Arab Emirates",
  },
  email: "",
  mobile: "",
  whatsapp: "",
  socialLinks: [],
};

const URL_RE = /^https?:\/\/.+/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

const normalizeDetails = (data = {}) => ({
  address: { ...emptyDetails.address, ...(data.address || {}) },
  email: data.email || "",
  mobile: data.mobile || "",
  whatsapp: data.whatsapp || "",
  socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
});

let cachedDetails = null;

export default function Dashboard() {
  const [details, setDetails] = useState(cachedDetails ?? emptyDetails);
  const [loading, setLoading] = useState(!cachedDetails);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (cachedDetails) return;

    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await webDetailsAPI.details();
        const data = res?.data;
        if (data) {
          cachedDetails = normalizeDetails(data);
          if (!cancelled) setDetails(cachedDetails);
        }
      } catch (err) {
        if (!cancelled) {
          setBanner({
            type: "error",
            text:
              err?.response?.data?.message || "Could not load website details.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAddressField = (field) => (e) => {
    const value = e.target.value;
    setDetails((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const setField = (field) => (e) => {
    const value = e.target.value;
    setDetails((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setSocialField = (index, field) => (e) => {
    const value = e.target.value;
    setDetails((prev) => {
      const socialLinks = [...prev.socialLinks];
      socialLinks[index] = { ...socialLinks[index], [field]: value };
      return { ...prev, socialLinks };
    });
    setErrors((prev) => ({ ...prev, [`social_${index}_${field}`]: undefined }));
  };

  const addSocialLink = () => {
    setDetails((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }],
    }));
  };

  const removeSocialLink = (index) => {
    setDetails((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const next = {};
    if (details.email && !EMAIL_RE.test(details.email)) {
      next.email = "Enter a valid email address.";
    }
    details.socialLinks.forEach((link, i) => {
      if (!link.platform?.trim()) {
        next[`social_${i}_platform`] = "Platform required.";
      }
      if (!link.url?.trim()) {
        next[`social_${i}_url`] = "URL required.";
      } else if (!URL_RE.test(link.url.trim())) {
        next[`social_${i}_url`] = "Must begin with http:// or https://";
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        address: details.address,
        email: details.email.trim(),
        mobile: details.mobile.trim(),
        whatsapp: details.whatsapp.trim(),
        socialLinks: details.socialLinks.map((s) => ({
          platform: s.platform.trim(),
          url: s.url.trim(),
        })),
      };
      const { data: res } = await webDetailsAPI.update(payload);
      const saved = res?.data || payload;
      cachedDetails = normalizeDetails(saved);
      setDetails(cachedDetails);
      setBanner({
        type: "success",
        text: "Website details updated successfully.",
      });
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Failed to save changes. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.loadingSpinner}></div>
        <span style={styles.loadingText}>LOADING ATELIER DETAILS…</span>
      </div>
    );
  }

  return (
    <div className="wdPage" style={styles.page}>
      <style>{css}</style>

      <div className="wdCard" style={styles.card}>
        {/* Header Section */}
        <div style={styles.cardHeader}>
          <div style={styles.badgeRow}>
            <span style={styles.atelierBadge}>ATELIER DIRECTORY · 01</span>
            <div style={styles.topHairline} />
          </div>
          <h2 style={styles.cardTitle}>Website Identity & Public Profile</h2>
          <p style={styles.cardSubtitle}>
            Configure the official Yashmeen atelier address, client contact lines, and active digital social handles shown on the public site.
          </p>
        </div>

        {banner && (
          <div
            style={{
              ...styles.banner,
              background:
                banner.type === "success"
                  ? "rgba(46, 125, 50, 0.08)"
                  : "rgba(198, 40, 40, 0.08)",
              border: `1px solid ${
                banner.type === "success"
                  ? "rgba(46, 125, 50, 0.3)"
                  : "rgba(198, 40, 40, 0.3)"
              }`,
              color: banner.type === "success" ? palette.green600 : palette.red600,
            }}
          >
            {banner.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Section 01: Physical Address */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>(01)</span>
              <h3 style={styles.sectionTitle}>Physical Location & Atelier</h3>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Street / Building Details</label>
              <input
                style={styles.input}
                className="wdInput"
                value={details.address.street}
                onChange={setAddressField("street")}
                placeholder="Municipality Building 2nd floor, Deira / Al Quoz, Dubai"
              />
            </div>

            <div style={styles.grid2}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City / Emirate</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.city}
                  onChange={setAddressField("city")}
                  placeholder="Dubai"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>State / Region</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.state}
                  onChange={setAddressField("state")}
                  placeholder="Dubai"
                />
              </div>
            </div>

            <div style={styles.grid2}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Postal Code / P.O. Box</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.zipCode}
                  onChange={setAddressField("zipCode")}
                  placeholder="67 Dubai UAE"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Country</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.country}
                  onChange={setAddressField("country")}
                  placeholder="United Arab Emirates"
                />
              </div>
            </div>
          </section>

          {/* Section 02: Contact */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>(02)</span>
              <h3 style={styles.sectionTitle}>Client Inquiries & Direct Lines</h3>
            </div>

            <div style={styles.grid3}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Public Official Email</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  type="email"
                  value={details.email}
                  onChange={setField("email")}
                  placeholder="info@yfbfitoutcontracting.com"
                />
                {errors.email && (
                  <span style={styles.errorMsg}>{errors.email}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone / Mobile</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.mobile}
                  onChange={setField("mobile")}
                  placeholder="+971 54 386 2870"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp Business</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.whatsapp}
                  onChange={setField("whatsapp")}
                  placeholder="+971 54 386 2870"
                />
              </div>
            </div>
          </section>

          {/* Section 03: Social Links */}
          <section style={styles.section}>
            <div style={styles.socialHeaderRow}>
              <div style={styles.sectionHeader}>
                <span style={styles.sectionNum}>(03)</span>
                <h3 style={styles.sectionTitle}>Digital Channels & Socials</h3>
              </div>
              <button
                type="button"
                className="wdAddBtn"
                style={styles.addBtn}
                onClick={addSocialLink}
              >
                <PlusIcon /> ADD CHANNEL
              </button>
            </div>

            {details.socialLinks.length === 0 && (
              <p style={styles.emptyText}>No digital channels linked yet.</p>
            )}

            <div style={styles.socialList}>
              {details.socialLinks.map((link, i) => (
                <div key={i} style={styles.socialRow}>
                  <div style={{ ...styles.inputGroup, flex: "0 0 170px" }}>
                    <label style={styles.label}>Platform</label>
                    <input
                      style={styles.input}
                      className="wdInput"
                      value={link.platform}
                      onChange={setSocialField(i, "platform")}
                      placeholder="instagram / facebook"
                    />
                    {errors[`social_${i}_platform`] && (
                      <span style={styles.errorMsg}>
                        {errors[`social_${i}_platform`]}
                      </span>
                    )}
                  </div>
                  <div style={{ ...styles.inputGroup, flex: 1 }}>
                    <label style={styles.label}>URL</label>
                    <input
                      style={styles.input}
                      className="wdInput"
                      value={link.url}
                      onChange={setSocialField(i, "url")}
                      placeholder="https://instagram.com/yashmeenfuture"
                    />
                    {errors[`social_${i}_url`] && (
                      <span style={styles.errorMsg}>
                        {errors[`social_${i}_url`]}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="wdRemoveBtn"
                    style={styles.removeBtn}
                    onClick={() => removeSocialLink(i)}
                    aria-label="Remove social channel"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Action Row */}
          <div style={styles.actionsRow}>
            <button
              type="submit"
              className="wdBtnPrimary"
              style={styles.btnPrimary}
              disabled={saving}
            >
              {saving ? "UPDATING ATELIER…" : "SAVE CHANGES ↗"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "16px",
  },
  loadingSpinner: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "2px solid #e7e4dc",
    borderTopColor: "#b18a4f",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#b18a4f",
  },
  page: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #e7e4dc",
    borderRadius: "14px",
    padding: "clamp(24px, 3.5vw, 44px)",
    boxSizing: "border-box",
    boxShadow: "0 4px 20px -4px rgba(8, 8, 7, 0.05)",
  },
  cardHeader: {
    marginBottom: "28px",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "10px",
  },
  atelierBadge: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    color: "#b18a4f",
    textTransform: "uppercase",
  },
  topHairline: {
    flex: 1,
    height: "1px",
    background: "#b18a4f",
    opacity: 0.35,
  },
  cardTitle: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "clamp(22px, 2vw, 28px)",
    color: "#171613",
    margin: "0 0 8px 0",
    letterSpacing: "-0.025em",
  },
  cardSubtitle: {
    fontSize: "14px",
    color: "#6b6860",
    lineHeight: 1.55,
    margin: 0,
    maxWidth: "700px",
  },
  banner: {
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "36px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    paddingTop: "24px",
    borderTop: "1px solid #f1f0ee",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionNum: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    color: "#b18a4f",
    letterSpacing: "0.05em",
  },
  sectionTitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    color: "#171613",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    margin: 0,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#171613",
  },
  input: {
    border: "1px solid #e2ded4",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "11px 14px",
    fontSize: "13.5px",
    color: "#171613",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  errorMsg: {
    fontSize: "11.5px",
    color: palette.red600,
    marginTop: "2px",
  },
  emptyText: {
    fontSize: "13px",
    color: "#9c978b",
    margin: 0,
    fontStyle: "italic",
  },
  socialHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "1px solid #b18a4f",
    borderRadius: "9999px",
    padding: "6px 16px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    color: "#b18a4f",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  socialList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  socialRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#9c978b",
    cursor: "pointer",
    padding: "10px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "12px",
    borderTop: "1px solid #f1f0ee",
  },
  btnPrimary: {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    background: "#171613",
    color: "#ffffff",
    border: "1px solid #171613",
    borderRadius: "9999px",
    padding: "12px 32px",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 14px rgba(8, 8, 7, 0.15)",
  },
};

const css = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .wdInput:focus {
    border-color: #b18a4f !important;
    box-shadow: 0 0 0 3px rgba(177, 138, 79, 0.15) !important;
  }
  .wdAddBtn:hover {
    background: #b18a4f !important;
    color: #ffffff !important;
  }
  .wdRemoveBtn:hover {
    color: #c62828 !important;
  }
  .wdBtnPrimary:hover:not(:disabled) {
    background: #b18a4f !important;
    border-color: #b18a4f !important;
    color: #ffffff !important;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(177, 138, 79, 0.25) !important;
  }
  .wdBtnPrimary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 900px) {
    .wdCard [style*="grid-template-columns: 1fr 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 640px) {
    .wdCard [style*="grid-template-columns: 1fr 1fr"] {
      grid-template-columns: 1fr !important;
    }
  }
`;

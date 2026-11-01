import React, { useEffect, useState } from "react";
import { webDetailsAPI } from "../../services/api";

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
  red600: "#DC2626",
  green600: "#16A34A",
};

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
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
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    country: "India",
  },
  email: "",
  mobile: "",
  whatsapp: "",
  socialLinks: [],
};

const URL_RE = /^https?:\/\/.+/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

// Normalise whatever the server returns into the shape the form expects
const normalizeDetails = (data = {}) => ({
  address: { ...emptyDetails.address, ...(data.address || {}) },
  email: data.email || "",
  mobile: data.mobile || "",
  whatsapp: data.whatsapp || "",
  socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
});

// Survives unmounts, so revisiting the page doesn't refetch
let cachedDetails = null;

export default function Dashboard() {
  const [details, setDetails] = useState(cachedDetails ?? emptyDetails);
  const [loading, setLoading] = useState(!cachedDetails);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', text }

  useEffect(() => {
    if (cachedDetails) return; // already have it, no API call

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
        next[`social_${i}_platform`] = "Platform is required.";
      }
      if (!link.url?.trim()) {
        next[`social_${i}_url`] = "URL is required.";
      } else if (!URL_RE.test(link.url.trim())) {
        next[`social_${i}_url`] = "URL must start with http:// or https://";
      }
    });

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setBanner(null);

    try {
      const payload = {
        ...details,
        socialLinks: details.socialLinks.map((l) => ({
          platform: l.platform.trim().toLowerCase(),
          url: l.url.trim(),
        })),
      };

      // Same unwrapping as the load: axios response -> body -> body.data
      const { data: res } = await webDetailsAPI.update(payload);
      const updated = res?.data;

      // If the server didn't return the document, keep what the user typed
      const next =
        updated && typeof updated === "object"
          ? normalizeDetails(updated)
          : payload;

      cachedDetails = next; // keep cache in sync
      setDetails(next);

      setBanner({
        type: "success",
        text: "Website details updated successfully.",
      });
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save details.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <style>{css}</style>
        <div style={styles.card}>
          <p style={styles.cardSubtitle}>Loading website details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wdPage" style={styles.page}>
      <style>{css}</style>

      <div className="wdCard" style={styles.card}>
        <h2 style={styles.cardTitle}>Website Details</h2>
        <p style={styles.cardSubtitle}>
          Manage your public contact information, address and social links.
        </p>

        {banner && (
          <div
            style={{
              ...styles.banner,
              background:
                banner.type === "success"
                  ? "rgba(22,163,74,0.08)"
                  : "rgba(220,38,38,0.08)",
              border: `1px solid ${banner.type === "success" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
              color:
                banner.type === "success" ? palette.green600 : palette.red600,
            }}
          >
            {banner.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          {/* Address */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Address</h3>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Street</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.street}
                  onChange={setAddressField("street")}
                  placeholder="123 Main St"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.city}
                  onChange={setAddressField("city")}
                  placeholder="Mumbai"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>State</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.state}
                  onChange={setAddressField("state")}
                  placeholder="Maharashtra"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Zip Code</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.zipCode}
                  onChange={setAddressField("zipCode")}
                  placeholder="400001"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Country</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.address.country}
                  onChange={setAddressField("country")}
                  placeholder="India"
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Contact</h3>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  type="email"
                  value={details.email}
                  onChange={setField("email")}
                  placeholder="contact@company.com"
                />
                {errors.email && (
                  <span style={styles.errorMsg}>{errors.email}</span>
                )}
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Mobile</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.mobile}
                  onChange={setField("mobile")}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp</label>
                <input
                  style={styles.input}
                  className="wdInput"
                  value={details.whatsapp}
                  onChange={setField("whatsapp")}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section style={styles.section}>
            <div style={styles.socialHeaderRow}>
              <h3 style={styles.sectionTitle}>Social Links</h3>
              <button
                type="button"
                className="wdAddBtn"
                style={styles.addBtn}
                onClick={addSocialLink}
              >
                <PlusIcon /> Add link
              </button>
            </div>

            {details.socialLinks.length === 0 && (
              <p style={styles.emptyText}>No social links added yet.</p>
            )}

            <div style={styles.socialList}>
              {details.socialLinks.map((link, i) => (
                <div key={i} style={styles.socialRow}>
                  <div style={{ ...styles.inputGroup, flex: "0 0 160px" }}>
                    <label style={styles.label}>Platform</label>
                    <input
                      style={styles.input}
                      className="wdInput"
                      value={link.platform}
                      onChange={setSocialField(i, "platform")}
                      placeholder="instagram"
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
                      placeholder="https://instagram.com/yourbrand"
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
                    aria-label="Remove social link"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div style={styles.actionsRow}>
            <button
              type="submit"
              className="wdBtnPrimary"
              style={styles.btnPrimary}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: palette.slate50,
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    background: palette.white,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "16px",
    padding: "clamp(24px, 4vw, 40px)",
    boxSizing: "border-box",
    height: "fit-content",
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
    margin: "0 0 20px 0",
  },
  banner: {
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "20px",
  },
  form: { display: "flex", flexDirection: "column", gap: "28px" },
  section: { display: "flex", flexDirection: "column", gap: "14px" },
  sectionTitle: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontSize: "15px",
    fontWeight: 600,
    color: palette.slate900,
    margin: 0,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 500, color: palette.slate900 },
  input: {
    border: `1px solid ${palette.slate200}`,
    background: palette.slate100,
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    color: palette.slate900,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  errorMsg: { fontSize: "12px", color: palette.red600 },
  emptyText: { fontSize: "13px", color: palette.slate500, margin: 0 },
  socialHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: `1px solid ${palette.slate200}`,
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: 500,
    color: palette.blue500,
    cursor: "pointer",
  },
  socialList: { display: "flex", flexDirection: "column", gap: "12px" },
  socialRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: palette.slate400,
    cursor: "pointer",
    padding: "10px",
    flexShrink: 0,
  },
  actionsRow: { display: "flex", justifyContent: "flex-end" },
  btnPrimary: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    background: palette.blue500,
    color: palette.white,
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  .wdInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .wdAddBtn:hover { background: ${palette.slate100}; }
  .wdRemoveBtn:hover { color: ${palette.red600}; }
  .wdBtnPrimary:hover:not(:disabled) { background: ${palette.blue400}; }
  .wdBtnPrimary:disabled { opacity: 0.7; cursor: not-allowed; }

  @media (max-width: 640px) {
    .wdCard [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
  }
`;
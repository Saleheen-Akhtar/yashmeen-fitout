import React, { useEffect, useState } from "react";
import { enquiryAPI } from "../../services/api";

const palette = {
  blue500: "#3B82F6",
  blue400: "#60A5FA",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate900: "#0F172A",
  white: "#FFFFFF",
  red600: "#DC2626",
  red50: "rgba(220,38,38,0.08)",
  green600: "#16A34A",
  green50: "rgba(22,163,74,0.08)",
};

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EnquiryManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banner, setBanner] = useState(null); // { type, text }

  // details modal
  const [selected, setSelected] = useState(null);

  // delete-old confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEnquiries = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await enquiryAPI.getAll();
      const list = res?.data ?? [];
      // newest first
      setEnquiries(
        [...list].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        ),
      );
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load enquiries.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDeleteOld = async () => {
    setDeleting(true);
    try {
      const { data: res } = await enquiryAPI.deleteOld();
      const count = res?.deletedCount ?? 0;
      await fetchEnquiries({ silent: true });
      setBanner({
        type: "success",
        text:
          count > 0
            ? `Deleted ${count} enquir${count === 1 ? "y" : "ies"} older than one month.`
            : "No enquiries older than one month were found.",
      });
      setConfirmOpen(false);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete old enquiries.",
      });
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = enquiries.filter(
    (e) =>
      !q ||
      e.name?.toLowerCase().includes(q) ||
      e.mobile?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.services?.toLowerCase().includes(q),
  );

  return (
    <div className="enqPage" style={styles.page}>
      <style>{css}</style>

      <div className="enqContainer" style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.title}>Enquiries</h2>
            <p style={styles.subtitle}>
              View enquiries received from the website.
            </p>
          </div>
          <button
            type="button"
            className="enqBtnDanger"
            style={styles.btnDanger}
            onClick={() => setConfirmOpen(true)}
          >
            <TrashIcon /> Delete old enquiries
          </button>
        </div>

        {banner && (
          <div
            style={{
              ...styles.banner,
              background:
                banner.type === "success" ? palette.green50 : palette.red50,
              border: `1px solid ${banner.type === "success" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
              color:
                banner.type === "success" ? palette.green600 : palette.red600,
            }}
          >
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              style={styles.bannerClose}
              aria-label="Dismiss"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by name, mobile, email or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            className="enqInput"
          />
        </div>

        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>Loading enquiries…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              {enquiries.length === 0
                ? "No enquiries yet."
                : "No enquiries match your search."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Mobile</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Service</th>
                    <th style={styles.th}>Received</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item._id} className="enqRow">
                      <td style={{ ...styles.td, fontWeight: 500 }}>{item.name}</td>
                      <td style={styles.td}>{item.mobile}</td>
                      <td style={styles.td}>{item.email}</td>
                      <td style={styles.td}>{item.services}</td>
                      <td style={{ ...styles.td, whiteSpace: "nowrap" }}>
                        {formatDate(item.createdAt)}
                      </td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actionsRow}>
                          <button
                            type="button"
                            className="enqIconBtn"
                            style={styles.iconBtn}
                            onClick={() => setSelected(item)}
                            aria-label={`View enquiry from ${item.name}`}
                            title="View details"
                          >
                            <EyeIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details modal */}
      {selected && (
        <div className="enqModalOverlay" style={styles.overlay} onClick={() => setSelected(null)}>
          <div
            className="enqModal"
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Enquiry details</h3>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <div style={styles.detailList}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Name</span>
                <span style={styles.detailValue}>{selected.name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Mobile</span>
                <a href={`tel:${selected.mobile}`} style={styles.detailLink}>
                  {selected.mobile}
                </a>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Email</span>
                <a href={`mailto:${selected.email}`} style={styles.detailLink}>
                  {selected.email}
                </a>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Service</span>
                <span style={styles.detailValue}>{selected.services}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Message</span>
                <span style={{ ...styles.detailValue, whiteSpace: "pre-wrap" }}>
                  {selected.message?.trim() || "No message provided."}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Received</span>
                <span style={styles.detailValue}>
                  {formatDateTime(selected.createdAt)}
                </span>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete old confirm modal */}
      {confirmOpen && (
        <div
          className="enqModalOverlay"
          style={styles.overlay}
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            className="enqModal"
            style={{ ...styles.modal, maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete old enquiries</h3>
              <button
                type="button"
                style={styles.modalCloseBtn}
                onClick={() => !deleting && setConfirmOpen(false)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <p style={styles.confirmText}>
              This permanently deletes every enquiry received more than one
              month ago. This can't be undone.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="enqBtnDanger"
                style={styles.btnDangerSolid}
                onClick={handleDeleteOld}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    background: "#fff",
    boxSizing: "border-box",
  },
  container: { width: "100%", padding: 15 },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  title: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "24px",
    color: palette.slate900,
    margin: "0 0 4px 0",
  },
  subtitle: { fontSize: "14px", color: palette.slate500, margin: 0 },
  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  bannerClose: {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    opacity: 0.7,
  },
  searchWrap: {
    position: "relative",
    marginBottom: "16px",
    maxWidth: "380px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: palette.slate400,
    display: "flex",
  },
  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${palette.slate200}`,
    background: palette.white,
    borderRadius: "10px",
    padding: "10px 14px 10px 38px",
    fontSize: "14px",
    color: palette.slate900,
    outline: "none",
  },
  tableCard: {
    background: palette.white,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "14px",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: palette.slate500,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    padding: "12px 20px",
    background: palette.slate50,
    borderBottom: `1px solid ${palette.slate200}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
    color: palette.slate900,
    borderBottom: `1px solid ${palette.slate200}`,
    verticalAlign: "middle",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    fontSize: "14px",
    color: palette.slate500,
  },
  actionsRow: { display: "flex", gap: "6px", justifyContent: "flex-end" },
  iconBtn: {
    background: "transparent",
    border: `1px solid ${palette.slate200}`,
    borderRadius: "8px",
    padding: "7px",
    display: "flex",
    color: palette.slate500,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: "480px",
    maxHeight: "92vh",
    overflowY: "auto",
    background: palette.white,
    borderRadius: "16px",
    padding: "24px",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },
  modalTitle: {
    fontFamily: "'Sora', 'Inter', sans-serif",
    fontWeight: 600,
    fontSize: "18px",
    color: palette.slate900,
    margin: 0,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: palette.slate400,
    cursor: "pointer",
    display: "flex",
  },
  detailList: { display: "flex", flexDirection: "column", gap: "14px" },
  detailItem: { display: "flex", flexDirection: "column", gap: "3px" },
  detailLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: palette.slate500,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  detailValue: {
    fontSize: "14px",
    color: palette.slate900,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  detailLink: {
    fontSize: "14px",
    color: palette.blue500,
    textDecoration: "none",
    wordBreak: "break-word",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
  },
  btnSecondary: {
    background: palette.white,
    color: palette.slate900,
    border: `1px solid ${palette.slate200}`,
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
  // outlined danger button used in the page header
  btnDanger: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'Sora', 'Inter', sans-serif",
    background: palette.white,
    color: palette.red600,
    border: "1px solid rgba(220,38,38,0.35)",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  // solid danger button used to confirm in the modal
  btnDangerSolid: {
    background: palette.red600,
    color: palette.white,
    border: "none",
    borderRadius: "10px",
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  confirmText: { fontSize: "14px", color: palette.slate500, lineHeight: 1.5, margin: 0 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

  .enqInput:focus {
    border-color: ${palette.blue500} !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .enqBtnDanger:hover:not(:disabled) { background: #5C6AC4 !important; }
  .enqBtnDanger:disabled { opacity: 0.7; cursor: not-allowed; }
  .enqIconBtn:hover { background: ${palette.slate100} !important; color: ${palette.blue500} !important; border-color: ${palette.blue400} !important; }
  .enqRow:hover { background: ${palette.slate50}; }

  @media (max-width: 560px) {
    .enqContainer table { font-size: 13px; }
  }
`;
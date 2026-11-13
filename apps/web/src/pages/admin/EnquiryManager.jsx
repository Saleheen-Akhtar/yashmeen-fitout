import { useEffect, useState } from "react";
import { enquiryAPI } from "../../services/api";
import { FiEye, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const loadEnquiriesData = async () => {
  const { data: res } = await enquiryAPI.getAll();
  const list = res?.data ?? [];
  return [...list].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
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

  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEnquiries = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const sorted = await loadEnquiriesData();
      setEnquiries(sorted);
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
    let cancelled = false;
    loadEnquiriesData()
      .then((sorted) => {
        if (!cancelled) setEnquiries(sorted);
      })
      .catch((err) => {
        if (!cancelled) {
          setBanner({
            type: "error",
            text: err?.response?.data?.message || "Failed to load enquiries.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Enquiries</h2>
            <p className="adm-subtitle">
              View direct contact enquiries received from the live website.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-danger-outline"
            onClick={() => setConfirmOpen(true)}
          >
            <FiTrash2 size={15} />
            <span>Delete old enquiries</span>
          </button>
        </div>

        {banner && (
          <div className={`adm-banner ${banner.type === "success" ? "is-success" : "is-error"}`}>
            <span>{banner.text}</span>
            <button
              type="button"
              onClick={() => setBanner(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                display: "flex",
                padding: "4px",
              }}
              aria-label="Dismiss"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        <div className="adm-filters">
          <div className="adm-search-wrap">
            <span className="adm-search-icon">
              <FiSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by name, mobile, email or service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading enquiries…</div>
          ) : filtered.length === 0 ? (
            <div className="adm-empty">
              {enquiries.length === 0
                ? "No enquiries yet."
                : "No enquiries match your search."}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Received</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item._id}>
                      <td style={{ fontWeight: 600, minWidth: "150px" }}>{item.name}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{item.mobile || "-"}</td>
                      <td>{item.email || "-"}</td>
                      <td>
                        {item.services ? (
                          <span className="adm-chip">{item.services}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={{ whiteSpace: "nowrap", color: "var(--crex-muted)" }}>
                        {formatDate(item.createdAt)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="adm-icon-btn"
                            onClick={() => setSelected(item)}
                            aria-label={`View enquiry from ${item.name}`}
                            title="View details"
                          >
                            <FiEye size={15} />
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
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div
            className="adm-modal"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 600 }}>
                Enquiry details
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div style={labelStyle}>Name</div>
                <div style={{ fontSize: "14.5px", fontWeight: 600 }}>{selected.name}</div>
              </div>
              <div className="adm-grid-2">
                <div>
                  <div style={labelStyle}>Mobile</div>
                  {selected.mobile ? (
                    <a href={`tel:${selected.mobile}`} className="adm-link">
                      {selected.mobile}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div>
                  <div style={labelStyle}>Email</div>
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} className="adm-link">
                      {selected.email}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Service</div>
                <div>
                  {selected.services ? (
                    <span className="adm-chip">{selected.services}</span>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Message</div>
                <div className="adm-detail-box" style={{ fontSize: "13.5px", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {selected.message?.trim() || "No message provided."}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Received</div>
                <div style={{ fontSize: "13px", color: "var(--crex-muted)" }}>
                  {formatDateTime(selected.createdAt)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                className="adm-btn-secondary"
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
          className="adm-overlay"
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            className="adm-modal"
            style={{ maxWidth: "410px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                Delete old enquiries
              </h3>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => !deleting && setConfirmOpen(false)}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--crex-muted)", lineHeight: 1.55 }}>
              This permanently deletes every enquiry received more than one
              month ago. This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-danger-solid"
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

const labelStyle = {
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--crex-muted)",
  marginBottom: "4px",
};

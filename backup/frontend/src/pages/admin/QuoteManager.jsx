import React, { useEffect, useState } from "react";
import { quoteAPI } from "../../services/api";
import { FiEye, FiSearch, FiTrash2, FiX } from "react-icons/fi";

const PAGE_SIZE = 10;

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

const orDash = (value) => (value && String(value).trim() ? value : "-");

export default function QuoteManager() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [banner, setBanner] = useState(null); // { type, text }

  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchQuotes = async ({ silent = false, targetPage = page } = {}) => {
    if (!silent) setLoading(true);
    try {
      const { data: res } = await quoteAPI.getAll({
        page: targetPage,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      setQuotes(res?.data ?? []);
      setPagination({
        total: res?.pagination?.total ?? 0,
        totalPages: Math.max(res?.pagination?.totalPages ?? 1, 1),
      });
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to load quotations.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleDeleteOld = async () => {
    setDeleting(true);
    try {
      const { data: res } = await quoteAPI.deleteOlderThanMonth();
      const count = res?.deletedCount ?? 0;
      setPage(1);
      await fetchQuotes({ silent: true, targetPage: 1 });
      setBanner({
        type: "success",
        text:
          count > 0
            ? `Deleted ${count} quotation${count === 1 ? "" : "s"} older than one month.`
            : "No quotations older than one month were found.",
      });
      setConfirmOpen(false);
    } catch (err) {
      setBanner({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete old quotations.",
      });
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const from = pagination.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, pagination.total);

  const renderServices = (services, max) => {
    const list = Array.isArray(services) ? services : [];
    if (list.length === 0) return "-";
    const shown = max ? list.slice(0, max) : list;
    const extra = list.length - shown.length;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {shown.map((s) => (
          <span key={s} className="adm-chip">
            {s}
          </span>
        ))}
        {extra > 0 && <span className="adm-chip-neutral">+{extra} more</span>}
      </div>
    );
  };

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Quotations</h2>
            <p className="adm-subtitle">
              Inspect project brief requests and quotation submissions from the live site.
            </p>
          </div>
          <button
            type="button"
            className="adm-btn-danger-outline"
            onClick={() => setConfirmOpen(true)}
          >
            <FiTrash2 size={15} />
            <span>Delete old quotations</span>
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
              placeholder="Search by name, mobile, email or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card">
          {loading ? (
            <div className="adm-empty">Loading quotations…</div>
          ) : quotes.length === 0 ? (
            <div className="adm-empty">
              {debouncedSearch
                ? "No quotations match your search."
                : "No quotations yet."}
            </div>
          ) : (
            <>
              <div className="adm-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Project</th>
                      <th>Services</th>
                      <th>Received</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((item) => (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600, minWidth: "150px" }}>{item.name}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{item.mobile || "-"}</td>
                        <td>{item.email || "-"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{item.projectType || "-"}</td>
                        <td>{renderServices(item.services, 2)}</td>
                        <td style={{ whiteSpace: "nowrap", color: "var(--crex-muted)" }}>
                          {formatDate(item.createdAt)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              className="adm-icon-btn"
                              onClick={() => setSelected(item)}
                              aria-label={`View quotation from ${item.name}`}
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

              <div className="adm-pager">
                <span style={{ fontSize: "12.5px", color: "var(--crex-muted)" }}>
                  Showing {from}-{to} of {pagination.total}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "12.5px" }}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: "12.5px", color: "var(--crex-muted)", fontWeight: 500 }}>
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    className="adm-btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "12.5px" }}
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details modal */}
      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div
            className="adm-modal"
            style={{ maxWidth: "540px" }}
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
                Quotation details
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
                <div style={labelStyle}>Client Name</div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>{selected.name}</div>
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
                <div style={labelStyle}>Project type</div>
                <div style={{ fontSize: "14px", fontWeight: 500 }}>
                  {orDash(selected.projectType)}
                </div>
              </div>

              <div>
                <div style={labelStyle}>Requested Services</div>
                <div>{renderServices(selected.services)}</div>
              </div>

              <div
                className="adm-detail-box"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={labelStyle}>Location</div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{orDash(selected.location)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Budget</div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{orDash(selected.budget)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Timeline</div>
                  <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{orDash(selected.timeline)}</div>
                </div>
              </div>

              <div>
                <div style={labelStyle}>Message / Brief Notes</div>
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
                Delete old quotations
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
              This permanently deletes every quotation received more than one
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

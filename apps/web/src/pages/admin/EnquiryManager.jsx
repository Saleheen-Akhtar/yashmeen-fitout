import { useEffect, useRef, useState } from "react";
import { FiArchive, FiEye, FiSearch, FiX } from "react-icons/fi";
import AdminPager from "../../components/admin/AdminPager";
import { enquiryAPI } from "../../services/api";

const PAGE_SIZE = 10;

const loadEnquiriesData = async ({ targetPage, search }) => {
  const { data: response } = await enquiryAPI.getAll({
    page: targetPage,
    limit: PAGE_SIZE,
    search,
  });

  return {
    enquiries: response?.data ?? [],
    pagination: {
      total: response?.pagination?.total ?? 0,
      totalPages: Math.max(response?.pagination?.totalPages ?? 1, 1),
    },
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [banner, setBanner] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const previousSearchRef = useRef("");

  const fetchEnquiries = async ({ silent = false, targetPage = page } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await loadEnquiriesData({
        targetPage,
        search: debouncedSearch,
      });
      setEnquiries(data.enquiries);
      setPagination(data.pagination);
    } catch (error) {
      setBanner({
        type: "error",
        text: error?.response?.data?.message || "Failed to load enquiries.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === previousSearchRef.current) return undefined;
    const timer = setTimeout(() => {
      previousSearchRef.current = trimmed;
      setLoading(true);
      setDebouncedSearch(trimmed);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    loadEnquiriesData({ targetPage: page, search: debouncedSearch })
      .then((data) => {
        if (cancelled) return;
        setEnquiries(data.enquiries);
        setPagination(data.pagination);
      })
      .catch((error) => {
        if (cancelled) return;
        setBanner({
          type: "error",
          text: error?.response?.data?.message || "Failed to load enquiries.",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  const handleArchiveOld = async () => {
    setArchiving(true);
    try {
      const { data: response } = await enquiryAPI.deleteOld();
      const count = response?.archivedCount ?? 0;
      setPage(1);
      await fetchEnquiries({ silent: true, targetPage: 1 });
      setBanner({
        type: "success",
        text:
          count > 0
            ? `Archived ${count} enquir${count === 1 ? "y" : "ies"} older than one month.`
            : "No enquiries older than one month were found.",
      });
      setConfirmOpen(false);
    } catch (error) {
      setBanner({
        type: "error",
        text: error?.response?.data?.message || "Failed to archive old enquiries.",
      });
      setConfirmOpen(false);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-container crex-animate-in">
        <div className="adm-header">
          <div>
            <h2 className="adm-title">Enquiries</h2>
            <p className="adm-subtitle">
              Review direct contact enquiries received from the live website.
            </p>
            <span className="adm-header-meta">{pagination.total} active enquiries</span>
          </div>
          <button
            type="button"
            className="adm-btn-secondary"
            onClick={() => setConfirmOpen(true)}
          >
            <FiArchive size={15} />
            <span>Archive old</span>
          </button>
        </div>

        {banner && (
          <div className={`adm-banner ${banner.type === "success" ? "is-success" : "is-error"}`}>
            <span>{banner.text}</span>
            <button
              type="button"
              className="adm-banner-dismiss"
              onClick={() => setBanner(null)}
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
              type="search"
              placeholder="Search by name, mobile, email or service"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="adm-search-input"
            />
          </div>
        </div>

        <div className="adm-card adm-card-flat">
          {loading ? (
            <div className="adm-empty">Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div className="adm-empty">
              {debouncedSearch ? "No enquiries match your search." : "No enquiries yet."}
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
                      <th>Service</th>
                      <th>Received</th>
                      <th className="adm-align-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((item) => (
                      <tr key={item._id}>
                        <td className="adm-cell-primary">{item.name}</td>
                        <td className="adm-nowrap">{item.mobile || "-"}</td>
                        <td>{item.email || "-"}</td>
                        <td>{item.services ? <span className="adm-chip">{item.services}</span> : "-"}</td>
                        <td className="adm-cell-muted adm-nowrap">{formatDate(item.createdAt)}</td>
                        <td className="adm-align-right">
                          <button
                            type="button"
                            className="adm-icon-btn"
                            onClick={() => setSelected(item)}
                            aria-label={`View enquiry from ${item.name}`}
                            title="View details"
                          >
                            <FiEye size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPager
                page={page}
                pageSize={PAGE_SIZE}
                totalItems={pagination.total}
                onPageChange={(nextPage) => {
                  setLoading(true);
                  setPage(nextPage);
                }}
                noun="enquiries"
              />
            </>
          )}
        </div>
      </div>

      {selected && (
        <div className="adm-overlay" onClick={() => setSelected(null)}>
          <div className="adm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="adm-modal-head">
              <div>
                <span className="workspace-kicker">Contact request</span>
                <h3>Enquiry details</h3>
              </div>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="adm-detail-stack">
              <div>
                <div className="adm-detail-label">Name</div>
                <strong>{selected.name}</strong>
              </div>
              <div className="adm-grid-2">
                <div>
                  <div className="adm-detail-label">Mobile</div>
                  {selected.mobile ? <a href={`tel:${selected.mobile}`} className="adm-link">{selected.mobile}</a> : "-"}
                </div>
                <div>
                  <div className="adm-detail-label">Email</div>
                  {selected.email ? <a href={`mailto:${selected.email}`} className="adm-link">{selected.email}</a> : "-"}
                </div>
              </div>
              <div>
                <div className="adm-detail-label">Service</div>
                {selected.services ? <span className="adm-chip">{selected.services}</span> : "-"}
              </div>
              <div>
                <div className="adm-detail-label">Message</div>
                <div className="adm-detail-box adm-message-box">
                  {selected.message?.trim() || "No message provided."}
                </div>
              </div>
              <div>
                <div className="adm-detail-label">Received</div>
                <span className="adm-cell-muted">{formatDateTime(selected.createdAt)}</span>
              </div>
            </div>

            <div className="adm-modal-actions">
              <button type="button" className="adm-btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="adm-overlay" onClick={() => !archiving && setConfirmOpen(false)}>
          <div className="adm-modal adm-modal-compact" onClick={(event) => event.stopPropagation()}>
            <div className="adm-modal-head">
              <div>
                <span className="workspace-kicker">Register maintenance</span>
                <h3>Archive old enquiries</h3>
              </div>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => !archiving && setConfirmOpen(false)}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <p className="adm-modal-copy">
              Move enquiries older than one month out of the active register. Their records remain stored in the database.
            </p>
            <div className="adm-modal-actions">
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={archiving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adm-btn-primary"
                onClick={handleArchiveOld}
                disabled={archiving}
              >
                {archiving ? "Archiving..." : "Archive enquiries"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

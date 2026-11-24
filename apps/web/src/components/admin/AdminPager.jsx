export default function AdminPager({
  page,
  pageSize,
  totalItems,
  onPageChange,
  noun = "items",
  pageSizeOptions,
  onPageSizeChange,
}) {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const from = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  return (
    <div className="adm-pager">
      <div className="adm-pager-summary-wrap" style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
        <span className="adm-pager-summary">
          {totalItems === 0 ? `No ${noun}` : `${from}-${to} of ${totalItems} ${noun}`}
        </span>
        {onPageSizeChange && totalItems > 0 && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--crex-muted)" }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label={`${noun} per page`}
              style={{
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "6px",
                border: "1px solid var(--crex-line)",
                background: "#ffffff",
                color: "var(--crex-ink)",
                cursor: "pointer",
              }}
            >
              {(pageSizeOptions || [5, 10, 20]).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {totalPages > 1 && (
        <div className="adm-pager-actions" aria-label={`${noun} pagination`}>
          <button
            type="button"
            className="adm-page-button"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            Previous
          </button>
          <span className="adm-page-count">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className="adm-page-button"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

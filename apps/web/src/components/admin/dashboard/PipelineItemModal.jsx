import { FiX, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { STAGES } from './dashboardData';

export default function PipelineItemModal({
  inspectedItem,
  setInspectedItem,
  updateItemStage,
}) {
  return (
    inspectedItem && (
      <div
        onClick={() => setInspectedItem(null)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(8, 8, 7, 0.42)",
          backdropFilter: "blur(5px)",
          zIndex: 1050,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "#ffffff",
            height: "100%",
            padding: "clamp(18px, 3vw, 28px)",
            overflowY: "auto",
            boxShadow: "-12px 0 40px rgba(8,8,7,0.16)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <div className="crm-avatar" style={{ width: "40px", height: "40px" }}>
                {inspectedItem.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>{inspectedItem.title}</h2>
                <span style={{ fontSize: "12px", color: "var(--crex-muted)" }}>
                  {inspectedItem.subtitle} · {inspectedItem.location}
                </span>
              </div>
            </div>
            <button type="button" onClick={() => setInspectedItem(null)} className="crex-icon-circle">
              <FiX size={16} />
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ marginBottom: "8px" }}>Move Pipeline Stage</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {STAGES.map((stg) => {
                const current = inspectedItem.stage === stg.id;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => {
                      updateItemStage(inspectedItem.id, stg.id, inspectedItem.title);
                      setInspectedItem((prev) => ({ ...prev, stage: stg.id }));
                    }}
                    style={{
                      background: current ? "var(--crex-dark)" : "var(--crex-limestone)",
                      color: current ? "#ffffff" : "var(--crex-ink)",
                      border: "1px solid var(--crex-line)",
                      borderRadius: "9999px",
                      padding: "6px 12px",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {stg.name}
                  </button>
                );
              })}
            </div>
          </div>

          {(inspectedItem.budget || inspectedItem.timeline || inspectedItem.location || (inspectedItem.servicesList && inspectedItem.servicesList.length > 0)) && (
            <div
              style={{
                background: "var(--crex-limestone)",
                border: "1px solid var(--crex-line)",
                borderRadius: "16px",
                padding: "14px 16px",
                marginBottom: "16px",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "var(--crex-ink)" }}>
                {inspectedItem.location && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <FiMapPin size={13} color="#8a8a86" />
                    <strong>{inspectedItem.location}</strong>
                  </span>
                )}
                {inspectedItem.budget && (
                  <span>Budget: <strong>{inspectedItem.budget}</strong></span>
                )}
                {inspectedItem.timeline && (
                  <span>Timeline: <strong>{inspectedItem.timeline}</strong></span>
                )}
              </div>
              {inspectedItem.servicesList && inspectedItem.servicesList.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {inspectedItem.servicesList.map((srv, idx) => (
                    <span
                      key={idx}
                      className="badge-brass"
                      style={{ padding: "2px 9px", borderRadius: "9999px", fontSize: "11px", fontWeight: 600 }}
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {(inspectedItem.email || inspectedItem.mobile) && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid var(--crex-line)",
                borderRadius: "16px",
                padding: "16px",
                marginBottom: "18px",
                display: "grid",
                gap: "8px",
              }}
            >
              {inspectedItem.email && (
                <a href={`mailto:${inspectedItem.email}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--crex-ink)", fontSize: "13px", textDecoration: "none" }}>
                  <FiMail size={14} color="#8a8a86" />
                  <span>{inspectedItem.email}</span>
                </a>
              )}
              {inspectedItem.mobile && (
                <a href={`tel:${inspectedItem.mobile}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--crex-ink)", fontSize: "13px", textDecoration: "none" }}>
                  <FiPhone size={14} color="#8a8a86" />
                  <span>{inspectedItem.mobile}</span>
                </a>
              )}
            </div>
          )}

          {inspectedItem.message && (
            <div>
              <label style={{ marginBottom: "6px" }}>Project Brief & Notes</label>
              <div
                style={{
                  background: "var(--crex-limestone)",
                  border: "1px solid var(--crex-line)",
                  borderRadius: "16px",
                  padding: "14px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "var(--crex-muted)",
                }}
              >
                {inspectedItem.message}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
}

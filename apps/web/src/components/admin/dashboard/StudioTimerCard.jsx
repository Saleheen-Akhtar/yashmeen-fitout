import { FiArrowUpRight, FiPlay, FiPause, FiClock } from "react-icons/fi";

export default function StudioTimerCard({
  dialTicks,
  progressFraction,
  formattedTimer,
  setTimerRunning,
  timerRunning,
  setTimerSeconds,
}) {
  return (
    <div
      className="crex-card"
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "290px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--crex-ink)" }}>
          Site tracker
        </div>
        <button
          type="button"
          onClick={() => window.open("/", "_blank")}
          className="crex-icon-circle"
          title="Open Public Website"
        >
          <FiArrowUpRight size={15} />
        </button>
      </div>

      {/* Radial Tick Gauge with Champagne Brass Progress Arc */}
      <div
        style={{
          position: "relative",
          width: "152px",
          height: "152px",
          margin: "6px auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg viewBox="0 0 160 160" style={{ width: "100%", height: "100%", transform: "rotate(-110deg)" }}>
          {/* Radial Ticks */}
          {dialTicks.map((t) => {
            const angle = (t / dialTicks.length) * 360;
            return (
              <line
                key={t}
                x1="80"
                y1="10"
                x2="80"
                y2="19"
                stroke="rgba(8,8,7,0.18)"
                strokeWidth="1.6"
                strokeLinecap="round"
                transform={`rotate(${angle} 80 80)`}
              />
            );
          })}
          {/* Champagne Brass Progress Overlay Arc */}
          <circle
            cx="80"
            cy="80"
            r="64"
            fill="none"
            stroke="#c5a059"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${progressFraction * 402} 402`}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              color: "var(--crex-ink)",
              lineHeight: 1.05,
            }}
          >
            {formattedTimer}
          </div>
          <div style={{ fontSize: "11px", color: "var(--crex-muted)", marginTop: "2px" }}>
            Atelier Time
          </div>
        </div>
      </div>

      {/* Timer Controls Bottom Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setTimerRunning(true)}
            className="crex-icon-circle"
            style={{
              background: timerRunning ? "var(--crex-dark)" : "#ffffff",
              color: timerRunning ? "#ffffff" : "var(--crex-ink)",
            }}
            title="Start site work timer"
          >
            <FiPlay size={13} />
          </button>
          <button
            type="button"
            onClick={() => setTimerRunning(false)}
            className="crex-icon-circle"
            title="Pause timer"
          >
            <FiPause size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setTimerSeconds(155)}
          className="crex-icon-circle is-dark"
          title="Reset studio session clock"
        >
          <FiClock size={14} />
        </button>
      </div>
    </div>
  );
}

import { FiCalendar, FiX } from "react-icons/fi";

export default function CalendarCard({
  setMonthOffset,
  monthNames,
  setCalendarModalOpen,
  weekColumns,
  calendarEvents,
  handleDeleteCalendarEvent,
}) {
  return (
    <div
      className="crex-card crex-calendar-span"
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Calendar Header Strip (Prev Month | Active Month Year | Next Month + Schedule Pill) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setMonthOffset((m) => m - 1)}
          className="crex-btn-ghost"
          style={{ fontSize: "11.5px", padding: "5px 12px" }}
        >
          {monthNames.prev}
        </button>

        <div style={{ fontSize: "15.5px", fontWeight: 500, color: "var(--crex-ink)" }}>
          {monthNames.curr}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m + 1)}
            className="crex-btn-ghost"
            style={{ fontSize: "11.5px", padding: "5px 12px" }}
          >
            {monthNames.next}
          </button>
          <button
            type="button"
            onClick={() => setCalendarModalOpen(true)}
            className="crex-btn-dark"
            style={{ fontSize: "11px", padding: "5px 12px" }}
            title="Add site visit or consultation"
          >
            <FiCalendar size={12} />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* 6-Day Column Grid with Time Axis (Desktop & Tablet) */}
      <div className="crex-calendar-desktop" style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "520px" }}>
          {/* Day Names Header */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ width: "68px", flexShrink: 0 }} />
            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                textAlign: "center",
              }}
            >
              {weekColumns.map((col, idx) => {
                const isWed = idx === 2;
                return (
                  <div key={col.name} style={{ paddingBottom: "4px" }}>
                    <div
                      style={{
                        fontSize: "11.5px",
                        color: isWed ? "var(--crex-ink)" : "var(--crex-muted-soft)",
                        fontWeight: isWed ? 700 : 500,
                      }}
                    >
                      {col.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: isWed ? 700 : 500,
                        color: isWed ? "var(--crex-ink)" : "var(--crex-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {col.num}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Matrix Rows */}
          <div style={{ position: "relative" }}>
            {["9:00 am", "10:00 am", "11:00 am"].map((timeSlot) => {
              const rowEvents = calendarEvents.filter((ev) => ev.timeSlot === timeSlot);
              return (
                <div
                  key={timeSlot}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: "54px",
                  }}
                >
                  <span style={{ width: "68px", flexShrink: 0, fontSize: "11px", color: "var(--crex-muted-soft)", fontWeight: 500 }}>
                    {timeSlot}
                  </span>

                  <div
                    style={{
                      flex: 1,
                      display: "grid",
                      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                      minHeight: "54px",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {/* Grid Cells */}
                    {weekColumns.map((_, dayIdx) => (
                      <div
                        key={dayIdx}
                        style={{
                          borderLeft: "1px dashed var(--crex-line)",
                          height: "100%",
                          minHeight: "54px",
                        }}
                      />
                    ))}

                    {/* Render Floating Event Pills aligned accurately to 1/6 day columns */}
                    {rowEvents.map((ev) => {
                      const colIdx = Math.min(Math.max(Number(ev.dayIndex) || 0, 0), 5);
                      const rawLeft = (colIdx / 6) * 100;
                      const widthPct = colIdx >= 4 ? 33.33 : 36;
                      const leftPct = Math.min(rawLeft, 100 - widthPct);
                      const isDark = ev.variant !== "light";
                      return (
                        <div
                          key={ev.id}
                          style={{
                            position: "absolute",
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            zIndex: 3,
                            background: isDark ? "var(--crex-dark)" : "#ffffff",
                            color: isDark ? "#ffffff" : "var(--crex-ink)",
                            border: isDark ? "none" : "1px solid var(--crex-line-strong)",
                            borderRadius: "14px",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            boxSizing: "border-box",
                            boxShadow: isDark
                              ? "0 8px 20px rgba(8,8,7,0.18)"
                              : "0 4px 12px rgba(8,8,7,0.05)",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {ev.title}
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: isDark ? "#b8b6af" : "var(--crex-muted)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {ev.subtitle}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                            {/* Micro Team Avatar Monograms */}
                            <div style={{ display: "flex", marginRight: "4px" }}>
                              <span
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  background: "var(--crex-brass)",
                                  color: "var(--crex-ink)",
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: isDark ? "1.5px solid #080807" : "1.5px solid #ffffff",
                                }}
                              >
                                YA
                              </span>
                              <span
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  background: "#eae7df",
                                  color: "var(--crex-ink)",
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginLeft: "-6px",
                                  border: isDark ? "1.5px solid #080807" : "1.5px solid #ffffff",
                                }}
                              >
                                PM
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCalendarEvent(ev.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: isDark ? "#b8b6af" : "var(--crex-muted)",
                                cursor: "pointer",
                                padding: "2px",
                              }}
                              title="Remove event"
                            >
                              <FiX size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Stacked Agenda View (< 640px) */}
      <div className="crex-agenda-mobile">
        {calendarEvents.map((ev) => {
          const colIdx = Math.min(Math.max(Number(ev.dayIndex) || 0, 0), 5);
          const dayInfo = weekColumns[colIdx] || weekColumns[0];
          const isDark = ev.variant !== "light";
          return (
            <div
              key={ev.id}
              style={{
                background: isDark ? "var(--crex-dark)" : "#ffffff",
                color: isDark ? "#ffffff" : "var(--crex-ink)",
                border: isDark ? "none" : "1px solid var(--crex-line-strong)",
                borderRadius: "14px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: isDark ? "var(--crex-brass)" : "var(--crex-brass-deep)",
                    marginBottom: "2px",
                  }}
                >
                  {dayInfo.name} {dayInfo.num} · {ev.timeSlot}
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{ev.title}</div>
                {ev.subtitle && (
                  <div style={{ fontSize: "11px", color: isDark ? "#b8b6af" : "var(--crex-muted)", marginTop: "2px" }}>
                    {ev.subtitle}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCalendarEvent(ev.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: isDark ? "#b8b6af" : "var(--crex-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  flexShrink: 0,
                }}
                title="Remove event"
              >
                <FiX size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

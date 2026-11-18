export default function CalendarEventModal({
  calendarModalOpen,
  setCalendarModalOpen,
  handleAddCalendarEvent,
  calendarForm,
  setCalendarForm,
  weekColumns,
}) {
  return (
    calendarModalOpen && (
      <div
        onClick={() => setCalendarModalOpen(false)}
        className="adm-overlay"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="crex-card crex-animate-in crex-modal-box"
          style={{ background: "#ffffff", width: "100%", maxWidth: "420px", padding: "24px" }}
        >
          <h3 style={{ margin: "0 0 14px 0", fontSize: "17px", fontWeight: 600 }}>
            Schedule Site Visit / Sync
          </h3>
          <form onSubmit={handleAddCalendarEvent} style={{ display: "grid", gap: "12px" }}>
            <div>
              <label>Event Title</label>
              <input
                required
                type="text"
                placeholder="e.g. Site Survey · Business Bay"
                value={calendarForm.title}
                onChange={(e) => setCalendarForm((p) => ({ ...p, title: e.target.value }))}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div>
              <label>Notes / Attendees</label>
              <input
                type="text"
                placeholder="MEP inspection & client walkthrough"
                value={calendarForm.subtitle}
                onChange={(e) => setCalendarForm((p) => ({ ...p, subtitle: e.target.value }))}
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>
            <div className="crm-form-grid-2">
              <div>
                <label>Day</label>
                <select
                  value={calendarForm.dayIndex}
                  onChange={(e) =>
                    setCalendarForm((p) => ({ ...p, dayIndex: Number(e.target.value) }))
                  }
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  {weekColumns.map((w, idx) => (
                    <option key={w.name} value={idx}>
                      {w.name} {w.num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Time Slot</label>
                <select
                  value={calendarForm.timeSlot}
                  onChange={(e) => setCalendarForm((p) => ({ ...p, timeSlot: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  <option value="9:00 am">9:00 am</option>
                  <option value="10:00 am">10:00 am</option>
                  <option value="11:00 am">11:00 am</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <button type="submit" className="crex-btn-dark" style={{ flex: 1, justifyContent: "center" }}>
                Add to Schedule
              </button>
              <button type="button" onClick={() => setCalendarModalOpen(false)} className="crex-btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

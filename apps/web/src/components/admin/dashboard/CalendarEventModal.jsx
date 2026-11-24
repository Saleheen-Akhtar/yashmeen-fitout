export default function CalendarEventModal({
  calendarModalOpen,
  setCalendarModalOpen,
  handleAddCalendarEvent,
  calendarForm,
  setCalendarForm,
  weekColumns,
  allCRMItems = [],
  projects = [],
}) {
  const availableLinks = [
    ...allCRMItems.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: c.subtitle,
      mobile: c.mobile,
      location: c.location,
      typeBadge: c.typeBadge,
    })),
    ...projects
      .filter((p) => !allCRMItems.some((c) => c.rawId === p._id))
      .map((p) => ({
        id: `proj_${p._id}`,
        title: p.title,
        subtitle: p.sector || "Architectural Project",
        mobile: "",
        location: p.location || "Dubai",
        typeBadge: "Project",
      })),
  ];

  return (
    calendarModalOpen && (
      <div
        onClick={() => setCalendarModalOpen(false)}
        className="adm-overlay"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="crex-card crex-animate-in crex-modal-box"
          style={{ background: "#ffffff", width: "100%", maxWidth: "460px", padding: "24px" }}
        >
          <h3 style={{ margin: "0 0 14px 0", fontSize: "17px", fontWeight: 600 }}>
            Schedule site visit
          </h3>
          <form onSubmit={handleAddCalendarEvent} style={{ display: "grid", gap: "12px" }}>
            {availableLinks.length > 0 && (
              <div>
                <label>Auto-fill from Project or Lead (Optional)</label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const selected = availableLinks.find((item) => item.id === e.target.value);
                    if (selected) {
                      setCalendarForm((p) => ({
                        ...p,
                        title: `${selected.title} · Site Visit`,
                        subtitle: `${selected.subtitle || "Initial Fit-Out Survey"} · ${selected.location || "Dubai"}`,
                        phone: selected.mobile || p.phone || "",
                        location: selected.location || p.location || "Dubai, UAE",
                      }));
                    }
                  }}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  <option value="">None (Custom Entry)</option>
                  {availableLinks.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.typeBadge ? `[${item.typeBadge}] ` : ""}{item.title} ({item.subtitle})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                <label>Date</label>
                <select
                  value={calendarForm.date}
                  onChange={(e) => {
                    const dayIndex = weekColumns.findIndex(
                      (column) => column.isoDate === e.target.value,
                    );
                    setCalendarForm((p) => ({
                      ...p,
                      date: e.target.value,
                      dayIndex: Math.max(dayIndex, 0),
                    }));
                  }}
                  style={{ width: "100%", marginTop: "4px" }}
                >
                  {weekColumns.map((w) => (
                    <option key={w.isoDate} value={w.isoDate}>
                      {w.name} {w.num} {w.month}
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
                  <option value="12:00 pm">12:00 pm</option>
                  <option value="2:00 pm">2:00 pm</option>
                  <option value="3:00 pm">3:00 pm</option>
                  <option value="4:00 pm">4:00 pm</option>
                </select>
              </div>
            </div>
            <div className="crm-form-grid-2">
              <div>
                <label>Contact Phone (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="+971 50 123 4567"
                  value={calendarForm.phone || ""}
                  onChange={(e) => setCalendarForm((p) => ({ ...p, phone: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>
              <div>
                <label>Site Location</label>
                <input
                  type="text"
                  placeholder="e.g. Business Bay, Dubai"
                  value={calendarForm.location || ""}
                  onChange={(e) => setCalendarForm((p) => ({ ...p, location: e.target.value }))}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <button type="submit" className="crex-btn-dark" style={{ flex: 1, justifyContent: "center" }}>
                Add visit
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

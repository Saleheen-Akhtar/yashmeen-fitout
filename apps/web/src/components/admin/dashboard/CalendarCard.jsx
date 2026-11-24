import {
  PiCalendarBlankLight,
  PiCaretLeftLight,
  PiCaretRightLight,
  PiClockLight,
  PiXLight,
} from "react-icons/pi";
import { FaWhatsapp } from "react-icons/fa";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import {
  getGoogleCalendarUrl,
  downloadIcsFile,
  getSiteVisitWhatsAppUrl,
} from "../../../lib/calendarExport";

const timeValue = (value = "") => {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return 0;
  let hour = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hour += 12;
  return hour * 60 + Number(match[2]);
};

export default function CalendarCard({
  weekOffset,
  setWeekOffset,
  weekLabel,
  openCalendarModal,
  weekColumns,
  calendarEvents,
  handleDeleteCalendarEvent,
}) {
  const dateIndex = new Map(weekColumns.map((column, index) => [column.isoDate, index]));
  const visibleEvents = calendarEvents
    .map((event) => ({
      ...event,
      resolvedDayIndex: event.date
        ? dateIndex.get(event.date)
        : weekOffset === 0
          ? Number(event.dayIndex) || 0
          : undefined,
    }))
    .filter((event) => event.resolvedDayIndex !== undefined)
    .sort(
      (a, b) =>
        a.resolvedDayIndex - b.resolvedDayIndex ||
        timeValue(a.timeSlot) - timeValue(b.timeSlot),
    );

  return (
    <section className="schedule-card crex-calendar-span">
      <header className="schedule-header">
        <div>
          <span className="workspace-kicker">Site schedule</span>
          <h2>{weekLabel}</h2>
        </div>
        <div className="schedule-actions">
          <button
            type="button"
            className="schedule-nav"
            onClick={() => setWeekOffset((value) => value - 1)}
            aria-label="Previous week"
          >
            <PiCaretLeftLight size={17} />
          </button>
          <button
            type="button"
            className="schedule-today"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
          >
            This week
          </button>
          <button
            type="button"
            className="schedule-nav"
            onClick={() => setWeekOffset((value) => value + 1)}
            aria-label="Next week"
          >
            <PiCaretRightLight size={17} />
          </button>
          <button type="button" className="adm-btn-primary" onClick={openCalendarModal}>
            <PiCalendarBlankLight size={17} />
            <span>Add visit</span>
          </button>
        </div>
      </header>

      <div className="schedule-week-strip" aria-label={weekLabel}>
        {weekColumns.map((column, index) => {
          const eventCount = visibleEvents.filter(
            (event) => event.resolvedDayIndex === index,
          ).length;
          return (
            <div key={column.isoDate} className={`schedule-day ${column.isToday ? "is-today" : ""}`}>
              <span>{column.name}</span>
              <strong>{column.num}</strong>
              <small>{eventCount || ""}</small>
            </div>
          );
        })}
      </div>

      <div className="schedule-agenda">
        {visibleEvents.length === 0 ? (
          <div className="schedule-empty">
            <PiCalendarBlankLight size={21} />
            <div>
              <strong>No visits scheduled</strong>
              <span>Add a client meeting, site survey, or handover review.</span>
            </div>
          </div>
        ) : (
          visibleEvents.map((event) => {
            const day = weekColumns[event.resolvedDayIndex] || weekColumns[0];
            return (
              <article key={event.id} className="schedule-event">
                <div className="schedule-date-block">
                  <span>{day?.name}</span>
                  <strong>{day?.num}</strong>
                </div>
                <div className="schedule-event-copy">
                  <h3>{event.title}</h3>
                  <p>{event.subtitle || "Site and client coordination"}</p>
                </div>
                <span className="schedule-time">
                  <PiClockLight size={15} />
                  {event.timeSlot}
                </span>
                <div className="schedule-event-actions">
                  <a
                    href={getSiteVisitWhatsAppUrl(event, day)}
                    target="_blank"
                    rel="noreferrer"
                    className="schedule-tool-btn schedule-tool-whatsapp"
                    title="Send WhatsApp site visit reminder to client"
                    aria-label="Send WhatsApp site visit reminder"
                  >
                    <FaWhatsapp size={14} />
                  </a>
                  <a
                    href={getGoogleCalendarUrl(event, day)}
                    target="_blank"
                    rel="noreferrer"
                    className="schedule-tool-btn"
                    title="Add to Google Calendar"
                    aria-label="Add to Google Calendar"
                  >
                    <FiExternalLink size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadIcsFile(event, day)}
                    className="schedule-tool-btn"
                    title="Download .ics (Apple Calendar / Outlook)"
                    aria-label="Download .ics calendar file"
                  >
                    <FiDownload size={13} />
                  </button>
                  <button
                    type="button"
                    className="schedule-remove"
                    onClick={() => handleDeleteCalendarEvent(event.id)}
                    title="Remove visit"
                    aria-label={`Remove ${event.title}`}
                  >
                    <PiXLight size={15} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

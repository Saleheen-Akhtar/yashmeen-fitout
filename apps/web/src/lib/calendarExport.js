/**
 * Yashmeen Architectural Dashboard - Calendar & WhatsApp Integration Helpers
 * Handles Dubai-timezone calendar exports (Google Calendar, iCal/Outlook .ics)
 * and standardized UAE WhatsApp link generation with pre-formatted editorial messages.
 */

/**
 * Cleans any phone number format (e.g. "+971 50 123 4567", "050-123-4567")
 * to international WhatsApp-compatible format (e.g. "971501234567").
 */
export function cleanWhatsAppPhone(phone) {
  if (!phone) return "";
  let digits = String(phone).replace(/\D/g, "");
  // Normalize UAE numbers starting with 05X
  if (digits.startsWith("05") && digits.length === 10) {
    digits = "971" + digits.slice(1);
  }
  return digits;
}

/**
 * Formats a WhatsApp direct link with an optional pre-filled message.
 */
export function createWhatsAppUrl(phone, message = "") {
  const clean = cleanWhatsAppPhone(phone);
  const textParam = message ? `?text=${encodeURIComponent(message)}` : "";
  return clean ? `https://wa.me/${clean}${textParam}` : `https://wa.me/${textParam}`;
}

/**
 * Parses time strings like "10:00 am", "2:30 pm" into { hours: "10", minutes: "00" } (24-hour format)
 */
function parseTimeSlotTo24H(timeSlot = "10:00 am") {
  const match = String(timeSlot).match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return { startH: "10", startM: "00", endH: "11", endM: "00" };
  let hour = Number(match[1]);
  const min = match[2];
  const isPm = match[3].toLowerCase() === "pm";
  if (isPm && hour < 12) hour += 12;
  if (!isPm && hour === 12) hour = 0;

  const endHour = (hour + 1) % 24;
  return {
    startH: String(hour).padStart(2, "0"),
    startM: min,
    endH: String(endHour).padStart(2, "0"),
    endM: min,
  };
}

/**
 * Generates a direct Google Calendar template URL for a site visit event.
 */
export function getGoogleCalendarUrl(event, day) {
  const dateStr = event.date || day?.isoDate || new Date().toISOString().slice(0, 10);
  const { startH, startM, endH, endM } = parseTimeSlotTo24H(event.timeSlot);
  const compactDate = dateStr.replace(/-/g, "");
  const dates = `${compactDate}T${startH}${startM}00/${compactDate}T${endH}${endM}00`;

  const details = [
    event.subtitle || "Architectural site inspection and contractor coordination.",
    "",
    `Client / Project: ${event.title}`,
    `Scheduled Time: ${event.timeSlot || "10:00 am"} (GST - Dubai)`,
    event.phone ? `Contact: ${event.phone}` : "",
    "",
    "Organized by Yashmeen Future Building & Fit-Out Contracting L.L.C, Dubai.",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.title || "Site Inspection"} · Yashmeen Fit-Out`,
    dates,
    ctz: "Asia/Dubai",
    details,
    location: event.location || "Dubai, UAE",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and triggers download of an .ics calendar file
 * compatible with Apple Calendar (iOS/macOS), Microsoft Outlook, and Google Calendar.
 */
export function downloadIcsFile(event, day) {
  const dateStr = event.date || day?.isoDate || new Date().toISOString().slice(0, 10);
  const { startH, startM, endH, endM } = parseTimeSlotTo24H(event.timeSlot);
  const compactDate = dateStr.replace(/-/g, "");
  const nowStr = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");

  const summary = (event.title || "Site Inspection - Yashmeen Fit-Out").replace(/,/g, "\\,");
  const description = (
    `${event.subtitle || "Site visit and contractor coordination."}\\n\\n` +
    `Scheduled: ${event.timeSlot || "10:00 am"}\\n` +
    (event.phone ? `Contact: ${event.phone}\\n` : "") +
    "Yashmeen Future Building & Fit-Out Contracting L.L.C"
  ).replace(/\r?\n/g, "\\n");

  const location = (event.location || "Dubai, UAE").replace(/,/g, "\\,");

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yashmeen Future Building//Site Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:yashmeen-${event.id || Date.now()}@yashmeen.ae`,
    `DTSTAMP:${nowStr}`,
    `DTSTART;TZID=Asia/Dubai:${compactDate}T${startH}${startM}00`,
    `DTEND;TZID=Asia/Dubai:${compactDate}T${endH}${endM}00`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeFilename = (event.title || "site-visit")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  link.download = `${safeFilename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a pre-composed WhatsApp reminder link for a site visit.
 */
export function getSiteVisitWhatsAppUrl(event, day) {
  const dateLabel = day ? `${day.name} ${day.num} ${day.month || ""}`.trim() : event.date || "scheduled date";
  const time = event.timeSlot || "10:00 am";
  const project = event.title || "Site Inspection";
  const notes = event.subtitle ? ` (${event.subtitle})` : "";

  const text =
    `Hello! This is a confirmation from Yashmeen Future Building & Fit-Out regarding our upcoming site inspection for ${project}${notes}.\n\n` +
    `📅 Date: ${dateLabel}\n` +
    `⏰ Time: ${time} (GST)\n` +
    `📍 Location: ${event.location || "Dubai, UAE"}\n\n` +
    `Please ensure building gate pass or site access is arranged with security. Thank you!`;

  return createWhatsAppUrl(event.phone, text);
}

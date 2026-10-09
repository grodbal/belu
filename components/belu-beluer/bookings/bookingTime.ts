const LIMA_OFFSET = "-05:00";

export function isBookingInFuture(
  date: string,
  time: string,
  now = Date.now()
) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time);

  if (!dateMatch || !timeMatch) return false;

  const [, year, month, day] = dateMatch;
  const [, hour, minute, second = "00"] = timeMatch;
  const calendarDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  if (
    calendarDate.getUTCFullYear() !== Number(year) ||
    calendarDate.getUTCMonth() + 1 !== Number(month) ||
    calendarDate.getUTCDate() !== Number(day) ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59
  ) {
    return false;
  }

  const appointmentTime = Date.parse(
    `${date}T${hour}:${minute}:${second}${LIMA_OFFSET}`
  );

  return Number.isFinite(appointmentTime) && appointmentTime > now;
}

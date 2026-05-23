const DAY_MS = 1000 * 60 * 60 * 24;

export function parseDateOnly(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfLocalDay(date = new Date()) {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

export function endOfLocalDay(date = new Date()) {
  const localDate = new Date(date);
  localDate.setHours(23, 59, 59, 999);
  return localDate;
}

export function daysBetween(start: Date, end: Date) {
  return Math.ceil(
    (startOfLocalDay(end).getTime() - startOfLocalDay(start).getTime()) /
      DAY_MS,
  );
}

export function daysUntil(date: Date, today = new Date()) {
  return Math.ceil((startOfLocalDay(date).getTime() - startOfLocalDay(today).getTime()) / DAY_MS);
}

export function getJourneyTiming(
  journey: { start_date: string; end_date: string },
  today = new Date(),
) {
  const startDate = parseDateOnly(journey.start_date);
  const endDate = parseDateOnly(journey.end_date);
  const currentDay = startOfLocalDay(today);
  const isActive = currentDay >= startDate && currentDay <= endDate;
  const isCompleted = currentDay > endDate;

  return {
    startDate,
    endDate,
    isActive,
    isCompleted,
    daysUntil: daysUntil(startDate, currentDay),
    daysLeft: daysUntil(endDate, currentDay),
    tripDuration: daysBetween(startDate, endDate) + 1,
  };
}

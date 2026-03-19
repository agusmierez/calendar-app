export function createEvent(date, text) {
  return {
    id: crypto.randomUUID(),
    date,
    text
  };
}

export function addEvent(events, newEvent) {
  return [...events, newEvent];
}

export function getEventsByDate(events, date) {
  return events.filter(e => e.date === date);
}
const KEY = "calendar-events";

export function loadEvents() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEvents(events) {
  localStorage.setItem(KEY, JSON.stringify(events));
}
import { createEvent, addEvent, getEventsByDate } from "./core/calendar.js";
import { loadEvents, saveEvents } from "./storage/local.js";

// 🟡 ESTADO
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;

let events = loadEvents();

// 🔵 DOM
const calendarContainer = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");

// 🟢 DATOS
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// 🧠 FUNCIONES

function updateMonthLabel() {
  monthLabel.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
}

function createDayElement(date, dayNumber) {
  const day = document.createElement("div");

  day.classList.add("day");
  day.dataset.date = date;

  const number = document.createElement("div");
  number.textContent = dayNumber;

  const eventsContainer = document.createElement("div");

  const dayEvents = getEventsByDate(events, date);

    dayEvents.forEach(e => {
    const ev = document.createElement("div");
    ev.textContent = e.text;

    let clickTimeout = null;

    // 🗑️ BORRAR
    ev.addEventListener("click", (event) => {
        event.stopPropagation();

        // limpiamos por si acaso
        if (clickTimeout) clearTimeout(clickTimeout);

        clickTimeout = setTimeout(() => {
        const confirmDelete = confirm("¿Borrar este evento?");
        if (!confirmDelete) return;

        events = deleteEvent(events, e.id);
        saveEvents(events);

        updateCalendar();
        }, 250);
    });

    // ✏️ EDITAR
    ev.addEventListener("dblclick", (event) => {
        event.stopPropagation();

        // 🔥 cancelar SIEMPRE el delete
        if (clickTimeout) {
        clearTimeout(clickTimeout);
        clickTimeout = null;
        }

        const newText = prompt("Editar evento:", e.text);

        // 👉 si cancela, simplemente salimos (ya no hay delete pendiente)
        if (!newText) return;

        e.text = newText;

        saveEvents(events);
        updateCalendar();
    });

    eventsContainer.appendChild(ev);
    });

  day.appendChild(number);
  day.appendChild(eventsContainer);

  day.addEventListener("click", () => {
    onDayClick(date);
  });

    const today = new Date();

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (date === todayStr) {
    day.classList.add("today");
    }

  return day;
}

function onDayClick(date) {
  const text = prompt("Escribí un evento:");
  if (!text) return;

  const newEvent = createEvent(date, text);

  events = addEvent(events, newEvent);
  saveEvents(events);

  updateCalendar(); // 🔥 cambio clave
}

function deleteEvent(events, eventId) {
  return events.filter(e => e.id !== eventId);
}

function renderCalendar(year, month) {
  calendarContainer.innerHTML = "";

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    calendarContainer.appendChild(empty);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const dayEl = createDayElement(date, i);

    calendarContainer.appendChild(dayEl);
  }
}

// 🔥 FUNCIÓN CENTRAL
function updateCalendar() {
  renderCalendar(currentYear, currentMonth);
  updateMonthLabel();
}

// 👇 BOTONES
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;

  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }

  updateCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;

  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }

  updateCalendar();
});

// 🚀 INICIO
updateCalendar();
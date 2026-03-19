import { createEvent, addEvent, getEventsByDate } from "./core/calendar.js";
import { loadEvents, saveEvents } from "./storage/local.js";

// 🟡 ESTADO
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;

let events = loadEvents();
let selectedEvent = null;

// 🔵 DOM
const calendarContainer = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");

const modal = document.getElementById("eventModal");
const modalText = document.getElementById("modalText");

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

  // número del día
  const number = document.createElement("div");
  number.textContent = dayNumber;

  const eventsContainer = document.createElement("div");
    eventsContainer.classList.add("events-container");

  const dayEvents = getEventsByDate(events, date);

  dayEvents.forEach(e => {
    const ev = document.createElement("div");
    ev.classList.add("event-item");
    ev.textContent = e.text;

    // 🔥 abrir modal
    ev.addEventListener("click", (event) => {
      event.stopPropagation();

      selectedEvent = e;
      modalText.textContent = e.text;
      modal.classList.remove("hidden");
    });

    eventsContainer.appendChild(ev);
  });

  day.appendChild(number);
  day.appendChild(eventsContainer);

  // click en día → crear evento
  day.addEventListener("click", () => {
    onDayClick(date);
  });

  // 🔥 marcar hoy
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

  updateCalendar();
}

function renderCalendar(year, month) {
  calendarContainer.innerHTML = "";

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  // espacios vacíos
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    calendarContainer.appendChild(empty);
  }

  // días
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

// 🎛️ BOTONES MES
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

// 🪟 MODAL

// cerrar
document.getElementById("closeBtn").addEventListener("click", () => {
  modal.classList.add("hidden");
});

// editar
document.getElementById("editBtn").addEventListener("click", () => {
  const newText = prompt("Editar evento:", selectedEvent.text);
  if (!newText) return;

  selectedEvent.text = newText;

  saveEvents(events);
  updateCalendar();
  modal.classList.add("hidden");
});

// borrar
document.getElementById("deleteBtn").addEventListener("click", () => {
  const confirmDelete = confirm("¿Borrar este evento?");
  if (!confirmDelete) return;

  events = events.filter(e => e.id !== selectedEvent.id);
  saveEvents(events);

  updateCalendar();
  modal.classList.add("hidden");
});

// 🚀 INIT
updateCalendar();
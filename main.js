import { createEvent, addEvent, getEventsByDate } from "./core/calendar.js";
import { loadEvents, saveEvents } from "./storage/local.js";

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;

let events = loadEvents();
let selectedEvent = null;

// DOM
const calendarContainer = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const yearsList = document.getElementById("yearsList");

const modal = document.getElementById("eventModal");
const modalText = document.getElementById("modalText");
const modalInput = document.getElementById("modalInput");

// meses
const monthNames = [
  "Enero","Febrero","Marzo","Abril",
  "Mayo","Junio","Julio","Agosto",
  "Septiembre","Octubre","Noviembre","Diciembre"
];

// UI
function updateMonthLabel() {
  monthLabel.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
}

// crear día
function createDayElement(date, dayNumber) {
  const day = document.createElement("div");
  day.classList.add("day");

  const number = document.createElement("div");
  number.textContent = dayNumber;

  const eventsContainer = document.createElement("div");
  eventsContainer.classList.add("events-container");

  const dayEvents = getEventsByDate(events, date);

  dayEvents.forEach(e => {
    const ev = document.createElement("div");
    ev.classList.add("event-item");

    // texto
    ev.textContent = e.text;

    ev.addEventListener("click", (event) => {
      event.stopPropagation();
      selectedEvent = e;
      modalInput.value = e.text;  
      modal.classList.remove("hidden");
    });

    eventsContainer.appendChild(ev);
  });

  day.appendChild(number);
  day.appendChild(eventsContainer);

  // crear evento
  day.addEventListener("click", () => {
    const text = prompt("Nuevo evento:");
    if (!text) return;

    const newEvent = createEvent(date, text);
    events = addEvent(events, newEvent);
    saveEvents(events);

    updateCalendar();
  });

  // hoy
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  if (date === todayStr) day.classList.add("today");

  return day;
}

// render
function renderCalendar(year, month) {
  calendarContainer.innerHTML = "";

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startDay; i++) {
    calendarContainer.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month).padStart(2,"0")}-${String(i).padStart(2,"0")}`;
    calendarContainer.appendChild(createDayElement(date, i));
  }
}

function updateCalendar() {
  renderCalendar(currentYear, currentMonth);
  updateMonthLabel();
}

// sidebar años
function renderYears() {
  yearsList.innerHTML = "";

  for (let y = 2020; y <= 2035; y++) {
    const yearContainer = document.createElement("div");

    const yearTitle = document.createElement("div");
    yearTitle.textContent = y;
    yearTitle.classList.add("year-item");
    yearTitle.style.cursor = "pointer";
    yearTitle.style.fontWeight = "bold";

    const monthsContainer = document.createElement("div");
    monthsContainer.classList.add("months-container");
    monthsContainer.style.display = "none";
    monthsContainer.style.paddingLeft = "10px";

    // crear meses
    monthNames.forEach((month, index) => {
      const m = document.createElement("div");
      m.textContent = month;
      m.classList.add("month-item");
      m.style.cursor = "pointer";
      m.style.fontSize = "14px";
      

      m.addEventListener("click", () => {
        currentYear = y;
        currentMonth = index + 1;
        updateCalendar();
      });

      monthsContainer.appendChild(m);
    });

    // toggle meses
    yearTitle.addEventListener("click", () => {
      monthsContainer.style.display =
        monthsContainer.style.display === "none" ? "block" : "none";
    });

    yearContainer.appendChild(yearTitle);
    yearContainer.appendChild(monthsContainer);

    yearsList.appendChild(yearContainer);
  }
}

// hamburguesa
const sidebar = document.getElementById("sidebar");
document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

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

// modal
document.getElementById("closeBtn").onclick = () => modal.classList.add("hidden");

saveBtn.addEventListener("click", () => {
  if (!selectedEvent) return;

  const newText = modalInput.value.trim();
  if (!newText) return;

  selectedEvent.text = newText;

  saveEvents(events);
  updateCalendar();

  modal.classList.add("hidden");
});

document.getElementById("deleteBtn").onclick = () => {
  if (!confirm("¿Borrar?")) return;

  events = events.filter(e => e.id !== selectedEvent.id);
  saveEvents(events);
  updateCalendar();
  modal.classList.add("hidden");
};

// init
updateCalendar();
renderYears();
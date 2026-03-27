import { createEvent, addEvent, getEventsByDate } from "./core/calendar.js";
import { loadEvents, saveEvents } from "./storage/local.js";

function darkenColor(hex, percent) {
  let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;

  return "#" + (
    0x1000000 +
    (R < 0 ? 0 : R) * 0x10000 +
    (G < 0 ? 0 : G) * 0x100 +
    (B < 0 ? 0 : B)
  ).toString(16).slice(1);
}

function isDarkColor(hex) {  
  let r = parseInt(hex.substr(1,2),16);  
  let g = parseInt(hex.substr(3,2),16);  
  let b = parseInt(hex.substr(5,2),16);  
  
  let brightness = (r*299 + g*587 + b*114) / 1000;  
  return brightness < 128;  
}

function lightenColor(hex, percent) {
  let num = parseInt(hex.replace("#", ""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = (num >> 8 & 0x00FF) + amt,
      B = (num & 0x0000FF) + amt;

  return "#" + (
    0x1000000 +
    (R > 255 ? 255 : R) * 0x10000 +
    (G > 255 ? 255 : G) * 0x100 +
    (B > 255 ? 255 : B)
  ).toString(16).slice(1);
}

function getHoverColor(hex) {
  if (isDarkColor(hex)) {
    return lightenColor(hex, 30);
  } else {
    return darkenColor(hex, 20);
  }
}

function hexToRgba(hex, alpha) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastColor(hex) {
  let r = parseInt(hex.substr(1,2),16);
  let g = parseInt(hex.substr(3,2),16);
  let b = parseInt(hex.substr(5,2),16);

  let brightness = (r*299 + g*587 + b*114) / 1000;

  return brightness > 150 ? "black" : "white";
}

function applyTheme(color) {
  const darker = getHoverColor(color);
  const light = hexToRgba(color, 0.05);
  const textColor = getContrastColor(color);

  document.documentElement.style.setProperty("--primary", color);
  document.documentElement.style.setProperty("--primary-dark", darker);
  document.documentElement.style.setProperty("--primary-light", light);
  document.documentElement.style.setProperty("--topbar-text", textColor);
}

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
  renderYears();

  const todayBtn = document.getElementById("todayBtn");
  const today = new Date();
  if (currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1) {
    todayBtn.classList.add("active-today");
  } else {
    todayBtn.classList.remove("active-today");
  }

  console.log("updateCalendar corriendo");

  // 🔹 actualizar resumen de eventos al final
  updateEventsSummary();
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

    if (y === currentYear) {
      yearTitle.classList.add("active-year");
    }

    // crear meses
    monthNames.forEach((month, index) => {
      const m = document.createElement("div");
      m.textContent = month;
      m.classList.add("month-item");
      m.style.cursor = "pointer";
      m.style.fontSize = "14px";

      m.classList.remove("active-month"); // 🔥 asegura reset

      if (y === currentYear && index + 1 === currentMonth) {
        m.classList.add("active-month");
      }

      m.addEventListener("click", () => {
        currentYear = y;
        currentMonth = index + 1;

        updateCalendar(); // 🔥 esto re-renderiza todo

      });

      monthsContainer.appendChild(m);
    });

    // toggle meses
    yearTitle.addEventListener("click", () => {
      const isOpen = monthsContainer.style.display === "block";

      // cerrar todos
      document.querySelectorAll(".months-container").forEach(el => {
        el.style.display = "none";
      });

      // sacar selección
      document.querySelectorAll(".year-item").forEach(el => {
        el.classList.remove("active-year");
      });

      // 🔥 SIEMPRE marcar el actual clickeado
      yearTitle.classList.add("active-year");

      // toggle apertura
      if (!isOpen) {
        monthsContainer.style.display = "block";
        yearTitle.classList.add("active-year");
      }
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

const colorPicker = document.getElementById("colorPicker");

if (colorPicker) {
  colorPicker.addEventListener("input", (e) => {
    const color = e.target.value;

    applyTheme(color);

    localStorage.setItem("themeColor", color);
  });
}

document.getElementById("todayBtn").addEventListener("click", () => {
  const today = new Date();

  currentYear = today.getFullYear();
  currentMonth = today.getMonth() + 1;

  updateCalendar(); // 🔥 clave
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

function updateEventsSummary() {
  const list = document.getElementById("events-list");
  if (!list) return; // 🔹 evita romper el programa

  list.innerHTML = "";

  const monthEvents = events.filter(e => {
    const eDate = new Date(e.date);
    return (
      eDate.getFullYear() === currentYear &&
      eDate.getMonth() + 1 === currentMonth
    );
  });

  monthEvents.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date.split("-")[2]}: ${e.text}`;
    list.appendChild(li);
  });
}

// init
updateCalendar();
renderYears();

const savedColor = localStorage.getItem("themeColor");

if (savedColor) {
  applyTheme(savedColor);
}

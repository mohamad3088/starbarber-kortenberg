// ===== Pas hier diensten, prijzen & uren aan =====
// Er is geen publieke prijslijst gevonden, dus staat er "Op aanvraag".
// Zet een prijs als tekst, bv. price: "€20", en hij verschijnt overal.
const SERVICES = [
  { name: "Knippen", desc: "Schaar en tondeuse, klassiek of modern. Afgewerkt en gestyled.", price: "" },
  { name: "Fade / Taper", desc: "Low, mid, high of skin fade, met een strakke overgang.", price: "" },
  { name: "Knippen + baard", desc: "De complete fresh-up van top tot kin.", price: "" },
  { name: "Baard", desc: "Trimmen, contouren en strakke lijnen.", price: "" },
  { name: "Kinderen", desc: "Een nette cut voor de jongste klanten.", price: "" },
];

// 0 = zondag … 6 = zaterdag. [open, sluit] in "HH:MM", of null = gesloten.
const HOURS = {
  1: null, 2: null, 3: ["10:30", "19:00"], 4: ["10:30", "19:00"],
  5: ["10:30", "19:00"], 6: ["10:30", "19:00"], 0: ["10:30", "19:00"],
};
const WHATSAPP = "32485956021";
const SLOT_MIN = 30;   // lengte van een tijdslot
const DAYS_AHEAD = 14; // hoe ver vooruit je kan kiezen

const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const DAY_SHORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
const priceLabel = p => p.price || "Op aanvraag";

// ===== Dienstenlijst =====
document.getElementById("priceList").innerHTML = SERVICES.map(p => `
  <div class="menu__item">
    <h3>${p.name}</h3><span class="menu__dots"></span><span class="menu__price${p.price ? "" : " menu__price--ask"}">${priceLabel(p)}</span>
    <p>${p.desc}</p>
  </div>`).join("");

// ===== Openingsuren + live status (Belgische tijd) =====
function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Brussels", year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    day,
    mins: (+get("hour") % 24) * 60 + +get("minute"),
    date: new Date(+get("year"), +get("month") - 1, +get("day")),
  };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const pad = n => String(n).padStart(2, "0");
const fmt = m => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function renderHours() {
  const { day, mins } = brusselsNow();
  const order = [1, 2, 3, 4, 5, 6, 0];
  document.getElementById("hours").innerHTML = order.map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");

  const today = HOURS[day];
  const isOpen = today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) {
    text = `Nu open · tot ${today[1]}`;
  } else if (today && mins < toMins(today[0])) {
    text = `Gesloten · opent vandaag om ${today[0]}`;
  } else {
    let n = 1;
    while (n < 8 && !HOURS[(day + n) % 7]) n++;
    const next = HOURS[(day + n) % 7];
    text = next ? `Gesloten · opent ${n === 1 ? "morgen" : DAY_NAMES[(day + n) % 7].toLowerCase()} om ${next[0]}` : "Gesloten";
  }
  document.querySelector("[data-status-text]").textContent = text;
  document.querySelector("[data-status-box]").classList.toggle("is-open", !!isOpen);
  const heroStatus = document.querySelector("[data-status]");
  heroStatus.classList.toggle("is-open", !!isOpen);
  heroStatus.textContent = isOpen ? `Nu open · Leuvensesteenweg 264` : `Kortenberg · Leuvensesteenweg 264`;
}
renderHours();
setInterval(renderHours, 60_000);

// ===== Afspraak via WhatsApp =====
const form = document.getElementById("bookForm");
const daysEl = document.getElementById("days");
const slotsEl = document.getElementById("slots");
const summary = document.getElementById("summary");
const err = document.getElementById("bookErr");
const serviceEl = document.getElementById("service");

serviceEl.innerHTML = SERVICES.map((s, i) =>
  `<option value="${s.name}" ${i === 1 ? "selected" : ""}>${s.name}${s.price ? ` — ${s.price}` : ""}</option>`
).join("");

function slotsFor(iso) {
  const { date, mins } = brusselsNow();
  const [y, mo, da] = iso.split("-").map(Number);
  const h = HOURS[new Date(y, mo - 1, da).getDay()];
  if (!h) return [];
  const out = [];
  for (let m = toMins(h[0]); m <= toMins(h[1]) - SLOT_MIN; m += SLOT_MIN) {
    out.push({ m, past: iso === isoOf(date) && m <= mins + 30 });
  }
  return out;
}

function buildDays() {
  const { date } = brusselsNow();
  let html = "", first = null;
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const iso = isoOf(d);
    const slots = slotsFor(iso);
    const disabled = !slots.length || slots.every(s => s.past);
    if (!disabled && !first) first = iso;
    const label = i === 0 ? "vandaag" : i === 1 ? "morgen" : DAY_SHORT[d.getDay()];
    html += `<label><input type="radio" name="day" value="${iso}" ${disabled ? "disabled" : ""}>
      <span><small>${label}</small><b>${d.getDate()}</b><em>${MONTHS[d.getMonth()]}</em></span></label>`;
  }
  daysEl.innerHTML = html;
  if (first) daysEl.querySelector(`input[value="${first}"]`).checked = true;
}

function buildSlots() {
  const day = form.querySelector("input[name=day]:checked");
  if (!day) { slotsEl.innerHTML = `<p class="slots__empty">Kies eerst een dag.</p>`; return; }
  slotsEl.innerHTML = slotsFor(day.value).map(s =>
    `<label><input type="radio" name="time" value="${fmt(s.m)}" ${s.past ? "disabled" : ""}><span>${fmt(s.m)}</span></label>`
  ).join("");
}

function selection() {
  const dayIn = form.querySelector("input[name=day]:checked");
  const timeIn = form.querySelector("input[name=time]:checked");
  let dayLabel = "";
  if (dayIn) {
    const [y, mo, da] = dayIn.value.split("-").map(Number);
    dayLabel = `${DAY_NAMES[new Date(y, mo - 1, da).getDay()].toLowerCase()} ${da} ${MONTHS[mo - 1]}`;
  }
  return {
    service: serviceEl.value, day: dayIn?.value, dayLabel, time: timeIn?.value,
    name: document.getElementById("name").value.trim(),
    note: document.getElementById("note").value.trim(),
  };
}

function updateSummary() {
  const s = selection();
  err.textContent = "";
  if (!s.day || !s.time) { summary.textContent = "Kies een dag en tijdstip."; return; }
  summary.innerHTML = `<strong>${s.service}</strong> · ${s.dayLabel} om <strong>${s.time}</strong>`;
}

buildDays();
buildSlots();
updateSummary();

form.addEventListener("change", e => {
  if (e.target.name === "day") buildSlots();
  updateSummary();
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const s = selection();
  if (!s.day) return (err.textContent = "Kies een dag.");
  if (!s.time) return (err.textContent = "Kies een tijdstip.");
  if (!s.name) { document.getElementById("name").focus(); return (err.textContent = "Vul je naam in."); }

  const msg = [
    `Hallo Starbarber! 💈 Ik wil graag een afspraak maken.`,
    ``,
    `• Naam: ${s.name}`,
    `• Dienst: ${s.service}`,
    `• Wanneer: ${s.dayLabel} om ${s.time}`,
    s.note ? `• Opmerking: ${s.note}` : null,
    ``,
    `Past dat?`,
  ].filter(l => l !== null).join("\n");

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

// ===== Nav =====
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// ===== Reveal on scroll =====
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  io.observe(el);
});

// ===== Tellers =====
const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0);
    const start = performance.now(), dur = 1400;
    const tick = t => {
      const k = Math.min(1, (t - start) / dur), v = end * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toFixed(dec).replace(".", ",");
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll("[data-count]").forEach(el => counterIO.observe(el));

// ===== Lightbox =====
const items = [...document.querySelectorAll(".gallery__item img")];
const lb = document.getElementById("lightbox");
const lbImg = lb.querySelector("img");
let idx = 0;
const show = i => { idx = (i + items.length) % items.length; lbImg.src = items[idx].src; lbImg.alt = items[idx].alt; };
items.forEach((img, i) => img.parentElement.addEventListener("click", () => { show(i); lb.hidden = false; document.body.style.overflow = "hidden"; }));
const close = () => { lb.hidden = true; document.body.style.overflow = ""; };
lb.querySelector(".lightbox__close").addEventListener("click", close);
lb.querySelector(".lightbox__prev").addEventListener("click", e => { e.stopPropagation(); show(idx - 1); });
lb.querySelector(".lightbox__next").addEventListener("click", e => { e.stopPropagation(); show(idx + 1); });
lb.addEventListener("click", e => { if (e.target === lb) close(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(idx - 1);
  if (e.key === "ArrowRight") show(idx + 1);
});

document.getElementById("year").textContent = new Date().getFullYear();

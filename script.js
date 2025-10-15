/* Seitenreihenfolge für Pfeilnavigation */
const order = [
  "index.html",
  "ueber-mich.html",
  "diskografie.html",
  "kontakt.html",
  "aktuell.html",
  "gesehen.html",
  "plattformen.html"
];

function setArrowLinks() {
  const path = window.location.pathname;
  const file = path.split('/').pop() || "index.html";
  const idx = order.indexOf(file);

  const left = document.querySelector('.nav-arrow.left');
  const right = document.querySelector('.nav-arrow.right');

  if (idx === -1) return;

  // Auf Startseite Pfeile ausblenden
  if (file === "index.html") {
    if (left) left.style.display = "none";
    if (right) right.style.display = "none";
    return;
  }

  const prev = order[(idx - 1 + order.length) % order.length];
  const next = order[(idx + 1) % order.length];

  if (left) left.setAttribute('href', prev);
  if (right) right.setAttribute('href', next);

  // Tastatursteuerung mit Pfeiltasten
  window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft") window.location.href = prev;
    if (e.key === "ArrowRight") window.location.href = next;
    if (e.key.toLowerCase() === "h") window.location.href = "index.html";
  });
}

document.addEventListener('DOMContentLoaded', setArrowLinks);


/* Inject a fixed background image layer for consistent desktop composition */
function injectBackground() {
  if (document.getElementById('bg-layer')) return;
  const bg = document.createElement('div');
  bg.id = 'bg-layer';
  const img = document.createElement('img');
  img.alt = "";
  img.src = 'assets/b3nn3t.jpg';
  img.loading = 'eager';
  bg.appendChild(img);
  document.body.prepend(bg);
}

document.addEventListener('DOMContentLoaded', injectBackground);

// swipe-nav.js — iPhone-robust + auto-arrows injection
// Mapping: swipe RIGHT (dx > 0) => NEXT page
//          swipe LEFT  (dx < 0) => PREVIOUS page
// Works with existing .nav-arrow links OR auto-creates them if missing.

(function () {
  // ----- Page order (from script.js or default fallback) -----
  const DEFAULT_ORDER = [
    "index.html",
    "ueber-mich.html",
    "diskografie.html",
    "kontakt.html",
    "aktuell.html",
    "gesehen.html",
    "plattformen.html"
  ];
  const PAGE_ORDER = (typeof order !== "undefined" && Array.isArray(order)) ? order : DEFAULT_ORDER;

  function currentFile() {
    const path = (window.location.pathname || "").split("/").pop();
    return path || "index.html";
  }
  function nextPrev(file) {
    const idx = PAGE_ORDER.indexOf(file);
    if (idx === -1) return { prev: null, next: null };
    const prev = PAGE_ORDER[(idx - 1 + PAGE_ORDER.length) % PAGE_ORDER.length];
    const next = PAGE_ORDER[(idx + 1) % PAGE_ORDER.length];
    return { prev, next };
  }

  // ----- Ensure nav arrows exist -----
  function ensureArrows() {
    let left  = document.querySelector(".nav-arrow.left");
    let right = document.querySelector(".nav-arrow.right");

    const { prev, next } = nextPrev(currentFile());

    if (!left) {
      left = document.createElement("a");
      left.className = "nav-arrow left";
      left.textContent = "←";
      left.setAttribute("aria-label", "Vorherige Seite");
      if (prev) left.href = prev; else left.href = "#";
      document.body.appendChild(left);
    } else if (prev) {
      // keep existing element but ensure href
      left.href = left.href || prev;
    }

    if (!right) {
      right = document.createElement("a");
      right.className = "nav-arrow right";
      right.textContent = "→";
      right.setAttribute("aria-label", "Nächste Seite");
      if (next) right.href = next; else right.href = "#";
      document.body.appendChild(right);
    } else if (next) {
      right.href = right.href || next;
    }

    // Minimal safety styles in case CSS is missing
    const styleId = "nav-arrow-inline-style";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `
        .nav-arrow{ position:fixed; top:12px; z-index:999; padding:8px; font-weight:700; text-decoration:none; }
        .nav-arrow.left{ left:12px; }
        .nav-arrow.right{ right:12px; }
      `;
      document.head.appendChild(s);
    }
  }

  // ----- Gesture handling (iOS/Android friendly) -----
  let startX = 0, startY = 0, startT = 0;
  const THRESHOLD_X  = 45;  // px
  const MAX_OFF_AXIS = 80;  // px
  const MAX_DURATION = 800; // ms

  function navigateNext() {
    const r = document.querySelector(".nav-arrow.right");
    if (r && r.href) { window.location.href = r.href; return; }
    const { next } = nextPrev(currentFile());
    if (next) window.location.href = next;
  }
  function navigatePrev() {
    const l = document.querySelector(".nav-arrow.left");
    if (l && l.href) { window.location.href = l.href; return; }
    const { prev } = nextPrev(currentFile());
    if (prev) window.location.href = prev;
    else if (history.length > 1) history.back();
  }

  function onTouchStart(e) {
    const t = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : e);
    startX = t.clientX;
    startY = t.clientY;
    startT = performance.now();
  }

  function onTouchEnd(e) {
    const t  = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const dt = performance.now() - startT;

    if (dt > MAX_DURATION || Math.abs(dy) > MAX_OFF_AXIS) return;

    if (dx > THRESHOLD_X) {
      navigateNext(); // swipe right => NEXT
    } else if (dx < -THRESHOLD_X) {
      navigatePrev(); // swipe left  => PREV
    }
  }

  // iOS-friendly listeners
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend",   onTouchEnd,   { passive: true });

  // Pointer fallback
  let pStartX = 0, pStartY = 0, pStartT = 0;
  function onPointerDown(e) {
    if (e.pointerType !== "touch") return;
    pStartX = e.clientX; pStartY = e.clientY; pStartT = performance.now();
  }
  function onPointerUp(e) {
    if (e.pointerType !== "touch") return;
    const dx = e.clientX - pStartX;
    const dy = e.clientY - pStartY;
    const dt = performance.now() - pStartT;
    if (dt > MAX_DURATION || Math.abs(dy) > MAX_OFF_AXIS) return;

    if (dx > THRESHOLD_X) navigateNext();
    else if (dx < -THRESHOLD_X) navigatePrev();
  }
  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointerup",   onPointerUp,   { passive: true });

  // Ensure arrows after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureArrows);
  } else {
    ensureArrows();
  }
})();
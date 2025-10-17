// swipe-nav.js — iPhone-sicher mit Winkel-Erkennung und iOS-Mapping
// Standard-Mapping (Desktop/Android):
//   Swipe RIGHT  => NEXT page
//   Swipe LEFT   => PREVIOUS page
// Auf iOS (wegen Safari-Edge-Back-Geste) wird das Mapping automatisch gedreht:
//   Swipe LEFT   => NEXT page   (vermeidet Konflikt mit iOS-Back vom Bildschirmrand)
//   Swipe RIGHT  => PREVIOUS page
//
// Funktioniert mit existierenden .nav-arrow Links und erzeugt diese automatisch, falls sie fehlen.

(function () {
  // ------- iOS-Erkennung -------
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

  // ------- Seitenreihenfolge (Fallback) -------
  const DEFAULT_ORDER = [
    "index.html",
    "ueber-mich.html",
    "diskografie.html",
    "kontakt.html",
    "aktuell.html",
    "gesehen.html",
    "plattformen.html"
  ];
  const PAGE_ORDER = (typeof window.order !== "undefined" && Array.isArray(window.order)) ? window.order : DEFAULT_ORDER;

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

  // ------- Pfeile sicherstellen -------
  function ensureArrows() {
    let left  = document.querySelector(".nav-arrow.left");
    let right = document.querySelector(".nav-arrow.right");
    const { prev, next } = nextPrev(currentFile());

    if (!left) {
      left = document.createElement("a");
      left.className = "nav-arrow left";
      left.textContent = "←";
      left.setAttribute("aria-label", "Vorherige Seite");
      left.href = prev || "#";
      document.body.appendChild(left);
    } else if (prev && !left.getAttribute("href")) {
      left.setAttribute("href", prev);
    }

    if (!right) {
      right = document.createElement("a");
      right.className = "nav-arrow right";
      right.textContent = "→";
      right.setAttribute("aria-label", "Nächste Seite");
      right.href = next || "#";
      document.body.appendChild(right);
    } else if (next && !right.getAttribute("href")) {
      right.setAttribute("href", next);
    }

    // Minimal-Styles, falls CSS fehlt
    if (!document.getElementById("nav-arrow-inline-style")) {
      const s = document.createElement("style");
      s.id = "nav-arrow-inline-style";
      s.textContent = `
        .nav-arrow{ position:fixed; top:12px; z-index:999; padding:8px; font-weight:700; text-decoration:none; }
        .nav-arrow.left{ left:12px; }
        .nav-arrow.right{ right:12px; }
      `;
      document.head.appendChild(s);
    }
  }

  function goNext() {
    const r = document.querySelector(".nav-arrow.right");
    if (r && r.getAttribute("href")) { window.location.href = (r as HTMLAnchorElement).href; return; }
    const { next } = nextPrev(currentFile());
    if (next) window.location.href = next;
  }
  function goPrev() {
    const l = document.querySelector(".nav-arrow.left");
    if (l && l.getAttribute("href")) { window.location.href = (l as HTMLAnchorElement).href; return; }
    const { prev } = nextPrev(currentFile());
    if (prev) window.location.href = prev;
    else if (history.length > 1) history.back();
  }

  // ------- Gesten-Erkennung (Winkel-basiert) -------
  let startX = 0, startY = 0, startT = 0;
  const MIN_X = 50;               // Mindestbewegung horizontal (px)
  const MAX_TIME = 900;           // max. Dauer (ms)
  const MAX_TAN = Math.tan(35 * Math.PI / 180); // max. Steigung (≈0.700) => ±35° vom Horizontalen
  const EDGE_GAP = 12;            // Gestenstart, der näher als 12px am Rand ist, ignorieren (iOS-Back vom Rand)

  function onTouchStart(e) {
    const t = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : e);
    startX = t.clientX;
    startY = t.clientY;
    startT = performance.now();
  }

  function onTouchEnd(e) {
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const dt = performance.now() - startT;

    // Edge-Swipe (iOS Back/Forward) ignorieren, wenn zu nah am Rand gestartet
    if (isIOS && (startX < EDGE_GAP || (window.innerWidth - startX) < EDGE_GAP)) return;

    if (dt > MAX_TIME) return;
    if (Math.abs(dx) < MIN_X) return;
    if (Math.abs(dy) / Math.abs(dx) > MAX_TAN) return; // zu steil = eher vertikales Scrollen

    // Mapping: iOS dreht, um mit der Systemgeste nicht zu kollidieren
    if (isIOS) {
      // iOS: LEFT => NEXT, RIGHT => PREV
      if (dx < 0) goNext();
      else goPrev();
    } else {
      // Standard: RIGHT => NEXT, LEFT => PREV
      if (dx > 0) goNext();
      else goPrev();
    }
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend",   onTouchEnd,   { passive: true });

  // Pointer-Fallback
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
    if (dt > MAX_TIME || Math.abs(dx) < MIN_X || Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;

    if (isIOS) {
      if (dx < 0) goNext(); else goPrev();
    } else {
      if (dx > 0) goNext(); else goPrev();
    }
  }
  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointerup",   onPointerUp,   { passive: true });

  // Pfeile nach DOM-Ready sicherstellen
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureArrows);
  } else {
    ensureArrows();
  }
})();
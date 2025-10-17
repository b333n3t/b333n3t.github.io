// swipe-nav.js — v9 (NEXT on right-edge → left swipe; PREV on left→right)
// Mapping requested:
//   - Swipe from RIGHT to LEFT (dx < 0) => NEXT page
//   - Swipe from LEFT to RIGHT (dx > 0) => PREVIOUS page
//
// Also uses your explicit page order.

(function () {
  // --- Explicit page order (as requested) ---
  const ORDER = [
    "index.html",
    "ueber-mich.html",
    "diskografie.html",
    "kontakt.html",
    "aktuell.html",
    "gesehen.html",
    "plattformen.html"
  ];

  const curFile = () => (window.location.pathname.split("/").pop() || "index.html");

  function around(file) {
    const i = ORDER.indexOf(file);
    if (i === -1) return { prev: null, next: null };
    return {
      prev: ORDER[(i - 1 + ORDER.length) % ORDER.length],
      next: ORDER[(i + 1) % ORDER.length]
    };
  }

  // Ensure arrows exist (for click navigation too)
  function ensureArrows(){
    const { prev, next } = around(curFile());

    let L = document.querySelector(".nav-arrow.left");
    let R = document.querySelector(".nav-arrow.right");

    if (!L) {
      L = document.createElement("a");
      L.className = "nav-arrow left";
      L.textContent = "←";
      L.setAttribute("aria-label", "Vorherige Seite");
      L.href = prev || "#";
      document.body.appendChild(L);
    } else if (prev && !L.getAttribute("href")) {
      L.setAttribute("href", prev);
    }

    if (!R) {
      R = document.createElement("a");
      R.className = "nav-arrow right";
      R.textContent = "→";
      R.setAttribute("aria-label", "Nächste Seite");
      R.href = next || "#";
      document.body.appendChild(R);
    } else if (next && !R.getAttribute("href")) {
      R.setAttribute("href", next);
    }

    // Minimal inline style safeguard (overridden by your CSS file if present)
    if (!document.getElementById("nav-arrow-inline-style")) {
      const s = document.createElement("style");
      s.id = "nav-arrow-inline-style";
      s.textContent = ".nav-arrow{position:fixed;top:12px;z-index:999;padding:8px;font-weight:700;text-decoration:none;color:#000}.nav-arrow.left{left:12px}.nav-arrow.right{right:12px}";
      document.head.appendChild(s);
    }
  }

  function goNext(){
    const r = document.querySelector(".nav-arrow.right");
    if (r && r.getAttribute("href")) { window.location.href = r.href; return; }
    const { next } = around(curFile());
    if (next) window.location.href = next;
  }
  function goPrev(){
    const l = document.querySelector(".nav-arrow.left");
    if (l && l.getAttribute("href")) { window.location.href = l.href; return; }
    const { prev } = around(curFile());
    if (prev) window.location.href = prev;
    else if (history.length > 1) history.back();
  }

  // --- Gesture detection (angle-based, edge-safe) ---
  let sx = 0, sy = 0, st = 0;
  const MIN_X = 40;
  const MAX_TIME = 900;
  const MAX_TAN = Math.tan(35 * Math.PI/180);
  const EDGE_GAP = 28; // ignore starts too close to either edge (iOS system gestures)

  function onTouchStart(e){
    if (e.touches && e.touches.length > 1) return; // ignore multi-touch
    const t = e.changedTouches ? e.changedTouches[0] : (e.touches ? e.touches[0] : e);
    sx = t.clientX; sy = t.clientY; st = performance.now();
  }
  function onTouchEnd(e){
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;
    const dt = performance.now() - st;

    if (sx < EDGE_GAP || (window.innerWidth - sx) < EDGE_GAP) return;
    if (dt > MAX_TIME) return;
    if (Math.abs(dx) < MIN_X) return;
    if (Math.abs(dy) / Math.abs(dx) > MAX_TAN) return;

    // ✅ Requested mapping: RIGHT→LEFT swipe (dx < 0) => NEXT
    if (dx < 0) goNext();
    else goPrev();
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend",   onTouchEnd,   { passive: true });

  // Pointer fallback (for some browsers)
  let px=0, py=0, pt=0;
  function onPointerDown(e){
    if (e.pointerType !== "touch") return;
    px = e.clientX; py = e.clientY; pt = performance.now();
  }
  function onPointerUp(e){
    if (e.pointerType !== "touch") return;
    const dx = e.clientX - px;
    const dy = e.clientY - py;
    const dt = performance.now() - pt;

    if (px < EDGE_GAP || (window.innerWidth - px) < EDGE_GAP) return;
    if (dt > MAX_TIME || Math.abs(dx) < MIN_X || Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;

    // ✅ Requested mapping here as well
    if (dx < 0) goNext();
    else goPrev();
  }
  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointerup",   onPointerUp,   { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureArrows);
  } else {
    ensureArrows();
  }
})();
// swipe-nav.js — v5 (iPhone fix with RIGHT => NEXT mapping)
// Your request: swipe LEFT→RIGHT should go to NEXT page, even on iPhone.
// To avoid the iOS back-swipe from the very edge, we ignore swipes that start
// closer than EDGE_GAP px to the screen edges.

(function () {
  const DEFAULT_ORDER = [
    "index.html",
    "ueber-mich.html",
    "diskografie.html",
    "kontakt.html",
    "aktuell.html",
    "gesehen.html",
    "plattformen.html"
  ];
  const ORDER = (typeof window.order !== "undefined" && Array.isArray(window.order)) ? window.order : DEFAULT_ORDER;

  function curFile() {
    const p = (window.location.pathname || "").split("/").pop();
    return p || "index.html";
  }
  function around(file) {
    const i = ORDER.indexOf(file);
    if (i === -1) return { prev: null, next: null };
    return {
      prev: ORDER[(i - 1 + ORDER.length) % ORDER.length],
      next: ORDER[(i + 1) % ORDER.length],
    };
  }

  function ensureArrows() {
    let left  = document.querySelector(".nav-arrow.left");
    let right = document.querySelector(".nav-arrow.right");
    const { prev, next } = around(curFile());

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

    // Minimal inline styles if none exist
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
    if (r && r.getAttribute("href")) { window.location.href = r.href; return; }
    const { next } = around(curFile());
    if (next) window.location.href = next;
  }
  function goPrev() {
    const l = document.querySelector(".nav-arrow.left");
    if (l && l.getAttribute("href")) { window.location.href = l.href; return; }
    const { prev } = around(curFile());
    if (prev) window.location.href = prev;
    else if (history.length > 1) history.back();
  }

  // ---- Gesture detection (angle-based) ----
  let sx=0, sy=0, st=0;
  const MIN_X = 44;                              // min horizontal distance (px)
  const MAX_TIME = 900;                          // ms
  const MAX_TAN = Math.tan(32 * Math.PI/180);    // ~±32° from horizontal
  const EDGE_GAP = 28;                           // ignore starts within 28px of edges (iOS back-swipe zone)

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

    // avoid iOS edge back/forward gesture area
    if (sx < EDGE_GAP || (window.innerWidth - sx) < EDGE_GAP) return;

    if (dt > MAX_TIME) return;
    if (Math.abs(dx) < MIN_X) return;
    if (Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;

    // YOUR requested mapping on all devices:
    // swipe RIGHT (dx>0) => NEXT, swipe LEFT (dx<0) => PREV
    if (dx > 0) goNext();
    else goPrev();
  }

  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend",   onTouchEnd,   { passive: true });

  // Pointer fallback (Android/desktop)
  let px=0, py=0, pt=0;
  function onPointerDown(e){
    if (e.pointerType !== "touch") return;
    px=e.clientX; py=e.clientY; pt=performance.now();
  }
  function onPointerUp(e){
    if (e.pointerType !== "touch") return;
    const dx = e.clientX - px;
    const dy = e.clientY - py;
    const dt = performance.now() - pt;
    if (px < EDGE_GAP || (window.innerWidth - px) < EDGE_GAP) return;
    if (dt > MAX_TIME || Math.abs(dx) < MIN_X || Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;
    if (dx > 0) goNext(); else goPrev();
  }
  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointerup",   onPointerUp,   { passive: true });

  // Ensure arrows when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureArrows);
  } else {
    ensureArrows();
  }
})();
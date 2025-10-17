// swipe-nav.js (mobile-first, robust)
// Swiping LEFT -> previous page  (".nav-arrow.left")
// Swiping RIGHT -> next page     (".nav-arrow.right")
// Tweaked for iOS/Android reliability.

(function () {
  // Run on touch-capable devices; allow desktop testing too
  const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchCapable && !matchMedia("(pointer: coarse)").matches) {
    // still run, trackpads often act like touch (helps on notebooks)
  }

  let startX = 0, startY = 0, startT = 0;

  // Calibrated for phones (a bit more permissive than before):
  const THRESHOLD_X = 45;    // min horizontal distance in px
  const MAX_OFF_AXIS = 80;   // allow more vertical drift
  const MAX_DURATION = 800;  // allow a slightly longer swipe

  const leftLink  = () => document.querySelector(".nav-arrow.left");
  const rightLink = () => document.querySelector(".nav-arrow.right");

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

    // Ignore long drags or mostly vertical gestures
    if (dt > MAX_DURATION || Math.abs(dy) > MAX_OFF_AXIS) return;

    // IMPORTANT: As requested — swipe RIGHT (dx > 0) goes to NEXT page
    if (dx > THRESHOLD_X) {
      const next = rightLink();
      if (next && next.href) window.location.href = next.href;
    } else if (dx < -THRESHOLD_X) {
      const prev = leftLink();
      if (prev && prev.href) window.location.href = prev.href;
      else if (history.length > 1) history.back();
    }
  }

  // Use document-level passive listeners (iOS-friendly)
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchend", onTouchEnd,   { passive: true });

  // Pointer event fallback (for some Android/desktop browsers)
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

    if (dx > THRESHOLD_X) {
      const next = rightLink();
      if (next && next.href) window.location.href = next.href;
    } else if (dx < -THRESHOLD_X) {
      const prev = leftLink();
      if (prev && prev.href) window.location.href = prev.href;
      else if (history.length > 1) history.back();
    }
  }
  document.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointerup", onPointerUp,     { passive: true });
})();
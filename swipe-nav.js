// swipe-nav.js
// Lightweight swipe navigation for mobile devices.
// Swiping left -> click .nav-arrow.right
// Swiping right -> click .nav-arrow.left

(function () {
  const prefersCoarse = matchMedia("(pointer: coarse)").matches;
  if (!prefersCoarse) return; // limit to touch devices

  let startX = 0;
  let startY = 0;
  let startT = 0;

  const THRESHOLD_X = 60;     // px min horizontal distance
  const MAX_OFF_AXIS = 50;    // px allowed vertical movement
  const MAX_DURATION = 600;   // ms

  const getLink = (sel) => document.querySelector(sel);

  function onTouchStart(e) {
    const t = e.changedTouches ? e.changedTouches[0] : e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    startT = performance.now();
  }

  function onTouchEnd(e) {
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const dt = performance.now() - startT;

    // ignore long drags or mostly vertical gestures
    if (dt > MAX_DURATION || Math.abs(dy) > MAX_OFF_AXIS) return;

    // swipe right -> go left; swipe left -> go right
    if (dx > THRESHOLD_X) {
      const left = getLink(".nav-arrow.left");
      if (left && left.href) {
        window.location.href = left.href;
      } else if (history.length > 1) {
        history.back();
      }
    } else if (dx < -THRESHOLD_X) {
      const right = getLink(".nav-arrow.right");
      if (right && right.href) {
        window.location.href = right.href;
      }
    }
  }

  // Use passive listeners so we don't block scrolling
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  // Pointer event fallback (some browsers fire pointer events only)
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
      const left = getLink(".nav-arrow.left");
      if (left && left.href) { window.location.href = left.href; }
      else if (history.length > 1) { history.back(); }
    } else if (dx < -THRESHOLD_X) {
      const right = getLink(".nav-arrow.right");
      if (right && right.href) { window.location.href = right.href; }
    }
  }
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
})();
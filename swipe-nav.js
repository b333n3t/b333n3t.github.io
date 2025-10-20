// swipe-nav.js — v15
// NEXT on right→left (dx < 0 or wheel deltaX < 0), PREV on left→right.
// Touch + Pointer + Trackpad (wheel). Idle-safe & iOS-edge-safe.
// Desktop fix: auto-invert trackpad wheel on Windows; optional override via window.SWIPE_WHEEL_INVERT.
(function () {
  // --- explicit order ---
  const ORDER = [
    "index.html","ueber-mich.html","diskografie.html",
    "kontakt.html","aktuell.html","gesehen.html","plattformen.html"
  
  // --- allow vertical scroll inside scrollable containers (only navigate at edges) ---
  let _startTarget = null;
  function nearestScrollable(el){
    let n = el;
    while (n && n !== document.documentElement){
      if (n.scrollHeight > n.clientHeight + 1) return n;
      n = n.parentElement;
    }
    return null;
  }
  function canScrollVert(el, dir){ // dir: +1 = down, -1 = up
    const sc = nearestScrollable(el);
    if (!sc) return false;
    const atTop    = sc.scrollTop <= 0;
    const atBottom = Math.ceil(sc.scrollTop + sc.clientHeight) >= sc.scrollHeight;
    if (dir > 0) return !atBottom; // scrolling down possible?
    if (dir < 0) return !atTop;    // scrolling up possible?
    return false;
  }
];

  const cur = () => (location.pathname.split("/").pop() || "index.html");
  const around = f => {
    const i = ORDER.indexOf(f);
    return i < 0 ? {prev:null,next:null}
                 : {prev: ORDER[(i-1+ORDER.length)%ORDER.length],
                    next: ORDER[(i+1)%ORDER.length]};
  };

  function goNext(){ const r=document.querySelector(".nav-arrow.right"); if(r&&r.href){location.href=r.href; return;}
    const {next}=around(cur()); if(next) location.href=next; }
  function goPrev(){ const l=document.querySelector(".nav-arrow.left");  if(l&&l.href){location.href=l.href; return;}
    const {prev}=around(cur()); if(prev) location.href=prev; else if(history.length>1) history.back(); }

  // Create arrows if missing (click fallback)
  function ensureArrows(){
    const {prev,next}=around(cur());
    let L=document.querySelector(".nav-arrow.left");
    let R=document.querySelector(".nav-arrow.right");
    if(!L){L=document.createElement("a");L.className="nav-arrow left";L.textContent="←";L.href=prev||"#";L.setAttribute("aria-label","Zurück");document.body.appendChild(L);}
    else if(prev && !L.getAttribute("href")) L.setAttribute("href", prev);
    if(!R){R=document.createElement("a");R.className="nav-arrow right";R.textContent="→";R.href=next||"#";R.setAttribute("aria-label","Weiter");document.body.appendChild(R);}
    else if(next && !R.getAttribute("href")) R.setAttribute("href", next);
  }

  // ------- Gesture detection -------
  let sx=0, sy=0, st=0, active=false;
  const MIN_X = 42;
  const MAX_TIME = 1000;
  const MAX_TAN = Math.tan(35*Math.PI/180);
  const TOUCH_EDGE_GAP = 40;

  function reset(){ active=false; sx=sy=st=0; }

  function start(x,y){ sx=x; sy=y; st=performance.now(); active=true; }
  function end(x,y, edgeGap){
    if(!active) return; active=false;
    const dx = x - sx, dy = y - sy, dt = performance.now() - st;
    if (edgeGap && (sx < edgeGap || (innerWidth - sx) < edgeGap)) return; // iOS edges
    if (dt > MAX_TIME || Math.abs(dx) < MIN_X) return;
    if (Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;
    if (dx < 0) goNext(); else goPrev();
  }

  // Touch (mobile/tablet)
  document.addEventListener("touchstart", e=>{ _startTarget = e.target;
    if (e.touches && e.touches.length > 1) return;
    const t = e.touches?.[0] || e.changedTouches?.[0]; if(!t) return;
    start(t.clientX,t.clientY);
  }, {passive:true, capture:true});

  document.addEventListener("touchend", e=>{
    const t = e.changedTouches?.[0]; if(!t) return;
    const dy = t.clientY - sy;
    if (Math.abs(dy) > 0 && canScrollVert(_startTarget || t.target, dy > 0 ? -1 : 1)) { reset(); return; }
    end(t.clientX,t.clientY, TOUCH_EDGE_GAP); // edge gap only for touch
  }, {passive:true, capture:true});

  document.addEventListener("touchcancel", reset, {capture:true});

  // Pointer (touch-capable laptops, 2in1 etc.)
  document.addEventListener("pointerdown", e=>{ _startTarget = e.target;
    if (e.pointerType !== "touch") return;
    start(e.clientX, e.clientY);
  }, {passive:true, capture:true});

  document.addEventListener("pointerup", e=>{
    if (e.pointerType !== "touch") return;
    const dy = e.clientY - sy;
    if (Math.abs(dy) > 0 && canScrollVert(_startTarget || e.target, dy > 0 ? -1 : 1)) { reset(); return; }
    end(e.clientX, e.clientY, 0); // no edge gap for pointer
  }, {passive:true, capture:true});

  // Desktop trackpads (Chrome/Edge): horizontal wheel
  let wheelDX=0, wheelDY=0, wheelTimer=null;
  const WHEEL_WINDOW=180; // ms
  const WHEEL_MIN_X=120;  // threshold

  // Auto-invert on Windows (common deltaX sign difference vs macOS), allow override
  const IS_WINDOWS = typeof navigator !== "undefined" && /Windows/i.test(navigator.userAgent || "");
  const INVERT_WHEEL = (typeof window !== "undefined" && typeof window.SWIPE_WHEEL_INVERT === "boolean")
    ? window.SWIPE_WHEEL_INVERT
    : IS_WINDOWS;

  function flushWheel(){
    let dx=wheelDX, dy=wheelDY; wheelDX=wheelDY=0; wheelTimer=null;
    if (INVERT_WHEEL) dx = -dx; // normalize: right→left should be negative

    if (Math.abs(dx) < WHEEL_MIN_X) return;
    if (Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;
    if (dx < 0) goNext(); else goPrev();
  }
  document.addEventListener("wheel", e=>{
    if (e.ctrlKey) return; // ignore pinch-zoom
    // If a scrollable container can consume this vertical movement, do not navigate
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && canScrollVert(e.target, e.deltaY > 0 ? 1 : -1)) return;
    wheelDX += e.deltaX; wheelDY += e.deltaY;
    if (!wheelTimer) wheelTimer = setTimeout(flushWheel, WHEEL_WINDOW);
  }, {passive:true, capture:true});

  // Idle/visibility resilience
  ["visibilitychange","pageshow","pagehide","blur","focus"].forEach(ev=>{
    window.addEventListener(ev, reset, {capture:true});
    document.addEventListener(ev, reset, {capture:true});
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ensureArrows);
  else ensureArrows();
})();
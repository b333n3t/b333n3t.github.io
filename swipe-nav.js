// swipe-nav.js — v12
// NEXT on right→left (dx < 0 or wheel deltaX < 0), PREV on left→right.
// Touch + Pointer + Trackpad (wheel). Idle-safe & iOS-edge-safe.
(function () {
  // --- explicit order ---
  const ORDER = [
    "index.html","ueber-mich.html","diskografie.html",
    "kontakt.html","aktuell.html","gesehen.html","plattformen.html"
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
  document.addEventListener("touchstart", e=>{
    if (e.touches && e.touches.length > 1) return;
    const t = e.touches?.[0] || e.changedTouches?.[0]; if(!t) return;
    start(t.clientX,t.clientY);
  }, {passive:true, capture:true});

  document.addEventListener("touchend", e=>{
    const t = e.changedTouches?.[0]; if(!t) return;
    end(t.clientX,t.clientY, TOUCH_EDGE_GAP); // edge gap only for touch
  }, {passive:true, capture:true});

  document.addEventListener("touchcancel", reset, {capture:true});

  // Pointer (touch-capable laptops, 2in1 etc.)
  document.addEventListener("pointerdown", e=>{
    if (e.pointerType !== "touch") return;
    start(e.clientX, e.clientY);
  }, {passive:true, capture:true});

  document.addEventListener("pointerup", e=>{
    if (e.pointerType !== "touch") return;
    end(e.clientX, e.clientY, 0); // no edge gap for pointer
  }, {passive:true, capture:true});

  // Desktop trackpads (Chrome/Edge): horizontal wheel
  let wheelDX=0, wheelDY=0, wheelTimer=null;
  const WHEEL_WINDOW=180; // ms
  const WHEEL_MIN_X=120;  // threshold
  function flushWheel(){
    const dx=wheelDX, dy=wheelDY; wheelDX=wheelDY=0; wheelTimer=null;
    if (Math.abs(dx) < WHEEL_MIN_X) return;
    if (Math.abs(dy)/Math.abs(dx) > MAX_TAN) return;
    if (dx < 0) goNext(); else goPrev();
  }
  document.addEventListener("wheel", e=>{
    if (e.ctrlKey) return;
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
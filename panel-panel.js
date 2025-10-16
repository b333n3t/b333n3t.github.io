
// ===== Retro Panel behavior
(function(){
  function setup(){
    var panel = document.querySelector('.retro-panel');
    if(!panel) return;
    var title = panel.querySelector('#rpTitle');
    var desc  = panel.querySelector('#rpDesc');
    var buttons = panel.querySelectorAll('.dial');
    function showDefault(){
      if(title && desc){
        title.textContent = 'über mich';
        desc.textContent  = 'Bio & Einblicke';
      }
    }
    showDefault();
    buttons.forEach(function(btn){
      var t = btn.getAttribute('data-title') || '';
      var d = btn.getAttribute('data-desc') || '';
      function show(){
        if(title) title.textContent = t;
        if(desc)  desc.textContent  = d;
      }
      btn.addEventListener('mouseenter', show);
      btn.addEventListener('focus', show);
      btn.addEventListener('mouseleave', showDefault);
      btn.addEventListener('blur', showDefault);
    });
  }
  if(document.readyState === 'complete' || document.readyState === 'interactive'){
    setup();
  }else{
    document.addEventListener('DOMContentLoaded', setup);
  }
})();

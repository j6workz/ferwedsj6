// Diagnostics, loaded only when the link has ?debug. Not used by guests.
// ?debug               FPS meter + carousel touch log
// &off=ripple,shadow,grain,flip3d,blur   switch suspects off one at a time
(function(){
  const p = new URLSearchParams(location.search);
  const off = (p.get('off') || '').split(',').filter(Boolean);
  const css = [];
  if (off.includes('ripple')) css.push('.opening .water{filter:none!important}');
  if (off.includes('shadow')) css.push('.actor,.actor.sprite,.actor.rig,.actor img,.nap-cat,.boat .boat-sprite{filter:none!important}');
  if (off.includes('grain')) css.push('.paper,.dark,.env .paper{--grain:linear-gradient(transparent,transparent)!important}');
  if (off.includes('flip3d')) css.push('.flip,.flip-in{perspective:none!important;transform-style:flat!important;transform:none!important}.flip .face.back{display:none;transform:none!important}.flip.on .face.back{display:block}.flip.on .face.front{visibility:hidden}');
  if (off.includes('blur')) css.push('.cd-card{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}');
  if (off.includes('snap')) css.push('.gift-track{scroll-snap-type:none!important}');
  if (off.includes('clip')) css.push('#inv,section#gift{overflow:visible!important}');
  if (off.includes('reveal')) css.push('.gift-carousel{transform:none!important;transition:none!important;opacity:1!important}');
  if (off.includes('touch')){   // app.js's window-level, non-passive touch handlers (swipe to open the cover) are never added
    const add = window.addEventListener;
    window.addEventListener = function(type, fn, opt){ if (/^touch/.test(type) && opt && opt.passive === false) return; return add.call(this, type, fn, opt); };
  }
  if (css.length){ const s = document.createElement('style'); s.textContent = css.join('\n'); document.head.appendChild(s); }

  const box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;max-width:62vw;padding:6px 8px;border-radius:8px;background:rgba(0,0,0,.78);color:#0f0;font:11px/1.35 ui-monospace,Menlo,monospace;pointer-events:none;white-space:pre-wrap';
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(box));
  const log = [];
  function note(s){ log.unshift(s); log.length = Math.min(log.length, 7); }

  let frames = 0, worst = 0, last = performance.now(), t0 = last, fps = 0, w = 0;
  function loop(now){
    const d = now - last; last = now; frames++; if (d > worst) worst = d;
    if (now - t0 >= 1000){ fps = Math.round(frames * 1000 / (now - t0)); w = Math.round(worst); frames = 0; worst = 0; t0 = now; }
    box.textContent = 'fps ' + fps + '  worst ' + w + 'ms  off=' + (off.join(',') || '-') + '\n' + log.join('\n');
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Report every preventDefault() on a touch/pointer event inside the card row, with the calling line.
  let tr = null;
  const pd = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function(){
    if (tr && /^(touch|pointer|gesture)/.test(this.type) && this.target instanceof Node && tr.contains(this.target)){
      const at = ((new Error().stack || '').split('\n').find((l) => /app\.js|i18n\.js|rsvp\.js/.test(l)) || '?').replace(/.*\//, '').trim();
      note('PD ' + this.type + ' @ ' + at);
    }
    return pd.call(this);
  };

  document.addEventListener('DOMContentLoaded', () => {
    tr = document.getElementById('giftTrack');
    if (!tr) return;
    const cs = getComputedStyle(tr);
    note('track ox=' + cs.overflowX + ' snap=' + cs.scrollSnapType + ' ta=' + cs.touchAction + ' w=' + tr.clientWidth + '/' + tr.scrollWidth);
    let sx = 0, sy = 0, scrolls = 0, moves = 0, canc = 0, x0 = 0, dx = 0;
    tr.addEventListener('touchstart', (e) => { sx = tr.scrollLeft; sy = window.scrollY; scrolls = moves = canc = 0; x0 = e.touches[0].clientX; dx = 0; const t = e.target; note('start on ' + t.tagName.toLowerCase() + '.' + (t.className || '').toString().split(' ')[0]); }, { passive: true });
    tr.addEventListener('touchmove', (e) => { moves++; if (e.cancelable) canc++; dx = e.touches[0].clientX - x0; }, { passive: true });
    tr.addEventListener('scroll', () => { scrolls++; }, { passive: true });
    tr.addEventListener('touchend', () => { note('end: x ' + Math.round(sx) + '→' + Math.round(tr.scrollLeft) + ' scrollev ' + scrolls + ' moves ' + moves + ' (cancelable ' + canc + ') fingerdx ' + Math.round(dx) + ' pageY ' + Math.round(window.scrollY - sy)); }, { passive: true });
    tr.addEventListener('touchcancel', () => { note('touchCANCEL after ' + moves + ' moves'); }, { passive: true });
  });
})();

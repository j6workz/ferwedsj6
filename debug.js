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

  document.addEventListener('DOMContentLoaded', () => {
    const tr = document.getElementById('giftTrack');
    if (!tr) return;
    let sx = 0, scrolls = 0;
    tr.addEventListener('touchstart', (e) => { sx = tr.scrollLeft; scrolls = 0; const t = e.target; note('start on ' + t.tagName.toLowerCase() + '.' + (t.className || '').toString().split(' ')[0]); }, { passive: true });
    tr.addEventListener('scroll', () => { scrolls++; }, { passive: true });
    tr.addEventListener('touchend', () => { note('end: scrollLeft ' + Math.round(sx) + '→' + Math.round(tr.scrollLeft) + ' (' + scrolls + ' scroll ev) max ' + (tr.scrollWidth - tr.clientWidth)); }, { passive: true });
    window.addEventListener('touchmove', (e) => { if (tr.contains(e.target) && e.defaultPrevented) note('touchmove PREVENTED'); }, { passive: true });
    document.addEventListener('touchmove', (e) => { if (tr.contains(e.target)) setTimeout(() => { if (e.defaultPrevented) note('touchmove prevented (late)'); }); }, { passive: true, capture: true });
  });
})();

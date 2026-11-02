(function(){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- guest name (?to=Name) ----------
  const guestEl = document.getElementById('guestName');
  if (guestEl && window.nikahGuestName) guestEl.textContent = window.nikahGuestName;

  // ---------- reveal effects (zoom-down / zoom-up / zoom-out / corner zooms) ----------
  document.querySelectorAll('[data-r]').forEach((el) => {
    const d = parseInt(el.getAttribute('data-delay') || '0', 10);
    if (d) el.style.transitionDelay = d + 'ms';
  });
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting){ e.target.classList.add('in'); revealer.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

  const cover = document.getElementById('cover');
  // the cover animates in straight away
  requestAnimationFrame(() => setTimeout(() => {
    cover.querySelectorAll('[data-r]').forEach((el) => el.classList.add('in'));
  }, 60));

  document.getElementById('openBtn').addEventListener('click', () => {
    window.scrollTo(0, 0);
    cover.classList.add('open');
    document.body.classList.remove('locked');
    document.querySelectorAll('#inv [data-r]').forEach((el) => revealer.observe(el));
    setTimeout(() => { cover.style.display = 'none'; }, 1400);
  });

  // ---------- birds over the opening scene ----------
  const birds = document.getElementById('birds');
  if (birds && !reduceMotion){
    const w = birds.getBoundingClientRect().width || 430;
    for (let i = 0; i < 4; i++){
      const b = document.createElement('img');
      b.src = '../v3/assets/bird.webp'; b.alt = '';
      b.style.top = (10 + i * 18 + Math.random() * 10) + '%';
      b.style.width = (22 + Math.random() * 16) + 'px';
      b.style.setProperty('--w', (w + 120) + 'px');
      b.style.animationDuration = (11 + Math.random() * 7).toFixed(1) + 's';
      b.style.animationDelay = (-Math.random() * 14).toFixed(1) + 's';
      birds.appendChild(b);
    }
  }

  // ---------- a few drifting leaves ----------
  if (!reduceMotion){
    const layer = document.getElementById('leaves');
    const leaves = ['../v3/assets/leaf-a.webp', '../v3/assets/leaf-b.webp'];
    for (let i = 0; i < 9; i++){
      const el = document.createElement('img');
      el.src = leaves[i % 2]; el.alt = '';
      el.style.left = (Math.random() * 100) + '%';
      el.style.width = (14 + Math.random() * 14) + 'px';
      el.style.opacity = (0.5 + Math.random() * 0.4).toFixed(2);
      el.style.setProperty('--dx', (Math.random() * 140 - 70).toFixed(0) + 'px');
      el.style.setProperty('--rot', (180 + Math.random() * 480).toFixed(0) + 'deg');
      el.style.animationDuration = (12 + Math.random() * 9).toFixed(1) + 's';
      el.style.animationDelay = (-Math.random() * 20).toFixed(1) + 's';
      layer.appendChild(el);
    }
  }

  // ---------- back to top ----------
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => { toTop.classList.toggle('show', window.scrollY > 700); }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---------- countdown ----------
  const target = new Date('2026-11-11T11:00:00+07:00').getTime();
  const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].map((id) => document.getElementById(id));
  function tick(){
    const diff = Math.max(0, target - Date.now());
    const parts = [Math.floor(diff / 86400000), Math.floor(diff % 86400000 / 3600000), Math.floor(diff % 3600000 / 60000), Math.floor(diff % 60000 / 1000)];
    parts.forEach((v, i) => { ids[i].textContent = String(v).padStart(2, '0'); });
  }
  tick(); setInterval(tick, 1000);

  // ---------- add to Google Calendar (11:00–15:00 WIB = 04:00–08:00 UTC) ----------
  const cal = new URL('https://calendar.google.com/calendar/render');
  cal.searchParams.set('action', 'TEMPLATE');
  cal.searchParams.set('text', 'Akad Nikah & Resepsi — Jawahar & Ferina');
  cal.searchParams.set('dates', '20261111T040000Z/20261111T080000Z');
  cal.searchParams.set('location', 'KUA Kecamatan Kemayoran, Jakarta');
  cal.searchParams.set('details', 'Akad Nikah 11:00 WIB · KUA Kecamatan Kemayoran\nResepsi 12:00–15:00 WIB · Ayda Hotel, Jakarta\n' + location.href.split('?')[0]);
  document.getElementById('calBtn').href = cal.toString();

  // ---------- copy account number ----------
  const copyBtn = document.getElementById('copyBtn');
  copyBtn.addEventListener('click', async () => {
    const digits = document.getElementById('accNum').textContent.replace(/\D/g, '');
    try { await navigator.clipboard.writeText(digits); } catch (e) { return; }
    const label = copyBtn.querySelector('span');
    copyBtn.classList.add('done');
    label.textContent = window.i18nText('gift.copied');
    setTimeout(() => { copyBtn.classList.remove('done'); label.textContent = window.i18nText('gift.copy'); }, 1800);
  });

  // ---------- lightbox ----------
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('[data-full]').forEach((el) => {
    el.addEventListener('click', () => { lbImg.src = el.getAttribute('data-full'); lb.classList.add('show'); });
  });
  lb.addEventListener('click', () => lb.classList.remove('show'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('show'); });
})();

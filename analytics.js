/* ---------- guest activity log ----------
   Records what a guest does on the invitation (opened, sections reached, gift / map / calendar / language / sound
   taps, which wish-form fields they tapped, submitted or not) and sends it in small batches to the Google Apps Script
   relay (tools/rsvp-telegram.gs → "Events" + "Summary" tabs of Jawahar's sheet). The guest is known from the
   personal link (?to=Name); a random id per device groups visits by people without a name in the link.

   Never sent: anything typed into the form (only WHICH field was tapped). Wishes themselves arrive via rsvp.js
   only after the guest presses Send.

   Off for: this device after opening any page once with ?notrack (the couple's own phones), and localhost unless
   ?track is in the URL (so local testing doesn't fill the sheet). */
(function(){
  const URL_ = 'https://script.google.com/macros/s/AKfycbw922XOvv9O8FceqwEKQRaip21QJXJUqPQr0iMZN0icE6osr7uhCWnlNdtBwMSGGy_y/exec';
  const q = new URLSearchParams(location.search);
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  if (q.has('notrack')) store('fw-notrack', '1');
  if (q.has('track')) { try { localStorage.removeItem('fw-notrack'); } catch (e) {} }
  if (store('fw-notrack') === '1') return;
  if (/^(localhost|127\.|192\.168\.|\[::1\])/.test(location.hostname) && !q.has('track')) return;

  let vid = store('fw-vid');
  if (!vid) { vid = Math.random().toString(36).slice(2, 10); store('fw-vid', vid); }
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS'
           : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'other';
  const device = (/Mobi|iPhone|Android/i.test(ua) ? 'phone' : 'desktop') + ' · ' + os;
  const page = (location.pathname.replace(/\/|\.html$/g, '') || 'main');
  const guest = () => window.nikahGuestName || '';
  const lang = () => document.documentElement.lang || '';

  let queue = [], timer = 0;
  const once = new Set();
  function log(event, detail, onlyOnce){
    const key = event + '|' + (detail || '');
    if (onlyOnce) { if (once.has(key)) return; once.add(key); }
    queue.push({ t: new Date().toISOString(), event, detail: String(detail || '').slice(0, 80) });
    clearTimeout(timer); timer = setTimeout(flush, queue.length >= 12 ? 0 : 4000);
  }
  function flush(){
    if (!queue.length) return;
    const body = JSON.stringify({ type: 'events', vid, guest: guest(), page, lang: lang(), device, events: queue.splice(0) });
    try {
      fetch(URL_, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body }).catch(() => {});
    } catch (e) {}
  }

  // who sent the link (send.html adds &from=j6|amma|thilagar), else where the visit came from
  const from = (q.get('from') || '').replace(/[^a-z0-9]/gi, '').slice(0, 12);
  log('visit', from ? 'via ' + from : (document.referrer ? new URL(document.referrer).hostname : ''));

  // taps
  const label = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
  const card = (el) => { const b = el.closest('.gift-slide')?.querySelector('.bank'); return b ? (b.firstChild?.textContent || '').trim() : ''; };   // bank name without its country tag
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a,button,label,[data-full]'); if (!el) return;
    if (el.id === 'openBtn') return log('open_invitation', '', true);
    if (el.id === 'soundBtn') return setTimeout(() => log('sound', el.getAttribute('aria-pressed') === 'true' ? 'on' : 'off'), 0);
    if (el.matches('[data-lang]')) return log('language', el.getAttribute('data-lang'));
    if (el.classList.contains('copy-btn')) return log('gift_copy', card(el));
    if (el.classList.contains('qr-toggle')) return log('gift_qr', card(el));
    if (el.classList.contains('dl-btn')) return log('gift_download_qr', card(el));
    if (el.closest('#upiPay')) return log('gift_app', label(el));
    if (el.id === 'calBtn') return log('add_to_calendar');
    if (el.href && /google\.[a-z.]+\/maps/.test(el.href)) return log('maps', decodeURIComponent((el.href.match(/query=([^&]+)/) || [])[1] || '').replace(/\+/g, ' '));
    if (el.matches('[data-full]')) return log('gallery_photo', el.getAttribute('data-full').split('/').pop());
  }, true);

  // wish form: which fields, never what was typed
  const form = document.getElementById('rsvpForm');
  if (form) {
    form.addEventListener('focusin', (e) => { const n = e.target.name; if (n && n !== 'attending') log('rsvp_field', n, true); });
    form.addEventListener('change', (e) => { if (e.target.name === 'attending') log('rsvp_attending', e.target.value); });
    form.addEventListener('submit', () => log('rsvp_submit'));
    const plus = document.querySelector('#guestStepper .plus'), minus = document.querySelector('#guestStepper .minus');
    [plus, minus].forEach((b) => b && b.addEventListener('click', () => log('rsvp_field', 'guests', true)));
  }

  // sections reached (each once per visit)
  const SECTIONS = { home: 'lake', couple: 'couple', events: 'events', gift: 'gift', rsvp: 'wishes' };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { log('view', en.target.dataset.trackName, true); io.unobserve(en.target); }
    }), { threshold: 0.35 });
    Object.entries(SECTIONS).forEach(([id, name]) => { const s = document.getElementById(id); if (s) { s.dataset.trackName = name; io.observe(s); } });
    const closing = document.querySelector('.closing'); if (closing) { closing.dataset.trackName = 'end'; io.observe(closing); }
  }

  // time on page and how far they scrolled, sent when they leave or switch away
  const t0 = Date.now(); let maxScroll = 0;
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0) maxScroll = Math.max(maxScroll, Math.round(scrollY / h * 100));
  }, { passive: true });
  let left = false;
  const leave = () => { if (left) return; left = true; log('leave', Math.round((Date.now() - t0) / 1000) + 's · ' + maxScroll + '%'); flush(); };
  addEventListener('pagehide', leave);
  document.addEventListener('visibilitychange', () => { if (document.hidden) leave(); else left = false; });
})();

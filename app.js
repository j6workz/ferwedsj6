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
  const inv = document.getElementById('inv');
  // Safari fires resize when its toolbar shrinks/grows on scroll (height only). Layout here doesn't depend on that,
  // and re-measuring or re-pinning during a swipe makes the first scroll stutter, so react to width changes only.
  // clientWidth = the layout width: unlike innerWidth it doesn't change when the guest pinch-zooms or iOS zooms
  // into a form field, so zooming never counts as a resize (that used to jump the page back to the lake).
  const layoutW = () => document.documentElement.clientWidth;
  const zoomed = () => !!(window.visualViewport && window.visualViewport.scale > 1.01);   // guest pinch-zoomed in
  const onWidthResize = (fn) => { let w = layoutW(); window.addEventListener('resize', () => { if (layoutW() !== w){ w = layoutW(); fn(); } }); };
  // One continuous column: cover → #bridge (flowers) → #inv. Rest points: the cover at --rw (its runway; see index.html)
  // and the lake at the top of #inv. Opening/closing glides between them; the flowers are never scrolled by hand.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const runway = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rw')) || 0;
  const lakeTop = () => Math.round(inv.getBoundingClientRect().top + window.scrollY);
  const restY = () => (isOpen ? lakeTop() : runway());
  const atRest = () => window.scrollY <= restY() + 2;
  const CLOSE_AT = 0.25;   // a fling/drag this far into the flower band (share of its height) closes the invitation
  // how far (0…1 of the flower band's height) the page has been carried above the lake while open
  const intoBand = () => { const b = document.getElementById('bridge'), c = b && b.querySelector('.in'); return c ? (lakeTop() - window.scrollY) / c.clientHeight : 0; };
  let touching = false, idleT = 0, gliding = 0;
  function glide(to, ms, done, onFrame, easeFn){
    cancelAnimationFrame(gliding);
    const from = window.scrollY, t0 = performance.now(), ease = easeFn || ((u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2));
    if (ms <= 0 || Math.abs(to - from) < 1){ window.scrollTo(0, to); if (onFrame) onFrame(1); if (done) done(); return; }
    (function step(now){
      const u = Math.min(1, (now - t0) / ms, window.__glideFreeze || 1);   // __glideFreeze: diagnostics only (?debug&freeze=)
      window.scrollTo(0, from + (to - from) * ease(u));
      if (onFrame) onFrame(u);
      if (window.__glideFreeze && u >= window.__glideFreeze) return;
      if (u < 1) gliding = requestAnimationFrame(step); else { gliding = 0; if (done) done(); }
    })(t0);
  }
  // Cover showing: pinned to its rest point. Open: Safari runs fling momentum on its own, and moving the page while
  // it runs fights it (jitter). So nothing happens until the scroll has been quiet for 80ms; then a page carried more
  // than 25% into the flower band closes the invitation (the glide carries on upward), and a smaller overshoot snaps
  // back to the lake.
  function settleScroll(){
    if (busy || zoomed()) return;
    const r = restY();
    if (!isOpen){ if (Math.abs(window.scrollY - r) > 1) window.scrollTo(0, r); return; }
    if (touching || window.scrollY >= r - 1) return;
    if (intoBand() > CLOSE_AT) closeCover();                                     // the fling carried it well into the band
    else glide(r, 200, null, null, (u) => 1 - Math.pow(1 - u, 3));             // quick snap: fast start, soft landing
  }
  window.addEventListener('scroll', () => {
    if (!isOpen){ settleScroll(); return; }
    clearTimeout(idleT); idleT = setTimeout(settleScroll, 80);   // act only once the fling has gone quiet: no fighting
  }, { passive: true });
  window.addEventListener('load', settleScroll);
  window.addEventListener('pageshow', settleScroll);
  onWidthResize(() => { if (!busy && !isOpen) window.scrollTo(0, restY()); });   // re-pin only the cover; never yank an open invitation
  // the cover animates in straight away
  requestAnimationFrame(() => setTimeout(() => {
    cover.querySelectorAll('[data-r]').forEach((el) => el.classList.add('in'));
  }, 60));

  // ---------- open / close the cover ----------
  // Open: button, scroll/wheel down, swipe up or ArrowDown/PageDown/Space on the cover.
  // Close (reverse): pull down / wheel up while resting at the top of the invitation.
  const ANIM_MS = reduceMotion ? 50 : 1850;
  const GLIDE_DELAY = reduceMotion ? 0 : 860, GLIDE_MS = reduceMotion ? 0 : 950;   // after the card has peeked out
  let isOpen = false, busy = false, observed = false, hideTimer = 0;
  let atTopSince = performance.now(); // wheel-up only closes after resting at the top, so scroll momentum can't trigger it
  let requestTC = () => {};
  settleScroll();

  // Scroll guard: while the cover animates (and while the wheel/trackpad momentum that opened it
  // is still streaming in) page scrolling is swallowed, so the lake scene is never skipped.
  let guardUntil = 0, lastWheel = 0;

  // ---- floral card: a scaled copy of the flower band (#bridge) living inside the envelope ----
  // Opening: it peeks out of the pocket (CSS), then a full-size copy takes its place on screen and grows onto the band
  // as the band scrolls in; once they coincide the copy is dropped and the real band carries on to the lake.
  const bridge = document.getElementById('bridge'), env = cover.querySelector('.env');
  const FUSE = 0.6;                       // glide progress at which the card sits exactly on the band
  const core = bridge && bridge.querySelector('.in');   // the band itself (#bridge reaches 100px beyond it each way)
  const coreRect = () => { const b = bridge.getBoundingClientRect(), c = core.getBoundingClientRect(); return { left: b.left, top: c.top, width: b.width }; };
  let ecard = null, peekRect = null;
  function floralCard(scale){
    const W = bridge.clientWidth, H = core.clientHeight;
    const outer = document.createElement('div'); outer.className = 'fcard'; outer.setAttribute('aria-hidden', 'true');
    outer.style.width = (W * scale) + 'px'; outer.style.height = (H * scale) + 'px';
    const inner = document.createElement('div'); inner.className = 'fcard-in';
    inner.style.width = W + 'px'; inner.style.height = H + 'px'; inner.style.transform = 'scale(' + scale + ')';
    inner.style.background = 'var(--bridge-bg)';
    inner.appendChild(bridge.querySelector('.floral-fill').cloneNode(true));
    outer.appendChild(inner);
    return outer;
  }
  function buildEnvelopeCard(){
    if (!bridge || !env) return;
    if (ecard) ecard.remove();
    // fit inside the envelope front both ways (the band's aspect varies with the screen), centred, 22px below its top
    const pap = env.querySelector('.paper'), W = bridge.clientWidth, H = core.clientHeight;
    const cw = Math.min(env.clientWidth * 0.86, (pap.offsetHeight - 22 - 14) * W / H);
    ecard = floralCard(cw / W);
    ecard.style.left = ((env.clientWidth - cw) / 2) + 'px';
    ecard.style.setProperty('--peek', -Math.round(parseFloat(ecard.style.height) * 0.38) + 'px');
    env.insertBefore(ecard, env.firstChild);
  }
  buildEnvelopeCard();
  const rebuildCard = () => { if (!busy && !isOpen) buildEnvelopeCard(); };
  onWidthResize(rebuildCard);
  window.addEventListener('load', rebuildCard);                       // envelope height settles once fonts/images are in
  if (document.fonts) document.fonts.ready.then(rebuildCard);
  const lerp = (a, b, t) => a + (b - a) * t, smooth = (t) => t * t * (3 - 2 * t);
  // screen rect → document position (the card scrolls with the page, never fixed). q = 0 in the envelope … 1 on the
  // band: corners straighten and the edges feather out, so the card melts into the identical band underneath.
  function placeCard(card, x, y, w, q){
    const W = bridge.clientWidth, sc = w / W, f = (36 * q / sc).toFixed(1) + 'px';
    card.style.transform = 'translate(' + x + 'px,' + (y + window.scrollY) + 'px) scale(' + sc + ')';
    card.style.borderRadius = (10 * (1 - q) / sc) + 'px';
    const m = 'linear-gradient(90deg,transparent,#000 ' + f + ',#000 calc(100% - ' + f + '),transparent),linear-gradient(180deg,transparent,#000 ' + f + ',#000 calc(100% - ' + f + '),transparent)';
    card.style.webkitMaskImage = m; card.style.maskImage = m;
    card.style.webkitMaskComposite = 'source-in'; card.style.maskComposite = 'intersect';
  }

  function openCover(){
    if (isOpen || busy) return;
    busy = true;
    window.scrollTo(0, runway());
    cover.classList.add('open');                       // flap lifts and folds back; the floral card peeks out
    if (!observed){ observed = true; document.querySelectorAll('#inv [data-r]').forEach((el) => revealer.observe(el)); }
    clearTimeout(hideTimer);
    const done = () => {
      isOpen = true;
      document.body.classList.remove('locked');
      busy = false;
      guardUntil = performance.now() + 450;
      atTopSince = performance.now();
      requestTC();
    };
    hideTimer = setTimeout(() => {
      let card = null;
      if (ecard && bridge && !reduceMotion){
        peekRect = ecard.getBoundingClientRect();
        card = floralCard(1); document.body.appendChild(card);
        card.style.boxShadow = 'none';
        placeCard(card, peekRect.left, peekRect.top, peekRect.width, 0);
        ecard.style.visibility = 'hidden';
        bridge.classList.add('veiled');
      }
      cover.classList.add('sink');                     // only the envelope sinks and fades; the garden scrolls normally
      glide(lakeTop(), GLIDE_MS, () => { if (card) card.remove(); bridge.classList.remove('veiled'); done(); }, (u) => {
        if (!card) return;
        if (u >= FUSE){ bridge.classList.remove('veiled'); card.remove(); card = null; return; }   // on the band now: the real band takes over
        const b = coreRect(), q = smooth(u / FUSE);
        placeCard(card, lerp(peekRect.left, b.left, q), lerp(peekRect.top, b.top, q), lerp(peekRect.width, b.width, q), q);
      });
    }, GLIDE_DELAY);
  }
  function closeCover(){
    if (!isOpen || busy) return;
    busy = true; isOpen = false;
    clearTimeout(hideTimer);
    document.body.classList.add('locked');
    let card = null;
    if (ecard && bridge && peekRect && !reduceMotion){ card = floralCard(1); card.style.visibility = 'hidden'; card.style.boxShadow = 'none'; document.body.appendChild(card); }
    cover.classList.add('unsink'); cover.classList.remove('sink');   // envelope rises and fades back in during the glide
    glide(runway(), GLIDE_MS, () => {
      if (card) card.remove();
      bridge.classList.remove('veiled');
      if (ecard) ecard.style.visibility = '';                          // the card is back, peeking out of the pocket
      cover.classList.remove('unsink');
      hideTimer = setTimeout(() => cover.classList.remove('open'), 90);  // slides into the pocket, flap closes
      setTimeout(() => { busy = false; guardUntil = performance.now() + 450; requestTC(); }, 900);
    }, (u) => {
      if (!card) return;
      const b = coreRect();
      if (u < 1 - FUSE){ card.style.visibility = 'hidden'; bridge.classList.remove('veiled'); return; }  // still the real band
      card.style.visibility = ''; bridge.classList.add('veiled');
      const q = smooth((u - (1 - FUSE)) / FUSE);
      placeCard(card, lerp(b.left, peekRect.left, q), lerp(b.top, peekRect.top, q), lerp(b.width, peekRect.width, q), 1 - q);
    });
  }
  document.getElementById('openBtn').addEventListener('click', openCover);

  window.addEventListener('scroll', () => { if (!atRest()) atTopSince = Infinity; else if (atTopSince === Infinity) atTopSince = performance.now(); }, { passive: true });

  window.addEventListener('wheel', (e) => {
    const now = performance.now();
    const streaming = now - lastWheel < 180; // same gesture / momentum still arriving
    lastWheel = now;
    if (busy || now < guardUntil){
      e.preventDefault();
      if (streaming) guardUntil = Math.max(guardUntil, now + 180);
      return;
    }
    if (!isOpen){ e.preventDefault(); if (e.deltaY > 8) openCover(); return; }
    if (e.deltaY < 0 && atRest()){ e.preventDefault(); if (e.deltaY < -8 && now - atTopSince > 350) closeCover(); }   // never scroll up into the flowers
  }, { passive: false });

  // Touch: at the top of the invitation a pull-down never scrolls; it is only the close gesture.
  let touchY = null, touchAtTop = false;
  window.addEventListener('touchstart', (e) => {
    touching = true;
    touchY = e.touches[0].clientY;
    touchAtTop = atRest();
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (busy){ e.preventDefault(); return; }
    if (touchY === null) return;
    const dy = e.touches[0].clientY - touchY; // >0 = finger moving down (scrolling up)
    if (!isOpen){ e.preventDefault(); if (dy < -40){ touchY = null; openCover(); } }
    else if (touchAtTop && atRest() && dy > 0){ e.preventDefault(); if (dy > 80){ touchY = null; closeCover(); } }
    else if (atRest() && dy > 0 && e.cancelable) e.preventDefault();   // reached the lake's top mid-drag: stop (where Safari allows)
  }, { passive: false });
  const touchDone = () => {
    touchY = null; touching = false; clearTimeout(idleT);
    idleT = setTimeout(settleScroll, 80);   // momentum may follow the finger: decide once the scroll is quiet
  };
  window.addEventListener('touchend', touchDone, { passive: true });
  window.addEventListener('touchcancel', touchDone, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input,textarea,button')) return;
    const scrollKeys = ['ArrowDown', 'PageDown', ' ', 'Enter'];
    if (!isOpen && scrollKeys.includes(e.key)){ e.preventDefault(); openCover(); }
    else if (busy && scrollKeys.includes(e.key)) e.preventDefault();
  });

  // ---------- lake scene geometry ----------
  // The background is cover-fitted (center 30%), so map the picture's water / grass bands to pixels.
  const opening = document.querySelector('.opening');
  const IMG_W = 1024, IMG_H = 1536;
  const WATER = [0.37, 0.578], GROUND = [0.585, 0.94];
  let ground = { top: 0, bottom: 0 };
  function layoutScene(){
    const w = opening.clientWidth, h = opening.clientHeight;
    const s = Math.max(w / IMG_W, h / IMG_H), ih = IMG_H * s, oy = (h - ih) * 0.30;
    const y = (f) => oy + f * ih;
    opening.style.setProperty('--wt', y(WATER[0]).toFixed(0) + 'px');
    opening.style.setProperty('--wb', (h - y(WATER[1])).toFixed(0) + 'px');
    ground = { top: y(GROUND[0]), bottom: Math.min(h * 0.8, y(GROUND[1])), w, h, feet: h * 0.71 }; // below ~80% the scene fades into the dark band
    // rowboat on the right part of the lake (left of it is hidden behind the couple)
    const boat = document.getElementById('boat');
    if (boat){
      // sprite cell 307x229 source px, keel centre at (183.5, 170); ~112px wide on a phone
      const k = Math.min(150, Math.max(104, w * 0.29)) / 307;
      boat.style.width = (307 * k).toFixed(1) + 'px'; boat.style.height = (229 * k).toFixed(1) + 'px';
      boat.style.transform = 'translate(' + (w - 62 - 183.5 * k).toFixed(0) + 'px,' + (y(0.5) - 170 * k).toFixed(0) + 'px)';
    }
  }
  layoutScene();
  onWidthResize(layoutScene);
  // the couple stands in the same depth layer as the petals and cats: sort by the feet line
  const coupleFig = document.getElementById('coupleFig');
  const sortCouple = () => { if (coupleFig) coupleFig.style.zIndex = String(Math.round(ground.feet)); };
  sortCouple(); onWidthResize(sortCouple);

  // ---------- birds: each with its own speed, height, arc, direction and wingbeat ----------
  const birds = document.getElementById('birds');
  if (birds && !reduceMotion){
    const w = birds.getBoundingClientRect().width || 430;
    const rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 5; i++){
      // 4-frame wingbeat strip; some birds flap twice then glide
      const b = document.createElement('span');
      const rtl = Math.random() < 0.35;
      b.className = 'bird' + (rtl ? ' rtl' : '');
      b.innerHTML = '<i class="sw' + (Math.random() < 0.55 ? ' glide' : '') + '"></i>';
      b.style.top = rnd(0, 85).toFixed(0) + '%';
      b.style.width = rnd(16, 32).toFixed(0) + 'px';
      b.style.setProperty('--w', ((rtl ? -1 : 1) * (w + 120)) + 'px');
      ['--a1', '--a2', '--a3'].forEach((v) => b.style.setProperty(v, rnd(-34, 24).toFixed(0) + 'px'));
      b.style.setProperty('--flap', rnd(0.32, 0.5).toFixed(2) + 's');
      b.style.animationDuration = rnd(14, 30).toFixed(1) + 's';
      b.style.animationDelay = (-rnd(0, 30)).toFixed(1) + 's';
      b.style.animationTimingFunction = Math.random() < 0.5 ? 'linear' : 'ease-in-out';
      birds.appendChild(b);
    }
  }

  // ---------- leaves & petals: fall in the lake scene and settle on the grass ----------
  // Depth: pieces landing further back (higher on screen) are smaller, nearer ones larger and on top.
  const fall = document.getElementById('fall');
  if (fall && !reduceMotion && fall.animate){
    const kinds = ['leaf-1', 'leaf-2', 'leaf-3', 'petal-1', 'petal-2', 'petal-1', 'petal-2'].map((n) => 'assets/' + n + '.webp');
    const MAX_ON_GROUND = 60;
    const landed = [];
    const rnd = (a, b) => a + Math.random() * (b - a);

    function piece(){
      const t = Math.pow(Math.random(), 0.75);            // 0 = far, 1 = near
      const y = ground.top + t * (ground.bottom - ground.top);
      const x = rnd(-10, ground.w - 10);
      const el = document.createElement('img');
      el.src = kinds[(Math.random() * kinds.length) | 0]; el.alt = '';
      el.style.width = (9 + t * 20).toFixed(1) + 'px';
      el.style.zIndex = String(Math.round(y));
      el.style.filter = 'brightness(' + (0.8 + t * 0.2).toFixed(2) + ')';
      return { el, x, y, rot: rnd(0, 360) };
    }
    function settle(p){
      landed.push(p);
      if (landed.length > MAX_ON_GROUND){
        const old = landed.shift().el;
        old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1500, fill: 'forwards' }).onfinish = () => old.remove();
      }
    }
    function lie(p){ return 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scaleY(.5) rotate(' + p.rot.toFixed(0) + 'deg)'; }
    // a cat batting a petal: it flips up and lands a little further on
    window.__kickPetal = (p, dir) => {
      if (p.busy) return;
      p.busy = true;
      const from = lie(p);
      p.x = Math.max(0, Math.min(ground.w - 10, p.x + dir * rnd(14, 40)));
      p.y = Math.max(ground.top, Math.min(ground.bottom, p.y + rnd(-10, 10)));
      const r0 = p.rot; p.rot += rnd(120, 300) * dir;
      const mid = 'translate(' + ((p.x + (p.x - dir * 20)) / 2).toFixed(1) + 'px,' + (p.y - rnd(22, 40)).toFixed(1) + 'px) scaleY(1) rotate(' + ((r0 + p.rot) / 2).toFixed(0) + 'deg)';
      p.el.style.zIndex = String(Math.round(p.y));
      const a = p.el.animate([{ transform: from }, { transform: mid, offset: 0.45 }, { transform: lie(p) }], { duration: 750, easing: 'cubic-bezier(.3,.6,.4,1)' });
      a.onfinish = () => { p.el.style.transform = lie(p); p.busy = false; };
    };
    window.__petals = landed;

    // a few already lying on the grass
    for (let i = 0; i < 16; i++){
      const p = piece();
      p.el.style.transform = lie(p);
      fall.appendChild(p.el); settle(p);
    }

    function drop(){
      const p = piece();
      const x0 = p.x + rnd(-80, 80), sw = rnd(18, 46), spin = rnd(160, 520) * (Math.random() < 0.5 ? -1 : 1);
      const at = (fx, fy, r, sy) => 'translate(' + fx.toFixed(1) + 'px,' + fy.toFixed(1) + 'px) scaleY(' + sy + ') rotate(' + r.toFixed(0) + 'deg)';
      fall.appendChild(p.el);
      const a = p.el.animate([
        { transform: at(x0, -40, 0, 1), opacity: 0 },
        { transform: at(x0 + sw, p.y * 0.25, spin * 0.25, 1), opacity: 1, offset: 0.25 },
        { transform: at(x0 - sw, p.y * 0.55, spin * 0.55, 1), offset: 0.55 },
        { transform: at(p.x + sw * 0.5, p.y * 0.85, spin * 0.85, 0.9), offset: 0.85 },
        { transform: at(p.x, p.y, p.rot, 0.5), opacity: 1 }
      ], { duration: rnd(6500, 11000) * (0.6 + 0.4 * p.y / ground.h), easing: 'cubic-bezier(.35,.1,.55,1)', fill: 'forwards' });
      a.onfinish = () => { p.el.style.transform = lie(p); a.cancel(); settle(p); };
    }

    let timer = 0, visible = false;
    const loop = () => { if (visible && !document.hidden) drop(); timer = setTimeout(loop, rnd(700, 1600)); };
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(opening);
    loop();
  }

  // ---------- cats in the lake scene ----------
  // Jessy pounces on the fallen petals around the couple's feet; Yuzu stalks and leaps at a butterfly.
  const actors = document.getElementById('fall');
  if (actors && !reduceMotion){
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    // play band: just around the couple's feet line
    const band = () => ({ top: ground.h * 0.66, bottom: ground.h * 0.785 }); // straddles the couple's feet line (0.71)
    const depth = (y) => { const b = band(); return clamp((y - b.top) / (b.bottom - b.top), 0, 1); };

    // --- sprite-sheet actors: horizontal strips of frames, cw x ch source px each; (ax, ay) = the fixed
    //     anchor inside a cell (feet for cats). Numbers come from the slicer (tools/slice.py). ---
    const SHEETS = {
      run:      { src: 'assets/cat-jessy-run.webp',        n: 4, cw: 361, ch: 203, ax: 186,   ay: 200 },
      pounce:   { src: 'assets/cat-jessy-pounce-set.webp', n: 4, cw: 330, ch: 282, ax: 162,   ay: 278 },
      roll:     { src: 'assets/cat-jessy-roll.webp',       n: 4, cw: 326, ch: 271, ax: 159.5, ay: 267 },
      ySit:     { src: 'assets/cat-yuzu-sit-set.webp',         n: 3, cw: 178, ch: 232, ax: 103.5, ay: 229 },
      yTurn:    { src: 'assets/cat-yuzu-turn.webp',        n: 2, cw: 291, ch: 234, ax: 142.5, ay: 230 },
      yWiggle:  { src: 'assets/cat-yuzu-wiggle.webp',      n: 2, cw: 362, ch: 203, ax: 153,   ay: 200 },
      yLeap:    { src: 'assets/cat-yuzu-leap.webp',        n: 3, cw: 287, ch: 333, ax: 143,   ay: 329 },
      ySwat:    { src: 'assets/cat-yuzu-swat.webp',        n: 2, cw: 240, ch: 336, ax: 119.5, ay: 333 }
    };
    Object.values(SHEETS).forEach((sh) => { const i = new Image(); i.src = sh.src; });
    function makeSprite(pxPerSrc){
      const el = document.createElement('div'); el.className = 'actor sprite';
      actors.appendChild(el);
      return { el, k: pxPerSrc, x: 0, y: 0, dir: 1, lift: 0, v: 0, walked: 0, sheet: null, frame: -1 };
    }
    function show(c, name, frame){
      const sh = SHEETS[name];
      if (c.sheet !== name){ c.sheet = name; c.el.style.backgroundImage = 'url(' + sh.src + ')'; c.el.style.backgroundSize = (sh.n * 100) + '% 100%'; c.frame = -1; }
      if (c.frame !== frame){ c.frame = frame; c.el.style.backgroundPositionX = (frame / (sh.n - 1) * 100) + '%'; }
    }
    // ease the speed toward `want` (px/s): cats speed up and slow down instead of snapping
    function steer(c, tx, ty, maxSp, accel, dt){
      const dx = tx - c.x, dy = ty - c.y, d = Math.hypot(dx, dy);
      const want = Math.min(maxSp, d * 2.4);                 // slow down over the last stretch
      c.v = (c.v || 0) + Math.max(-accel * dt * 1.6, Math.min(accel * dt, want - (c.v || 0)));
      const m = Math.min(d, c.v * dt);
      if (d > 0.01){ c.x += dx / d * m; c.y += dy / d * m; }
      c.walked = (c.walked || 0) + m;
      return d;
    }
    function drawSprite(c){
      const sh = SHEETS[c.sheet], k = c.k * (0.7 + 0.3 * depth(c.y));
      const w = sh.cw * k, h = sh.ch * k;
      c.el.style.width = w.toFixed(1) + 'px'; c.el.style.height = h.toFixed(1) + 'px';
      c.el.style.zIndex = String(Math.round(c.y));
      c.el.style.transformOrigin = (sh.ax * k).toFixed(1) + 'px ' + (sh.ay * k).toFixed(1) + 'px';   // flip/rock around the feet
      c.el.style.transform = 'translate(' + (c.x - sh.ax * k).toFixed(1) + 'px,' + (c.y - sh.ay * k + c.lift).toFixed(1) + 'px) scaleX(' + c.dir + ')' + (c.rot ? ' rotate(' + c.rot.toFixed(2) + 'deg)' : '');
    }

    // --- Jessy & the petals: run → crouch & wiggle → leap → land on the petal (it flips away) → bat it → roll / rest ---
    const jessy = makeSprite(96 / 361);          // run frame ≈ 96px wide when nearest
    jessy.x = ground.w * 0.7; jessy.y = band().bottom - 6;
    const ROLL_SEQ = [0, 1, 2, 1, 2, 3];
    let jDur = 4, jMode = 'rest', jT = 0, jTarget = null, jPetal = null, jRollSeq = 0;
    show(jessy, 'roll', 0);
    function jessyPick(){
      const b = band();
      const near = (window.__petals || []).filter((p) => !p.busy && p.y >= b.top - 6 && p.y <= b.bottom + 6 && Math.abs(p.x - jessy.x) > 30 && Math.abs(p.x - jessy.x) < ground.w * 0.6);
      jPetal = near.length ? near[(Math.random() * near.length) | 0] : null;
      jTarget = jPetal ? { x: jPetal.x, y: clamp(jPetal.y + 4, b.top, b.bottom) } : { x: rnd(ground.w * 0.08, ground.w * 0.92), y: rnd(b.top, b.bottom) };
      jessy.dir = jTarget.x >= jessy.x ? 1 : -1;            // decided once per dash: no flip-flopping on the way
      jessy.v = 0; jMode = 'run'; jT = 0;
    }
    function jessyStep(dt){
      jT += dt;
      jessy.lift = 0;
      switch (jMode){
        case 'run': {
          const s = 0.7 + 0.3 * depth(jessy.y);
          const stopShort = 30 * s;                          // stop a body-length before the petal, then pounce onto it
          const d = steer(jessy, jTarget.x - jessy.dir * stopShort, jTarget.y, 105 * s, 220 * s, dt);
          const f = Math.floor(jessy.walked / (12 * s)) % 4; // one frame per ~12px: legs match the ground speed
          show(jessy, 'run', f);
          jessy.lift = [-2.5, -0.8, 0, -1.2][f] * s * Math.min(1, jessy.v / (80 * s));
          if (d < 3 || (d < 14 && jessy.v < 25 * s)){ jMode = 'crouch'; jT = 0; jDur = rnd(0.45, 0.85); }
          break;
        }
        case 'crouch':   // bum wiggle before the jump
          show(jessy, 'pounce', 0);
          jessy.x += Math.sin(jT * 40) * 0.25;
          if (jT > jDur){ jMode = 'leap'; jT = 0; }
          break;
        case 'leap': {
          show(jessy, 'pounce', 1);
          const u = Math.min(1, jT / 0.32);
          jessy.lift = -Math.sin(Math.PI * u) * 14;
          jessy.x += jessy.dir * 85 * dt;
          if (u >= 1){ jMode = 'land'; jT = 0; if (jPetal && window.__kickPetal) window.__kickPetal(jPetal, jessy.dir); }
          break;
        }
        case 'land':
          show(jessy, 'pounce', 2);
          if (jT > 0.4){ jMode = 'bat'; jT = 0; jDur = rnd(0.7, 1.2); }
          break;
        case 'bat':
          show(jessy, 'pounce', 3);
          if (jT > jDur){
            const r = Math.random();
            if (r < 0.2){ jMode = 'roll'; jT = 0; jRollSeq = 0; }
            else if (r < 0.75){ jMode = 'rest'; jT = 0; jDur = rnd(4, 9); }
            else jessyPick();
          }
          break;
        case 'roll': {
          const i = Math.floor(jT / 0.4);
          if (i >= ROLL_SEQ.length){ jMode = 'rest'; jT = 0; jDur = rnd(4, 9); break; }
          show(jessy, 'roll', ROLL_SEQ[i]);
          break;
        }
        case 'rest':
          show(jessy, 'roll', 3);
          if (jT > jDur) jessyPick();
          break;
      }
    }

    // --- Yuzu (left side of the meadow) ---
    // Walking is a cut-out rig: body + legs swung from hip and shoulder, so the legs truly alternate at any
    // speed (creep / walk / trot). Other moments are posed frames: turn, sit & watch, wiggle, leap, swat.
    const RIG = { bodyW: 307, bodyH: 167, ground: 200.3, ax: 167,
      hind:  { src: 'assets/yuzu-rig-hind.webp',  x: 103.7, y: 137, w: 51, h: 56, px: 25.5, py: 0 },
      front: { src: 'assets/yuzu-rig-front.webp', x: 189.4, y: 137, w: 42, h: 63, px: 15.3, py: 0 } };
    const GAITS = {   // amp = leg swing (deg), duty = share of the cycle a paw is planted, ph = phase per leg
      creep: { amp: 13, duty: 0.66, crouch: 0.86, bob: 0.4, ph: { hn: 0, fn: 0.25, hf: 0.5, ff: 0.75 } },
      walk:  { amp: 17, duty: 0.6,  crouch: 1,    bob: 0.8, ph: { hn: 0, fn: 0.25, hf: 0.5, ff: 0.75 } },
      trot:  { amp: 24, duty: 0.5,  crouch: 1,    bob: 1.6, ph: { hn: 0, ff: 0, fn: 0.5, hf: 0.5 } }
    };
    const yuzu = makeSprite(92 / 307);           // standing body ≈ 92px wide when nearest
    yuzu.x = ground.w * 0.14; yuzu.y = band().top + 12;
    const rig = document.createElement('div'); rig.className = 'actor rig';
    const part = (src, cls) => { const i = document.createElement('img'); i.src = src; i.alt = ''; i.className = cls; rig.appendChild(i); return i; };
    const legs = { hf: part(RIG.hind.src, 'far'), ff: part(RIG.front.src, 'far') };
    const rigBody = part('assets/yuzu-rig-body.webp', 'body');
    legs.hn = part(RIG.hind.src, 'near'); legs.fn = part(RIG.front.src, 'near');
    actors.appendChild(rig);
    let useRig = true, gait = 'walk', cyc = 0, crouchNow = 1;
    const STAND = { hn: 7, hf: -9, fn: -3, ff: 6 };   // resting stance: all four legs visible
    function legPose(p, g){            // stance: paw planted sweeping back; swing: lifted and carried forward
      if (p < g.duty){ const u = p / g.duty; return [g.amp * (1 - 2 * u), 1]; }
      const u = (p - g.duty) / (1 - g.duty), e = 0.5 - 0.5 * Math.cos(Math.PI * u);
      return [-g.amp + 2 * g.amp * e, 1 - 0.16 * Math.sin(Math.PI * u)];
    }
    function drawYuzu(){
      const k = yuzu.k * (0.7 + 0.3 * depth(yuzu.y));
      rig.style.display = useRig ? '' : 'none'; yuzu.el.style.display = useRig ? 'none' : '';
      if (!useRig){ drawSprite(yuzu); return; }
      const g = GAITS[gait], moving = clamp(yuzu.v / (8 * (0.7 + 0.3 * depth(yuzu.y))), 0, 1);   // legs settle as she stops
      crouchNow += ((yuzu.v > 2 ? g.crouch : 1) - crouchNow) * 0.12;
      const sink = RIG.front.h * (1 - crouchNow);                    // crouching lowers the body, legs fold
      const bob = Math.abs(Math.sin(cyc * Math.PI * 2 * (gait === 'trot' ? 1 : 2))) * g.bob * moving;
      rig.style.width = (RIG.bodyW * k).toFixed(1) + 'px'; rig.style.height = (RIG.ground * k).toFixed(1) + 'px';
      rig.style.zIndex = String(Math.round(yuzu.y));
      rig.style.transformOrigin = (RIG.ax * k).toFixed(1) + 'px 0';
      rig.style.transform = 'translate(' + (yuzu.x - RIG.ax * k).toFixed(1) + 'px,' + (yuzu.y - RIG.ground * k + yuzu.lift).toFixed(1) + 'px) scaleX(' + yuzu.dir + ')';
      rigBody.style.width = (RIG.bodyW * k).toFixed(1) + 'px';
      rigBody.style.transform = 'translateY(' + ((sink - bob) * k).toFixed(1) + 'px)';
      for (const id of ['hf', 'ff', 'hn', 'fn']){
        const L = id[0] === 'h' ? RIG.hind : RIG.front, far = id[1] === 'f';
        const [cAng, cLift] = legPose((cyc + g.ph[id]) % 1, g);
        const ang = cAng * moving + STAND[id] * (1 - moving), lift = 1 + (cLift - 1) * moving;
        const el = legs[id];
        el.style.width = (L.w * k).toFixed(1) + 'px';
        el.style.left = ((L.x + (far ? (id[0] === 'h' ? -15 : 14) : 0)) * k).toFixed(1) + 'px';
        el.style.top = ((L.y + sink - bob) * k).toFixed(1) + 'px';
        el.style.transformOrigin = (L.px * k).toFixed(1) + 'px ' + (L.py * k).toFixed(1) + 'px';
        el.style.transform = 'rotate(' + (-ang).toFixed(2) + 'deg) scaleY(' + (crouchNow * lift).toFixed(3) + ')';
      }
    }

    // --- the butterfly she chases: wanders, sometimes hovers low (so she sits, swats or pounces) ---
    const fly = document.createElement('div'); fly.className = 'fly-chase';
    fly.innerHTML = '<i class="wing"></i>'; actors.appendChild(fly);
    const bf = { x: ground.w * 0.3, y: ground.h * 0.56, tx: 0, ty: 0, flee: 0, hover: 0 };
    const bfZone = () => ({ x0: ground.w * 0.04, x1: ground.w * 0.44, y0: ground.h * 0.52, y1: band().top - 8 });
    function bfTarget(far){
      const z = bfZone();
      for (let i = 0; i < 8; i++){
        bf.tx = rnd(z.x0, z.x1); bf.ty = rnd(z.y0, z.y1);
        if (!far || Math.abs(bf.tx - yuzu.x) > 90) break;
      }
    }
    bfTarget(false);
    function butterflyStep(dt){
      if (bf.hover > 0){ bf.hover -= dt; bf.x += Math.sin(performance.now() / 300) * 0.4; bf.y += Math.cos(performance.now() / 410) * 0.3; }
      else {
        const dx = bf.tx - bf.x, dy = bf.ty - bf.y, d = Math.hypot(dx, dy);
        const sp = (bf.flee > 0 ? 110 : 22) * dt; bf.flee -= dt;
        if (d < sp + 2){ if (Math.random() < 0.65) bf.hover = rnd(3, 7); bfTarget(Math.random() < 0.25); }
        else { bf.x += dx / d * sp; bf.y += dy / d * sp + Math.sin(performance.now() / 260) * 0.35; }
      }
      fly.style.zIndex = '2000';
      fly.style.transform = 'translate(' + (bf.x - 10).toFixed(1) + 'px,' + (bf.y - 8).toFixed(1) + 'px)';
    }

    // --- Yuzu's behaviour ---
    let yMode = 'sit', yT = 0, yDur = 6, yCool = 6, yFrame = 0, yStill = 0, ySwats = 0;
    const go = (m, d) => { yMode = m; yT = 0; yDur = d || 0; };
    function yuzuStep(dt){
      const b = band(), s = 0.7 + 0.3 * depth(yuzu.y);
      yT += dt; yCool -= dt; yuzu.lift = 0;
      const dx = bf.x - yuzu.x, adx = Math.abs(dx);
      const alt = (yuzu.y - 46 * s) - bf.y;                  // butterfly height above her head
      const behind = adx > 30 * s && Math.sign(dx) !== yuzu.dir;
      const decide = () => {
        if (behind){ useRig = false; go('turn', 0); return; }
        if (yCool <= 0 && adx < 26 * s && alt < 60 * s && Math.random() < 0.4){ useRig = false; ySwats = 0; go('swat', 0); return; }
        if (yCool <= 0 && adx < 60 * s && alt < 85 * s && Math.random() < 0.6){ useRig = false; go('wiggle', rnd(0.8, 1.3)); return; }
        if (adx > 150 * s){ useRig = true; gait = 'trot'; go('move'); return; }
        if (adx > 75 * s){ useRig = true; gait = 'creep'; go('move'); return; }
        if (yStill > 0.6){ useRig = false; go('sit', rnd(5, 10)); return; }
        useRig = true; go('stand', rnd(0.8, 1.6));
      };
      switch (yMode){
        case 'move': {
          const want = gait === 'trot' ? 74 * s : 26 * s;
          const gx = bf.x - yuzu.dir * 36 * s, gy = clamp(bf.y + ground.h * 0.12, b.top, b.bottom);
          const d = steer(yuzu, gx, gy, want, gait === 'trot' ? 130 * s : 60 * s, dt);
          // advance the leg cycle by distance: one cycle = paw sweep / duty, so paws never skate
          const g = GAITS[gait], k = yuzu.k * s;
          cyc = (cyc + (yuzu.v * dt) / (2 * RIG.front.h * k * Math.sin(g.amp * Math.PI / 180) / g.duty)) % 1;
          yStill = 0;
          if (yT > 0.3 && (behind || (gait === 'creep' && adx < 40 * s) || (gait === 'trot' && adx < 90 * s) || d < 3)) decide();
          break;
        }
        case 'stand':
          yuzu.v = Math.max(0, yuzu.v - 200 * dt); yStill += dt;
          if (yT > yDur) decide();
          break;
        case 'turn': {                                   // side → three-quarter → facing us → (flip) → three-quarter → side
          yuzu.v = 0;
          const seq = [0, 1, 1, 0], i = Math.min(3, Math.floor(yT / 0.13));
          if (i >= 2 && yuzu.dir === Math.sign(dx || 1) * -1) yuzu.dir = -yuzu.dir;
          show(yuzu, 'yTurn', seq[i]);
          if (yT > 0.52){ useRig = true; go('stand', 0.25); }
          break;
        }
        case 'sit':
          yuzu.v = 0;
          if (yT === dt || Math.floor(yT / 1.6) !== Math.floor((yT - dt) / 1.6)) yFrame = Math.random() < 0.6 ? 0 : 1 + ((Math.random() * 2) | 0);   // occasional tail swish
          show(yuzu, 'ySit', yFrame);
          if (behind && yT > 0.6){ go('turn', 0); break; }
          // stays put for a good while; only a butterfly that has wandered off (or dips right in front) gets her up
          if (yT > 2.5 && (adx > 110 * s || (yT > yDur && adx > 75 * s) || (yCool <= 0 && alt < 55 * s && adx < 40 * s))){ yStill = 0; decide(); }
          else if (yT > yDur) yDur = yT + rnd(3, 6);
          break;
        case 'wiggle':
          yuzu.v = 0;
          show(yuzu, 'yWiggle', 0);
          yuzu.rot = Math.sin(yT * Math.PI * 2 * 2.6) * 1.4 * Math.min(1, yT / 0.25);
          if (yT > yDur){ yuzu.rot = 0; go('leap', 0); bf.flee = 0.9; bf.hover = 0; bfTarget(true); }
          break;
        case 'leap': {                                   // launch → stretch → coming down
          const u = Math.min(1, yT / 0.78);
          show(yuzu, 'yLeap', u < 0.28 ? 0 : u < 0.62 ? 1 : 2);
          yuzu.lift = -Math.sin(Math.PI * u) * 34 * s;
          yuzu.x += yuzu.dir * 50 * s * dt;
          if (u >= 1){ go('land', 0); }
          break;
        }
        case 'land':
          show(yuzu, 'yWiggle', 0);
          if (yT > 0.45){ yCool = rnd(9, 16); useRig = false; yuzu.v = 0; go('sit', rnd(6, 10)); }
          break;
        case 'swat':
          yuzu.v = 0;
          show(yuzu, 'ySwat', Math.floor(yT / 0.26) % 2);
          if (Math.floor(yT / 0.52) > ySwats){ ySwats++; if (ySwats === 2){ bf.flee = 0.7; bf.hover = 0; bfTarget(true); } }
          if (ySwats >= 3){ yCool = rnd(9, 16); go('sit', rnd(6, 10)); }
          break;
      }
      yuzu.x = clamp(yuzu.x, 26, ground.w * 0.52);
    }

    // --- the rowboat: KuaCham rows (frames 0-1-2), Creamy now and then lands a fish (frame 3) ---
    // two stacked layers: the new oar position fades in over the old one, so strokes flow instead of snapping
    const boatLayers = [...document.querySelectorAll('#boat .boat-sprite')];
    let bT = 0, bCatch = rnd(20, 32), bCatching = 0, bFrame = 0, bTop = 1, boatHide = 0, bRest = rnd(6, 12), bResting = 0;
    const ROW = [0, 1, 2, 1];                    // blades in → pull → lift out → back
    function setBoatFrame(f){
      if (f === bFrame || boatLayers.length < 2) return;
      bFrame = f;
      const top = boatLayers[bTop], under = boatLayers[1 - bTop];   // top = the upper layer in the DOM
      const prev = top.__f || 0;
      under.style.backgroundPositionX = top.style.backgroundPositionX || '0%';
      under.style.transition = 'none'; under.style.opacity = '1';
      top.style.transition = 'none'; top.style.opacity = '0';
      top.style.backgroundPositionX = (f / 3 * 100) + '%';
      void top.offsetWidth;
      const ms = f === 3 || prev === 3 ? 220 : 380;   // the catch frame differs more: blend it quickly
      top.style.transition = 'opacity ' + ms + 'ms ease-in-out'; top.style.opacity = '1';
      top.__f = f;
      clearTimeout(boatHide);
      boatHide = setTimeout(() => { under.style.transition = 'none'; under.style.opacity = '0'; }, ms + 30);
    }
    function boatStep(dt){
      if (!boatLayers.length) return;
      bT += dt; bCatch -= dt;
      if (bCatching > 0){ bCatching -= dt; setBoatFrame(3); return; }
      if (bCatch <= 0){ bCatching = 3; bCatch = rnd(25, 40); setBoatFrame(3); return; }
      // KuaCham rows a few strokes, then rests the oars for a while
      bRest -= dt;
      if (bResting > 0){ bResting -= dt; setBoatFrame(0); if (bResting <= 0) bT = 0; return; }
      if (bRest <= 0){ bResting = rnd(5, 10); bRest = rnd(8, 14); return; }
      setBoatFrame(ROW[Math.floor(bT / 0.85) % ROW.length]);
    }

    let last = performance.now(), running = false, raf = 0;
    function frame(now){
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      jessyStep(dt); butterflyStep(dt); yuzuStep(dt); boatStep(dt);
      drawSprite(jessy); drawYuzu();
      raf = running ? requestAnimationFrame(frame) : 0;
    }
    useRig = false; show(yuzu, 'ySit', 0); drawSprite(jessy); drawYuzu();
    new IntersectionObserver((es) => {
      running = es[0].isIntersecting;
      if (running && !raf){ last = performance.now(); raf = requestAnimationFrame(frame); }
    }).observe(opening);
  }

  // ---------- RSVP form: guest name from the link, 1–10 guest stepper ----------
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm){
    const nameIn = rsvpForm.querySelector('input[name="name"]');
    if (nameIn && window.nikahGuestName){ nameIn.value = window.nikahGuestName; nameIn.defaultValue = window.nikahGuestName; }   // survives form.reset()
    const st = document.getElementById('guestStepper');
    if (st){
      const inp = st.querySelector('input'), minus = st.querySelector('.minus'), plus = st.querySelector('.plus');
      const set = (v) => { v = Math.max(1, Math.min(10, v)); inp.value = String(v); minus.disabled = v <= 1; plus.disabled = v >= 10; };
      minus.addEventListener('click', () => set(+inp.value - 1));
      plus.addEventListener('click', () => set(+inp.value + 1));
      rsvpForm.addEventListener('reset', () => setTimeout(() => { set(1); st.classList.remove('off'); }, 0));
      rsvpForm.querySelectorAll('input[name="attending"]').forEach((r) => r.addEventListener('change', () => st.classList.toggle('off', r.value === 'no' && r.checked)));
      set(1);
    }
  }

  // ---------- Safari / Android top bar follows what is at the top of the screen ----------
  // (the page already draws under it: viewport-fit=cover; this tints the bar and the overscroll area to match)
  const tcMeta = document.querySelector('meta[name="theme-color"]');
  // lake: average of what's rendered under the status bar at rest (sunset sky + garlands), so Safari's top-edge tint blends in
  const TC = { cover: '#9ba253', bridge: '#889958', lake: '#b89c73', paper: '#f4efe3', deep: '#173628' };
  let tcNow = '';
  // Near the end of the page the canvas turns cream: iOS shows it when you pull past the bottom, and dark green there
  // drew a hard line under the closing flowers. The bar tint (meta) still follows the top of the screen.
  const atEnd = () => window.scrollY + window.innerHeight > document.documentElement.scrollHeight - window.innerHeight * 0.6;
  const setTC = (c) => {
    const bg = atEnd() ? TC.paper : c, key = c + '|' + bg;
    if (key === tcNow) return; tcNow = key;
    if (tcMeta) tcMeta.content = c;
    document.documentElement.style.backgroundColor = bg; document.body.style.backgroundColor = bg;   // Safari 26 samples body at scroll 0
  };
  const topColour = () => {
    if (cover.getBoundingClientRect().bottom > 1) return TC.cover;           // garden at the top of the screen
    if (bridge && bridge.getBoundingClientRect().bottom > 1) return TC.bridge;
    for (const sec of document.querySelectorAll('#inv > section')){
      const r = sec.getBoundingClientRect();
      if (r.top <= 1 && r.bottom > 1){
        if (sec.classList.contains('opening')) return TC.lake;
        if (sec.classList.contains('paper')) return TC.paper;
        const prev = sec.previousElementSibling, next = sec.nextElementSibling;   // dark sections fade to cream at paper neighbours
        if (prev && prev.classList.contains('paper') && -r.top < 110) return TC.paper;
        if (next && next.classList.contains('paper') && r.bottom < 110) return TC.paper;
        return TC.deep;
      }
    }
    return TC.deep;
  };
  let tcRaf = 0;
  const updateTC = () => { cancelAnimationFrame(tcRaf); tcRaf = requestAnimationFrame(() => setTC(topColour())); };
  window.addEventListener('scroll', updateTC, { passive: true });
  new MutationObserver(updateTC).observe(cover, { attributes: true, attributeFilter: ['class', 'style'] });
  requestTC = updateTC;
  updateTC();

  // ---------- whole-pixel sections ----------
  // Sections that end on a fractional pixel leave a faint 1px line where they meet; round each height up.
  const secs = [...document.querySelectorAll('#inv > section')];
  let snapping = 0;
  const snapSections = () => {
    cancelAnimationFrame(snapping);
    snapping = requestAnimationFrame(() => secs.forEach((sec) => {
      sec.style.minHeight = '';
      const h = sec.getBoundingClientRect().height;
      if (Math.abs(h - Math.round(h)) > 0.01) sec.style.minHeight = Math.ceil(h) + 'px';
    }));
  };
  const snapRO = new ResizeObserver(snapSections);
  secs.forEach((sec) => { snapRO.observe(sec); const w = sec.querySelector('.wrap'); if (w) snapRO.observe(w); });
  window.addEventListener('load', snapSections);
  onWidthResize(snapSections);
  if (document.fonts) document.fonts.ready.then(snapSections);
  snapSections();

  // ---------- section background paintings: load when the section comes near ----------
  const ghostIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.style.backgroundImage = 'url(' + e.target.dataset.bg + ')';
    ghostIO.unobserve(e.target);
  }), { rootMargin: '600px 0px' });
  document.querySelectorAll('.ghost[data-bg]').forEach((g) => ghostIO.observe(g));

  // ---------- venue cards: the rose sits just below the picture, beside the title ----------
  const placeRoses = () => document.querySelectorAll('.ev-card').forEach((c) => {
    const pic = c.querySelector('.ev-pic');
    if (pic && pic.offsetHeight) c.style.setProperty('--picH', (pic.offsetTop + pic.offsetHeight - 30) + 'px');
  });
  window.addEventListener('load', placeRoses); onWidthResize(placeRoses);
  document.querySelectorAll('.ev-pic').forEach((i) => i.addEventListener('load', placeRoses));

  // ---------- back to top ----------
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', () => { toTop.classList.toggle('show', isOpen && window.scrollY > lakeTop() + 700); }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: lakeTop(), behavior: 'smooth' }));

  // ---------- countdown ----------
  const target = new Date('2026-11-11T11:00:00+07:00').getTime();
  const ids = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].map((id) => document.getElementById(id));
  // before 11:00 WIB on the day: countdown; rest of the wedding day: "Today's the day!"; afterwards: "Finally official!"
  // (?preview=today or ?preview=done shows those states early)
  const dayEnd = new Date('2026-11-12T00:00:00+07:00').getTime();
  const preview = new URLSearchParams(location.search).get('preview');
  const cdCard = document.querySelector('.cd-card'), cdTitle = cdCard && cdCard.querySelector('.script'), cdAfter = document.getElementById('cdAfter');
  let cdShown = 'count';
  function tick(){
    const now = Date.now();
    const state = preview === 'today' || preview === 'done' ? preview : now < target ? 'count' : now < dayEnd ? 'today' : 'done';
    if (state === 'count'){
      const diff = Math.max(0, target - now);
      const parts = [Math.floor(diff / 86400000), Math.floor(diff % 86400000 / 3600000), Math.floor(diff % 3600000 / 60000), Math.floor(diff % 60000 / 1000)];
      parts.forEach((v, i) => { ids[i].textContent = String(v).padStart(2, '0'); });
      return;
    }
    if (state === cdShown || !cdCard) return;
    cdShown = state;
    cdCard.classList.add('after');
    cdTitle.dataset.i18n = 'countdown.' + state; cdTitle.textContent = window.i18nText(cdTitle.dataset.i18n);   // i18n keys keep it right on ID/EN switch
    cdAfter.dataset.i18n = 'countdown.' + state + 'Sub'; cdAfter.textContent = window.i18nText(cdAfter.dataset.i18n);
  }
  tick(); setInterval(tick, 1000);

  // ---------- add to Google Calendar (11:00–15:00 WIB = 04:00–08:00 UTC) ----------
  const cal = new URL('https://calendar.google.com/calendar/render');
  cal.searchParams.set('action', 'TEMPLATE');
  cal.searchParams.set('text', 'Akad Nikah & Resepsi — Jawahar & Ferina');
  cal.searchParams.set('dates', '20261111T040000Z/20261111T080000Z');
  cal.searchParams.set('location', 'KUA Kecamatan Kemayoran, Jakarta');
  cal.searchParams.set('details', 'Akad Nikah 11:00 WIB · KUA Kecamatan Kemayoran\nResepsi 12:00–15:00 WIB · Ayda Hotel, Mangga Dua, Jakarta\n' + location.href.split('?')[0]);
  document.getElementById('calBtn').href = cal.toString();

  // ---------- copy account number ----------
  document.querySelectorAll('.copy-btn').forEach((btn) => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); } catch (e) { return; }
    const label = btn.querySelector('span'), key = label.dataset.i18n;
    btn.classList.add('done'); label.textContent = window.i18nText('gift.copied');
    setTimeout(() => { btn.classList.remove('done'); label.textContent = window.i18nText(key); }, 1800);
  }));
  // eWallet / UPI cards: flip to the QR; while the QR shows, "Download QR" replaces "Copy"
  document.querySelectorAll('.gift-slide .flip').forEach((flip) => {
    const row = flip.parentElement.querySelector('.btn-row');
    const tgl = row.querySelector('.qr-toggle'), lab = tgl.querySelector('span'), cp = row.querySelector('.copy-btn'), dl = row.querySelector('.dl-btn');
    tgl.addEventListener('click', () => {
      const on = !flip.classList.contains('on');
      flip.classList.toggle('on', on);
      tgl.setAttribute('aria-pressed', String(on));
      lab.dataset.i18n = on ? (tgl.dataset.back || 'gift.showNumber') : 'gift.showQR'; lab.textContent = window.i18nText(lab.dataset.i18n);
      cp.hidden = on; dl.hidden = !on;
    });
  });
  // carousel dots follow the swipe
  const giftTrack = document.getElementById('giftTrack');
  if (giftTrack){
    const dots = [...document.querySelectorAll('.gift-dots i')], slides = [...giftTrack.children];
    giftTrack.addEventListener('scroll', () => {
      const mid = giftTrack.scrollLeft + giftTrack.clientWidth / 2;
      let best = 0, bd = Infinity;
      slides.forEach((sl, i) => { const c = sl.offsetLeft + sl.offsetWidth / 2, d = Math.abs(c - mid); if (d < bd){ bd = d; best = i; } });
      dots.forEach((d, i) => d.classList.toggle('on', i === best));
    }, { passive: true });
  }

  // ---------- lightbox ----------
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  document.querySelectorAll('[data-full]').forEach((el) => {
    el.addEventListener('click', () => { lbImg.src = el.getAttribute('data-full'); lb.classList.add('show'); });
  });
  lb.addEventListener('click', () => lb.classList.remove('show'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.classList.remove('show'); });
})();

/* ---------- background song ----------
   Starts with "open invitation" (a tap, so browsers allow it); #soundBtn toggles it.
   One track per language, all cut to the SAME timeline: switching language swaps the track and carries on from the
   same second. Add a Tamil cut by pointing SONGS.ta at it. */
(function(){
  const audio = document.getElementById('song'), btn = document.getElementById('soundBtn');
  if (!audio || !btn) return;
  const SONGS = { id: 'assets/song.m4a?v=1', en: 'assets/song.m4a?v=1', ta: 'assets/song-ta.m4a?v=1' };
  const VOL = .8, KEY = 'fw-sound';
  let wanted = true, fadeT = 0, cur = '';
  try { wanted = localStorage.getItem(KEY) !== 'off'; } catch(e) {}
  btn.hidden = false;
  const only = audio.getAttribute('data-song');                    // a page can pin one track for every language (/in)
  const srcFor = (lang) => only || SONGS[lang] || SONGS.en;
  const setSrc = (url) => { if (url !== cur) { cur = url; audio.src = url; } };
  setSrc(srcFor(document.documentElement.lang));
  // `on` is the button's own truth. Never read it back from the <audio>: on iPhone `volume` is fixed at 1 and play()
  // resolves late while the file streams in, so guessing from the element made taps do nothing.
  let on = false;
  const show = () => { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); };
  function fadeIn(){                                             // desktop nicety; iPhone ignores volume and just plays
    clearInterval(fadeT);
    try { audio.volume = 0; } catch(e) {}
    if (audio.volume !== 0) { try { audio.volume = VOL; } catch(e) {} return; }
    fadeT = setInterval(() => {
      const v = Math.min(VOL, audio.volume + .05);
      audio.volume = v;
      if (v >= VOL) clearInterval(fadeT);
    }, 40);
  }
  function play(){
    on = true; show();
    audio.muted = false;
    fadeIn();
    const p = audio.play();
    if (p && p.then) p.then(() => { if (!on) audio.pause(); })   // turned off while it was still loading
                      .catch(() => { on = false; show(); });
  }
  function stop(){
    on = false; show();
    clearInterval(fadeT);
    audio.muted = true;                                          // silent at once, on every device
    audio.pause();
  }
  btn.addEventListener('click', () => {
    if (on) { wanted = false; stop(); } else { wanted = true; play(); }
    try { localStorage.setItem(KEY, wanted ? 'on' : 'off'); } catch(e) {}
  });
  const open = document.getElementById('openBtn');
  if (open) open.addEventListener('click', () => { if (wanted && !on) play(); });

  // language switch: same second, other track
  document.addEventListener('nikah:locale', (e) => {
    const url = srcFor(e.detail);
    if (url === cur) return;
    const t = audio.currentTime || 0, playing = on;
    setSrc(url);
    const resume = () => {
      try { audio.currentTime = Math.min(t, (audio.duration || t + 1) - .25); } catch(err) {}
      if (playing && on) audio.play().catch(() => { on = false; show(); });
    };
    if (audio.readyState >= 1) resume(); else audio.addEventListener('loadedmetadata', resume, { once: true });
    if (playing) audio.load();
  });

  document.addEventListener('visibilitychange', () => {                // quiet in a background tab, resume on return
    if (document.hidden) { if (on) audio.pause(); }
    else if (on) audio.play().catch(() => { on = false; show(); });
  });
})();

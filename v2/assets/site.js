/* Solviqo, cinematic scroll site. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;

  /* ---------- helpers ---------- */
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function smoothstep(p, e0, e1) {
    var t = clamp((p - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function rng(seed) {
    var s = seed >>> 0;
    return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  }

  /* ---------- the five static gates, one source of truth ---------- */
  var GATES = [
    '(max-width: 720px)',
    '(orientation: portrait) and (max-width: 1024px)',
    '(orientation: portrait) and (pointer: coarse)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  var MQLS = GATES.map(function (q) { return matchMedia(q); });
  var reducedMQ = matchMedia('(prefers-reduced-motion: reduce)');
  function gated() { return MQLS.some(function (m) { return m.matches; }); }

  /* ---------- hero elements ---------- */
  var hero = doc.getElementById('hero');
  var canvas = doc.getElementById('heroCanvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var hud = doc.getElementById('hud');
  var bandEls = [].slice.call(doc.querySelectorAll('.band'));

  var BANDS = [
    { a: 0.00, b: 0.30, first: true },
    { a: 0.34, b: 0.64 },
    { a: 0.70, b: 1.00, last: true }
  ];
  bandEls.forEach(function (el, i) {
    var d = BANDS[i] || { a: 0, b: 1 };
    el.band = d;
    el._op = -1;
    el._k = -1;
  });

  /* ---------- split text into words and characters ---------- */
  function splitText(el, seed) {
    var text = el.textContent.trim();
    var mode = el.getAttribute('data-split');
    var spread = parseFloat(el.getAttribute('data-spread') || '0.5');
    var rand = rng(seed);
    el.textContent = '';

    var sr = doc.createElement('span');
    sr.className = 'sr';
    sr.textContent = text;
    el.appendChild(sr);

    var vis = doc.createElement('span');
    vis.setAttribute('aria-hidden', 'true');

    var words = text.split(' ');
    var totalChars = text.replace(/ /g, '').length;
    var charIndex = 0;

    words.forEach(function (word, wi) {
      var w = doc.createElement('span');
      w.className = 'w';
      if (mode === 'settle') {
        w.style.setProperty('--th', (wi / Math.max(1, words.length) * 0.5).toFixed(3));
      }
      for (var i = 0; i < word.length; i++) {
        var c = doc.createElement('span');
        c.className = 'c';
        c.textContent = word[i];
        if (mode === 'scatter') {
          c.style.setProperty('--th', (rand() * 0.55).toFixed(3));
          c.style.setProperty('--jx', ((rand() - 0.5) * 120).toFixed(1) + 'px');
          c.style.setProperty('--jy', ((rand() - 0.5) * 90).toFixed(1) + 'px');
          c.style.setProperty('--jr', ((rand() - 0.5) * 50).toFixed(1) + 'deg');
        } else if (mode === 'snap') {
          c.style.setProperty('--th', (charIndex / Math.max(1, totalChars) * spread + rand() * 0.06).toFixed(3));
          c.style.setProperty('--jx', ((rand() < 0.5 ? -1 : 1) * (28 + rand() * 46)).toFixed(1) + 'px');
        }
        charIndex++;
        w.appendChild(c);
      }
      vis.appendChild(w);
      if (wi < words.length - 1) vis.appendChild(doc.createTextNode(' '));
    });
    el.appendChild(vis);
  }
  [].slice.call(doc.querySelectorAll('[data-split]')).forEach(function (el, i) {
    splitText(el, 9781 + i * 137);
  });

  /* ---------- the particle field: noise falling into the lattice ---------- */
  var P = { parts: [], links: [], w: 0, h: 0, dpr: 1, liveIdx: -1 };
  var COLS = 11, ROWS = 6;
  function latticeDims(w) {
    if (w < 560) return { cols: 7, rows: 5 };
    if (w < 900) return { cols: 9, rows: 6 };
    return { cols: 11, rows: 6 };
  }

  function buildField() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    P.dpr = Math.min(2, window.devicePixelRatio || 1);
    P.w = Math.max(1, rect.width);
    P.h = Math.max(1, rect.height);
    canvas.width = Math.round(P.w * P.dpr);
    canvas.height = Math.round(P.h * P.dpr);
    ctx.setTransform(P.dpr, 0, 0, P.dpr, 0, 0);

    var dims = latticeDims(P.w);
    COLS = dims.cols; ROWS = dims.rows;

    var rand = rng(4242);
    var latW = Math.min(P.w * 0.64, 900);
    var latH = Math.min(P.h * 0.42, 420);
    var x0 = (P.w - latW) / 2;
    var y0 = P.h * 0.56 - latH / 2;
    var dx = latW / (COLS - 1);
    var dy = latH / (ROWS - 1);

    P.parts = [];
    P.links = [];

    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var ox = x0 + c * dx;
        var oy = y0 + r * dy;
        var depth = 0.45 + rand() * 0.55;
        P.parts.push({
          node: true, gx: c, gy: r,
          ox: ox, oy: oy,
          cx: P.w * (0.04 + rand() * 0.92),
          cy: P.h * (-0.08 + rand() * 0.92),
          depth: depth,
          size: 1.7 + depth * 1.9,
          ph: rand() * Math.PI * 2,
          dr: 0.25 + rand() * 0.5
        });
      }
    }
    P.liveIdx = (ROWS - 2) * COLS + (COLS - 2);

    var dustN = Math.round(clamp(P.w * P.h / 9000, 60, 190));
    for (var i = 0; i < dustN; i++) {
      var depthD = 0.25 + rand() * 0.75;
      var tx = x0 - dx + rand() * (latW + dx * 2);
      var ty = y0 - dy + rand() * (latH + dy * 2);
      P.parts.push({
        node: false,
        ox: tx, oy: ty,
        cx: P.w * (-0.02 + rand() * 1.04),
        cy: P.h * (-0.12 + rand() * 1.04),
        depth: depthD,
        size: 0.6 + depthD * 1.3,
        ph: rand() * Math.PI * 2,
        dr: 0.2 + rand() * 0.6
      });
    }

    for (var rr = 0; rr < ROWS; rr++) {
      for (var cc = 0; cc < COLS; cc++) {
        var idx = rr * COLS + cc;
        if (cc < COLS - 1) P.links.push([idx, idx + 1]);
        if (rr < ROWS - 1) P.links.push([idx, idx + COLS]);
      }
    }
  }

  var dimFromBands = 0;

  function renderField(p, t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, P.w, P.h);

    var e = p * p * (3 - 2 * p);
    var settle = smoothstep(p, 0.55, 1);
    var breathe = Math.sin(t * 0.0006) * 1.6 * settle;
    var dim = 1 - dimFromBands * 0.34;

    if (settle > 0.02) {
      ctx.lineWidth = 1;
      for (var l = 0; l < P.links.length; l++) {
        var A = P.parts[P.links[l][0]], B = P.parts[P.links[l][1]];
        var ax = A.ox + (A.cx - A.ox) * (1 - e), ay = A.oy + (A.cy - A.oy) * (1 - e) + breathe * A.depth;
        var bx = B.ox + (B.cx - B.ox) * (1 - e), by = B.oy + (B.cy - B.oy) * (1 - e) + breathe * B.depth;
        ctx.strokeStyle = 'rgba(92,107,133,' + (settle * 0.42 * dim).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    for (var i = 0; i < P.parts.length; i++) {
      var q = P.parts[i];
      var drift = (1 - e);
      var px = q.ox + (q.cx - q.ox) * drift + Math.sin(t * 0.00035 * q.dr + q.ph) * 16 * q.depth * drift;
      var py = q.oy + (q.cy - q.oy) * drift + Math.cos(t * 0.0003 * q.dr + q.ph) * 13 * q.depth * drift + breathe * q.depth;
      var alpha = (q.node ? 0.44 + 0.44 * settle : 0.24 + 0.16 * settle) * (0.45 + q.depth * 0.55) * dim;

      if (i === P.liveIdx && settle > 0.05) {
        var pulse = 0.55 + 0.45 * Math.sin(t * 0.0016);
        ctx.fillStyle = 'rgba(232,137,12,' + (settle * (0.55 + pulse * 0.45) * dim).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, q.size * 1.5, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = 'rgba(232,137,12,' + (settle * 0.14 * pulse * dim).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(px, py, q.size * 7, 0, 6.2832);
        ctx.fill();
        continue;
      }

      ctx.fillStyle = 'rgba(191,212,245,' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(px, py, q.size, 0, 6.2832);
      ctx.fill();
    }
  }

  /* ---------- captions ---------- */
  var loadK = 0, loadStart = 0;

  function updateCaptions(p, now) {
    var maxDim = 0;
    for (var i = 0; i < bandEls.length; i++) {
      var el = bandEls[i], d = el.band;
      var f = Math.min(0.02, (d.b - d.a) / 3);
      var inEase = d.first ? 1 : smoothstep(p, d.a, d.a + f);
      var outEase = d.last ? 1 : (1 - smoothstep(p, d.b - f, d.b));
      var op = inEase * outEase;

      var ramp = parseFloat(el.getAttribute('data-ramp') || '0') || Math.min(0.025, (d.b - d.a) * 0.35);
      var k = clamp((p - d.a) / ramp, 0, 1);
      if (d.first) k = Math.max(k, loadK);

      if (Math.abs(op - el._op) > 0.004) {
        el._op = op;
        el.style.opacity = op.toFixed(3);
        el.classList.toggle('live', op > 0.5);
      }
      if (Math.abs(k - el._k) > 0.008) {
        el._k = k;
        el.style.setProperty('--k', k.toFixed(3));
      }
      if (op > maxDim) maxDim = op;
    }
    dimFromBands = maxDim;

    if (hud) {
      var gone = p > 0.05;
      if (gone !== hud._gone) { hud._gone = gone; hud.classList.toggle('gone', gone); }
    }
  }

  /* ---------- the drive loop ---------- */
  var target = 0, shown = 0, rafId = null, lastTick = 0, onScreen = true, armed = false;

  function heroProgress() {
    if (!hero) return 0;
    var range = hero.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return clamp((window.scrollY - hero.offsetTop) / range, 0, 1);
  }

  function tick(now) {
    var dt = Math.min(100, now - (lastTick || now));
    lastTick = now;

    if (loadStart && loadK < 1) {
      loadK = clamp((now - loadStart) / 900, 0, 1);
    }

    var k = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    var settled = Math.abs(target - shown) < 0.0005;
    if (settled) shown = target;

    renderField(shown, now);
    updateCaptions(shown, now);

    var needsMore = !settled || loadK < 1 || onScreen;
    if (needsMore && armed && onScreen) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      lastTick = 0;
    }
  }

  function kick() {
    if (rafId === null && armed && onScreen) { lastTick = 0; rafId = requestAnimationFrame(tick); }
  }
  function onScroll() { target = heroProgress(); kick(); }

  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) kick();
      else if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; lastTick = 0; }
    }, { rootMargin: '10% 0px' }).observe(hero);
  }

  function enableScrub() {
    if (armed) return;
    armed = true;
    html.classList.remove('static-mode');
    buildField();
    bandEls.forEach(function (el) { el._op = -1; el._k = -1; });
    loadStart = performance.now();
    loadK = 0;
    window.addEventListener('scroll', onScroll, { passive: true });
    target = heroProgress();
    shown = target;
    kick();
  }
  function drawStaticLattice() {
    if (!ctx) return;
    requestAnimationFrame(function () {
      dimFromBands = 0.62;
      buildField();
      renderField(1, 0);
    });
  }
  function disableScrub() {
    html.classList.add('static-mode');
    if (armed) {
      armed = false;
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; lastTick = 0; }
    }
    drawStaticLattice();
  }
  function applyHeroMode() { if (gated()) disableScrub(); else enableScrub(); }
  MQLS.forEach(function (m) { m.addEventListener('change', applyHeroMode); });

  var resizeT = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (armed) { buildField(); target = heroProgress(); kick(); }
      else drawStaticLattice();
    }, 160);
  }, { passive: true });

  /* ---------- the fixed environment layer ---------- */
  var envCanvas = doc.getElementById('envCanvas');
  if (envCanvas) {
    var ec = envCanvas.getContext('2d'), motes = [], ew = 0, eh = 0, edpr = 1, envRaf = null;
    function buildEnv() {
      var r = envCanvas.getBoundingClientRect();
      edpr = Math.min(2, window.devicePixelRatio || 1);
      ew = Math.max(1, r.width); eh = Math.max(1, r.height);
      envCanvas.width = Math.round(ew * edpr); envCanvas.height = Math.round(eh * edpr);
      ec.setTransform(edpr, 0, 0, edpr, 0, 0);
      var rand = rng(777), n = Math.round(clamp(ew * eh / 26000, 18, 54));
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({ x: rand() * ew, y: rand() * eh, r: 0.5 + rand() * 1.5, sp: 0.06 + rand() * 0.14, ph: rand() * 6.28 });
      }
    }
    function envTick(now) {
      ec.clearRect(0, 0, ew, eh);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y -= m.sp;
        if (m.y < -4) { m.y = eh + 4; }
        var x = m.x + Math.sin(now * 0.00012 + m.ph) * 18;
        ec.fillStyle = 'rgba(191,212,245,' + (0.10 + Math.sin(now * 0.0004 + m.ph) * 0.05).toFixed(3) + ')';
        ec.beginPath(); ec.arc(x, m.y, m.r, 0, 6.2832); ec.fill();
      }
      envRaf = requestAnimationFrame(envTick);
    }
    function envStart() { if (envRaf === null && !reducedMQ.matches) envRaf = requestAnimationFrame(envTick); }
    function envStop() { if (envRaf !== null) { cancelAnimationFrame(envRaf); envRaf = null; } }
    buildEnv();
    window.addEventListener('resize', function () { clearTimeout(resizeT); setTimeout(buildEnv, 200); }, { passive: true });
    reducedMQ.addEventListener('change', function (e) { if (e.matches) { envStop(); ec.clearRect(0, 0, ew, eh); } else envStart(); });
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) envStop(); else envStart(); });
    envStart();
  }

  /* ---------- section entrances ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        var st = en.target.querySelector('.stagger') || (en.target.classList.contains('stagger') ? en.target : null);
        if (st) setTimeout(function () { st.classList.add('done'); }, 900);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    [].slice.call(doc.querySelectorAll('[data-reveal]')).forEach(function (el) { io.observe(el); });
  }

  /* ---------- self drawing svg ---------- */
  [].slice.call(doc.querySelectorAll('.brk path, .brk line, .divider line')).forEach(function (el) {
    var len = 0;
    try { len = el.getTotalLength ? el.getTotalLength() : 0; } catch (err) { len = 0; }
    if (!len) {
      var x1 = parseFloat(el.getAttribute('x1') || 0), y1 = parseFloat(el.getAttribute('y1') || 0);
      var x2 = parseFloat(el.getAttribute('x2') || 0), y2 = parseFloat(el.getAttribute('y2') || 0);
      len = Math.hypot(x2 - x1, y2 - y1) || 200;
    }
    el.style.setProperty('--len', Math.ceil(len));
  });

  /* ---------- the steps spine ---------- */
  var steps = doc.getElementById('steps');
  if (steps) {
    var spineFill = steps.querySelector('.spine i');
    var stepEls = [].slice.call(steps.querySelectorAll('.step'));
    var lastSp = -1;
    function spineUpdate() {
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var sp = clamp((vh * 0.78 - r.top) / (r.height * 0.92), 0, 1);
      if (Math.abs(sp - lastSp) > 0.01) {
        lastSp = sp;
        if (spineFill) spineFill.style.setProperty('--sp', sp.toFixed(3));
        stepEls.forEach(function (s, i) {
          var lit = sp > (i / stepEls.length) * 0.92;
          if (lit !== s._lit) { s._lit = lit; s.classList.toggle('lit', lit); }
        });
      }
    }
    window.addEventListener('scroll', spineUpdate, { passive: true });
    window.addEventListener('resize', spineUpdate, { passive: true });
    spineUpdate();
  }

  /* ---------- hold to close the gap ---------- */
  var holdBtn = doc.getElementById('holdBtn');
  if (holdBtn) {
    var tl = doc.getElementById('timeline');
    var readEl = doc.getElementById('gapRead');
    var doneEl = doc.getElementById('holdDone');
    var hp = 0, holding = false, holdRaf = null, holdLast = 0, complete = false;
    var lastRead = '', lastReadAt = 0;

    function paint(now, force) {
      tl.style.setProperty('--hp', hp.toFixed(3));
      var days = 3.2 * (1 - hp);
      var txt = hp > 0.985 ? '0.0 SECONDS' : days.toFixed(1) + ' DAYS';
      if (txt !== lastRead && (force || !now || now - lastReadAt > 60)) {
        lastRead = txt;
        lastReadAt = now || 0;
        readEl.textContent = txt;
        readEl.style.color = hp > 0.985 ? 'var(--accent)' : 'var(--text-primary)';
      }
    }
    function finish() {
      if (complete) return;
      complete = true;
      doneEl.classList.add('on');
      holdBtn.textContent = 'Closed';
      holdBtn.setAttribute('aria-pressed', 'true');
    }
    function holdTick(now) {
      var dt = Math.min(64, now - (holdLast || now));
      holdLast = now;
      var dir = holding ? 1 : -1;
      hp = clamp(hp + dir * dt / (holding ? 1500 : 900), 0, 1);
      paint(now, hp >= 1 || hp <= 0);
      if (hp >= 1) { finish(); holdRaf = null; holdLast = 0; return; }
      if (hp <= 0 && !holding) { holdRaf = null; holdLast = 0; return; }
      holdRaf = requestAnimationFrame(holdTick);
    }
    function start(e) {
      if (complete) return;
      e.preventDefault();
      holding = true;
      if (holdRaf === null) { holdLast = 0; holdRaf = requestAnimationFrame(holdTick); }
    }
    function end() {
      holding = false;
      if (!complete && holdRaf === null) { holdLast = 0; holdRaf = requestAnimationFrame(holdTick); }
    }
    holdBtn.addEventListener('pointerdown', start);
    holdBtn.addEventListener('pointerup', end);
    holdBtn.addEventListener('pointerleave', end);
    holdBtn.addEventListener('pointercancel', end);
    holdBtn.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') start(e); });
    holdBtn.addEventListener('keyup', end);

    function pinHold() { hp = 1; paint(0, true); finish(); }
    if (reducedMQ.matches) pinHold();
    reducedMQ.addEventListener('change', function (e) { if (e.matches) pinHold(); });
  }

  /* ---------- the form, mailto ---------- */
  var form = doc.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (doc.getElementById('f-name').value || '').trim();
      var email = (doc.getElementById('f-email').value || '').trim();
      var msg = (doc.getElementById('f-msg').value || '').trim();
      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\nThe workflow costing us most:\n' + msg;
      window.location.href = 'mailto:studio@solviqo.com?subject=' +
        encodeURIComponent('A gap worth closing') + '&body=' + encodeURIComponent(body);
      doc.getElementById('formOk').classList.add('on');
    });
  }

  /* ---------- pause everything on a hidden tab ---------- */
  doc.addEventListener('visibilitychange', function () {
    doc.body.classList.toggle('paused', doc.hidden);
    if (!doc.hidden) kick();
  });

  /* ---------- reduced motion, live, both directions ---------- */
  reducedMQ.addEventListener('change', function () { applyHeroMode(); });

  /* ---------- go ---------- */
  applyHeroMode();
})();

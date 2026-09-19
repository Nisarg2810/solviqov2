/* Solviqo v3, motion system + generated cover art + JSON content. Vanilla JS. */
(function () {
  'use strict';
  var doc = document;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------- nav ---------------- */
  var toggle = doc.getElementById('navToggle');
  var overlay = doc.getElementById('navOverlay');
  if (toggle && overlay) {
    function closeNav() { doc.body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () {
      var open = doc.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ---------------- theme ---------------- */
  var themeBtn = doc.getElementById('themeBtn');
  if (themeBtn) {
    function applyTheme(mode) {
      doc.documentElement.setAttribute('data-theme', mode);
      doc.querySelectorAll('iframe.demo-frame').forEach(function (f) { try { f.contentWindow.postMessage({ demoTheme: mode === 'light' ? 'dark' : 'light' }, '*'); } catch (e) {} });
      themeBtn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
      themeBtn.setAttribute('aria-pressed', mode === 'light' ? 'true' : 'false');
      try { localStorage.setItem('solviqo-theme', mode); } catch (e) {}
      paintCovers();
    }
    themeBtn.addEventListener('click', function () {
      applyTheme(doc.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
    var cur = doc.documentElement.getAttribute('data-theme') || 'dark';
    themeBtn.setAttribute('aria-label', cur === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }

  /* ---------------- reveal + stagger ---------------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.classList.contains('stag')) {
          setTimeout(function () { e.target.classList.add('done'); }, 1100);
        }
        io.unobserve(e.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    doc.querySelectorAll('.rev,.stag').forEach(function (el) { io.observe(el); });
  }

  /* ---------------- tilt + glare ---------------- */
  function bindTilt(el, max) {
    if (reduce.matches) return;
    var glare = el.querySelector('.glare');
    el.addEventListener('pointermove', function (ev) {
      var r = el.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      el.style.transform = 'perspective(900px) rotateY(' + ((px - .5) * max) + 'deg) rotateX(' + ((.5 - py) * max) + 'deg) translateY(-3px)';
      if (glare) { glare.style.setProperty('--gx', (px * 100) + '%'); glare.style.setProperty('--gy', (py * 100) + '%'); glare.style.opacity = '1'; }
    });
    el.addEventListener('pointerleave', function () {
      el.style.transform = '';
      if (glare) glare.style.opacity = '0';
    });
  }
  function armTilt(root) {
    (root || doc).querySelectorAll('[data-tilt]').forEach(function (c) {
      if (c._tilt) return; c._tilt = 1;
      if (!c.querySelector('.glare')) {
        var g = doc.createElement('span'); g.className = 'glare'; c.appendChild(g);
      }
      bindTilt(c, parseFloat(c.getAttribute('data-tilt')) || 8);
    });
  }
  armTilt();

  /* ---------------- counters ---------------- */
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, to = parseFloat(el.dataset.count), dec = (el.dataset.dec !== undefined) ? +el.dataset.dec : 0;
        var pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = null;
        if (reduce.matches) { el.textContent = pre + to.toFixed(dec) + suf; cio.unobserve(el); return; }
        function step(ts) {
          t0 = t0 || ts; var p = Math.min(1, (ts - t0) / 1400); var e2 = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + (to * e2).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step); cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    doc.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------------- steps spine ---------------- */
  var steps = doc.getElementById('steps');
  if (steps) {
    var fill = steps.querySelector('.spine i');
    var stepEls = [].slice.call(steps.querySelectorAll('.step'));
    var lastSp = -1;
    function spine() {
      var r = steps.getBoundingClientRect();
      var sp = Math.max(0, Math.min(1, (innerHeight * 0.76 - r.top) / (r.height * 0.9)));
      if (Math.abs(sp - lastSp) < 0.01) return;
      lastSp = sp;
      if (fill) fill.style.setProperty('--sp', sp.toFixed(3));
      stepEls.forEach(function (s, i) {
        var lit = sp > (i / stepEls.length) * 0.95;
        if (lit !== s._lit) { s._lit = lit; s.classList.toggle('lit', lit); }
      });
    }
    addEventListener('scroll', spine, { passive: true });
    addEventListener('resize', spine, { passive: true });
    spine();
  }

  /* ---------------- hero parallax ---------------- */
  var heroArt = doc.getElementById('heroArt');
  if (heroArt && !reduce.matches) {
    addEventListener('scroll', function () {
      var y = scrollY;
      if (y > innerHeight * 1.2) return;
      heroArt.style.transform = 'translateY(' + (y * 0.07) + 'px)';
    }, { passive: true });
  }

  /* ---------------- custom cursor ---------------- */
  (function () {
    if (!matchMedia('(pointer:fine)').matches) return;
    var cur = doc.createElement('div');
    cur.className = 'cur'; cur.id = 'cur'; cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="cur-ring"></span><span class="cur-dot"></span>';
    doc.body.appendChild(cur);
    doc.documentElement.classList.add('cur-on');
    var ring = cur.querySelector('.cur-ring'), dot = cur.querySelector('.cur-dot');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = null;
    var lag = reduce.matches ? 1 : 0.18;
    function loop() {
      rx += (mx - rx) * lag; ry += (my - ry) * lag;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      if (Math.abs(mx - rx) < 0.1 && Math.abs(my - ry) < 0.1) { raf = null; return; }
      raf = requestAnimationFrame(loop);
    }
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (raf === null) raf = requestAnimationFrame(loop);
      var hot = !!(e.target.closest && e.target.closest('a,button,[data-tilt],input,textarea,.row'));
      if (hot !== cur._hot) { cur._hot = hot; cur.classList.toggle('hot', hot); }
    }, { passive: true });
    addEventListener('mousedown', function () { cur.classList.add('down'); });
    addEventListener('mouseup', function () { cur.classList.remove('down'); });
    addEventListener('pointerleave', function () { cur.style.opacity = '0'; });
    addEventListener('pointerenter', function () { cur.style.opacity = '1'; });
  })();

  /* ---------------- pause on hidden tab ---------------- */
  doc.addEventListener('visibilitychange', function () { doc.body.classList.toggle('paused', doc.hidden); });

  /* ================= generated cover art ================= */
  function seedRng(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
  }
  function kindFor(seed, forced) {
    if (forced !== undefined && forced !== null && forced !== '') return +forced;
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h % 3;
  }
  function drawCover(cv, seed, forcedKind, ratio) {
    var kind = kindFor(seed, forcedKind);
    var dpr = Math.min(2, devicePixelRatio || 1);
    var w = cv.clientWidth || 480;
    var h = Math.round(w / (ratio || (16 / 9)));
    if (!w) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var r = seedRng(seed);

    var g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#121722'); g.addColorStop(1, '#07090F');
    c.fillStyle = g; c.fillRect(0, 0, w, h);

    function bloom(x, y, rad, col, a) {
      var rg = c.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, col.replace('A', a)); rg.addColorStop(1, col.replace('A', 0));
      c.fillStyle = rg; c.fillRect(0, 0, w, h);
    }
    bloom(w * (0.1 + r() * 0.3), h * (0.08 + r() * 0.3), w * 0.72, 'rgba(76,125,255,A)', 0.46);
    bloom(w * (0.58 + r() * 0.34), h * (0.55 + r() * 0.4), w * 0.62, 'rgba(232,137,12,A)', 0.4);

    if (kind === 0) {
      var cols = 10, rows = Math.max(4, Math.round(cols * h / w * 1.15)), pad = w * 0.12;
      var dx = (w - pad * 2) / (cols - 1), dy = (h - pad * 2) / (rows - 1);
      c.strokeStyle = 'rgba(159,170,186,.2)'; c.lineWidth = 1;
      for (var i = 0; i < rows; i++) for (var j = 0; j < cols; j++) {
        var x = pad + j * dx + (r() - .5) * 6, y = pad + i * dy + (r() - .5) * 6;
        if (j < cols - 1) { c.beginPath(); c.moveTo(x, y); c.lineTo(pad + (j + 1) * dx, pad + i * dy); c.stroke(); }
        if (i < rows - 1) { c.beginPath(); c.moveTo(x, y); c.lineTo(pad + j * dx, pad + (i + 1) * dy); c.stroke(); }
        var hot = r() > 0.94;
        c.fillStyle = hot ? '#E8890C' : 'rgba(195,204,217,.72)';
        c.beginPath(); c.arc(x, y, hot ? 3.4 : 1.8, 0, 6.2832); c.fill();
      }
    } else if (kind === 1) {
      for (var k = 0; k < 8; k++) {
        var yy = h * (0.18 + k * 0.094) + (r() - .5) * 10;
        c.beginPath(); c.moveTo(0, yy);
        for (var xx = 0; xx <= w; xx += w / 10) c.lineTo(xx, yy + Math.sin((xx / w) * 3.1 + k) * (5 + k * 2));
        var hot2 = (k === 3);
        c.strokeStyle = hot2 ? 'rgba(232,137,12,.85)' : 'rgba(159,170,186,' + (0.12 + k * 0.04) + ')';
        c.lineWidth = hot2 ? 2.2 : 1; c.stroke();
      }
    } else {
      var cx = w * (0.42 + r() * 0.16), cy = h * (0.5 + (r() - .5) * 0.12);
      for (var o = 0; o < 4; o++) {
        c.beginPath();
        c.ellipse(cx, cy, w * (0.12 + o * 0.085), h * (0.1 + o * 0.06), -0.33 + (r() - .5) * 0.1, 0, 6.2832);
        c.strokeStyle = 'rgba(159,170,186,' + (0.38 - o * 0.07) + ')'; c.lineWidth = o === 1 ? 1.8 : 1; c.stroke();
      }
      var ang = r() * 6.2832;
      var px = cx + Math.cos(ang) * w * 0.21, py = cy + Math.sin(ang) * h * 0.16;
      var pg = c.createRadialGradient(px, py, 0, px, py, 18);
      pg.addColorStop(0, 'rgba(232,137,12,.95)'); pg.addColorStop(1, 'rgba(232,137,12,0)');
      c.fillStyle = pg; c.beginPath(); c.arc(px, py, 18, 0, 6.2832); c.fill();
      c.fillStyle = '#FFC06B'; c.beginPath(); c.arc(px, py, 3.6, 0, 6.2832); c.fill();
    }

    /* the mark, quiet, bottom right */
    var s = Math.max(0.12, w / 2600);
    c.save(); c.translate(w - 240 * s - 22, h - 240 * s - 16); c.scale(s, s); c.lineWidth = 18;
    [[70, 168, -25, 0.62, 'rgba(91,103,121,.85)'], [118, 128, -12, 0.82, 'rgba(159,170,186,.85)'], [172, 72, 2, 1.05, 'rgba(226,232,240,.9)']]
      .forEach(function (p) {
        c.save(); c.translate(p[0], p[1]); c.rotate(p[2] * Math.PI / 180); c.scale(p[3], p[3]);
        c.strokeStyle = p[4]; c.beginPath(); c.moveTo(-27, -30); c.lineTo(28, 0); c.lineTo(-27, 30); c.stroke(); c.restore();
      });
    c.restore();

    var vg = c.createRadialGradient(w / 2, h / 2, h * 0.18, w / 2, h / 2, w * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    c.fillStyle = vg; c.fillRect(0, 0, w, h);

    try {
      var img = c.getImageData(0, 0, cv.width, cv.height), d = img.data;
      for (var q = 0; q < d.length; q += 4) { var n = (Math.random() - .5) * 14; d[q] += n; d[q + 1] += n; d[q + 2] += n; }
      c.putImageData(img, 0, 0);
    } catch (e) { /* tainted canvas cannot happen here, but never break the page for grain */ }
  }
  function parseRatio(str) {
    if (!str) return undefined;
    var m = String(str).split('/');
    var a = parseFloat(m[0]), b = parseFloat(m[1]);
    return (a > 0 && b > 0) ? a / b : undefined;
  }
  function paintCovers(root) {
    (root || doc).querySelectorAll('canvas[data-seed]').forEach(function (cv) {
      drawCover(cv, cv.dataset.seed, cv.dataset.kind, parseRatio(cv.dataset.ratio));
    });
  }
  var coverT = null;
  addEventListener('resize', function () {
    clearTimeout(coverT); coverT = setTimeout(function () { paintCovers(); }, 220);
  }, { passive: true });

  /* ================= JSON content ================= */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    var m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return m[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function slugParam() { return new URLSearchParams(location.search).get('slug'); }
  function hideListChrome() {
    doc.body.classList.add('detail-mode');
    ['listHero', 'listMarq'].forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function postCard(p) {
    return '<a class="card has-cover" data-tilt="6" href="blog.html?slug=' + encodeURIComponent(p.slug) + '">' +
      '<span class="cover"><canvas data-seed="' + esc(p.title) + '"' + (p.art !== undefined ? ' data-kind="' + esc(p.art) + '"' : '') + '></canvas></span>' +
      '<span class="card-body">' +
        '<span class="post-meta"><span class="badge amber">' + esc(p.category) + '</span>' +
        '<span class="post-date">' + fmtDate(p.date) + ' &middot; ' + esc(p.readTime) + '</span></span>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.excerpt) + '</p>' +
        '<span class="card-link">Read the piece ' + ARROW + '</span>' +
      '</span></a>';
  }
  function demoTheme() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; }
  window.solviqoDemoTheme = demoTheme;
  function demoHtml(c) {
    if (!c.demo) return '';
    return '<div class="demo-wrap"><div class="flow-head"><h3>Watch it work</h3><span class="flow-legend">A one minute walkthrough of the real flow, with sample data</span></div>' +
      '<iframe class="demo-frame" src="' + esc(c.demo) + '?v=3&theme=' + demoTheme() + '" title="Walkthrough of ' + esc(c.title) + '" loading="lazy"></iframe></div>';
  }
  document.querySelectorAll('iframe.demo-frame[data-src]').forEach(function (f) { f.src = f.getAttribute('data-src') + '&theme=' + demoTheme(); });
  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.demoH) return;
    document.querySelectorAll('.demo-frame').forEach(function (f) { if (f.contentWindow === e.source) f.style.height = e.data.demoH + 'px'; });
  });
  function flowHtml(c) {
    if (!c.flow || !c.flow.length) return '';
    var nodes = c.flow.map(function (f, i) {
      var cls = 'flow-node' + (f.sys ? ' sys' : '') + (f.d ? ' dec' : '');
      return '<div class="' + cls + '" style="--i:' + i + '">' +
        '<span class="n"><b>' + (i + 1) + '</b>' + (f.sys ? 'AUTOMATIC' : (f.d ? 'DECISION' : '')) + '</span>' +
        '<h4>' + esc(f.s) + '</h4><p>' + esc(f.t) + '</p>' +
        (f.alt ? '<span class="alt">' + esc(f.alt) + '</span>' : '') +
        '<span class="who">' + esc(f.who) + '</span></div>';
    }).join('');
    var ba = (c.before && c.after) ? '<div class="ba">' +
      '<div class="panel before"><h4>Before</h4><ul>' + c.before.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="panel after"><h4>After</h4><ul>' + c.after.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' : '';
    return '<div class="panel flow-wrap"><div class="flow-head"><h3>How the work moves now</h3>' +
      '<div class="flow-legend"><span><i style="background:var(--ink-600)"></i>Team step</span>' +
      '<span><i style="background:var(--signal-500)"></i>Automatic</span>' +
      '<span><i style="background:var(--amber-500)"></i>Decision point</span></div></div>' +
      '<div class="flow">' + nodes + '</div></div>' + ba;
  }
  function caseCard(c) {
    return '<a class="card has-cover" data-tilt="6" href="case-studies.html?slug=' + encodeURIComponent(c.slug) + '">' +
      '<span class="cover"><canvas data-seed="' + esc(c.title) + '"' + (c.art !== undefined ? ' data-kind="' + esc(c.art) + '"' : '') + '></canvas></span>' +
      '<span class="card-body">' +
        '<span class="badge signal">' + esc(c.industry) + '</span>' +
        '<h3>' + esc(c.title) + '</h3>' +
        '<p>' + esc(c.summary) + '</p>' +
        '<span class="case-stats">' + c.stats.map(function (s) {
          return '<span><span class="v">' + esc(s.v) + '</span><span class="l">' + esc(s.l) + '</span></span>';
        }).join('') + '</span>' +
        '<span class="card-link">Read the engagement ' + ARROW + '</span>' +
      '</span></a>';
  }
  function block(b) {
    if (b.type === 'h3') return '<h3>' + esc(b.text) + '</h3>';
    if (b.type === 'quote') return '<blockquote>' + esc(b.text) + '</blockquote>';
    if (b.type === 'list') return '<ul class="post-list">' + b.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
    return '<p>' + esc(b.text) + '</p>';
  }

  function initBlog() {
    var list = doc.getElementById('postList'), detail = doc.getElementById('postDetail');
    if (!list && !detail) return;
    fetch('data/posts.json?v=4').then(function (r) { return r.json(); }).then(function (posts) {
      posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      var slug = slugParam();
      if (slug) {
        hideListChrome();
        var p = posts.find(function (x) { return x.slug === slug; });
        if (list) list.hidden = true;
        if (!detail) return;
        detail.hidden = false;
        if (!p) { detail.innerHTML = '<a class="back-link" href="blog.html">&larr; All articles</a><p>That article moved or never existed.</p>'; return; }
        var rel = posts.filter(function (x) { return x.slug !== p.slug; }).slice(0, 2);
        detail.innerHTML =
          '<a class="back-link" href="blog.html">&larr; All articles</a>' +
          '<div class="cover-wide"><canvas data-seed="' + esc(p.title) + '" data-ratio="21/9"' + (p.art !== undefined ? ' data-kind="' + esc(p.art) + '"' : '') + '></canvas></div>' +
          '<div class="post-head"><span class="badge amber">' + esc(p.category) + '</span>' +
          '<h1 class="chrome-text">' + esc(p.title) + '</h1>' +
          '<p class="post-byline">' + fmtDate(p.date) + ' &middot; ' + esc(p.readTime) + ' &middot; by Solviqo Studio</p></div>' +
          '<div class="post-body">' + p.body.map(block).join('') + '</div>' +
          '<div class="panel pad post-cta"><h3>Have this exact problem?</h3>' +
          '<p style="color:var(--t2);margin-top:10px">Twenty minutes on a call is enough to know if a sprint fixes it.</p>' +
          '<a class="btn btn-primary" style="margin-top:18px" href="contact.html">Book a scoping call<span class="shine"></span></a></div>' +
          (rel.length ? '<div class="related"><div class="kick"><b></b> More from the studio</div><div class="grid2 stag in" style="margin-top:22px">' + rel.map(postCard).join('') + '</div></div>' : '');
      } else {
        if (detail) detail.hidden = true;
        if (list) { list.hidden = false; list.innerHTML = posts.map(postCard).join(''); list.classList.add('in'); }
      }
      paintCovers(); armTilt();
    }).catch(function () {
      if (list) list.innerHTML = '<p style="color:var(--t2)">Articles could not be loaded right now.</p>';
    });
  }

  function initCases() {
    var list = doc.getElementById('caseList'), detail = doc.getElementById('caseDetail');
    if (!list && !detail) return;
    fetch('data/case-studies.json?v=4').then(function (r) { return r.json(); }).then(function (cases) {
      var slug = slugParam();
      if (slug) {
        hideListChrome();
        var c = cases.find(function (x) { return x.slug === slug; });
        if (list) list.hidden = true;
        if (!detail) return;
        detail.hidden = false;
        if (!c) { detail.innerHTML = '<a class="back-link" href="case-studies.html">&larr; All case studies</a><p>That engagement moved or never existed.</p>'; return; }
        detail.innerHTML =
          '<a class="back-link" href="case-studies.html">&larr; All case studies</a>' +
          '<div class="cover-wide"><canvas data-seed="' + esc(c.title) + '" data-ratio="21/9"' + (c.art !== undefined ? ' data-kind="' + esc(c.art) + '"' : '') + '></canvas></div>' +
          '<div class="post-head"><span class="badge signal">' + esc(c.industry) + '</span>' +
          '<h1 class="chrome-text">' + esc(c.title) + '</h1>' +
          '<p class="post-byline">' + c.tags.map(esc).join(' &middot; ') + '</p></div>' +
          '<div class="stats" style="margin:0 0 46px">' + c.stats.map(function (s) {
            return '<div class="stat"><div class="v">' + esc(s.v) + '</div><div class="l">' + esc(s.l) + '</div></div>';
          }).join('') + '</div>' +
          demoHtml(c) + flowHtml(c) +
          '<div class="post-body"><h3>The problem</h3><p>' + esc(c.challenge) + '</p>' +
          '<h3>What we built</h3><p>' + esc(c.approach) + '</p>' +
          '<h3>Where it landed</h3><p>' + esc(c.outcome) + '</p></div>' +
          '<div class="panel pad post-cta"><h3>Running the same operation?</h3>' +
          '<p style="color:var(--t2);margin-top:10px">Tell us what it actually looks like and we will tell you, honestly, if a sprint fixes it.</p>' +
          '<a class="btn btn-primary" style="margin-top:18px" href="contact.html">Book a scoping call<span class="shine"></span></a></div>';
      } else {
        if (detail) detail.hidden = true;
        if (list) { list.hidden = false; list.innerHTML = cases.map(caseCard).join(''); list.classList.add('in'); }
      }
      paintCovers(); armTilt();
    }).catch(function () {
      if (list) list.innerHTML = '<p style="color:var(--t2)">Case studies could not be loaded right now.</p>';
    });
  }

  function initHomeTeasers() {
    var pt = doc.getElementById('homePosts'), ct = doc.getElementById('homeCases');
    if (pt) fetch('data/posts.json?v=4').then(function (r) { return r.json(); }).then(function (p) {
      p.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      pt.innerHTML = p.slice(0, 2).map(postCard).join(''); pt.classList.add('in'); paintCovers(pt); armTilt(pt);
    }).catch(function () {});
    if (ct) fetch('data/case-studies.json?v=4').then(function (r) { return r.json(); }).then(function (c) {
      ct.innerHTML = c.slice(0, 2).map(caseCard).join(''); ct.classList.add('in'); paintCovers(ct); armTilt(ct);
    }).catch(function () {});
  }

  /* ---------------- contact form ---------------- */
  var form = doc.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = (doc.getElementById('f-name') || {}).value || '';
      var em = (doc.getElementById('f-email') || {}).value || '';
      var m = (doc.getElementById('f-msg') || {}).value || '';
      var body = 'Name: ' + n + '\nEmail: ' + em + '\n\nThe workflow costing us most:\n' + m;
      location.href = 'mailto:studio@solviqo.com?subject=' + encodeURIComponent('A gap worth closing') + '&body=' + encodeURIComponent(body);
      var ok = doc.getElementById('formOk'); if (ok) ok.classList.add('on');
    });
  }

  function boot() { paintCovers(); initBlog(); initCases(); initHomeTeasers(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

/* first-visit loader: logo draws, bar fills, then the page is revealed (about 1.2s, never more than 1.8s) */
(function () {
  var h = document.documentElement, done = false;
  if (!h.classList.contains('is-loading')) return;
  function finish() {
    if (done) return; done = true;
    setTimeout(function () {
      h.classList.add('ld-done');
      setTimeout(function () {
        h.classList.add('ld-out');
        try { sessionStorage.setItem('sv-seen', '1'); } catch (e) {}
        setTimeout(function () { h.classList.remove('is-loading', 'ld-done', 'ld-out'); }, 650);
      }, 300);
    }, Math.max(0, 1050 - performance.now()));
  }
  if (document.readyState === 'complete') finish();
  else { window.addEventListener('load', finish); setTimeout(finish, 1500); }
})();

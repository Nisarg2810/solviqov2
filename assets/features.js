/* Solviqo experience layer: hero motion, split headlines, estimator,
   now building strip, case previews, magnetic buttons, command palette. */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer:fine)').matches;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  var MASCOT = html.getAttribute('data-mascot') !== 'off';
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }


  /* ---------- pinned story: chapter follows scroll ---------- */
  var story = doc.getElementById('story');
  if (story) {
    var track = story.querySelector('.story-track'), chs = story.querySelectorAll('.story-ch li'), prog = story.querySelector('.story-prog');
    var cur = -1, CALL = ['A request is being typed in', 'Approved in one tap on the phone', 'Tasks tick off as work gets done', 'Live numbers, no report needed'];
    function onStory() {
      var r = track.getBoundingClientRect(), total = r.height - innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / total));
      prog.style.setProperty('--p', p);
      var c = Math.min(3, Math.floor(p * 4));
      if (c !== cur) {
        cur = c; story.setAttribute('data-c', c);
        chs.forEach(function (li, i) { li.classList.toggle('on', i === c); });
        var n = story.querySelector('.sg-n'); if (n) n.textContent = '0' + (c + 1);
        var co = story.querySelector('.sg-call'); if (co) { co.classList.remove('in'); void co.offsetWidth; co.textContent = CALL[c]; co.classList.add('in'); }
      }
      story.classList.toggle('done', p > .97);
    }
    addEventListener('scroll', onStory, { passive: true }); addEventListener('resize', onStory); onStory();
  }

  /* ---------- about: week by week ---------- */
  var weeks = doc.querySelector('.weeks');
  if (weeks && 'IntersectionObserver' in window) {
    var wl = weeks.querySelectorAll('.wk-list li');
    var wio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var w = e.target.getAttribute('data-w');
        weeks.setAttribute('data-w', w);
        wl.forEach(function (li) { li.classList.toggle('on', li === e.target); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    wl.forEach(function (li) { wio.observe(li); });
    weeks.setAttribute('data-w', '0'); wl[0].classList.add('on');
  }

  /* ---------- 2. hero that follows the cursor ---------- */
  var art = doc.getElementById('heroArt');
  if (art && !reduce) {
    var cv = doc.createElement('canvas'); cv.className = 'hero-dust'; art.appendChild(cv);
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1);
    var mx = 0, my = 0, tx = 0, ty = 0;
    var dots = []; for (var i = 0; i < 46; i++) dots.push({ r: 90 + Math.random() * 150, a: Math.random() * 6.283, s: (Math.random() * .5 + .15) * (Math.random() < .5 ? -1 : 1) * .004, z: Math.random(), amber: Math.random() < .25 });
    function size() { var r = art.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; }
    size(); addEventListener('resize', size);
    if (fine) addEventListener('mousemove', function (e) { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; });
    var mark = art.querySelector('.hero-mark'), r1 = art.querySelector('.r1'), r2 = art.querySelector('.r2'), halo = art.querySelector('.halo');
    (function tick() {
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      if (scrollY < innerHeight * 1.3) {
        if (mark) mark.style.transform = 'perspective(700px) rotateY(' + (mx * 16) + 'deg) rotateX(' + (-my * 14) + 'deg) translate(' + (mx * 8) + 'px,' + (my * 8) + 'px)';
        if (r1) r1.style.translate = (mx * 14) + 'px ' + (my * 14) + 'px';
        if (r2) r2.style.translate = (mx * -18) + 'px ' + (my * -18) + 'px';
        if (halo) halo.style.translate = (mx * 26) + 'px ' + (my * 26) + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        var light = html.getAttribute('data-theme') === 'light';
        dots.forEach(function (d) {
          d.a += d.s;
          var x = W / 2 + Math.cos(d.a) * d.r + mx * 30 * d.z, y = H / 2 + Math.sin(d.a) * d.r * .92 + my * 30 * d.z;
          ctx.beginPath(); ctx.arc(x, y, .7 + d.z * 1.4, 0, 6.283);
          ctx.fillStyle = d.amber ? 'rgba(232,137,12,' + (.35 + d.z * .5) + ')' : (light ? 'rgba(40,52,74,' : 'rgba(191,212,245,') + (.15 + d.z * .4) + ')';
          ctx.fill();
        });
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- 3. headlines that assemble word by word ---------- */
  doc.querySelectorAll('.sec-h h2, main h1, .panel h2').forEach(function (h) {
    if (h.closest('#postDetail,#caseDetail') || h.dataset.split) return;
    h.dataset.split = '1';
    var chrome = h.classList.contains('chrome-text');
    var words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map(function (w, i) {
      return '<span class="w"><span' + (chrome ? ' class="chrome-text"' : '') + ' style="--i:' + i + '">' + esc(w) + '</span></span>';
    }).join(' ');
    if (chrome) h.classList.remove('chrome-text');
    h.classList.add('split');
    h.setAttribute('aria-label', words.join(' '));
  });

  /* ---------- 4. build estimator ---------- */
  var est = doc.getElementById('estimator');
  if (est) {
    var KINDS = [['web', 'Web app', 4], ['tool', 'Internal tool', 2.5], ['integ', 'Integration', 2], ['dash', 'Dashboard', 1.2]];
    var ADDS = [['appr', 'Approvals and sign offs', .8], ['alert', 'Alerts and reminders', .4], ['pay', 'Payments', 1], ['rep', 'Reports and charts', .8], ['files', 'Photos and file uploads', .4], ['mobile', 'Works great on phones', 0, true]];
    var st = { kind: 'tool', users: 3, sys: 1, add: { mobile: true } };
    est.innerHTML =
      '<div class="est-l panel pad">' +
        '<span class="kick"><b></b> What are you building?</span>' +
        '<div class="est-seg">' + KINDS.map(function (k) { return '<button type="button" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join('') + '</div>' +
        '<label class="est-r"><span>Kinds of users <b id="eU"></b></span><input type="range" min="1" max="8" value="3" id="eUsers"></label>' +
        '<label class="est-r"><span>Systems to connect <b id="eS"></b></span><input type="range" min="0" max="6" value="1" id="eSys"></label>' +
        '<span class="kick" style="margin-top:26px;display:flex"><b></b> Features</span>' +
        '<div class="est-chips">' + ADDS.map(function (a) { return '<button type="button" data-a="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>' +
      '</div>' +
      '<div class="est-r-card panel pad">' +
        '<span class="kick"><b></b> Your estimate</span>' +
        '<div class="est-num"><span id="eLo">0</span><em>to</em><span id="eHi">0</span><small>weeks</small></div>' +
        '<div class="est-tl" id="eTl"></div>' +
        (MASCOT ? '<div class="est-oti" id="eOti"><img src="assets/oti/otter-3d.png" alt="" width="52" height="52"><span></span></div>' : '') +
        '<ul class="ticks" id="eInc"></ul>' +
        '<a class="btn btn-primary" id="eCta" href="contact.html" style="margin-top:26px;width:100%">Book a call with this estimate<span class="shine"></span></a>' +
        '<p class="est-note">A rough guide, not a quote. We fix the price after a short scoping call.</p>' +
      '</div>';
    var shown = { lo: 0, hi: 0 };
    function animNum(el, from, to) {
      var t0 = performance.now();
      (function f(t) { var p = Math.min(1, (t - t0) / 450); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
    }
    function calc() {
      var base = KINDS.filter(function (k) { return k[0] === st.kind; })[0][2];
      var t = base + Math.max(0, st.users - 2) * .35 + st.sys * .6;
      ADDS.forEach(function (a) { if (st.add[a[0]]) t += a[2]; });
      var lo = Math.max(1, Math.round(t)), hi = Math.max(lo + 1, Math.round(t * 1.35));
      est.querySelectorAll('.est-seg button').forEach(function (b) { b.classList.toggle('on', b.dataset.k === st.kind); });
      est.querySelectorAll('.est-chips button').forEach(function (b) { b.classList.toggle('on', !!st.add[b.dataset.a]); });
      doc.getElementById('eU').textContent = st.users; doc.getElementById('eS').textContent = st.sys;
      animNum(doc.getElementById('eLo'), shown.lo, lo); animNum(doc.getElementById('eHi'), shown.hi, hi); shown = { lo: lo, hi: hi };
      var parts = [['Scope', .12], ['Design', .23], ['Build', .5], ['Launch', .15]];
      doc.getElementById('eTl').innerHTML = parts.map(function (p) { return '<span style="flex:' + p[1] + '"><i></i>' + p[0] + '</span>'; }).join('');
      var inc = [KINDS.filter(function (k) { return k[0] === st.kind; })[0][1] + ' for ' + st.users + ' kind' + (st.users > 1 ? 's' : '') + ' of user'];
      if (st.sys) inc.push('Connected to ' + st.sys + ' system' + (st.sys > 1 ? 's' : '') + ' you already use');
      ADDS.forEach(function (a) { if (st.add[a[0]]) inc.push(a[1]); });
      inc.push('Documentation and handover');
      doc.getElementById('eInc').innerHTML = inc.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      var say = hi <= 3 ? 'Quick one! A small, focused build.' : hi <= 6 ? 'Nice. That is a solid first release.' : hi <= 9 ? 'A proper build. Worth every week.' : 'Big plans! We would ship it in stages.';
      var ot = doc.getElementById('eOti'); if (ot) { ot.querySelector('span').textContent = say; ot.classList.remove('pop'); void ot.offsetWidth; ot.classList.add('pop'); }
    }
    est.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) st.kind = b.dataset.k;
      if (b.dataset.a) st.add[b.dataset.a] = !st.add[b.dataset.a];
      calc();
    });
    doc.getElementById('eUsers').addEventListener('input', function (e) { st.users = +e.target.value; calc(); });
    doc.getElementById('eSys').addEventListener('input', function (e) { st.sys = +e.target.value; calc(); });
    calc();
  }

  /* ---------- 5. now building card (edit NOW to change what it shows; art: road, pulse, sync) ---------- */
  var NOW = [
    ['An approvals app for a logistics team', 'Logistics', 2, 4, 'road'],
    ['A customer portal for a clinic group', 'Healthcare', 3, 6, 'pulse'],
    ['An ERP and CRM sync for a distributor', 'Distribution', 1, 3, 'sync']
  ];
  var ART = {
    road: '<svg viewBox="0 0 200 110"><path class="nw-road" d="M-10 86 H210"/><path class="nw-dash" d="M-10 86 H210"/>' +
      '<g class="nw-truck"><rect x="70" y="50" width="46" height="26" rx="4" class="nw-a"/><path d="M116 58h14l10 10v8h-24z" class="nw-s"/><circle cx="82" cy="80" r="6" class="nw-w"/><circle cx="128" cy="80" r="6" class="nw-w"/></g>' +
      '<g class="nw-pin"><path d="M146 30c-7 0-12 5-12 11 0 9 12 20 12 20s12-11 12-20c0-6-5-11-12-11z" class="nw-a"/><circle cx="146" cy="41" r="4" class="nw-bg"/></g>' +
      '<path class="nw-route" d="M24 44 Q 80 14 134 40"/></svg>',
    pulse: '<svg viewBox="0 0 200 110"><rect x="18" y="22" width="40" height="40" rx="10" class="nw-s"/><path d="M38 32v20M28 42h20" class="nw-cross"/>' +
      '<path class="nw-ecg" pathLength="100" d="M70 60 H100 L108 44 L116 76 L124 30 L132 60 H190"/>' +
      '<rect x="70" y="84" width="60" height="6" rx="3" class="nw-s"/><rect x="138" y="84" width="40" height="6" rx="3" class="nw-a nw-blink"/></svg>',
    sync: '<svg viewBox="0 0 200 110"><rect x="14" y="30" width="54" height="50" rx="12" class="nw-s"/><text x="41" y="60" class="nw-tx">ERP</text>' +
      '<rect x="132" y="30" width="54" height="50" rx="12" class="nw-s"/><text x="159" y="60" class="nw-tx">CRM</text>' +
      '<path d="M72 46 H128 M128 64 H72" class="nw-link"/>' +
      '<circle r="4" class="nw-a"><animateMotion dur="1.6s" repeatCount="indefinite" path="M72 46 H128"/></circle>' +
      '<circle r="4" class="nw-g"><animateMotion dur="1.6s" begin=".8s" repeatCount="indefinite" path="M128 64 H72"/></circle></svg>'
  };
  var closed = false; try { closed = sessionStorage.getItem('sv-now-x') === '1'; } catch (x) {}
  if (!closed && NOW.length) {
    var nb = doc.createElement('aside'); nb.className = 'nowcard'; nb.setAttribute('aria-label', 'What we are building now');
    nb.innerHTML = '<button type="button" class="nw-x" aria-label="Hide">&times;</button><div class="nw-art" id="nwArt"></div>' +
      '<div class="nw-body"><span class="nw-k"><i></i>Now building</span><p class="nw-t" id="nwT"></p>' +
      '<div class="nw-wk"><span id="nwW"></span><span class="nw-bar"><i id="nwB"></i></span></div></div>';
    doc.body.appendChild(nb);
    var ni = 0;
    function showNow() {
      nb.classList.remove('in');
      setTimeout(function () {
        var it = NOW[ni];
        doc.getElementById('nwArt').innerHTML = ART[it[4]] || '';
        doc.getElementById('nwT').textContent = it[0];
        doc.getElementById('nwW').textContent = it[1] + ' · Week ' + it[2] + ' of ' + it[3];
        doc.getElementById('nwB').style.width = (it[2] / it[3] * 100) + '%';
        nb.classList.add('in'); ni = (ni + 1) % NOW.length;
      }, 300);
    }
    showNow(); var nTimer = setInterval(showNow, 5500);
    var small = matchMedia('(max-width:620px)').matches;
    function reveal() { nb.classList.add('show'); }
    var onS = function () { if (scrollY > innerHeight * (small ? .7 : .55)) { reveal(); removeEventListener('scroll', onS); } };
    addEventListener('scroll', onS, { passive: true }); onS();
    nb.querySelector('.nw-x').onclick = function () { nb.classList.remove('show'); clearInterval(nTimer); try { sessionStorage.setItem('sv-now-x', '1'); } catch (x) {} };
  }


  /* ---------- Oti, the helper ---------- */
  (function () {
    if (!MASCOT) return;
    var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
    var HI = {
      index: 'Hi, I am Oti! Want a rough timeline for your idea?',
      services: 'Try the estimator below. It takes ten seconds.',
      'case-studies': 'Every one of these went live in four weeks or less.',
      about: 'Nice to meet you. I keep things calm around here.',
      blog: 'Grab a coffee. These are short, I promise.',
      contact: 'Pick a time that suits you. I will let Nisarg know.',
      kiki: 'Hey, that is my cousin Kiki.', oti: 'That is me! Hello!'
    };
    var w = doc.createElement('div'); w.className = 'oti-help';
    w.innerHTML = '<div class="oh-panel" role="dialog" aria-label="Oti can help">' +
      '<p class="oh-say"></p>' +
      '<a href="services.html#estimate">Estimate my build</a><a href="case-studies.html">See work we shipped</a><a href="contact.html">Book a 20 minute call</a>' +
      '</div><button type="button" class="oh-btn" aria-label="Ask Oti"><img src="assets/oti/otter-3d.png" alt="" width="64" height="64"><i></i></button>';
    doc.body.appendChild(w);
    var say = w.querySelector('.oh-say'), btn = w.querySelector('.oh-btn');
    say.textContent = HI[page] || HI.index;
    function open(v) { w.classList.toggle('open', v); }
    btn.addEventListener('click', function () { open(!w.classList.contains('open')); w.classList.add('seen'); });
    doc.addEventListener('click', function (e) { if (!w.contains(e.target)) open(false); });
    var greeted = false; try { greeted = sessionStorage.getItem('sv-oti') === '1'; } catch (x) {}
    setTimeout(function () { w.classList.add('show'); }, html.classList.contains('is-loading') ? 1700 : 600);
    if (!greeted) setTimeout(function () {
      w.classList.add('wave'); open(true);
      try { sessionStorage.setItem('sv-oti', '1'); } catch (x) {}
      setTimeout(function () { if (!w.matches(':hover')) open(false); w.classList.remove('wave'); }, 6500);
    }, 4200);
  })();

  /* ---------- 6. case cards play their demo on hover ---------- */
  if (fine) {
    var DEMO = null, START = { gvm: 12, fms: 26, moms: 26, fleet: 40 };
    function demoFor(slug, cb) {
      if (DEMO) return cb(DEMO[slug]);
      fetch('data/case-studies.json?v=4').then(function (r) { return r.json(); }).then(function (d) { DEMO = {}; d.forEach(function (c) { DEMO[c.slug] = c.demo; }); cb(DEMO[slug]); }).catch(function () {});
    }
    doc.addEventListener('mouseover', function (e) {
      var card = e.target.closest && e.target.closest('a.card.has-cover[href*="case-studies.html?slug="]');
      if (!card || card.dataset.pv) return;
      var cover = card.querySelector('.cover'); if (!cover) return;
      card.dataset.pv = '1';
      var slug = decodeURIComponent(card.getAttribute('href').split('slug=')[1] || '');
      demoFor(slug, function (src) {
        if (!src || !card.matches(':hover')) { delete card.dataset.pv; return; }
        var id = src.replace(/^.*\/|\.html$/g, '');
        var f = doc.createElement('iframe'); f.className = 'cover-demo'; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
        f.src = src + '?v=3&mini=1&start=' + (START[id] || 10) + '&theme=' + (html.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
        f.onload = function () { f.classList.add('in'); };
        cover.appendChild(f);
        card.addEventListener('mouseleave', function out() {
          card.removeEventListener('mouseleave', out);
          f.classList.remove('in'); setTimeout(function () { f.remove(); delete card.dataset.pv; }, 350);
        });
      });
    });
  }

  /* ---------- 7. magnetic buttons ---------- */
  if (fine && !reduce) {
    doc.addEventListener('mousemove', function (e) {
      var b = e.target.closest && e.target.closest('.btn-primary,.btn-ghost,.theme-btn,.cmdk-btn');
      doc.querySelectorAll('.mag').forEach(function (m) { if (m !== b) { m.classList.remove('mag'); m.style.translate = ''; } });
      if (!b || b.closest('.nav-overlay')) return;
      var r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.classList.add('mag');
      b.style.translate = (dx * .22) + 'px ' + (dy * .3) + 'px';
      b.style.setProperty('--gx', (e.clientX - r.left) + 'px'); b.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- 8. command palette ---------- */
  var ITEMS = [
    ['Page', 'Home', 'index.html'], ['Page', 'About', 'about.html'], ['Page', 'Services', 'services.html'],
    ['Page', 'Case studies', 'case-studies.html'], ['Page', 'Blog', 'blog.html'], ['Page', 'Contact', 'contact.html'],
    ['Service', 'Web Apps', 'services.html#web-apps'], ['Service', 'Internal Tools', 'services.html#internal-tools'],
    ['Service', 'Integrations', 'services.html#integrations'], ['Service', 'Dashboards', 'services.html#dashboards'],
    ['Service', 'Estimate your build', 'services.html#estimate'],
    ['Action', 'Book a call', 'contact.html'], ['Action', 'Email studio@solviqo.com', 'mailto:studio@solviqo.com'],
    ['Action', 'Switch light or dark mode', '#theme']
  ];
  var loaded = false;
  function loadMore() {
    if (loaded) return; loaded = true;
    Promise.all([fetch('data/case-studies.json?v=4').then(function (r) { return r.json(); }), fetch('data/posts.json?v=4').then(function (r) { return r.json(); })])
      .then(function (d) {
        d[0].forEach(function (c) { ITEMS.push(['Case study', c.title, 'case-studies.html?slug=' + c.slug, c.industry + ' ' + (c.tags || []).join(' ') + ' ' + c.slug.replace(/-/g, ' ')]); });
        d[1].forEach(function (p) { ITEMS.push(['Article', p.title, 'blog.html?slug=' + p.slug]); });
        if (pal.classList.contains('open')) render();
      }).catch(function () {});
  }
  var pal = doc.createElement('div'); pal.className = 'cmdk'; pal.setAttribute('role', 'dialog'); pal.setAttribute('aria-label', 'Search the site');
  pal.innerHTML = '<div class="cmdk-box"><div class="cmdk-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
    '<input id="cmdkQ" type="text" placeholder="Search pages, services, case studies..." autocomplete="off" spellcheck="false"><kbd>esc</kbd></div>' +
    '<div class="cmdk-list" id="cmdkL" role="listbox"></div><div class="cmdk-foot"><span><kbd>&uarr;</kbd><kbd>&darr;</kbd> move</span><span><kbd>enter</kbd> open</span></div></div>';
  doc.body.appendChild(pal);
  var q = doc.getElementById('cmdkQ'), L = doc.getElementById('cmdkL'), sel = 0, res = [];
  function render() {
    var s = q.value.trim().toLowerCase();
    res = ITEMS.filter(function (it) { return !s || (it[1] + ' ' + it[0] + ' ' + (it[3] || '')).toLowerCase().indexOf(s) > -1; }).slice(0, 12);
    sel = Math.min(sel, Math.max(0, res.length - 1));
    var last = '';
    L.innerHTML = res.length ? res.map(function (it, i) {
      var g = it[0] !== last ? '<div class="cmdk-g">' + esc(it[0]) + '</div>' : ''; last = it[0];
      return g + '<a class="cmdk-it' + (i === sel ? ' on' : '') + '" data-i="' + i + '" href="' + esc(it[2]) + '"><span>' + esc(it[1]) + '</span><em>&crarr;</em></a>';
    }).join('') : '<div class="cmdk-empty">' + (MASCOT ? '<img src="assets/oti/otter-3d.png" alt="" width="56" height="56">Oti looked everywhere.' : 'Nothing found.') + ' Try "portal", "fleet" or "pricing".</div>';
  }
  function open() { loadMore(); pal.classList.add('open'); q.value = ''; sel = 0; render(); setTimeout(function () { q.focus(); }, 30); }
  function close() { pal.classList.remove('open'); }
  function go(i) {
    var it = res[i]; if (!it) return;
    if (it[2] === '#theme') { close(); var tb = doc.getElementById('themeBtn'); if (tb) tb.click(); return; }
    close(); var a = doc.createElement('a'); a.href = it[2]; doc.body.appendChild(a); a.click(); a.remove();
  }
  q.addEventListener('input', function () { sel = 0; render(); });
  L.addEventListener('click', function (e) { var a = e.target.closest('.cmdk-it'); if (!a) return; e.preventDefault(); go(+a.dataset.i); });
  L.addEventListener('mousemove', function (e) { var a = e.target.closest('.cmdk-it'); if (a && +a.dataset.i !== sel) { sel = +a.dataset.i; render(); } });
  pal.addEventListener('click', function (e) { if (e.target === pal) close(); });
  addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? close() : open(); return; }
    if (!pal.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, res.length); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + res.length) % Math.max(1, res.length); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); go(sel); }
  });
  var kb = doc.getElementById('cmdkBtn');
  if (kb) { kb.innerHTML = '<svg class="ck-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path class="ck-s" d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path class="ck-d" d="M12 8.5l1.2 2.3 2.3 1.2-2.3 1.2-1.2 2.3-1.2-2.3-2.3-1.2 2.3-1.2z" fill="currentColor"/></svg><span>Quick jump</span><kbd>' + (isMac ? '&#8984;K' : 'Ctrl K') + '</kbd>'; kb.onclick = open; }
})();

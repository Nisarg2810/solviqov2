/* Solviqo demo engine: a timeline of actions replayed on a 1280x720 stage */
(function () {
  var embed = window.self !== window.top;
  if (embed) document.documentElement.classList.add('embed');
  var qt = (location.search.match(/theme=(light|dark)/) || [])[1];
  if (qt === 'light') document.documentElement.classList.add('light');
  var mini = /[?&]mini=1/.test(location.search), startAt = +((location.search.match(/start=([\d.]+)/) || [])[1] || 0);
  if (mini) document.documentElement.classList.add('mini');
  window.addEventListener('message', function (e) {
    if (e.data && e.data.demoTheme) document.documentElement.classList.toggle('light', e.data.demoTheme === 'light');
  });
  var S = [], T = 0, ACTS = [], stage, vp, K = 1, cur = { x: 600, y: 400 }, cfg;
  function $(s) { return stage.querySelector(s); }
  function ease(p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
  function place() { var c = $('#cur'); c.style.left = cur.x + 'px'; c.style.top = cur.y + 'px'; }
  function pos(sel) { var e = $(sel).getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: (e.left - s.left) / K + e.width / K * .55, y: (e.top - s.top) / K + e.height / K * .6 }; }

  var H = {
    $: $,
    view: function (id) { return function () { stage.querySelectorAll('.view').forEach(function (v) { v.classList.toggle('on', v.id === id); }); }; },
    role: function (r) { return function () { stage.querySelectorAll('.role').forEach(function (v) { v.classList.toggle('on', v.dataset.r === r); }); }; },
    add: function (sel, c) { return function () { $(sel).classList.add(c || 'in'); }; },
    rem: function (sel, c) { return function () { $(sel).classList.remove(c || 'in'); }; },
    move: function (sel) { return function (p, st) { if (!st.s) st.s = { x: cur.x, y: cur.y }; var t = pos(sel), e = ease(p); cur.x = st.s.x + (t.x - st.s.x) * e; cur.y = st.s.y + (t.y - st.s.y) * e; place(); }; },
    click: function (sel) { return function (p, st) { if (st.d) return; st.d = 1; var c = $('#cur'); c.classList.remove('clk'); void c.offsetWidth; c.classList.add('clk');
      if (sel) { var b = $(sel); b.classList.add('press'); setTimeout(function () { b.classList.remove('press'); }, 160); } }; },
    type: function (sel, txt) { return function (p) { var e = $(sel); e.textContent = txt.slice(0, Math.round(txt.length * p)); e.classList.toggle('caret', p < 1); }; },
    count: function (sel, to, fmt, from) { from = from || 0; return function (p) { $(sel).textContent = (fmt || String)(Math.round(from + (to - from) * ease(p))); }; },
    html: function (sel, h) { return function () { $(sel).innerHTML = h; }; },
    chip: function (sel, cls, txt) { return function () { var c = $(sel); c.className = 'chip ' + cls; c.textContent = txt; }; },
    style: function (sel, prop, fn) { return function (p) { stage.querySelectorAll(sel).forEach(function (el) { el.style[prop] = fn(ease(p), el); }); }; },
    step: function (n) { return function () { stage.querySelectorAll('.who .st').forEach(function (s) { var k = +s.dataset.s; s.className = 'st' + (k < n ? ' done' : k === n ? ' now' : ''); }); }; },
    aed: function (v) { return 'AED ' + v.toLocaleString('en-US'); },
    num: function (v) { return v.toLocaleString('en-US'); }
  };
  window.D = H;

  H.scene = function (title, sub, dur, acts) {
    var t0 = T, i = S.length;
    var list = [{ at: t0, dur: 0, fn: function () { $('#cap').innerHTML = '<span class="n">0' + (i + 1) + '</span><div class="in"><h2>' + title + '</h2><p>' + sub + '</p></div>'; } }];
    acts.forEach(function (a) { list.push({ at: t0 + a[0], dur: a[1], fn: a[2] }); });
    S.push({ t0: t0, dur: dur }); ACTS = ACTS.concat(list); T += dur;
  };

  function shell(c) {
    var roles = c.roles.map(function (r) { return '<div class="role" data-r="' + r[1] + '"><b>' + r[0] + '</b>' + r[1] + '</div>'; }).join('');
    var steps = c.labels.map(function (l, i) { return '<div class="st" data-s="' + (i + 1) + '"><b>' + (i + 1) + '</b>' + l[1] + '</div>'; }).join('');
    return '<div class="win"><div class="bar"><i></i><i></i><i></i><span class="url">' + c.url + '</span></div><div class="body"><div class="side">' +
      '<div class="brand"><svg width="22" height="22" viewBox="0 0 240 240"><g fill="none" stroke-width="18" stroke-linecap="square"><g transform="translate(70,168) rotate(-25) scale(.62)" stroke="#5B6779"><polyline points="-27,-30 28,0 -27,30"/></g><g transform="translate(118,128) rotate(-12) scale(.82)" stroke="#9FAABA"><polyline points="-27,-30 28,0 -27,30"/></g><g transform="translate(172,72) rotate(2) scale(1.05)" stroke="#E9EDF3"><polyline points="-27,-30 28,0 -27,30"/></g></g></svg>' + c.app + '</div>' +
      '<h6>' + (c.sideTitle || 'SIGNED IN AS') + '</h6>' + roles + '</div><div class="main">' + c.views + '</div></div></div>' +
      '<div class="who" id="who"><h6>' + (c.whoTitle || 'WHO ACTS') + '</h6>' + steps + '</div>' + (c.extra || '') +
      '<div class="cap" id="cap"></div><div class="cur" id="cur"><span class="rp"></span><svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#fff" stroke="#05070B" stroke-width="1.5" stroke-linejoin="round"/></svg></div>';
  }

  var PLAY = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
  var PAUSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>';

  H.init = function (c) {
    cfg = c;
    document.body.insertAdjacentHTML('afterbegin',
      '<div class="frame"><div class="vp" id="vp"><div id="stage"></div></div><div class="ctl">' +
      '<button id="play" aria-label="Play or pause"></button><button id="restart" aria-label="Restart"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button>' +
      '<div class="track" id="track"><div class="tb"><i id="prog"></i></div></div><div class="tm2" id="time">0:00</div></div>' +
      '<p class="note">Sample walkthrough · ' + c.name + ' · all names and figures are illustrative</p></div>');
    stage = document.getElementById('stage'); vp = document.getElementById('vp');
    function fit() {
      if (mini) { K = Math.max(vp.clientWidth / 1280, vp.clientHeight / 720); stage.style.transform = 'translate(' + (vp.clientWidth - 1280 * K) / 2 + 'px,' + (vp.clientHeight - 720 * K) / 2 + 'px) scale(' + K + ')'; return; }
      K = vp.clientWidth / 1280; stage.style.transform = 'scale(' + K + ')';
    }
    addEventListener('resize', fit); fit();
    ACTS.sort(function (a, b) { return a.at - b.at; });
    var track = document.getElementById('track');
    S.forEach(function (s, i) {
      var l = s.t0 / T * 100;
      if (i) { var k = document.createElement('span'); k.className = 'tk'; k.style.left = l + '%'; track.appendChild(k); }
      var b = document.createElement('span'); b.className = 'lb'; b.style.left = l + '%'; b.textContent = c.labels[i][0]; track.appendChild(b);
    });
    var labels = track.querySelectorAll('.lb');
    var t = 0, playing = !embed || mini, last = null;
    function reset() { stage.innerHTML = shell(c); cur = { x: 600, y: 400 }; place(); ACTS.forEach(function (a) { a.st = {}; a.done = false; }); }
    function apply() { ACTS.forEach(function (a) { if (a.done || t < a.at) return; var p = a.dur ? Math.min(1, (t - a.at) / a.dur) : 1; a.fn(p, a.st); if (p >= 1) a.done = true; }); }
    function seek(nt) { t = Math.max(0, Math.min(T - .01, nt)); reset(); stage.classList.add('instant'); apply(); void stage.offsetWidth; stage.classList.remove('instant'); ui(); }
    function mmss(x) { x = Math.round(x); return Math.floor(x / 60) + ':' + ('0' + x % 60).slice(-2); }
    function ui() {
      document.getElementById('prog').style.width = (t / T * 100) + '%';
      document.getElementById('time').textContent = mmss(Math.floor(t)) + ' / ' + mmss(T);
      labels.forEach(function (l, i) { l.classList.toggle('on', t >= S[i].t0 && t < S[i].t0 + S[i].dur); });
      document.getElementById('play').innerHTML = playing ? PAUSE : PLAY;
    }
    function loop(ts) { if (last !== null && playing) { t += Math.min(.1, (ts - last) / 1000); if (t >= T) { t = T; playing = false; } apply(); ui(); } last = ts; requestAnimationFrame(loop); }
    document.getElementById('play').onclick = function () { if (!playing && t >= T) seek(0); playing = !playing; ui(); };
    document.getElementById('restart').onclick = function () { seek(0); playing = true; ui(); };
    track.onclick = function (e) { var r = track.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * T); };
    addEventListener('keydown', function (e) { if (e.code === 'Space') { e.preventDefault(); document.getElementById('play').click(); } });
    window.__seek = function (x) { playing = false; seek(x); };
    reset(); apply(); ui(); requestAnimationFrame(loop);
    if (mini && startAt) { seek(startAt); playing = true; ui(); }
    if (embed && !mini) {
      var started = false;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !started) { started = true; playing = true; ui(); }
      }, { threshold: .5 }).observe(vp);
      function post() { parent.postMessage({ demoH: document.documentElement.scrollHeight, demo: c.id }, '*'); }
      addEventListener('resize', post); addEventListener('load', post); post();
    }
  };
})();

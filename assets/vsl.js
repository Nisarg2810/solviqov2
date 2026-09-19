/* Solviqo one minute intro: an animated presenter who speaks the pitch (browser speech),
   with lip movement, word-by-word captions and a screen that changes with each line. */
(function () {
  'use strict';
  var root = document.getElementById('vsl');
  if (!root) return;

  var SEG = [
    { sc: 1, t: 'Hi. If your team still runs on spreadsheets, chat threads and email chains, you are not alone.' },
    { sc: 2, t: 'Most businesses outgrow their tools long before they can justify a big IT project.' },
    { sc: 3, t: 'That is where we come in. Solviqo designs and builds custom apps, internal tools and integrations, around the way you already work.' },
    { sc: 4, t: 'You get a fixed price, a date in writing, and a first release in about four weeks.' },
    { sc: 5, t: 'We have already shipped systems for construction, facilities, maintenance and fleet teams, used every single day.' },
    { sc: 6, t: 'Book a twenty minute call below. Tell us what is slowing you down, and we will tell you honestly how we would fix it.' }
  ];

  var MARK = '<g fill="none" stroke-width="18" stroke-linecap="square"><g transform="translate(70,168) rotate(-25) scale(.62)" stroke="#5B6779"><polyline points="-27,-30 28,0 -27,30"/></g><g transform="translate(118,128) rotate(-12) scale(.82)" stroke="#9FAABA"><polyline points="-27,-30 28,0 -27,30"/></g><g transform="translate(172,72) rotate(2) scale(1.05)" stroke="#E8890C"><polyline points="-27,-30 28,0 -27,30"/></g></g>';

  root.innerHTML =
    '<div class="vsl-vp"><div class="vsl-stage">' +
      '<div class="vsl-bg"></div>' +
      '<div class="vsl-screen">' +
        '<div class="vs vs0"><svg viewBox="0 0 240 240" class="vs-logo">' + MARK + '</svg><b>Solviqo</b><small>Custom software, shipped in weeks</small></div>' +
        '<div class="vs vs1"><div class="sheet">' + Array(24).join('<i></i>').replace(/<i><\/i>/g, function (m, k) { return [3, 7, 12, 17].indexOf(k / 7) > -1 ? '<i class="x"></i>' : m; }) + '<i></i></div>' +
          '<span class="bub b1">Which file is the latest?</span><span class="bub b2">Who approved this?</span><span class="bub b3">RE: RE: FW: urgent</span></div>' +
        '<div class="vs vs2"><div class="gr"><span class="need"></span><span class="tool"></span></div><em class="l1">What you need</em><em class="l2">What your tools do</em></div>' +
        '<div class="vs vs3"><div class="app"><b class="hd"></b><div class="row"><b></b><b></b><b></b></div><b class="ls"></b><b class="ls s"></b><b class="ls"></b></div><span class="pill">Built around you</span></div>' +
        '<div class="vs vs4"><div class="wks"><p><em>Week 1</em><i></i></p><p><em>Week 2</em><i></i></p><p><em>Week 3</em><i></i></p><p><em>Week 4</em><i class="g"></i></p></div><span class="price">Fixed price &#10003;</span></div>' +
        '<div class="vs vs5"><div class="tiles"><span>Construction</span><span>Facilities</span><span>Maintenance</span><span>Fleet</span></div><em class="used">In daily use</em></div>' +
        '<div class="vs vs6"><div class="cal"><b class="mo">This week</b><div class="days">' + ['M', 'T', 'W', 'T', 'F'].map(function (d, i) { return '<span' + (i === 2 ? ' class="pick"' : '') + '>' + d + '</span>'; }).join('') + '</div><span class="slot">20 min call</span></div><span class="down">&#8595;</span></div>' +
      '</div>' +
      '<svg class="vsl-guy" viewBox="0 0 640 360" aria-hidden="true">' +
        '<ellipse cx="470" cy="352" rx="120" ry="10" fill="rgba(0,0,0,.35)"/>' +
        '<g class="torso"><path d="M366 362 C 368 304 398 284 440 276 L 500 276 C 542 284 572 304 574 362 Z" fill="#1c2433"/>' +
        '<path d="M446 276 L 470 318 L 494 276 Z" fill="#E9EDF3"/><path d="M440 276 L 470 330 L 452 362 L 420 362 C 424 320 430 296 440 276 Z" fill="#243049"/><path d="M500 276 L 470 330 L 488 362 L 520 362 C 516 320 510 296 500 276 Z" fill="#243049"/>' +
        '<g transform="translate(508,300) scale(.07)">' + MARK.replace('stroke-width="18"', 'stroke-width="26"') + '</g></g>' +
        '<g class="head">' +
          '<path d="M454 236 L 486 236 L 488 282 L 452 282 Z" fill="#A86F50"/>' +
          '<ellipse cx="423" cy="198" rx="8" ry="12" fill="#B87B5A"/><ellipse cx="517" cy="198" rx="8" ry="12" fill="#B87B5A"/>' +
          '<ellipse cx="470" cy="192" rx="46" ry="56" fill="#C68B67"/>' +
          '<path d="M418 204 C 408 132 448 116 474 118 C 514 120 536 150 524 206 C 522 222 518 234 512 240 L 512 188 C 500 160 470 150 440 168 C 432 176 430 196 430 240 C 422 230 419 218 418 204 Z" fill="#221d24"/>' +
          '<path d="M432 170 C 448 146 492 140 514 170 C 492 160 470 158 432 170 Z" fill="#2d2630"/>' +
          '<circle cx="446" cy="214" r="7" fill="#E07C6A" opacity=".22"/><circle cx="494" cy="214" r="7" fill="#E07C6A" opacity=".22"/>' +
          '<path class="brow" d="M442 176 Q 452 171 462 175 M478 175 Q 488 171 498 176" stroke="#221d24" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
          '<g class="eyes"><ellipse cx="452" cy="191" rx="7" ry="4.6" fill="#fff"/><ellipse cx="488" cy="191" rx="7" ry="4.6" fill="#fff"/>' +
            '<circle class="iris" cx="453" cy="191" r="3.6" fill="#2a1c16"/><circle class="iris" cx="489" cy="191" r="3.6" fill="#2a1c16"/>' +
            '<circle cx="454.4" cy="189.6" r="1.1" fill="#fff"/><circle cx="490.4" cy="189.6" r="1.1" fill="#fff"/></g>' +
          '<g class="lids"><rect x="443" y="184" width="18" height="14" rx="6" fill="#C68B67"/><rect x="479" y="184" width="18" height="14" rx="6" fill="#C68B67"/></g>' +
          '<path d="M470 196 Q 466 208 470 211 Q 474 212 476 209" stroke="#A86F50" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
          '<g class="mouth">' +
            '<path class="m0" d="M458 226 Q 470 234 482 226" stroke="#7a2e2c" stroke-width="3" fill="none" stroke-linecap="round"/>' +
            '<g class="m1"><ellipse cx="470" cy="228" rx="9" ry="4.5" fill="#5a1f22"/><rect x="463" y="224" width="14" height="2.6" rx="1.3" fill="#f4efe9"/></g>' +
            '<g class="m2"><ellipse cx="470" cy="229" rx="11" ry="7.5" fill="#5a1f22"/><rect x="462" y="222.5" width="16" height="3" rx="1.5" fill="#f4efe9"/><ellipse cx="470" cy="233" rx="6" ry="2.6" fill="#c0555a"/></g>' +
            '<g class="m3"><ellipse cx="470" cy="229" rx="6" ry="7" fill="#5a1f22"/></g>' +
          '</g>' +
        '</g>' +
      '</svg>' +
      '<div class="vsl-cap" aria-live="polite"></div>' +
      '<button class="vsl-big" type="button"><span class="pl"><svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg></span><b>Watch the one minute intro</b><small>Sound on</small></button>' +
    '</div></div>' +
    '<div class="vsl-ctl"><button type="button" class="vc-play" aria-label="Play or pause"></button><button type="button" class="vc-re" aria-label="Restart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button>' +
      '<div class="vc-bar">' + SEG.map(function () { return '<span><i></i></span>'; }).join('') + '</div>' +
      '<button type="button" class="vc-mute" aria-label="Mute or unmute"></button></div>';

  var vp = root.querySelector('.vsl-vp'), stage = root.querySelector('.vsl-stage'), cap = root.querySelector('.vsl-cap');
  var guy = root.querySelector('.vsl-guy'), mouth = guy.querySelector('.mouth'), big = root.querySelector('.vsl-big');
  var bPlay = root.querySelector('.vc-play'), bRe = root.querySelector('.vc-re'), bMute = root.querySelector('.vc-mute');
  var bars = root.querySelectorAll('.vc-bar i');
  function fit() { stage.style.transform = 'scale(' + vp.clientWidth / 640 + ')'; }
  addEventListener('resize', fit); fit();

  var PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  var SOUND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>';
  var MUTED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l6 6M22 9l-6 6"/></svg>';

  var synth = window.speechSynthesis || null, voice = null;
  var muted = !synth, playing = false, idx = 0, runId = 0, wordI = 0, words = [], flapT = null, wordT = null;
  function pickVoice() {
    if (!synth) return;
    var vs = synth.getVoices();
    var pref = ['Samantha', 'Google UK English Female', 'Microsoft Aria', 'Microsoft Jenny', 'Google US English', 'Karen', 'Moira', 'Tessa', 'Serena', 'Victoria'];
    for (var i = 0; i < pref.length; i++) { for (var j = 0; j < vs.length; j++) if (vs[j].name.indexOf(pref[i]) > -1) { voice = vs[j]; return; } }
    for (j = 0; j < vs.length; j++) if (/^en/i.test(vs[j].lang)) { voice = vs[j]; return; }
  }
  if (synth) { pickVoice(); synth.addEventListener && synth.addEventListener('voiceschanged', pickVoice); }

  function setScene(n) { stage.setAttribute('data-sc', n); }
  function mouthShape(k) { mouth.setAttribute('data-m', k); }
  function talk(on) {
    clearInterval(flapT); guy.classList.toggle('talking', on);
    if (!on) { mouthShape(0); return; }
    flapT = setInterval(function () { var r = Math.random(); mouthShape(r < .18 ? 0 : r < .5 ? 1 : r < .82 ? 2 : 3); }, 95);
  }
  function renderCap(i) {
    words = SEG[i].t.split(' ');
    cap.innerHTML = words.map(function (w) { return '<span>' + w + '</span>'; }).join(' ');
  }
  function hl(n) {
    wordI = n;
    var sp = cap.querySelectorAll('span');
    sp.forEach(function (s, k) { s.className = k < n ? 'd' : k === n ? 'on' : ''; });
    bars.forEach(function (b, k) { b.style.width = k < idx ? '100%' : k === idx ? (Math.min(1, (n + 1) / words.length) * 100) + '%' : '0'; });
  }
  function charToWord(ci) { var c = 0; for (var k = 0; k < words.length; k++) { c += words[k].length + 1; if (ci < c) return k; } return words.length - 1; }

  function runSeg(i) {
    var my = ++runId;
    if (i >= SEG.length) { finish(); return; }
    idx = i; setScene(SEG[i].sc); renderCap(i); hl(0); talk(true);
    guy.classList.remove('brows'); void guy.offsetWidth; guy.classList.add('brows');
    var gotBoundary = false;
    function next() {
      if (my !== runId || !playing) return;
      clearInterval(wordT); talk(false); hl(words.length);
      setTimeout(function () { if (my === runId && playing) runSeg(i + 1); }, 420);
    }
    function wordTimer(ms) {
      clearInterval(wordT); var k = 0;
      wordT = setInterval(function () {
        if (my !== runId) return clearInterval(wordT);
        k++; if (k < words.length) hl(k); else { clearInterval(wordT); if (muted) next(); else setTimeout(function () { if (my === runId) next(); }, 1600); }
      }, ms);
    }
    if (!muted && synth) {
      var u = new SpeechSynthesisUtterance(SEG[i].t);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = 1; u.pitch = 1.04;
      u.onboundary = function (e) { if (my !== runId) return; if (!gotBoundary) { gotBoundary = true; clearInterval(wordT); } hl(charToWord(e.charIndex)); };
      u.onend = next; u.onerror = function () { if (my === runId) { muted = true; ui(); wordTimer(340); } };
      synth.cancel(); synth.speak(u);
      setTimeout(function () { if (my === runId && !gotBoundary) wordTimer(330); }, 650);
    } else {
      wordTimer(340);
    }
  }
  function finish() { playing = false; talk(false); setScene(6); ui(); root.classList.add('ended'); }
  function play(from) {
    root.classList.add('started'); root.classList.remove('ended');
    playing = true; ui(); runSeg(from || 0);
  }
  function pause() { playing = false; runId++; clearInterval(wordT); if (synth) synth.cancel(); talk(false); ui(); }
  function ui() { bPlay.innerHTML = playing ? PAUSE : PLAY; bMute.innerHTML = muted ? MUTED : SOUND; }

  big.onclick = function () { pickVoice(); play(0); };
  bPlay.onclick = function () { if (playing) pause(); else play(root.classList.contains('ended') ? 0 : idx); };
  bRe.onclick = function () { pause(); play(0); };
  bMute.onclick = function () {
    if (!synth) return;
    muted = !muted; ui();
    if (playing) { runId++; synth.cancel(); clearInterval(wordT); runSeg(idx); }
  };
  addEventListener('pagehide', function () { if (synth) synth.cancel(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && playing) pause(); });
  setScene(0); mouthShape(0); ui();
})();

/* Home preview: before/after tabs and split-flap counters */
(function () {
  var tabs = document.querySelectorAll('.on-tabs button');
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelectorAll('.on-pane').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-p') === b.getAttribute('data-t')); });
    });
  });
  var row = document.querySelector('.flip-row');
  if (!row || !('IntersectionObserver' in window)) return;
  var done = false;
  new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting || done) return; done = true;
    row.querySelectorAll('.fd').forEach(function (d, i) {
      var target = +d.getAttribute('data-d'), n = 0, steps = 8 + target + i * 3, b = d.querySelector('b');
      (function tick() {
        n++; var v = n >= steps ? target : (n % 10);
        b.textContent = v; d.classList.remove('flipping'); void d.offsetWidth; d.classList.add('flipping');
        if (n < steps) setTimeout(tick, 70 + n * 4);
      })();
    });
  }, { threshold: .5 }).observe(row);
})();

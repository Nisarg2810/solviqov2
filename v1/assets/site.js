/* Solviqo · shared site behavior: nav toggle, blog + case study rendering from JSON */

(function(){
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if(!toggle || !links) return;
  function close(){
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function(){
    var open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', close);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') close();
  });
})();

/* ---------- Scroll HUD ---------- */
function initScrollHud(){
  var hud = document.getElementById('scrollHud');
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-hud]'));
  if(!hud || !sections.length) return;
  var curEl = hud.querySelector('.cur');
  var barEl = hud.querySelector('.bar i');
  var totalEl = hud.querySelector('.total');
  if(totalEl) totalEl.textContent = String(sections.length).padStart(2,'0');
  function update(){
    hud.classList.add('visible');
    var mid = window.innerHeight * 0.4;
    var current = 0;
    sections.forEach(function(s, i){
      var r = s.getBoundingClientRect();
      if(r.top <= mid) current = i;
    });
    if(curEl) curEl.textContent = String(current+1).padStart(2,'0');
    var doc = document.documentElement;
    var pct = (doc.scrollTop) / (doc.scrollHeight - doc.clientHeight) * 100;
    if(barEl) barEl.style.width = Math.min(100, Math.max(0,pct)) + '%';
    if(window.scrollY < 40) hud.classList.remove('visible');
  }
  document.addEventListener('scroll', update, { passive:true });
  update();
}

/* ---------- Intro loader ---------- */
function initIntroLoader(){
  var loader = document.getElementById('introLoader');
  if(!loader) return;
  var already = sessionStorage.getItem('solviqo_intro_shown');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(already || reduced){
    loader.remove();
    return;
  }
  sessionStorage.setItem('solviqo_intro_shown', '1');
  requestAnimationFrame(function(){
    loader.classList.add('run');
  });
  setTimeout(function(){
    loader.classList.add('hide');
    setTimeout(function(){ loader.remove(); }, 550);
  }, 1350);
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function fmtDate(iso){
  var d = new Date(iso + 'T00:00:00');
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function getSlug(){
  var params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

/* ---------- Blog ---------- */

function renderPostCard(post){
  return (
    '<a class="card post-card" href="blog.html?slug=' + encodeURIComponent(post.slug) + '">' +
      '<div class="post-meta"><span class="tag amber">' + escapeHtml(post.category) + '</span>' +
      '<span class="post-date">' + fmtDate(post.date) + ' &middot; ' + escapeHtml(post.readTime) + '</span></div>' +
      '<h3>' + escapeHtml(post.title) + '</h3>' +
      '<p>' + escapeHtml(post.excerpt) + '</p>' +
      '<span class="card-link">Read the piece ' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
    '</a>'
  );
}

function renderBlockHtml(block){
  if(block.type === 'h3') return '<h3>' + escapeHtml(block.text) + '</h3>';
  if(block.type === 'quote') return '<blockquote>' + escapeHtml(block.text) + '</blockquote>';
  if(block.type === 'list'){
    return '<ul class="post-list">' + block.items.map(function(i){ return '<li>' + escapeHtml(i) + '</li>'; }).join('') + '</ul>';
  }
  return '<p>' + escapeHtml(block.text) + '</p>';
}

function renderPostDetail(post, allPosts){
  var related = allPosts.filter(function(p){ return p.slug !== post.slug; }).slice(0,2);
  var html =
    '<a class="back-link" href="blog.html">&larr; All articles</a>' +
    '<div class="post-head">' +
      '<span class="tag amber">' + escapeHtml(post.category) + '</span>' +
      '<h1>' + escapeHtml(post.title) + '</h1>' +
      '<p class="post-byline">' + fmtDate(post.date) + ' &middot; ' + escapeHtml(post.readTime) + ' &middot; by Solviqo Studio</p>' +
    '</div>' +
    '<div class="post-body">' + post.body.map(renderBlockHtml).join('') + '</div>' +
    '<div class="post-cta card">' +
      '<h3>Have this exact problem?</h3>' +
      '<p>Twenty minutes on a call is enough to know if a sprint fixes it.</p>' +
      '<a class="btn btn-primary" href="contact.html">Book a scoping call</a>' +
    '</div>';
  if(related.length){
    html += '<div class="related"><h4 class="eyebrow muted">More from the studio</h4><div class="grid-2">' +
      related.map(renderPostCard).join('') + '</div></div>';
  }
  return html;
}

function initBlogPage(){
  var listEl = document.getElementById('postList');
  var detailEl = document.getElementById('postDetail');
  if(!listEl && !detailEl) return;
  fetch('data/posts.json').then(function(r){ return r.json(); }).then(function(posts){
    posts.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
    var slug = getSlug();
    if(slug){
      var post = posts.find(function(p){ return p.slug === slug; });
      if(listEl) listEl.hidden = true;
      if(detailEl){
        detailEl.hidden = false;
        detailEl.innerHTML = post ? renderPostDetail(post, posts) :
          '<a class="back-link" href="blog.html">&larr; All articles</a><p>That article moved or never existed. Try the full list.</p>';
      }
    } else {
      if(detailEl) detailEl.hidden = true;
      if(listEl){
        listEl.hidden = false;
        listEl.innerHTML = posts.map(renderPostCard).join('');
      }
    }
  }).catch(function(){
    if(listEl) listEl.innerHTML = '<p class="muted">Articles could not be loaded right now.</p>';
  });
}

/* ---------- Case studies ---------- */

function renderCaseCard(c){
  return (
    '<a class="card case-card" href="case-studies.html?slug=' + encodeURIComponent(c.slug) + '">' +
      '<span class="tag amber">' + escapeHtml(c.industry) + '</span>' +
      '<h3>' + escapeHtml(c.title) + '</h3>' +
      '<p>' + escapeHtml(c.summary) + '</p>' +
      '<div class="case-stats">' + c.stats.map(function(s){
        return '<div><div class="v">' + escapeHtml(s.v) + '</div><div class="l">' + escapeHtml(s.l) + '</div></div>';
      }).join('') + '</div>' +
      '<span class="card-link">Read the engagement ' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>' +
    '</a>'
  );
}

function renderCaseDetail(c){
  return (
    '<a class="back-link" href="case-studies.html">&larr; All case studies</a>' +
    '<div class="post-head">' +
      '<span class="tag amber">' + escapeHtml(c.industry) + '</span>' +
      '<h1>' + escapeHtml(c.title) + '</h1>' +
      '<p class="post-byline">' + c.tags.map(escapeHtml).join(' &middot; ') + '</p>' +
    '</div>' +
    '<div class="stat-band" style="margin:36px 0 44px;">' + c.stats.map(function(s){
      return '<div class="stat"><div class="v">' + escapeHtml(s.v) + '</div><div class="l">' + escapeHtml(s.l) + '</div></div>';
    }).join('') + '</div>' +
    '<div class="post-body">' +
      '<h3>The problem</h3><p>' + escapeHtml(c.challenge) + '</p>' +
      '<h3>What we built</h3><p>' + escapeHtml(c.approach) + '</p>' +
      '<h3>Where it landed</h3><p>' + escapeHtml(c.outcome) + '</p>' +
    '</div>' +
    '<div class="post-cta card">' +
      '<h3>Running the same operation?</h3>' +
      '<p>Tell us what it actually looks like and we will tell you, honestly, if a sprint fixes it.</p>' +
      '<a class="btn btn-primary" href="contact.html">Book a scoping call</a>' +
    '</div>'
  );
}

function initCaseStudiesPage(){
  var listEl = document.getElementById('caseList');
  var detailEl = document.getElementById('caseDetail');
  if(!listEl && !detailEl) return;
  fetch('data/case-studies.json').then(function(r){ return r.json(); }).then(function(cases){
    var slug = getSlug();
    if(slug){
      var c = cases.find(function(x){ return x.slug === slug; });
      if(listEl) listEl.hidden = true;
      if(detailEl){
        detailEl.hidden = false;
        detailEl.innerHTML = c ? renderCaseDetail(c) :
          '<a class="back-link" href="case-studies.html">&larr; All case studies</a><p>That engagement moved or never existed. Try the full list.</p>';
      }
    } else {
      if(detailEl) detailEl.hidden = true;
      if(listEl){
        listEl.hidden = false;
        listEl.innerHTML = cases.map(renderCaseCard).join('');
      }
    }
  }).catch(function(){
    if(listEl) listEl.innerHTML = '<p class="muted">Case studies could not be loaded right now.</p>';
  });
}

/* ---------- Home page teasers (latest 2 posts / cases) ---------- */

function initHomeTeasers(){
  var postTeaser = document.getElementById('homePostTeaser');
  var caseTeaser = document.getElementById('homeCaseTeaser');
  if(postTeaser){
    fetch('data/posts.json').then(function(r){ return r.json(); }).then(function(posts){
      posts.sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
      postTeaser.innerHTML = posts.slice(0,2).map(renderPostCard).join('');
    }).catch(function(){});
  }
  if(caseTeaser){
    fetch('data/case-studies.json').then(function(r){ return r.json(); }).then(function(cases){
      caseTeaser.innerHTML = cases.slice(0,2).map(renderCaseCard).join('');
    }).catch(function(){});
  }
}

document.addEventListener('DOMContentLoaded', function(){
  initIntroLoader();
  initScrollHud();
  initBlogPage();
  initCaseStudiesPage();
  initHomeTeasers();
});

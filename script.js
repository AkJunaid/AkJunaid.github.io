(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* typing headline */
  var phrases = ['LLM applications.', 'RAG systems.', 'AI agents.', 'AI-native products.'];
  var el = document.getElementById('typed');
  if (el) {
    if (reduce) { el.textContent = phrases[0]; }
    else {
      var p = 0, c = 0, del = false;
      (function tick() {
        var word = phrases[p];
        el.textContent = word.slice(0, c);
        if (!del && c === word.length) { del = true; return setTimeout(tick, 1600); }
        if (del && c === 0) { del = false; p = (p + 1) % phrases.length; return setTimeout(tick, 350); }
        c += del ? -1 : 1;
        setTimeout(tick, del ? 38 : 75);
      })();
    }
  }

  /* scroll reveal */
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (n) { io.observe(n); });
  } else { rev.forEach(function (n) { n.classList.add('in'); }); }

  /* scroll progress, active nav link, timeline fill */
  var bar = document.querySelector('.progress');
  var links = document.querySelectorAll('nav ul a');
  var secs = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
  var tl = document.querySelector('.timeline'), fill = document.querySelector('.timeline .fill');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    var y = h.scrollTop + window.innerHeight * 0.35, cur = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    if (tl && fill) {
      var r = tl.getBoundingClientRect();
      var pct = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      fill.style.height = (pct * 100) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* project cards: spotlight + 3D tilt */
  if (!reduce) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        var rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* particle network background */
  var cv = document.getElementById('net');
  if (cv && !reduce) {
    var ctx = cv.getContext('2d'), dots = [], W, H, mouse = { x: -999, y: -999 };
    function size() {
      var d = window.devicePixelRatio || 1;
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      var n = Math.min(70, Math.floor(W * H / 22000));
      dots = [];
      for (var i = 0; i < n; i++) dots.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
    }
    window.addEventListener('resize', size);
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    size();
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var a = dots[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        ctx.fillStyle = 'rgba(56,189,248,.7)';
        ctx.beginPath(); ctx.arc(a.x, a.y, 1.4, 0, 6.283); ctx.fill();
        for (var j = i + 1; j < dots.length; j++) {
          var b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 14000) {
            ctx.strokeStyle = 'rgba(56,189,248,' + (0.22 * (1 - d / 14000)) + ')';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        var mx = a.x - mouse.x, my = a.y - mouse.y, md = mx * mx + my * my;
        if (md < 22000) {
          ctx.strokeStyle = 'rgba(56,189,248,' + (0.5 * (1 - md / 22000)) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      requestAnimationFrame(frame);
    })();
  }
})();

/* contact form: opens the visitor's mail app with the message pre-filled */
(function () {
  var f = document.getElementById('contact-form');
  if (!f) return;
  var note = document.getElementById('form-note');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    Array.prototype.forEach.call(f.elements, function (el) {
      if (!el.name) return;
      var ok = el.value.trim() && (el.type !== 'email' || /^\S+@\S+\.\S+$/.test(el.value.trim()));
      el.classList.toggle('invalid', !ok);
      if (!ok) bad = true;
    });
    note.className = 'note';
    if (bad) { note.classList.add('err'); note.textContent = 'Please fill in every field with a valid email.'; return; }
    var d = new FormData(f);
    var body = d.get('message') + '\n\n— ' + d.get('name') + ' (' + d.get('email') + ')';
    window.location.href = 'mailto:akxunaid@gmail.com?subject=' + encodeURIComponent(d.get('subject')) + '&body=' + encodeURIComponent(body);
    note.classList.add('ok');
    note.textContent = 'Opening your email app to send the message…';
  });
})();

/* ---------- modern pass: theme, filters, cursor glow, magnetic buttons, back-to-top ---------- */
(function () {
  var root = document.documentElement;
  var tbtn = document.getElementById('theme');
  if (tbtn) tbtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', next === 'light' ? '#f5f7fb' : '#070a12');
  });

  var chips = document.querySelectorAll('.filters button');
  var cards = document.querySelectorAll('.grid .card');
  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.toggle('on', c === b); });
      var f = b.getAttribute('data-f'), n = 0;
      cards.forEach(function (card) {
        var show = f === 'all' || (' ' + card.getAttribute('data-cat') + ' ').indexOf(' ' + f + ' ') > -1;
        card.classList.toggle('hide', !show);
        card.classList.remove('pop');
        if (show) { card.classList.add('in'); void card.offsetWidth; card.style.animationDelay = (n++ * 55) + 'ms'; card.classList.add('pop'); }
      });
    });
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var glow = document.querySelector('.cursor');
  if (glow && !reduce && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', function (e) {
      glow.classList.add('on');
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('.btn, .send').forEach(function (b) {
      b.classList.add('mag');
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  var top = document.getElementById('top-btn');
  if (top) {
    window.addEventListener('scroll', function () { top.classList.toggle('show', window.scrollY > 700); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
})();

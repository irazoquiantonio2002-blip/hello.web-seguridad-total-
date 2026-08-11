/* ══════════════════════════════════════════════════════════════
   SEGURIDAD TOTAL · ARS — Seguridad en Sistemas
   Interacciones, animaciones y envío del formulario a WhatsApp
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Configuración central del negocio */
  var WA_NUMBER = '525521421800';                 // +52 55 2142 1800
  var REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  document.documentElement.classList.add('is-loading');

  /* ══════════════════════════════════════════
     1. PANTALLA DE CARGA
     Progreso simulado + apertura de cortinas
     ══════════════════════════════════════════ */
  (function loader() {
    var el   = $('#loader');
    var fill = $('.loader-bar-fill');
    if (!el) return;

    var pct = 0;
    var MIN_MS = REDUCED ? 400 : 2300;            // duración mínima: entrada impactante
    var start = Date.now();

    var tick = setInterval(function () {
      pct += Math.random() * 13 + 5;
      if (pct > 92) pct = 92;
      if (fill) fill.style.width = pct + '%';
    }, 190);

    function finish() {
      clearInterval(tick);
      if (fill) fill.style.width = '100%';
      var wait = Math.max(0, MIN_MS - (Date.now() - start));
      setTimeout(function () {
        el.classList.add('done');
        document.documentElement.classList.remove('is-loading');
        document.body.classList.add('ready');       // dispara animaciones del hero
        setTimeout(function () { el.remove(); }, 1700);
      }, wait + 260);
    }

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);
    // Salvavidas: nunca dejar al usuario atrapado en el loader
    setTimeout(finish, 7000);
  })();

  /* ══════════════════════════════════════════
     2. NAVBAR — fondo, progreso y enlace activo
     ══════════════════════════════════════════ */
  (function navbar() {
    var nav  = $('#navbar');
    var prog = $('#scroll-progress');
    var links = $$('.nav-links a');
    var sections = links
      .map(function (a) { return $(a.getAttribute('href')); })
      .filter(Boolean);

    function onScroll() {
      var y = window.pageYOffset;
      if (nav) nav.classList.toggle('scrolled', y > 40);

      if (prog) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }

      var cur = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop - 140 <= y) cur = sections[i].id;
      }
      links.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ══════════════════════════════════════════
     3. MENÚ MÓVIL
     ══════════════════════════════════════════ */
  (function mobileMenu() {
    var btn  = $('#hamburger');
    var menu = $('#mob-menu');
    if (!btn || !menu) return;

    function close() {
      btn.classList.remove('open');
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    btn.addEventListener('click', function () {
      var open = !menu.classList.contains('open');
      btn.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) close(); });
  })();

  /* ══════════════════════════════════════════
     4. REVEAL AL HACER SCROLL + TÍTULOS LETRA A LETRA
     ══════════════════════════════════════════ */
  (function reveals() {
    // Divide los títulos marcados en palabras y letras animables.
    // Las letras se agrupan por palabra para que un salto de línea
    // nunca parta una palabra a la mitad.
    $$('.split-text').forEach(function (h) {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {                       // nodo de texto
            var frag = document.createDocumentFragment();
            n.nodeValue.split(/(\s+)/).forEach(function (token) {
              if (!token) return;
              if (/^\s+$/.test(token)) {                // espacio: punto de corte válido
                frag.appendChild(document.createTextNode(' '));
                return;
              }
              var word = document.createElement('span');
              word.className = 'wd';
              token.split('').forEach(function (ch) {
                var s = document.createElement('span');
                s.className = 'ch';
                s.textContent = ch;
                word.appendChild(s);
              });
              frag.appendChild(word);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1 &&
                     !n.classList.contains('ch') && !n.classList.contains('wd')) {
            walk(n);
          }
        });
      };
      walk(h);
      $$('.ch', h).forEach(function (s, i) {
        s.style.transitionDelay = Math.min(i * 20, 620) + 'ms';
      });
    });

    var targets = $$('.reveal, .split-text');
    if (!('IntersectionObserver' in window) || REDUCED) {
      targets.forEach(function (t) { t.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (t) { io.observe(t); });
  })();

  /* ══════════════════════════════════════════
     5. MÁQUINA DE ESCRIBIR DEL HERO
     ══════════════════════════════════════════ */
  (function typewriter() {
    var el = $('#tw');
    if (!el) return;
    var words = ['empresa', 'corporativo', 'estacionamiento', 'comercio', 'condominio', 'hogar'];
    if (REDUCED) { el.textContent = words[0]; return; }

    var w = 0, i = 0, del = false;
    function step() {
      var word = words[w];
      el.textContent = word.slice(0, i);
      if (!del && i < word.length) { i++; setTimeout(step, 85); }
      else if (!del && i === word.length) { del = true; setTimeout(step, 1700); }
      else if (del && i > 0) { i--; setTimeout(step, 42); }
      else { del = false; w = (w + 1) % words.length; setTimeout(step, 260); }
    }
    setTimeout(step, 2600);
  })();

  /* ══════════════════════════════════════════
     6. MARQUEE DE SERVICIOS
     ══════════════════════════════════════════ */
  (function marquee() {
    var box = $('#marquee');
    if (!box) return;
    var items = ['CCTV', 'Control de acceso', 'Cerraduras inteligentes', 'Alarmas',
      'Videoporteros', 'Redes y Wi-Fi', 'Renta de impresoras', 'Telefonía IP',
      'Cerca perimetral', 'Aire acondicionado', 'Pantalla LED Video Wall',
      'Extinguidores', 'Torniquetes', 'Control vehicular'];
    var html = items.map(function (t) {
      return '<span class="marq-item"><i class="fa-solid fa-shield-halved"></i>' + t + '</span>';
    }).join('');
    box.innerHTML = html + html;                 // duplicado para bucle continuo
  })();

  /* ══════════════════════════════════════════
     7. PARTÍCULAS — hero (red de nodos) y secciones
     ══════════════════════════════════════════ */
  function particleField(canvas, opts) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var parts = [], W = 0, H = 0, raf = null, visible = true;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      var density = Math.round((W * H) / opts.area);
      var n = Math.max(opts.min, Math.min(opts.max, density));
      parts = [];
      for (var i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * opts.speed,
          vy: (Math.random() - .5) * opts.speed,
          r: Math.random() * opts.size + .7,
          a: Math.random() * .5 + .25,
          c: Math.random() > .5 ? opts.c1 : opts.c2
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

        if (opts.link) {                              // líneas de red entre nodos
          for (var j = i + 1; j < parts.length; j++) {
            var q = parts[j], dx = p.x - q.x, dy = p.y - q.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < opts.linkDist * opts.linkDist) {
              var o = (1 - Math.sqrt(d2) / opts.linkDist) * .16;
              ctx.strokeStyle = 'rgba(' + p.c + ',' + o + ')';
              ctx.lineWidth = .6;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
        }
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    function play() { if (!raf && visible) draw(); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    resize();
    window.addEventListener('resize', function () { stop(); resize(); play(); });

    if ('IntersectionObserver' in window) {            // ahorra batería fuera de pantalla
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        visible ? play() : stop();
      }, { threshold: 0 }).observe(canvas);
    }
    play();
  }

  if (!REDUCED) {
    var heroCv = $('#hero-canvas');
    if (heroCv) particleField(heroCv, {
      area: 11000, min: 34, max: 110, speed: .32, size: 1.7,
      c1: '70,220,104', c2: '77,163,255', link: true, linkDist: 140
    });
    $$('.fx-canvas').forEach(function (cv) {
      var net = cv.dataset.fx === 'net';
      particleField(cv, {
        area: 20000, min: 18, max: 60, speed: .2, size: 1.4,
        c1: '70,220,104', c2: '77,163,255', link: net, linkDist: 120
      });
    });
  }

  /* ══════════════════════════════════════════
     8. PARALLAX de imágenes de fondo
     ══════════════════════════════════════════ */
  (function parallax() {
    var imgs = $$('.pb-img');
    if (!imgs.length || REDUCED) return;
    var ticking = false;

    function update() {
      var vh = window.innerHeight;
      imgs.forEach(function (img) {
        var host = img.closest('.pb-media, .ct-media');
        if (!host) return;
        var r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(img.dataset.speed || '0.2');
        var offset = (r.top + r.height / 2 - vh / 2) * speed;
        img.style.transform = 'translate3d(0,' + (-offset).toFixed(2) + 'px,0) scale(1.05)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ══════════════════════════════════════════
     9. CONTADORES ANIMADOS
     ══════════════════════════════════════════ */
  (function counters() {
    var nums = $$('.stat-num');
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.dataset.count || '0');
      var suffix = el.dataset.suffix || '';
      if (REDUCED) { el.textContent = target.toLocaleString('es-MX') + suffix; return; }
      var dur = 1900, t0 = null;
      function frame(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        el.textContent = Math.round(target * eased).toLocaleString('es-MX') + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ══════════════════════════════════════════
     10. VIDEO DE LA GALERÍA — reproduce al pasar / tocar
     ══════════════════════════════════════════ */
  (function galleryVideo() {
    $$('.g-video').forEach(function (fig) {
      var v = $('video', fig);
      if (!v) return;
      var play = function () {
        fig.classList.add('playing');
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      };
      var pause = function () { v.pause(); fig.classList.remove('playing'); };
      fig.addEventListener('mouseenter', play);
      fig.addEventListener('mouseleave', pause);
      fig.addEventListener('click', function () {
        v.paused ? play() : pause();
      });
      if ('IntersectionObserver' in window) {         // en móvil: al entrar en pantalla
        new IntersectionObserver(function (es) {
          es[0].isIntersecting ? play() : pause();
        }, { threshold: 0.55 }).observe(fig);
      }
    });
  })();

  /* ══════════════════════════════════════════
     11. FORMULARIO → WHATSAPP (nunca correo)
     ══════════════════════════════════════════ */
  (function waForm() {
    var form = $('#wa-form');
    if (!form) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="fa-brands fa-whatsapp"></i><span></span>';
    document.body.appendChild(toast);

    function say(msg) {
      $('span', toast).textContent = msg;
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3600);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name  = $('#f-name').value.trim();
      var phone = $('#f-phone').value.trim();
      var what  = $('#f-interest').value;
      var msg   = $('#f-msg').value.trim();

      var bad = false;
      [['#f-name', name], ['#f-msg', msg]].forEach(function (p) {
        var el = $(p[0]);
        var invalid = p[1].length < 2;
        el.classList.toggle('err', invalid);
        if (invalid && !bad) { el.focus(); bad = true; }
      });
      if (bad) { say('Completa tu nombre y el detalle del proyecto'); return; }

      var text =
        '*Nueva solicitud desde el sitio web*%0A%0A' +
        '*Nombre:* ' + encodeURIComponent(name) + '%0A' +
        (phone ? '*Teléfono:* ' + encodeURIComponent(phone) + '%0A' : '') +
        '*Servicio de interés:* ' + encodeURIComponent(what) + '%0A' +
        '*Detalle:* ' + encodeURIComponent(msg) + '%0A%0A' +
        'Quedo atento a su cotización.';

      say('Abriendo WhatsApp…');
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + text, '_blank', 'noopener');
      form.reset();
    });

    $$('.form-control', form).forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('err'); });
    });
  })();

  /* ══════════════════════════════════════════
     12. DETALLES FINALES
     ══════════════════════════════════════════ */
  (function misc() {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    // Desplazamiento suave con compensación del navbar fijo
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        var top = t.getBoundingClientRect().top + window.pageYOffset -
                  (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 84) + 1;
        window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    });
  })();

})();

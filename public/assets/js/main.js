document.documentElement.classList.remove('no-js');

(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('reduce');

  /* ---------- Apertura: colata di crema (una volta per sessione) ---------- */
  var colata = document.querySelector('.colata');
  var giaVista = false;
  try { giaVista = sessionStorage.getItem('lbg_colata') === '1'; sessionStorage.setItem('lbg_colata', '1'); } catch (e) {}

  function fineColata() {
    if (colata && !colata.classList.contains('colata--done')) colata.classList.add('colata--done');
  }
  if (!colata || reduce || giaVista) {
    root.classList.add('colata-skip');
    fineColata();
  } else {
    var choco = colata.querySelector('.colata__layer--choco');
    if (choco) choco.addEventListener('animationend', fineColata);
    setTimeout(fineColata, 3600);
    ['wheel', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
      colata.addEventListener(ev, fineColata, { passive: true, once: true });
    });
    window.addEventListener('keydown', fineColata, { once: true });
  }

  var avviato = false;
  function avvia() {
    if (avviato) return; avviato = true;
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  }
  window.addEventListener('load', avvia);
  setTimeout(avvia, 1400);

  /* ---------- Navigazione ---------- */
  var nav = document.querySelector('[data-nav]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('menu-mobile');
  function chiudiMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Apri il menu';
    root.classList.remove('menu-open');
    if (nav) nav.classList.toggle('nav--solid', window.scrollY > 40 || !document.querySelector('[data-hero]'));
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var apri = menu.hidden;
      if (!apri) { chiudiMenu(); return; }
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.sr-only').textContent = 'Chiudi il menu';
      root.classList.add('menu-open');
      if (nav) nav.classList.add('nav--solid');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) chiudiMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudiMenu(); });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) chiudiMenu(); });
  }

  /* ---------- Rivelazioni allo scroll ---------- */
  var targets = document.querySelectorAll('[data-reveal], [data-collage]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Effetti legati allo scroll ---------- */
  var hero = document.querySelector('[data-hero]');
  var apertura = document.querySelector('[data-apertura]');
  var fab = document.querySelector('[data-fab]');
  var fine = document.getElementById('contatti');
  var ticking = false;

  function clamp(v) { return Math.min(1, Math.max(0, v)); }

  function update() {
    ticking = false;
    var y = window.scrollY, h = window.innerHeight;
    if (nav && hero && !root.classList.contains('menu-open')) nav.classList.toggle('nav--solid', y > 40);

    if (!reduce && hero) {
      hero.style.setProperty('--hp', clamp(y / hero.offsetHeight).toFixed(3));
    }
    if (!reduce && apertura) {
      var r = apertura.getBoundingClientRect();
      var tot = r.height - h;
      if (tot > 0) apertura.style.setProperty('--p', clamp(-r.top / tot).toFixed(3));
    }
    if (fab) {
      var oltreHero = y > h * 0.8;
      var allaFine = fine ? fine.getBoundingClientRect().top < h * 0.9 : false;
      fab.classList.toggle('fab--show', oltreHero && !allaFine);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

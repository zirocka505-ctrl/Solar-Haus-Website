'use strict';

/* ============================================================
   SolarVolt – Unified GSAP Animation Layer
   ============================================================ */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile       = window.innerWidth < 768;

/* ============================================================
   UTILITY — split heading text into per-character spans
   Preserves <br> and child elements (e.g. .showcase-accent)
   ============================================================ */
function splitChars(el) {
  const nodes = [...el.childNodes];
  el.innerHTML = '';

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      [...node.textContent].forEach(ch => {
        if (ch === ' ' || ch === '\u00A0') {
          el.appendChild(document.createTextNode('\u00A0'));
        } else {
          const wrap  = document.createElement('span');
          const inner = document.createElement('span');
          wrap.className  = 'char-wrap';
          inner.className = 'char';
          inner.textContent = ch;
          wrap.appendChild(inner);
          el.appendChild(wrap);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        el.appendChild(document.createElement('br'));
      } else {
        const cloned = node.cloneNode(false);
        [...node.textContent].forEach(ch => {
          if (ch === ' ' || ch === '\u00A0') {
            cloned.appendChild(document.createTextNode('\u00A0'));
          } else {
            const wrap  = document.createElement('span');
            const inner = document.createElement('span');
            wrap.className  = 'char-wrap';
            inner.className = 'char';
            inner.textContent = ch;
            wrap.appendChild(inner);
            cloned.appendChild(wrap);
          }
        });
        el.appendChild(cloned);
      }
    }
  });

  return el.querySelectorAll('.char');
}

/* ============================================================
   UTILITY — animate a section heading
   Desktop: letter-by-letter  |  Mobile / reduced: simple fade
   ============================================================ */
function animateHeading(el, trigger, { delay = 0, start = 'top 82%' } = {}) {
  if (!el) return;

  if (prefersReduced || isMobile) {
    gsap.from(el, {
      scrollTrigger: { trigger: trigger || el, start, once: true },
      opacity: 0, y: 22, duration: 0.7, delay, ease: 'power3.out',
    });
    return;
  }

  const chars = splitChars(el);
  if (!chars.length) return;

  gsap.set(chars, { y: '108%', opacity: 0 });
  ScrollTrigger.create({
    trigger: trigger || el,
    start,
    once: true,
    onEnter: () => {
      gsap.to(chars, {
        y: '0%',
        opacity: 1,
        stagger: { each: 0.026, ease: 'power1.inOut' },
        duration: 0.5,
        delay,
        ease: 'power3.out',
      });
    },
  });
}

/* ============================================================
   UTILITY — animate subtext (fade + slide up)
   ============================================================ */
function animateSub(el, trigger, { delay = 0, x = 0, start = 'top 82%' } = {}) {
  if (!el) return;
  gsap.from(el, {
    scrollTrigger: { trigger: trigger || el, start, once: true },
    opacity: 0, y: 20, x,
    duration: 0.78, delay, ease: 'power3.out',
  });
}

/* ============================================================
   UTILITY — section tag slide in from left
   ============================================================ */
function animateTag(el, trigger, delay = 0) {
  if (!el) return;
  gsap.from(el, {
    scrollTrigger: { trigger: trigger || el, start: 'top 85%', once: true },
    opacity: 0, x: -18, duration: 0.5, delay, ease: 'power3.out',
  });
}

/* ============================================================
   PROGRESS BAR
   ============================================================ */
const progressBar = $('#progress-bar');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const t = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (h > 0 ? (t / h) * 100 : 0) + '%';
  }, { passive: true });
}

/* ============================================================
   NAVBAR
   ============================================================ */
const navbar    = $('.navbar');
const sttBtn    = $('.scroll-top');
const burger    = $('.nav-burger');
const mobileNav = $('.mobile-nav');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('solid', window.scrollY > 44);
  if (sttBtn) sttBtn.classList.toggle('show', window.scrollY > 520);
}, { passive: true });

if (sttBtn) {
  sttBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    if (!prefersReduced && open) {
      gsap.fromTo(mobileNav.querySelectorAll('a'),
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.35, ease: 'power2.out' }
      );
    }
  });
  mobileNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
    })
  );
}

/* Smooth scroll */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const tgt = $(a.getAttribute('href'));
  if (tgt) { e.preventDefault(); tgt.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
});

/* ============================================================
   RIPPLE — all .btn-ripple elements
   ============================================================ */
$$('.btn-ripple').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const c    = document.createElement('span');
    c.className = 'ripple-circle';
    Object.assign(c.style, {
      width:  size + 'px', height: size + 'px',
      left: (e.clientX - rect.left - size / 2) + 'px',
      top:  (e.clientY - rect.top  - size / 2) + 'px',
    });
    this.appendChild(c);
    c.addEventListener('animationend', () => c.remove());
  });
});

/* ============================================================
   BUTTON HOVER — GSAP precision (desktop only)
   ============================================================ */
if (!prefersReduced && !isMobile) {

  /* Primary & nav CTA — scale pulse */
  $$('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mouseenter', () =>
      gsap.to(btn, { scale: 1.04, duration: 0.22, ease: 'power2.out' }));
    btn.addEventListener('mouseleave', () =>
      gsap.to(btn, { scale: 1, duration: 0.28, ease: 'power2.out' }));
    btn.addEventListener('mousedown', () =>
      gsap.to(btn, { scale: 0.97, duration: 0.1, ease: 'power2.in' }));
    btn.addEventListener('mouseup', () =>
      gsap.to(btn, { scale: 1.04, duration: 0.15, ease: 'back.out(2)' }));
  });

  /* Paper-plane icon — nudge on hover */
  $$('.btn-primary').forEach(btn => {
    const icon = btn.querySelector('.btn-icon');
    if (!icon) return;
    btn.addEventListener('mouseenter', () =>
      gsap.to(icon, { x: 3, y: -2, rotate: 12, duration: 0.28, ease: 'power2.out' }));
    btn.addEventListener('mouseleave', () =>
      gsap.to(icon, { x: 0, y: 0, rotate: 0, duration: 0.28, ease: 'power2.out' }));
  });

  /* Ghost button — subtle scale + arrow bob */
  $$('.btn-ghost').forEach(btn => {
    const arrow = btn.querySelector('.btn-arrow');
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.02, duration: 0.22, ease: 'power2.out' });
      if (arrow) gsap.to(arrow, { y: 4, duration: 0.32, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.28, ease: 'power2.out' });
      if (arrow) gsap.to(arrow, { y: 0, duration: 0.28, ease: 'power2.out' });
    });
  });

  /* Form submit button — separate class, same treatment */
  const formSubmit = $('.form-submit');
  if (formSubmit) {
    formSubmit.addEventListener('mouseenter', () =>
      gsap.to(formSubmit, { scale: 1.02, duration: 0.22, ease: 'power2.out' }));
    formSubmit.addEventListener('mouseleave', () =>
      gsap.to(formSubmit, { scale: 1, duration: 0.28, ease: 'power2.out' }));
  }
}

/* ============================================================
   ICON HOVER MICRO-ANIMATION
   ============================================================ */
if (!prefersReduced) {
  $$('.benefit-icon, .detail-icon, .step-num').forEach(icon => {
    icon.addEventListener('mouseenter', () =>
      gsap.to(icon, { scale: 1.1, duration: 0.26, ease: 'back.out(2)' }));
    icon.addEventListener('mouseleave', () =>
      gsap.to(icon, { scale: 1, duration: 0.28, ease: 'power2.out' }));
  });

  /* Logo spin */
  const logoMark = $('.logo-mark');
  if (logoMark) {
    let spinning = false;
    logoMark.closest('.nav-logo').addEventListener('mouseenter', () => {
      if (spinning) return;
      spinning = true;
      gsap.to(logoMark, {
        rotation: 180, duration: 0.5, ease: 'power2.inOut',
        onComplete: () => { spinning = false; }
      });
    });
    logoMark.closest('.nav-logo').addEventListener('mouseleave', () =>
      gsap.to(logoMark, { rotation: 0, duration: 0.4, ease: 'power2.out' })
    );
  }
}

/* ============================================================
   HERO — on-load
   ============================================================ */
if (!prefersReduced) {
  /* Pulsing trust dots */
  gsap.fromTo('.trust-dot',
    { scale: 0 },
    { scale: 1, stagger: 0.15, duration: 0.4, delay: 1.4, ease: 'back.out(2)' }
  );

  /* Hero parallax (desktop) */
  if (!isMobile) {
    gsap.to('.hero-inner', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
    });
  }
}

/* ============================================================
   STATS STRIP — counters + entrance
   ============================================================ */
$$('.counter').forEach(el => {
  const target   = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals ?? '0');
  ScrollTrigger.create({
    trigger: el, start: 'top 82%', once: true,
    onEnter: () => {
      if (prefersReduced) {
        el.textContent = decimals === 0
          ? Math.round(target).toLocaleString('de-DE')
          : target.toFixed(decimals);
        return;
      }
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2.2, ease: 'power3.out',
        onUpdate() {
          el.textContent = decimals === 0
            ? Math.round(obj.val).toLocaleString('de-DE')
            : obj.val.toFixed(decimals);
        },
      });
    },
  });
});

if (!prefersReduced) {
  gsap.from('.stat-item', {
    scrollTrigger: { trigger: '.stats-strip', start: 'top 80%', once: true },
    opacity: 0, y: 28, stagger: 0.1, duration: 0.7, ease: 'power3.out',
  });
}

/* ============================================================
   SHOWCASE SECTION
   ============================================================ */
animateTag($('.showcase-tag'), $('.showcase'));
animateHeading($('.showcase-title'), $('.showcase'), { start: 'top 78%' });
animateSub($('.showcase-sub'), $('.showcase'), {
  delay: prefersReduced || isMobile ? 0 : 0.55,
  start: 'top 78%',
});

/* ============================================================
   GALLERY — scale + opacity scrub per photo
   ============================================================ */
$$('.photo-inner').forEach(el => {
  if (prefersReduced) return;
  gsap.fromTo(el,
    { scale: 0.88, opacity: 0, y: 36 },
    {
      scale: 1, opacity: 1, y: 0,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'center 58%', scrub: 0.7 },
    }
  );
});

/* ============================================================
   BENEFITS SECTION
   ============================================================ */
animateTag($('.benefits .section-tag'), $('.benefits'));
animateHeading($('.benefits .section-title'), $('.benefits'), { delay: 0.08 });
animateSub($('.benefits .section-desc'), $('.benefits'), { delay: 0.14 });

if (!prefersReduced) {
  gsap.from('.benefit-card', {
    scrollTrigger: { trigger: '.benefits-grid', start: 'top 80%', once: true },
    opacity: 0, y: 48, rotateX: 6,
    transformOrigin: 'top center',
    stagger: { each: 0.12, ease: 'power2.out' },
    duration: 0.85, ease: 'power3.out', clearProps: 'transform',
  });

  $$('.benefit-icon').forEach((icon, i) => {
    gsap.fromTo(icon,
      { scale: 0.7, opacity: 0, rotate: -10 },
      {
        scale: 1, opacity: 1, rotate: 0, duration: 0.6,
        delay: 0.18 + i * 0.12, ease: 'back.out(1.7)',
        scrollTrigger: { trigger: icon.closest('.benefit-card'), start: 'top 82%', once: true },
      }
    );
  });
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
animateTag($('.how .section-tag'), $('.how'));
animateHeading($('.how .section-title'), $('.how'), { delay: 0.08 });
animateSub($('.how-desc'), $('.how'), { delay: 0.14 });

if (!prefersReduced) {
  gsap.from('.step', {
    scrollTrigger: {
      trigger: '.steps', start: 'top 75%', once: true,
      onEnter: () => setTimeout(() => $('.steps')?.classList.add('line-drawn'), 200),
    },
    opacity: 0, y: 44, stagger: 0.18, duration: 0.85, ease: 'power3.out',
  });

  $$('.step-num').forEach((num, i) => {
    gsap.from(num, {
      scale: 0, opacity: 0, duration: 0.55,
      delay: 0.28 + i * 0.18, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: '.steps', start: 'top 75%', once: true },
    });
  });
}

/* ============================================================
   CALCULATOR SECTION
   ============================================================ */
animateTag($('.calc-tag'), $('.calculator'));
animateHeading($('.calculator .section-title'), $('.calculator'), { delay: 0.08 });
animateSub($('.calculator .section-desc'), $('.calculator'), { delay: 0.14 });

if (!prefersReduced) {
  const xOffset = isMobile ? 0 : 36;
  const yOffset = isMobile ? 22 : 0;

  gsap.from('.calc-input-panel', {
    scrollTrigger: { trigger: '.calc-layout', start: 'top 78%', once: true },
    opacity: 0, x: -xOffset, y: yOffset, duration: 0.9, ease: 'power3.out',
  });
  gsap.from('.calc-result-panel', {
    scrollTrigger: { trigger: '.calc-layout', start: 'top 78%', once: true },
    opacity: 0, x: xOffset, y: yOffset, duration: 0.9, delay: 0.12, ease: 'power3.out',
  });
  gsap.from('.calc-result-card', {
    scrollTrigger: { trigger: '.calc-result-grid', start: 'top 80%', once: true },
    opacity: 0, y: 20, stagger: 0.1, duration: 0.6, delay: 0.28, ease: 'power3.out',
  });
}

/* ============================================================
   CONTACT SECTION
   ============================================================ */
animateTag($('.contact .section-tag'), $('#kontakt'));
animateHeading($('.contact-left h2'), $('.contact-layout'), { delay: 0.06, start: 'top 80%' });
animateSub($('.contact-left > p'), $('.contact-layout'), { delay: 0.2, start: 'top 80%' });

if (!prefersReduced) {
  const cXoff = isMobile ? 0 : 44;
  const cYoff = isMobile ? 22 : 0;

  gsap.from('.contact-left', {
    scrollTrigger: { trigger: '.contact-layout', start: 'top 78%', once: true },
    opacity: 0, x: -cXoff, y: cYoff, duration: 0.9, ease: 'power3.out',
  });
  gsap.from('.contact-form', {
    scrollTrigger: { trigger: '.contact-layout', start: 'top 78%', once: true },
    opacity: 0, x: cXoff, y: cYoff, duration: 0.9, delay: 0.1, ease: 'power3.out',
  });
  gsap.from('.contact-detail', {
    scrollTrigger: { trigger: '.contact-details', start: 'top 80%', once: true },
    opacity: 0, x: -20, stagger: 0.1, duration: 0.6, ease: 'power3.out',
  });
  gsap.from('.field', {
    scrollTrigger: { trigger: '.contact-form', start: 'top 78%', once: true },
    opacity: 0, y: 16, stagger: 0.07, duration: 0.5, delay: 0.2, ease: 'power2.out',
  });
}

/* ============================================================
   FOOTER
   ============================================================ */
if (!prefersReduced) {
  gsap.from('.footer-brand, .footer-links', {
    scrollTrigger: { trigger: '.footer', start: 'top 88%', once: true },
    opacity: 0, y: 24, stagger: 0.1, duration: 0.7, ease: 'power3.out',
  });
}

/* ============================================================
   CONTACT FORM — validation + submit
   ============================================================ */
const form = $('#contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const invalid = !f.value.trim();
      if (invalid && !prefersReduced) {
        gsap.fromTo(f, { x: -7 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      }
      f.style.borderColor = invalid ? '#ef4444' : '';
      if (invalid) ok = false;
    });
    if (!ok) return;

    const btn = form.querySelector('.form-submit');
    if (!prefersReduced) gsap.to(btn, { scale: 0.97, duration: 0.1, yoyo: true, repeat: 1 });
    btn.textContent = 'Wird gesendet …';
    btn.disabled = true;

    setTimeout(() => {
      const success = form.closest('.contact-form').querySelector('.form-success');
      if (!prefersReduced) {
        gsap.to(form, {
          opacity: 0, y: -12, duration: 0.4, ease: 'power2.in',
          onComplete: () => {
            form.style.display = 'none';
            success.style.display = 'block';
            gsap.from(success, { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' });
            gsap.from(success.querySelector('i'), {
              scale: 0, rotation: -90, duration: 0.6, delay: 0.15, ease: 'back.out(1.8)',
            });
          },
        });
      } else {
        form.style.display = 'none';
        success.style.display = 'block';
      }
    }, 1300);
  });

  form.querySelectorAll('input, textarea, select').forEach(f =>
    f.addEventListener('input', () => { f.style.borderColor = ''; })
  );
}

/* ============================================================
   COST CALCULATOR — live calculation + smooth counters
   ============================================================ */
(function () {
  const sqmInput    = $('#calc-sqm');
  const sliderInput = $('#calc-slider');
  if (!sqmInput || !sliderInput) return;

  const PRICE_PER_KWP    = 1700;
  const ROOF_SQM_PER_KWP = 8;
  const ROOF_RATIO       = 0.3;
  const KWH_PER_KWP      = 950;
  const ELECTRICITY_EUR  = 0.33;

  const CONFIG = {
    dach: { min: 10,  max: 300, step: 5,  default: 40,  label: 'Dachfläche eingeben (m²)', sliderMin: '10 m²',  sliderMax: '300 m²' },
    wohn: { min: 40,  max: 500, step: 10, default: 120, label: 'Wohnfläche eingeben (m²)', sliderMin: '40 m²',  sliderMax: '500 m²' },
  };

  let mode = 'dach';

  const elKwp     = $('#res-kwp');
  const elPrice   = $('#res-price');
  const elSavings = $('#res-savings');
  const elPayback = $('#res-payback');
  const labelText = $('#calc-label-text');
  const sliderMin = $('#calc-slider-min');
  const sliderMax = $('#calc-slider-max');

  /* Active tweens per key — kill before re-animating for rapid input */
  const tweens = {};

  function animateNum(key, el, targetVal, formatter) {
    if (!el) return;
    if (tweens[key]) tweens[key].kill();
    const startVal = parseFloat(el.dataset.animVal || '0') || 0;
    const obj = { val: startVal };
    tweens[key] = gsap.to(obj, {
      val: targetVal,
      duration: 0.55,
      ease: 'power2.out',
      onUpdate() { el.textContent = formatter(obj.val); },
      onComplete() { el.dataset.animVal = targetVal; },
    });
  }

  function flash(el) {
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  function fmt(n, dec = 0) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function calculate(rawInput) {
    const cfg = CONFIG[mode];
    rawInput = Math.max(cfg.min, Math.min(cfg.max, parseFloat(rawInput) || cfg.min));

    const roofSqm = mode === 'dach' ? rawInput : rawInput * ROOF_RATIO;
    const kwp     = roofSqm / ROOF_SQM_PER_KWP;
    const price   = kwp * PRICE_PER_KWP;
    const savings = kwp * KWH_PER_KWP * ELECTRICITY_EUR;
    const payback = price / savings;

    if (!prefersReduced) {
      animateNum('kwp',     elKwp,     kwp,    v => fmt(v, 1) + ' kWp');
      animateNum('price',   elPrice,   price,  v => fmt(Math.round(v * 0.85)) + '–' + fmt(Math.round(v * 1.15)) + ' €');
      animateNum('savings', elSavings, savings, v => 'ca. ' + fmt(v) + ' €');
      animateNum('payback', elPayback, payback, v => fmt(v, 1) + ' J.');
    } else {
      elKwp.textContent     = fmt(kwp, 1) + ' kWp';
      elPrice.textContent   = fmt(Math.round(price * 0.85)) + '–' + fmt(Math.round(price * 1.15)) + ' €';
      elSavings.textContent = 'ca. ' + fmt(savings) + ' €';
      elPayback.textContent = fmt(payback, 1) + ' J.';
    }

    flash(elKwp); flash(elPrice); flash(elSavings); flash(elPayback);
  }

  function applyConfig() {
    const cfg = CONFIG[mode];
    sqmInput.min  = sliderInput.min  = cfg.min;
    sqmInput.max  = sliderInput.max  = cfg.max;
    sqmInput.step = sliderInput.step = cfg.step;
    sqmInput.value = sliderInput.value = cfg.default;
    if (labelText) labelText.textContent = cfg.label;
    if (sliderMin) sliderMin.textContent = cfg.sliderMin;
    if (sliderMax) sliderMax.textContent = cfg.sliderMax;
    /* Reset stored vals so counter starts from 0 on mode switch */
    [elKwp, elPrice, elSavings, elPayback].forEach(el => {
      if (el) el.dataset.animVal = '0';
    });
    calculate(cfg.default);
  }

  /* Type toggle */
  $$('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.type;
      if (!prefersReduced) gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      applyConfig();
    });
  });

  /* Sync slider ↔ number input */
  sqmInput.addEventListener('input', () => {
    const v = parseFloat(sqmInput.value) || CONFIG[mode].min;
    sliderInput.value = Math.min(CONFIG[mode].max, Math.max(CONFIG[mode].min, v));
    calculate(v);
  });

  sliderInput.addEventListener('input', () => {
    sqmInput.value = sliderInput.value;
    calculate(parseFloat(sliderInput.value));
  });

  applyConfig();
})();

/* ============================================================
   COOKIE CONSENT BANNER
   ============================================================ */
(function () {
  const banner      = document.getElementById('cookie-banner');
  const btnAccept   = document.getElementById('cookie-accept');
  const btnDecline  = document.getElementById('cookie-decline');
  if (!banner || !btnAccept || !btnDecline) return;

  const STORAGE_KEY = 'sv-cookie-consent';

  /* Already decided — don't show */
  if (localStorage.getItem(STORAGE_KEY)) return;

  /* ── Show banner after short delay ── */
  function showBanner() {
    banner.style.display = 'block';

    if (prefersReduced) {
      gsap.from(banner, { opacity: 0, duration: 0.5, ease: 'power2.out' });
    } else {
      gsap.from(banner, {
        y: '100%',
        opacity: 0,
        duration: 0.65,
        ease: 'power4.out',
      });
    }

    /* ── Animate cookie icons once visible ── */
    if (!prefersReduced) {
      /* Each crumb gets its own looping idle animation */
      gsap.to('.cookie-crumb--a', {
        y: -6,
        rotate: 8,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.cookie-crumb--b', {
        y: -4,
        rotate: -10,
        duration: 1.9,
        delay: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      gsap.to('.cookie-crumb--c', {
        y: -3,
        rotate: 14,
        duration: 1.5,
        delay: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      /* Subtle scale pulse on the large cookie */
      gsap.to('.cookie-crumb--a', {
        scale: 1.08,
        duration: 3,
        delay: 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      /* GSAP button hover glow for accept */
      btnAccept.addEventListener('mouseenter', () => {
        gsap.to(btnAccept, { scale: 1.04, duration: 0.22, ease: 'power2.out' });
      });
      btnAccept.addEventListener('mouseleave', () => {
        gsap.to(btnAccept, { scale: 1, duration: 0.28, ease: 'power2.out' });
      });

      btnDecline.addEventListener('mouseenter', () => {
        gsap.to(btnDecline, { scale: 1.03, duration: 0.22, ease: 'power2.out' });
      });
      btnDecline.addEventListener('mouseleave', () => {
        gsap.to(btnDecline, { scale: 1, duration: 0.28, ease: 'power2.out' });
      });

      /* Cookie icon highlight on hover */
      document.querySelectorAll('.cookie-crumb').forEach(crumb => {
        crumb.addEventListener('mouseenter', () => {
          gsap.to(crumb, { scale: 1.25, duration: 0.25, ease: 'back.out(2)' });
        });
        crumb.addEventListener('mouseleave', () => {
          gsap.to(crumb, { scale: 1, duration: 0.3, ease: 'power2.out' });
        });
      });
    }
  }

  /* ── Dismiss banner with animation ── */
  function dismissBanner(type, celebrateAccept) {
    localStorage.setItem(STORAGE_KEY, type);

    if (prefersReduced) {
      banner.style.display = 'none';
      return;
    }

    if (celebrateAccept) {
      /* Cookies fly off on accept */
      gsap.to('.cookie-crumb--a', { y: -80, x: -30, rotate: 360, opacity: 0, duration: 0.7, ease: 'power2.in' });
      gsap.to('.cookie-crumb--b', { y: -60, x: 20,  rotate: -270, opacity: 0, duration: 0.6, delay: 0.08, ease: 'power2.in' });
      gsap.to('.cookie-crumb--c', { y: -50, x: 10,  rotate: 180,  opacity: 0, duration: 0.5, delay: 0.16, ease: 'power2.in' });
    }

    gsap.to(banner, {
      y: '100%',
      opacity: 0,
      duration: 0.5,
      delay: celebrateAccept ? 0.3 : 0,
      ease: 'power3.in',
      onComplete: () => { banner.style.display = 'none'; },
    });
  }

  btnAccept.addEventListener('click',  () => dismissBanner('accepted', true));
  btnDecline.addEventListener('click', () => dismissBanner('declined', false));

  /* Delay before showing — let the page settle */
  setTimeout(showBanner, 1600);
})();

/* ============================================================
   THEME SWITCHER — light / dark toggle
   ============================================================ */
(function () {
  const html      = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  const STORAGE_KEY = 'sv-theme';

  /* ── Apply theme, optionally with smooth transition ── */
  function applyTheme(theme, withTransition) {
    if (withTransition) {
      html.classList.add('theme-transitioning');
      setTimeout(() => html.classList.remove('theme-transitioning'), 480);
    }
    if (theme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
    localStorage.setItem(STORAGE_KEY, theme);
    updateAriaLabel(theme);
  }

  function updateAriaLabel(theme) {
    toggleBtn.setAttribute('aria-label',
      theme === 'light' ? 'Zu Dunkel-Modus wechseln' : 'Zu Hell-Modus wechseln'
    );
  }

  /* ── Animate the toggle button icon ── */
  function animateToggle(toLight) {
    if (prefersReduced) return;
    /* Spin + scale exit */
    gsap.to(toggleBtn, {
      rotate:   toLight ? -180 : 180,
      scale:    0.7,
      duration: 0.18,
      ease:     'power2.in',
      onComplete() {
        /* Switch icon mid-animation then spring back */
        gsap.fromTo(toggleBtn,
          { rotate: toLight ? 180 : -180, scale: 0.7 },
          { rotate: 0, scale: 1, duration: 0.42, ease: 'back.out(2.2)' }
        );
      },
    });
  }

  /* ── Click handler ── */
  toggleBtn.addEventListener('click', () => {
    const isLight = html.classList.contains('light');
    const next    = isLight ? 'dark' : 'light';
    animateToggle(!isLight);
    /* Slight delay so icon flip happens mid-spin */
    setTimeout(() => applyTheme(next, true), 100);
  });

  /* ── Hover micro-animation (desktop only) ── */
  if (!prefersReduced && !isMobile) {
    toggleBtn.addEventListener('mouseenter', () => {
      gsap.to(toggleBtn, { rotate: 20, duration: 0.3, ease: 'power2.out' });
    });
    toggleBtn.addEventListener('mouseleave', () => {
      gsap.to(toggleBtn, { rotate: 0, duration: 0.3, ease: 'power2.out' });
    });
  }

  /* ── Restore saved theme on load (no animation) ── */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light') {
    html.classList.add('light');
    updateAriaLabel('light');
  } else {
    updateAriaLabel('dark');
  }
})();

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = document.querySelector('.nav');
  const burger = nav.querySelector('.burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const thumbs = [...document.querySelectorAll('.thumbs button')];
  const caption = document.getElementById('caption');
  const n = slides.length;
  let pos = 0;

  function render() {
    const shift = innerWidth < 768 ? 30 : 46;
    slides.forEach((s, i) => {
      let d = ((i - pos) % n + n) % n;
      if (d >= n / 2) d -= n;
      const a = Math.min(Math.abs(d), 1);
      s.style.transform = `translateX(${d * shift}%) scale(${1 - .28 * a})`;
      s.style.opacity = Math.abs(d) <= 1 ? 1 - .45 * a : Math.max(0, .55 - (Math.abs(d) - 1) * 1.2);
      s.style.filter = `brightness(${1 - .65 * a}) saturate(${1 - .3 * a})`;
      s.style.zIndex = 10 - Math.round(Math.abs(d) * 3);
      s.classList.toggle('c', Math.abs(d) < .5);
      s.setAttribute('aria-hidden', Math.abs(d) >= .5);
    });
    const cur = ((Math.round(pos) % n) + n) % n;
    thumbs.forEach((t, i) => t.setAttribute('aria-selected', i === cur));
    caption.textContent = thumbs[cur].dataset.cap;
  }
  const cur = () => Math.round(pos);
  const go = i => { pos = i; render(); };

  thumbs.forEach(t => t.addEventListener('click', () => {
    const target = +t.dataset.go, c = ((cur() % n) + n) % n;
    let d = target - c; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
    go(cur() + d);
  }));

  const shots = document.getElementById('shots');
  document.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const r = shots.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    go(cur() + (e.key === 'ArrowRight' ? 1 : -1));
  });

  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, pos, moved: false, slide: e.target.closest('.slide') };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4 && !drag.moved) { drag.moved = true; stage.classList.add('drag'); }
    if (!drag.moved) return;
    pos = drag.pos - dx / (stage.clientWidth * (innerWidth < 768 ? .3 : .46));
    render();
  });
  const end = () => {
    if (!drag) return;
    stage.classList.remove('drag');
    if (drag.moved) {
      const v = pos - drag.pos;
      go(Math.abs(v) > .15 && Math.abs(v) < .5 ? drag.pos + Math.sign(v) : Math.round(pos));
    } else if (drag.slide) {
      const i = +drag.slide.dataset.i, c = ((cur() % n) + n) % n;
      let d = i - c; if (d > n / 2) d -= n;
      if (d) go(cur() + d);
    }
    drag = null;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  let wheelAcc = 0, wheelLock = 0;
  stage.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (Date.now() < wheelLock) return;
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 60) { go(cur() + (wheelAcc > 0 ? 1 : -1)); wheelAcc = 0; wheelLock = Date.now() + 700; }
  }, { passive: false });
  addEventListener('resize', render);
  render();

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const native = document.querySelector('.native');
  const nio = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { setTimeout(() => native.classList.add('pop'), 500); nio.disconnect(); }
  }, { threshold: 0.6 });
  nio.observe(native);

  if (!reduce) {
    const wrap = document.querySelector('.stage-wrap');
    let ticking = false;
    const update = () => {
      const r = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - r.top / innerHeight));
      wrap.style.setProperty('--py', `${-p * 40}px`);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
})();

(() => {
  const cv = document.getElementById('nodes');
  const ctx = cv.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINK = 150, mouse = { x: -1e4, y: -1e4 };
  let w, h, dpr, pts = [];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, w * h / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.4 + .6
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * .14})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < LINK * 1.3) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - md / (LINK * 1.3)) * .25})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }

  addEventListener('resize', () => { resize(); if (reduce) frame(); });
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  resize(); frame();
})();

(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  const MAX = 9;
  const stage = document.getElementById('stage');
  const untilt = () => stage.querySelectorAll('.slide').forEach(sl => { sl.style.rotate = ''; sl.style.perspective = ''; });
  stage.addEventListener('pointermove', e => {
    const c = e.target.closest('.slide.c');
    if (e.pointerType !== 'mouse' || stage.classList.contains('drag') || !c) { untilt(); return; }
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    const ax = .5 - y, ay = x - .5, m = Math.hypot(ax, ay);
    c.style.rotate = m < .01 ? '' : `${ax} ${ay} 0 ${m * 10}deg`;
  });
  stage.addEventListener('pointerleave', untilt);
  stage.addEventListener('pointerdown', untilt);

  document.querySelectorAll('.f').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.classList.add('tilt');
      card.style.transform = `perspective(900px) rotateX(${(.5 - y) * MAX}deg) rotateY(${(x - .5) * MAX}deg) translateY(-4px)`;
      card.style.setProperty('--gx', x * 100 + '%');
      card.style.setProperty('--gy', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('tilt');
      card.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      card.style.transform = '';
      setTimeout(() => { card.style.transition = ''; }, 500);
    });
  });
})();

(() => {
  const lang = document.documentElement.lang || 'ru';
  const L = { ru: ['Версия', 'обновлено'], en: ['Version', 'updated'], zh: ['版本', '更新于'], ja: ['バージョン', '更新日'] }[lang] || ['Version', 'updated'];
  document.querySelectorAll('.upd').forEach(el => {
    const date = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(el.dataset.date + 'T12:00:00'));
    el.textContent = `${L[0]} ${el.dataset.ver} · ${L[1]} ${date}`;
  });
})();

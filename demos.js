(() => {
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; };
  const lang = document.documentElement.lang;
  const L = (ru, en) => (lang === 'ru' ? ru : en);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const D = {
    eq(el) {
      const vals = [4, 6, 5, 2, 0, -1, 1, 3, 5, 4];
      el.append(h(`<div class="eq">${vals.map(v => `<span data-v="${v}"><i></i></span>`).join('')}</div><em class="hint">${L('тяни полосы', 'drag the bands')}</em>`));
      const bands = [...el.querySelectorAll('.eq span')];
      const set = (b, v) => { v = Math.max(-12, Math.min(12, v)); b.dataset.v = v; b.firstChild.style.height = (50 + v * 4) + '%'; };
      bands.forEach(b => set(b, +b.dataset.v));
      const eq = el.querySelector('.eq');
      let on = false;
      const move = e => {
        const r = eq.getBoundingClientRect();
        const b = bands[Math.max(0, Math.min(9, Math.floor((e.clientX - r.left) / r.width * 10)))];
        set(b, Math.round(((r.bottom - e.clientY) / r.height - .5) * 25));
      };
      eq.addEventListener('pointerdown', e => { on = true; eq.setPointerCapture(e.pointerId); move(e); });
      eq.addEventListener('pointermove', e => on && move(e));
      eq.addEventListener('pointerup', () => { on = false; });
    },

    xfade(el) {
      el.append(h(`<div class="xf"><svg viewBox="0 0 200 60" preserveAspectRatio="none"><path class="a"/><path class="b"/></svg></div>
        <label class="row"><input type="range" min="0" max="15" value="6" aria-label="${L('Длина кроссфейда', 'Crossfade length')}"><output>6 ${L('с', 's')}</output></label>`));
      const [a, b] = el.querySelectorAll('path'), r = el.querySelector('input'), o = el.querySelector('output');
      const draw = () => {
        const w = 10 + r.value * 8, m = 100;
        a.setAttribute('d', `M0 10 L${m - w / 2} 10 L${m + w / 2} 55`);
        b.setAttribute('d', `M${m - w / 2} 55 L${m + w / 2} 10 L200 10`);
        o.textContent = `${r.value} ${L('с', 's')}`;
      };
      r.addEventListener('input', draw); draw();
    },

    surround(el) {
      el.append(h(`<div class="sur"><span class="l"></span><span class="me"></span><span class="r"></span></div>
        <button class="tgl" aria-pressed="false"><i></i>${L('Объём', 'Wide')}</button>`));
      const b = el.querySelector('.tgl'), s = el.querySelector('.sur');
      b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); s.classList.toggle('on', on); });
    },

    word(el) {
      const words = L('и я снова слышу тебя', 'and I hear you again').split(' ');
      el.append(h(`<div class="wbw">${words.map(w => `<span>${w}</span>`).join(' ')}</div><em class="hint">${L('нажми, чтобы спеть заново', 'tap to sing again')}</em>`));
      const sp = [...el.querySelectorAll('.wbw span')];
      let i = 0, t;
      const tick = () => { sp.forEach((s, k) => s.classList.toggle('on', k <= i)); i = (i + 1) % (sp.length + 2); t = setTimeout(tick, 480); };
      el.addEventListener('click', () => { clearTimeout(t); i = 0; tick(); });
      if (!reduce) tick(); else sp.forEach(s => s.classList.add('on'));
    },

    bglyr(el) {
      el.append(h(`<div class="bgl"><div class="bgl-t">${L('ночь тянется медленно<br><b>город гаснет за окном</b><br>пока играет песня', 'the night goes slow<br><b>the city fades outside</b><br>while the song plays')}</div><div class="bgl-ui"><i></i><i></i><i></i></div></div>`));
      const t = el.querySelector('.bgl-t');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        t.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * -14}px,${((e.clientY - r.top) / r.height - .5) * -10}px)`;
      });
    },

    fx(el) {
      const names = [['snow', L('Снег', 'Snow')], ['stars', L('Звёзды', 'Stars')], ['meteor', L('Метеоры', 'Meteors')]];
      el.append(h(`<canvas></canvas><button class="pill"></button>`));
      const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), btn = el.querySelector('.pill');
      let k = 0, ps = [];
      const W = 300, H = 120; cv.width = W * 2; cv.height = H * 2; ctx.scale(2, 2);
      const init = () => {
        btn.textContent = names[k][1] + ' ↻';
        ps = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, v: Math.random() * .8 + .4, s: Math.random() * 1.6 + .4 }));
      };
      const step = () => {
        const m = names[k][0];
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = ctx.strokeStyle = 'rgba(255,255,255,.7)';
        for (const p of ps) {
          if (m === 'snow') { p.y += p.v * .7; p.x += Math.sin(p.y / 12) * .3; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); }
          else if (m === 'stars') { ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(Date.now() / 700 + p.x)); ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .8, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
          else { p.x += p.v * 4; p.y += p.v * 2; if (p.s > 1.5) { ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 18, p.y - 9); ctx.stroke(); } }
          if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
          if (p.x > W + 20) { p.x = -20; p.y = Math.random() * H * .5; }
        }
        if (!reduce) requestAnimationFrame(step);
      };
      el.addEventListener('click', () => { k = (k + 1) % names.length; init(); if (reduce) step(); });
      init(); step();
    },

    wall(el) {
      const bgs = ['linear-gradient(160deg,#2b2b33,#0c0c0e)', 'radial-gradient(circle at 30% 30%,#55506a,#101014 70%)', 'linear-gradient(120deg,#3a3a3a,#111 50%,#444)', 'repeating-linear-gradient(45deg,#1b1b20 0 8px,#26262d 8px 16px)'];
      el.append(h(`<div class="win"><div class="win-p"></div><div class="win-p"></div></div><div class="sw">${bgs.map((b, i) => `<button aria-label="${L('Обои', 'Wallpaper')} ${i + 1}" style="background:${b}"></button>`).join('')}</div>`));
      const win = el.querySelector('.win'), bs = [...el.querySelectorAll('.sw button')];
      const pick = i => { win.style.background = bgs[i]; bs.forEach((b, k) => b.classList.toggle('on', k === i)); };
      bs.forEach((b, i) => b.addEventListener('click', () => pick(i))); pick(1);
    },

    themes(el) {
      const cs = ['#ffffff', '#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];
      el.append(h(`<div class="mini"><span class="mini-bar"><i></i></span><span class="mini-btn"></span></div><div class="sw dots">${cs.map(c => `<button aria-label="${c}" style="background:${c}"></button>`).join('')}<label class="pick" aria-label="${L('Свой цвет', 'Custom color')}">+<input type="color" value="#c084fc"></label></div>`));
      const set = c => el.style.setProperty('--acc', c);
      el.querySelectorAll('.dots button').forEach(b => b.addEventListener('click', () => set(b.style.background)));
      el.querySelector('input').addEventListener('input', e => set(e.target.value));
      set(cs[0]);
    },

    skins(el) {
      const sk = [['ember', L('Тлеющие', 'Ember')], ['neon', L('Неон', 'Neon')], ['frost', L('Мороз', 'Frost')], ['glow', L('Сияние', 'Glow')], ['drops', L('Капли', 'Drops')]];
      el.append(h(`<div class="skin"><i></i><i></i><i></i><i></i><i></i><i></i></div><button class="pill"></button>`));
      const c = el.querySelector('.skin'), b = el.querySelector('.pill');
      let k = 0;
      const set = () => { c.className = 'skin ' + sk[k][0]; b.textContent = sk[k][1] + ' ↻'; };
      el.addEventListener('click', () => { k = (k + 1) % sk.length; set(); }); set();
    },

    viz(el) {
      const covers = ['#e9e9ee', '#8b5cf6', '#ff6fb5', '#38bdf8'];
      el.append(h(`<div class="viz"><div class="covers">${covers.map(c => `<button aria-label="${L('Обложка', 'Cover')}" style="background:linear-gradient(135deg,${c},#111)"></button>`).join('')}</div><div class="bars">${'<i></i>'.repeat(18)}</div></div>`));
      const bars = [...el.querySelectorAll('.bars i')], bs = [...el.querySelectorAll('.covers button')];
      const pick = i => { el.style.setProperty('--vc', covers[i]); bs.forEach((b, k) => b.classList.toggle('on', k === i)); };
      bs.forEach((b, i) => b.addEventListener('click', () => pick(i))); pick(1);
      const t0 = performance.now();
      const step = t => {
        bars.forEach((b, i) => { b.style.height = (18 + 70 * Math.abs(Math.sin((t - t0) / 380 + i * .7) * Math.cos((t - t0) / 900 + i * .3))) + '%'; });
        if (!reduce) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },

    folders(el) {
      el.append(h(`<ul class="tree">
        <li><button aria-expanded="true">📁 Music</button><ul>
          <li><button aria-expanded="false">📁 Night drive</button><ul><li>♪ track 01</li><li>♪ track 02</li></ul></li>
          <li><button aria-expanded="false">📁 Chill</button><ul><li>♪ track 03</li></ul></li>
        </ul></li></ul>`));
      el.querySelectorAll('.tree button').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true')));
    },

    genres(el) {
      const ex = [['alternative/indie rock; lo-fi', 'Indie'], ['synthwave / retrowave', 'Synthwave'], ['j-pop, anime soundtrack', 'J-Pop'], ['dream pop; shoegaze', 'Dream pop']];
      el.append(h(`<div class="gen"><code></code><span>→</span><b class="chip2"></b></div><em class="hint">${L('нажми для примера', 'tap for another')}</em>`));
      let k = 0;
      const set = () => { el.querySelector('code').textContent = ex[k][0]; el.querySelector('b').textContent = ex[k][1]; el.querySelector('.gen').classList.remove('go'); void el.offsetWidth; el.querySelector('.gen').classList.add('go'); };
      el.addEventListener('click', () => { k = (k + 1) % ex.length; set(); }); set();
    },

    tags(el) {
      const t = L('грустное ночное тренировка дорога осень', 'sad night workout road autumn').split(' ');
      el.append(h(`<div class="tags">${t.map((x, i) => `<button aria-pressed="${i === 1}">#${x}</button>`).join('')}</div>`));
      el.querySelectorAll('.tags button').forEach(b => b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true')));
    },

    recent(el) {
      const pool = ['Midnight', 'Low tide', 'Paper moon', 'Static', 'Glass', 'Afterglow', 'Northern', 'Echoes'];
      el.append(h(`<ol class="rec"></ol><button class="pill">▶ ${L('сыграть трек', 'play a track')}</button>`));
      const ol = el.querySelector('ol');
      const add = name => { const li = document.createElement('li'); li.textContent = name; ol.prepend(li); while (ol.children.length > 3) ol.lastChild.remove(); };
      ['Glass', 'Static', 'Low tide'].forEach(add);
      el.querySelector('.pill').addEventListener('click', () => add(pool[Math.floor(Math.random() * pool.length)]));
    },

    discord(el) {
      el.append(h(`<div class="rpc"><div class="rpc-c"></div><div><b>REcursive</b><span>Night drive — Static</span><div class="prog"><i></i></div></div></div>`));
      const i = el.querySelector('.prog i');
      let p = 20;
      setInterval(() => { p = p >= 100 ? 0 : p + 1; i.style.width = p + '%'; }, reduce ? 1e6 : 300);
    },

    telegram(el) {
      el.append(h(`<div class="tg"><p class="me">/dl Static</p><p class="bot"></p></div>`));
      const bot = el.querySelector('.bot');
      let t = [];
      const run = () => {
        t.forEach(clearTimeout);
        bot.textContent = L('ищу…', 'searching…');
        t = [setTimeout(() => bot.textContent = L('скачиваю… 64%', 'downloading… 64%'), 900),
             setTimeout(() => bot.textContent = L('✓ в папке Music', '✓ saved to Music'), 1900)];
      };
      el.addEventListener('click', run); run();
    },

    fps(el) {
      el.append(h(`<div class="fpsbox"><i></i></div><label class="row"><input type="range" min="30" max="144" value="60" aria-label="FPS"><output>60 FPS</output></label>`));
      const r = el.querySelector('input'), o = el.querySelector('output'), dot = el.querySelector('.fpsbox i');
      let last = 0, x = 0, dir = 1;
      const step = t => {
        if (t - last >= 1000 / r.value) {
          const dt = Math.min(t - last, 100); last = t;
          x += dir * dt * .12; if (x > 100 || x < 0) { dir *= -1; x = Math.max(0, Math.min(100, x)); }
          dot.style.left = x + '%';
        }
        if (!reduce) requestAnimationFrame(step);
      };
      r.addEventListener('input', () => { o.textContent = r.value + ' FPS'; });
      requestAnimationFrame(step);
    },

    shop(el) {
      el.append(h(`<div class="shop"><span class="coin"></span><b>120</b><button class="pill">${L('купить тему', 'buy theme')} · 80</button></div><em class="hint">${L('монеты капают сами', 'coins drip in by themselves')}</em>`));
      const b = el.querySelector('b'), btn = el.querySelector('.pill');
      let c = 120;
      const upd = () => { b.textContent = c; btn.disabled = c < 80; };
      setInterval(() => { c++; upd(); }, reduce ? 1e6 : 700);
      btn.addEventListener('click', () => { if (c >= 80) { c -= 80; upd(); el.querySelector('.shop').animate([{ transform: 'scale(1.06)' }, { transform: 'none' }], 300); } });
    },

    recap(el) {
      const w = [40, 65, 30, 85];
      el.append(h(`<div class="recap">${w.map((v, i) => `<div><i style="--h:${v}%"></i><span>${L('нед', 'wk')} ${i + 1}</span></div>`).join('')}</div>`));
    },

    langs(el) {
      const ls = [['RU', 'Музыка'], ['EN', 'Music'], ['中', '音乐'], ['日', '音楽']];
      el.append(h(`<div class="lw"></div><div class="seg">${ls.map(l => `<button>${l[0]}</button>`).join('')}</div>`));
      const w = el.querySelector('.lw'), bs = [...el.querySelectorAll('.seg button')];
      const pick = i => { w.textContent = ls[i][1]; bs.forEach((b, k) => b.classList.toggle('on', k === i)); };
      bs.forEach((b, i) => b.addEventListener('click', () => pick(i)));
      pick(Math.max(0, ['ru', 'en', 'zh', 'ja'].indexOf(lang)));
    }
  };

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    D[el.dataset.demo]?.(el);
  }), { rootMargin: '200px' });
  document.querySelectorAll('.demo').forEach(el => io.observe(el));
})();

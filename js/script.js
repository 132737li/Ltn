/* ==========================================================================
   Mini-site romantique — moteur JavaScript
   (la personnalisation se fait dans js/config.js)
   ========================================================================== */

(function () {
  'use strict';

  const CFG = window.ROMANCE_CONFIG || {};

  /* ------------------------------------------------------------------------
     1. Utilitaires
     ------------------------------------------------------------------------ */

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) =>
    Array.prototype.slice.call((scope || document).querySelectorAll(selector));

  const random = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const pick = (list) => list[randomInt(0, list.length - 1)];
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = randomInt(0, i);
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  const root = document.documentElement;
  const pageClass = (name) => body.classList.contains(name);

  function safeStorage(kind) {
    try {
      return window[kind];
    } catch (error) {
      return null;
    }
  }

  const session = safeStorage('sessionStorage');
  const local = safeStorage('localStorage');

  function store(area, key, value) {
    try {
      if (area) area.setItem(key, value);
    } catch (error) {
      /* quota ou stockage indisponible : on ignore */
    }
  }

  function read(area, key) {
    try {
      return area ? area.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  function readJSON(area, key, fallback) {
    try {
      const raw = read(area, key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  /* ------------------------------------------------------------------------
     2. Thème de couleur + emojis de cœurs
     ------------------------------------------------------------------------ */

  const HUE = parseFloat(getComputedStyle(root).getPropertyValue('--hue')) || 333;

  // Couleur HSL décalée par rapport à la teinte du thème (pour canvas / JS).
  const hsla = (delta, saturation, lightness, alpha) =>
    'hsla(' + ((((HUE + delta) % 360) + 360) % 360).toFixed(0) + ', ' +
    saturation + '%, ' + lightness + '%, ' + (alpha === undefined ? 1 : alpha) + ')';

  const HEART_SETS = {
    rose: ['💖', '💗', '💕', '💘', '💞', '🩷', '❤️'],
    rouge: ['❤️', '💘', '💕', '💖', '💗', '💞'],
    violet: ['💜', '💞', '💕', '💖'],
    bleu: ['💙', '🩵', '💞', '💕'],
    menthe: ['💚', '🩵', '💞', '💕'],
    orange: ['🧡', '💛', '💞', '💕']
  };

  const LOVE_HEARTS = HEART_SETS[CFG.theme] || HEART_SETS.rose;
  const LOVE_BITS = LOVE_HEARTS.concat(['✨', '🌸']);

  // Emojis des « cœurs » flottants : de vrais cœurs assortis au thème, sauf si
  // tu fournis ta propre liste dans js/config.js (floatingEmojis).
  const HEART_EMOJIS = Array.isArray(CFG.floatingEmojis) && CFG.floatingEmojis.length
    ? CFG.floatingEmojis
    : LOVE_HEARTS;
  let heartPool = HEART_EMOJIS;

  /* ------------------------------------------------------------------------
     3. Cycle de vie d'une page
        Les pages se changent SANS recharger le document (la musique ne
        s'interrompt jamais). Tout ce qu'une page installe est donc enregistré
        ici, puis nettoyé au moment de quitter la page.
     ------------------------------------------------------------------------ */

  let disposers = [];

  const onPage = (fn) => {
    disposers.push(fn);
  };

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    onPage(() => target.removeEventListener(type, handler, options));
  }

  function every(fn, ms) {
    const id = window.setInterval(fn, ms);
    onPage(() => window.clearInterval(id));
    return id;
  }

  function after(fn, ms) {
    const id = window.setTimeout(fn, ms);
    onPage(() => window.clearTimeout(id));
    return id;
  }

  /* ------------------------------------------------------------------------
     4. Cœurs flottants
     ------------------------------------------------------------------------ */

  let heartsLayer = $('#heartsLayer');
  if (!heartsLayer) {
    heartsLayer = document.createElement('div');
    heartsLayer.className = 'hearts-layer';
    heartsLayer.id = 'heartsLayer';
    heartsLayer.setAttribute('aria-hidden', 'true');
    body.appendChild(heartsLayer);
  }

  function teardown() {
    const list = disposers;
    disposers = [];
    list.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        /* ignore */
      }
    });
    heartsLayer.innerHTML = '';
  }

  function spawnHeart(options) {
    const opts = options || {};
    const size = opts.size !== undefined ? opts.size : random(15, 32);
    const duration = opts.duration !== undefined ? opts.duration : random(5, 8.5);
    const delay = opts.delay !== undefined ? opts.delay : 0;

    const heart = document.createElement('span');
    heart.className = 'heart';
    const pool = opts.emojis || heartPool;
    heart.textContent = pool[randomInt(0, pool.length - 1)];
    heart.setAttribute('aria-hidden', 'true');

    heart.style.left = (opts.left !== undefined ? opts.left : random(2, 96)) + 'vw';
    heart.style.fontSize = size.toFixed(1) + 'px';
    heart.style.animationDuration = duration.toFixed(2) + 's';
    heart.style.animationDelay = delay.toFixed(2) + 's';

    heartsLayer.appendChild(heart);

    window.setTimeout(() => {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, (duration + delay + 0.8) * 1000);
  }

  function burstHearts(count) {
    if (prefersReducedMotion) return;
    const total = count || 36;
    for (let i = 0; i < total; i += 1) {
      window.setTimeout(() => {
        spawnHeart({ size: random(18, 44), duration: random(3.4, 6.2), left: random(2, 96) });
      }, i * 34);
    }
  }

  /* ------------------------------------------------------------------------
     5. Effets globaux (une seule installation pour tout le site)
     ------------------------------------------------------------------------ */

  // Mini-cœurs qui jaillissent à l'endroit touché.
  function burstAt(x, y, count) {
    if (prefersReducedMotion || !Element.prototype.animate) return;

    for (let i = 0; i < count; i += 1) {
      const bit = document.createElement('span');
      bit.className = 'burst-bit';
      bit.textContent = pick(LOVE_BITS);
      bit.style.left = x + 'px';
      bit.style.top = y + 'px';
      bit.style.fontSize = random(12, 22).toFixed(0) + 'px';
      bit.setAttribute('aria-hidden', 'true');
      body.appendChild(bit);

      const angle = random(0, Math.PI * 2);
      const distance = random(36, 92);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - random(10, 40);

      const animation = bit.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
          {
            transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(1.1)',
            opacity: 1,
            offset: 0.55
          },
          {
            transform: 'translate(calc(-50% + ' + dx * 1.15 + 'px), calc(-50% + ' + (dy + 40) + 'px)) scale(0.8)',
            opacity: 0
          }
        ],
        { duration: random(700, 1100), easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' }
      );
      animation.onfinish = () => bit.remove();
    }
  }

  window.addEventListener('pointerdown', (event) => {
    if (event.target && event.target.closest && event.target.closest('input, textarea')) return;
    burstAt(event.clientX, event.clientY, 6);
  });

  // Traînée d'étincelles derrière la souris.
  (function sparkleTrail() {
    if (prefersReducedMotion || !Element.prototype.animate) return;

    let last = 0;
    window.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - last < 55) return;
      last = now;

      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.textContent = pick(['✦', '✧', '♥', '·']);
      sparkle.style.left = event.clientX + random(-6, 6) + 'px';
      sparkle.style.top = event.clientY + random(-6, 6) + 'px';
      sparkle.style.fontSize = random(10, 18).toFixed(0) + 'px';
      sparkle.setAttribute('aria-hidden', 'true');
      body.appendChild(sparkle);

      const animation = sparkle.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.95 },
          { transform: 'translate(-50%, calc(-50% + 26px)) scale(0.3) rotate(80deg)', opacity: 0 }
        ],
        { duration: 800, easing: 'ease-out' }
      );
      animation.onfinish = () => sparkle.remove();
    });
  })();

  /* ------------------------------------------------------------------------
     6. Éléments de page : prénom, apparition, barre de progression
     ------------------------------------------------------------------------ */

  const recipientName = () => (CFG.recipientName || '').trim();
  const senderName = () => (CFG.senderName || '').trim();

  // Remplace {name} / {sender} dans un texte.
  function fillTokens(text, nameFallback) {
    return String(text)
      .replace(/\{name\}/g, recipientName() || nameFallback || '')
      .replace(/\{sender\}/g, senderName());
  }

  function personalize() {
    $$('[data-tpl]').forEach((el) => {
      el.textContent = fillTokens(el.getAttribute('data-tpl'), el.getAttribute('data-fallback'));
    });
  }

  function applyReveal() {
    $$('.reveal').forEach((element, index) => {
      element.style.animationDelay = (0.2 + index * 0.18).toFixed(2) + 's';
    });
  }

  function buildSteps() {
    const old = $('.steps');
    if (old) old.remove();

    const current = parseInt(body.dataset.step, 10);
    const total = parseInt(body.dataset.steps, 10);
    if (!current || !total) return;

    const nav = document.createElement('nav');
    nav.className = 'steps';
    nav.setAttribute('aria-label', 'Étape ' + current + ' sur ' + total);

    for (let i = 1; i <= total; i += 1) {
      const dot = document.createElement('span');
      dot.className = 'steps__dot' + (i < current ? ' is-done' : '') + (i === current ? ' is-current' : '');
      nav.appendChild(dot);
    }
    body.appendChild(nav);
    onPage(() => nav.remove());
  }

  /* ------------------------------------------------------------------------
     7. Ambiance de fond (pétales, étoiles, lucioles, ballons, cœurs)
     ------------------------------------------------------------------------ */

  let fxLayer = null;

  function getFxLayer() {
    if (!fxLayer) {
      fxLayer = document.createElement('div');
      fxLayer.className = 'fx-layer';
      fxLayer.setAttribute('aria-hidden', 'true');
      body.appendChild(fxLayer);
    }
    return fxLayer;
  }

  function spawnTimed(className, setup, lifetimeMs) {
    const el = document.createElement('span');
    el.className = className;
    setup(el);
    getFxLayer().appendChild(el);
    window.setTimeout(() => el.remove(), lifetimeMs);
    return el;
  }

  function spawnPetal() {
    const duration = random(8, 13);
    spawnTimed('petal', (el) => {
      el.style.left = random(0, 100) + 'vw';
      el.style.setProperty('--s', random(10, 18).toFixed(1) + 'px');
      el.style.setProperty('--d', duration.toFixed(1) + 's');
      el.style.setProperty('--x', random(-90, 90).toFixed(0) + 'px');
      el.style.filter = 'hue-rotate(' + randomInt(-14, 14) + 'deg)';
    }, duration * 1000 + 300);
  }

  function spawnBalloon() {
    const duration = random(11, 16);
    spawnTimed('balloon', (el) => {
      el.textContent = pick(['🎈', '🎈', '🎈'].concat(LOVE_HEARTS.slice(0, 2)));
      el.style.left = random(3, 92) + 'vw';
      el.style.fontSize = random(30, 52).toFixed(0) + 'px';
      el.style.setProperty('--d', duration.toFixed(1) + 's');
    }, duration * 1000 + 300);
  }

  function spawnShootingStar() {
    spawnTimed('shooting-star', (el) => {
      el.style.setProperty('--x', random(45, 95).toFixed(0) + 'vw');
      el.style.setProperty('--y', random(4, 32).toFixed(0) + 'vh');
    }, 1500);
  }

  function setupStars() {
    const layer = getFxLayer();
    const colors = [hsla(0, 100, 85), hsla(0, 100, 72), '#f6c26b', hsla(0, 100, 92)];
    const total = window.innerWidth < 600 ? 16 : 28;

    for (let i = 0; i < total; i += 1) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = pick(['✦', '✧', '★', '✦']);
      star.style.left = random(1, 97) + 'vw';
      star.style.top = random(2, 90) + 'vh';
      star.style.setProperty('--s', random(9, 20).toFixed(0) + 'px');
      star.style.setProperty('--c', pick(colors));
      star.style.setProperty('--d', random(2.4, 5).toFixed(1) + 's');
      star.style.setProperty('--delay', random(0, 4).toFixed(1) + 's');
      layer.appendChild(star);
    }
    every(() => {
      if (!document.hidden) spawnShootingStar();
    }, 6500);
  }

  function setupFireflies() {
    const layer = getFxLayer();
    const total = window.innerWidth < 600 ? 10 : 18;

    for (let i = 0; i < total; i += 1) {
      const fly = document.createElement('span');
      fly.className = 'firefly';
      fly.style.setProperty('--x', random(2, 96).toFixed(0) + 'vw');
      fly.style.setProperty('--y', random(8, 92).toFixed(0) + 'vh');
      fly.style.setProperty('--s', random(5, 9).toFixed(1) + 'px');
      fly.style.setProperty('--dx', random(-70, 70).toFixed(0) + 'px');
      fly.style.setProperty('--dy', random(-80, 50).toFixed(0) + 'px');
      fly.style.setProperty('--d', random(9, 16).toFixed(1) + 's');
      fly.style.setProperty('--delay', random(0, 6).toFixed(1) + 's');
      layer.appendChild(fly);
    }
  }

  function setupAmbient() {
    const fxList = (body.dataset.fx || '').split(',').map((s) => s.trim()).filter(Boolean);

    onPage(() => {
      if (fxLayer) fxLayer.remove();
      fxLayer = null;
    });

    if (prefersReducedMotion || !fxList.length) return;

    if (fxList.indexOf('stars') !== -1) setupStars();
    if (fxList.indexOf('fireflies') !== -1) setupFireflies();

    if (fxList.indexOf('petals') !== -1) {
      for (let i = 0; i < 6; i += 1) after(spawnPetal, i * 380);
      every(() => {
        if (!document.hidden) spawnPetal();
      }, window.innerWidth < 600 ? 1500 : 950);
    }

    if (fxList.indexOf('balloons') !== -1) {
      for (let i = 0; i < 4; i += 1) after(spawnBalloon, 400 + i * 700);
      every(() => {
        if (!document.hidden) spawnBalloon();
      }, 2600);
    }

    if (fxList.indexOf('hearts') !== -1) {
      every(() => {
        if (!document.hidden) {
          spawnHeart({ duration: random(7, 11), size: random(14, 26), emojis: LOVE_HEARTS });
        }
      }, 1300);
    }
  }

  /* ------------------------------------------------------------------------
     8. Confettis et feu d'artifice (canvas)
     ------------------------------------------------------------------------ */

  function makeCanvas(className) {
    const canvas = document.createElement('canvas');
    canvas.className = className;
    canvas.setAttribute('aria-hidden', 'true');
    body.appendChild(canvas);
    onPage(() => canvas.remove());

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = { width: 0, height: 0 };

    function resize() {
      size.width = window.innerWidth;
      size.height = window.innerHeight;
      canvas.width = size.width * dpr;
      canvas.height = size.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    listen(window, 'resize', resize);

    return { canvas: canvas, ctx: ctx, size: size };
  }

  function confetti(durationMs) {
    if (prefersReducedMotion) return;

    const layer = makeCanvas('confetti-canvas');
    const canvas = layer.canvas;
    const ctx = layer.ctx;
    const size = layer.size;

    const colors = [hsla(0, 100, 65), hsla(0, 100, 74), hsla(0, 100, 85), hsla(0, 100, 92), '#f6c26b', '#ffffff', hsla(-8, 85, 46)];
    const total = size.width < 600 ? 90 : 160;
    const parts = [];

    for (let i = 0; i < total; i += 1) {
      parts.push({
        x: random(0, size.width),
        y: random(-size.height * 0.6, -10),
        vx: random(-1.4, 1.4),
        vy: random(2, 5.2),
        size: random(6, 13),
        rot: random(0, Math.PI * 2),
        vr: random(-0.12, 0.12),
        wobble: random(0, Math.PI * 2),
        color: pick(colors),
        heart: Math.random() < 0.35
      });
    }

    function drawHeart(p) {
      const s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.5, -s * 0.5, -s, 0, -s * 0.35);
      ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.5, 0, s * 0.3);
      ctx.fill();
    }

    const start = performance.now();
    const lifetime = durationMs || 4200;

    let lastFrame = start;

    function frame(now) {
      if (!canvas.isConnected) return;
      const elapsed = now - start;
      const dt = clamp((now - lastFrame) / 16.667, 0.4, 3);
      lastFrame = now;
      ctx.clearRect(0, 0, size.width, size.height);
      const fade = elapsed > lifetime - 900 ? clamp((lifetime - elapsed) / 900, 0, 1) : 1;

      parts.forEach((p) => {
        p.wobble += 0.06 * dt;
        p.x += (p.vx + Math.sin(p.wobble) * 0.8) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.heart) {
          drawHeart(p);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });

      if (elapsed < lifetime) {
        window.requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }

    window.requestAnimationFrame(frame);
  }

  // Feu d'artifice nocturne : fusées + explosions rondes ou en forme de cœur.
  function fireworks(durationMs) {
    if (prefersReducedMotion) {
      confetti(2800);
      return;
    }

    const layer = makeCanvas('fireworks-canvas');
    const canvas = layer.canvas;
    const ctx = layer.ctx;
    const size = layer.size;

    const palette = [
      hsla(0, 100, 68), hsla(-10, 100, 72), hsla(14, 100, 76),
      '#ffd27a', '#ffffff', hsla(30, 100, 70), hsla(-25, 100, 74)
    ];

    const lifetime = durationMs || 6500;
    const GRAVITY = 0.18;
    const rockets = [];
    const sparks = [];
    const start = performance.now();
    let lastLaunch = 0;
    let fading = false;

    window.requestAnimationFrame(() => {
      canvas.style.opacity = '1';
    });

    function launch() {
      const targetY = random(size.height * 0.14, size.height * 0.46);
      const distance = size.height - targetY;
      rockets.push({
        x: random(size.width * 0.15, size.width * 0.85),
        y: size.height + 8,
        vx: random(-0.5, 0.5),
        vy: -Math.sqrt(2 * GRAVITY * distance) * random(0.98, 1.04),
        color: pick(palette),
        heart: Math.random() < 0.5
      });
    }

    function explode(rocket) {
      const color = rocket.color;
      const second = Math.random() < 0.4 ? pick(palette) : color;

      if (rocket.heart) {
        const scale = random(0.2, 0.26) * clamp(size.width / 700, 0.7, 1.3);
        const count = 70;
        for (let i = 0; i < count; i += 1) {
          const t = (i / count) * Math.PI * 2;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          sparks.push({
            x: rocket.x, y: rocket.y, vx: hx * scale, vy: hy * scale,
            life: 1, decay: random(0.0075, 0.011), color: color, r: random(1.6, 2.6), drag: 0.965
          });
        }
      } else {
        const count = 80;
        const speed = random(3.2, 5.2) * clamp(size.width / 700, 0.7, 1.3);
        for (let i = 0; i < count; i += 1) {
          const angle = (i / count) * Math.PI * 2;
          const s = speed * random(0.85, 1.05);
          sparks.push({
            x: rocket.x, y: rocket.y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s,
            life: 1, decay: random(0.009, 0.015), color: i % 2 ? color : second, r: random(1.4, 2.4), drag: 0.968
          });
        }
      }
    }

    let lastFrame = start;

    function frame(now) {
      if (!canvas.isConnected) return;
      const elapsed = now - start;

      // dt = 1 pour 60 images/s : l'animation dure pareil quelle que soit la fluidité.
      const dt = clamp((now - lastFrame) / 16.667, 0.4, 3);
      lastFrame = now;

      // Les traînées s'effacent peu à peu (le ciel sombre est géré par le CSS).
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, ' + clamp(0.16 * dt, 0.1, 0.6).toFixed(2) + ')';
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.globalCompositeOperation = 'lighter';

      if (elapsed < lifetime - 1800 && now - lastLaunch > random(420, 900)) {
        lastLaunch = now;
        launch();
        if (Math.random() < 0.35) window.setTimeout(launch, 160);
      }

      for (let i = rockets.length - 1; i >= 0; i -= 1) {
        const r = rockets[i];
        r.vy += GRAVITY * dt;
        r.x += r.vx * dt;
        r.y += r.vy * dt;

        ctx.beginPath();
        ctx.fillStyle = '#fff3d6';
        ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
        ctx.fill();

        if (r.vy >= -0.4) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        const drag = Math.pow(s.drag, dt);
        s.vx *= drag;
        s.vy = s.vy * drag + 0.035 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= s.decay * dt;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.globalAlpha = clamp(s.life, 0, 1);
        ctx.fillStyle = s.color;
        ctx.arc(s.x, s.y, s.r * (0.6 + s.life * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (!fading && elapsed > lifetime - 900) {
        fading = true;
        canvas.style.opacity = '0';
      }

      if (elapsed < lifetime) {
        window.requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }

    launch();
    window.setTimeout(launch, 250);
    window.requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------------
     9. Musique
        Un SEUL élément <audio> vit pendant toute la visite. Il est débloqué
        une fois (écran de départ ou premier geste), puis on change simplement
        de morceau à chaque page : ça marche même sur iPhone.
     ------------------------------------------------------------------------ */

  const START_FLAG = 'romanceStarted';

  const Music = (function () {
    const audio = $('#pageMusic');
    const toggle = $('#musicToggle');

    const FLAG = 'romanceMusicUnlocked';
    const POS = 'romanceMusicPosition';
    const MUTED = 'romanceMusicMuted';
    const TARGET_VOLUME = 0.55;

    const absUrl = (src) => {
      try {
        return new URL(src, document.baseURI).href;
      } catch (error) {
        return String(src);
      }
    };

    let hint = null;
    let fadeTimer = null;
    let gated = false;
    let unlockInstalled = false;
    let currentUrl = audio ? absUrl(audio.getAttribute('src') || '') : '';
    let resume = readJSON(session, POS, null);

    const isMuted = () => read(session, MUTED) === 'true';
    const isPlaying = () => !!audio && !audio.paused && !audio.ended;

    function syncButton() {
      if (!toggle) return;
      const playing = isPlaying();
      toggle.setAttribute('aria-pressed', String(playing));
      toggle.setAttribute('aria-label', playing ? 'Couper la musique' : 'Activer la musique');
      toggle.textContent = playing ? '⏸️' : '🎵';
    }

    function showHint(show) {
      if (show && !hint) {
        hint = document.createElement('div');
        hint.className = 'music-hint';
        hint.setAttribute('role', 'status');
        hint.textContent = '🎵 Touche l’écran pour lancer la musique';
        body.appendChild(hint);
        window.requestAnimationFrame(() => hint && hint.classList.add('is-visible'));
      } else if (!show && hint) {
        const el = hint;
        hint = null;
        el.classList.remove('is-visible');
        window.setTimeout(() => el.remove(), 450);
      }
    }

    function fadeTo(target, ms) {
      window.clearInterval(fadeTimer);
      return new Promise((resolve) => {
        if (!audio || prefersReducedMotion || ms <= 0) {
          if (audio) audio.volume = target;
          resolve();
          return;
        }
        const from = audio.volume;
        const steps = Math.max(1, Math.round(ms / 50));
        let n = 0;
        fadeTimer = window.setInterval(() => {
          n += 1;
          audio.volume = clamp(from + (target - from) * (n / steps), 0, 1);
          if (n >= steps) {
            window.clearInterval(fadeTimer);
            resolve();
          }
        }, 50);
      });
    }

    function tryPlay() {
      let promise;
      try {
        promise = audio.play();
      } catch (error) {
        return Promise.resolve(false);
      }
      if (promise && typeof promise.then === 'function') {
        return promise.then(() => true).catch(() => false);
      }
      return Promise.resolve(true);
    }

    // Geste de l'utilisateur détecté : on lance (ou relance) la lecture.
    const UNLOCK_EVENTS = ['pointerup', 'pointerdown', 'touchend', 'click', 'keydown'];

    function removeUnlock() {
      if (!unlockInstalled) return;
      unlockInstalled = false;
      UNLOCK_EVENTS.forEach((name) => window.removeEventListener(name, unlock, true));
    }

    function installUnlock() {
      if (unlockInstalled) return;
      unlockInstalled = true;
      UNLOCK_EVENTS.forEach((name) => window.addEventListener(name, unlock, true));
    }

    function unlock(event) {
      if (gated || isMuted()) return;
      if (toggle && event.target && toggle.contains && toggle.contains(event.target)) return;

      tryPlay().then((started) => {
        if (!started) return;
        removeUnlock();
        showHint(false);
        store(session, FLAG, 'true');
        fadeTo(TARGET_VOLUME, 1600);
        syncButton();
      });
    }

    function attemptStart() {
      return tryPlay().then((started) => {
        syncButton();
        if (started) {
          store(session, FLAG, 'true');
          removeUnlock();
          showHint(false);
          fadeTo(TARGET_VOLUME, 1600);
        } else {
          installUnlock();
          showHint(true);
        }
        return started;
      });
    }

    function setSource(src) {
      const url = absUrl(src);
      if (url === currentUrl) return false;
      currentUrl = url;
      audio.src = src;
      audio.load();
      return true;
    }

    // Appelé à chaque nouvelle page.
    function enter(src) {
      if (!audio) return;

      const changed = src ? setSource(src) : false;
      syncButton();

      if (isMuted() || gated) return;
      if (isPlaying() && !changed) return;

      audio.volume = 0;
      attemptStart();
    }

    // Appelé juste avant de quitter une page : fondu si le morceau change.
    function leave(src) {
      if (!audio || !src) return Promise.resolve();
      if (absUrl(src) !== currentUrl && isPlaying()) return fadeTo(0, 350);
      return Promise.resolve();
    }

    // Écran « Touche pour commencer » : la lecture démarre dans le geste.
    function startFromGesture() {
      gated = false;
      if (!audio) return Promise.resolve(false);
      if (isMuted()) {
        syncButton();
        return Promise.resolve(false);
      }
      audio.volume = 0;
      return attemptStart();
    }

    function setGated(value) {
      gated = value;
    }

    if (audio) {
      audio.volume = 0;

      audio.addEventListener('loadedmetadata', () => {
        if (resume && resume.src === currentUrl && resume.time > 0 &&
            resume.time < (audio.duration || 0) - 2) {
          try {
            audio.currentTime = resume.time;
          } catch (error) {
            /* ignore */
          }
        }
        resume = null;
      });

      const savePosition = () => {
        store(session, POS, JSON.stringify({ src: currentUrl, time: audio.currentTime || 0 }));
      };
      window.addEventListener('pagehide', savePosition);
      window.addEventListener('beforeunload', savePosition);

      audio.addEventListener('play', syncButton);
      audio.addEventListener('pause', syncButton);
      audio.addEventListener('ended', syncButton);

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && audio.paused && !gated && !isMuted() &&
            read(session, FLAG) === 'true') {
          tryPlay().then(syncButton);
        }
      });
    }

    // Bouton manuel (toujours disponible).
    if (toggle) {
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        removeUnlock();
        showHint(false);

        if (!audio) return;

        if (audio.paused || audio.ended) {
          store(session, MUTED, 'false');
          gated = false;
          audio.volume = 0;
          attemptStart();
        } else {
          // L'utilisatrice coupe volontairement : on respecte ce choix sur toutes les pages.
          store(session, MUTED, 'true');
          audio.pause();
          syncButton();
        }
      });
    }

    return {
      enter: enter,
      leave: leave,
      setGated: setGated,
      startFromGesture: startFromGesture,
      isPlaying: isPlaying
    };
  })();

  /* ------------------------------------------------------------------------
     10. Navigation entre les pages (sans recharger le document)
         → la musique n'est jamais interrompue.
         En cas de problème (ou ouverture directe du fichier sans serveur),
         on retombe automatiquement sur une navigation classique.
     ------------------------------------------------------------------------ */

  const veil = $('.page-veil');

  if (veil) {
    const markReady = () => veil.classList.add('is-ready');
    veil.addEventListener('animationend', markReady, { once: true });
    window.setTimeout(markReady, 900);
  }

  const VEIL_MS = prefersReducedMotion ? 60 : 430;
  const canSwap = 'fetch' in window && window.location.protocol !== 'file:';
  let navigating = false;

  function musicSrcFor(doc) {
    const key = doc.body.getAttribute('data-page');
    const configured = CFG.music && key && CFG.music[key];
    if (configured) return 'assets/' + configured;
    const audioEl = doc.getElementById('pageMusic');
    return audioEl ? audioEl.getAttribute('src') : null;
  }

  function applyBodyFrom(doc) {
    body.className = doc.body.className;

    Array.prototype.slice.call(body.attributes).forEach((attr) => {
      if (attr.name.indexOf('data-') === 0) body.removeAttribute(attr.name);
    });
    Array.prototype.slice.call(doc.body.attributes).forEach((attr) => {
      if (attr.name.indexOf('data-') === 0) body.setAttribute(attr.name, attr.value);
    });
  }

  async function navigate(url, push) {
    if (navigating) return;
    navigating = true;

    if (veil) veil.classList.add('is-active');
    const startedAt = Date.now();

    if (!canSwap) {
      await wait(VEIL_MS);
      window.location.href = url;
      return;
    }

    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newMain = $('main.stage', doc);
      const oldMain = $('main.stage');
      if (!newMain || !oldMain) throw new Error('Page inattendue');

      const newSrc = musicSrcFor(doc);

      await Promise.all([
        wait(Math.max(0, VEIL_MS - (Date.now() - startedAt))),
        Music.leave(newSrc)
      ]);

      teardown();
      oldMain.replaceWith(document.importNode(newMain, true));
      applyBodyFrom(doc);
      document.title = doc.title;
      if (push) window.history.pushState({ swap: true }, '', url);
      window.scrollTo(0, 0);

      initPage(newSrc);
    } catch (error) {
      window.location.href = url;
      return;
    }

    if (veil) veil.classList.remove('is-active');
    navigating = false;
  }

  function leaveTo(path) {
    navigate(new URL(path, window.location.href).href, true);
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey) return;

    const link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link || link.target === '_blank') return;

    const href = link.getAttribute('href');
    if (!/^[\w.-]+\.html(#.*)?$/.test(href)) return;

    event.preventDefault();
    leaveTo(href);
  });

  window.addEventListener('popstate', () => {
    navigating = false;
    navigate(window.location.href, false);
  });

  /* ------------------------------------------------------------------------
     11. Écran « Touche pour commencer »
     ------------------------------------------------------------------------ */

  function shouldShowStartGate() {
    return CFG.startScreen !== false &&
      pageClass('page--home') &&
      read(session, START_FLAG) !== 'true';
  }

  function showStartGate() {
    const gate = document.createElement('div');
    gate.className = 'start-gate';
    gate.id = 'startGate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'gateTitle');

    gate.innerHTML =
      '<div class="start-gate__inner">' +
      '<div class="emblem" aria-hidden="true">' +
      '<span class="emblem__ring"></span><span class="emblem__ring emblem__ring--2"></span>' +
      '<span class="emblem__heart">💌</span></div>' +
      '<h2 class="start-gate__title" id="gateTitle">J’ai une surprise pour toi…</h2>' +
      '<p class="start-gate__sub">Mets le son 🔊 : il y aura de la musique.</p>' +
      '<button type="button" class="btn btn--primary btn--pulse start-gate__btn" id="startGateBtn">' +
      'Touche pour commencer 💗</button>' +
      '</div>';

    body.appendChild(gate);

    const button = $('#startGateBtn', gate);
    if (button) button.focus({ preventScroll: true });

    let done = false;
    gate.addEventListener('click', () => {
      if (done) return;
      done = true;

      // La lecture démarre ICI, dans le geste : c'est ce qui la débloque partout.
      Music.startFromGesture();
      store(session, START_FLAG, 'true');

      body.classList.remove('is-gated');
      gate.classList.add('is-leaving');
      window.setTimeout(() => gate.remove(), 700);
      burstHearts(16);
    });
  }

  /* ------------------------------------------------------------------------
     12. Données du rendez-vous (partagées entre la page 9 et la page 10)
     ------------------------------------------------------------------------ */

  const DATE_KEY = 'romanceDateChoice';

  function loadDateData() {
    return readJSON(local, DATE_KEY, null) || readJSON(session, DATE_KEY, null);
  }

  function saveDateData(payload) {
    const text = JSON.stringify(payload);
    store(session, DATE_KEY, text);
    store(local, DATE_KEY, text);
  }

  function dateFromData(data) {
    if (!data || !data.day) return null;
    const parts = String(data.day).split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;

    let hours = 19;
    let minutes = 0;
    if (data.time) {
      const t = String(data.time).split(':').map(Number);
      if (t.length >= 2 && !isNaN(t[0]) && !isNaN(t[1])) {
        hours = t[0];
        minutes = t[1];
      }
    }
    const date = new Date(parts[0], parts[1] - 1, parts[2], hours, minutes, 0);
    return isNaN(date.getTime()) ? null : date;
  }

  const todayISO = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  /* ------------------------------------------------------------------------
     13. Page 3 — cartes « raisons » à retourner
     ------------------------------------------------------------------------ */

  function initReasons() {
    if (!pageClass('page--reasons')) return;

    const cards = $$('.flip');
    const bar = $('#reasonBar');
    const count = $('#reasonCount');
    const next = $('#reasonNext');
    const seen = new Set();

    cards.forEach((card, index) => {
      card.addEventListener('click', (event) => {
        const flipped = card.classList.toggle('is-flipped');
        card.setAttribute('aria-pressed', String(flipped));

        if (flipped) {
          seen.add(index);
          burstAt(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, 8);
        }

        if (bar) bar.style.width = (seen.size / cards.length) * 100 + '%';
        if (count) {
          count.textContent =
            seen.size === cards.length
              ? 'Tu as tout découvert 💖'
              : seen.size + ' / ' + cards.length + ' cartes découvertes';
        }

        if (seen.size === cards.length && next && next.hidden) {
          next.hidden = false;
          burstHearts(30);
          confetti(2600);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     14. Page 4 — l'enveloppe et la lettre qui s'écrit
     ------------------------------------------------------------------------ */

  function initLetter() {
    if (!pageClass('page--letter')) return;

    const letterCfg = CFG.letter || {};
    const TO = fillTokens(letterCfg.to || 'Chère {name},', 'toi');
    const PARAGRAPHS = (letterCfg.paragraphs && letterCfg.paragraphs.length
      ? letterCfg.paragraphs
      : ['Je pense à toi.']).map((p) => fillTokens(p, 'toi'));
    const SIGN = fillTokens(letterCfg.sign || 'Avec tendresse,<br />{sender} 💗', 'toi');

    const envelope = $('#envelope');
    const envWrap = $('#envWrap');
    const letter = $('#letter');
    const letterTo = $('#letterTo');
    const letterBody = $('#letterBody');
    const letterSign = $('#letterSign');
    const letterSkip = $('#letterSkip');
    const letterNext = $('#letterNext');

    let typingDone = false;
    let timers = [];

    onPage(() => {
      typingDone = true;
      timers.forEach(window.clearTimeout);
      timers = [];
    });

    const later = (fn, ms) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    function showEnd(delay) {
      letterSign.innerHTML = SIGN;
      letterSign.hidden = false;
      if (letterSkip) letterSkip.hidden = true;
      letter.style.cursor = 'default';
      later(() => {
        letterNext.hidden = false;
        burstHearts(22);
      }, delay);
    }

    function finishLetter() {
      if (typingDone) return;
      typingDone = true;
      timers.forEach(window.clearTimeout);
      timers = [];

      letterTo.textContent = TO;
      letterBody.innerHTML = '';
      PARAGRAPHS.forEach((text) => {
        const p = document.createElement('p');
        p.textContent = text;
        letterBody.appendChild(p);
      });
      showEnd(0);
    }

    function typeText(target, text, speed, done) {
      let i = 0;
      target.classList.add('caret');

      (function step() {
        if (typingDone) return;
        i += 1;
        if (target.firstChild) {
          target.firstChild.nodeValue = text.slice(0, i);
        } else {
          target.appendChild(document.createTextNode(text.slice(0, i)));
        }

        if (i >= text.length) {
          target.classList.remove('caret');
          done();
          return;
        }

        const ch = text[i - 1];
        const pause = /[.!?…]/.test(ch) ? 360 : /[,;:]/.test(ch) ? 160 : speed + random(-6, 10);
        later(step, pause);
      })();
    }

    function startTyping() {
      if (prefersReducedMotion) {
        finishLetter();
        return;
      }

      typeText(letterTo, TO, 70, () => {
        let index = 0;

        (function nextParagraph() {
          if (typingDone) return;

          if (index >= PARAGRAPHS.length) {
            showEnd(700);
            typingDone = true;
            return;
          }

          const p = document.createElement('p');
          letterBody.appendChild(p);
          typeText(p, PARAGRAPHS[index], 30, () => {
            index += 1;
            spawnHeart({ size: random(18, 30), duration: random(4, 6), emojis: LOVE_HEARTS });
            later(nextParagraph, 450);
          });
        })();
      });
    }

    function openEnvelope() {
      if (!envelope || envelope.classList.contains('is-open')) return;
      envelope.classList.add('is-open');
      envelope.setAttribute('aria-expanded', 'true');
      if (envWrap) envWrap.classList.add('is-opening');
      burstHearts(12);

      later(() => {
        if (envWrap) envWrap.classList.add('is-gone');
        letter.hidden = false;
        later(startTyping, prefersReducedMotion ? 0 : 900);
      }, prefersReducedMotion ? 50 : 1700);
    }

    if (envelope) envelope.addEventListener('click', openEnvelope);

    if (letter) {
      letter.addEventListener('click', () => {
        if (!typingDone) finishLetter();
      });
    }
  }

  /* ------------------------------------------------------------------------
     15. Page 5 — polaroïds + visionneuse
     ------------------------------------------------------------------------ */

  function initMemories() {
    if (!pageClass('page--memories')) return;

    const polaroids = $$('.polaroid');
    const captions = CFG.photoCaptions || [];

    polaroids.forEach((figure, index) => {
      const caption = $('figcaption', figure);
      if (caption && captions[index]) {
        caption.textContent = captions[index];
        figure.setAttribute('aria-label', 'Agrandir la photo : ' + captions[index]);
      }
    });

    function openLightbox(figure) {
      const img = $('img', figure);
      const caption = $('figcaption', figure);
      if (!img) return;

      const box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');

      const big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      box.appendChild(big);

      if (caption) {
        const text = document.createElement('p');
        text.textContent = caption.textContent;
        box.appendChild(text);
      }

      function close() {
        document.removeEventListener('keydown', onKey);
        box.remove();
        figure.focus();
      }
      function onKey(event) {
        if (event.key === 'Escape') close();
      }

      box.addEventListener('click', close);
      document.addEventListener('keydown', onKey);
      onPage(() => {
        document.removeEventListener('keydown', onKey);
        box.remove();
      });
      body.appendChild(box);
      burstHearts(14);
    }

    polaroids.forEach((figure) => {
      figure.addEventListener('click', () => openLightbox(figure));
      figure.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(figure);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     16. Page 6 — le quiz « À quel point tu me connais ? »
     ------------------------------------------------------------------------ */

  function initQuiz() {
    if (!pageClass('page--quiz')) return;

    const data = CFG.quiz || [];
    const results = CFG.quizResults || {};

    const quiz = $('#quiz');
    const result = $('#quizResult');
    const bar = $('#quizBar');
    const count = $('#quizCount');
    const question = $('#quizQ');
    const optionsBox = $('#quizOptions');
    const feedback = $('#quizFeedback');
    const nextBtn = $('#quizNextBtn');

    if (!data.length) {
      quiz.hidden = true;
      result.hidden = false;
      $('#quizScore').textContent = '💗';
      $('#quizMessage').textContent = 'Le quiz est vide pour l’instant.';
      return;
    }

    let index = 0;
    let score = 0;
    let locked = false;

    function render() {
      const item = data[index];
      locked = false;

      if (bar) bar.style.width = (index / data.length) * 100 + '%';
      count.textContent = 'Question ' + (index + 1) + ' sur ' + data.length;
      question.textContent = item.q;
      feedback.textContent = '';
      feedback.classList.remove('is-good', 'is-bad');
      nextBtn.hidden = true;
      optionsBox.innerHTML = '';

      item.options.forEach((label, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'quiz__opt';
        button.textContent = label;
        button.style.animationDelay = (0.05 + i * 0.07).toFixed(2) + 's';
        button.addEventListener('click', (event) => answer(i, button, event));
        optionsBox.appendChild(button);
      });
    }

    function answer(i, button, event) {
      if (locked) return;
      locked = true;

      const item = data[index];
      const noWrong = item.answer === null || item.answer === undefined;
      const right = noWrong || i === item.answer;

      if (right) score += 1;

      $$('.quiz__opt', optionsBox).forEach((el, k) => {
        el.disabled = true;
        if (k === i) el.classList.add(right ? 'is-right' : 'is-wrong');
        else if (!right && k === item.answer) el.classList.add('is-right');
      });

      feedback.textContent = (right ? item.good : item.bad) || '';
      feedback.classList.add(right ? 'is-good' : 'is-bad');

      if (right) {
        burstAt(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, 10);
      }

      nextBtn.textContent = index === data.length - 1 ? 'Voir mon score ✨' : 'Question suivante ›';
      nextBtn.hidden = false;
    }

    function showResult() {
      quiz.hidden = true;
      result.hidden = false;

      const ratio = score / data.length;
      $('#quizScore').textContent = score + ' / ' + data.length;

      const message =
        ratio === 1 ? results.perfect : ratio >= 0.6 ? results.good : results.low;
      $('#quizMessage').textContent = fillTokens(message || '', 'toi');

      if (ratio === 1) {
        confetti(3200);
        burstHearts(34);
      } else if (ratio >= 0.6) {
        burstHearts(20);
      }
    }

    nextBtn.addEventListener('click', () => {
      index += 1;
      if (index >= data.length) showResult();
      else render();
    });

    render();
  }

  /* ------------------------------------------------------------------------
     17. Page 7 — pluie de cœurs à attraper
     ------------------------------------------------------------------------ */

  function initGame() {
    if (!pageClass('page--game')) return;

    const goal = Math.max(3, parseInt(CFG.gameGoal, 10) || 15);
    const field = $('#gameField');
    const scoreEl = $('#gameScore');
    const goalEl = $('#gameGoal');
    const bar = $('#gameBar');
    const msg = $('#gameMsg');
    const next = $('#gameNext');
    const skip = $('#gameSkip');

    let score = 0;
    let active = 0;
    let finished = false;

    goalEl.textContent = goal;

    const cheers = [
      'Bien joué ! 💕', 'Continue… 😍', 'Tu es rapide ! ⚡', 'Encore, encore ! 💗',
      'Tu y es presque ! ✨', 'Wow ! 🥰'
    ];

    function update() {
      scoreEl.textContent = Math.min(score, goal);
      bar.style.width = clamp((score / goal) * 100, 0, 100) + '%';
    }

    function floatText(x, y, text) {
      const rect = field.getBoundingClientRect();
      const el = document.createElement('span');
      el.className = 'game__plus';
      el.textContent = text;
      el.style.left = x - rect.left + 'px';
      el.style.top = y - rect.top + 'px';
      field.appendChild(el);
      window.setTimeout(() => el.remove(), 900);
    }

    function finish() {
      finished = true;
      $$('.catch', field).forEach((el) => el.remove());
      active = 0;
      msg.textContent = 'Bravo ! Tu as attrapé mon cœur… 💖';
      next.hidden = false;
      skip.hidden = true;
      confetti(3200);
      burstHearts(34);
    }

    function spawn() {
      if (finished || document.hidden || active >= 9) return;

      const golden = Math.random() < 0.12;
      const heart = document.createElement('button');
      heart.type = 'button';
      heart.className = 'catch' + (golden ? ' catch--gold' : '');
      heart.textContent = golden ? '💛' : pick(LOVE_HEARTS);
      heart.setAttribute('aria-label', golden ? 'Cœur doré, 3 points' : 'Attraper un cœur');
      heart.style.left = random(2, 86).toFixed(1) + '%';
      heart.style.fontSize = random(30, 46).toFixed(0) + 'px';
      heart.style.animationDuration = random(4.2, 6.6).toFixed(2) + 's';

      let gone = false;
      const remove = () => {
        if (gone) return;
        gone = true;
        active -= 1;
        heart.remove();
      };

      heart.addEventListener('animationend', (event) => {
        if (event.animationName === 'catchFall') remove();
      });

      heart.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (gone || finished) return;

        gone = true;
        active -= 1;
        heart.classList.add('is-caught');
        window.setTimeout(() => heart.remove(), 260);

        const points = golden ? 3 : 1;
        score += points;
        update();
        burstAt(event.clientX, event.clientY, 7);
        floatText(event.clientX, event.clientY, '+' + points);

        if (score >= goal) finish();
        else if (score % 3 === 0) msg.textContent = pick(cheers);
      });

      field.appendChild(heart);
      active += 1;
    }

    update();
    for (let i = 0; i < 3; i += 1) after(spawn, 200 + i * 450);
    every(spawn, 640);
    after(() => {
      if (!finished) skip.hidden = false;
    }, 22000);
  }

  /* ------------------------------------------------------------------------
     18. Page 8 — 100 raisons de t'aimer
     ------------------------------------------------------------------------ */

  function initHundred() {
    if (!pageClass('page--hundred')) return;

    const reasons = CFG.reasons || [];
    const total = reasons.length;

    const card = $('#reasonCard');
    const num = $('#reasonNum');
    const text = $('#reasonText');
    const bar = $('#hundredBar');
    const count = $('#hundredCount');
    const drawBtn = $('#drawReason');
    const showAllBtn = $('#showAll');
    const list = $('#reasonList');
    const next = $('#hundredNext');

    if (!total) {
      text.textContent = 'Aucune raison pour l’instant.';
      drawBtn.hidden = true;
      showAllBtn.hidden = true;
      next.hidden = false;
      return;
    }

    let order = shuffle(reasons.map((r, i) => i));
    let position = 0;
    const seen = new Set();

    const unlockNext = () => {
      if (next.hidden) {
        next.hidden = false;
        burstHearts(18);
      }
    };

    function updateProgress() {
      bar.style.width = (seen.size / total) * 100 + '%';
      count.textContent = seen.size + ' / ' + total + ' raisons découvertes';
    }

    drawBtn.addEventListener('click', (event) => {
      if (position >= order.length) {
        order = shuffle(order);
        position = 0;
      }
      const idx = order[position];
      position += 1;
      seen.add(idx);

      num.textContent = '#' + (idx + 1);
      text.textContent = reasons[idx];

      card.classList.remove('is-pop');
      void card.offsetWidth;
      card.classList.add('is-pop');

      burstAt(event.clientX || window.innerWidth / 2, event.clientY || window.innerHeight / 2, 8);
      updateProgress();
      if (seen.size >= 5) unlockNext();
      if (seen.size === total) confetti(3000);
    });

    let built = false;
    showAllBtn.addEventListener('click', () => {
      if (!built) {
        built = true;
        reasons.forEach((reason, i) => {
          const li = document.createElement('li');
          li.style.setProperty('--i', Math.min(i, 40));
          const n = document.createElement('span');
          n.textContent = i + 1;
          li.appendChild(n);
          li.appendChild(document.createTextNode(' ' + reason));
          list.appendChild(li);
        });
      }
      list.hidden = !list.hidden;
      showAllBtn.textContent = list.hidden ? 'Voir les 100 ✨' : 'Masquer la liste';
      if (!list.hidden) {
        unlockNext();
        list.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });

    updateProgress();
  }

  /* ------------------------------------------------------------------------
     19. Pages 2 et 9 — le bouton « Non » qui s'échappe TOUJOURS
     ------------------------------------------------------------------------ */

  const REJECT_LABELS = [

  // 💗 Messages romantiques
  'Non 🙈',
  'Attends… 😳',
  'Tu es sûre ? 🥺',
  'Réfléchis encore 💭',
  'Impossible… 😅',
  'Essaie encore 💘',
  'Toujours non ? 🥹',
  'Mon cœur tremble… 💗',
  'Dis oui… s’il te plaît 🥺',
  'Juste un petit oui 💕',
  'Ne brise pas mon cœur 💔',
  'Mon cœur te choisit ❤️',
  'Fais-moi ce cadeau 🎁',
  'Un oui pour mon cœur 💓',
  'Tu es mon bonheur 🥰',
  'Mon cœur attend… 💖',
  'Dis oui à l’amour 💞',
  'J’ai besoin de ton oui 🥹',
  'Mon cœur espère encore 💗',
  'Laisse parler ton cœur 💝',
  'Un petit oui magique ✨',
  'Mon amour, réfléchis 💋',
  'Tu fais battre mon cœur 💓',
  'Je crois en nous 💑',
  'Notre histoire commence ? 💕',

  // 🥺 Messages mignons
  'S’il te plaît… 🥺',
  'Allez, juste une fois 🙏',
  'Pour me faire sourire ? 😊',
  'Un petit effort 💕',
  'Ne sois pas timide 🙈',
  'Tu me fais rougir ☺️',
  'Je suis tout gêné 😳',
  'Mon petit cœur 🥹',
  'Tu es trop adorable 😍',
  'Regarde mes yeux 🥺',
  'Un oui tout doux 🧸',
  'Fais-moi un câlin 🤗',
  'Je boude maintenant 😗',
  'Tu es méchante… 😭',
  'Mon cœur fait boum 💓',
  'Je fonds devant toi 🫠',
  'Tu me rends fou 😵‍💫',
  'Un bisou pour dire oui ? 😘',
  'Ne me laisse pas comme ça 🥹',
  'J’attends ton sourire 😊',
  'Tu me donnes de l’espoir 🌷',
  'Encore une petite chance ? 🥺',
  'Je suis trop mignon, non ? 🐻',
  'Dis oui à ce pauvre cœur 💔',
  'Promis, je suis gentil 😇',

  // 😂 Messages drôles
  'Erreur 404 : NON introuvable 🤖',
  'Ce bouton est fatigué 😴',
  'Oups, raté ! 😂',
  'Tu m’as presque eu 😜',
  'Le NON est en vacances 🏖️',
  'Bouton en fuite ! 🏃‍♂️',
  'Attrape-moi si tu peux 😈',
  'Tu es trop rapide ! ⚡',
  'Je refuse de refuser 🤣',
  'Le destin dit OUI 🔮',
  'Essaie encore, championne 😎',
  'Ce NON a peur de toi 😱',
  'Le bouton panique 🚨',
  'Mission impossible ? 🎬',
  'Tu cliques pour rien 😂',
  'Même le bouton veut OUI 😏',
  'Le NON a disparu 👻',
  'Attention, bouton sauvage 🐒',
  'Tu ne m’auras pas 😝',
  'Le bouton fait du sport 🏃',
  'J’ai glissé, chef ! 🤣',
  'Où est passé le NON ? 🔍',
  'Le bouton est timide 🙈',
  'Il faut mériter ce NON 😜',
  'Le NON démissionne ! 😂',

  // 😏 Messages séduisants
  'Avoue que tu m’aimes 😏',
  'Tu craques déjà ? 😍',
  'Je sais que tu hésites 😉',
  'Ton sourire dit oui 😊',
  'Ne résiste pas au charme 💋',
  'Tu penses à moi, hein ? 🥰',
  'Je te plais un peu ? 👀',
  'Ton cœur a déjà choisi ❤️',
  'Fais-moi confiance 😉',
  'Laisse-toi tenter 💘',
  'Un oui ne coûte rien 😇',
  'Tu sais ce que je veux 😏',
  'Je vois ton petit sourire 😁',
  'On serait beaux ensemble 💑',
  'Tu imagines déjà nous deux ? 💞',
  'Arrête de faire semblant 😜',
  'Je te vois rougir 🌹',
  'Un rendez-vous, peut-être ? 🌙',
  'Et si on essayait ? 💕',
  'Je te laisse une chance 😌',
  'Tu es mon petit secret 🤫',
  'Ton regard me trahit 👀',
  'Je suis ton admirateur 😍',
  'Un peu de romantisme ? 🌹',
  'Allez, tombe sous mon charme ✨',

  // 💌 Messages pour une déclaration
  'Veux-tu être mon amour ? ❤️',
  'Donne une chance à notre histoire 💌',
  'Et si c’était nous ? 💑',
  'Je t’ai choisie 💖',
  'Mon cœur t’appartient 💝',
  'Tu veux écrire notre histoire ? 📖',
  'Un avenir à deux ? 🌅',
  'Veux-tu être ma Valentine ? 💘',
  'J’aimerais être ton bonheur 🥰',
  'Je veux te faire sourire chaque jour 🌞',
  'Une histoire pleine d’amour ? 💞',
  'Veux-tu être ma personne préférée ? 🫶',
  'Je rêve d’un nous 💭',
  'Tu mérites tout mon amour 🌹',
  'Un premier rendez-vous ? ☕',
  'Et si on se donnait une chance ? 💗',
  'J’aimerais apprendre à te connaître 💌',
  'Un petit début d’histoire ? 🌷',
  'Veux-tu partager un moment avec moi ? ✨',
  'J’ai quelque chose à te dire… 💓',
  'Tu occupes mes pensées 💭',
  'Mon plus beau rêve, c’est toi 🌙',
  'Je voudrais te tenir la main 🤝',
  'Un câlin maintenant ? 🤗',
  'Et si tu disais oui ? 💖',

  // 🥹 Dernières tentatives
  'Je peux encore espérer ? 🥺',
  'Une dernière chance ? 🙏',
  'Tu me laisses essayer ? 💗',
  'Ne réponds pas trop vite 😳',
  'Pense à mon pauvre cœur 🥹',
  'J’ai préparé mon plus beau sourire 😊',
  'Mon cœur n’abandonne pas 💪❤️',
  'Je garde espoir 🌈',
  'Un oui me rendrait heureux 🥰',
  'Tu veux vraiment me faire attendre ? ⏳',
  'Je suis toujours là 💞',
  'Mon amour est patient 🌷',
  'Je tente ma chance 🍀',
  'Et si tu changeais d’avis ? 💕',
  'Je crois que tu vas dire oui 😍',
  'Allez, fais-moi rêver ✨',
  'Le suspense me tue 😭',
  'Mon cœur attend le verdict ⚖️💓',
  'Je retiens mon souffle 😮',
  'Alors… tu dis oui ? 🥺',
  'Ne me laisse pas dans le doute 💌',
  'Un sourire avant de répondre ? 😊',
  'Je croise les doigts 🤞',
  'Le bonheur est à un clic 💖',
  'Promis, je serai heureux 😁',

  // 💘 Les dernières phrases
  'Le OUI est juste là ! 👉💗',
  'Tu sais déjà quoi choisir 😘',
  'Mon cœur te dit merci 💝',
  'Fais confiance à la magie ✨',
  'L’amour nous attend 💑',
  'Un clic, mille émotions 💓',
  'Je t’offre mon plus beau sourire 🌹',
  'Le bonheur commence ici 💖',
  'Tu veux me rendre heureux ? 🥹',
  'Je te laisse encore réfléchir 💭',
  'Ce serait notre joli secret 🤫',
  'Je suis prêt à t’écouter ❤️',
  'Un petit oui pour commencer ? 🌷',
  'Le destin nous regarde 👀',
  'Allez… choisis l’amour 💘',
  'Tu as encore changé d’avis ? 😳',
  'Je ne perds pas espoir 🥰',
  'Mon cœur fait la fête 🎉💗',
  'Et si on disait OUI ensemble ? 💞',
  'Le bouton NON abandonne ! 🏳️😂'

];

  const REJECT_MESSAGES = [
    'Oups… ce bouton se sauve dès qu’on l’approche 🙈',
    'Tu es vraiment sûre de vouloir dire non ? 🥺',
    'Mon cœur espère encore un peu… 💕',
    'Il paraît que « Oui » sonne beaucoup mieux 💗',
    'Même le bouton est de mon côté 😌',
    'Allez… un petit oui pour moi ? 🥹',
    'Je te promets que ça vaut le coup… ✨',
    'Bon… on arrête de jouer et on dit oui ? 💘'
  ];

  const DATE_REJECT_LABELS = [
    'Non 🙈', 'Raté ! 😜', 'Tu es trop lent(e) 🏃', 'Essaie encore 😏', 'Même pas en rêve ✨',
    'Je suis en grève ✊', 'Un café, au moins ? ☕', 'Je me cache 🫣', 'Pas touche ! 🚫',
    'Je glisse… 🧼', 'Hop, ailleurs ! 💨', 'Tu m’as presque eu 😂', 'Le OUI est plus joli 💖',
    'Ce bouton a le vertige 🎢', 'Erreur 404 : refus introuvable 🤖', 'Allez, accepte 🥺',
    'Un dîner aux chandelles ? 🕯️', 'Je ne suis pas cliquable 😇', 'Ton doigt est trop lent ⚡',
    'Même moi je dis OUI 🥰', 'Tu cours après le mauvais bouton 🏃‍♀️', 'Je suis timide 🙈',
    'Mon cœur dit OUI, lui 💘', 'Insiste, c’est drôle 😈', 'Je t’attends au restaurant 🍝',
    'Le OUI est juste à côté 👉', 'Fais un heureux 🥹', 'Impossible de m’attraper 🦋'
  ];

  const DATE_REJECT_MESSAGES = [
    'Oups… ce bouton n’aime pas qu’on l’approche 🙈',
    'Il est plus rapide que toi 😏',
    'Je crois qu’il a compris que tu hésites… 💕',
    'Le OUI, lui, ne bouge jamais 💖',
    'Un petit effort… un seul clic sur OUI 🥺',
    'Même le bouton veut ce rendez-vous 😌',
    'Promis, je serai à l’heure ⏰',
    'J’ai déjà réservé la meilleure table… 🕯️',
    'Il n’y a qu’une seule bonne réponse ici 😇💗'
  ];

  function saveDateChoice() {
    const chosen = $('input[name="dateKind"]:checked');
    const day = $('#dateDay');
    const time = $('#dateTime');

    saveDateData({
      kind: chosen ? chosen.value : 'une surprise que je prépare',
      emoji: chosen ? chosen.getAttribute('data-emoji') : '🎁',
      day: day ? day.value : '',
      time: time ? time.value : ''
    });
  }

  function initAsk() {
    const isDate = pageClass('page--date');
    if (!isDate && !pageClass('page--ask')) return;

    const acceptButton = $('#acceptButton');
    const rejectButton = $('#rejectButton');
    const feedback = $('#feedback');
    const musicToggle = $('#musicToggle');

    const labels = isDate ? DATE_REJECT_LABELS : REJECT_LABELS;
    const messages = isDate ? DATE_REJECT_MESSAGES : REJECT_MESSAGES;

    function setFeedback(message) {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.classList.remove('is-visible');
      void feedback.offsetWidth;
      feedback.classList.add('is-visible');
    }

    /* --- Moteur de fuite ---------------------------------------------------
       Le bouton fuit dès qu'on s'en approche (souris, doigt, clavier). Il n'a
       AUCUNE action : même un clic réussi le déplace sans rien valider.      */

    const DODGE_COOLDOWN = 110;
    const TEXT_COOLDOWN = 520;
    const SAFE_MARGIN = 30;
    const ESCAPE_RADIUS = 78;

    let noAttempts = 0;
    let textStep = 0;
    let isFloating = false;
    let lastDodgeAt = 0;
    let lastTextAt = 0;
    let pointer = { x: -9999, y: -9999 };

    const distanceToRect = (x, y, rect) => {
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      return Math.hypot(dx, dy);
    };

    function updateText() {
      const now = Date.now();
      if (now - lastTextAt < TEXT_COOLDOWN && noAttempts > 1) return;
      lastTextAt = now;

      textStep += 1;
      rejectButton.textContent = labels[Math.min(textStep, labels.length - 1)];
      setFeedback(messages[Math.min(textStep - 1, messages.length - 1)]);
    }

    function overlaps(rect, domRect, pad) {
      const gap = pad === undefined ? 12 : pad;
      return !(
        rect.x + rect.width < domRect.left - gap ||
        rect.x > domRect.right + gap ||
        rect.y + rect.height < domRect.top - gap ||
        rect.y > domRect.bottom + gap
      );
    }

    // Parmi plusieurs positions, on prend l'une des plus éloignées du doigt / curseur.
    function findSafeSpot(width, height) {
      const maxX = Math.max(SAFE_MARGIN, window.innerWidth - width - SAFE_MARGIN);
      const maxY = Math.max(SAFE_MARGIN, window.innerHeight - height - SAFE_MARGIN);

      const avoid = [];
      if (acceptButton) avoid.push(acceptButton.getBoundingClientRect());
      if (musicToggle) avoid.push(musicToggle.getBoundingClientRect());
      const stepsBar = $('.steps');
      if (stepsBar) avoid.push(stepsBar.getBoundingClientRect());

      const candidates = [];

      for (let i = 0; i < 60; i += 1) {
        const x = random(SAFE_MARGIN, maxX);
        const y = random(SAFE_MARGIN, maxY);
        const box = { x: x, y: y, width: width, height: height };

        if (avoid.some((r) => overlaps(box, r))) continue;

        const dist = Math.hypot(x + width / 2 - pointer.x, y + height / 2 - pointer.y);
        candidates.push({ x: x, y: y, dist: dist });
      }

      if (candidates.length) {
        candidates.sort((a, b) => b.dist - a.dist);
        const chosen = pick(candidates.slice(0, Math.min(5, candidates.length)));
        return { x: chosen.x, y: chosen.y };
      }

      return {
        x: pointer.x < window.innerWidth / 2 ? maxX : SAFE_MARGIN,
        y: pointer.y < window.innerHeight / 2 ? maxY : SAFE_MARGIN
      };
    }

    function detachRejectButton() {
      const rect = rejectButton.getBoundingClientRect();

      const spacer = document.createElement('span');
      spacer.className = 'btn-spacer';
      spacer.style.width = rect.width + 'px';
      spacer.style.height = rect.height + 'px';
      spacer.setAttribute('aria-hidden', 'true');

      if (rejectButton.parentNode) rejectButton.parentNode.insertBefore(spacer, rejectButton);

      body.appendChild(rejectButton);
      onPage(() => rejectButton.remove());

      rejectButton.style.minWidth = rect.width + 'px';
      rejectButton.style.left = rect.left + 'px';
      rejectButton.style.top = rect.top + 'px';
      rejectButton.classList.add('is-floating');

      isFloating = true;
      void rejectButton.offsetWidth;
    }

    function dodge(x, y) {
      if (!rejectButton) return;

      const now = Date.now();
      if (now - lastDodgeAt < DODGE_COOLDOWN) return;
      lastDodgeAt = now;

      if (typeof x === 'number' && typeof y === 'number' && (x !== 0 || y !== 0)) {
        pointer = { x: x, y: y };
      }

      noAttempts += 1;

      if (!isFloating) detachRejectButton();

      // On change le texte AVANT de mesurer : la taille finale du bouton compte.
      updateText();

      const rect = rejectButton.getBoundingClientRect();
      const target = findSafeSpot(rect.width, rect.height);

      rejectButton.style.left = target.x.toFixed(1) + 'px';
      rejectButton.style.top = target.y.toFixed(1) + 'px';
      rejectButton.style.transform =
        'rotate(' + random(-8, 8).toFixed(1) + 'deg) scale(' + random(0.95, 1.03).toFixed(2) + ')';
    }

    function keepOnScreen() {
      if (!isFloating) return;

      const maxX = Math.max(SAFE_MARGIN, window.innerWidth - rejectButton.offsetWidth - SAFE_MARGIN);
      const maxY = Math.max(SAFE_MARGIN, window.innerHeight - rejectButton.offsetHeight - SAFE_MARGIN);
      const cx = parseFloat(rejectButton.style.left);
      const cy = parseFloat(rejectButton.style.top);

      rejectButton.style.left = clamp(isNaN(cx) ? SAFE_MARGIN : cx, SAFE_MARGIN, maxX).toFixed(1) + 'px';
      rejectButton.style.top = clamp(isNaN(cy) ? SAFE_MARGIN : cy, SAFE_MARGIN, maxY).toFixed(1) + 'px';
    }

    if (rejectButton) {
      // 1) Souris : dès qu'elle s'approche (pas besoin de survoler pile dessus).
      listen(window, 'pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;
        pointer = { x: event.clientX, y: event.clientY };
        if (distanceToRect(event.clientX, event.clientY, rejectButton.getBoundingClientRect()) < ESCAPE_RADIUS) {
          dodge(event.clientX, event.clientY);
        }
      });

      // 2) Tactile : le doigt se pose près du bouton → il part avant le « tap ».
      listen(window, 'touchstart', (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        pointer = { x: touch.clientX, y: touch.clientY };
        if (distanceToRect(touch.clientX, touch.clientY, rejectButton.getBoundingClientRect()) < ESCAPE_RADIUS * 0.7) {
          dodge(touch.clientX, touch.clientY);
        }
      }, { passive: true });

      // 3) Sur le bouton lui-même : on annule le tap / clic, et il file.
      rejectButton.addEventListener('touchstart', (event) => {
        const touch = event.touches && event.touches[0];
        if (touch) pointer = { x: touch.clientX, y: touch.clientY };
        if (event.cancelable) event.preventDefault();
        lastDodgeAt = 0;
        dodge(pointer.x, pointer.y);
      }, { passive: false });

      rejectButton.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        lastDodgeAt = 0;
        dodge(event.clientX, event.clientY);
      });

      rejectButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        lastDodgeAt = 0;
        dodge(event.clientX, event.clientY);
      });

      // 4) Clavier : impossible de valider « Non » avec Entrée / Espace.
      rejectButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          lastDodgeAt = 0;
          dodge(pointer.x, pointer.y);
        }
      });

      rejectButton.addEventListener('focus', () => {
        lastDodgeAt = 0;
        dodge(pointer.x, pointer.y);
      });

      listen(window, 'resize', keepOnScreen);
      listen(window, 'orientationchange', keepOnScreen);
    }

    /* --- Bouton « Oui » --------------------------------------------------- */

    function handleAccept() {
      if (!acceptButton || acceptButton.dataset.busy === 'true') return;
      acceptButton.dataset.busy = 'true';

      acceptButton.classList.add('is-success');
      acceptButton.classList.remove('btn--pulse');

      if (rejectButton) {
        rejectButton.style.opacity = '0';
        rejectButton.style.pointerEvents = 'none';
      }

      if (isDate) {
        acceptButton.textContent = '💖 Merci… je suis aux anges';
        setFeedback('Tu viens de faire de moi le plus heureux 🥰');
        saveDateChoice();
        fireworks(6200);
        burstHearts(40);
        window.setTimeout(() => leaveTo('page10.html'), prefersReducedMotion ? 100 : 5400);
        return;
      }

      acceptButton.textContent = '💗 Tu me rends fou…';
      setFeedback('Mon cœur vient de sourire… merci 🥰💕');
      burstHearts(52);
      leaveTo('page3.html');
    }

    if (acceptButton) acceptButton.addEventListener('click', handleAccept);

    if (isDate) {
      const day = $('#dateDay');
      if (day) day.min = todayISO();

      $$('input[name="dateKind"]').forEach((input) => {
        input.addEventListener('change', () => burstHearts(6));
      });
    }
  }

  /* ------------------------------------------------------------------------
     20. Page 10 — finale : ticket, compte à rebours, photo, feux d'artifice
     ------------------------------------------------------------------------ */

  const HER_PHOTO_KEY = 'herPhotoDataUrl';

  function fillTicket() {
    const data = loadDateData();
    if (!data) return;

    const kindEl = $('#ticketKind');
    const whenEl = $('#ticketWhen');

    if (kindEl && data.kind) kindEl.textContent = data.kind + ' ' + (data.emoji || '');

    if (whenEl) {
      const date = dateFromData(data);
      let text = '';
      if (date && data.day) {
        text = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      }
      if (data.time) text += (text ? ' à ' : 'à ') + String(data.time).replace(':', 'h');
      if (text) whenEl.textContent = text + ' 💞';
    }
  }

  function initCountdown() {
    const box = $('#countdown');
    if (!box) return;

    const grid = $('#countdownGrid');
    const doneEl = $('#countdownDone');
    const setup = $('#countdownSetup');
    const editBtn = $('#cdEdit');
    const startBtn = $('#cdStart');
    const dayInput = $('#cdDateInput');
    const timeInput = $('#cdTimeInput');
    const cells = {
      d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMinutes'), s: $('#cdSeconds')
    };

    if (dayInput) dayInput.min = todayISO();

    const pad = (n) => String(n).padStart(2, '0');
    let lastSeconds = -1;

    function render() {
      const target = dateFromData(loadDateData());

      if (!target) {
        grid.hidden = true;
        doneEl.hidden = true;
        setup.hidden = false;
        editBtn.hidden = true;
        return;
      }

      setup.hidden = true;
      editBtn.hidden = false;

      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        grid.hidden = true;
        doneEl.hidden = false;
        doneEl.textContent =
          target.toDateString() === new Date().toDateString()
            ? 'C’est aujourd’hui… 💞'
            : 'Notre rendez-vous est passé… vivement le prochain 💞';
        return;
      }

      grid.hidden = false;
      doneEl.hidden = true;

      const total = Math.floor(diff / 1000);
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;

      cells.d.textContent = days;
      cells.h.textContent = pad(hours);
      cells.m.textContent = pad(minutes);
      cells.s.textContent = pad(seconds);

      if (seconds !== lastSeconds) {
        lastSeconds = seconds;
        cells.s.classList.remove('is-tick');
        void cells.s.offsetWidth;
        cells.s.classList.add('is-tick');
      }
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (!dayInput || !dayInput.value) {
          dayInput.focus();
          return;
        }
        const previous = loadDateData() || {};
        saveDateData({
          kind: previous.kind || 'une surprise que je prépare',
          emoji: previous.emoji || '🎁',
          day: dayInput.value,
          time: (timeInput && timeInput.value) || '19:00'
        });
        fillTicket();
        render();
        burstHearts(20);
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const previous = loadDateData() || {};
        saveDateData({ kind: previous.kind, emoji: previous.emoji, day: '', time: '' });
        render();
      });
    }

    render();
    every(render, 1000);
  }

  function initFinal() {
    if (!pageClass('page--final')) return;

    burstHearts(14);
    after(() => confetti(4600), 500);

    let spawned = 0;
    every(() => {
      if (spawned >= 40) return;
      spawnHeart({ duration: random(7, 11), size: random(13, 26) });
      spawned += 1;
    }, 1100);

    fillTicket();
    initCountdown();

    const moreLove = $('#moreLove');
    if (moreLove) {
      moreLove.addEventListener('click', () => {
        burstHearts(46);
        confetti(3200);
      });
    }

    const fwBtn = $('#fireworksBtn');
    if (fwBtn) fwBtn.addEventListener('click', () => fireworks(6000));

    /* --- Photo de la destinataire ---------------------------------------- */

    const slot = $('#herPhotoSlot');
    const input = $('#herPhotoInput');
    const preview = $('#herPhotoPreview');
    const addBtn = $('#herPhotoLabel');
    const changeBtn = $('#herPhotoChange');

    function openPhotoPicker() {
      if (!input) return;
      input.value = '';
      input.click();
    }

    function showHerPhoto(dataUrl) {
      if (!slot || !preview || !addBtn || !changeBtn) return;
      preview.src = dataUrl;
      preview.hidden = false;
      addBtn.hidden = true;
      changeBtn.hidden = false;
      slot.classList.add('has-photo');
    }

    const saved = read(local, HER_PHOTO_KEY);
    if (saved) showHerPhoto(saved);

    if (addBtn) {
      addBtn.addEventListener('click', (event) => {
        event.preventDefault();
        openPhotoPicker();
      });
    }

    if (changeBtn) {
      changeBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openPhotoPicker();
      });
    }

    if (input) {
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;

        const isImage =
          (file.type && file.type.startsWith('image/')) ||
          /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(file.name || '');
        if (!isImage) return;

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          if (typeof dataUrl !== 'string') return;
          showHerPhoto(dataUrl);
          store(local, HER_PHOTO_KEY, dataUrl);
          burstHearts(18);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  /* ------------------------------------------------------------------------
     21. Page 11 — livre d'or
     ------------------------------------------------------------------------ */

  const GUEST_KEY = 'romanceGuestbook';

  function initGuest() {
    if (!pageClass('page--guest')) return;

    const form = $('#guestForm');
    const nameInput = $('#guestName');
    const message = $('#guestMessage');
    const counter = $('#guestCount');
    const status = $('#guestStatus');
    const wall = $('#guestWall');
    const notes = $('#guestNotes');
    const sendBtn = $('#guestSend');

    function renderNotes() {
      const list = readJSON(local, GUEST_KEY, []);
      wall.hidden = !list.length;
      notes.innerHTML = '';

      list.slice().reverse().forEach((entry, i) => {
        const note = document.createElement('article');
        note.className = 'note';
        note.style.setProperty('--r', (i % 2 ? 1.6 : -2.1) + 'deg');
        note.style.animationDelay = Math.min(i, 8) * 0.08 + 's';

        const head = document.createElement('p');
        head.className = 'note__head';
        head.textContent = (entry.mood ? entry.mood + ' ' : '') + (entry.name || 'Moi');

        const text = document.createElement('p');
        text.className = 'note__text';
        text.textContent = entry.text;

        const date = document.createElement('p');
        date.className = 'note__date';
        date.textContent = new Date(entry.at).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });

        note.appendChild(head);
        note.appendChild(text);
        note.appendChild(date);
        notes.appendChild(note);
      });
    }

    function deliver(text) {
      const contact = CFG.contact || {};
      const wa = String(contact.whatsapp || '').replace(/\D/g, '');

      if (wa) {
        window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        return Promise.resolve('whatsapp');
      }
      if (contact.email) {
        window.location.href = 'mailto:' + contact.email +
          '?subject=' + encodeURIComponent('Un petit mot pour toi 💌') +
          '&body=' + encodeURIComponent(text);
        return Promise.resolve('email');
      }
      if (navigator.share) {
        return navigator.share({ text: text }).then(() => 'share').catch(() => 'cancel');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => 'copy').catch(() => 'none');
      }
      return Promise.resolve('none');
    }

    const STATUS = {
      whatsapp: 'Ton message t’attend dans WhatsApp : il ne reste qu’à l’envoyer 💌',
      email: 'Ton application mail s’ouvre : il ne reste qu’à l’envoyer 💌',
      share: 'Merci, vraiment 💗',
      cancel: 'Ton mot est gardé sur ce mur. Tu pourras me l’envoyer quand tu voudras 💗',
      copy: 'Message copié ! Colle-le dans une conversation pour me l’envoyer 💌',
      none: 'Ton mot est gardé sur ce mur 💗'
    };

    if (message && counter) {
      message.addEventListener('input', () => {
        counter.textContent = message.value.length + ' / 500';
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const text = message.value.trim();
      if (text.length < 2) {
        status.textContent = 'Écris au moins un petit mot… 💗';
        message.focus();
        return;
      }

      const name = nameInput.value.trim();
      const moodInput = $('input[name="guestMood"]:checked');
      const mood = moodInput ? moodInput.value : '';

      const list = readJSON(local, GUEST_KEY, []);
      list.push({ name: name, mood: mood, text: text, at: Date.now() });
      store(local, GUEST_KEY, JSON.stringify(list.slice(-30)));
      renderNotes();

      sendBtn.disabled = true;
      burstHearts(40);
      confetti(2600);

      const full = 'Livre d’or 💌\n' + (mood ? mood + ' ' : '') + (name ? name + ' : ' : '') + text;

      deliver(full).then((how) => {
        status.textContent = STATUS[how] || STATUS.none;
        sendBtn.disabled = false;
        message.value = '';
        counter.textContent = '0 / 500';
      });
    });

    renderNotes();
  }

  /* ------------------------------------------------------------------------
     22. Initialisation d'une page (appelée au chargement ET à chaque changement de page)
     ------------------------------------------------------------------------ */

  function initPage(musicSrc) {
    heartPool = HEART_EMOJIS;

    personalize();
    applyReveal();
    buildSteps();
    setupAmbient();

    initReasons();
    initLetter();
    initMemories();
    initQuiz();
    initGame();
    initHundred();
    initAsk();
    initFinal();
    initGuest();

    Music.enter(musicSrc);
  }

  /* ------------------------------------------------------------------------
     23. Démarrage
     ------------------------------------------------------------------------ */

  const gated = shouldShowStartGate();

  if (gated) {
    Music.setGated(true);
    body.classList.add('is-gated');
  }

  initPage(musicSrcFor(document));

  if (gated) showStartGate();
})();

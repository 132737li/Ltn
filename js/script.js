/* ==========================================================================
   Mini-site « demande d'excuse » — JavaScript principal
   Utilisé par index.html, page2.html et page3.html
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Utilitaires
     ------------------------------------------------------------------------ */

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) =>
    Array.prototype.slice.call((scope || document).querySelectorAll(selector));

  const random = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const HEART_EMOJIS = ['💗', '💖', '💕', '❤️', '💞', '🌸', '✨'];

  /* ------------------------------------------------------------------------
     2. Transition entre les pages (voile rose)
     ------------------------------------------------------------------------ */

  const veil = $('.page-veil');

  if (veil) {
    const markReady = () => veil.classList.add('is-ready');
    veil.addEventListener('animationend', markReady, { once: true });
    window.setTimeout(markReady, 900);
  }

  function leaveTo(url) {
    if (veil) {
      veil.classList.add('is-active');
    }
    window.setTimeout(() => {
      window.location.href = url;
    }, prefersReducedMotion ? 60 : 420);
  }

  /* ------------------------------------------------------------------------
     3. Cœurs flottants
     ------------------------------------------------------------------------ */

  const heartsLayer = $('#heartsLayer');

  function spawnHeart(options) {
    if (!heartsLayer) return;

    const opts = options || {};
    const size = opts.size !== undefined ? opts.size : random(15, 32);
    const duration = opts.duration !== undefined ? opts.duration : random(5, 8.5);
    const delay = opts.delay !== undefined ? opts.delay : 0;

    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = HEART_EMOJIS[randomInt(0, HEART_EMOJIS.length - 1)];
    heart.setAttribute('aria-hidden', 'true');

    heart.style.left = (opts.left !== undefined ? opts.left : random(2, 96)) + 'vw';
    heart.style.fontSize = size.toFixed(1) + 'px';
    heart.style.animationDuration = duration.toFixed(2) + 's';
    heart.style.animationDelay = delay.toFixed(2) + 's';

    heartsLayer.appendChild(heart);

    const lifetime = (duration + delay + 0.8) * 1000;
    window.setTimeout(() => {
      if (heart.parentNode) heart.parentNode.removeChild(heart);
    }, lifetime);
  }

  function burstHearts(count) {
    const total = count || 36;
    for (let i = 0; i < total; i += 1) {
      window.setTimeout(() => {
        spawnHeart({
          size: random(18, 44),
          duration: random(3.4, 6.2),
          left: random(2, 96)
        });
      }, i * 34);
    }
  }

  /* ------------------------------------------------------------------------
     4. Apparition progressive des textes (pages 1 et 3)
     ------------------------------------------------------------------------ */

  $$('.reveal').forEach((element, index) => {
    element.style.animationDelay = (0.2 + index * 0.18).toFixed(2) + 's';
  });

  /* ------------------------------------------------------------------------
     5. Page finale — ambiance de cœurs
     ------------------------------------------------------------------------ */

  const isFinalPage = document.body.classList.contains('page--final');

  if (isFinalPage && heartsLayer) {
    burstHearts(14);

    let spawned = 0;
    const ambient = window.setInterval(() => {
      spawnHeart({ duration: random(7, 11), size: random(13, 26) });
      spawned += 1;
      if (spawned >= 40) window.clearInterval(ambient);
    }, 1100);
  }

  /* ------------------------------------------------------------------------
     6. Page 2 — éléments interactifs
     ------------------------------------------------------------------------ */

  const acceptButton = $('#acceptButton');
  const rejectButton = $('#rejectButton');
  const feedback = $('#feedback');

  /* --- 6.1 Bouton « Oui » ------------------------------------------------ */

  function handleAccept() {
    if (!acceptButton || acceptButton.dataset.busy === 'true') return;
    acceptButton.dataset.busy = 'true';

    acceptButton.classList.add('is-success');
    acceptButton.textContent = '💗 Merci beaucoup !';

    if (rejectButton) {
      rejectButton.style.opacity = '0';
      rejectButton.style.pointerEvents = 'none';
    }

    setFeedback('Youpi ! Je savais que tu avais un cœur en or 🥰');

    burstHearts(52);
    leaveTo('page3.html');
  }

  if (acceptButton) {
    acceptButton.addEventListener('click', handleAccept);
  }

  /* --- 6.2 Bouton « Non » fuyant ---------------------------------------- */

  const REJECT_LABELS = [
    '😤 Non',
    'Attends 😭',
    'Tu es sûre ?',
    'Réfléchis encore 🥺',
    'Impossible 😅',
    'Essaie encore 😂',
    'Toujours non ? 😳',
    'Pitié… 🥹',
    'Je vais pleurer 😭',
    'Non non non 😵'
  ];

  const REJECT_MESSAGES = [
    'Oups 😅 essaie encore...',
    'Tu es vraiment sûre ? 🥺',
    'Réfléchis bien... 😭',
    'Ce bouton est timide, il se sauve 🙈',
    'Tu peux toujours courir 🏃‍♀️💨',
    'Même le bouton est de mon côté 😌',
    'Il paraît que « Oui » est beaucoup plus simple 💗',
    'Bon... on arrête de jouer ? 🥺'
  ];

  const DODGE_COOLDOWN = 400;
  const SAFE_MARGIN = 14;
  const POINTER_KEEPOUT = 110;

  let noAttempts = 0;
  let isFloating = false;
  let lastDodgeAt = 0;
  let pointer = { x: -9999, y: -9999 };

  if (rejectButton) {
    rejectButton.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      dodge(event);
    });

    rejectButton.addEventListener(
      'touchstart',
      (event) => {
        const touch = event.touches && event.touches[0];
        if (touch) {
          pointer = { x: touch.clientX, y: touch.clientY };
        }
        event.preventDefault();
        dodge();
      },
      { passive: false }
    );

    rejectButton.addEventListener('click', (event) => {
      dodge(event);
    });

    window.addEventListener('resize', keepRejectButtonOnScreen);
    window.addEventListener('orientationchange', keepRejectButtonOnScreen);
  }

  function dodge(event) {
    if (!rejectButton) return;

    const now = Date.now();
    if (now - lastDodgeAt < DODGE_COOLDOWN) return;
    lastDodgeAt = now;

    if (
      event &&
      typeof event.clientX === 'number' &&
      (event.clientX !== 0 || event.clientY !== 0)
    ) {
      pointer = { x: event.clientX, y: event.clientY };
    }

    noAttempts += 1;

    if (!isFloating) {
      detachRejectButton();
    }

    const rect = rejectButton.getBoundingClientRect();
    const target = findSafeSpot(rect.width, rect.height);

    rejectButton.style.left = target.x.toFixed(1) + 'px';
    rejectButton.style.top = target.y.toFixed(1) + 'px';
    rejectButton.style.transform =
      'rotate(' + random(-10, 10).toFixed(1) + 'deg) scale(' +
      random(0.9, 1.06).toFixed(2) + ')';

    const labelIndex = Math.min(noAttempts, REJECT_LABELS.length - 1);
    rejectButton.textContent = REJECT_LABELS[labelIndex];

    const messageIndex = Math.min(noAttempts - 1, REJECT_MESSAGES.length - 1);
    setFeedback(REJECT_MESSAGES[messageIndex]);
  }

  function detachRejectButton() {
    const rect = rejectButton.getBoundingClientRect();

    const spacer = document.createElement('span');
    spacer.className = 'btn-spacer';
    spacer.style.width = rect.width + 'px';
    spacer.style.height = rect.height + 'px';
    spacer.setAttribute('aria-hidden', 'true');

    if (rejectButton.parentNode) {
      rejectButton.parentNode.insertBefore(spacer, rejectButton);
    }

    document.body.appendChild(rejectButton);

    rejectButton.style.width = rect.width + 'px';
    rejectButton.style.height = rect.height + 'px';
    rejectButton.style.left = rect.left + 'px';
    rejectButton.style.top = rect.top + 'px';
    rejectButton.classList.add('is-floating');

    isFloating = true;

    void rejectButton.offsetWidth;
  }

  function findSafeSpot(width, height) {
    const maxX = Math.max(SAFE_MARGIN, window.innerWidth - width - SAFE_MARGIN);
    const maxY = Math.max(SAFE_MARGIN, window.innerHeight - height - SAFE_MARGIN);

    const acceptRect = acceptButton ? acceptButton.getBoundingClientRect() : null;
    const currentRect = rejectButton.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    const profiles = [
      { travel: 90, keepout: POINTER_KEEPOUT },
      { travel: 60, keepout: 70 },
      { travel: 0, keepout: 40 },
      { travel: 0, keepout: 0 }
    ];

    for (let p = 0; p < profiles.length; p += 1) {
      const profile = profiles[p];

      for (let i = 0; i < 30; i += 1) {
        const x = random(SAFE_MARGIN, maxX);
        const y = random(SAFE_MARGIN, maxY);
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        const pointerDistance = Math.hypot(centerX - pointer.x, centerY - pointer.y);
        if (pointerDistance < profile.keepout) continue;

        if (
          acceptRect &&
          overlaps({ x: x, y: y, width: width, height: height }, acceptRect)
        ) {
          continue;
        }

        const travel = Math.hypot(centerX - currentCenter.x, centerY - currentCenter.y);
        if (travel < profile.travel) continue;

        return { x: x, y: y };
      }
    }

    return {
      x: currentCenter.x < window.innerWidth / 2 ? maxX : SAFE_MARGIN,
      y: currentCenter.y < window.innerHeight / 2 ? maxY : SAFE_MARGIN
    };
  }

  function overlaps(rect, domRect) {
    return !(
      rect.x + rect.width < domRect.left - 10 ||
      rect.x > domRect.right + 10 ||
      rect.y + rect.height < domRect.top - 10 ||
      rect.y > domRect.bottom + 10
    );
  }

  function keepRejectButtonOnScreen() {
    if (!isFloating || !rejectButton) return;

    const width = rejectButton.offsetWidth;
    const height = rejectButton.offsetHeight;

    const maxX = Math.max(SAFE_MARGIN, window.innerWidth - width - SAFE_MARGIN);
    const maxY = Math.max(SAFE_MARGIN, window.innerHeight - height - SAFE_MARGIN);

    const currentX = parseFloat(rejectButton.style.left);
    const currentY = parseFloat(rejectButton.style.top);

    rejectButton.style.left =
      clamp(isNaN(currentX) ? SAFE_MARGIN : currentX, SAFE_MARGIN, maxX).toFixed(1) + 'px';
    rejectButton.style.top =
      clamp(isNaN(currentY) ? SAFE_MARGIN : currentY, SAFE_MARGIN, maxY).toFixed(1) + 'px';
  }

  function setFeedback(message) {
    if (!feedback) return;

    feedback.textContent = message;
    feedback.classList.remove('is-visible');

    void feedback.offsetWidth;

    feedback.classList.add('is-visible');
  }

  /* ------------------------------------------------------------------------
     7. Musique de page — autoplay + bouton de secours
     ------------------------------------------------------------------------ */

  const bgMusic = $('#pageMusic');
  const musicToggle = $('#musicToggle');
  const MUSIC_FLAG = 'apologyMusicUnlocked';

  if (bgMusic) {
    bgMusic.volume = 0.55;

    const hasFlag = () => {
      try {
        return window.sessionStorage.getItem(MUSIC_FLAG) === 'true';
      } catch (error) {
        return false;
      }
    };

    const setFlag = () => {
      try {
        window.sessionStorage.setItem(MUSIC_FLAG, 'true');
      } catch (error) {
        /* sessionStorage indisponible : on ignore. */
      }
    };

    const syncButton = () => {
      if (!musicToggle) return;
      const playing = !bgMusic.paused && !bgMusic.ended;
      musicToggle.setAttribute('aria-pressed', String(playing));
      musicToggle.setAttribute(
        'aria-label',
        playing ? 'Couper la musique' : 'Activer la musique'
      );
      musicToggle.textContent = playing ? '⏸️' : '🎵';
    };

    const tryPlay = () => {
      const promise = bgMusic.play();
      if (promise && typeof promise.then === 'function') {
        return promise.then(() => true).catch(() => false);
      }
      return Promise.resolve(true);
    };

    const removeUnlockListeners = () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    const unlock = (event) => {
      // Clic sur le bouton musique : on laisse le bouton gérer, mais
      // on note qu'il y a eu interaction.
      if (
        musicToggle &&
        event.target &&
        typeof musicToggle.contains === 'function' &&
        musicToggle.contains(event.target)
      ) {
        setFlag();
        removeUnlockListeners();
        return;
      }

      removeUnlockListeners();
      setFlag(); // écrit AVANT toute navigation potentielle
      tryPlay().then(syncButton);
    };

    const installUnlockListeners = () => {
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('touchstart', unlock);
      window.addEventListener('keydown', unlock);
    };

    const startAutoplay = () => {
      tryPlay().then((started) => {
        syncButton();
        if (started) {
          setFlag();
        } else {
          // Autoplay bloqué : on démarre au premier geste.
          installUnlockListeners();
        }
      });
    };

    // Synchronise l'icône du bouton avec l'état réel de la musique.
    bgMusic.addEventListener('play', syncButton);
    bgMusic.addEventListener('pause', syncButton);
    bgMusic.addEventListener('ended', syncButton);

    // Bouton manuel (toujours disponible en secours).
    if (musicToggle) {
      musicToggle.addEventListener('click', (event) => {
        event.stopPropagation();
        removeUnlockListeners();
        setFlag();

        if (bgMusic.paused || bgMusic.ended) {
          tryPlay().then(syncButton);
        } else {
          bgMusic.pause();
          syncButton();
        }
      });
    }

    // Démarrage automatique
    if (hasFlag()) {
      // L'utilisatrice a déjà interagi avec le site : on tente tout de suite.
      window.setTimeout(startAutoplay, 250);
    } else {
      // Première visite : on tente quand même ; sinon on attend un geste.
      startAutoplay();
    }

    syncButton();
  }
})();
/* ==========================================================================
   Mini-site de salutation romantique — JavaScript principal
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

  const HEART_EMOJIS = ['🫡', '🫣', '💵', '😎', '💻', '🎧', '🎮'];

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
     5. Page finale — ambiance de cœurs + upload de sa photo
     ------------------------------------------------------------------------ */

  const isFinalPage = document.body.classList.contains('page--final');
  const HER_PHOTO_KEY = 'herPhotoDataUrl';

  if (isFinalPage && heartsLayer) {
    burstHearts(14);

    let spawned = 0;
    const ambient = window.setInterval(() => {
      spawnHeart({ duration: random(7, 11), size: random(13, 26) });
      spawned += 1;
      if (spawned >= 40) window.clearInterval(ambient);
    }, 1100);
  }

  if (isFinalPage) {
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

    function persistHerPhoto(dataUrl) {
      try {
        window.localStorage.setItem(HER_PHOTO_KEY, dataUrl);
      } catch (error) {
        /* Quota ou localStorage indisponible : on ignore. */
      }
    }

    try {
      const saved = window.localStorage.getItem(HER_PHOTO_KEY);
      if (saved) showHerPhoto(saved);
    } catch (error) {
      /* ignore */
    }

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
          persistHerPhoto(dataUrl);
          burstHearts(18);
        };
        reader.readAsDataURL(file);
      });
    }
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
    acceptButton.textContent = '💗 Tu me rends fou…';

    if (rejectButton) {
      rejectButton.style.opacity = '0';
      rejectButton.style.pointerEvents = 'none';
    }

    setFeedback('Mon cœur vient de sourire… merci 🥰💕');

    burstHearts(52);
    leaveTo('page3.html');
  }

  if (acceptButton) {
    acceptButton.addEventListener('click', handleAccept);
  }

/* --- 6.2 Bouton « Non » fuyant ---------------------------------------- */

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
  const MUSIC_FLAG = 'romanceMusicUnlocked';

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
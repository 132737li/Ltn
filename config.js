/* ==========================================================================
   ✍️  FICHIER DE PERSONNALISATION
   C'est ici que tu changes les textes, les musiques, les couleurs, le quiz,
   les 100 raisons… Pas besoin de toucher au reste du code.
   ========================================================================== */

window.ROMANCE_CONFIG = {

  /* ---------- Toi et elle ------------------------------------------------ */

  // Son prénom (ou surnom). Laisse '' pour garder les formules par défaut
  // (« Salut, belle âme… », « Chère toi, »). Exemple : 'Amina'
  recipientName: '',

  // Ton prénom, utilisé dans la signature de la lettre et les messages.
  senderName: 'Léon',

  /* ---------- Couleurs --------------------------------------------------- */

  // 'rose' | 'rouge' | 'violet' | 'bleu' | 'menthe' | 'orange'
  theme: 'rose',

  /* ---------- Les « cœurs » qui flottent --------------------------------- *
   * 'hearts' = de vrais cœurs assortis à la couleur du thème (recommandé).    *
   * Tu peux aussi donner ta propre liste d'emojis, par exemple celle d'avant : *
   *   floatingEmojis: ['🫡', '🫣', '💵', '😎', '💻', '🎧', '🎮']              */
  floatingEmojis: 'hearts',

  /* ---------- Écran « Touche pour commencer » ---------------------------- */

  // Recommandé : il garantit que la musique démarre partout (iPhone compris).
  startScreen: true,

  /* ---------- Page du mot de passe (toute première page) ------------------ *
   * enabled : true  = le site s'ouvre sur la page du mot de passe.            *
   * hash    : l'EMPREINTE du mot de passe (pas le mot de passe lui-même,      *
   *           pour qu'on ne le lise pas directement dans le code).            *
   * hint    : indice affiché après 3 essais ratés.                            *
   *                                                                           *
   * Mot de passe actuel : sa date d'anniversaire.                             *
   *                                                                           *
   * ➜ Pour CHANGER le mot de passe :                                          *
   *   1. ouvre le site, appuie sur F12, onglet « Console »                    *
   *   2. tape  romanceHash('JJMMAAAA')  (ex. romanceHash('30102007')) + Entrée *
   *   3. copie le long texte obtenu à la place de « hash » ci-dessous         *
   *                                                                           *
   * ⚠️ Sur un site gratuit sans serveur, ce mot de passe est un jeu           *
   *    romantique, pas un coffre-fort : quelqu'un de très technique pourrait  *
   *    le contourner. N'y mets jamais un vrai mot de passe (banque, mail…).    */
  lock: {
    enabled: true,
    hash: 'f85d8bd31777b05f8bfcc4523e82fc5e7a374dca5562ad7fdde82d6484d6440e',
    hint: 'Indice : c’est ta date de naissance, au format jour / mois / année 🎂'
  },

  /* ---------- Musique de chaque page ------------------------------------- *
   * Les fichiers sont dans le dossier assets/. Tu peux en ajouter d'autres.   */
  music: {
    lock:       'musique.mp3',
    accueil:    'musique.mp3',
    confession: 'musique2.mp3',
    reasons:    'musique1.mp3',
    letter:     'musique3.mp3',
    memories:   'musique.mp3',
    quiz:       'musique2.mp3',
    game:       'musique1.mp3',
    hundred:    'musique3.mp3',
    date:       'musique1.mp3',
    final:      'musique3.mp3',
    guestbook:  'musique.mp3'
  },

  /* ---------- Page 4 : la lettre ----------------------------------------- *
   * {name} = son prénom (ou « toi » s'il est vide), {sender} = ton prénom.    */
  letter: {
    to: 'Chère {name},',
    paragraphs: [
      'J’ai longtemps cherché les bons mots… et je crois que les plus simples sont aussi les plus vrais.',
      'Depuis que tu es dans mes pensées, tout me semble plus lumineux. Un seul message de toi suffit à changer ma journée.',
      'Je ne te promets pas la perfection. Je te promets de l’attention, du respect, et des sourires. Beaucoup de sourires.',
      'Alors voilà : j’aimerais prendre le temps de te connaître, de t’écouter, et de partager de vrais moments avec toi.'
    ],
    // Pour un côté plus personnel, ajoute un souvenir précis, par exemple :
    // 'Je repense encore à ce jour où tu as ri à ma blague nulle… et j’ai su.',
    sign: 'Avec tendresse,<br />{sender} 💗'
  },

  /* ---------- Page 5 : légendes des 3 polaroïds -------------------------- *
   * Dans l'ordre : photo1.jpg, photo.png, photo2.png                          */
  photoCaptions: [
    'Des fleurs pour ton sourire 💐',
    'Je pensais à toi 💭',
    'Mon regard, rien que pour toi 👀'
  ],

  /* ---------- Page 6 : le quiz « À quel point tu me connais ? » ----------- *
   * answer = numéro de la bonne réponse (0 = la première).                    *
   * Mets answer: null pour une question sans mauvaise réponse.                *
   * Pour changer une question : modifie q, options, answer, good et bad.      */
  quiz: [
    {
      q: 'Quel est mon plat préféré ?',
      options: ['Pizza', 'Riz, haricots et frites', 'Spaghettis', 'Poulet braisé'],
      answer: 1,
      good: 'Riz, haricots et frites… le vrai festin ! 😋',
      bad: 'Raté ! Rien ne bat le riz, les haricots et les frites. 😋'
    },
    {
      q: 'Quelles sont mes couleurs préférées ?',
      options: ['Rouge et noir', 'Rose et blanc', 'Vert et gris', 'Bleu et jaune'],
      answer: 2,
      good: 'Vert et gris, toujours. 💚🩶',
      bad: 'Non, c’est vert et gris. 💚🩶'
    },
    {
      q: 'Quelle est ma boisson préférée ?',
      options: ['Un jus de mangue', 'Un café bien chaud', 'Du lait chaud', 'Une Amstel Bright'],
      answer: 3,
      good: 'Une Amstel Bright, bien fraîche. 🍺',
      bad: 'Raté, c’est l’Amstel Bright ! 🍺'
    },
    {
      q: 'Quel genre de film je préfère ?',
      options: ['Les films d’amour', 'Les films d’action', 'Les dessins animés', 'Les films d’horreur'],
      answer: 1,
      good: 'Action,John Wick DeBabayaga. 🎬',
      bad: 'Non : j’adore l’action, surtout John Wick. 🎬'
    },
    {
      q: 'Quel artiste j’écoute le plus ?',
      options: ['Wiz Khalifa', 'Drake','Fredz', 'Burna Boy', 'Rihanna'],
      answer: 2,
      good: 'Fredz,Extraordinaires 🎶',
      good: 'Wiz Khalifa,Promises 🎶',
      bad: 'Raté, c’est Wiz Khalifa et Fredz. 🎶'
    },
    {
      q: 'Dans quel domaine je rêve de réussir ?',
      options: ['La médecine', 'Le football', 'La cuisine', 'L’informatique'],
      answer: 3,
      good: 'L’informatique : je veux devenir celui que je rêve d’être. 💻',
      bad: 'Non, mon domaine, c’est l’informatique. Et j’y arriverai. 💻'
    },
    {
      q: 'Que fais-je pour me ressourcer ?',
      options: ['Je fais la fête', 'Je médite, seul, au calme', 'Je joue avec tout le monde', 'Je regarde la télé toute la nuit'],
      answer: 1,
      good: 'La méditation, au calme. Je préfère peu de monde. 🧘',
      bad: 'Non, je médite seul, au calme. Les grandes foules, très peu pour moi. 🧘'
    },
    {
      q: 'À qui est-ce que je dis tout, comme à un jumeau ?',
      options: ['À tout le monde', 'À personne', 'Aux personnes en qui j’ai confiance', 'Aux inconnus'],
      answer: 2,
      good: 'Oui : quand je fais confiance, je dis tout. 🤝',
      bad: 'Non : seulement aux personnes en qui j’ai vraiment confiance. 🤝'
    },
    {
      q: 'Combien de fois par jour est-ce que je pense à toi ?',
      options: ['Une fois', 'Dix fois', 'Mille fois', 'Je n’ai jamais arrêté','Ca depend'],
      answer: 3,
      good: 'Tu me connais trop bien. 🙈',
      bad: 'Même mille, c’est trop peu : je n’ai jamais arrêté. 💘'
    }
  ],

  quizResults: {
    perfect: 'Tu me connais par cœur… et ça me fait fondre. 💖',
    good: 'Presque parfait ! Il ne reste que quelques petits secrets à découvrir ensemble. 💕',
    low: 'Il va falloir qu’on passe beaucoup plus de temps ensemble pour y remédier. 😏💗'
  },

  /* ---------- Page 7 : le jeu des cœurs ---------------------------------- */

  gameGoal: 15,           // nombre de points à atteindre (le cœur doré vaut 3)

  /* ---------- Page 11 : livre d'or --------------------------------------- *
   * Le site n'a pas de serveur : pour que son message ARRIVE jusqu'à toi,     *
   * renseigne au moins UN des deux contacts ci-dessous.                       *
   *  - whatsapp : ton numéro au format international, sans « + » ni espaces  *
   *               (ex. '25779123456')                                         *
   *  - email    : ton adresse e-mail                                          *
   * Si les deux sont vides, le menu « Partager » du téléphone s'ouvre.        */
  contact: {
    whatsapp: '',
    email: ''
  },

  /* ---------- Page 8 : les 100 raisons ----------------------------------- */
  reasons: [
    'Ton sourire illumine mes journées.',
    'Ta voix est ma mélodie préférée.',
    'Ton rire est contagieux.',
    'Tu as un cœur immense.',
    'Ton regard me fait oublier le reste du monde.',
    'Tu es douce sans jamais être fragile.',
    'Tu me donnes envie de devenir meilleur.',
    'Ta présence apaise tout.',
    'Tu sais écouter, vraiment.',
    'Tu éclaires une pièce rien qu’en y entrant.',
    'Tes yeux racontent mille histoires.',
    'Tu es naturellement toi, et c’est parfait.',
    'Ton courage m’inspire.',
    'Tu fais battre mon cœur plus vite.',
    'Ta gentillesse est sincère.',
    'Tu me fais sourire sans même essayer.',
    'Ta joie est communicative.',
    'Tu embellis tout ce que tu touches.',
    'Tu es ma première pensée du matin.',
    'Tu es ma dernière pensée du soir.',
    'Ta douceur est un trésor rare.',
    'Tu crois en tes rêves.',
    'Tu me donnes envie de rêver plus grand.',
    'Ton élégance est naturelle.',
    'Ta simplicité est ta plus belle parure.',
    'Avec toi, je me sens chez moi.',
    'Ton écoute est un cadeau.',
    'Tes petites attentions comptent énormément.',
    'Tu rends les jours ordinaires extraordinaires.',
    'Ta façon de dire mon prénom me fait fondre.',
    'Ton intelligence me fascine.',
    'Ton humour me surprend toujours.',
    'Tu es patiente avec les autres.',
    'Ta générosité n’attend rien en retour.',
    'Tu me rassures sans rien dire.',
    'Ta force tranquille m’impressionne.',
    'Ton silence est doux, jamais lourd.',
    'Tu rougis de la plus jolie façon.',
    'Tu transformes les détails en poésie.',
    'Ta présence donne du sens aux petits moments.',
    'Tu es sincère, et ça se sent.',
    'Tu sais consoler avec un simple mot.',
    'Tu portes ta beauté avec humilité.',
    'Tu me donnes envie de prendre mon temps.',
    'Tu es la raison de mes sourires cachés.',
    'Ta curiosité rend la vie plus intéressante.',
    'Tu as une façon unique de voir les choses.',
    'Tu fais confiance avec ton cœur.',
    'Tu rends les silences confortables.',
    'Rien qu’à l’idée de te voir, ma journée s’éclaire.',
    'Tu as de la grâce dans les moindres gestes.',
    'Ton énergie est lumineuse.',
    'Tu sais être forte et tendre à la fois.',
    'Tu donnes du courage sans le savoir.',
    'Tu es fidèle à tes valeurs.',
    'Ta bienveillance réchauffe les cœurs.',
    'Ton petit rire gêné… j’adore.',
    'Tu me fais croire aux belles histoires.',
    'Tu es une belle personne, de l’intérieur.',
    'Tu inspires le respect sans effort.',
    'Tu fais naître en moi l’envie de te protéger.',
    'Tu sais apprécier les petites choses.',
    'Tu as un regard qui comprend.',
    'Tu m’apprends la patience.',
    'Tu me fais aimer les dimanches.',
    'Ta présence rend la pluie plus jolie.',
    'Tu me donnes envie d’écrire des poèmes.',
    'Ta douceur me désarme.',
    'Tu es mon plus joli hasard.',
    'Tu mérites tout le bonheur du monde.',
    'Tu me fais perdre la notion du temps.',
    'Tu es drôle sans le vouloir.',
    'Tu fais de moi un meilleur homme.',
    'Ta fidélité envers ceux que tu aimes est belle.',
    'Ton sourire répare les mauvaises journées.',
    'Tu sais t’émerveiller.',
    'Ta façon de parler de ce que tu aimes est touchante.',
    'Tu es authentique dans un monde trop pressé.',
    'Tu as une lumière que rien n’éteint.',
    'Tu me donnes envie d’être vraiment présent.',
    'Tu fais battre mon cœur au rythme de tes rires.',
    'Ton prénom est ma plus jolie musique.',
    'Tu es mon calme dans le bruit.',
    'Tu rends chaque conversation précieuse.',
    'Tu es une promesse de douceur.',
    'Ta grâce ne s’explique pas, elle se ressent.',
    'Tu me donnes envie de dire « et si on essayait ? ».',
    'Tu es un souvenir que j’aime déjà.',
    'Tu sais aimer sans faire de bruit.',
    'Je te trouve belle, partout et tout le temps.',
    'Tu donnes envie de croire en demain.',
    'Ta présence est mon endroit préféré.',
    'Tu me donnes envie de prendre ta main.',
    'Je voudrais connaître chacun de tes détails.',
    'Tu as une âme claire comme le matin.',
    'Tu me fais me sentir vivant.',
    'Tu es tout ce que je n’osais pas demander.',
    'Tu es la plus belle surprise de mon année.',
    'Tu m’as donné envie d’écrire tout ça.',
    'Et la plus simple de toutes : c’est toi. 💖'
  ]
};

/* --------------------------------------------------------------------------
   Application immédiate du thème de couleur (évite un flash rose au chargement)
   -------------------------------------------------------------------------- */
(function () {
  var THEME_HUES = { rose: 333, rouge: 352, violet: 278, bleu: 212, menthe: 165, orange: 20 };
  var hue = THEME_HUES[window.ROMANCE_CONFIG.theme];
  if (hue === undefined) hue = THEME_HUES.rose;

  document.documentElement.style.setProperty('--hue', hue);

  document.addEventListener('DOMContentLoaded', function () {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', 'hsl(' + hue + ', 100%, 65%)');
  });
})();

/* --------------------------------------------------------------------------
   Protection d'accès (ne pas modifier)
   Une page intérieure ouverte directement renvoie vers la page du mot de passe.
   -------------------------------------------------------------------------- */
(function () {
  var lock = window.ROMANCE_CONFIG.lock;
  var last = window.location.pathname.split('/').pop();
  var isLockPage = last === '' || last === 'index.html';

  if (!lock || !lock.enabled) {
    if (isLockPage) window.location.replace('accueil.html');
    return;
  }

  var unlocked = false;
  try { unlocked = window.sessionStorage.getItem('romanceUnlocked') === 'true'; } catch (e) {}

  if (!isLockPage && !unlocked) window.location.replace('index.html');
})();

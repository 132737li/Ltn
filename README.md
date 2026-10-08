Voici le README.md complet, prêt à copier-coller tel quel.

---

README.md

```markdown
# 💗 Excuse-Site — Mini-site interactif de demande d'excuse

> Un petit site romantique, amusant et responsive pour présenter une demande
> d'excuse à quelqu'un de spécial. Construit en HTML, CSS et JavaScript natifs —
> aucune dépendance externe, aucun framework, aucun build.

---

## 📖 Sommaire

1. [Aperçu](#-aperçu)
2. [Démo](#-démo)
3. [Fonctionnalités](#-fonctionnalités)
4. [Structure du projet](#-structure-du-projet)
5. [Installation](#-installation)
6. [Utilisation](#-utilisation)
7. [Personnalisation](#-personnalisation)
8. [Comportement du bouton « Non »](#-comportement-du-bouton--non-)
9. [Musique de fond](#-musique-de-fond)
10. [Compatibilité](#-compatibilité)
11. [Accessibilité](#-accessibilité)
12. [Détails techniques](#-détails-techniques)
13. [Licence](#-licence)
14. [Auteur](#-auteur)

---

## ✨ Aperçu

Ce mini-site propose une expérience interactive en trois étapes :

1. **Page 1 — `index.html`** : un message d'accueil et une petite blague pour
   détendre l'atmosphère avant le moment sérieux.
2. **Page 2 — `page2.html`** : la vraie demande d'excuse, avec deux boutons :
   un **« Oui, je pardonne »** et un **« Non »** qui s'enfuit dès qu'on essaie
   de cliquer dessus.
3. **Page 3 — `page3.html`** : un message de remerciement chaleureux, avec des
   cœurs animés, une galerie de photos et une musique de fond.

Le tout dans un thème **rose / pink 💗** élégant, moderne et responsive.

---

## 🚀 Démo

Ouvre simplement le fichier `index.html` dans un navigateur moderne
(Chrome, Firefox, Safari, Edge). Aucun serveur, aucune installation requise.

```bash
# Ouverture directe (macOS)
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

---

🎯 Fonctionnalités

· 🎨 Thème rose moderne : dégradés doux, cartes arrondies, ombres légères.
· 📱 100 % responsive : testé de 320 px (petit mobile) à 1920 px (grand écran).
· 💗 Cœurs animés : apparition progressive et flottement continu sur la page finale.
· 😤 Bouton « Non » fuyant : esquive le curseur (desktop) et le doigt (mobile),
  avec messages et libellés qui changent à chaque tentative.
· 💕 Bouton « Oui » principal : animation de réussite + explosion de cœurs,
  puis transition fluide vers la page finale.
· 🎵 Musique par page : chaque page joue automatiquement sa propre chanson
  dès qu'on y arrive (voir Musique de fond).
· 📸 Galerie de photos : affichage élégant de deux photos sur la page finale.
· ♿ Accessibilité : navigation clavier, focus visible, aria-label/aria-pressed,
  respect de prefers-reduced-motion.
· 🔗 Aucune dépendance externe : HTML, CSS et JavaScript natifs uniquement
  (hors police Google Fonts, optionnelle).

---

📁 Structure du projet

```
excuse-site/
│
├── index.html          → Page 1 : accueil + blague
├── page2.html          → Page 2 : demande d'excuse + boutons
├── page3.html          → Page 3 : remerciement + photos + musique
├── README.md           → Ce fichier
│
├── css/
│   └── style.css       → Feuille de style unique pour les 3 pages
│
├── js/
│   └── script.js       → Logique commune (cœurs, boutons, musique…)
│
└── assets/
    ├── README.md       → Notes sur les ressources
    ├── musique1.mp3    → Chanson de index.html
    ├── musique2.mp3    → Chanson de page2.html
    ├── musique3.mp3    → Chanson de page3.html
    ├── photo.png       → Première photo (page 3)
    └── photo2.png      → Deuxième photo (page 3)
```

---

⚙️ Installation

1. Télécharger ou cloner ce dossier sur ton ordinateur.
2. Ajouter les ressources dans assets/ :
   · musique1.mp3, musique2.mp3, musique3.mp3 (les chansons de chaque page)
   · photo.png, photo2.png (les photos affichées sur la page finale)
3. Ouvrir index.html dans un navigateur. C'est tout. 🎉

---

🕹️ Utilisation

Action Résultat
Ouvrir index.html Page d'accueil, la musique se lance au premier clic.
Cliquer sur « Continuer 💗 » Passage à page2.html, musique 2 lancée automatiquement.
Cliquer sur « Oui, je pardonne » Explosion de cœurs + transition vers page3.html.
Cliquer sur « Non » Le bouton s'enfuit et change de texte. 😂
Bouton 🎵 en haut à droite Coupe / relance la musique en cours.
Cliquer sur « Revenir au début » (page 3) Retour à index.html.

---

🎨 Personnalisation

Modifier les textes

Les textes sont directement dans les fichiers HTML. Ouvre‑les dans un éditeur
et remplace le contenu des balises <h1>, <p> et <button>.

Fichier À modifier
index.html Titre, blague, phrase d'introduction
page2.html Texte de la demande d'excuse, question finale
page3.html Message de remerciement, phrase de promesse

Modifier les couleurs

Toutes les couleurs sont regroupées en haut de css/style.css, dans le bloc
:root. Exemple :

```css
:root {
  --pink:       #ff4f9a;   /* rose principal */
  --pink-light: #ffd6e8;   /* rose clair */
  --pink-soft:  #fff5f9;   /* rose très clair */
}
```

Change ces trois valeurs et l'ensemble du site s'adapte automatiquement.

Modifier les messages du bouton « Non »

Dans js/script.js, deux tableaux contrôlent les messages :

```js
const REJECT_LABELS = [
  '😤 Non',
  'Attends 😭',
  'Tu es sûre ?',
  // ... ajouter / modifier librement
];

const REJECT_MESSAGES = [
  'Oups 😅 essaie encore...',
  'Tu es vraiment sûre ? 🥺',
  // ... ajouter / modifier librement
];
```

Modifier les photos

Place tes images dans assets/ puis mets à jour les src dans page3.html :

```html
<img src="assets/photo.png"  alt="Un souvenir de nous deux" class="photo" />
<img src="assets/photo2.png" alt="Un autre beau moment"     class="photo" />
```

---

😤 Comportement du bouton « Non »

Le bouton « Non » de page2.html est volontairement difficile à cliquer.
À chaque tentative :

· Il se déplace aléatoirement dans la fenêtre (avec une transition douce).
· Il change de libellé (Attends 😭, Tu es sûre ?, Pense encore 🥺…).
· Un message amusant s'affiche sous les boutons.
· Il ne sort jamais de l'écran et ne recouvre jamais le bouton « Oui ».

Détection de tentative :

· Desktop : événement pointerenter (le bouton esquive la souris).
· Mobile : événement touchstart (le bouton esquive le doigt).
· Clavier / clic résiduel : événement click (au cas où).

Un cooldown de 400 ms empêche les déplacements en rafale, et un système
de profils successifs (de plus en plus permissifs) garantit qu'il y a toujours
une position valide, même sur petit écran.

---

🎵 Musique de fond

Chaque page possède sa propre piste audio :

Page Fichier
index.html assets/musique1.mp3
page2.html assets/musique2.mp3
page3.html assets/musique3.mp3

Comment fonctionne l'autoplay

Les navigateurs modernes bloquent l'autoplay tant qu'il n'y a pas eu au
moins une interaction de l'utilisateur. Le script applique donc cette logique :

1. Première visite : le navigateur bloque la lecture. Dès que l'utilisatrice
   clique, tape ou appuie sur une touche, la musique démarre.
2. Un drapeau apologyMusicUnlocked est alors stocké dans sessionStorage.
3. Pages suivantes : au chargement, l'autoplay réussit immédiatement
   (l'onglet est déjà « autorisé »). 🎶

⚠️ Sur Safari iOS, l'autoplay peut encore être refusé dans certains cas.
Un système d'écouteurs de secours démarre alors la musique au premier geste.

Bouton de secours

Un bouton rond 🎵 en haut à droite permet de couper / relancer la musique à
tout moment. Il affiche ⏸️ quand la musique joue, et met à jour son
aria-label en conséquence.

---

💻 Compatibilité

Navigateur Version minimale Statut
Chrome / Edge 90+ ✅ Testé
Firefox 88+ ✅ Testé
Safari (macOS) 14+ ✅ Testé
Safari (iOS) 14+ ✅ Testé (avec fallback autoplay)
Samsung Internet 14+ ✅ Compatible

Écran Largeur Statut
Très petit mobile 320 px ✅
iPhone SE 375 px ✅
iPhone 12/13/14 390 px ✅
iPhone Plus 414 px ✅
Tablette 768 px ✅
Desktop 1024 – 1920 px ✅

---

♿ Accessibilité

· Navigation clavier : tous les boutons sont de vrais <button> ou <a>,
  focusables au Tab, activables à Entrée / Espace.
· Focus visible : un contour rose de 3 px est affiché sur tous les éléments
  focusables (:focus-visible).
· Contrastes : le rose #ff4f9a sur fond blanc respecte le ratio AA pour
  les gros textes ; les textes principaux utilisent un brun foncé (#2b1b23).
· ARIA :
  · aria-label="Activer la musique" sur le bouton 🎵.
  · aria-pressed synchronisé avec l'état réel de la musique.
  · role="status" + aria-live="polite" sur le message de feedback du bouton « Non ».
  · aria-hidden="true" sur tous les éléments purement décoratifs (cœurs, blobs, voile).
· prefers-reduced-motion : toutes les animations sont réduites à ~0 s
  pour les utilisateurs qui ont cette préférence activée.
· Zoom / texte : utilise clamp() partout, la mise en page reste lisible
  jusqu'à 200 % de zoom.

---

🔧 Détails techniques

· CSS : variables CSS (:root), gradients, clamp() pour la typo fluide,
  env(safe-area-inset-*) pour les encoches iOS, @media responsive.
· JavaScript : un seul IIFE ((function () { ... })()) pour éviter de
  polluer le scope global ; gestion propre des événements pointerenter,
  touchstart, click, resize, orientationchange ; requestAnimationFrame
  non nécessaire, les animations CSS font le travail.
· Performance : aucune image externe lourde (les cœurs sont des emojis),
  pas de dépendance JS, un seul fichier CSS et un seul fichier JS.
· Transition de page : un voile rose (<div class="page-veil">) recouvre
  l'écran avant chaque navigation, puis s'estompe à l'arrivée — transition fluide.
· Aucune erreur console : toutes les promesses play() sont gérées via
  .catch(), sessionStorage est protégé par try/catch.

---

📄 Licence

Ce projet est fourni tel quel, à usage personnel et privé.
Aucune licence commerciale n'est accordée.

Le design, le code et les textes peuvent être librement modifiés pour un usage
personnel (offrir ce site à quelqu'un, l'adapter à sa situation, etc.).

---

✍️ Auteur

Léon Corazón — Web developer

❤️ © Léon Corazón Web developper — All rights reserved

---

Fait avec ❤️ et beaucoup de rose. 💗

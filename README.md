# 💗 Pour toi — Mini-site de déclaration romantique

> Un site doux, interactif et responsive pour dire à quelqu’un de spécial
> à quel point elle compte. HTML, CSS et JavaScript natifs — aucune dépendance.

---

## ✨ Parcours (11 pages)

| # | Page | Ce qu’il s’y passe |
|---|------|--------------------|
| 1 | `index.html` | Écran **« Touche pour commencer »**, puis accueil tendre avec cœur qui bat |
| 2 | `page2.html` | Confession + **Oui** / **Non** (le Non s’enfuit) |
| 3 | `page3.html` | **6 cartes à retourner** : « ce que j’aime chez toi » |
| 4 | `page4.html` | **Enveloppe à ouvrir** + lettre qui s’écrit à la machine |
| 5 | `page5.html` | **Polaroïds suspendus** + visionneuse de photos |
| 6 | `page6.html` | **Quiz** « À quel point tu me connais ? » |
| 7 | `page7.html` | **Jeu** : attrape les cœurs qui tombent (cœur doré = 3 points) |
| 8 | `page8.html` | **100 raisons de t’aimer** : tirage au sort + liste complète |
| 9 | `page9.html` | **Affiche de rendez-vous** : Oui → **feu d’artifice** ; le Non s’enfuit toujours |
| 10 | `page10.html` | Finale : confettis, ballons, **ticket** et **compte à rebours** jusqu’au rendez-vous |
| 11 | `page11.html` | **Livre d’or** : elle te laisse un petit mot |

---

## 🎨 Tout se personnalise dans `js/config.js`

Pas besoin de toucher au reste du code. On y règle :

| Réglage | Clé |
|---------|-----|
| Son prénom / le tien (accueil, lettre, signature) | `recipientName`, `senderName` |
| **Couleur** du site : `rose`, `rouge`, `violet`, `bleu`, `menthe`, `orange` | `theme` |
| Écran « Touche pour commencer » (recommandé) | `startScreen` |
| **Musique de chaque page** | `music` |
| Les « cœurs » qui flottent (vrais cœurs ou ta liste d’emojis) | `floatingEmojis` |
| **Texte de la lettre** et signature | `letter` |
| Légendes des 3 polaroïds | `photoCaptions` |
| **Questions du quiz** et messages de résultat | `quiz`, `quizResults` |
| Difficulté du jeu | `gameGoal` |
| Les 100 raisons | `reasons` |
| Où arrivent les messages du livre d’or | `contact` |

> 💡 Le quiz fourni utilise des questions romantiques génériques. Remplace-les par de
> **vraies** questions sur toi (plat préféré, film, rêve…) : c’est ce qui le rendra inoubliable.

Les textes des pages 2, 3, 5, 9 et 10 se modifient directement dans les fichiers `.html`.

---

## 🎵 Musique : fiable partout, y compris sur iPhone

- Les navigateurs interdisent le son tant qu’on n’a pas touché la page. L’écran
  **« Touche pour commencer »** résout ça : le tout premier toucher débloque la musique.
- Ensuite les pages s’enchaînent **sans recharger le document** : le même lecteur audio
  continue de vivre, et on change simplement de morceau à chaque page (fondu en douceur).
  Si deux pages de suite ont le même morceau, il continue sans coupure.
- Le bouton 🎵 / ⏸️ en haut à droite coupe ou relance la musique ; ce choix est respecté partout.
- Si quelqu’un arrive directement sur une page interne, une bulle l’invite à toucher l’écran.
- Ouvert directement depuis le disque (`file://`) ou si un navigateur refuse l’enchaînement
  sans rechargement, le site retombe automatiquement sur une navigation classique
  (la musique reste lancée à chaque page au premier geste).

---

## 📖 Livre d’or : comment le message t’arrive

Le site n’a **pas de serveur** : un message écrit par elle n’arrive pas tout seul chez toi.
Renseigne `contact` dans `js/config.js` :

```js
contact: {
  whatsapp: '25779123456',   // ton numéro, format international, sans + ni espaces
  email: 'toi@exemple.com'   // ou ton adresse e-mail
}
```

- WhatsApp renseigné → son message s’ouvre prêt à envoyer dans WhatsApp.
- Sinon e-mail renseigné → il s’ouvre dans son application mail.
- Sinon → le menu « Partager » du téléphone, ou copie dans le presse-papiers.

Dans tous les cas, son mot reste aussi affiché sur le « mur » du livre d’or, **dans son navigateur**.

---

## ✨ Animations

Pétales de rose · lucioles · étoiles filantes · ballons · confettis en cœurs ·
**feu d’artifice nocturne avec explosions en forme de cœur** · mini-cœurs au toucher ·
traînée d’étincelles · cœur qui bat · boutons qui pulsent · lettre écrite à la machine ·
polaroïds qui se balancent · compte à rebours · progression en petits points.

Les animations sont réduites automatiquement si l’appareil est réglé sur
« réduire les animations ».

---

## 🚀 Lancer

Ouvre `index.html` dans un navigateur (Chrome, Firefox, Safari, Edge).
Pour la meilleure expérience (navigation fluide + musique continue), passe par un
petit serveur local ou héberge le site (GitHub Pages…) :

```bash
python -m http.server 8000
# puis ouvre http://localhost:8000
```

---

## 🗂️ Structure

```
index.html … page11.html   les 11 pages
css/style.css              styles (toute la palette dépend de --hue)
js/config.js               ✍️ personnalisation (à modifier)
js/script.js               moteur du site
assets/                    musiques et photos
```

---

## ✍️ Auteur

Léon Corazón — Web developer

Fait avec ❤️ et beaucoup de rose. 💗

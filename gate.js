/* ============================================================
   PORTE D'ENTRÉE : accès réservé (gate.js)
   À mettre dans CHAQUE projet. Le visiteur voit une page qui lui demande
   de contacter l'administrateur (WhatsApp) pour obtenir un code d'accès.
   ============================================================ */

// ====== TES RÉGLAGES ======
var GATE = {
  whatsapp: "25776672387",          // ton numéro WhatsApp, sans + ni espaces
  admin: "Lionel Irakoze",          // nom affiché à la place d'« administrateur »
  project: "",                      // nom du projet dans le message ("" = titre de la page)
  id: "",                           // identifiant du projet ("" = automatique, d'après le dossier du site)
  days: 3600,                         // le visiteur reste connecté pendant X jours (0 = jusqu'à la fermeture de l'onglet)
  salt: "lionel-irakoze-2026",      // DOIT être identique dans generer-code.html
  // Les codes valides, sous forme d'EMPREINTES (jamais le code en clair).
  // Génère-les avec generer-code.html. Un code par visiteur = tu peux en retirer un seul.
  // Pour retirer l'accès à quelqu'un : supprime sa ligne, il sera bloqué à sa prochaine visite.
  codes: [
    // { label: "Admin (moi)",  hash: "COLLE_ICI_L_EMPREINTE" },
    // { label: "Client Jean",  hash: "COLLE_ICI_UNE_AUTRE_EMPREINTE" },
    { label: "Admnin", hash: "0f994995db265d0d5403a98db9ef7c15b1c0a1f73926fecdc453dd59b38f755e" },
  ],
};

(function () {
  // Un « trousseau » par projet : tous tes sites GitHub Pages partagent la même adresse
  // (132737li.github.io), donc sans ça, entrer dans un projet effacerait l'accès à l'autre.
  var KEY = "gate_access_" + (GATE.id || location.pathname.split("/")[1] || "root");
  var HASHES = GATE.codes.map(function (c) { return c.hash; });

  // ---------- Stockage ----------
  function store() {
    try { var k = "__t"; localStorage.setItem(k, "1"); localStorage.removeItem(k); return localStorage; }
    catch (e) { try { return sessionStorage; } catch (e2) { return null; } }
  }
  function readToken() {
    var s = store(); if (!s) return null;
    try {
      var o = JSON.parse(s.getItem(KEY) || "null");
      if (!o || HASHES.indexOf(o.h) < 0) return null;
      if (o.exp && Date.now() > o.exp) return null;
      return o;
    } catch (e) { return null; }
  }
  function saveToken(h) {
    var s = GATE.days > 0 ? store() : sessionStorage;
    try { s.setItem(KEY, JSON.stringify({ h: h, exp: GATE.days > 0 ? Date.now() + GATE.days * 864e5 : 0 })); } catch (e) {}
  }

  // Déjà autorisé : on ne fait rien du tout, le site s'affiche normalement.
  if (readToken()) return;

  // ---------- Verrouillage immédiat (évite de voir le site une seconde) ----------
  var root = document.documentElement;
  root.classList.add("gt-lock");
  var css =
    "html.gt-lock{background:#0b0d12!important;overflow:hidden!important}" +
    "html.gt-lock body>*:not(#gt-root){display:none!important}" +
    "#gt-root{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:20px;overflow:auto;" +
      "font-family:'Poppins',system-ui,-apple-system,Segoe UI,sans-serif;color:#e8eaf0;" +
      "background:radial-gradient(circle at 15% 0%,#ffb02e1f,transparent 45%),radial-gradient(#ffffff0a 1px,transparent 1px),#0b0d12;" +
      "background-size:auto,26px 26px,auto}" +
    "#gt-root *{box-sizing:border-box}" +
    ".gt-card{width:100%;max-width:460px;padding:38px 30px 28px;border-radius:24px;text-align:center;" +
      "background:#12151c;border:1px solid #ffffff1f;box-shadow:0 24px 70px #000a;animation:gtrise .5s ease both}" +
    "@keyframes gtrise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}" +
    ".gt-lock-ico{width:68px;height:68px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;" +
      "background:#ffb02e22;border:1px solid #ffb02e66;color:#ffb02e}" +
    ".gt-lock-ico svg{width:30px;height:30px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
    ".gt-card h1{font-size:22px;margin:0 0 6px;font-weight:700}" +
    ".gt-proj{font-size:12px;color:#ffb02e;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 16px;word-break:break-word}" +
    ".gt-text{font-size:14px;line-height:1.75;color:#c3c8d6;margin:0 0 22px}" +
    ".gt-wa{display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 20px;border-radius:40px;" +
      "background:#25d366;color:#08301b;font-weight:600;font-size:14px;text-decoration:none;transition:transform .2s,box-shadow .2s}" +
    ".gt-wa:hover,.gt-wa:focus-visible{transform:translateY(-2px);box-shadow:0 10px 24px #25d36655;outline:none}" +
    ".gt-wa svg{width:20px;height:20px;fill:currentColor}" +
    ".gt-or{display:flex;align-items:center;gap:12px;margin:22px 0 16px;font-size:11px;color:#8b93a7;text-transform:uppercase;letter-spacing:2px}" +
    ".gt-or:before,.gt-or:after{content:'';flex:1;height:1px;background:#ffffff1f}" +
    ".gt-form{display:flex;gap:10px}" +
    ".gt-form input{flex:1;min-width:0;height:46px;padding:0 16px;border-radius:40px;border:1px solid #ffffff33;" +
      "background:#0b0d12;color:#fff;font:inherit;font-size:14px;outline:none;transition:border-color .2s}" +
    ".gt-form input:focus{border-color:#ffb02e}" +
    ".gt-form button{height:46px;padding:0 22px;border-radius:40px;border:0;background:#ffb02e;color:#111;" +
      "font:inherit;font-weight:600;font-size:14px;cursor:pointer;transition:transform .2s}" +
    ".gt-form button:hover{transform:translateY(-2px)}" +
    ".gt-form button:disabled{opacity:.5;cursor:not-allowed;transform:none}" +
    ".gt-err{min-height:20px;margin:10px 0 0;font-size:12.5px;color:#ff7b7b}" +
    ".gt-card.shake .gt-form{animation:gtshake .4s}" +
    "@keyframes gtshake{20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}" +
    ".gt-foot{display:flex;justify-content:space-between;align-items:center;margin-top:20px;font-size:11px;color:#8b93a7}" +
    ".gt-lang{background:none;border:1px solid #ffffff33;color:#e8eaf0;border-radius:20px;padding:5px 14px;font:inherit;font-size:11px;cursor:pointer}" +
    ".gt-lang:hover{border-color:#ffb02e;color:#ffb02e}" +
    "@media (max-width:420px){.gt-form{flex-direction:column}.gt-form button{width:100%}}" +
    "@media (prefers-reduced-motion:reduce){.gt-card,.gt-card.shake .gt-form{animation:none}.gt-wa,.gt-form button{transition:none}}";
  var st = document.createElement("style");
  st.id = "gt-style"; st.textContent = css;
  (document.head || root).appendChild(st);

  // ---------- Textes ----------
  var T = {
    fr: {
      title: "Accès réservé",
      text: "Ce site est en accès restreint. Si tu n'es pas le constructeur de ce site, contacte l'administrateur (%a) pour qu'il te donne le code d'entrée.",
      wa: "Demander le code sur WhatsApp",
      or: "ou entre ton code",
      ph: "Code d'accès", go: "Entrer",
      bad: "Code incorrect. Réessaie ou demande un nouveau code.",
      wait: "Trop d'essais. Patiente %s s.",
      nocrypto: "Ce navigateur ne permet pas la vérification. Ouvre le site en HTTPS.",
      msg: "Bonjour %a, je souhaite accéder au site « %p » (%u). Peux-tu me donner le code d'entrée ? Merci.",
      lang: "EN", foot: "Accès protégé",
    },
    en: {
      title: "Restricted access",
      text: "This site has restricted access. If you are not the builder of this site, please contact the administrator (%a) to get the entry code.",
      wa: "Ask for the code on WhatsApp",
      or: "or enter your code",
      ph: "Access code", go: "Enter",
      bad: "Wrong code. Try again or ask for a new one.",
      wait: "Too many attempts. Please wait %s s.",
      nocrypto: "This browser cannot verify the code. Open the site over HTTPS.",
      msg: "Hello %a, I would like to access the site \"%p\" (%u). Could you give me the entry code? Thank you.",
      lang: "FR", foot: "Protected access",
    },
  };
  var lang = "fr";
  try {
    lang = localStorage.getItem("lang") ||
      ((navigator.language || "fr").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");
  } catch (e) {}
  if (!T[lang]) lang = "fr";

  var WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
  var LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  var box, fails = 0, blockedUntil = 0, timer = null;

  function projectName() { return GATE.project || (document.title || location.hostname).trim(); }

  function build() {
    box = document.createElement("div");
    box.id = "gt-root";
    box.innerHTML =
      '<div class="gt-card" role="dialog" aria-modal="true" aria-labelledby="gt-title">' +
      '<div class="gt-lock-ico">' + LOCK + '</div>' +
      '<h1 id="gt-title"></h1><p class="gt-proj" id="gt-proj"></p>' +
      '<p class="gt-text" id="gt-text"></p>' +
      '<a class="gt-wa" id="gt-wa" target="_blank" rel="noopener noreferrer">' + WA_ICON + '<span id="gt-wa-t"></span></a>' +
      '<div class="gt-or"><span id="gt-or"></span></div>' +
      '<form class="gt-form" id="gt-form" autocomplete="off">' +
      '<input type="password" id="gt-in" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
      '<button type="submit" id="gt-go"></button></form>' +
      '<p class="gt-err" id="gt-err" role="alert"></p>' +
      '<div class="gt-foot"><span id="gt-foot"></span><button type="button" class="gt-lang" id="gt-lang"></button></div>' +
      '</div>';
    document.body.appendChild(box);

    var $ = function (id) { return box.querySelector("#" + id); };
    $("gt-form").addEventListener("submit", function (e) { e.preventDefault(); tryCode($("gt-in").value); });
    $("gt-lang").addEventListener("click", function () {
      lang = lang === "fr" ? "en" : "fr";
      try { localStorage.setItem("lang", lang); } catch (e) {}
      document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
      fill();
    });
    fill();
    setTimeout(function () { try { $("gt-in").focus(); } catch (e) {} }, 60);
  }

  function fill() {
    var t = T[lang], $ = function (id) { return box.querySelector("#" + id); };
    document.documentElement.lang = lang;
    $("gt-title").textContent = t.title;
    $("gt-proj").textContent = projectName();
    $("gt-text").textContent = t.text.replace("%a", GATE.admin);
    $("gt-wa-t").textContent = t.wa;
    $("gt-or").textContent = t.or;
    $("gt-in").placeholder = t.ph;
    $("gt-in").setAttribute("aria-label", t.ph);
    $("gt-go").textContent = t.go;
    $("gt-lang").textContent = t.lang;
    $("gt-foot").textContent = t.foot + " · " + GATE.admin;
    var msg = t.msg.replace("%a", GATE.admin).replace("%p", projectName()).replace("%u", location.href.split("#")[0]);
    $("gt-wa").href = "https://wa.me/" + GATE.whatsapp + "?text=" + encodeURIComponent(msg);
  }

  async function sha256(str) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }

  function setErr(msg) { box.querySelector("#gt-err").textContent = msg || ""; }

  async function tryCode(raw) {
    var t = T[lang], code = (raw || "").trim();
    if (!code) return;
    if (Date.now() < blockedUntil) return;
    if (!(window.crypto && crypto.subtle)) { setErr(t.nocrypto); return; }

    var h = await sha256(GATE.salt + "|" + code);
    if (HASHES.indexOf(h) >= 0) { saveToken(h); unlock(); return; }

    fails++;
    var card = box.querySelector(".gt-card");
    card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
    box.querySelector("#gt-in").value = "";
    if (fails >= 3) {                       // petite pause après 3 erreurs
      var secs = Math.min(60, 5 * (fails - 2));
      blockedUntil = Date.now() + secs * 1000;
      var btn = box.querySelector("#gt-go"); btn.disabled = true;
      clearInterval(timer);
      timer = setInterval(function () {
        var left = Math.ceil((blockedUntil - Date.now()) / 1000);
        if (left <= 0) { clearInterval(timer); btn.disabled = false; setErr(""); return; }
        setErr(T[lang].wait.replace("%s", left));
      }, 250);
      setErr(t.wait.replace("%s", secs));
    } else setErr(t.bad);
  }

  function unlock() {
    root.classList.remove("gt-lock");
    if (box) box.remove();
    var s = document.getElementById("gt-style"); if (s) s.remove();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
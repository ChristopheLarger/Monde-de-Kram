/**
 * FICHIER DIALOG.JS
 * ==================
 * Gestion des dialogues et interfaces utilisateur pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour afficher et gérer les fenêtres
 */

// === VARIABLES GLOBALES ===
let m_selected = null; // Personnage actuellement sélectionné

/**
 * Initialise le dialogue de dimensions de la carte
 */
initialise_dim_carte();
function initialise_dim_carte() {
  const dialog_dim_carte = document.getElementById("dialog_dim_carte");

  // Validation des dimensions de carte
  dialog_dim_carte.querySelector("#Valider").addEventListener("click", function (event) {
    // Récupération des dimensions saisies
    const w = dialog_dim_carte.querySelector(".largeur").value;
    const h = dialog_dim_carte.querySelector(".hauteur").value;

    // Calcul des dimensions hexagonales
    hexDimensionsX = Math.round((((w - 1) / 2 / 3) * Math.sqrt(3)) / 1.5);
    hexDimensionsY = Math.round((h - 1) / 2 / 3);

    // Création de la forme de fond si une image est définie
    if (image_fond != null) {
      const hexHS = hexSize * 1.5;
      const hexVS = hexSize * Math.sqrt(3);

      forme_fond = new Forme("Rectangle");
      forme_fond.width = (2 * hexDimensionsX + 1.5) * hexHS;
      forme_fond.height = (2 * hexDimensionsY + 1.5) * hexVS;
      forme_fond.x = offsetX - forme_fond.width / 2;
      forme_fond.y = offsetY - forme_fond.height / 2 + hexVS / 4;
    }

    // Régénération et redessin de la carte
    Map.generateHexMap();
    Map.drawHexMap();

    dialog_dim_carte.close();
  });

  // Gestion de la touche Entrée pour valider
  dialog_dim_carte.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      dialog_dim_carte.querySelector("#Valider").click();
    }
  });

  // Calcul automatique de la hauteur selon la largeur
  dialog_dim_carte.querySelector(".largeur").addEventListener("input", function (event) {
    if (image_fond === null) return;
    dialog_dim_carte.querySelector(".hauteur").value = Math.round(
      (event.target.value * image_fond.height) / image_fond.width);
  });

  // Calcul automatique de la largeur selon la hauteur
  dialog_dim_carte.querySelector(".hauteur").addEventListener("input", function (event) {
    if (image_fond === null) return;
    dialog_dim_carte.querySelector(".largeur").value = Math.round(
      (event.target.value * image_fond.width) / image_fond.height);
  });
}

/**
 * Affiche le dialogue pour définir les dimensions de la carte
 * Permet de spécifier la largeur et la hauteur de la carte de fond
 */
function affiche_dim_carte() {
  // Valeur par défaut pour la largeur si vide
  if (dialog_dim_carte.querySelector(".largeur").value === "") {
    dialog_dim_carte.querySelector(".largeur").value = 100;
  }

  // Gestion de la hauteur selon l'image de fond
  if (image_fond == null) {
    dialog_dim_carte.querySelector(".hauteur").value = 100;
  } else {
    // Calcul automatique de la hauteur basé sur l'image de fond
    image_fond.onload = function () {
      dialog_dim_carte.querySelector(".hauteur").value = Math.round(
        (dialog_dim_carte.querySelector(".largeur").value * image_fond.height) / image_fond.width);
    };
  }
  dialog_dim_carte.showModal();
}

/**
 * Initialise le dialogue de dimensions d'un rectangle
 */
initialise_dim_rectangle();
function initialise_dim_rectangle() {
  const dialog_dim_rectangle = document.getElementById("dialog_dim_rectangle");

  // Fermeture du dialogue de création de rectangle
  dialog_dim_rectangle.querySelector("#Fermer").addEventListener("click", function (event) {
    dialog_dim_rectangle.close();
  });

  // Création d'un rectangle avec les dimensions spécifiées
  dialog_dim_rectangle.querySelector("#Creer").addEventListener("click", function (event) {
    // Récupération des dimensions saisies
    const w = dialog_dim_rectangle.querySelector(".largeur").value;
    const h = dialog_dim_rectangle.querySelector(".hauteur").value;

    // Création de la nouvelle forme rectangle
    Formes[Formes.length] = new Forme("Rectangle");
    const r = Formes[Formes.length - 1];

    // Calcul des dimensions en pixels selon le système hexagonal
    r.width = Math.abs((w / 3) * Math.sqrt(3) * hexSize);
    r.height = Math.abs((h / 3) * Math.sqrt(3) * hexSize);

    // Positionnement au centre du canvas
    r.x = canvas.width / 2 - r.width / 2;
    r.y = canvas.height / 2 - r.height / 2;

    // Application de la couleur sélectionnée
    r.color = document.getElementById("forme_color").value;

    dialog_dim_rectangle.close();
    Map.drawHexMap();
  });

  // Gestion de la touche Entrée pour créer le rectangle
  dialog_dim_rectangle.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      dialog_dim_rectangle.querySelector("#Creer").click();
    }
  });
}

/**
 * Affiche le dialogue pour définir les dimensions d'un rectangle
 */
function affiche_dim_rectangle() {
  Forme.setFormeMode("rectangle");
  dialog_dim_rectangle.showModal();
}
/**
 * Initialise le dialogue de dimensions d'un mur
 */
initialise_dim_mur();
function initialise_dim_mur() {
  const dialog_dim_mur = document.getElementById("dialog_dim_mur");

  // Fermeture du dialogue de création de rectangle
  dialog_dim_mur.querySelector("#Fermer").addEventListener("click", function (event) {
    dialog_dim_mur.close();
  });

  // Création d'un rectangle avec les dimensions spécifiées
  dialog_dim_mur.querySelector("#Creer").addEventListener("click", function (event) {
    // Récupération des dimensions saisies
    const w = dialog_dim_mur.querySelector(".largeur").value;
    const h = dialog_dim_mur.querySelector(".hauteur").value;

    // Création de la nouvelle forme rectangle
    Formes[Formes.length] = new Forme("Mur");
    const r = Formes[Formes.length - 1];

    // Calcul des dimensions en pixels selon le système hexagonal
    r.width = Math.abs((w / 3) * Math.sqrt(3) * hexSize);
    r.height = Math.abs((h / 3) * Math.sqrt(3) * hexSize);

    // Positionnement au centre du canvas
    r.x = canvas.width / 2 - r.width / 2;
    r.y = canvas.height / 2 - r.height / 2;

    // Application de la couleur sélectionnée
    r.color = document.getElementById("forme_color").value;

    dialog_dim_mur.close();
    Map.drawHexMap();
  });

  // Gestion de la touche Entrée pour créer le rectangle
  dialog_dim_mur.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      dialog_dim_mur.querySelector("#Creer").click();
    }
  });
}

/**
 * Affiche le dialogue pour définir les dimensions d'un mur
 */
function affiche_dim_mur() {
  Forme.setFormeMode("mur");
  dialog_dim_mur.showModal();
}

/**
 * Initialise le dialogue de dimensions d'une ellipse
 */
initialise_dim_ellipse();
function initialise_dim_ellipse() {
  const dialog_dim_ellipse = document.getElementById("dialog_dim_ellipse");

  // Fermeture du dialogue de création d'ellipse
  dialog_dim_ellipse.querySelector("#Fermer").addEventListener("click", function (event) {
    dialog_dim_ellipse.close();
  });

  // Création d'une ellipse avec les dimensions spécifiées
  dialog_dim_ellipse.querySelector("#Creer").addEventListener("click", function (event) {
    // Récupération des dimensions saisies
    const w = dialog_dim_ellipse.querySelector(".grand_axe").value;
    const h = dialog_dim_ellipse.querySelector(".petit_axe").value;

    // Création de la nouvelle forme ellipse
    Formes[Formes.length] = new Forme("Ellipse");
    const e = Formes[Formes.length - 1];

    // Calcul des dimensions en pixels selon le système hexagonal
    e.width = Math.abs((w / 3) * Math.sqrt(3) * hexSize);
    e.height = Math.abs((h / 3) * Math.sqrt(3) * hexSize);

    // Positionnement au centre du canvas
    e.x = canvas.width / 2;
    e.y = canvas.height / 2;

    // Application de la couleur sélectionnée
    e.color = document.getElementById("forme_color").value;

    dialog_dim_ellipse.close();
    Map.drawHexMap();
  });

  // Gestion de la touche Entrée pour créer l'ellipse
  dialog_dim_ellipse.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      dialog_dim_ellipse.querySelector("#Creer").click();
    }
  });

  // Synchronisation automatique du petit axe avec le grand axe
  dialog_dim_ellipse.querySelector(".grand_axe").addEventListener("input", function (event) {
    dialog_dim_ellipse.querySelector(".petit_axe").value = event.target.value;
  });
}

/**
 * Affiche le dialogue pour définir les dimensions d'une ellipse
 */
function affiche_dim_ellipse() {
  Forme.setFormeMode("ellipse");
  dialog_dim_ellipse.showModal();
}

/**
 * Affiche les informations des armes sélectionnées
 */
function info_armes() {
  let score1 = null;
  let score2 = null;

  // Bonus de compétence d'arme
  if (m_selected.Arme1 !== "" && m_selected.Arme1 !== "Lancement de sort")
    score1 = m_selected.get_competence(Armes.find((a) => a.Nom_arme === m_selected.Arme1).Competence);
  if (m_selected.Arme2 !== "" && m_selected.Arme2 !== "Lancement de sort")
    score2 = m_selected.get_competence(Armes.find((a) => a.Nom_arme === m_selected.Arme2).Competence);

  // Malus d'escrime pour combat à deux armes
  if (score1 !== null && score2 !== null) {
    if (m_selected.Arme1 !== "Bouclier" && m_selected.Arme2 !== "Bouclier") {
      if (m_selected.Arme1 === "Dague" || m_selected.Arme2 === "Dague") {
        score1 -= Math.max(2 - m_selected.get_competence("Escrime"), 0);
        score2 -= Math.max(2 - m_selected.get_competence("Escrime"), 0);
      } else {
        score1 -= Math.max(6 - m_selected.get_competence("Escrime"), 0);
        score2 -= Math.max(6 - m_selected.get_competence("Escrime"), 0);
      }
    }
  }

  // Mise à jour de l'information affichée
  document
    .querySelector(".info_principale").textContent =
    (score1 !== null) ? " (" + score1 + ")" : "(-)";
  document
    .querySelector(".info_secondaire").textContent =
    (score2 !== null) ? " (" + score2 + ")" : "(-)";
}

/**
 * Supprime un état temporaire
 * @param {number} i - Index de l'état à supprimer
 */
function delete_etat(i) {
  Attaques.sort(Attaque.tri);
  const Etats = Attaques.filter((a) =>
    a.Model === m_selected.Model &&
    a.Indice === m_selected.Indice &&
    a.Timing > Nb_rounds * 5 &&
    a.Competence !== null);
  const index = Attaques.indexOf(Etats[i]);
  Attaques.splice(index, 1);
  affiche_zoom_pion();
}

/**
 * Affichage du détails des champs du pion lors de l'affichage de l'image zoom du pion
 */
if (document.getElementById('zoom_pion').complete) initialise_zoom_pion();
else document.getElementById('zoom_pion').addEventListener('load', initialise_zoom_pion);
function initialise_zoom_pion() {
  /** Dessine un trait sur la silhouette (zoom_pion). Coordonnées en pixels de l'image d'origine.
   * @param {number} x1_img - Coordonnée x du point de départ en pixels de l'image d'origine
   * @param {number} y1_img - Coordonnée y du point de départ en pixels de l'image d'origine
   * @param {number} x2_img - Coordonnée x du point d'arrivée en pixels de l'image d'origine
   * @param {number} y2_img - Coordonnée y du point d'arrivée en pixels de l'image d'origine
   * @param {Object} options - Options pour le dessin du trait
   * @param {string} options.strokeStyle - Couleur du trait
   * @param {number} options.lineWidth - Largeur du trait
   */
  function drawLineOnPion(x1_img, y1_img, x2_img, y2_img, options) {
    const img_zoom_pion = document.getElementById('zoom_pion');
    const canvas_zoom_pion = document.getElementById('canvas_zoom_pion');
    const ctx_zoom_pion = canvas_zoom_pion.getContext('2d');
    const rect = img_zoom_pion.getBoundingClientRect();
    const ratio = rect.width / img_zoom_pion.naturalWidth;
    const x1 = x1_img * ratio, y1 = y1_img * ratio;
    const x2 = x2_img * ratio, y2 = y2_img * ratio;
    ctx_zoom_pion.beginPath();
    ctx_zoom_pion.moveTo(x1, y1);
    ctx_zoom_pion.lineTo(x2, y2);
    ctx_zoom_pion.strokeStyle = (options && options.strokeStyle) || 'red';
    ctx_zoom_pion.lineWidth = (options && options.lineWidth) != null ? options.lineWidth : 2;
    ctx_zoom_pion.stroke();
  };

  // Chargement des paramètres de la silhouette du pion
  const img_zoom_pion = document.getElementById('zoom_pion');
  const size_start = img_zoom_pion.naturalWidth;
  const size_viewed = img_zoom_pion.getBoundingClientRect().width;
  const size_ratio = size_viewed / size_start;

  if (size_ratio === 0 || isNaN(size_ratio)) {
    setTimeout(() => { initialise_zoom_pion(); }, 100);
    return;
  }

  // Superpose le canvas sur l'image du pion
  const img_height = img_zoom_pion.getBoundingClientRect().height;
  const rect = img_zoom_pion.getBoundingClientRect();
  canvas_zoom_pion.style.width = rect.width + 'px';
  canvas_zoom_pion.style.height = rect.height + 'px';
  canvas_zoom_pion.width = rect.width;
  canvas_zoom_pion.height = rect.height;

  // Positionne les divs horizontalement en fonction de la taille de l'image
  document.getElementById('div_general').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_tete').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_brasg').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_brasd').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_poitrine').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_abdomen').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_jambeg').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_jambed').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_Conc_Fatigue').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_arme_principale').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_arme_secondaire').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_nom_allie').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_modele_auto').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_etats').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_buttons').style.left = 250 * size_ratio + 'px';
  document.getElementById('div_note').style.left = 7 * size_ratio + 'px';
  document.querySelector('.liste').style.left = 250 * size_ratio + 'px';
  document.querySelector('.incantation').style.left = 250 * size_ratio + 'px';
  document.querySelector('.sort').style.left = 250 * size_ratio + 'px';
  document.querySelector('.info_principale').style.left = 90 * size_ratio + 'px';
  document.querySelector('.info_secondaire').style.left = 90 * size_ratio + 'px';

  // Positionne les divs verticalement en fonction de la taille de l'image
  document.getElementById('div_nom_allie').style.bottom = (img_height - 30 * size_ratio) + 'px';
  document.getElementById('div_modele_auto').style.bottom = (img_height - 60 * size_ratio) + 'px';
  document.getElementById('div_Conc_Fatigue').style.bottom = (img_height - 115 * size_ratio) + 'px';
  document.getElementById('div_general').style.bottom = (img_height - 170 * size_ratio) + 'px';
  document.getElementById('div_tete').style.bottom = (img_height - 200 * size_ratio) + 'px';
  document.getElementById('div_brasd').style.bottom = (img_height - 230 * size_ratio) + 'px';
  document.getElementById('div_poitrine').style.bottom = (img_height - 260 * size_ratio) + 'px';
  document.getElementById('div_brasg').style.bottom = (img_height - 290 * size_ratio) + 'px';
  document.getElementById('div_abdomen').style.bottom = (img_height - 320 * size_ratio) + 'px';
  document.getElementById('div_jambed').style.bottom = (img_height - 350 * size_ratio) + 'px';
  document.getElementById('div_jambeg').style.bottom = (img_height - 380 * size_ratio) + 'px';
  document.getElementById('div_arme_principale').style.bottom = (img_height - 435 * size_ratio) + 'px';
  document.getElementById('div_arme_secondaire').style.bottom = (img_height - 465 * size_ratio) + 'px';
  document.getElementById('div_etats').style.top = (rect.top + 505 * size_ratio) + 'px';
  document.getElementById('div_buttons').style.bottom = (7 * size_ratio) + 'px';
  document.getElementById('div_note').style.top = (rect.top + 7 * size_ratio) + 'px';
  document.querySelector('.liste').style.bottom = (img_height - 462 * size_ratio) + 'px';
  document.querySelector('.incantation').style.bottom = (img_height - 462 * size_ratio) + 'px';
  document.querySelector('.sort').style.bottom = (img_height - 492 * size_ratio) + 'px';
  document.querySelector('.info_principale').style.bottom = (img_height - 432 * size_ratio) + 'px';
  document.querySelector('.info_secondaire').style.bottom = (img_height - 462 * size_ratio) + 'px';

  // Dessine les lignes sur la silhouette du pion
  drawLineOnPion(248, 200 - 10, 114, 123, { strokeStyle: 'darkgray', lineWidth: 3 });
  drawLineOnPion(248, 230 - 10, 37, 255, { strokeStyle: 'darkgray', lineWidth: 3 });
  drawLineOnPion(248, 260 - 10, 114, 272, { strokeStyle: 'darkgray', lineWidth: 3 });
  drawLineOnPion(248, 290 - 10, 220, 285, { strokeStyle: 'darkgray', lineWidth: 3 });
  drawLineOnPion(248, 320 - 10, 114, 332, { strokeStyle: 'darkgray', lineWidth: 3 });
  drawLineOnPion(248, 350 - 10, 75, 477, { strokeStyle: 'darkgray', lineWidth: 3 });
  drawLineOnPion(248, 380 - 10, 157, 477, { strokeStyle: 'darkgray', lineWidth: 3 });

  // Mise à jour des points de vie et de l'armure (général)
  let div = document.getElementById("div_general");
  div.querySelector(".general_pdv").addEventListener("input", function (event) {
    m_selected.Pdv = event.target.value;
  });

  // Mise à jour des points de vie et de l'armure (tête)
  div = document.getElementById("div_tete");
  div.querySelector(".tete_pdv").addEventListener("input", function (event) {
    m_selected.Tete = event.target.value;
  });
  div.querySelector(".tete_armure").addEventListener("input", function (event) {
    m_selected.Armure_tete = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour des points de vie et de l'armure (bras gauche)
  div = document.getElementById("div_brasg");
  div.querySelector(".brasg_pdv").addEventListener("input", function (event) {
    m_selected.Brasg = event.target.value;
  });
  div.querySelector(".brasg_armure").addEventListener("input", function (event) {
    m_selected.Armure_brasg = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour des points de vie et de l'armure (bras droit)
  div = document.getElementById("div_brasd");
  div.querySelector(".brasd_pdv").addEventListener("input", function (event) {
    m_selected.Brasd = event.target.value;
  });
  div.querySelector(".brasd_armure").addEventListener("input", function (event) {
    m_selected.Armure_brasd = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour des points de vie et de l'armure (poitrine)
  div = document.getElementById("div_poitrine");
  div.querySelector(".poitrine_pdv").addEventListener("input", function (event) {
    m_selected.Poitrine = event.target.value;
  });
  div.querySelector(".poitrine_armure").addEventListener("input", function (event) {
    m_selected.Armure_poitrine = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour des points de vie et de l'armure (abdomen)
  div = document.getElementById("div_abdomen");
  div.querySelector(".abdomen_pdv").addEventListener("input", function (event) {
    m_selected.Abdomen = event.target.value;
  });
  div.querySelector(".abdomen_armure").addEventListener("input", function (event) {
    m_selected.Armure_abdomen = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour des points de vie et de l'armure (jambes gauche)
  div = document.getElementById("div_jambeg");
  div.querySelector(".jambeg_pdv").addEventListener("input", function (event) {
    m_selected.Jambeg = event.target.value;
  });
  div.querySelector(".jambeg_armure").addEventListener("input", function (event) {
    m_selected.Armure_jambeg = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour des points de vie et de l'armure (jambes droite)
  div = document.getElementById("div_jambed");
  div.querySelector(".jambed_pdv").addEventListener("input", function (event) {
    m_selected.Jambed = event.target.value;
  });
  div.querySelector(".jambed_armure").addEventListener("input", function (event) {
    m_selected.Armure_jambed = event.target.value;
    document
      .getElementById("div_general")
      .querySelector(".general_armure")
      .value = m_selected.armure_generale();
  });

  // Mise à jour de la concentration et de la fatigue
  div = document.getElementById("div_Conc_Fatigue");
  div.querySelector(".concentration").addEventListener("input", function (event) {
    m_selected.Concentration = event.target.value;
  });
  div.querySelector(".fatigue").addEventListener("input", function (event) {
    m_selected.Fatigue = event.target.value;
  });

  // Mise à jour du nom et de l'allié
  div = document.getElementById("div_nom_allie");
  div.querySelector(".nom").addEventListener("input", function (event) {
    m_selected.Titre = event.target.value;
  });
  div.querySelector(".allie").addEventListener("input", function (event) {
    m_selected.Type = event.target.checked ? "allies" : "ennemis";
    Map.generateHexMap();
    Map.drawHexMap();
  });

  // Mise à jour du modele
  div = document.getElementById("div_modele_auto");
  div.querySelector(".modele").addEventListener("input", function (event) {
    m_selected.Model = event.target.value;
    document.getElementById("div_arme_principale").querySelector(".arme_principale").click();
    affiche_zoom_pion();
    Map.generateHexMap();
    Map.drawHexMap();
  });

  // Mise à jour de l'auto
  div.querySelector(".auto").addEventListener("input", function (event) {
    m_selected.Auto = event.target.checked;
    Map.generateHexMap();
    Map.drawHexMap();
  });

  // Mise à jour de l'arme principale
  div = document.getElementById("div_arme_principale");
  div.querySelector(".arme_principale").addEventListener("change", function (event) {
    return document.getElementById("div_arme_principale").querySelector(".arme_principale").click();
  });

  div.querySelector(".arme_principale").addEventListener("click", function (event) {
    // Vérifier si la souris est au-dessus du select au moment du clic
    const arme1 = document.getElementById("div_arme_principale").querySelector(".arme_principale");
    const arme2 = document.getElementById("div_arme_secondaire").querySelector(".arme_secondaire");
    const rect = arme1.getBoundingClientRect();
    const isClickInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    // Ouvrir la modale de magie si "Lancement de sort" est sélectionné
    if (arme1.value === "Lancement de sort") {
      if (!isClickInside) afficher_roue_magie();
    } else {
      // Remet les listes de sorts en blanc
      Object.keys(shortName).forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
          element.style.color = "";
          element.style.backgroundColor = "";
        }
      });
      // Réinitialisation des informations du sort
      m_selected.Nom_liste = null;
      m_selected.Nom_sort = null;
      m_selected.Incantation = 0;
      m_selected.Fatigue_sort = 0;
      m_selected.Concentration_sort = 0;
    }

    // Mise à jour des armes sélectionnées
    m_selected.Arme1 = arme1.value;
    m_selected.Arme2 = arme2.value;

    // Mise à jour de l'information affichée
    info_armes();

    affiche_zoom_pion();
  });

  // Mise à jour de l'arme secondaire
  div = document.getElementById("div_arme_secondaire");
  div.querySelector(".arme_secondaire").addEventListener("change", function (event) {
    m_selected.Arme2 = event.target.value;
    info_armes();
  });

  // Mise à jour de la note
  div = document.getElementById("div_note");
  div.querySelector(".note").addEventListener("input", function (event) {
    m_selected.Note = event.target.value;
  });

  // Action sur le bouton de duplication du personnage
  div = document.getElementById("div_buttons");
  div.querySelector(".dupliquer").addEventListener("click", function (event) {
    m_selected.dupliquer();
  });
}

/**
 * Rafraîchit les détails du pion dans la fenetre de zoom
 */
function affiche_zoom_pion(col = null, row = null) {
  if (m_selected === null || typeof m_selected === "undefined") {
    affiche_new_pion(col, row);
    return;
  }

  if (Pions.length === 0) return;

  const m_model = Models.find((x) => x.Nom_model === m_selected.Model);

  // Mise à jour des points de vie et de l'armure (général)
  let div = document.getElementById("div_general");
  div.querySelector(".general_pdv").value = m_selected.Pdv;
  div.querySelector(".general_max_pdv").value = m_model.Pdv;
  div.querySelector(".general_armure").value = m_selected.armure_generale();

  // Mise à jour des points de vie et de l'armure (tête)
  div = document.getElementById("div_tete");
  div.querySelector(".tete_pdv").value = m_selected.Tete;
  div.querySelector(".tete_max_pdv").value = m_model.Tete;
  div.querySelector(".tete_armure").value = m_selected.Armure_tete;

  // Mise à jour des points de vie et de l'armure (bras gauche)
  div = document.getElementById("div_brasg");
  div.querySelector(".brasg_pdv").value = m_selected.Brasg;
  div.querySelector(".brasg_max_pdv").value = m_model.Brasg;
  div.querySelector(".brasg_armure").value = m_selected.Armure_brasg;

  // Mise à jour des points de vie et de l'armure (bras droit)
  div = document.getElementById("div_brasd");
  div.querySelector(".brasd_pdv").value = m_selected.Brasd;
  div.querySelector(".brasd_max_pdv").value = m_model.Brasd;
  div.querySelector(".brasd_armure").value = m_selected.Armure_brasd;

  // Mise à jour des points de vie et de l'armure (poitrine)
  div = document.getElementById("div_poitrine");
  div.querySelector(".poitrine_pdv").value = m_selected.Poitrine;
  div.querySelector(".poitrine_max_pdv").value = m_model.Poitrine;
  div.querySelector(".poitrine_armure").value = m_selected.Armure_poitrine;

  // Mise à jour des points de vie et de l'armure (abdomen)
  div = document.getElementById("div_abdomen");
  div.querySelector(".abdomen_pdv").value = m_selected.Abdomen;
  div.querySelector(".abdomen_max_pdv").value = m_model.Abdomen;
  div.querySelector(".abdomen_armure").value = m_selected.Armure_abdomen;

  // Mise à jour des points de vie et de l'armure (jambes gauche)
  div = document.getElementById("div_jambeg");
  div.querySelector(".jambeg_pdv").value = m_selected.Jambeg;
  div.querySelector(".jambeg_max_pdv").value = m_model.Jambeg;
  div.querySelector(".jambeg_armure").value = m_selected.Armure_jambeg;

  // Mise à jour des points de vie et de l'armure (jambes droite)
  div = document.getElementById("div_jambed");
  div.querySelector(".jambed_pdv").value = m_selected.Jambed;
  div.querySelector(".jambed_max_pdv").value = m_model.Jambed;
  div.querySelector(".jambed_armure").value = m_selected.Armure_jambed;

  // Mise à jour de la concentration et de la fatigue
  div = document.getElementById("div_Conc_Fatigue");
  div.querySelector(".concentration").value = m_selected.Concentration;
  div.querySelector(".concentration_max").value = m_model.Concentration;
  div.querySelector(".fatigue").value = m_selected.Fatigue;
  div.querySelector(".fatigue_max").value = m_model.Fatigue;

  // Mise à jour du nom et de l'allié
  div = document.getElementById("div_nom_allie");
  div.querySelector(".nom").value = m_selected.Titre;
  div.querySelector(".allie").checked = m_selected.Type === "allies";

  // Mise à jour du modele et de l'auto
  div = document.getElementById("div_modele_auto");
  // Ajout de la liste des modèles de personnages
  const model = div.querySelector(".modele");
  if (model.options.length == 1) {
    for (let i = 0; i < Models.length; i++) {
      let nouvelleOption = document.createElement("option");
      nouvelleOption.value = Models[i].Nom_model;
      nouvelleOption.textContent = Models[i].Nom_model;
      model.appendChild(nouvelleOption);
    }
  }
  model.value = m_model.Nom_model;
  div.querySelector(".auto").checked = m_selected.Auto;

  // Mise à jour de l'arme principale
  div = document.getElementById("div_arme_principale");
  const arme1 = div.querySelector(".arme_principale");

  // Nettoyage des options existantes
  while (arme1.options.length > 0) arme1.removeChild(arme1.lastChild);

  // Ajout de l'option "Lancement de sort"
  let nouvelleOption = document.createElement("option");
  nouvelleOption.value = "Lancement de sort";
  nouvelleOption.textContent = "Lancement de sort";
  arme1.appendChild(nouvelleOption);

  // Ajout de l'option "--"
  nouvelleOption = document.createElement("option");
  nouvelleOption.value = "";
  nouvelleOption.textContent = "--";
  arme1.appendChild(nouvelleOption);

  // Mise à jour des armes du modèle en 1ère main (sauf bouclier et armes personnelles)
  Armes.forEach((arme) => {
    if (arme.Is_personnel && arme.Nom_arme !== m_selected.Model) return;
    if (arme.Nom_arme === "Bouclier") return;

    nouvelleOption = document.createElement("option");
    nouvelleOption.value = arme.Nom_arme;
    nouvelleOption.textContent = arme.Nom_arme;
    arme1.appendChild(nouvelleOption);
  });

  // Mise à jour de l'arme principale
  arme1.value = m_selected.Arme1;

  // Mise à jour de l'arme secondaire
  div = document.getElementById("div_arme_secondaire");
  const arme2 = div.querySelector(".arme_secondaire");

  // Nettoyage et ajout d'une option vide
  while (arme2.options.length > 0) arme2.removeChild(arme2.lastChild);

  // Ajout d'une option vide
  nouvelleOption = document.createElement("option");
  nouvelleOption.value = "";
  nouvelleOption.textContent = "--";
  arme2.appendChild(nouvelleOption);

  // Gestion spéciale pour le lancement de sort et les armes à deux mains
  const w1 = Armes.find((x) => x.Nom_arme === arme1.value);
  if (arme1.value === "Lancement de sort" ||
    (w1 && typeof w1 !== "undefined" && w1.Deux_mains)) {
    arme2.value = "";
  }
  else {
    // Ajout des armes disponibles du modèle en 2nde main
    Armes.forEach((arme) => {
      if (arme.Is_personnel && arme.Nom_arme !== m_selected.Model) return;
      if (arme.Deux_mains) return;

      nouvelleOption = document.createElement("option");
      nouvelleOption.value = arme.Nom_arme;
      nouvelleOption.textContent = arme.Nom_arme;
      arme2.appendChild(nouvelleOption);
    });

    // Sélection de l'arme actuelle si disponible
    arme2.value = m_selected.Arme2;
  }

  // Activation/désactivation du sélecteur d'arme secondaire
  if (arme2.options.length > 1) {
    arme2.disabled = false;
  }
  else {
    arme2.disabled = true;
  }

  // Mise à jour de la note
  div = document.getElementById("div_note");
  div.querySelector(".note").value = m_selected.Note;

  // Mise à jour du sortilège sélectionné
  if (m_selected.Nom_sort &&
    m_selected.Nom_sort !== "" &&
    m_selected.Nom_sort !== "0" &&
    m_selected.Nom_liste &&
    m_selected.Nom_liste !== "" &&
    m_selected.Nom_liste !== "0") {
    const sort = Sorts.find((s) =>
      s.Nom_liste === m_selected.Nom_liste &&
      s.Nom_sort === m_selected.Nom_sort);

    document
      .getElementById("div_arme_secondaire")
      .getElementsByTagName("span")[0].style.display = "none";
    arme2.style.display = "none";

    document.querySelector(".liste").textContent = sort.Nom_liste;
    document.querySelector(".liste").style.display = "";
    document.querySelector(".sort").textContent = sort.Nom_sort;
    document.querySelector(".sort").style.display = "";
    document.querySelector(".incantation").textContent =
      "(" + m_selected.Incantation + " s / " + expurger_temps_sort(sort.Incantation) + ")";
    document.querySelector(".incantation").style.display = "";
    document.querySelector(".info_principale").textContent = "";
    document.querySelector(".info_secondaire").textContent = "";
  }
  else {
    document
      .getElementById("div_arme_secondaire")
      .getElementsByTagName("span")[0].style.display = "";
    arme2.style.display = "";
    document.querySelector(".liste").style.display = "none";
    document.querySelector(".sort").style.display = "none";
    document.querySelector(".incantation").style.display = "none";
  }

  // Mise à jour des états temporaires
  div = document.getElementById("div_etats");
  const etats = div.querySelector(".etats");
  etats.innerHTML = "";
  const colgroup = document.createElement("colgroup");
  colgroup.innerHTML = `<col style="width: 1px;">
     <col style="width: 1px;">
     <col style="width: 1px;">
     <col style="width: 1px;">
     <col style="width: auto;">
     <col style="width: 1px;">
     <col style="width: 1px;">
     <col style="width: 1px;">
     <col style="width: 1px;">`;
  etats.appendChild(colgroup);

  Attaques.sort(Attaque.tri);

  const Etats = Attaques.filter((a) =>
    a.Model === m_selected.Model &&
    a.Indice === m_selected.Indice &&
    a.Timing > Nb_rounds * 5 &&
    a.Competence !== null);
  let tr = null;
  for (let i = 0; i < Etats.length; i++) {
    const e = Etats[i];
    if (tr === null) tr = document.createElement("tr");

    const td1 = document.createElement("td");
    td1.innerHTML = e.Competence + " :&nbsp;";
    tr.appendChild(td1);
    const td2 = document.createElement("td");
    td2.style.textAlign = "center";
    if (!isNaN(parseInt(e.Bonus))) {
      td2.innerHTML = (parseInt(e.Bonus) > 0 ? "+" : "") + e.Bonus;
    }
    else {
      td2.innerHTML = e.Bonus;
    }
    tr.appendChild(td2);
    const td3 = document.createElement("td");
    td3.style.textAlign = "right";
    td3.innerHTML = "(" + (e.Timing - Nb_rounds * 5 - 5) + " s)";
    tr.appendChild(td3);
    const td4 = document.createElement("td");
    td4.innerHTML =
      "<img src='images/Supprimer.png' onclick='delete_etat_temp(" + i + ");' alt='Supprimer'" +
      "style='width: 10px; height: 10px; cursor: pointer; vertical-align: middle;'>";
    tr.appendChild(td4);

    if (i % 2 === 0) {
      const td5 = document.createElement("td");
      td5.innerHTML = "&nbsp;";
      tr.appendChild(td5);

      if (i === Etats.length - 1) {
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td"));
        tr.appendChild(document.createElement("td"));
        etats.appendChild(tr);
        tr = null;
      }
    }
    else {
      etats.appendChild(tr);
      tr = null;
    }
  }

  // Affichage de la figurine du pion
  const fig = div.querySelector(".figurine");
  const zoom = document.getElementById('zoom_pion');
  const buttons = document.getElementById('div_buttons');

  fig.src = "images/" + m_selected.Model + ".png";
  fig.style.height =
    zoom.getBoundingClientRect().bottom
    - div.getBoundingClientRect().top
    - etats.getBoundingClientRect().height
    - buttons.getBoundingClientRect().height
    + "px";

  // Action sur le bouton de duplication du personnage
  div = document.getElementById("div_buttons");
  div.querySelector(".dupliquer").disabled = m_model.Is_joueur;
}

/**
 * Initialise le dialogue de création d'un nouveau pion
 */
initialise_new_pion();
function initialise_new_pion() {
  const dialog_new_pion = document.getElementById("dialog_new_pion");

  // Empêche le menu contextuel sur le dialogue de création
  dialog_new_pion.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  // Fermeture du dialogue de création
  dialog_new_pion.querySelector("#Fermer").addEventListener("click", function (event) {
    dialog_new_pion.close();
  });

  // Création d'un nouveau personnage
  dialog_new_pion.querySelector("#model").addEventListener("change", function (event) {
    // Récupération des informations du dialogue
    const model = dialog_new_pion.querySelector("#model");
    const col = dialog_new_pion.querySelector("#col");
    const row = dialog_new_pion.querySelector("#row");

    // Création du nouveau pion
    m_selected = new Pion("ennemis", model.value);

    // Positionnement du pion
    m_selected.Position = col.value + "," + row.value;
    Pions[Pions.length] = m_selected;

    // Synchronisation avec le serveur
    m_selected.sendMessage("setall");

    dialog_new_pion.close();

    // Affichage des détails du personnage créé
    affiche_zoom_pion();

    // Mise à jour de l'affichage
    Map.generateHexMap();
    Map.drawHexMap();
  });
}

/**
 * Affiche le dialogue de création d'un nouveau pion
 */
function affiche_new_pion(col, row) {
  const dialog_new_pion = document.getElementById("dialog_new_pion");

  // Affichage du dialogue de création de pion
  const model = dialog_new_pion.querySelector("#model");

  dialog_new_pion.querySelector("#col").value = col;
  dialog_new_pion.querySelector("#row").value = row;

  while (model.options.length > 1) model.removeChild(model.lastChild);

  // Ajout des modèles de joueurs comme options de contrôle
  Models.forEach(m => {
    if (m.Is_joueur && Pions.some((x) => x.Model === m.Nom_model)) return;

    const nouvelleOption = document.createElement("option");
    nouvelleOption.value = m.Nom_model;
    nouvelleOption.textContent = m.Nom_model;
    model.appendChild(nouvelleOption);
  });

  dialog_new_pion.showModal();
}

/**
 * Génère une nouvelle localisation d'attaque aléatoire
 * Utilise des tables de localisation différentes selon
 * le type d'arme : à distance ou au corps à corps
 */
function genere_loc_attaque() {
  const attaquant = Pions.find((m) => m.Attaquant);

  // Détermination du type d'arme (à distance ou corps à corps)
  let A_distance = null;
  if (attaquant.at1_att) A_distance = Armes.find((w) => w.Nom_arme === attaquant.Arme1).A_distance;
  if (attaquant.at2_att) A_distance = Armes.find((w) => w.Nom_arme === attaquant.Arme2).A_distance;

  // Génération aléatoire de la localisation
  let loc_att = "";
  while (true) {
    const jet_loc = Math.floor(Math.random() * 20) + 1;

    // Table de localisation pour armes de corps à corps
    if (!A_distance) {
      if (jet_loc < 4) loc_att = "jambe gauche";
      else if (jet_loc < 7) loc_att = "jambe droite";
      else if (jet_loc < 10) loc_att = "abdomen";
      else if (jet_loc < 13) loc_att = "poitrine";
      else if (jet_loc < 16) loc_att = "bras gauche";
      else if (jet_loc < 19) loc_att = "bras droit";
      else loc_att = "tête";
    } else {
      if (jet_loc < 5) loc_att = "jambe gauche";
      else if (jet_loc < 9) loc_att = "jambe droite";
      else if (jet_loc < 13) loc_att = "abdomen";
      else if (jet_loc < 16) loc_att = "poitrine";
      else if (jet_loc < 18) loc_att = "bras gauche";
      else if (jet_loc < 20) loc_att = "bras droit";
      else loc_att = "tête";
    }

    if (dialog_attaque_2.querySelector(".tete").checked && loc_att === "tête") break;
    if (dialog_attaque_2.querySelector(".poitrine").checked && loc_att === "poitrine") break;
    if (dialog_attaque_2.querySelector(".abdomen").checked && loc_att === "abdomen") break;
    if (dialog_attaque_2.querySelector(".brasg").checked && loc_att === "bras gauche") break;
    if (dialog_attaque_2.querySelector(".brasd").checked && loc_att === "bras droit") break;
    if (dialog_attaque_2.querySelector(".jambeg").checked && loc_att === "jambe gauche") break;
    if (dialog_attaque_2.querySelector(".jambed").checked && loc_att === "jambe droite") break;
  }

  return loc_att;
}

/**
 * Initialise le dialogue d'attaque
 */
initialise_attaque();
function initialise_attaque() {
  const dialog_attaque_1 = document.getElementById("dialog_attaque_1");
  const dialog_attaque_2 = document.getElementById("dialog_attaque_2");
  const dialog_attaque_3 = document.getElementById("dialog_attaque_3");

  // Gestion des clics sur les spans pour sélectionner les armes
  dialog_attaque_1.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mousedown", function (event) {
      const radio = event.target.closest("td").querySelector('input[type="radio"]');
      if (radio === null || typeof radio === "undefined") return;
      radio.click();
    });
  });

  // Gestion de la touche Échap pour annuler l'attaque
  dialog_attaque_1.addEventListener("keydown", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    if (event.key === "Escape" || event.key === "Esc") {
      attaquant.at1_att = false;
      attaquant.at2_att = false;
      dialog_attaque_1.close();
      resoudre_attaque();
      setTimeout(function () {
        canvas.focus({ preventScroll: true });
      }, 50);
    }
  });

  // Sélection "Aucune arme" - annule l'attaque
  dialog_attaque_1.querySelector(".arme_radio0").addEventListener("change", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    attaquant.at1_att = false;
    attaquant.at2_att = false;
    dialog_attaque_1.close();
    resoudre_attaque();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
  });

  // Sélection de l'arme principale (1ère main)
  dialog_attaque_1.querySelector(".arme_radio1").addEventListener("change", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    attaquant.at1_att = true;
    attaquant.at2_att = false;
    dialog_attaque_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_attaque(2);
  });

  // Sélection de l'arme secondaire (2nde main)
  dialog_attaque_1.querySelector(".arme_radio2").addEventListener("change", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    attaquant.at1_att = false;
    attaquant.at2_att = true;
    dialog_attaque_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_attaque(2);
  });

  // Gestion de la touche Échap pour annuler l'attaque (dialogue 2)
  dialog_attaque_2.addEventListener("keydown", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    if (event.key === "Escape" || event.key === "Esc") {
      attaquant.at1_att = false;
      attaquant.at2_att = false;
      dialog_attaque_2.close();
      setTimeout(function () {
        canvas.focus({ preventScroll: true });
      }, 50);
      resoudre_attaque();
    }
  });

  // Bouton "Point de chance" - relance les dés d'attaque
  dialog_attaque_2.querySelector(".pt_chance").addEventListener("click", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);

    // Lancement de 3 jets de dés (3D6)
    const jet_0 = parseInt(dialog_attaque_2.querySelector(".jet_des").value, 10);
    const jet_1 =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;
    const jet_2 =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;
    const jet_3 =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    // Sélection du meilleur jet (minimum 13)
    attaquant.jet_att = Math.max(13, jet_0, jet_1, jet_2, jet_3);

    // Calcul du score d'attaque
    const scr_att = calcul_scr_att();

    // Mise à jour de l'interface
    dialog_attaque_2.querySelector(".jet_des").value = attaquant.jet_att;
    dialog_attaque_2.querySelector(".scr_att").value = scr_att;

    // Couleur selon le résultat
    if (scr_att >= 0) {
      dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(128, 255, 128)";
    } else {
      dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(255, 128, 128)";
    }
  });

  // Bouton d'acceptation du jet d'attaque
  dialog_attaque_2.querySelector(".accepter").addEventListener("click", function (event) {
    dialog_attaque_2.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_attaque(3);
  });

  // Gestion des cases à cocher pour les zones corporelles
  dialog_attaque_2.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
    chk.addEventListener("click", function (event) {
      // Calcul du malus de zones corporelles non sélectionnées
      let malus_fdc = 0;
      if (!dialog_attaque_2.querySelector(".tete").checked) malus_fdc++;
      if (!dialog_attaque_2.querySelector(".poitrine").checked) malus_fdc++;
      if (!dialog_attaque_2.querySelector(".abdomen").checked) malus_fdc++;
      if (!dialog_attaque_2.querySelector(".brasg").checked) malus_fdc++;
      if (!dialog_attaque_2.querySelector(".brasd").checked) malus_fdc++;
      if (!dialog_attaque_2.querySelector(".jambeg").checked) malus_fdc++;
      if (!dialog_attaque_2.querySelector(".jambed").checked) malus_fdc++;

      // Empêche de désélectionner toutes les zones
      if (malus_fdc === 7) event.target.checked = true;

      // Mise à jour de la feinte de corps du défenseur
      const fdc_def = calcul_fdc_def();
      dialog_attaque_2.querySelector(".fdc_def").value = fdc_def;

      // Mise à jour du score d'attaque
      const scr_att = calcul_scr_att();
      dialog_attaque_2.querySelector(".scr_att").value = scr_att;

      // Couleur selon le succès/échec
      if (scr_att >= 0) {
        dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(128, 255, 128)"; // Vert pour succès
      } else {
        dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(255, 128, 128)"; // Rouge pour échec
      }
    });
  });

  // Gestion des cases à cocher pour les zones corporelles
  dialog_attaque_2.querySelector(".var_mj").addEventListener("input", function (event) {
    // Mise à jour de la feinte de corps du défenseur
    const fdc_def = calcul_fdc_def();
    dialog_attaque_2.querySelector(".fdc_def").value = fdc_def;

    // Mise à jour du score d'attaque
    const scr_att = calcul_scr_att();
    dialog_attaque_2.querySelector(".scr_att").value = scr_att;

    // Couleur selon le succès/échec
    if (scr_att >= 0) {
      dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(128, 255, 128)"; // Vert pour succès
    } else {
      dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(255, 128, 128)"; // Rouge pour échec
    }
  });

  // Gestion des clics sur les spans pour sélectionner les zones corporelles
  dialog_attaque_2.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mousedown", function (event) {
      const chk = event.target.closest("td").querySelector('input[type="checkbox"]');
      if (chk === null || typeof chk === "undefined") return;
      chk.click();
    });
  });

  // Affichage du tooltip au survol du score d'attaque
  dialog_attaque_2.querySelector(".scr_att").addEventListener("mouseover", function (event) {
    const tooltip = dialog_attaque_2.querySelector(".tooltip");
    const dialog = dialog_attaque_2.getBoundingClientRect();
    tooltip.style.left = event.clientX - dialog.left - 250 + "px";
    tooltip.style.top = event.clientY - dialog.top + 10 + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = explications_scr_att();
  });

  // Masquage du tooltip quand la souris quitte le score d'attaque
  dialog_attaque_2.querySelector(".scr_att").addEventListener("mouseout", function (event) {
    const tooltip = dialog_attaque_2.querySelector(".tooltip");
    tooltip.style.display = "none";
  });

  // Affichage du tooltip au survol du score d'attaque
  dialog_attaque_2.querySelector(".fdc_def").addEventListener("mouseover", function (event) {
    const tooltip = dialog_attaque_2.querySelector(".tooltip");
    const dialog = dialog_attaque_2.getBoundingClientRect();
    tooltip.style.left = event.clientX - dialog.left + 10 + "px";
    tooltip.style.top = event.clientY - dialog.top + 10 + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = explications_fdc_def();
  });

  // Masquage du tooltip quand la souris quitte le score d'attaque
  dialog_attaque_2.querySelector(".fdc_def").addEventListener("mouseout", function (event) {
    const tooltip = dialog_attaque_2.querySelector(".tooltip");
    tooltip.style.display = "none";
  });

  // Bouton "Point de chance" pour la localisation - relance la localisation
  dialog_attaque_3.querySelector(".pt_chance").addEventListener("click", function (event) {
    // Génération de 3 nouvelles localisations
    for (let i = 0; i < 3; i++) {
      const new_jet = genere_loc_attaque();
      if (new_jet === "tête") dialog_attaque_3.querySelector(".tete").closest("td").style.display = "";
      if (new_jet === "poitrine") dialog_attaque_3.querySelector(".poitrine").closest("td").style.display = "";
      if (new_jet === "abdomen") dialog_attaque_3.querySelector(".abdomen").closest("td").style.display = "";
      if (new_jet === "bras gauche") dialog_attaque_3.querySelector(".brasg").closest("td").style.display = "";
      if (new_jet === "bras droit") dialog_attaque_3.querySelector(".brasd").closest("td").style.display = "";
      if (new_jet === "jambe gauche") dialog_attaque_3.querySelector(".jambeg").closest("td").style.display = "";
      if (new_jet === "jambe droite") dialog_attaque_3.querySelector(".jambed").closest("td").style.display = "";
    }
  });

  // Gestion des clics sur les spans pour sélectionner la localisation
  dialog_attaque_3.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mousedown", function (event) {
      const rd = event.target.closest("td").querySelector('input[type="radio"]');
      if (rd === null || typeof rd === "undefined") return;
      rd.click();
    });
  });

  // Bouton d'acceptation de la localisation
  dialog_attaque_3.querySelector(".accepter").addEventListener("click", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    const defenseur = Pions.find((m) => m.Defenseur);

    // Récupération de la localisation sélectionnée
    attaquant.loc_att = dialog_attaque_3.querySelector('input[name="loc"]:checked').value;
    dialog_attaque_3.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);

    // Résolution selon le score d'attaque
    const scr_att = parseInt(dialog_attaque_3.querySelector(".scr_att").value, 10);
    if (scr_att >= 0 && defenseur !== null && typeof defenseur !== "undefined") {
      // Afficher le dialogue de défense pour permettre au défenseur de choisir sa défense
      affiche_defense(1);
    }
    else resoudre_attaque();
  });

  // Gestion de la touche Échap pour annuler l'attaque (dialogue 3)
  dialog_attaque_3.addEventListener("keydown", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    if (event.key === "Escape" || event.key === "Esc") {
      attaquant.at1_att = false;
      attaquant.at2_att = false;
      dialog_attaque_3.close();
      setTimeout(function () {
        canvas.focus({ preventScroll: true });
      }, 50);
      resoudre_attaque();
    }
  });

  // Affichage du tooltip au survol du score d'attaque (dialogue 3)
  dialog_attaque_3.querySelector(".scr_att").addEventListener("mouseover", function (event) {
    const tooltip = dialog_attaque_3.querySelector(".tooltip");
    const dialog = dialog_attaque_3.getBoundingClientRect();
    tooltip.style.left = event.clientX - dialog.left + 10 + "px";
    tooltip.style.top = event.clientY - dialog.top + 10 + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = explications_scr_att();
  });

  // Masquage du tooltip quand la souris quitte le score d'attaque (dialogue 3)
  dialog_attaque_3.querySelector(".scr_att").addEventListener("mouseout", function (event) {
    const tooltip = dialog_attaque_3.querySelector(".tooltip");
    tooltip.style.display = "none";
  });
}

/**
 * Affiche le dialogue d'attaque selon la phase du combat
 * @param {number} phase - Phase du combat (1: choix arme, 2: jet dés, 3: localisation)
 */
function affiche_attaque(phase) {
  const attaquant = Pions.find((m) => m.Attaquant);
  const defenseur = Pions.find((m) => m.Defenseur);

  // Création de l'en-tête du dialogue
  entete = attaquant.Titre + "<br>";
  entete += contre_attaque ? "Vous contre-attaquez " : "Vous attaquez ";
  entete += defenseur.Titre + "<hr>";

  // Mise à jour de l'en-tête dans tous les dialogues d'attaque
  if (phase === 1) {
    dialog_attaque_1.querySelector(".nom").innerHTML = entete;
    dialog_attaque_2.querySelector(".nom").innerHTML = entete;
    dialog_attaque_3.querySelector(".nom").innerHTML = entete;
  }

  // === PHASE 1 : CHOIX DE L'ARME ===
  if (phase === 1) {
    // Gestion de l'arme principale
    if (attaquant.Arme1 === "" || attaquant.Arme1 === "Bouclier") {
      dialog_attaque_1.querySelector(".arme_radio1").closest("tr").style.display = "none";
    } else {
      dialog_attaque_1.querySelector(".arme_radio1").closest("tr").style.display = "";
    }

    // Gestion de l'arme secondaire
    if (attaquant.Arme2 === "" || attaquant.Arme2 === "Bouclier") {
      dialog_attaque_1.querySelector(".arme_radio2").closest("tr").style.display = "none";
    } else {
      dialog_attaque_1.querySelector(".arme_radio2").closest("tr").style.display = "";
    }

    // Réinitialisation des sélections
    dialog_attaque_1.querySelector(".arme_radio0").checked = false;
    dialog_attaque_1.querySelector(".arme_radio1").checked = false;
    dialog_attaque_1.querySelector(".arme_radio2").checked = false;

    // Mise à jour des labels des armes
    dialog_attaque_1.querySelector(".main1").innerHTML = "1ère main (" + attaquant.Arme1 + ")";
    dialog_attaque_1.querySelector(".main2").innerHTML = "2nde main (" + attaquant.Arme2 + ")";

    // Activation/désactivation des options d'accès aux armes pour l'attaque courante
    if (current_attaque && current_attaque.Main === 1) {
      dialog_attaque_1.querySelector(".arme_radio1").disabled = attaquant.Arme1_engagee || attaquant.Esquive;
      dialog_attaque_1.querySelector(".arme_radio2").disabled = true;
    } else if (current_attaque && current_attaque.Main === 2) {
      dialog_attaque_1.querySelector(".arme_radio1").disabled = true;
      dialog_attaque_1.querySelector(".arme_radio2").disabled = attaquant.Arme2_engagee || attaquant.Esquive;
    }

    dialog_attaque_1.showModal();
  }
  // === PHASE 2 : JET DE DÉS ET SCORE D'ATTAQUE ===
  else if (phase === 2) {
    // Sélection par défaut de toutes les zones corporelles
    dialog_attaque_2.querySelector(".tete").checked = true;
    dialog_attaque_2.querySelector(".poitrine").checked = true;
    dialog_attaque_2.querySelector(".abdomen").checked = true;
    dialog_attaque_2.querySelector(".brasg").checked = true;
    dialog_attaque_2.querySelector(".brasd").checked = true;
    dialog_attaque_2.querySelector(".jambeg").checked = true;
    dialog_attaque_2.querySelector(".jambed").checked = true;

    dialog_attaque_2.querySelector(".surprise_totale").checked = false;
    dialog_attaque_2.querySelector(".immobile").checked = false;
    dialog_attaque_2.querySelector(".surprise_partielle").checked = false;
    dialog_attaque_2.querySelector(".autre_action").checked = false;
    dialog_attaque_2.querySelector(".gene_mouvements").checked = false;
    dialog_attaque_2.querySelector(".aveugle").checked = false;

    dialog_attaque_2.querySelector(".var_mj").value = "";

    // Lancement de 3D6 pour l'attaque
    attaquant.jet_att =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    // Calcul de la feinte de corps du défenseur
    const fdc_def = calcul_fdc_def();

    // Calcul du score d'attaque
    const scr_att = calcul_scr_att();

    // Mise à jour de l'interface
    dialog_attaque_2.querySelector(".jet_des").value = attaquant.jet_att;
    dialog_attaque_2.querySelector(".fdc_def").value = fdc_def;
    dialog_attaque_2.querySelector(".scr_att").value = scr_att;

    // Couleur selon le succès/échec
    if (scr_att >= 0) {
      dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(128, 255, 128)"; // Vert pour succès
    } else {
      dialog_attaque_2.querySelector(".scr_att").style.backgroundColor = "rgb(255, 128, 128)"; // Rouge pour échec
    }

    dialog_attaque_2.showModal();
  }
  // === PHASE 3 : LOCALISATION DE L'ATTAQUE ===
  else if (phase === 3) {
    // Récupération du score d'attaque depuis le dialogue précédent
    const scr_att = parseInt(dialog_attaque_2.querySelector(".scr_att").value, 10);

    // Si l'attaque a échoué, pas de localisation nécessaire
    if (scr_att < 0) {
      attaquant.loc_att = "";

      // Résolution directe de l'attaque échouée
      resoudre_attaque();
      return;
    }

    // Mise à jour de l'interface avec les valeurs d'attaque
    dialog_attaque_3.querySelector(".jet_des").value = attaquant.jet_att;
    dialog_attaque_3.querySelector(".scr_att").value = scr_att;

    // Couleur selon le succès/échec
    if (scr_att >= 0) {
      dialog_attaque_3.querySelector(".scr_att").style.backgroundColor = "rgb(128, 255, 128)"; // Vert pour succès
    } else {
      dialog_attaque_3.querySelector(".scr_att").style.backgroundColor = "rgb(255, 128, 128)"; // Rouge pour échec
    }

    // Génération de la localisation aléatoire
    const loc_att = genere_loc_attaque();

    // Configuration de l'affichage selon la localisation générée
    // Tête
    if (loc_att === "tête") {
      dialog_attaque_3.querySelector(".tete").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".tete_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".tete").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".tete_rd").checked = false;
    }

    // Poitrine
    if (loc_att === "poitrine") {
      dialog_attaque_3.querySelector(".poitrine").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".poitrine_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".poitrine").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".poitrine_rd").checked = false;
    }

    // Abdomen
    if (loc_att === "abdomen") {
      dialog_attaque_3.querySelector(".abdomen").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".abdomen_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".abdomen").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".abdomen_rd").checked = false;
    }

    // Bras gauche
    if (loc_att === "bras gauche") {
      dialog_attaque_3.querySelector(".brasg").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".brasg_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".brasg").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".brasg_rd").checked = false;
    }

    // Bras droit
    if (loc_att === "bras droit") {
      dialog_attaque_3.querySelector(".brasd").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".brasd_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".brasd").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".brasd_rd").checked = false;
    }

    // Jambe gauche
    if (loc_att === "jambe gauche") {
      dialog_attaque_3.querySelector(".jambeg").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".jambeg_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".jambeg").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".jambeg_rd").checked = false;
    }

    // Jambe droite
    if (loc_att === "jambe droite") {
      dialog_attaque_3.querySelector(".jambed").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".jambed_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".jambed").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".jambed_rd").checked = false;
    }

    // Affichage du dialogue de localisation
    dialog_attaque_3.showModal();
  }
}

/**
 * Calcule et affiche les résultats de la défense
 * Effectue les calculs de score d'attaque, score de défense, marge et dommages,
 * puis affiche le résultat dans le dialogue de défense
 */
function affiche_defense_sub() {
  // Récupération des pions attaquant et défenseur
  const attaquant = Pions.find((m) => m.Attaquant);
  const defenseur = Pions.find((m) => m.Defenseur);

  // Récupération des armes
  const w1_att = Armes.find((w) => w.Nom_arme === attaquant.Arme1);
  const w2_att = Armes.find((w) => w.Nom_arme === attaquant.Arme2);

  // Détermination si l'attaque est à distance
  const is_distant =
    (attaquant.at1_att && w1_att.A_distance) ||
    (attaquant.at2_att && w2_att.A_distance);

  // Calcul du score d'attaque
  const scr_att = calcul_scr_att();

  // Calcul du score de défense selon le type
  let scr_def;
  if (is_distant || defenseur.Arme1 === "Lancement de sort") {
    // Esquive uniquement pour les attaques à distance ou les sorts
    scr_def = defenseur.jet_def - 10 +
      (defenseur.esq_def ? defenseur.get_competence("Esquive") - defenseur.Nb_action : 0);
  }
  else {
    // Parade pour les attaques au corps à corps
    scr_def = calcul_scr_def();
  }

  // Mise à jour de l'interface avec les scores
  dialog_defense_2.querySelector(".scr_att").value = scr_att;
  dialog_defense_2.querySelector(".scr_def").value = scr_def;

  // Calcul de la marge d'attaque
  // Si la défense a réussi (scr_def > 0), on soustrait la défense du score d'attaque
  if (scr_def > 0) marge = scr_att - scr_def;
  else marge = scr_att;

  // Colorisation du score de défense selon le résultat
  // Vert (128, 255, 128) : défense réussie (marge négative ou nulle avec scr_def positif)
  // Rouge (255, 128, 128) : attaque réussie (marge positive)
  if (marge === 0) {
    if (scr_def > 0) {
      // Match nul mais défense réussie
      dialog_defense_2.querySelector(".scr_def").style.backgroundColor = "rgb(128, 255, 128)";
    } else {
      // Match nul mais défense échouée
      dialog_defense_2.querySelector(".scr_def").style.backgroundColor = "rgb(255, 128, 128)";
    }
  } else if (marge < 0) {
    // Défense réussie : marge négative
    dialog_defense_2.querySelector(".scr_def").style.backgroundColor = "rgb(128, 255, 128)";
  } else {
    // Attaque réussie : marge positive
    dialog_defense_2.querySelector(".scr_def").style.backgroundColor = "rgb(255, 128, 128)";
  }

  // Calcul des dommages infligés par l'attaque
  let dommages = calcul_dommages(marge);

  // Génération du texte de localisation de l'attaque
  let texte_loc = "";
  switch (attaquant.loc_att) {
    case "abdomen":
      texte_loc = "à l'" + attaquant.loc_att; // "à l'abdomen"
      break;
    case "bras gauche":
    case "bras droit":
      texte_loc = "au " + attaquant.loc_att; // "au bras gauche/droit"
      break;
    case "jambe gauche":
    case "jambe droite":
    case "poitrine":
    case "tête":
      texte_loc = "à la " + attaquant.loc_att; // "à la jambe", "à la poitrine", etc.
      break;
  }

  // Déterminer si l'attaque est une contre-attaque (par rapport au dialogue d'attaque précédent)
  const is_contre_attaque = dialog_attaque_1.querySelector(".nom").innerHTML.includes("contre-attaq");

  // Affichage du résultat selon la marge et le type de défense
  // Case 1 : Défense échouée (scr_def négatif mais marge positive ou nulle)
  if (scr_def < 0 && marge >= 0) {
    dialog_defense_2.querySelector(".dommages").innerHTML =
      "Défense échouée.<br>L'attaque occasionne " + dommages + " points de vie " + texte_loc + ".";
    dialog_defense_2.showModal();
  }
  // Case 2 : Attaque interceptée partiellement (marge positive)
  else if (marge > 0) {
    dialog_defense_2.querySelector(".dommages").innerHTML =
      "Attaque interceptée partiellement.<br>L'attaque occasionne " + dommages + " points de vie " + texte_loc + ".";
    dialog_defense_2.showModal();
  }
  // Case 3 : Attaque interceptée mais attaquant garde l'avantage
  // Parade avec marge > -2 ou esquive avec marge > -4
  else if (
    (defenseur.pr1_def && marge > -2) ||
    (defenseur.pr2_def && marge > -2) ||
    (defenseur.esq_def && marge > -4)
  ) {
    dialog_defense_2.querySelector(".dommages").innerHTML = "Attaque interceptée entièrement." +
      (is_contre_attaque || is_distant ? "" : "<br>Mais l'attaquant garde l'avantage.");
    dialog_defense_2.showModal();
  }
  // Case 4 : Attaque interceptée complètement, défenseur prend l'avantage
  else {
    dialog_defense_2.querySelector(".dommages").innerHTML = "Attaque interceptée entièrement." +
      (is_contre_attaque || is_distant ? "" : "<br>Vous prenez l'avantage.");
    dialog_defense_2.showModal();
  }
}

/**
 * Initialise le dialogue de défense
 */
initialise_defense();
function initialise_defense() {
  const dialog_defense_1 = document.getElementById("dialog_defense_1");
  const dialog_defense_2 = document.getElementById("dialog_defense_2");

  // Gestion des clics sur les spans pour sélectionner le type de défense
  dialog_defense_1.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mousedown", function (event) {
      const radio = event.target.closest("td").querySelector('input[type="radio"]');
      if (radio === null || typeof radio === "undefined") return;
      radio.click();
    });
  });

  // Gestion de la touche Échap pour annuler la défense
  dialog_defense_1.addEventListener("keydown", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    if (event.key === "Escape" || event.key === "Esc") {
      defenseur.pr1_def = false;
      defenseur.pr2_def = false;
      defenseur.esq_def = false;
      dialog_defense_1.close();
      setTimeout(function () {
        canvas.focus({ preventScroll: true });
      }, 50);
      resoudre_attaque();
    }
  });

  // Sélection "Aucune défense" - annule la défense
  dialog_defense_1.querySelector(".arme_radio0").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.pr1_def = false;
    defenseur.pr2_def = false;
    defenseur.esq_def = false;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    resoudre_attaque();
  });

  // Sélection de la parade avec arme principale
  dialog_defense_1.querySelector(".arme_radio1").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.pr1_def = true;
    defenseur.pr2_def = false;
    defenseur.esq_def = false;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_defense(2);
  });

  // Sélection de la parade avec arme secondaire
  dialog_defense_1.querySelector(".arme_radio2").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.pr1_def = false;
    defenseur.pr2_def = true;
    defenseur.esq_def = false;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_defense(2);
  });

  // Sélection de l'esquive
  dialog_defense_1.querySelector(".arme_radio3").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.pr1_def = false;
    defenseur.pr2_def = false;
    defenseur.esq_def = true;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_defense(2);
  });

  // Bouton "Point de chance" - relance les dés de défense
  dialog_defense_2.querySelector(".pt_chance").addEventListener("click", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);

    // Lancement de 3 jets de dés (3D6)
    const jet_0 = parseInt(dialog_defense_2.querySelector(".jet_des").value, 10);
    const jet_1 =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;
    const jet_2 =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;
    const jet_3 =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    // Sélection du meilleur jet (minimum 13)
    defenseur.jet_def = Math.max(13, jet_0, jet_1, jet_2, jet_3);
    dialog_defense_2.querySelector(".jet_des").value = defenseur.jet_def;

    affiche_defense_sub();
  });

  // Bouton d'acceptation de la défense
  dialog_defense_2.querySelector(".accepter").addEventListener("click", function (event) {
    dialog_defense_2.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    resoudre_attaque();
  });

  // Gestion de la touche Échap pour annuler la défense
  dialog_defense_2.addEventListener("keydown", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    if (event.key === "Escape" || event.key === "Esc") {
      defenseur.pr1_def = false;
      defenseur.pr2_def = false;
      defenseur.esq_def = false;
      dialog_defense_2.close();
      setTimeout(function () {
        canvas.focus({ preventScroll: true });
      }, 50);
      resoudre_attaque();
    }
  });

  // Affichage du tooltip au survol du score d'attaque (dialogue 3)
  dialog_defense_2.querySelector(".scr_att").addEventListener("mouseover", function (event) {
    const tooltip = dialog_defense_2.querySelector(".tooltip");
    const dialog = dialog_defense_2.getBoundingClientRect();
    tooltip.style.left = event.clientX - dialog.left + 10 + "px";
    tooltip.style.top = event.clientY - dialog.top + 10 + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = explications_scr_att();
  });

  // Masquage du tooltip quand la souris quitte le score d'attaque (dialogue 3)
  dialog_defense_2.querySelector(".scr_att").addEventListener("mouseout", function (event) {
    const tooltip = dialog_defense_2.querySelector(".tooltip");
    tooltip.style.display = "none";
  });

  // Affichage du tooltip au survol de la marge
  dialog_defense_2.querySelector(".scr_def").addEventListener("mouseover", function (event) {
    const tooltip = dialog_defense_2.querySelector(".tooltip");
    const dialog = dialog_defense_2.getBoundingClientRect();
    tooltip.style.left = event.clientX - dialog.left + 10 + "px";
    tooltip.style.top = event.clientY - dialog.top + 10 + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = explications_scr_def();
  });

  // Masquage du tooltip quand la souris quitte la marge
  dialog_defense_2.querySelector(".scr_def").addEventListener("mouseout", function (event) {
    const tooltip = dialog_defense_2.querySelector(".tooltip");
    tooltip.style.display = "none";
  });
}

/**
 * Affiche le dialogue de défense selon la phase du combat
 * @param {number} phase - Phase du combat (1: choix défense, 2: jet dés et résultat)
 */
function affiche_defense(phase) {
  // Récupération des pions attaquant et défenseur
  const attaquant = Pions.find((m) => m.Attaquant);
  const defenseur = Pions.find((m) => m.Defenseur);

  // Récupération des informations sur l'arme et le modèle de l'attaquant
  const w1_att = Armes.find((w) => w.Nom_arme === attaquant.Arme1);
  const w2_att = Armes.find((w) => w.Nom_arme === attaquant.Arme2);

  // Détermination si l'attaque est à distance
  const is_distant = (attaquant.at1_att && w1_att.A_distance) || (attaquant.at2_att && w2_att.A_distance);

  // === PHASE 1 : CHOIX DE LA DÉFENSE ===
  if (phase === 1) {
    // Création de l'en-tête du dialogue
    const is_contre_attaque = dialog_attaque_1.querySelector(".nom").innerHTML.includes("contre-attaq");
    entete = defenseur.Titre + "<br>";
    entete += is_contre_attaque ? "Vous êtes contre-attaqué(e) par " : "Vous êtes attaqué(e) par ";
    entete += attaquant.Titre + "<hr>";
    dialog_defense_1.querySelector(".nom").innerHTML = entete;

    // Masquage des options d'armes si elles sont vides ou si la parade est nulle (1ère main)
    const Arme1 = Armes.find((a) => a.Nom_arme === defenseur.Arme1);
    let par_def_1 = null;
    if (Arme1 !== null && typeof Arme1 !== "undefined") {
      par_def_1 = Arme1.Facteur_parade * defenseur.get_competence(Arme1.Competence);
      par_def_1 += defenseur.get_bonus("Parade");
    }
    if (Arme1 === null ||
      typeof Arme1 === "undefined" ||
      Arme1.Facteur_parade === null ||
      par_def_1 === null) {
      dialog_defense_1.querySelector(".arme_radio1").closest("tr").style.display = "none";
    }
    else {
      dialog_defense_1.querySelector(".arme_radio1").closest("tr").style.display = "";
    }

    // Masquage des options d'armes si elles sont vides ou si la parade est nulle (2nde main)
    const Arme2 = Armes.find((a) => a.Nom_arme === defenseur.Arme2);
    let par_def_2 = null;
    if (Arme2 !== null && typeof Arme2 !== "undefined") {
      par_def_2 = Arme2.Facteur_parade * defenseur.get_competence(Arme2.Competence);
      par_def_2 += defenseur.get_bonus("Parade");
    }
    if (Arme2 === null ||
      typeof Arme2 === "undefined" ||
      Arme2.Facteur_parade === null ||
      par_def_2 === null) {
      dialog_defense_1.querySelector(".arme_radio2").closest("tr").style.display = "none";
    }
    else {
      dialog_defense_1.querySelector(".arme_radio2").closest("tr").style.display = "";
    }

    // Réinitialisation des sélections
    dialog_defense_1.querySelector(".arme_radio0").checked = false;
    dialog_defense_1.querySelector(".arme_radio1").checked = false;
    dialog_defense_1.querySelector(".arme_radio2").checked = false;
    dialog_defense_1.querySelector(".arme_radio3").checked = false;

    // Mise à jour des labels des armes
    dialog_defense_1.querySelector(".main1").innerHTML = "Parade 1ère main (" + defenseur.Arme1 + ")";
    dialog_defense_1.querySelector(".main2").innerHTML = "Parade 2nde main (" + defenseur.Arme2 + ")";

    // Activation/désactivation des options selon les possibilités
    dialog_defense_1.querySelector(".arme_radio1").disabled =
      (defenseur.Arme1 && defenseur.Arme1_engagee) || defenseur.Esquive;
    dialog_defense_1.querySelector(".arme_radio2").disabled =
      (defenseur.Arme2 && defenseur.Arme2_engagee) || defenseur.Esquive;

    // Désactivation des parades pour les attaques à distance ou les sorts
    if (is_distant || defenseur.Arme1 === "Lancement de sort") {
      dialog_defense_1.querySelector(".arme_radio1").disabled = true;
      if (defenseur.Arme2 !== "Bouclier")
        dialog_defense_1.querySelector(".arme_radio2").disabled = true;
    }

    dialog_defense_1.showModal();
  }
  // === PHASE 2 : JET DE DÉS ET RÉSULTAT ===
  else if (phase === 2) {
    // Création de l'en-tête du dialogue
    entete = defenseur.Titre + "<br>";
    entete += defenseur.pr1_def || defenseur.pr1_def ? "Vous parez " : "";
    entete += defenseur.esq_def ? "Vous esquivez " : "";
    entete += attaquant.Titre + "<hr>";
    dialog_defense_2.querySelector(".nom").innerHTML = entete;

    // Lancement de 3D6 pour la défense
    defenseur.jet_def =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    dialog_defense_2.querySelector(".jet_des").value = defenseur.jet_def;

    affiche_defense_sub();
  }
}

/**
 * Initialise le dialogue de paramètrage ou confirmation d'un sort
 */
initialise_param_confirm_sort();
function initialise_param_confirm_sort() {
  const dialog_sort_1 = document.getElementById("dialog_sort_1");
  const dialog_sort_2 = document.getElementById("dialog_sort_2");

  // Gestion des clics sur les spans pour sélectionner le paramétrage de sort
  dialog_sort_1.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mousedown", function (event) {
      const radio = event.target.closest("td").querySelector('input[type="radio"]');
      if (radio === null || typeof radio === "undefined") return;
      radio.click();
    });
  });

  // Sélection de l'amplification 1
  dialog_sort_1.querySelector(".sort_radio1").addEventListener("change", function (event) {
    const sort = Sorts.find((s) =>
      s.Nom_liste === dialog_sort_1.querySelector(".nom_liste").textContent &&
      s.Nom_sort === dialog_sort_1.querySelector(".nom_sort").textContent);
    m_selected.Fatigue_sort = sort.Niveau;
    m_selected.Concentration_sort = sort.Niveau;
    dialog_sort_1.close();
  });

  // Sélection de l'amplification 2
  dialog_sort_1.querySelector(".sort_radio2").addEventListener("change", function (event) {
    const sort = Sorts.find((s) =>
      s.Nom_liste === dialog_sort_1.querySelector(".nom_liste").textContent &&
      s.Nom_sort === dialog_sort_1.querySelector(".nom_sort").textContent);
    m_selected.Fatigue_sort = 2 * sort.Niveau;
    m_selected.Concentration_sort = 2 * sort.Niveau;
    dialog_sort_1.close();
  });

  // Sélection de l'amplification 3
  dialog_sort_1.querySelector(".sort_radio3").addEventListener("change", function (event) {
    const sort = Sorts.find((s) =>
      s.Nom_liste === dialog_sort_1.querySelector(".nom_liste").textContent &&
      s.Nom_sort === dialog_sort_1.querySelector(".nom_sort").textContent);
    m_selected.Fatigue_sort = 3 * sort.Niveau;
    m_selected.Concentration_sort = 3 * sort.Niveau;
    dialog_sort_1.close();
  });

  // Sélection de l'amplification 0 (spécifique)
  dialog_sort_1.querySelector(".sort_radio0").addEventListener("change", function (event) {
    dialog_sort_1.querySelector(".fatigue_cout").disabled = false;
    dialog_sort_1.querySelector(".concentration_cout").disabled = false;
    dialog_sort_1.querySelector(".acter").disabled = false;
  });

  // Bouton "Acter" (Valide la sélection spécifique et ferme le dialogue)
  dialog_sort_1.querySelector(".acter").addEventListener("click", function (event) {
    // Mise à jour des points de fatigue et de concentration
    m_selected.Fatigue_sort = dialog_sort_1.querySelector(".fatigue_cout").value;
    m_selected.Concentration_sort = dialog_sort_1.querySelector(".concentration_cout").value;
    dialog_sort_1.close();
  });

  dialog_sort_2.addEventListener("close", function (event) {
    // Supprimer le panneau d'information existant s'il existe...
    if (document.getElementById(`spell-info`)) document.getElementById(`spell-info`).remove();
  });

  // Gestion du changement de la concentration spécifique
  dialog_sort_2.querySelector(".prompt_save").addEventListener("input", function (event) {
    if (event.target.value === "-" || event.target.value === "") {
      dialog_sort_2.querySelector(".res_save").textContent = "(Néant)";
      return;
    }
    let formula = null;
    let auto_save = false;

    formula = event.target.value.toLowerCase();
    formula = formula.replace(/« (.+) »/g, "$1");
    formula = formula.replace(/\[(.+)\]/g, "$1");

    if (formula !== event.target.value.toLowerCase()) auto_save = true;

    formula = formula.replace(/ /g, "");
    formula = formula.replace(/\t/g, "");
    formula = formula.replace(/^.*\(/g, "");
    formula = formula.replace(/\).*$/g, "");
    formula = formula.replace(/\+n/g, "");
    formula = formula.replace(/\-n/g, "");
    formula = formula.replace(/\-var/g, "");
    formula = formula.replace(/\+nbre/g, "");
    formula = formula.replace(/spéciale/g, "");

    formula = formula.replace(/c$/g, "Con");
    formula = formula.replace(/c\+/g, "Con+");
    formula = formula.replace(/c\-/g, "Con-");

    formula = formula.replace(/co$/g, "Cor");
    formula = formula.replace(/co\+/g, "Cor+");
    formula = formula.replace(/co\-/g, "Cor-");

    formula = formula.replace(/v$/g, "Vol");
    formula = formula.replace(/v\+/g, "Vol+");
    formula = formula.replace(/v\-/g, "Vol-");

    formula = formula.replace(/ab$/g, "Abs");
    formula = formula.replace(/ab\+/g, "Abs+");
    formula = formula.replace(/ab\-/g, "Abs-");

    formula = formula.replace(/foi$/g, "Foi");
    formula = formula.replace(/foi\+/g, "Foi+");
    formula = formula.replace(/foi\-/g, "Foi-");

    formula = formula.replace(/mag$/g, "Mag");
    formula = formula.replace(/mag\+/g, "Mag+");
    formula = formula.replace(/mag\-/g, "Mag-");

    formula = formula.replace(/6esens/g, "6eS");
    formula = formula.replace(/6es/g, "6eS");

    formula = formula.replace(/mem$/g, "Mem");
    formula = formula.replace(/mem\+/g, "Mem+");
    formula = formula.replace(/mem\-/g, "Mem-");

    formula = formula.replace(/nm$/g, "NM");
    formula = formula.replace(/nm\+/g, "NM+");
    formula = formula.replace(/nm\-/g, "NM-");

    formula = formula.replace(/p$/g, "Per");
    formula = formula.replace(/p\+/g, "Per+");
    formula = formula.replace(/p\-/g, "Per-");

    formula = formula.replace(/thp$/g, "Thp");
    formula = formula.replace(/thp\+/g, "Thp+");
    formula = formula.replace(/thp\-/g, "Thp-");

    formula = formula.replace(/vm$/g, "VM");
    formula = formula.replace(/vm\+/g, "VM+");
    formula = formula.replace(/vm\-/g, "VM-");

    formula = formula.replace(/ch$/g, "Cha");
    formula = formula.replace(/ch\+/g, "Cha+");
    formula = formula.replace(/ch\-/g, "Cha-");

    let base = formula.replace(/[+-]/g, "").replace(/[0-9]*$/, "");

    let operateur = formula.replace(/[^+-]/g, "").charAt(0);
    if (operateur === "") operateur = "+";

    let modificateur = parseInt(
      formula.replace(base, "").replace(/[+-]/g, ""),
      10
    );
    if (isNaN(modificateur)) modificateur = 0;

    if (base === "") {
      dialog_sort_2.querySelector(".res_save").textContent = eval(
        operateur.toString() + modificateur.toString()
      );
    } else if (
      ![
        "Con",
        "Cor",
        "Vol",
        "Abs",
        "Foi",
        "Mag",
        "6eS",
        "Mem",
        "NM",
        "Per",
        "Thp",
        "VM",
        "Cha",
      ].includes(base)
    ) {
      dialog_sort_2.querySelector(".res_save").textContent = "(???)";
    }
    else {
      dialog_sort_2.querySelector(".res_save").textContent = "(" +
        (auto_save ? "[" : "") + base + (auto_save ? "]" : "") +
        operateur.toString() + modificateur.toString() + ")";
    }
  });

  // Gestion du changement de la durée
  dialog_sort_2.addEventListener("input", function (event) {
    // Récupération du champs résultat
    let res = null;
    if (event.target.classList.contains("prompt_duree_succes")) res = ".res_duree_succes";
    else if (event.target.classList.contains("prompt_duree_echec")) res = ".res_duree_echec";
    else return;

    // Si le champ est vide, on affiche "(Néant)"
    if (event.target.value === "-" || event.target.value === "") {
      dialog_sort_2.querySelector(res).textContent = "(Néant)";
      return;
    }

    // Récupération de la formule
    let formula = event.target.value.toLowerCase();

    // Récupération du modificateur
    let match = formula.match(/([+\-][0-9]*m[re])/);
    let modificateur = match ? match[1] : null;
    if (modificateur === null) {
      match = formula.match(/^([0-9]*m[re])/);
      modificateur = match ? "+" + match[1] : "";
    }

    // Récupération de la durée
    formula = formula.replace(/[\+|\-]*[0-9]*m[re]/g, "");
    let duree = expurger_temps_sort(formula);
    if (duree === null) duree = 0;

    // Affichage du résultat
    modificateur = modificateur.toUpperCase();
    if (duree !== null) {
      dialog_sort_2.querySelector(res).textContent = "(" + duree + modificateur + ")";
    } else {
      dialog_sort_2.querySelector(res).textContent = "(???)";
    }
  });

  // Gestion du changement des dégâts
  dialog_sort_2.querySelector(".prompt_degats").addEventListener("input", function (event) {
    // Si le champ est vide, on affiche "(Néant)"
    if (event.target.value === "-" || event.target.value === "") {
      dialog_sort_2.querySelector(".res_degats").textContent = "(Néant)";
      return;
    }

    // Récupération de la formule
    let formula = event.target.value.toLowerCase();

    // Récupération du modificateur
    let match = formula.match(/([+\-][0-9]*m[re])/);
    let modificateur = match ? match[1] : null;
    if (modificateur === null) {
      match = formula.match(/^([0-9]*m[re])/);
      modificateur = match ? "+" + match[1] : "";
    }

    // Récupération des dégâts
    formula = formula.replace(/[\+|\-]*[0-9]*m[re]/g, "");
    formula = formula.replace(/\s+/, ""); // Suppression des espaces
    let degats = LancerDes.rollDice(formula);

    // Affichage du résultat
    modificateur = modificateur.toUpperCase();
    if (degats !== null) {
      dialog_sort_2.querySelector(".res_degats").textContent = "(" + degats + modificateur + ")";
    }
    else {
      dialog_sort_2.querySelector(".res_degats").textContent = "(???)";
    }
  });

  // Gestion des clics sur les spans pour sélectionner le type de dégâts / durée
  dialog_sort_2.querySelectorAll("span").forEach((span) => {
    span.addEventListener("mousedown", function (event) {
      const radio = event.target.closest("td").querySelector('input[type="radio"]');
      if (radio === null || typeof radio === "undefined") return;
      radio.click();
    });
  });

  // Bouton "Appliquer" (Valide la sélection spécifique et ferme le dialogue)
  dialog_sort_2.querySelector(".appliquer").addEventListener("click", function (event) {
    const magicien = Pions.find((p) => p.Attaquant);

    // Mise à jour des points de fatigue et de concentration
    magicien.Concentration -= magicien.Concentration_sort;
    magicien.Fatigue -= magicien.Fatigue_sort;
    magicien.Fatigue_down = Math.max(magicien.Fatigue_down, magicien.Fatigue_sort);

    Pions.filter((p) => p.Cible_sort).forEach((p) => {
      // Détermination de la sauvegarde au sort
      let save = p.sauvegarde_au_sort(dialog_sort_2.querySelector(".res_save").textContent);

      // Traitement des dégâts du sort
      p.degats_du_sort(save,
        dialog_sort_2.querySelector(".res_degats").textContent,
        dialog_sort_2.querySelector(".sel_degats").value === "0" ? "généraux" : "localisés");

      // Détermination de la durée du sort et de l'état
      let duree = null;
      let etat = null;
      if (save >= 0) {
        duree = p.duree_du_sort(save, dialog_sort_2.querySelector(".res_duree_succes").textContent);
        etat = dialog_sort_2.querySelector("#sel_etat_succes").value;
      } else {
        duree = p.duree_du_sort(-save, dialog_sort_2.querySelector(".res_duree_echec").textContent);
        etat = dialog_sort_2.querySelector("#sel_etat_echec").value;
      }

      if (etat !== "") {
        const attaque1 = new Attaque();
        attaque1.Model = p.Model;
        attaque1.Indice = p.Indice;
        attaque1.Timing = Nb_rounds * 5 + magicien.Incantation + duree;
        attaque1.Competence = etat;
        attaque1.Bonus = null;
        Attaques.push(attaque1);
      }

      // Autres types de bonus
      ListeBonus.filter((bonus) => bonus.Nature !== "Etat" && bonus.Ordre >= 0).forEach((bonus) => {
        let id = "champs_" + bonus.Nom_bonus.toLowerCase().replaceAll(" ", "_") + (save >= 0 ? "_succes" : "_echec");
        let champs = dialog_sort_2.querySelector("#" + id);

        if (champs.value !== "") {
          const attaque1 = new Attaque();
          attaque1.Model = p.Model;
          attaque1.Indice = p.Indice;
          attaque1.Timing = Nb_rounds * 5 + magicien.Incantation + duree;
          attaque1.Competence = bonus.Nom_bonus;
          attaque1.Bonus = champs.value;
          Attaques.push(attaque1);
        }
      });

      Attaques.sort(Attaque.tri);
    });

    // Réinitialisation des variables de sortilège du magicien
    magicien.Nom_liste = null;
    magicien.Nom_sort = null;
    magicien.Incantation = 0;
    magicien.Fatigue_sort = 0;
    magicien.Concentration_sort = 0;
    magicien.setArmes();

    magicien.Attaquant = false;
    Pions.forEach((p) => {
      p.Cible_sort = false;
    });

    // Mise à jour de la carte
    Map.generateHexMap();
    Map.drawHexMap();

    dialog_sort_2.close();

    next_attaque();

    affiche_zoom_pion();
  });
}
/**
 * Affiche le dialogue de paramètrage d'un sort
 */
function affiche_param_sort(sort) {
  // Récupération du modèle du personnage lanceur de sort
  const model = Models.find((m) => m.Nom_model === m_selected.Model);

  // Initialisation des champs du dialogue
  dialog_sort_1.querySelector(".nom").textContent = m_selected.Titre;
  dialog_sort_1.querySelector(".nom_liste").textContent = sort.Nom_liste;
  dialog_sort_1.querySelector(".nom_sort").textContent = sort.Nom_sort;
  dialog_sort_1.querySelector(".fatigue_actuelle").value = m_selected.Fatigue;
  dialog_sort_1.querySelector(".concentration_actuelle").value = m_selected.Concentration;
  dialog_sort_1.querySelector(".fatigue_max").textContent = model.Fatigue;
  dialog_sort_1.querySelector(".concentration_max").textContent = model.Concentration;
  dialog_sort_1.querySelector(".fatigue_cout").value = sort.Niveau;
  dialog_sort_1.querySelector(".concentration_cout").value = sort.Niveau;

  // Réinitialisation des sélections
  dialog_sort_1.querySelector(".sort_radio1").checked = true;
  dialog_sort_1.querySelector(".sort_radio2").checked = false;
  dialog_sort_1.querySelector(".sort_radio3").checked = false;
  dialog_sort_1.querySelector(".sort_radio0").checked = false;

  dialog_sort_1.querySelector(".fatigue_cout").disabled = true;
  dialog_sort_1.querySelector(".concentration_cout").disabled = true;

  dialog_sort_1.showModal();
}

/**
 * Affiche le dialogue de confirmation d'un sort
 */
function affiche_confirm_sort() {
  const magicien = Pions.find((p) => p.Attaquant);
  const sel_etat_succes = dialog_sort_2.querySelector("#sel_etat_succes");
  const sel_etat_echec = dialog_sort_2.querySelector("#sel_etat_echec");

  // Récupération du sort en cours de lancement
  const sort = Sorts.find((s) => s.Nom_liste === magicien.Nom_liste && s.Nom_sort === magicien.Nom_sort);

  // Calcul du nombre de modulations
  const competence_mage = magicien.get_competence("Maîtriser la magie");
  const competence_pretre = magicien.get_competence("Théognosie");
  let modulations = Math.max(competence_pretre, competence_mage);
  modulations = Math.floor((modulations - 4) / 2);
  if (magicien.Concentration_sort === 2 * sort.Niveau) modulations += 2;
  if (magicien.Concentration_sort === 3 * sort.Niveau) modulations += 4;

  // Initialisation des champs du dialogue
  dialog_sort_2.querySelector(".titre").textContent = magicien.Titre;
  dialog_sort_2.querySelector(".modulations").textContent = modulations;
  dialog_sort_2.querySelector(".nom_liste").textContent = magicien.Nom_liste;
  dialog_sort_2.querySelector(".nom_sort").textContent = magicien.Nom_sort;

  // Définition des valeurs et simulation des événements input
  const prompt_save = dialog_sort_2.querySelector(".prompt_save");
  prompt_save.value = sort.Sauvegarde;
  prompt_save.dispatchEvent(new Event("input", { bubbles: true }));

  // Définition des valeurs et simulation des événements input pour les dégâts
  let bonus_sort = Bonus_sorts.find((b) =>
    b.Nom_bonus === "Dégâts" &&
    b.Nom_liste === magicien.Nom_liste &&
    b.Nom_sort === magicien.Nom_sort);
  const prompt_degats = dialog_sort_2.querySelector(".prompt_degats");
  if (bonus_sort !== null && typeof bonus_sort !== "undefined") {
    prompt_degats.value = bonus_sort.Valeur;
  }
  else {
    prompt_degats.value = "-";
  }
  prompt_degats.dispatchEvent(new Event("input", { bubbles: true }));

  // Définition des valeurs et simulation des événements input pour les dégâts généraux
  bonus_sort = Bonus_sorts.find((b) =>
    b.Nom_bonus === "Type dégâts" &&
    b.Nom_liste === magicien.Nom_liste &&
    b.Nom_sort === magicien.Nom_sort &&
    b.Valeur === "Localisés");
  const sel_degats = dialog_sort_2.querySelector(".sel_degats");
  if (bonus_sort !== null && typeof bonus_sort !== "undefined") {
    sel_degats.value = "1";
  }
  else {
    sel_degats.value = "0";
  }

  // Définition des valeurs et simulation des événements input pour la durée de réussite
  bonus_sort = Bonus_sorts.find((b) =>
    b.Nom_bonus === "Durée" &&
    b.Nom_liste === magicien.Nom_liste &&
    b.Nom_sort === magicien.Nom_sort &&
    b.Succes);
  const prompt_duree_succes = dialog_sort_2.querySelector(".prompt_duree_succes");
  if (bonus_sort !== null && typeof bonus_sort !== "undefined") {
    prompt_duree_succes.value = bonus_sort.Valeur;
  }
  else {
    prompt_duree_succes.value = sort.Duree;
  }
  prompt_duree_succes.dispatchEvent(new Event("input", { bubbles: true }));

  // Définition des valeurs et simulation des événements input pour la durée d'échec
  bonus_sort = Bonus_sorts.find((b) =>
    b.Nom_bonus === "Durée" &&
    b.Nom_liste === magicien.Nom_liste &&
    b.Nom_sort === magicien.Nom_sort &&
    !b.Succes);
  const prompt_duree_echec = dialog_sort_2.querySelector(".prompt_duree_echec");
  if (bonus_sort !== null && typeof bonus_sort !== "undefined") {
    prompt_duree_echec.value = bonus_sort.Valeur;
  }
  else {
    prompt_duree_echec.value = sort.Duree;
  }
  prompt_duree_echec.dispatchEvent(new Event("input", { bubbles: true }));

  // Nettoyage et ajout d'une option vide
  dialog_sort_2.querySelector("#armures").innerHTML = "";
  dialog_sort_2.querySelector("#competences").innerHTML = "";
  dialog_sort_2.querySelector("#attributs").innerHTML = "";
  dialog_sort_2.querySelector("#divers").innerHTML = "";
  while (sel_etat_succes.options.length > 0) sel_etat_succes.removeChild(sel_etat_succes.lastChild);
  while (sel_etat_echec.options.length > 0) sel_etat_echec.removeChild(sel_etat_echec.lastChild);

  // Ajout d'une option vide dans les Etats de réussite et d'échec
  let nouvelleOption = document.createElement("option");
  nouvelleOption.value = "";
  nouvelleOption.textContent = "";
  sel_etat_succes.appendChild(nouvelleOption);
  sel_etat_echec.appendChild(nouvelleOption.cloneNode(true));

  // Ajout des options pour les Etats de réussite et d'échec
  ListeBonus.filter((bonus) => bonus.Nature === "Etat").forEach((bonus) => {
    nouvelleOption = document.createElement("option");
    nouvelleOption.value = bonus.Nom_bonus;
    nouvelleOption.textContent = bonus.Nom_bonus;
    sel_etat_succes.appendChild(nouvelleOption);
    sel_etat_echec.appendChild(nouvelleOption.cloneNode(true));

    // Récupération de la valeur du bonus en cas de réussite
    const bonus_sort_succes = Bonus_sorts.find((b) =>
      b.Nom_bonus === bonus.Nom_bonus &&
      b.Nom_liste === magicien.Nom_liste &&
      b.Nom_sort === magicien.Nom_sort &&
      b.Succes);
    if (bonus_sort_succes !== null && typeof bonus_sort_succes !== "undefined") {
      sel_etat_succes.value = bonus.Nom_bonus;
    }

    // Récupération de la valeur du bonus en cas d'échec
    const bonus_sort_echec = Bonus_sorts.find((b) =>
      b.Nom_bonus === bonus.Nom_bonus &&
      b.Nom_liste === magicien.Nom_liste &&
      b.Nom_sort === magicien.Nom_sort &&
      !b.Succes);
    if (bonus_sort_echec !== null && typeof bonus_sort_echec !== "undefined") {
      sel_etat_echec.value = bonus.Nom_bonus;
    }
  });

  // Ajout des options pour les autres types de bonus
  ListeBonus.filter((bonus) => bonus.Nature !== "Etat" && bonus.Ordre >= 0).forEach((bonus) => {
    // Création du div pour le bonus
    const div = document.createElement("div");
    div.id = "div_" + bonus.Nom_bonus.toLowerCase().replaceAll(" ", "_");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";

    // Création du titre du bonus
    const titre = document.createElement("span");
    titre.id = "titre_" + bonus.Nom_bonus.toLowerCase().replaceAll(" ", "_");
    titre.innerHTML = bonus.Nom_bonus + " :&nbsp;";
    div.appendChild(titre);

    // Récupération de la valeur du bonus en cas de réussite
    let valeur_succes = "";
    const bonus_sort_succes = Bonus_sorts.find((b) =>
      b.Nom_bonus === bonus.Nom_bonus &&
      b.Nom_liste === magicien.Nom_liste &&
      b.Nom_sort === magicien.Nom_sort &&
      b.Succes);
    if (bonus_sort_succes !== null && typeof bonus_sort_succes !== "undefined")
      valeur_succes = bonus_sort_succes.Valeur;

    // Récupération de la valeur du bonus en cas d'échec
    let valeur_echec = "";
    const bonus_sort_echec = Bonus_sorts.find((b) =>
      b.Nom_bonus === bonus.Nom_bonus &&
      b.Nom_liste === magicien.Nom_liste &&
      b.Nom_sort === magicien.Nom_sort &&
      !b.Succes);
    if (bonus_sort_echec !== null && typeof bonus_sort_echec !== "undefined")
      valeur_echec = bonus_sort_echec.Valeur;

    // Création d'un conteneur pour les 2 champs (positionnés à droite)
    const conteneurChamps = document.createElement("div");
    conteneurChamps.style.display = "flex";
    conteneurChamps.style.alignItems = "center";
    conteneurChamps.style.gap = "10px";
    conteneurChamps.style.marginLeft = "auto";

    // Création du champ du Bonus en cas de réussite
    const champs_succes = document.createElement("input");
    champs_succes.id = "champs_" + bonus.Nom_bonus.toLowerCase().replaceAll(" ", "_") + "_succes";
    champs_succes.type = "text";
    champs_succes.style.width = "35px";
    champs_succes.style.textAlign = "center";
    champs_succes.style.fontSize = "x-large";
    champs_succes.style.backgroundColor = "rgb(192, 255, 192)";
    champs_succes.value = valeur_succes;
    conteneurChamps.appendChild(champs_succes);

    // Création du champ du Bonus en cas d'échec
    const champs_echec = champs_succes.cloneNode(true);
    champs_echec.id = "champs_" + bonus.Nom_bonus.toLowerCase().replaceAll(" ", "_") + "_echec";
    champs_echec.style.backgroundColor = "rgb(255, 192, 192)";
    champs_echec.value = valeur_echec;
    conteneurChamps.appendChild(champs_echec);

    // Ajout du conteneur à la div principale
    div.appendChild(conteneurChamps);

    switch (bonus.Nature) {
      case "Armure":
        dialog_sort_2.querySelector("#armures").appendChild(div);
        break;
      case "Compétence":
        dialog_sort_2.querySelector("#competences").appendChild(div);
        break;
      case "Attribut":
        dialog_sort_2.querySelector("#attributs").appendChild(div);
        break;
      case "Divers":
        dialog_sort_2.querySelector("#divers").appendChild(div);
        break;
    }
  });

  dialog_sort_2.showModal();
}

// === ÉVÉNEMENTS POUR LES MODÈLES DE PJ ===
// Gestion de l'affichage du modèle de PJ
function affiche_model() {
  const model = Models.find((m) => m.Nom_model === m_selected.Model);

  // Remplissage des champs du modèle
  dialog_model.querySelector(".nom_model").textContent = model.Nom_model;
  dialog_model.querySelector(".race_select").value = model.Race.toLowerCase();
  dialog_model.querySelector(".magie_select").value = model.Magie_type.toLowerCase();

  dialog_model.querySelector(".force_score").value = model.Force;
  dialog_model.querySelector(".constitution_score").value = model.Constitution;
  dialog_model.querySelector(".vivacite_physique_score").value = model.Vivacite_physique;
  dialog_model.querySelector(".perception_score").value = model.Perception;

  dialog_model.querySelector(".vivacite_mentale_score").value = model.Vivacite_mentale;
  dialog_model.querySelector(".volonte_score").value = model.Volonte;
  dialog_model.querySelector(".abstraction_score").value = model.Abstraction;
  dialog_model.querySelector(".charisme_score").value = model.Charisme;

  dialog_model.querySelector(".adaptation_score").value = model.Adaptation;
  dialog_model.querySelector(".combat_score").value = model.Combat;
  dialog_model.querySelector(".foi_score").value = model.Foi;
  dialog_model.querySelector(".magie_score").value = model.Magie;
  dialog_model.querySelector(".memoire_score").value = model.Memoire;
  dialog_model.querySelector(".telepathie_score").value = model.Telepathie;

  dialog_model.querySelector(".force_experience").value = model.Force_experience;
  dialog_model.querySelector(".constitution_experience").value = model.Constitution_experience;
  dialog_model.querySelector(".vivacite_physique_experience").value = model.Vivacite_physique_experience;
  dialog_model.querySelector(".perception_experience").value = model.Perception_experience;

  dialog_model.querySelector(".vivacite_mentale_experience").value = model.Vivacite_mentale_experience;
  dialog_model.querySelector(".volonte_experience").value = model.Volonte_experience;
  dialog_model.querySelector(".abstraction_experience").value = model.Abstraction_experience;
  dialog_model.querySelector(".charisme_experience").value = model.Charisme_experience;

  dialog_model.querySelector(".adaptation_experience").value = model.Adaptation_experience;
  dialog_model.querySelector(".combat_experience").value = model.Combat_experience;
  dialog_model.querySelector(".foi_experience").value = model.Foi_experience;
  dialog_model.querySelector(".magie_experience").value = model.Magie_experience;
  dialog_model.querySelector(".memoire_experience").value = model.Memoire_experience;
  dialog_model.querySelector(".telepathie_experience").value = model.Telepathie_experience;

  // Centre tous les inputs & met à jour les ajustements
  dialog_model.querySelectorAll("input").forEach((input) => {
    if (input.className.includes("_experience") ||
      input.className.includes("_race") ||
      input.className.includes("_ajustement") ||
      input.className.includes("_score")) {
      input.style.fontSize = "x-large";
      input.style.textAlign = "center";
      input.style.width = "35px";
      input.closest("td").style.textAlign = "center";
    }
    if (input.className.includes("_score")) {
      // Simule un changement de score pour mettre à jour les ajustements
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);
    }
  });

  // Simule un changement de race pour mettre à jour les attributs _race
  const event = new Event("change", { bubbles: true });
  dialog_model.querySelector(".race_select").dispatchEvent(event);

  // Afficher la modale
  dialog_model.showModal();
}

// === ÉVÉNEMENTS GÉNÉRAUX ===
// Tooltips pour les boutons de terrain, formes et coordonnées
document.addEventListener("mouseover", function (event) {
  if (["rocher", "arbre", "eau", "gomme_t",
    "rectangle", "ellipse", "mur", "scission", "gomme_f",
    "coordonnees", "forme_color", "portee_vue"].includes(event.target.id)) {
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY + 10 + "px";
    tooltip.style.display = "block";
    if (event.target.id === "forme_color") {
      tooltip.innerHTML = "Couleur de la forme";
    } else {
      tooltip.innerHTML = event.target.alt;
    }
  }
});

// Tooltips pour les boutons de terrain, formes et coordonnées
document.addEventListener("mouseout", function (event) {
  if (["rocher", "arbre", "eau", "gomme_t",
    "rectangle", "ellipse", "mur", "scission", "gomme_f",
    "coordonnees", "forme_color"].includes(event.target.id)) {
    tooltip.style.display = "none";
  }
});



/* ************************************************* */
/* ****************** A EFFACER ******************** */
/* ************************************************* */

function to_delete_initialise_model() {
  const dialog_model = document.getElementById("dialog_model");

  // Quand on change la race dans la modale modèle PJ, on met à jour les attributs _race
  dialog_model.querySelector(".race_select").addEventListener("change", function () {
    const race = dialog_model.querySelector(".race_select").value;
    const attr = attributs_races[race];

    // Remplir les champs *_race de la modale
    dialog_model.querySelector(".force_race").value = attr.force;
    dialog_model.querySelector(".constitution_race").value = attr.constitution;
    dialog_model.querySelector(".vivacite_physique_race").value = attr.vivacite_physique;
    dialog_model.querySelector(".perception_race").value = attr.perception;

    dialog_model.querySelector(".vivacite_mentale_race").value = attr.vivacite_mentale;
    dialog_model.querySelector(".volonte_race").value = attr.volonte;
    dialog_model.querySelector(".abstraction_race").value = attr.abstraction;
    dialog_model.querySelector(".charisme_race").value = attr.charisme;

    dialog_model.querySelector(".adaptation_race").value = attr.adaptation;
    dialog_model.querySelector(".combat_race").value = attr.combat;
    dialog_model.querySelector(".foi_race").value = attr.foi;
    dialog_model.querySelector(".magie_race").value = attr.magie;
    dialog_model.querySelector(".memoire_race").value = attr.memoire;
    dialog_model.querySelector(".telepathie_race").value = attr.telepathie;
  });

  // Gestion du changement des scores et des expériences
  dialog_model.addEventListener("change", function (event) {
    if (!event.target.className.includes("_score") && !event.target.className.includes("_experience"))
      return;

    // On garde seulement les chiffres
    event.target.value = event.target.value.replace(/[^0-9]/g, "");

    // La suite ne s'applique que si c'est un score
    if (!event.target.className.includes("_score")) return;

    // On calcule l'ajustement
    dialog_model.querySelector(`.${event.target.className.replace("_score", "_ajustement")}`).value =
      Math.floor((parseInt(event.target.value) - 10) / 2);

    // On met à jour les 4 éléments calculés et leur 4 ajustements
    dialog_model.querySelector(".niveau_physique_score").value = Math.round((
      parseInt(dialog_model.querySelector(".force_score").value) +
      parseInt(dialog_model.querySelector(".constitution_score").value) +
      parseInt(dialog_model.querySelector(".vivacite_physique_score").value) +
      parseInt(dialog_model.querySelector(".perception_score").value)) / 4);

    dialog_model.querySelector(".niveau_physique_ajustement").value = Math.floor((
      dialog_model.querySelector(".niveau_physique_score").value - 10) / 2);

    dialog_model.querySelector(".niveau_mental_score").value = Math.round((
      parseInt(dialog_model.querySelector(".volonte_score").value) +
      parseInt(dialog_model.querySelector(".abstraction_score").value) +
      parseInt(dialog_model.querySelector(".vivacite_mentale_score").value) +
      parseInt(dialog_model.querySelector(".charisme_score").value)) / 4);

    dialog_model.querySelector(".niveau_mental_ajustement").value = Math.floor((
      dialog_model.querySelector(".niveau_mental_score").value - 10) / 2);

    dialog_model.querySelector(".coordination_score").value = Math.round((
      parseInt(dialog_model.querySelector(".vivacite_physique_score").value) +
      parseInt(dialog_model.querySelector(".perception_score").value) +
      parseInt(dialog_model.querySelector(".vivacite_mentale_score").value)) / 3);

    dialog_model.querySelector(".coordination_ajustement").value = Math.floor((
      dialog_model.querySelector(".coordination_score").value - 10) / 2);

    dialog_model.querySelector(".sixieme_sens_score").value = Math.round((
      parseInt(dialog_model.querySelector(".adaptation_score").value) +
      parseInt(dialog_model.querySelector(".perception_score").value)) / 2);

    dialog_model.querySelector(".sixieme_sens_ajustement").value = Math.floor((
      dialog_model.querySelector(".sixieme_sens_score").value - 10) / 2);
  });

  // Bouton "Enregistrer" (Enregistre les modifications du modèle)
  dialog_model.querySelector(".sauvegarder").addEventListener("click", function (event) {
    // Récupération du modèle
    const Nom_model = dialog_model.querySelector(".nom_model").textContent;
    const model = Models.find((m) => m.Nom_model === Nom_model);

    // Enregistrement de la race
    const raceOption = dialog_model.querySelector(".race_select").value;
    model.Race = raceOption.charAt(0).toUpperCase() + raceOption.slice(1);
    sendMessage("Set", "Race@" + model.Race + "@Model@" + model.Nom_model);

    // Enregistrement du type de magie
    const magieOption = dialog_model.querySelector(".magie_select").value;
    model.Magie_type = magieOption.charAt(0).toUpperCase() + magieOption.slice(1);
    sendMessage("Set", "Magie_type@" + model.Magie_type + "@Model@" + model.Nom_model);

    // On traite tous les champs "input" du modèle
    dialog_model.querySelectorAll("input").forEach((input) => {
      // Si le champ est désactivé, on ne fait rien
      if (input.disabled) return;

      // Si le champ n'est pas un attribut _experience ou _score, on ne fait rien
      if (!input.className.includes("_experience") && !input.className.includes("_score")) return;

      // Enregistrement des attributs _experience et _score
      const attribut = input.className.charAt(0).toUpperCase() + input.className.replace(/_score/, "").slice(1);
      model[attribut] = input.value;
      sendMessage("Set", attribut + "@" + model[attribut] + "@Model@" + model.Nom_model);
    });
  });
}
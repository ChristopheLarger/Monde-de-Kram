/**
 * FICHIER DLG_PERSOS.JS
 * ==================
 * Gestion des dialogues et interfaces utilisateur pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour afficher et gérer les dialogues des personnages
 */

// === VARIABLES GLOBALES ===
let m_pion = null; // Personnage actuellement sélectionné
let m_model = null; // Modèle actuellement sélectionné

/**
 * Affiche les informations des armes sélectionnées
 */
function info_armes() {
  let score1 = null;
  let score2 = null;

  // Bonus de competence d'arme
  if (m_pion.Arme1 !== "" && m_pion.Arme1 !== "Lancement de sort")
    score1 = m_pion.get_stat_combat("Attaque_1");
  if (m_pion.Arme2 !== "" && m_pion.Arme2 !== "Lancement de sort")
    score2 = m_pion.get_stat_combat("Attaque_2");

  // Malus d'escrime pour combat à deux armes
  if (score1 !== null && score2 !== null) {
    if (m_pion.Arme1 !== "Bouclier" && m_pion.Arme2 !== "Bouclier") {
      if (m_pion.Arme1 === "Dague" || m_pion.Arme2 === "Dague") {
        score1 -= Math.max(2 - m_pion.get_stat_combat("Escrime"), 0);
        score2 -= Math.max(2 - m_pion.get_stat_combat("Escrime"), 0);
      } else {
        score1 -= Math.max(6 - m_pion.get_stat_combat("Escrime"), 0);
        score2 -= Math.max(6 - m_pion.get_stat_combat("Escrime"), 0);
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
    a.Model === m_pion.Model &&
    a.Indice === m_pion.Indice &&
    a.Timing > Nb_rounds * 5 &&
    a.Competence !== null);
  const index = Attaques.indexOf(Etats[i]);
  Attaques.splice(index, 1);
  affiche_pion();
}

/**
 * Affichage du détails des champs du pion lors de l'affichage de l'image zoom du pion
 */
document.addEventListener("DOMContentLoaded", function () { initialise_pion(); });
function initialise_pion() {
  /**
   * Callback pour la gestion des inputs des cases à cocher des zones de blessures
   * @param {Event} event - L'événement de l'input
   */
  function input_cb_blessures(event) {
    const model_object = Models.find((x) => x.Nom_model === m_pion.Model);
    const seuil_blessures = model_object.get("seuil_blessures");
    let zone = event.target.classList.item(0).slice(0, -3);
    zone = zone.charAt(0).toUpperCase() + zone.slice(1);

    if (event.target.classList.item(0).includes("_X1")) {
      if (event.target.checked) {
        if (m_pion[zone] < seuil_blessures) m_pion[zone] = seuil_blessures;
      }
      else {
        if (m_pion[zone] >= seuil_blessures) m_pion[zone] = seuil_blessures - 1;
      }
    }
    else if (event.target.classList.item(0).includes("_X2")) {
      if (event.target.checked) {
        if (m_pion[zone] < 2 * seuil_blessures) m_pion[zone] = 2 * seuil_blessures;
      }
      else {
        if (m_pion[zone] >= 2 * seuil_blessures) m_pion[zone] = 2 * seuil_blessures - 1;
      }
    }
    else if (event.target.classList.item(0).includes("_X3")) {
      if (event.target.checked) {
        if (m_pion[zone] < 3 * seuil_blessures) m_pion[zone] = 3 * seuil_blessures;
      }
      else {
        if (m_pion[zone] >= 3 * seuil_blessures) m_pion[zone] = 3 * seuil_blessures - 1;
      }
    }
    document.querySelector("#div_pion ." + zone.toLowerCase() + "_pdv").value = m_pion[zone];
    m_pion.sendMessage(zone);
    set_nb_blessures();
  }

  if ((m_pion === null || typeof m_pion === "undefined") && (Pions.length > 0)) {
    m_pion = Pions[0];
    Pions.forEach(p => { p.Selected = false; });
    m_pion.Selected = true;
    affiche_pion();
    Map.generateHexMap();
    Map.drawHexMap();
    Map.drawHexMap(true);
  }

  ["general", "tete", "brasg", "brasd", "poitrine", "abdomen", "jambeg", "jambed"].forEach(zone => {
    document.querySelector("#div_pion ." + zone + "_X1").addEventListener("input", input_cb_blessures);
    document.querySelector("#div_pion ." + zone + "_X2").addEventListener("input", input_cb_blessures);
    if (zone === "general") document.querySelector("#div_pion .general_X3").addEventListener("input", input_cb_blessures);

    document.querySelector("#div_pion ." + zone + "_pdv").addEventListener("input", function (event) {
      const zone = event.target.classList.item(0).replace("_pdv", "");
      const cible = zone.charAt(0).toUpperCase() + zone.slice(1);
      m_pion[cible] = event.target.value;
      m_pion.sendMessage(cible);
      set_nb_blessures();
    });
  });

  // Mise à jour de la concentration et de la fatigue
  document.querySelector("#div_pion .concentration").addEventListener("input", function (event) {
    m_pion.Concentration = event.target.value;
    m_pion.sendMessage("Concentration");
  });

  document.querySelector("#div_pion .fatigue").addEventListener("input", function (event) {
    m_pion.Fatigue = event.target.value;
    m_pion.sendMessage("Fatigue");
  });

  // Mise à jour du nom et de l'allié
  document.querySelector("#div_pion .nom").addEventListener("input", function (event) {
    m_pion.Titre = event.target.value;
    m_pion.sendMessage("Titre");
  });

  document.querySelector("#div_pion .allie").addEventListener("input", function (event) {
    m_pion.Type = event.target.checked ? "allies" : "ennemis";
    m_pion.sendMessage("Type");
    Map.generateHexMap();
    Map.drawHexMap();
  });

  // Mise à jour du lien vers le modele
  document.querySelector("#div_pion .modele_link").addEventListener("click", function (event) {
    m_model = Models.find((m) => m.Nom_model === m_pion.Model);
    affiche_model();
  });

  // Mise à jour de l'auto
  document.querySelector("#div_pion .auto").addEventListener("input", function (event) {
    m_pion.Auto = event.target.checked;
    m_pion.sendMessage("Auto");
    Map.generateHexMap();
    Map.drawHexMap();
  });

  // Mise à jour de l'arme principale
  document.querySelector("#div_pion .arme_principale").addEventListener("change", function (event) {
    return document.querySelector("#div_pion .arme_principale").click();
  });

  document.querySelector("#div_pion .arme_principale").addEventListener("click", function (event) {
    // Vérifier si la souris est au-dessus du select au moment du clic
    const arme1 = document.querySelector("#div_pion .arme_principale");
    const arme2 = document.querySelector("#div_pion .arme_secondaire");
    const rect = arme1.getBoundingClientRect();
    const isClickInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    // Ouvrir la modale de magie si "Lancement de sort" est sélectionné
    if (arme1.value === "Lancement de sort") {
      if (!isClickInside) affiche_roue_magie();
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
      m_pion.Nom_liste = null;
      m_pion.Nom_sort = null;
      m_pion.Incantation = 0;
      m_pion.Fatigue_sort = 0;
      m_pion.Concentration_sort = 0;
      m_pion.sendMessage("Nom_liste");
      m_pion.sendMessage("Nom_sort");
      m_pion.sendMessage("Incantation");
      m_pion.sendMessage("Fatigue_sort");
      m_pion.sendMessage("Concentration_sort");
    }

    // Mise à jour des armes sélectionnées
    m_pion.Arme1 = arme1.value;
    m_pion.Arme2 = arme2.value;
    m_pion.sendMessage("Arme1");
    m_pion.sendMessage("Arme2");

    // Mise à jour de l'information affichée
    info_armes();

    affiche_pion();
  });

  // Mise à jour de l'arme secondaire
  document.querySelector("#div_pion .arme_secondaire").addEventListener("change", function (event) {
    m_pion.Arme2 = event.target.value;
    m_pion.sendMessage("Arme2");
    info_armes();
  });

  // Mise à jour de la note
  document.querySelector("#div_pion .note").addEventListener("input", function (event) {
    m_pion.Note = event.target.value;
    m_pion.sendMessage("Note");
  });

  // Action sur le bouton de duplication du personnage
  document.querySelector("#div_pion .dupliquer").addEventListener("click", function (event) {
    m_pion.dupliquer();
  });

  // On fige les dimensions des zooms du pion, des div_model_X
  window.addEventListener("load", function () {
    const pion = document.getElementById("div_pion");
    const model = document.getElementById("div_model");
    let divX = [];
    for (let i = 0; i < 7; i++) divX.push(document.getElementById("div_model_" + i));

    // Sauvegarde des styles actuels
    const disp = pion.style.display;
    const dism = model.style.display;
    let disX = [];
    divX.forEach((div) => {
      disX.push(div.style.display);
    });

    document.querySelector("#div_model_4 .avantages").style.display = "none";
    document.querySelector("#div_model_6 .desavantages").style.display = "none";

    // Uniformisation de la largeur des panels
    [pion, model, ...divX].forEach((panel) => {
      panel.style.display = "block";
      panel.style.width = "auto";
    });

    let largeur = pion.offsetWidth;
    divX.forEach((panel) => {
      panel.style.display = "block";
      if (model.offsetWidth > largeur) largeur = model.offsetWidth;
      panel.style.display = "none";
    });

    [pion, model].forEach((panel) => {
      panel.style.width = (largeur + 12) + "px"; // Pourquoi le +9 est-il nécessaire ?
    });

    document.querySelector("#div_model_5 .competences").style.display = "none";

    // Uniformisation de la largeur des panels
    [...divX].forEach((panel) => {
      panel.style.display = "none";
      panel.style.height = "auto";
    });

    let h = [];
    let hauteur = pion.offsetHeight;
    divX.forEach((panel) => {
      panel.style.display = "block";
      h.push(model.offsetHeight);
      if (model.offsetHeight > hauteur) hauteur = model.offsetHeight;
      panel.style.display = "none";
    });

    [pion, model].forEach((panel) => {
      panel.style.height = (hauteur + 35) + "px"; // Pourquoi le +35 est-il nécessaire ?
    });

    // Réaffichage des zone à scroll vertical et dimensionnement du textarea
    document.querySelector("#div_model_1 .capacites_monstre").style.display = "";
    document.querySelector("#div_model_1 .capacites_monstre").style.height = (hauteur - h[1] + 35 - 9) + "px";

    document.querySelector("#div_model_5 .competences").style.display = "";
    document.querySelector("#div_model_5 .competences").style.height = (hauteur - h[2] - 9) + "px";

    document.querySelector("#div_model_4 .avantages").style.display = "";
    document.querySelector("#div_model_4 .avantages").style.height = (hauteur - h[4] - 9) + "px";

    document.querySelector("#div_model_6 .desavantages").style.display = "";
    document.querySelector("#div_model_6 .desavantages").style.height = (hauteur - h[6] - 9) + "px";

    // Mise à jour de la largeur des zones de blessures : input à la largeur du texte
    ["general", "tete", "poitrine", "brasg", "brasd", "abdomen", "jambeg", "jambed"].forEach((el) => {
      pion.querySelector("." + el).style.width = '0';
      pion.querySelector("." + el).style.width = (pion.querySelector("." + el).scrollWidth + 8) + 'px';
    });

    // Restauration des styles sauvegardés
    pion.style.display = disp;
    model.style.display = dism;
    for (let i = 0; i < divX.length; i++) divX[i].style.display = disX[i];
  });
}

function set_nb_blessures() {
  const model_object = Models.find((x) => x.Nom_model === m_pion.Model);
  const seuil_blessures = model_object.get("seuil_blessures");
  let nb_blessures = 0;

  ["general", "tete", "brasg", "brasd", "poitrine", "abdomen", "jambeg", "jambed"].forEach(zone => {
    if (document.querySelector("#div_pion ." + zone + "_pdv").value >= seuil_blessures) {
      document.querySelector("#div_pion ." + zone + "_X1").checked = true;
      nb_blessures++;
    }
    else {
      document.querySelector("#div_pion ." + zone + "_X1").checked = false;
    }

    if (document.querySelector("#div_pion ." + zone + "_pdv").value >= 2 * seuil_blessures) {
      document.querySelector("#div_pion ." + zone + "_X2").checked = true;
      nb_blessures++;
    }
    else {
      document.querySelector("#div_pion ." + zone + "_X2").checked = false;
    }

    if (zone === "general") {
      if (document.querySelector("#div_pion .general_pdv").value >= 3 * seuil_blessures) {
        document.querySelector("#div_pion .general_X3").checked = true;
        nb_blessures++;
      }
      else {
        document.querySelector("#div_pion .general_X3").checked = false;
      }
    }

    // Mise à jour de la couleur de la zone
    if (document.querySelector("#div_pion ." + zone + "_pdv").value == 0) {
      document.querySelector("#div_pion ." + zone).style.backgroundColor = 'white';
    }
    else if (document.querySelector("#div_pion ." + zone + "_pdv").value < seuil_blessures) {
      document.querySelector("#div_pion ." + zone).style.backgroundColor = 'lightgreen';
    }
    else if (document.querySelector("#div_pion ." + zone + "_pdv").value < 2 * seuil_blessures) {
      if (zone === "general") {
        document.querySelector("#div_pion ." + zone).style.backgroundColor = 'rgb(192, 192, 255)';
      }
      else {
        document.querySelector("#div_pion ." + zone).style.backgroundColor = 'lightcoral';
      }
    }
    else if (document.querySelector("#div_pion ." + zone + "_pdv").value < 3 * seuil_blessures) {
      if (zone === "general") {
        document.querySelector("#div_pion ." + zone).style.backgroundColor = 'lightcoral';
      }
      else {
        document.querySelector("#div_pion ." + zone).style.backgroundColor = 'rgb(20, 20, 20)';
      }
    }
    else {
      document.querySelector("#div_pion ." + zone).style.backgroundColor = 'rgb(20, 20, 20)';
    }
  });

  // Vérification de l'aptitude au combat
  let apte = nb_blessures < model_object.get("nb_blessures_max");

  if (document.querySelector("#div_pion .tete_X2").checked) apte = false;
  if (document.querySelector("#div_pion .poitrine_X2").checked) apte = false;
  if (document.querySelector("#div_pion .abdomen_X2").checked) apte = false;

  document.querySelector("#div_pion .msg_aptitude").textContent = apte ? "Apte au combat" : "Inapte au combat";
  document.querySelector("#div_pion .msg_aptitude").style.color = apte ? "rgb(64, 64, 230)" : "red";
}

/**
 * Rafraîchit les détails du pion dans la fenetre de dialogue
 */
function affiche_pion(col = null, row = null) {
  m_model = null;
  document.getElementById('div_pion').style.display = 'block';
  document.getElementById('div_model').style.display = 'none';

  if (m_pion === null || typeof m_pion === "undefined") {
    affiche_new_pion(col, row);
    return;
  }

  if (Pions.length === 0) return;

  const model_object = Models.find((x) => x.Nom_model === m_pion.Model);

  // Mise à jour des seuils de blessures, nombre de blessures max et aptitude
  document.querySelector("#div_pion .seuil_blessures").value = model_object.get("seuil_blessures");
  document.querySelector("#div_pion .nb_blessures_max").value = model_object.get("nb_blessures_max");

  // Mise à jour des points de vie et de l'armure
  document.querySelector("#div_pion .general_pdv").value = m_pion.General;
  document.querySelector("#div_pion .general_armure").value = model_object.getArmureGenerale();

  ["tete", "brasg", "brasd", "poitrine", "abdomen", "jambeg", "jambed"].forEach(zone => {
    document.querySelector("#div_pion ." + zone + "_pdv").value = m_pion[zone.charAt(0).toUpperCase() + zone.slice(1)];
    document.querySelector("#div_pion ." + zone + "_armure").value = model_object["Armure_" + zone];
  });

  set_nb_blessures();

  // Mise à jour de la concentration et de la fatigue
  document.querySelector("#div_pion .concentration").value = m_pion.Concentration;
  document.querySelector("#div_pion .concentration_max").value = model_object.get("concentration");
  document.querySelector("#div_pion .fatigue").value = m_pion.Fatigue;
  document.querySelector("#div_pion .fatigue_max").value = model_object.get("fatigue");

  // Mise à jour du nom
  document.querySelector("#div_pion .nom").value = m_pion.Titre;

  // Mise à jour de l'allié
  document.querySelector("#div_pion .allie").checked = m_pion.Type === "allies";

  // Mise à jour du modèle
  const model = document.querySelector("#div_pion .modele");
  model.innerHTML = "";
  for (let i = 0; i < Models.length; i++) {
    let nouvelleOption = document.createElement("option");
    nouvelleOption.value = Models[i].Nom_model;
    nouvelleOption.textContent = Models[i].Nom_model;
    model.appendChild(nouvelleOption);
  }
  model.value = model_object.Nom_model;

  // Mise à jour de l'auto
  document.querySelector("#div_pion .auto").checked = m_pion.Auto;

  // Mise à jour de l'arme principale
  const arme1 = document.querySelector("#div_pion .arme_principale");

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
    if (arme.Is_personnel && arme.Nom_arme !== m_pion.Model) return;
    if (arme.Nom_arme === "Bouclier") return;

    nouvelleOption = document.createElement("option");
    nouvelleOption.value = arme.Nom_arme;
    nouvelleOption.textContent = arme.Nom_arme;
    arme1.appendChild(nouvelleOption);
  });

  // Mise à jour de l'arme principale
  arme1.value = m_pion.Arme1;

  // Mise à jour de l'arme secondaire
  const arme2 = document.querySelector("#div_pion .arme_secondaire");

  // Nettoyage et ajout d'une option vide
  while (arme2.options.length > 0) arme2.removeChild(arme2.lastChild);

  // Ajout d'une option vide
  nouvelleOption = document.createElement("option");
  nouvelleOption.value = "";
  nouvelleOption.textContent = "--";
  arme2.appendChild(nouvelleOption);

  // Gestion spéciale pour le lancement de sort et les armes à deux mains
  const w1 = Armes.find((x) => x.Nom_arme === arme1.value);
  if (arme1.value === "Lancement de sort" || (w1 && typeof w1 !== "undefined" && w1.Deux_mains)) {
    arme2.value = "";
  }
  else {
    // Ajout des armes disponibles du modèle en 2nde main
    Armes.forEach((arme) => {
      if (arme.Is_personnel && arme.Nom_arme !== m_pion.Model) return;
      if (arme.Deux_mains) return;

      nouvelleOption = document.createElement("option");
      nouvelleOption.value = arme.Nom_arme;
      nouvelleOption.textContent = arme.Nom_arme;
      arme2.appendChild(nouvelleOption);
    });

    // Sélection de l'arme actuelle si disponible
    arme2.value = m_pion.Arme2;
  }

  // Activation/désactivation du sélecteur d'arme secondaire
  if (arme2.options.length > 1) {
    arme2.disabled = false;
  }
  else {
    arme2.disabled = true;
  }

  // Mise à jour des informations des armes
  info_armes();

  // Mise à jour de la note
  document.querySelector("#div_pion .note").value = m_pion.Note;

  // Mise à jour du sortilège sélectionné
  if (m_pion.Nom_sort !== null &&
    m_pion.Nom_sort !== undefined &&
    m_pion.Nom_sort !== "" &&
    m_pion.Nom_sort !== "null" &&
    m_pion.Nom_liste !== null &&
    m_pion.Nom_liste !== undefined &&
    m_pion.Nom_liste !== "" &&
    m_pion.Nom_liste !== "null") {

    const sort = Sorts.find((s) =>
      s.Nom_liste === m_pion.Nom_liste &&
      s.Nom_sort === m_pion.Nom_sort);

    document.querySelector("#div_pion .info_secondaire").style.display = "none";
    arme2.style.display = "none";

    document.querySelector("#div_pion .liste").textContent = sort.Nom_liste;
    document.querySelector("#div_pion .liste").style.display = "";
    document.querySelector("#div_pion .sort").textContent = sort.Nom_sort;
    document.querySelector("#div_pion .sort").style.display = "";
    document.querySelector("#div_pion .incantation").textContent =
      "(" + m_pion.Incantation + " s / " + expurger_temps_sort(sort.Incantation) + ")";
    document.querySelector("#div_pion .incantation").style.display = "";
    document.querySelector("#div_pion .info_principale").textContent = "";
    document.querySelector("#div_pion .info_secondaire").textContent = "";
  }
  else {
    document.querySelector("#div_pion .info_secondaire").style.display = "";
    arme2.style.display = "";
    document.querySelector("#div_pion .liste").style.display = "none";
    document.querySelector("#div_pion .sort").style.display = "none";
    document.querySelector("#div_pion .incantation").style.display = "none";
  }

  // Mise à jour des états temporaires
  const etats = document.querySelector("#div_pion .etats");
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
    a.Model === m_pion.Model &&
    a.Indice === m_pion.Indice &&
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
      "<img src='images/Supprimer.png' onclick='delete_etat(" + i + ");' alt='Supprimer'" +
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

  // Action sur le bouton de duplication du personnage
  document.querySelector("#div_pion .dupliquer").disabled = model_object.Is_joueur;

  // Affichage de la figurine du modèle
  const fig = document.querySelector('#div_pion .figurine');
  fig.style.display = 'block';
  fig.onload = function () { Map.generateHexMap(); Map.drawHexMap(); };
  if (m_model) fig.src = 'images/Figurines/' + m_model.Nom_model + '.png' + "?t=" + new Date().getTime();
  else if (m_pion) fig.src = 'images/Figurines/' + m_pion.Model + '.png' + "?t=" + new Date().getTime();
  else fig.style.display = 'none';
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
    m_pion = new Pion();
    m_pion.mise_a_jour_pion("ennemis", model.value);

    // Positionnement du pion
    m_pion.Position = col.value + "," + row.value;
    m_pion.sendMessage("Position");
    Pions[Pions.length] = m_pion;

    // Synchronisation avec le serveur
    m_pion.sendMessage("setall");

    dialog_new_pion.close();

    // Affichage des détails du personnage créé
    affiche_pion();

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

  // Ajout des modèles de joueurs comme options
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
 * Initialise les événements de l'en-tête du modèle
 */
function initialise_model_X() {
  document.querySelector("#div_model .nom_model").addEventListener("input", function (event) {
    const model_exists = Models.find((m) => m.Nom_model === this.value);
    if (model_exists || this.value === "") {
      this.style.backgroundColor = "rgb(255, 32, 32)";
      event.stopPropagation();
      return;
    }

    this.style.backgroundColor = "white";
    Pions.forEach((pion) => {
      if (pion.Model === m_model.Nom_model) pion.Model = this.value;
    });

    // Synchronisation avec le serveur
    m_model.sendMessage("set_Nom_model", this.value);
    setTimeout(() => { m_model.Image.src = "Images/Figurines/" + this.value + ".png"; }, 100);
    m_model.Nom_model = this.value;

    // Remplissage de la liste des modèles (à jour avec le nouveau nom du modèle)
    const sel = document.querySelector("#div_model .model_select");
    sel.innerHTML = "";
    Models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model.Nom_model;
      option.textContent = model.Nom_model;
      sel.appendChild(option);
    });
    sel.value = m_model.Nom_model;
  });

  document.querySelector("#div_model .model_select").addEventListener("change", function (event) {
    m_model = Models.find((m) => m.Nom_model === event.target.value);
    let tab_index = 0;
    for (let i = 0; i <= 6; i++) {
      if (document.getElementById('div_model_' + i).style.display === 'block') tab_index = i;
    }
    affiche_model();
    if (tab_index <= 1) tab_index = m_model.Is_monster ? 1 : 0;

    document.getElementById('div_model_0').style.display = 'none';
    document.getElementById('div_model_1').style.display = 'none';
    document.getElementById('div_model_' + tab_index).style.display = 'block';
  });

  document.querySelector("#div_model .retour").addEventListener("click", function () {
    m_model = null;
    affiche_pion();
  });

  // Gestion des onglets du modèle
  document.querySelectorAll("#div_model .tab-model").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tab_index = tab.dataset.tab;

      document.querySelectorAll("#div_model .tab-model").forEach((tab) => {
        tab.classList.remove("active");
        if (tab.dataset.tab === tab_index) {
          tab.classList.add("active");
        }
      });

      document.querySelector("#div_model").style.display = 'block';

      document.querySelector("#div_model_0").style.display = 'none';
      document.querySelector("#div_model_1").style.display = 'none';
      document.querySelector("#div_model_2").style.display = 'none';
      document.querySelector("#div_model_3").style.display = 'none';
      document.querySelector("#div_model_4").style.display = 'none';
      document.querySelector("#div_model_5").style.display = 'none';
      document.querySelector("#div_model_6").style.display = 'none';

      document.querySelector("#div_model .humanoid").style.display = m_model.Is_monster ? 'none' : 'block';
      document.querySelector("#div_model .monstre").style.display = m_model.Is_monster ? 'block' : 'none';

      if (tab_index === "0" || tab_index === "1") {
        document.getElementById('div_model_' + (m_model.Is_monster ? '1' : '0')).style.display = 'block';
      }
      else if (tab_index === "3") {
        update_cout_total();
        if (m_model.Is_monster) {
          document.getElementById('couts_table').style.display = 'none';
       }
        else {
          document.getElementById('couts_table').style.display = 'block';
        }

        document.getElementById('div_model_3').style.display = 'block';
      }
      else {
        document.getElementById('div_model_' + tab_index).style.display = 'block';
      }
    });
  });

  document.querySelector('#div_model .dupliquer').addEventListener("click", function (event) {
    m_model = m_model.dupliquer();
    affiche_model();
  });

  document.querySelector('#div_model .figurine').addEventListener("click", function (event) {
    document.querySelector("#div_model .input_figurine").click();
  });

  document.querySelector('#div_model .input_figurine').addEventListener("change", function (event) {
    const file = this.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    // Libération de l'URL blob précédente pour éviter les fuites mémoire
    const prevSrc = document.querySelector("#div_model .figurine").src;
    if (prevSrc && prevSrc.startsWith("blob:")) URL.revokeObjectURL(prevSrc);

    // Création d'une nouvelle URL blob pour l'image sélectionnée
    const blobUrl = URL.createObjectURL(file);
    document.querySelector("#div_model .figurine").src = blobUrl;

    // Réinitialisation de l'input pour permettre de reselectionner le même fichier ou un autre
    this.value = "";

    // Upload de l'image sur le serveur
    const nomModel = m_model ? m_model.Nom_model : (m_pion ? m_pion.Model : null);
    if (nomModel) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("nom", nomModel);
      fetch("upload.php", { method: "POST", body: formData })
        .then((r) => r.text())
        .then((text) => {
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.warn("Upload figurine: le serveur n'a pas renvoyé du JSON. Réponse:", text.slice(0, 300));
            URL.revokeObjectURL(blobUrl);
            return;
          }
          if (data.ok) {
            const m = m_model ? m_model : Models.find((m) => m.Nom_model === m_pion.Model);
            m.Image = new Image();
            m.Image.onload = function () { Map.generateHexMap(); Map.drawHexMap(); };
            m.Image.src = data.path + "?t=" + new Date().getTime();
            figImg.src = data.path + "?t=" + new Date().getTime();
            URL.revokeObjectURL(blobUrl);
          } else console.warn("Upload figurine:", data.message);
        })
        .catch((e) => {
          console.warn("Upload figurine:", e);
          URL.revokeObjectURL(blobUrl);
        });
    }
  });

  document.querySelectorAll("#div_model input[type=text]").forEach((input) => {
    input.addEventListener("input", function (event) {
      if (input.className.includes("nom_model")) return;

      if (input.className.includes("coefficient_")) {
        event.target.value = event.target.value.replace(/[^0-9\-\.]/g, ""); // Float
      }
      else {
        event.target.value = event.target.value.replace(/[^0-9\-]/g, ""); // Integer
      }

      // On ne traite pas les armures : elles sont gérées ailleurs
      if (["tete", "brasg", "brasd", "poitrine", "abdomen", "jambeg", "jambed"].includes(event.target.className)) return;

      // On traite les autres attributs
      let attribut = event.target.className.replace("_base", "").replace("_monstre", "");
      attribut = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();
      if (!event.target.disabled && attribut !== "") {
        if (attribut in m_model) {
          m_model[attribut] = event.target.value;
          m_model.sendMessage("set_" + attribut, event.target.value);
        }
        else console.error("Attribut du modèle non trouvé : ", attribut);
      }
    });
  });
}

/**
 * Initialise les événements de la section Humanoides du modèle
 */
function initialise_model_0() {
  document.querySelector("#div_model_0 .switch_to_monster").addEventListener("click", function (event) {
    m_model.Is_monster = true;
    m_model.sendMessage("set_Is_monster", m_model.Is_monster);
    document.querySelector("#div_model .humanoid").style.display = 'none';
    document.querySelector("#div_model .monstre").style.display = 'block';
    document.querySelector("#div_model .humanoid").click();
  });

  document.querySelectorAll("#div_model_0 input[type=text]").forEach((input) => {
    input.addEventListener("contextmenu", function (event) {
      if (!input.className.includes("_score")) return;
      event.preventDefault();
      affiche_interactions(0, input.className.replace("_score", ""));
    });
  });

  document.querySelectorAll("#div_model_0 input[type=text]").forEach((input) => {
    input.addEventListener("input", function (event) {
      if (input.className === "nb_blessures_max") {
        m_model.Nb_blessures_max = event.target.value;
        m_model.sendMessage("set_Nb_blessures_max", m_model.Nb_blessures_max);
        return;
      }
      else if (input.className === "vue") {
        m_model.Vue = event.target.value;
        m_model.sendMessage("set_Vue", m_model.Vue);
        return;
      }

      const attribut = event.target.className.replace("_base", "").replace("_experience", "").replace("_race", "");
      const att_name = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();
      const target_base = document.querySelector("#div_model_0 ." + attribut + "_base");
      const target_exp = document.querySelector("#div_model_0 ." + attribut + "_experience");

      // Les champs ne peuvent pas être inférieur à 0 ou supérieur à 25
      if (event.target.className.includes("_base") || event.target.className.includes("_experience")) {
        if (target_base.value < 0) target_base.value = 0;
        else if (target_base.value > 25) target_base.value = 25;

        if (att_name in m_model) {
          m_model[att_name] = target_base.value;
          m_model.sendMessage("set_" + att_name, target_base.value);
        }
        else console.error("Attribut du modèle non trouvé : ", att_name);

        // Idem pour le cumul avec l'expérience
        if (target_exp !== null) {
          if (target_exp.value < 0) target_exp.value = 0;
          else if (parseInt(target_exp.value) + parseInt(target_base.value) > 25) target_exp.value = 25 - target_base.value;

          if (att_name + "_experience" in m_model) {
            m_model[att_name + "_experience"] = target_exp.value;
            m_model.sendMessage("set_" + att_name + "_experience", target_exp.value);
          }
          else console.error("Attribut du modèle non trouvé : ", att_name + "_experience");
        }
      }

      // On affiche en bleu les valeurs inférieure à 3, en rouge les valeurs supérieure à 18
      let val1 = parseInt(target_base.value || 0);
      if (val1 < 3) target_base.style.backgroundColor = "rgb(128, 128, 255)";
      else if (val1 > 18) target_base.style.backgroundColor = "rgb(255, 32, 32)";
      else target_base.style.backgroundColor = "";

      if (["force", "constitution", "vivacite_physique", "perception", "vivacite_mentale", "volonte", "abstraction", "charisme"].includes(attribut)) {
        const target_exp = document.querySelector("#div_model_0 ." + attribut + "_experience");
        const delta = parseInt(target_exp.value || 0);
        const val2 = val1 + delta;
        if (val2 > 18 && delta > 0) target_exp.style.backgroundColor = "rgb(255, 32, 32)";
        else if (val2 < 3 && delta < 0) target_exp.style.backgroundColor = "rgb(128, 128, 255)";
        else target_exp.style.backgroundColor = "";
      }

      // On met à jour le score de l'attribut
      document.querySelector("#div_model_0 ." + attribut + "_score").value =
        (parseInt(document.querySelector("#div_model_0 ." + attribut + "_base").value) || 0) +
        (parseInt(document.querySelector("#div_model_0 ." + attribut + "_race").value) || 0);

      if (["force", "constitution", "vivacite_physique", "perception", "vivacite_mentale", "volonte", "abstraction", "charisme"].includes(attribut)) {
        document.querySelector("#div_model_0 ." + attribut + "_score").value =
          (parseInt(document.querySelector("#div_model_0 ." + attribut + "_score").value) || 0) +
          (parseInt(document.querySelector("#div_model_0 ." + attribut + "_experience").value) || 0);
      }

      // On met à jour les 4 éléments calculés et leur 4 ajustements
      document.querySelector("#div_model_0 .niveau_physique_score").value = Math.round((
        parseInt(document.querySelector("#div_model_0 .force_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .constitution_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .vivacite_physique_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .perception_score").value || 0)) / 4);

      document.querySelector("#div_model_0 .niveau_mental_score").value = Math.round((
        parseInt(document.querySelector("#div_model_0 .volonte_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .abstraction_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .vivacite_mentale_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .charisme_score").value || 0)) / 4);

      document.querySelector("#div_model_0 .coordination_score").value = Math.round((
        parseInt(document.querySelector("#div_model_0 .vivacite_physique_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .perception_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .vivacite_mentale_score").value || 0)) / 3);

      let bonus_sixieme_sens = 0;
      let av = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === "Sixième sens" && avantage.Selection);
      if (av !== null && av !== undefined) {
        bonus_sixieme_sens =
          (av.Niveau_creation === "-" ? 0 : parseInt(av.Niveau_creation)) +
          (av.Niveau_experience === "-" ? 0 : parseInt(av.Niveau_experience));
      }
      document.querySelector("#div_model_0 .sixieme_sens_score").value = Math.round((
        parseInt(document.querySelector("#div_model_0 .adaptation_score").value || 0) +
        parseInt(document.querySelector("#div_model_0 .perception_score").value || 0)) / 2) + bonus_sixieme_sens;
    });
  });
}

/**
 * Initialise les événements de la section Monstres du modèle
 */
function initialise_model_1() {
  document.querySelectorAll("#div_model_1 input[type=text]").forEach((input) => {
    input.addEventListener("contextmenu", function (event) {
      if (["puissance_physique_monstre", "vivacite_physique2_monstre", "puissance_mentale_monstre"].includes(input.className)) {
        event.preventDefault();
        affiche_interactions(0, input.className.replace("_monstre", ""));
      }
      else if (["esquive_monstre", "feinte_de_corps_monstre"].includes(input.className)) {
        event.preventDefault();
        affiche_interactions(1, input.className.replace("_monstre", ""));
      }
    });
  });

  document.querySelector("#div_model_1 .bool_parade_1_monstre").addEventListener("change", function (event) {
    document.querySelector("#div_model_1 .parade_1_monstre").disabled = !event.target.checked;
  });

  document.querySelector("#div_model_1 .bool_parade_2_monstre").addEventListener("change", function (event) {
    document.querySelector("#div_model_1 .parade_2_monstre").disabled = !event.target.checked;
  });

  document.querySelector("#div_model_1 .capacites_monstre").addEventListener("input", function (event) {
    m_model.Capacites = event.target.value;
    m_model.sendMessage("set_Capacites", m_model.Capacites);
  });

  document.querySelector("#div_model_1 .bool_attaque_2_monstre").addEventListener("change", function (event) {
    document.querySelector("#div_model_1 .attaque_2_monstre").disabled = !event.target.checked;
    document.querySelector("#div_model_1 .bool_parade_2_monstre").disabled = !event.target.checked;
    document.querySelector("#div_model_1 .parade_2_monstre").disabled = !event.target.checked || !document.querySelector("#div_model_1 .bool_parade_2_monstre").checked;
    document.querySelector("#div_model_1 .coefficient_dommages_2_monstre").disabled = !event.target.checked;
    document.querySelector("#div_model_1 .bonus_dommages_2_monstre").disabled = !event.target.checked;
  });

  document.querySelector("#div_model_1 .switch_to_humanoid").addEventListener("click", function (event) {
    m_model.Is_monster = false;
    m_model.sendMessage("set_Is_monster", m_model.Is_monster);
    document.querySelector("#div_model .humanoid").style.display = 'block';
    document.querySelector("#div_model .monstre").style.display = 'none';
    document.querySelector("#div_model .monstre").click();
  });

  document.querySelectorAll("#div_model_1 input[type=checkbox]").forEach((input) => {
    input.addEventListener("change", function (event) {
      let attribut = event.target.className.replace("_monstre", "");
      attribut = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();

      m_model.sendMessage("set_" + attribut, event.target.checked ? 1 : 0);

      if (attribut in m_model) m_model[attribut] = event.target.checked ? 1 : 0;
      else console.error("Attribut du modèle non trouvé : ", attribut);
    });
  });

  document.querySelectorAll("#div_model_1 input[type=text]").forEach((input) => {
    input.addEventListener("input", function (event) {
      if (input.className === "nb_blessures_max") {
        m_model.Nb_blessures_max = event.target.value;
        m_model.sendMessage("set_Nb_blessures_max", m_model.Nb_blessures_max);
        return;
      }
      else if (input.className === "vue") {
        m_model.Vue = event.target.value;
        m_model.sendMessage("set_Vue", m_model.Vue);
        return;
      }
      const attribut = event.target.className.replace("_monstre", "");
      const att_name = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();

      if (att_name in m_model) {
        m_model[att_name] = event.target.value;
        m_model.sendMessage("set_" + att_name, event.target.value);
      }
      else console.error("Attribut du modèle non trouvé : ", att_name);
    });
  });
}

/**
 * Initialise les événements de la section Divers du modèle
 */
function initialise_model_3() {
  document.querySelector("#div_model_3 .arbre_magie").addEventListener("click", function () {
    affiche_roue_magie();
  });

  document.querySelectorAll("#armures_table input").forEach((input) => {
    input.addEventListener("input", function (event) {
      m_model["Armure_" + input.className] = event.target.value;
      m_model.sendMessage("set_Armure_" + input.className, m_model["Armure_" + input.className]);
    });
  });
}

/**
 * Définit les bornes des degrés de la compétence
 * @param {string} nom_competence - Nom de la compétence
 * @param {number} min - Borne minimale
 * @param {number} max - Borne maximale
 */
function set_competences_bornes(nom_competence) {
  // if (nom_competence === null || nom_competence === undefined || nom_competence === "") return;
  const classe = nom_competence.normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll(" ", "_").replaceAll("'", "_").toLowerCase();
  const degres = document.querySelector("#div_model_5 ." + classe).querySelector(".degres");
  const tr = Array.from(document.querySelectorAll("#div_model_5 tr")).find(tr => tr.classList.item(0) === classe);
  const is_mineure = tr.classList.item(1) === "competences_mineures";
  let min = 0;
  let max = is_mineure ? 8 : 4;
  let nom_competence_maitre = nom_competence;
  if (tr.classList.item(1) !== null && tr.classList.item(1) !== undefined && tr.classList.item(1) !== "competences_mineures") {
    nom_competence_maitre = Array.from(document.querySelectorAll("#div_model_5 tr")).find(tr2 => tr2.classList.item(0) === tr.classList.item(1)).querySelectorAll("td")[0].textContent.split(" :")[0];
  }

  // Liste des compétences de combat
  let liste_combats = ["Feinte de corps", "Esquive", "Parade bouclier", "Escrime", "Tranchantes", "Contondantes ou d'estoc", "Projectiles", "Armes de jet", "Combat mains nues"];
  liste_combats.forEach((nom_cmp) => {
    const classe_cmp = nom_cmp.normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll(" ", "_").replaceAll("'", "_").toLowerCase();
    document.querySelectorAll("#div_model_5 tr").forEach((tr) => {
      if (tr.classList.item(1) !== classe_cmp) return;
      liste_combats.push(tr.querySelectorAll("td")[0].textContent.split(" :")[0]);
    });
  });

  // Gestion des avantages concernant cette compétence
  if (liste_combats.includes(nom_competence)) {
    // Compétence de combat
    const av = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === "Maitre d'armes" && avantage.Selection);
    if (av !== null && av !== undefined && (av.Niveau_creation !== "-" || av.Niveau_experience !== "-")) {
      max += parseInt(av.Niveau_creation === "-" ? 0 : av.Niveau_creation) + parseInt(av.Niveau_experience === "-" ? 0 : av.Niveau_experience);
    }
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Maitre de compétence majeure") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre === nom_competence_maitre) {
        max += parseInt(avantage.Niveau_creation === "-" ? 0 : avantage.Niveau_creation) + parseInt(avantage.Niveau_experience === "-" ? 0 : avantage.Niveau_experience);
      }
    });
  }
  else if (nom_competence.includes("Parler ")) {
    // Compétence de langue
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Maitre de compétence mineure") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre !== nom_competence) return;
      max += parseInt(avantage.Niveau_creation === "-" ? 0 : avantage.Niveau_creation) + parseInt(avantage.Niveau_experience === "-" ? 0 : avantage.Niveau_experience);
    });
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Don pour les langues") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre !== nom_competence.replace("Parler ", "").toLowerCase()) return;
      min = 6;
    });
  }
  else if (nom_competence.includes("Jouer Instrument")) {
    // Compétence de musique
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Maitre de compétence mineure") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre !== nom_competence) return;
      max += parseInt(avantage.Niveau_creation === "-" ? 0 : avantage.Niveau_creation) + parseInt(avantage.Niveau_experience === "-" ? 0 : avantage.Niveau_experience);
    });
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Don pour la musique") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre !== nom_competence.replace("Jouer ", "").replaceAll(" ", "_").toLowerCase()) return;
      min = 6;
    });
  }
  else if (nom_competence_maitre.includes("Connaissance des arcanes") || nom_competence_maitre.includes("Connaissance de l'occulte")) {
    // Compétence de magie
    const nom_avantage = nom_competence_maitre.includes("Connaissance des arcanes") ? "Maitre de magie" : "Guide spirituel";
    const av = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === nom_avantage && avantage.Selection);
    if (av !== null && av !== undefined && (av.Niveau_creation !== "-" || av.Niveau_experience !== "-")) {
      max += parseInt(av.Niveau_creation === "-" ? 0 : av.Niveau_creation) + parseInt(av.Niveau_experience === "-" ? 0 : av.Niveau_experience);
    }
    else max = 0;
  }
  else if (!is_mineure) {
    // Compétence majeure
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Maitre de compétence majeure") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre !== nom_competence_maitre) return;
      max += parseInt(avantage.Niveau_creation === "-" ? 0 : avantage.Niveau_creation) + parseInt(avantage.Niveau_experience === "-" ? 0 : avantage.Niveau_experience);
    });
  }
  else {
    // Compétence mineure
    Avantages.filter(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom.includes("Maitre de compétence mineure") && avantage.Selection).forEach((avantage) => {
      if (avantage.Parametre !== nom_competence) return;
      max += parseInt(avantage.Niveau_creation === "-" ? 0 : avantage.Niveau_creation) + parseInt(avantage.Niveau_experience === "-" ? 0 : avantage.Niveau_experience);
    });
  }

  // Gestion du désavantage Jeunesse
  let jeunesse = Desavantages.find(desavantage => desavantage.Nom_model === m_model.Nom_model && desavantage.Nom === "Jeunesse" && desavantage.Selection);
  if (jeunesse !== null && jeunesse !== undefined) {
    if (jeunesse.Niveau === "1" || jeunesse.Niveau === "2") max -= (is_mineure ? 2 : 1);
    if (jeunesse.Niveau === "3" || jeunesse.Niveau === "4") max -= (is_mineure ? 4 : 2);
    if (max < 0) max = 0;
    if (max < min) max = min;
  }

  // Plafonnement du nombre de degrés
  if (is_mineure) {
    if (max > 13) max = 13;
  }
  else {
    if (max > 9) max = 9;
  }

  let old_value = degres.value !== "" ? parseInt(degres.value) : 0;
  if (old_value < min) old_value = min;
  if (old_value > max) old_value = max;
  degres.innerHTML = "";
  for (let i = min; i <= max; i++) {
    let nouvelleOption = document.createElement("option");
    nouvelleOption.value = i;
    nouvelleOption.textContent = i;
    degres.appendChild(nouvelleOption);
  }
  degres.value = old_value;

}

/**
 * Initialise les événements de la section Avantages du modèle
 */
function initialise_model_4() {

  // Chargement de la liste des parametres des compétences majeures et mineures
  document.querySelectorAll("#div_model_5 tr").forEach((tr) => {
    if (tr.querySelectorAll("td")[0] === null || tr.querySelectorAll("td")[0] === undefined) return;

    const Nom_competence = tr.querySelectorAll("td")[0].textContent.split(" :")[0];
    if (Nom_competence === null || Nom_competence === undefined) return;

    const nouvelleOption = document.createElement("option");
    nouvelleOption.value = Nom_competence;
    nouvelleOption.textContent = Nom_competence;

    if (tr.classList.item(1) === "competences_mineures") {
      document.querySelector("#div_model_4 .maitre_de_competence_mineure_1").querySelector(".parametre").appendChild(nouvelleOption);
      document.querySelector("#div_model_4 .maitre_de_competence_mineure_2").querySelector(".parametre").appendChild(nouvelleOption.cloneNode(true));
      document.querySelector("#div_model_4 .maitre_de_competence_mineure_3").querySelector(".parametre").appendChild(nouvelleOption.cloneNode(true));
    }
    else if ((tr.classList.item(1) === null || tr.classList.item(1) === undefined) &&
      Nom_competence !== "Connaissance des arcanes" &&
      Nom_competence !== "Connaissance de l'occulte") {
      document.querySelector("#div_model_4 .maitre_de_competence_majeure_1").querySelector(".parametre").appendChild(nouvelleOption);
      document.querySelector("#div_model_4 .maitre_de_competence_majeure_2").querySelector(".parametre").appendChild(nouvelleOption.cloneNode(true));
      document.querySelector("#div_model_4 .maitre_de_competence_majeure_3").querySelector(".parametre").appendChild(nouvelleOption.cloneNode(true));
    }
  });

  // Chargement de la liste des parametres des sorts naturels
  Sorts.filter((s) => s.Niveau <= 4).forEach((s) => {
    // Les sorts à coût variable ne sont pas candidats
    if (s.Nom_sort === "Dissiper la fatigue" || s.Nom_sort === "Soigner les blessures légères") return;
    const nouvelleOption = document.createElement("option");
    nouvelleOption.value = getShortName(s.Nom_liste) + " - " + s.Nom_sort;
    nouvelleOption.textContent = getShortName(s.Nom_liste) + " - " + s.Nom_sort;
    document.querySelector("#div_model_4 .sort_naturel").querySelector(".parametre").appendChild(nouvelleOption);
  });

  document.querySelectorAll("#div_model_4 .avantages").forEach((element) => {
    element.addEventListener("change", function (event) {
      if (m_model === null || typeof m_model === "undefined") return;

      const selection = event.target.closest("tr").querySelector(".selection");
      const parametre = event.target.closest("tr").querySelector(".parametre");
      const type = event.target.closest("tr").querySelector(".type");
      const niveau_creation = event.target.closest("tr").querySelector(".niveau_creation");
      const niveau_experience = event.target.closest("tr").querySelector(".niveau_experience");
      const cout = event.target.closest("tr").querySelector(".cout");
      const nom_avantage = event.target.closest("tr").querySelectorAll("td")[1].textContent.split(" :")[0];
      let avantage = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === nom_avantage);

      if (avantage === null || typeof avantage === "undefined") {
        avantage = new Avantage();
        avantage.Nom_model = m_model.Nom_model;
        avantage.Nom = nom_avantage;
        avantage.Selection = false;
        avantage.Parametre = null;
        avantage.Type = null;
        avantage.Niveau_creation = null;
        avantage.Niveau_experience = null;
        Avantages.push(avantage);
      }

      // Traitement de la sélection
      if (selection !== null && selection !== undefined) {
        switch (nom_avantage) {
          case "Maitre de magie":
            if (selection.checked) {
              document.querySelector("#div_model_4 .guide_spirituel").querySelector(".selection").checked = false;
              document.querySelector("#div_model_4 .guide_spirituel").dispatchEvent(new Event("change", { bubbles: true }));
            }
            break;
          case "Guide spirituel":
            if (selection.checked) {
              document.querySelector("#div_model_4 .maitre_de_magie").querySelector(".selection").checked = false;
              document.querySelector("#div_model_4 .maitre_de_magie").dispatchEvent(new Event("change", { bubbles: true }));
            }
            break;
        }
        avantage.Selection = selection.checked;
      }

      // Traitement du paramètre
      if (parametre !== null && parametre !== undefined) {
        avantage.Parametre = parametre.value;
      }

      // Traitement du type
      if (type !== null && type !== undefined) {
        avantage.Type = type.value;
      }

      // Traitement des niveaux de création et d'expérience
      if (niveau_creation !== null && niveau_creation !== undefined) {
        let opt = [];
        switch (nom_avantage) {
          case "Maitre de magie":
          case "Guide spirituel":
            opt = ["-", "0", "1", "2", "3", "4", "5"];
            break;
          case "Maitre d'armes":
          case "Maitre de compétence majeure 1":
          case "Maitre de compétence majeure 2":
          case "Maitre de compétence majeure 3":
          case "Maitre de compétence mineure 1":
          case "Maitre de compétence mineure 2":
          case "Maitre de compétence mineure 3":
            opt = ["-", "1", "2", "3", "4", "5"];
            break;
          case "Richesse":
            opt = ["-", "1", "2", "3", "4"];
            break;
          default:
            opt = ["-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
            break;
        }

        const old_cre = niveau_creation.value == "" ? "-" : niveau_creation.value;
        niveau_creation.innerHTML = "";
        opt.forEach((i) => {
          const nouvelleOption = document.createElement("option");
          nouvelleOption.value = i;
          nouvelleOption.textContent = i;
          niveau_creation.appendChild(nouvelleOption);
        });
        niveau_creation.value = old_cre;

        const old_exp = niveau_experience.value == "" ? "-" : niveau_experience.value;

        let max_exp = 0;
        max_exp = parseInt(opt.at(-1)) - parseInt(old_cre == "-" ? 0 : old_cre);
        if (max_exp < 0) max_exp = 0;

        niveau_experience.innerHTML = "";
        opt.forEach((i) => {
          if (i > max_exp) return;
          if (i === "0" && niveau_creation.value !== "-") return;

          const nouvelleOption = document.createElement("option");
          nouvelleOption.value = i;
          nouvelleOption.textContent = i;
          niveau_experience.appendChild(nouvelleOption);
        });

        if (old_exp === "-") niveau_experience.value = "-";
        else if (parseInt(old_exp) <= max_exp) niveau_experience.value = old_exp;
        else niveau_experience.value = max_exp;

        if (niveau_experience.value === "") niveau_experience.value = "-";

        avantage.Niveau_creation = niveau_creation.value;
        avantage.Niveau_experience = niveau_experience.value;
      }

      // Traitement du coût (s'il y a lieu de l'adapter)
      if (cout !== null && cout !== undefined) {
        cout.value = avantage.get_cout("Création") + avantage.get_cout("Expérience");
      }

      avantage.sendMessage("set_Avantage");

      document.querySelector("#div_model_4 .nb_points_creation").textContent = m_model.get_cout_avantages_creation();
      document.querySelector("#div_model_4 .nb_points_experience").textContent = m_model.get_cout_avantages_experience();

      // Cas spécifique pour les avantages concernant la race non humaine
      if (nom_avantage === "Race non humaine") {
        let race = "humain";
        if (selection.checked) race = parametre.value.replace("_evolue", "");
        ["force", "constitution", "vivacite_physique", "perception", "vivacite_mentale", "volonte", "abstraction", "charisme", "adaptation", "combat", "foi", "magie", "memoire", "telepathie"].forEach((attribute) => {
          const val = attributs_races[race][attribute];
          document.querySelector("#div_model_0 ." + attribute + "_race").value = val > 0 ? "+" + val : (val < 0 ? val : "-");
          document.querySelector("#div_model_0 ." + attribute + "_race").dispatchEvent(new Event("input", { bubbles: true }));
        });
      }

      // Avantages améliorant le nombre de degrés des compétences
      let cmp = [];
      switch (nom_avantage) {
        case "Maitre de magie":
          cmp.push("Connaissance des arcanes");
          break;
        case "Guide spirituel":
          cmp.push("Connaissance de l'occulte");
          break;
        case "Maitre d'armes":
          cmp.push("Feinte de corps", "Esquive", "Parade bouclier", "Escrime", "Tranchantes", "Contondantes ou d'estoc", "Projectiles", "Armes de jet", "Combat mains nues");
          break;
        case "Maitre de compétence majeure 1":
        case "Maitre de compétence majeure 2":
        case "Maitre de compétence majeure 3":
        case "Maitre de compétence mineure 1":
        case "Maitre de compétence mineure 2":
        case "Maitre de compétence mineure 3":
          cmp.push(avantage.Parametre);
          break;
        case "Don pour les langues 1":
        case "Don pour les langues 2":
        case "Don pour les langues 3":
          if (avantage.Parametre === "--") break;
          cmp.push("Parler " + avantage.Parametre.slice(0, 1).toUpperCase() + avantage.Parametre.slice(1).toLowerCase());
          break;
        case "Don pour la musique 1":
        case "Don pour la musique 2":
        case "Don pour la musique 3":
          if (avantage.Parametre === "--") break;
          cmp.push("Jouer " + (avantage.Parametre.slice(0, 1).toUpperCase() + avantage.Parametre.slice(1).toLowerCase()).replaceAll("_", " "));
          break;
      }

      cmp.forEach((competence) => {
        const classe = competence.normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll(" ", "_").replaceAll("'", "_").toLowerCase();
        document.querySelectorAll("#div_model_5 tr").forEach((tr) => {
          if (tr.classList.item(1) !== classe) return;
          const competences_fille = tr.querySelectorAll("td")[0].textContent.split(" :")[0];
          set_competences_bornes(competences_fille);
        });
        set_competences_bornes(competence);
      });

      // Cas spécifique pour les avantages concernant le sixième_sens
      if (nom_avantage === "Sixième sens") {
        document.querySelector("#div_model_0 .perception_base").dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Cas spécifique pour les avantages concernant la magie
      switch (nom_avantage) {
        case "Maitre de magie":
          if (!avantage.Selection) break;
          document.querySelector("#div_model_3 .concentration").closest("tr").style.visibility = "visible";
          document.querySelector("#div_model_3 .concentration").disabled = true;
          document.querySelector("#div_model_3 .concentration").value = m_model.get("concentration");
          break;
        case "Guide spirituel":
          if (!avantage.Selection) break;
          document.querySelector("#div_model_3 .concentration").closest("tr").style.visibility = "visible";
          document.querySelector("#div_model_3 .concentration").disabled = false;
          document.querySelector("#div_model_3 .concentration").value = m_model.get("concentration");
         break;
      }
    });
  });
}

/**
 * Initialise les événements de la section competences du modèle
 */
function initialise_model_5() {
  document.querySelectorAll("#div_model_5 tr").forEach(tr => {
    if (tr.querySelector(".degres") === null) return;

    if (tr.querySelector(".don").value === "") tr.querySelector(".don").style.visibility = "hidden";
    if (tr.querySelector(".attribut").value === "") tr.querySelector(".attribut").style.visibility = "hidden";

    const competence_maitre = tr.classList.item(1);
    if (competence_maitre !== null && competence_maitre !== "competences_mineures") {
      tr.querySelectorAll("td")[0].style.fontWeight = "normal";
      tr.querySelectorAll("td")[0].style.fontStyle = "italic";
      tr.querySelectorAll("td")[0].style.textAlign = "right";
    }
  });

  document.querySelectorAll("#div_model_5 input[type=text]").forEach((input) => {
    input.addEventListener("contextmenu", function (event) {
      if (input.className !== "score") return;
      event.preventDefault();
      const cmp = input.closest("tr").querySelectorAll("td")[0].textContent.split(" :")[0];
      affiche_interactions(1, cmp);
    });
  });

  document.querySelectorAll("#div_model_5 .degres").forEach((degres) => {
    degres.addEventListener("change", function (event) {
      const Nom_competence = event.target.closest("tr").classList.item(0);
      const Nom_competence_full = event.target.closest("tr").querySelectorAll("td")[0].textContent.split(" :")[0];
      let cmp = Competences.find(comp => comp.Nom_model === m_model.Nom_model && comp.Nom === Nom_competence_full);

      if (cmp === null || typeof cmp === "undefined") {
        cmp = new Competence({ Nom_model: m_model.Nom_model, Nom: Nom_competence_full, Degres: 0 });
        Competences.push(cmp);
      }

      cmp.Degres = event.target.value;

      cmp.sendMessage("set_Degres", cmp.Degres);

      event.target.closest("tr").querySelector(".score").value = cmp.get_score();

      document.querySelectorAll("#div_model_5 tr").forEach((tr) => {
        if (tr.classList.item(1) !== Nom_competence) return;
        const Nom_competence_fille = tr.querySelectorAll("td")[0].textContent.split(" :")[0];
        const cmp_fille = Competences.find(comp => comp.Nom_model === m_model.Nom_model && comp.Nom === Nom_competence_fille);
        if (cmp_fille === null || typeof cmp_fille === "undefined") return;
        tr.querySelector(".score").value = cmp_fille.get_score();
      });
    });
  });
}

/**
 * Initialise les événements de la section Désavantages du modèle
 */
function initialise_model_6() {
  document.querySelectorAll("#div_model_6 .desavantages").forEach(element => {
    element.addEventListener("change", function (event) {
      const Nom_desavantage = event.target.closest("tr").querySelectorAll("td")[2].textContent.split(" :")[0];
      let des = Desavantages.find(des => des.Nom_model === m_model.Nom_model && des.Nom === Nom_desavantage);

      const selection = event.target.closest("tr").querySelector(".selection");
      const niveau = event.target.closest("tr").querySelector(".niveau");
      const rev = event.target.closest("tr").querySelector(".rev");

      if (des === null || typeof des === "undefined") {
        des = new Desavantage({ Nom_model: m_model.Nom_model, Nom: Nom_desavantage, Niveau: null, Selection: false });
        Desavantages.push(des);
      }

      des.Selection = selection.checked;

      if (niveau !== null && niveau !== undefined) des.Niveau = niveau.value;

      rev.value = des.get_cout();

      des.sendMessage("set_Desavantage");

      document.querySelector("#div_model_6 .nb_points_creation").textContent = m_model.get_cout_desavantages_creation();

    });
  });
}

/**
 * Initialisation du modèle PJ
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", function () { initialise_model(); });
function initialise_model() {
  initialise_model_X();
  initialise_model_0();
  initialise_model_1();
  initialise_model_3();
  initialise_model_4();
  initialise_model_5();
  initialise_model_6();
}

/**
 * Mise à jour du total des coûts
 */
function update_cout_total() {

  if (!m_model) return;

  document.querySelector("#div_model_3 .attributs_creation_cout").value = m_model.get_cout_attributs_creation();
  document.querySelector("#div_model_3 .attributs_experience_cout").value = m_model.get_cout_attributs_experience();
  document.querySelector("#div_model_3 .attributs_cout").value = m_model.get_cout_attributs_creation() + m_model.get_cout_attributs_experience();
  document.querySelector("#div_model_3 .dons_creation_cout").value = m_model.get_cout_dons_creation();
  document.querySelector("#div_model_3 .dons_cout").value = m_model.get_cout_dons_creation();
  document.querySelector("#div_model_3 .avantages_creation_cout").value = 25 * m_model.get_cout_avantages_creation();
  document.querySelector("#div_model_3 .avantages_experience_cout").value = 50 * m_model.get_cout_avantages_experience();
  document.querySelector("#div_model_3 .avantages_cout").value = 25 * m_model.get_cout_avantages_creation() + 50 * m_model.get_cout_avantages_experience();
  document.querySelector("#div_model_3 .desavantages_creation_cout").value = - 25 * m_model.get_cout_desavantages_creation();
  document.querySelector("#div_model_3 .desavantages_cout").value = - 25 * m_model.get_cout_desavantages_creation();
  document.querySelector("#div_model_3 .competences_cout").value = m_model.get_cout_competences();
  document.querySelector("#div_model_3 .magie_classique_cout").value = m_model.get_cout_sorts();
  document.querySelector("#div_model_3 .magie_religieuse_cout").value = m_model.get_cout_concentration();

  const total_creation_cout =
    m_model.get_cout_attributs_creation() +
    m_model.get_cout_dons_creation() +
    25 * (m_model.get_cout_avantages_creation() - m_model.get_cout_desavantages_creation());
  document.querySelector("#div_model_3 .total_creation_cout").value = total_creation_cout;

  const total_experience_cout =
    m_model.get_cout_attributs_experience() +
    50 * m_model.get_cout_avantages_experience();
  document.querySelector("#div_model_3 .total_experience_cout").value = total_experience_cout;

  const total_cout =
    m_model.get_cout_attributs_creation() + m_model.get_cout_attributs_experience() +
    m_model.get_cout_dons_creation() +
    25 * (m_model.get_cout_avantages_creation() - m_model.get_cout_desavantages_creation()) + 50 * m_model.get_cout_avantages_experience() +
    m_model.get_cout_competences() +
    m_model.get_cout_sorts() +
    m_model.get_cout_concentration() +
    -2000;
  document.querySelector("#div_model_3 .total_cout").value = total_cout;

  document.querySelector("#div_model_3 .remarques_cout_attributs").style.display = "none";
  if (m_model.get_cout_attributs_experience() > 0.25 * total_cout) {
    document.querySelector("#div_model_3 .attributs_experience_cout").style.color = "red";
    if (!m_model.Is_monster) document.querySelector("#div_model_3 .remarques_cout_attributs").style.display = "block";
  }
  else {
    document.querySelector("#div_model_3 .attributs_experience_cout").style.color = "";
  }

  document.querySelector("#div_model_3 .remarques_cout_avantages").style.display = "none";
  if (50 * m_model.get_cout_avantages_experience() > 0.25 * total_cout) {
    document.querySelector("#div_model_3 .avantages_experience_cout").style.color = "red";
    if (!m_model.Is_monster) document.querySelector("#div_model_3 .remarques_cout_avantages").style.display = "block";
  }
  else {
    document.querySelector("#div_model_3 .avantages_experience_cout").style.color = "";
  }

  // Mise à jour du coût de la magie
  update_cout_magie();
}

/**
 * Mise à jour du coût de la magie
 */
function update_cout_magie() {
  if (!m_model) return;

  document.querySelector("#div_model_3 .cout_listes_magie").closest("tr").style.display = "";
  document.querySelector("#div_model_3 .cout_sorts_connus").closest("tr").style.display = "";
  document.querySelector("#cout_magie_table").style.display = "";
  document.querySelector("#cout_magie_table").querySelectorAll("tr").forEach(tr => {
    if (tr.querySelector("th") !== null) tr.style.display = "";
  });
  document.querySelector("#div_model_3 .hr_cout_magie").style.display = "";

  const av = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === "Maitre de magie" && avantage.Selection);
  if (av === null || typeof av === "undefined" || (av.Niveau_creation === "-" && av.Niveau_experience === "-")) {
    // Cas où le personnage n'a pas de maître de magie
    document.querySelector("#div_model_3 .cout_listes_magie").closest("tr").style.display = "none";
    document.querySelector("#div_model_3 .cout_sorts_connus").closest("tr").style.display = "none";
    document.querySelector("#cout_magie_table").querySelectorAll("tr").forEach(tr => {
      if (tr.querySelector("th") !== null) tr.style.display = "none";
    });

    const av_religieux = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === "Guide spirituel" && avantage.Selection);
    if (av_religieux === null || typeof av_religieux === "undefined" || (av_religieux.Niveau_creation === "-" && av_religieux.Niveau_experience === "-")) {
      // Cas où le personnage n'a pas de guide spirituel non plus
      document.querySelector("#cout_magie_table").style.display = "none";
      document.querySelector("#div_model_3 .hr_cout_magie").style.display = "none";
    }
    return;
  }

  // Cas où le personnage a un maître de magie (classique)
  let niveau = av.Niveau_creation === "-" ? 0 : parseInt(av.Niveau_creation);
  niveau += av.Niveau_experience === "-" ? 0 : parseInt(av.Niveau_experience);

  document.querySelector("#div_model_3 .cout_listes_magie_max").value = 10 * (10 + 3 * niveau);
  document.querySelector("#div_model_3 .cout_sorts_connus_max").value = 100 * (10 + 3 * niveau);

  let cout_listes_magie = 0;
  let branches_magie = {};
  Object.keys(shortName).forEach(x => {
    let niveau_max = 0;
    SortsConnus.filter(s => s.Nom_model === m_model.Nom_model && s.Nom_liste === shortName[x]).forEach(sc => {
      const sort = Sorts.find(s => s.Nom_sort === sc.Nom_sort && s.Nom_liste === sc.Nom_liste);
      if (sort.Niveau > niveau_max) niveau_max = sort.Niveau;
    });
    const liste_jumelee = Listes.find(l => l.Nom_liste === shortName[x]).Nom_jumelee;
    SortsConnus.filter(s => s.Nom_model === m_model.Nom_model && s.Nom_liste === liste_jumelee).forEach(sc => {
      const sort = Sorts.find(s => s.Nom_sort === sc.Nom_sort && s.Nom_liste === sc.Nom_liste);
      if (sort.Niveau > niveau_max) niveau_max = sort.Niveau;
    });

    let type_branche = "";
    if (shortName[x].localeCompare(liste_jumelee) < 0) type_branche = shortName[x] + " - " + liste_jumelee;
    else type_branche = liste_jumelee + " - " + shortName[x];
    branches_magie[type_branche] = {};
    branches_magie[type_branche]["niveau_max"] = niveau_max;
  });

  Object.keys(branches_magie).forEach(x => {
    cout_listes_magie += cout_liste_magicien[branches_magie[x]["niveau_max"]];
  });

  document.querySelector("#div_model_3 .cout_listes_magie").value = cout_listes_magie;
  if (cout_listes_magie > 10 * (10 + 3 * niveau)) {
    document.querySelector("#div_model_3 .cout_listes_magie").style.color = "red";
  }
  else {
    document.querySelector("#div_model_3 .cout_listes_magie").style.color = "";
  }

  document.querySelector("#div_model_3 .cout_sorts_connus").value = m_model.get_cout_sorts();
  if (m_model.get_cout_sorts() > 100 * (10 + 3 * niveau)) {
    document.querySelector("#div_model_3 .cout_sorts_connus").style.color = "red";
  }
  else {
    document.querySelector("#div_model_3 .cout_sorts_connus").style.color = "";
  }
}

/**
 * Affichage du modèle PJ
 */
function affiche_model() {
  document.getElementById('div_pion').style.display = 'none';
  document.getElementById('div_model').style.display = 'block';

  if (m_model.Is_monster) {
    document.getElementById('div_model_0').style.display = 'none';
    document.getElementById('div_model_1').style.display = 'block';
  }
  else {
    document.getElementById('div_model_0').style.display = 'block';
    document.getElementById('div_model_1').style.display = 'none';
  }

  if (m_model === null) m_model = Models.find((m) => m.Nom_model === m_pion.Model);

  // Remplissage de la liste des modèles
  const model_select = document.querySelector("#div_model .model_select");
  model_select.innerHTML = "";
  Models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.Nom_model;
    option.textContent = model.Nom_model;
    model_select.appendChild(option);
  });
  model_select.value = m_model.Nom_model;

  // Réinitialisation du fond du champ de texte du nom du modèle
  const nom_model = document.querySelector("#div_model .nom_model");
  nom_model.style.backgroundColor = "white";
  nom_model.value = m_model.Nom_model;

  // Remplissage des champs du modèle
  document.querySelector("#div_model_1 .capacites_monstre").value = m_model.Capacites;

  // Remplissage des champs checkbox du modèle monstre
  document.querySelectorAll("#div_model_1 input[type=checkbox]").forEach((input) => {
    let attribut = input.className.replace("_monstre", "");
    attribut = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();
    if (attribut in m_model) input.checked = m_model[attribut];
    else console.error("Attribut du modèle non trouvé : ", attribut);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  // Remplissage des champs checkbox du modèle monstre
  document.querySelectorAll("#div_model_1 input[type=text]").forEach((input) => {
    const attribut = input.className.replace("_monstre", "");
    const att_name = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();
    if (att_name in m_model) input.value = m_model[att_name];
    else console.error("Attribut du modèle non trouvé : ", att_name);
  });

  // Remplissage des champs texte du modèle humanoide
  document.querySelectorAll("#div_model_0 input[type=text]").forEach((input) => {
    if (input.className.includes("_race") || input.className.includes("_score")) return;
    let attribut = input.className.replace("_base", "");
    attribut = attribut.slice(0, 1).toUpperCase() + attribut.slice(1).toLowerCase();
    if (attribut in m_model) input.value = m_model[attribut];
    else console.error("Attribut non trouvé : ", attribut);
  });

  // Remplissage des champs texte des armures (Div Divers)
  document.querySelectorAll("#armures_table input").forEach((input) => {
    input.value = m_model["Armure_" + input.className];
  });

  // Remplissage des champs du modèle competences
  document.querySelectorAll("#div_model_5 tr").forEach((tr) => {
    if (tr.querySelector(".degres") === null) return;
    const Nom_competence = tr.querySelectorAll("td")[0].textContent.split(" :")[0];
    let cmp = Competences.find(comp => comp.Nom_model === m_model.Nom_model && comp.Nom === Nom_competence);

    if (cmp === null || typeof cmp === "undefined") {
      cmp = new Competence({ Nom_model: m_model.Nom_model, Nom: Nom_competence, Degres: 0 });
      Competences.push(cmp);
    }
    let degres_max = 4;
    if (tr.classList.item(1) === "competences_mineures") degres_max = 8;

    if (cmp.Degres > degres_max) degres_max = cmp.Degres;

    set_competences_bornes(Nom_competence);
    tr.querySelector(".degres").value = cmp.Degres;
    tr.querySelector(".degres").dispatchEvent(new Event("change", { bubbles: true }));
  });

  // Remplissage des champs du modèle avantages
  document.querySelectorAll("#div_model_4 tr").forEach((tr) => {
    if (tr.querySelector(".selection") === null) return;

    const Nom_avantage = tr.querySelectorAll("td")[1].textContent.split(" :")[0];
    const avantage = Avantages.find(avantage => avantage.Nom_model === m_model.Nom_model && avantage.Nom === Nom_avantage);

    if (avantage !== null && typeof avantage !== "undefined") {
      tr.querySelector(".selection").checked = avantage.Selection;
      if (tr.querySelector(".parametre") !== null) tr.querySelector(".parametre").value = avantage.Parametre;
      if (avantage.Type === null || avantage.Type === undefined) avantage.Type = "";
      if (tr.querySelector(".type") !== null) tr.querySelector(".type").value = avantage.Type === "" ? "Création" : avantage.Type;
      if (tr.querySelector(".niveau_creation") !== null) {
        ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].forEach((niveau) => {
          const option = document.createElement("option");
          option.value = niveau;
          option.textContent = niveau;
          tr.querySelector(".niveau_creation").appendChild(option);
        });

        tr.querySelector(".niveau_creation").value = avantage.Niveau_creation;
      }
      if (tr.querySelector(".niveau_experience") !== null) {
        ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].forEach((niveau) => {
          const option = document.createElement("option");
          option.value = niveau;
          option.textContent = niveau;
          tr.querySelector(".niveau_experience").appendChild(option);
        });
        tr.querySelector(".niveau_experience").value = avantage.Niveau_experience;
      }
    }
    else {
      tr.querySelector(".selection").checked = false;
      if (tr.querySelector(".parametre") !== null) tr.querySelector(".parametre").selectedIndex = 0;
      if (tr.querySelector(".type") !== null) tr.querySelector(".type").value = "Expérience";
      if (tr.querySelector(".niveau_creation") !== null) tr.querySelector(".niveau_creation").selectedIndex = 0;
      if (tr.querySelector(".niveau_experience") !== null) tr.querySelector(".niveau_experience").selectedIndex = 0;
    }

    tr.querySelector(".selection").dispatchEvent(new Event("change", { bubbles: true }));
  });

  // Remplissage des champs du modèle desavantages
  document.querySelectorAll("#div_model_6 tr").forEach((tr) => {
    if (tr.querySelector(".selection") === null) return;
    const Nom_desavantage = tr.querySelectorAll("td")[2].textContent.split(" :")[0];

    if (tr.querySelector(".niveau") !== null) tr.querySelector(".niveau").value = 1;

    const desavantage = Desavantages.find(desavantage => desavantage.Nom_model === m_model.Nom_model && desavantage.Nom === Nom_desavantage);
    if (desavantage !== null && typeof desavantage !== "undefined") {
      tr.querySelector(".selection").checked = desavantage.Selection;
      if (tr.querySelector(".niveau") !== null) tr.querySelector(".niveau").value = desavantage.Niveau;
    }

    tr.querySelector(".selection").dispatchEvent(new Event("change", { bubbles: true }));
  });

  // Affichage de la figurine du modèle
  const figurine = document.querySelector("#div_model .figurine");
  figurine.style.display = 'block';
  figurine.onload = function () { Map.generateHexMap(); Map.drawHexMap(); };
  figurine.src = 'images/Figurines/' + m_model.Nom_model + '.png' + "?t=" + new Date().getTime();
}

initialise_interactions();
function initialise_interactions() {
  document.querySelector('#div_interactions .heroisme').addEventListener("change", function (event) {
    let marge = document.querySelector('#div_interactions .marge').value;
    if (event.target.checked) marge = parseInt(marge) + 4;
    else marge = parseInt(marge) - 4;
    document.querySelector('#div_interactions .marge').value = marge;

    if (marge >= 0) document.querySelector('#div_interactions .marge').style.backgroundColor = "lightgreen";
    else document.querySelector('#div_interactions .marge').style.backgroundColor = "lightcoral";
  });

  document.querySelector('#div_interactions .chance').addEventListener("click", function (event) {
    const jet_des_0 = parseInt(document.querySelector('#div_interactions .jet_des').value);
    const jet_des_1 = LancerDes.rollDice("3D6");
    const jet_des_2 = LancerDes.rollDice("3D6");
    const jet_des_3 = LancerDes.rollDice("3D6");
    const jet_des_max = Math.max(jet_des_0, jet_des_1, jet_des_2, jet_des_3, 13);
    const jet_des_min = Math.min(jet_des_0, jet_des_1, jet_des_2, jet_des_3, 8);
    const type = parseInt(document.querySelector('#div_interactions .type').value);

    let score = parseInt(document.querySelector('#div_interactions .score').value);
    let marge = 0;
    if (type === 0) { // Il s'agit d'un jet de caractéristique
      document.querySelector('#div_interactions .jet_des').value = jet_des_min;
      marge = score - jet_des_min;
    }
    else { // Il s'agit d'un jet de compétence
      document.querySelector('#div_interactions .jet_des').value = jet_des_max;
      marge = jet_des_max + score - 10;
    }
    if (document.querySelector('#div_interactions .heroisme').checked) marge += 4;

    document.querySelector('#div_interactions .marge').value = marge;

    if (marge >= 0) document.querySelector('#div_interactions .marge').style.backgroundColor = "lightgreen";
    else document.querySelector('#div_interactions .marge').style.backgroundColor = "lightcoral";
  });
}

/**
 * Affichage des interactions possibles avec le personnage
 * @param {number} type - Type de jet (0: caractéristique, 1: compétence)
 * @param {string} nom - Nom de la caractéristique ou de la compétence
 */

function affiche_interactions(type, nom) {
  let nice_name = nom.slice(0, 1).toUpperCase() + nom.slice(1).toLowerCase();
  nice_name = nice_name.replace("_", " ").replace("2", "");
  document.querySelector('#div_interactions .nom').textContent = "Jet de " + nice_name;
  if (["a", "e", "i", "o", "u", "y"].includes(nom.charAt(0).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase())) {
    document.querySelector('#div_interactions .nom').textContent = "Jet d'" + nice_name + " :";
  }

  const jet_des = LancerDes.rollDice("3D6");
  document.querySelector('#div_interactions .jet_des').value = jet_des;

  let score = 0;
  let marge = 0;
  if (type === 0) { // Il s'agit d'un jet de caractéristique
    score = m_model.get(nom);
    marge = score - jet_des;
  }
  else { // Il s'agit d'un jet de compétence
    const comp = Competences.find(comp => comp.Nom_model === m_model.Nom_model && comp.Nom === nom);
    score = comp.get_score();
    marge = jet_des + score - 10;
  }
  // if (document.querySelector('#div_interactions .heroisme').checked) marge += 4;
  document.querySelector('#div_interactions .type').value = type;
  document.querySelector('#div_interactions .score').value = score;
  document.querySelector('#div_interactions .marge').value = marge;

  if (marge >= 0) document.querySelector('#div_interactions .marge').style.backgroundColor = "lightgreen";
  else document.querySelector('#div_interactions .marge').style.backgroundColor = "lightcoral";
}
/**
 * FICHIER DIALOG.JS
 * ==================
 * Gestion des dialogues et interfaces utilisateur pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour afficher et gérer les fenêtres modales
 */

// === RÉFÉRENCES DES DIALOGUES ===
// Dialogues pour les dimensions de formes
const dialog_dim_carte = document.getElementById("dialog_dim_carte");
const dialog_dim_rectangle = document.getElementById("dialog_dim_rectangle");
const dialog_dim_mur = document.getElementById("dialog_dim_mur");
const dialog_dim_ellipse = document.getElementById("dialog_dim_ellipse");

// Dialogues pour les détails de personnages
const dialog_details_1 = document.getElementById("dialog_details_1");
const dialog_details_2 = document.getElementById("dialog_details_2");
const inputs = dialog_details_2.getElementsByTagName("input");

// Dialogues pour le système de combat
const dialog_attaque_1 = document.getElementById("dialog_attaque_1");
const dialog_attaque_2 = document.getElementById("dialog_attaque_2");
const dialog_attaque_3 = document.getElementById("dialog_attaque_3");

// Dialogues pour les sorts
const dialog_sort_1 = document.getElementById("dialog_sort_1");
const dialog_sort_2 = document.getElementById("dialog_sort_2");

// Dialogues pour la défense
const dialog_defense_1 = document.getElementById("dialog_defense_1");
const dialog_defense_2 = document.getElementById("dialog_defense_2");

// Dialogues pour les modèles de personnages
const dialog_model_1 = document.getElementById("dialog_model_1");

// === VARIABLES GLOBALES ===
let m_selected = null; // Personnage actuellement sélectionné

const attributs_races = {
  humain: {
    force: 0,
    constitution: 0,
    vivacite_physique: 0,
    perception: 0,
    vivacite_mentale: 0,
    volonte: 0,
    abstraction: 0,
    charisme: 0,
    adaptation: 0,
    combat: 0,
    foi: 0,
    magie: 0,
    memoire: 0,
    telepathie: 0,
  },
  aquablue: {
    force: 1,
    constitution: 2,
    vivacite_physique: 1,
    perception: 1,
    vivacite_mentale: -2,
    volonte: 1,
    abstraction: -1,
    charisme: -1,
    adaptation: -1,
    combat: 1,
    foi: 2,
    magie: -2,
    memoire: -1,
    telepathie: 1,
  },
  elfe: {
    force: -1,
    constitution: -1,
    vivacite_physique: 2,
    perception: 2,
    vivacite_mentale: 0,
    volonte: -2,
    abstraction: 0,
    charisme: 2,
    adaptation: 1,
    combat: -1,
    foi: -2,
    magie: 2,
    memoire: 1,
    telepathie: -1,
  },
  gnome: {
    force: -3,
    constitution: -1,
    vivacite_physique: 2,
    perception: 1,
    vivacite_mentale: 1,
    volonte: -1,
    abstraction: 1,
    charisme: 1,
    adaptation: 2,
    combat: -2,
    foi: 2,
    magie: -1,
    memoire: -2,
    telepathie: 2,
  },
  nain: {
    force: 0,
    constitution: 4,
    vivacite_physique: -2,
    perception: -1,
    vivacite_mentale: -1,
    volonte: +3,
    abstraction: -1,
    charisme: 0,
    adaptation: -2,
    combat: +1,
    foi: +1,
    magie: -2,
    memoire: +3,
    telepathie: +1,
  },
  orc: {
    force: 2,
    constitution: 2,
    vivacite_physique: -2,
    perception: 1,
    vivacite_mentale: -1,
    volonte: 2,
    abstraction: -1,
    charisme: -1,
    adaptation: 3,
    combat: 2,
    foi: -1,
    magie: -2,
    memoire: -2,
    telepathie: 0,
  },

  troll: {
    force: 4,
    constitution: 4,
    vivacite_physique: -3,
    perception: -2,
    vivacite_mentale: -1,
    volonte: 0,
    abstraction: -2,
    charisme: 1,
    adaptation: 1,
    combat: 1,
    foi: 0,
    magie: -3,
    memoire: -1,
    telepathie: 1,
  },

  toutlisse: {
    force: 1,
    constitution: 1,
    vivacite_physique: 1,
    perception: 2,
    vivacite_mentale: 0,
    volonte: 1,
    abstraction: 0,
    charisme: -2,
    adaptation: 1,
    combat: 2,
    foi: -1,
    magie: -2,
    memoire: -2,
    telepathie: 1,
  },

  autre: {
    force: 0,
    constitution: 0,
    vivacite_physique: 0,
    perception: 0,
    vivacite_mentale: 0,
    volonte: 0,
    abstraction: 0,
    charisme: 0,
    adaptation: 0,
    combat: 0,
    foi: 0,
    magie: 0,
    memoire: 0,
    telepathie: 0,
  },
};
/**
 * Affiche le dialogue pour définir les dimensions de la carte
 * Permet de spécifier la largeur et la hauteur de la carte de fond
 */
function afficher_dim_carte() {
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
 * Affiche le dialogue pour définir les dimensions d'un rectangle
 */
function afficher_dim_rectangle() {
  Forme.setFormeMode("rectangle");
  dialog_dim_rectangle.showModal();
}

/**
 * Affiche le dialogue pour définir les dimensions d'un mur
 */
function afficher_dim_mur() {
  Forme.setFormeMode("mur");
  dialog_dim_mur.showModal();
}

/**
 * Affiche le dialogue pour définir les dimensions d'une ellipse
 */
function afficher_dim_ellipse() {
  Forme.setFormeMode("ellipse");
  dialog_dim_ellipse.showModal();
}

/**
 * Affiche les détails d'un pion de titre donné
 * @param {string} titre - Titre du pion
 */
function afficher_Details_pion(titre) {
  const p = Pions.find((x) => x.Titre === titre);
  if (p === null || typeof p === "undefined") return;

  const col = p.Position.split(",")[0];
  const row = p.Position.split(",")[1];

  afficher_Details(col, row);
}

/**
 * Affiche les détails selon la sélection de l'arme1.
 */
function afficher_Details_arme1() {
  const arme1 = dialog_details_2.querySelector(".arme1");
  // Gestion de l'affichage des titres et des informations relatives à l'arme 1 sélectionnée
  if (arme1.value === "Lancement de sort") {
    dialog_details_2.querySelector(".titre_arme2").closest("td").colSpan = "2";
    dialog_details_2.querySelector(".arme2").closest("td").colSpan = "1";

    dialog_details_2.querySelector(".titre_arme2").style.display = "none";
    dialog_details_2.querySelector(".arme2").style.display = "none";
    dialog_details_2.querySelector(".info_secondaire").style.display = "none";

    dialog_details_2.querySelector(".titre_liste").style.display = "";
    dialog_details_2.querySelector(".liste").style.display = "";
    dialog_details_2.querySelector(".titre_sort").style.display = "";
    dialog_details_2.querySelector(".sort").style.display = "";
  } else {
    dialog_details_2.querySelector(".titre_arme2").closest("td").colSpan = "1";
    dialog_details_2.querySelector(".arme2").closest("td").colSpan = "1";

    dialog_details_2.querySelector(".titre_arme2").style.display = "";
    dialog_details_2.querySelector(".arme2").style.display = "";
    dialog_details_2.querySelector(".info_secondaire").style.display = "";

    dialog_details_2.querySelector(".titre_liste").style.display = "none";
    dialog_details_2.querySelector(".liste").style.display = "none";
    dialog_details_2.querySelector(".titre_sort").style.display = "none";
    dialog_details_2.querySelector(".sort").style.display = "none";

    // Réinitialisation des informations du sort
    m_selected.Nom_liste = null;
    m_selected.Nom_sort = null;
    m_selected.Incantation = 0;
    // Mise à jour de l'information affichée
    info_arme();
  }
}

/**
 * Affiche les détails d'un personnage à une position donnée
 * @param {number} col - Colonne de la position
 * @param {number} row - Ligne de la position
 */
function afficher_Details(col, row) {
  // On masque le zoom du pion
  Map.drawZoomHexagon();

  // Recherche du pion à la position donnée
  m_selected = Pions.find((x) => x.Position === col + "," + row);

  // Si aucun pion trouvé, afficher le dialogue de création
  if (m_selected === null || typeof m_selected === "undefined") {
    // Affichage du dialogue de création de pion
    const model = dialog_details_1.querySelector("#model");

    dialog_details_1.querySelector("#col").value = col;
    dialog_details_1.querySelector("#row").value = row;

    while (model.options.length > 1) model.removeChild(model.lastChild);

    // Ajout des modèles de joueurs comme options de contrôle
    for (let i = 0; i < Models.length; i++) {
      if (Models[i].Is_joueur) {
        const p = Pions.find((x) => x.Model === Models[i].Nom_model);
        if (p != null && typeof p != "undefined") continue;
        let nouvelleOption = document.createElement("option");
        nouvelleOption.value = Models[i].Nom_model;
        nouvelleOption.textContent = Models[i].Nom_model;
        model.appendChild(nouvelleOption);
      } else {
        let nouvelleOption = document.createElement("option");
        nouvelleOption.value = Models[i].Nom_model;
        nouvelleOption.textContent = Models[i].Nom_model;
        model.appendChild(nouvelleOption);
      }
    }

    dialog_details_1.showModal();
  } else {
    // Affichage du dialogue d'édition des détails du pion
    const model = dialog_details_2.querySelector(".model");
    const titre = dialog_details_2.querySelector(".titre");
    const note = dialog_details_2.querySelector(".note");
    const p_selected = Models.find((p) => p.Nom_model === m_selected.Model);

    // Gestion des permissions selon le type de personnage
    if (p_selected.Is_joueur || document.getElementById("joueur").value != "MJ") {
      dialog_details_2.querySelector("#Dupliquer").disabled = true;
    }
    else {
      dialog_details_2.querySelector("#Dupliquer").disabled = false;
    }

    // Mise à jour de l'armure calculée
    dialog_details_2.querySelector(".armure").value = m_selected.armure_generale();

    // Configuration du type (allié/ennemi)
    dialog_details_2.querySelector(".type").checked = m_selected.Type === "allies";

    // Configuration du sélecteur d'arme principale
    const arme1 = dialog_details_2.querySelector(".arme1");

    // Nettoyage des options existantes (garde les deux premières)
    while (arme1.options.length > 2) arme1.removeChild(arme1.lastChild);

    // Ajout des armes du modèle
    const is_monster = Armes.some((arme) => arme.Nom_arme === m_selected.Model);

    if (is_monster) {
      const arme = Armes.find((arme) => arme.Nom_arme === m_selected.Model);
      const nouvelleOption = document.createElement("option");
      nouvelleOption.value = arme.Nom_arme;
      nouvelleOption.textContent = arme.Nom_arme;
      arme1.appendChild(nouvelleOption);
    }
    else {
      Armes.filter((arme) => !arme.Is_personnel).forEach((arme) => {
        if (arme.Nom_arme === "Bouclier") return;

        const nouvelleOption = document.createElement("option");
        nouvelleOption.value = arme.Nom_arme;
        nouvelleOption.textContent = arme.Nom_arme;
        arme1.appendChild(nouvelleOption);
      });
    }

    // Sélection de l'arme actuelle
    arme1.value = m_selected.Arme1;

    // Gestion de l'affichage des titres et des informations relatives à l'arme 1 sélectionnée
    afficher_Details_arme1();

    // Déclenchement de l'événement change pour mettre à jour l'arme secondaire
    const event = new Event("change", { bubbles: true, cancelable: true });
    arme1.dispatchEvent(event);

    // Configuration de tous les champs de saisie
    for (let i = 0; i < inputs.length; i++) {
      // Désactivation des champs si ce n'est pas le MJ
      if (document.getElementById("joueur").value != "MJ") inputs[i].disabled = true;

      // Conversion du nom de classe en nom de propriété
      const field = inputs[i].className.charAt(0).toUpperCase() + inputs[i].className.slice(1).toLowerCase();

      // Style des champs
      inputs[i].style.fontSize = "x-large";
      inputs[i].style.backgroundColor = "";

      // Gestion spéciale pour les champs Titre et Type
      if (["Titre", "Type"].includes(field)) continue;

      // Largeur par défaut des inputs
      inputs[i].style.width = "35px";

      // Gestion des cases à cocher
      if (inputs[i].type === "checkbox") {
        inputs[i].checked = m_selected[field];
        continue;
      }

      // Gestion des champs numériques
      let value = parseInt(m_selected[field], 10);
      if (isNaN(value)) value = 0;
      inputs[i].value = value;

      // Couleur selon la valeur (rouge pour négatif)
      if (value >= 0) inputs[i].style.backgroundColor = "";
      else inputs[i].style.backgroundColor = "rgb(192, 64, 64)";
    }

    // Mise à jour du titre et de la note
    titre.value = m_selected.Titre;
    note.value = m_selected.Note;

    // Configuration des spans affichant les valeurs maximales
    const spans = dialog_details_2.getElementsByTagName("span");
    for (let i = 0; i < spans.length; i++) {
      const field = spans[i].className.charAt(0).toUpperCase() + spans[i].className.slice(1).toLowerCase();

      if (["Model",
        "Slider",
        "Titre_arme2",
        "Titre_liste",
        "Titre_sort"].includes(field)) continue;

      let value = p_selected[field];
      if (["Indice"].includes(field)) {
        if (m_selected.Indice === 0) {
          spans[i].innerHTML = "";
        }
        else {
          spans[i].innerHTML = " (" + m_selected["Indice"].toString().padStart(2, "0") + ")";
        }
      } else {
        if (isNaN(value)) value = 0;
        spans[i].innerHTML = "&nbsp;/&nbsp;" + value;
      }
    }

    // Mise à jour des informations affichées
    note.innerHTML = m_selected.Note;
    model.innerHTML = m_selected.Model;

    // Mise à jour de la carte
    Map.drawHexMap();

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

      dialog_details_2.querySelector(".liste").textContent = sort.Nom_liste;
      dialog_details_2.querySelector(".sort").textContent = sort.Nom_sort;
      dialog_details_2.querySelector(".info_principale").textContent =
        " (" + m_selected.Incantation + " s / " + expurger_temps_sort(sort.Incantation) + ")";
    } else {
      dialog_details_2.querySelector(".liste").textContent = "--";
      dialog_details_2.querySelector(".sort").textContent = "--";
      info_arme();
    }

    // Affichage du dialogue
    dialog_details_2.style.position = "absolute";
    dialog_details_2.style.top = "50%";
    dialog_details_2.style.left = "50%";
    dialog_details_2.style.transform = "translate(-50%, -50%)";
    dialog_details_2.style.zIndex = "100";
    dialog_details_2.show();

    // Ajustement de la largeur des sélecteurs d'armes
    const arme2 = dialog_details_2.querySelector(".arme2");
    arme1.style.width = "auto";
    arme2.style.width = "auto";
    const width = Math.max(arme1.offsetWidth, arme2.offsetWidth);
    arme1.style.width = width + "px";
    arme2.style.width = width + "px";

    // Désactivation des champs armes si on est en phase de combat
    if (init_round) {
      arme1.disabled = true;
      arme2.disabled = true;
    }
    else {
      arme1.disabled = false;
      arme2.disabled = false;
    }
  }

  // Affichage des états temporaires
  afficher_etats_temporaires();
}

/**
 * Affiche les états temporaires du personnage
 */
function afficher_etats_temporaires() {
  dialog_details_2.querySelector(".etats").innerHTML = "";
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
  dialog_details_2.querySelector(".etats").appendChild(colgroup);

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
    td2.innerHTML = e.Bonus;
    tr.appendChild(td2);
    const td3 = document.createElement("td");
    td3.style.textAlign = "right";
    td3.innerHTML = "(" + (e.Timing - Nb_rounds * 5 - 5) + " s)";
    tr.appendChild(td3);
    const td4 = document.createElement("td");
    td4.innerHTML =
      "<img src='images/Supprimer.png' onclick='delete_etat(" + i + ");' alt='Supprimer'" +
      "style='width: 20px; height: 20px; cursor: pointer; vertical-align: middle;'>";
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
        dialog_details_2.querySelector(".etats").appendChild(tr);
        tr = null;
      }
    }
    else {
      dialog_details_2.querySelector(".etats").appendChild(tr);
      tr = null;
    }
  }
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
  afficher_etats_temporaires();
}

/**
 * Affiche le dialogue d'attaque selon la phase du combat
 * @param {number} phase - Phase du combat (1: choix arme, 2: jet dés, 3: localisation)
 */
function afficher_attaque(phase) {
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
    const loc_att = new_loc();

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
function affiche_def() {
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
 * Affiche le dialogue de défense selon la phase du combat
 * @param {number} phase - Phase du combat (1: choix défense, 2: jet dés et résultat)
 */
function afficher_defense(phase) {
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

    affiche_def();
  }
}

/**
 * Génère une nouvelle localisation d'attaque aléatoire
 * Utilise des tables de localisation différentes selon
 *      le type d'arme : à distance ou au corps à corps
 */
function new_loc() {
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
 * Affiche le dialogue de paramètrage d'un sort
 */
function afficher_param_sort(sort) {
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
 * Affiche le dialogue de paramètrage d'un sort
 */
function afficher_confirmation_sort() {
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
function afficher_model() {
  const model = Models.find((m) => m.Nom_model === m_selected.Model);

  // Remplissage des champs du modèle
  dialog_model_1.querySelector(".nom_model").textContent = model.Nom_model;
  dialog_model_1.querySelector(".race_select").value = model.Race.toLowerCase();
  dialog_model_1.querySelector(".magie_select").value = model.Magie_type.toLowerCase();

  dialog_model_1.querySelector(".force_score").value = model.Force;
  dialog_model_1.querySelector(".constitution_score").value = model.Constitution;
  dialog_model_1.querySelector(".vivacite_physique_score").value = model.Vivacite_physique;
  dialog_model_1.querySelector(".perception_score").value = model.Perception;

  dialog_model_1.querySelector(".vivacite_mentale_score").value = model.Vivacite_mentale;
  dialog_model_1.querySelector(".volonte_score").value = model.Volonte;
  dialog_model_1.querySelector(".abstraction_score").value = model.Abstraction;
  dialog_model_1.querySelector(".charisme_score").value = model.Charisme;

  dialog_model_1.querySelector(".adaptation_score").value = model.Adaptation;
  dialog_model_1.querySelector(".combat_score").value = model.Combat;
  dialog_model_1.querySelector(".foi_score").value = model.Foi;
  dialog_model_1.querySelector(".magie_score").value = model.Magie;
  dialog_model_1.querySelector(".memoire_score").value = model.Memoire;
  dialog_model_1.querySelector(".telepathie_score").value = model.Telepathie;

  dialog_model_1.querySelector(".force_experience").value = model.Force_experience;
  dialog_model_1.querySelector(".constitution_experience").value = model.Constitution_experience;
  dialog_model_1.querySelector(".vivacite_physique_experience").value = model.Vivacite_physique_experience;
  dialog_model_1.querySelector(".perception_experience").value = model.Perception_experience;

  dialog_model_1.querySelector(".vivacite_mentale_experience").value = model.Vivacite_mentale_experience;
  dialog_model_1.querySelector(".volonte_experience").value = model.Volonte_experience;
  dialog_model_1.querySelector(".abstraction_experience").value = model.Abstraction_experience;
  dialog_model_1.querySelector(".charisme_experience").value = model.Charisme_experience;

  dialog_model_1.querySelector(".adaptation_experience").value = model.Adaptation_experience;
  dialog_model_1.querySelector(".combat_experience").value = model.Combat_experience;
  dialog_model_1.querySelector(".foi_experience").value = model.Foi_experience;
  dialog_model_1.querySelector(".magie_experience").value = model.Magie_experience;
  dialog_model_1.querySelector(".memoire_experience").value = model.Memoire_experience;
  dialog_model_1.querySelector(".telepathie_experience").value = model.Telepathie_experience;

  // Centre tous les inputs & met à jour les ajustements
  dialog_model_1.querySelectorAll("input").forEach((input) => {
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
  dialog_model_1.querySelector(".race_select").dispatchEvent(event);

  // Afficher la modale
  dialog_model_1.showModal();
}

// === ÉVÉNEMENTS ===
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

// === ÉVÉNEMENTS POUR LES DÉTAILS DE PERSONNAGES ===
// Gestion des dialogues de création et modification de personnages

// Empêche le menu contextuel sur le dialogue de création
dialog_details_1.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

// Fermeture du dialogue de création
dialog_details_1.querySelector("#Fermer").addEventListener("click", function (event) {
  dialog_details_1.close();
});

// Création d'un nouveau personnage
dialog_details_1.querySelector("#model").addEventListener("change", function (event) {
  // Récupération des informations du dialogue
  const model = dialog_details_1.querySelector("#model");
  const col = dialog_details_1.querySelector("#col");
  const row = dialog_details_1.querySelector("#row");

  // Création du nouveau pion
  const p = new Pion("ennemis", model.value);

  // Positionnement du pion
  p.Position = col.value + "," + row.value;
  Pions[Pions.length] = p;

  // Synchronisation avec le serveur
  p.sendMessage("setall");

  dialog_details_1.close();

  // Affichage des détails du personnage créé
  afficher_Details(col.value, row.value);

  // Mise à jour de l'affichage
  Map.generateHexMap();
  Map.drawHexMap();
});

// Gestion de la saisie de la note
dialog_details_2.querySelector(".note").addEventListener("input", function (event) {
  m_selected.Note = event.target.value;
  sendMessage("Map_Note", m_selected.Model + "@" + m_selected.Indice + "@" + event.target.value);
});

// Gestion des modifications des champs de personnage
for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("input", function (event) {
    // Conversion du nom de classe en nom de propriété
    const field =
      event.target.className.charAt(0).toUpperCase() +
      event.target.className.slice(1).toLowerCase();

    // Gestion spéciale pour le champ Titre
    if (["Titre"].includes(field)) {
      m_selected[field] = event.target.value;
    }
    // Gestion spéciale pour le champ Type
    else if (["Type"].includes(field)) {
      m_selected[field] = event.target.checked ? "allies" : "ennemis";
    }
    // Gestion des cases à cocher
    else if (event.target.type === "checkbox") {
      m_selected[field] = event.target.checked;
    }
    // Gestion des champs numériques
    else {
      const value = parseInt(event.target.value, 10);
      m_selected[field] = value;

      // Couleur selon la valeur (rouge pour négatif)
      if (value >= 0) event.target.style.backgroundColor = "";
      else event.target.style.backgroundColor = "rgb(192, 64, 64)";
    }

    // Mise à jour de l'armure calculée
    dialog_details_2.querySelector(".armure").value = m_selected.armure_generale();

    // Mise à jour de la carte
    Map.generateHexMap();
    Map.drawHexMap();

    // Synchronisation avec le serveur
    sendMessage("Map_" + field, m_selected.Model + "@" + m_selected.Indice + "@" + event.target.value);
  });
}

function info_arme() {
  let score1 = null;
  let score2 = null;

  // Bonus de compétence d'arme
  if (m_selected.Arme1 !== "" && m_selected.Arme1 !== "Lancement de sort")
    score1 = m_selected.get_competence(Armes.find((a) => a.Nom_arme === m_selected.Arme1).Competence);
  if (m_selected.Arme2 !== "" && m_selected.Arme2 !== "Lancement de sort")
    score2 = m_selected.get_competence(Armes.find((a) => a.Nom_arme === m_selected.Arme2).Competence);

  // Malus d'escrime pour combat à deux armes
  if (score1 !== null &&
    m_selected.Arme1 &&
    m_selected.Arme1 !== "" &&
    score2 !== null &&
    m_selected.Arme2 &&
    m_selected.Arme2 !== "") {
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
  dialog_details_2.querySelector(".info_principale").textContent = score1 !== null ? " (" + score1 + ")" : "(-)";
  dialog_details_2.querySelector(".info_secondaire").textContent = score2 !== null ? " (" + score2 + ")" : "(-)";
}

// Gestion du changement d'arme principale
const arme1 = dialog_details_2.querySelector(".arme1");
arme1.addEventListener("change", function (event) {
  return arme1.click();
});
arme1.addEventListener("click", function (event) {
  // Vérifier si la souris est au-dessus du select au moment du clic
  const rect = arme1.getBoundingClientRect();
  const isClickInside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  // Attendre que la sélection soit effectuée pour lire la valeur
  setTimeout(() => {
    const p_selected = Models.find((p) => p.Nom_model === m_selected.Model);
    const arme2 = dialog_details_2.querySelector(".arme2");
    let w1 = Armes.find((x) => x.Nom_arme === arme1.value);
    let nouvelleOption = null;

    // Ouvrir la modale de magie si "Lancement de sort" est sélectionné
    afficher_Details_arme1();
    if (arme1.value === "Lancement de sort") {
      if (!isClickInside) {
        document.getElementById("modal").style.display = "flex";
        dialog_details_2.style.zIndex = 0;

        // Réinitialiser tous les boutons de liste avant de mettre en vert
        Object.keys(shortName).forEach((key) => {
          const element = document.getElementById(key);
          if (element) {
            element.style.color = "";
            element.style.backgroundColor = "";
          }
        });

        // Mettre en vert les listes des sorts connus du personnage sélectionné
        SortsConnus.filter((s) => s.Nom_model === m_selected.Model).forEach((x) => {
          const element = document.getElementById(getShortName(x.Nom_liste));
          if (element) {
            element.style.color = "white";
            element.style.backgroundColor = "green";
          }
        }
        );

        // Mettre en vert la liste de prêtre et sa liste jumelée si le personnage sélectionné en a une
        if (p_selected && p_selected.Liste_pretre) {
          // Trouver la liste de prêtre dans le tableau Listes
          const listePretre = Listes.find((l) => l.Nom_liste === p_selected.Liste_pretre);

          if (listePretre) {
            // Mettre en vert le bouton de la liste de prêtre
            const shortNamePretre = getShortName(p_selected.Liste_pretre);
            if (shortNamePretre) {
              const elementPretre = document.getElementById(shortNamePretre);
              if (elementPretre) {
                elementPretre.style.color = "white";
                elementPretre.style.backgroundColor = "green";
              }
            }

            // Mettre en vert le bouton de la liste jumelée si elle existe
            if (listePretre.Nom_jumelee && listePretre.Nom_jumelee !== "") {
              const shortNameJumelee = getShortName(listePretre.Nom_jumelee);
              if (shortNameJumelee) {
                const elementJumelee = document.getElementById(shortNameJumelee);
                if (elementJumelee) {
                  elementJumelee.style.color = "white";
                  elementJumelee.style.backgroundColor = "green";
                }
              }
            }
          }
        }
      }
    } else {
      // Réinitialiser tous les boutons quand on ne sélectionne plus "Lancement de sort"
      Object.keys(shortName).forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
          element.style.color = "";
          element.style.backgroundColor = "";
        }
      });

      m_selected.Nom_liste = null;
      m_selected.Nom_sort = null;
      m_selected.Incantation = 0;
      m_selected.Fatigue_sort = 0;
      m_selected.Concentration_sort = 0;
    }

    // Vérification si le personnage est un monstre
    const is_monster = Armes.some((arme) => arme.Nom_arme === m_selected.Model);

    // Nettoyage et ajout d'une option vide
    while (arme2.options.length > 0) arme2.removeChild(arme2.lastChild);

    nouvelleOption = document.createElement("option");
    nouvelleOption.value = "";
    nouvelleOption.textContent = "--";
    arme2.appendChild(nouvelleOption);

    // Gestion spéciale pour le lancement de sort et les armes à deux mains
    if (arme1.value === "Lancement de sort" || (w1 && typeof w1 !== "undefined" && w1.Deux_mains)) {
      arme2.value = "";
    }
    // Gestion des armes normales
    else {
      // Ajout des armes disponibles du modèle
      if (!is_monster) {
        Armes.filter((arme) => !arme.Is_personnel).forEach((arme) => {
          if (arme.Deux_mains) return;

          const nouvelleOption = document.createElement("option");
          nouvelleOption.value = arme.Nom_arme;
          nouvelleOption.textContent = arme.Nom_arme;
          arme2.appendChild(nouvelleOption);
        });
      }

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

    // Ajustement de la largeur des sélecteurs
    arme1.style.width = "auto";
    arme2.style.width = "auto";
    const width = Math.max(arme1.offsetWidth, arme2.offsetWidth);
    arme1.style.width = width + "px";
    arme2.style.width = width + "px";

    // Mise à jour des armes sélectionnées
    m_selected.Arme1 = arme1.value;
    m_selected.Arme2 = arme2.value;

    // Mise à jour de l'information affichée
    if (arme1.value !== "Lancement de sort") info_arme();
  }, 0);
});

// Gestion du changement d'arme secondaire
dialog_details_2.querySelector(".arme2").addEventListener("change", function (event) {
  m_selected.Arme2 = event.target.value;

  // Mise à jour de l'information affichée
  info_arme();
});

// Empêche le menu contextuel sur le dialogue de détails
dialog_details_2.addEventListener("contextmenu", function (event) {
  event.preventDefault();
});

// Fermeture du dialogue de détails
dialog_details_2.querySelector("#Fermer").addEventListener("click", function (event) {
  // Synchronisation finale avec le serveur
  m_selected.sendMessage("setall");

  dialog_details_2.close();
});

// Duplication du personnage
dialog_details_2.querySelector("#Dupliquer").addEventListener("click", function (event) {
  m_selected.dupliquer();
});

// Gestion du clic sur la class model de la boite de dialog_detail_2
dialog_details_2.querySelector(".model").addEventListener("click", function (event) {
  afficher_model();
});

// === ÉVÉNEMENTS D'ATTAQUE ===
// Gestion des interactions avec les dialogues d'attaque

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
  afficher_attaque(2);
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
  afficher_attaque(2);
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
  afficher_attaque(3);
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
    const new_jet = new_loc();
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
    afficher_defense(1);
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

// === ÉVÉNEMENTS DE DÉFENSE ===
// Gestion des interactions avec les dialogues de défense

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
  afficher_defense(2);
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
  afficher_defense(2);
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
  afficher_defense(2);
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

  affiche_def();
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

// === ÉVÉNEMENTS POUR LE PARAMÉTRAGE DE SORT ===
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

// Bouton "Acter" (Valide la sélection spécifique et ferme le dialogue)
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
});


// Quand on change la race dans la modale modèle PJ, on met à jour les attributs _race
dialog_model_1.querySelector(".race_select").addEventListener("change", function () {
  const race = dialog_model_1.querySelector(".race_select").value;
  const attr = attributs_races[race];

  // Remplir les champs *_race de la modale
  dialog_model_1.querySelector(".force_race").value = attr.force;
  dialog_model_1.querySelector(".constitution_race").value = attr.constitution;
  dialog_model_1.querySelector(".vivacite_physique_race").value = attr.vivacite_physique;
  dialog_model_1.querySelector(".perception_race").value = attr.perception;

  dialog_model_1.querySelector(".vivacite_mentale_race").value = attr.vivacite_mentale;
  dialog_model_1.querySelector(".volonte_race").value = attr.volonte;
  dialog_model_1.querySelector(".abstraction_race").value = attr.abstraction;
  dialog_model_1.querySelector(".charisme_race").value = attr.charisme;

  dialog_model_1.querySelector(".adaptation_race").value = attr.adaptation;
  dialog_model_1.querySelector(".combat_race").value = attr.combat;
  dialog_model_1.querySelector(".foi_race").value = attr.foi;
  dialog_model_1.querySelector(".magie_race").value = attr.magie;
  dialog_model_1.querySelector(".memoire_race").value = attr.memoire;
  dialog_model_1.querySelector(".telepathie_race").value = attr.telepathie;
});

// Gestion du changement des scores et des expériences
dialog_model_1.addEventListener("change", function (event) {
  if (!event.target.className.includes("_score") && !event.target.className.includes("_experience"))
    return;

  // On garde seulement les chiffres
  event.target.value = event.target.value.replace(/[^0-9]/g, "");

  // La suite ne s'applique que si c'est un score
  if (!event.target.className.includes("_score")) return;

  // On calcule l'ajustement
  dialog_model_1.querySelector(`.${event.target.className.replace("_score", "_ajustement")}`).value =
    Math.floor((parseInt(event.target.value) - 10) / 2);

  // On met à jour les 4 éléments calculés et leur 4 ajustements
  dialog_model_1.querySelector(".niveau_physique_score").value = Math.round((
    parseInt(dialog_model_1.querySelector(".force_score").value) +
    parseInt(dialog_model_1.querySelector(".constitution_score").value) +
    parseInt(dialog_model_1.querySelector(".vivacite_physique_score").value) +
    parseInt(dialog_model_1.querySelector(".perception_score").value)) / 4);

  dialog_model_1.querySelector(".niveau_physique_ajustement").value = Math.floor((
    dialog_model_1.querySelector(".niveau_physique_score").value - 10) / 2);

  dialog_model_1.querySelector(".niveau_mental_score").value = Math.round((
    parseInt(dialog_model_1.querySelector(".volonte_score").value) +
    parseInt(dialog_model_1.querySelector(".abstraction_score").value) +
    parseInt(dialog_model_1.querySelector(".vivacite_mentale_score").value) +
    parseInt(dialog_model_1.querySelector(".charisme_score").value)) / 4);

  dialog_model_1.querySelector(".niveau_mental_ajustement").value = Math.floor((
    dialog_model_1.querySelector(".niveau_mental_score").value - 10) / 2);

  dialog_model_1.querySelector(".coordination_score").value = Math.round((
    parseInt(dialog_model_1.querySelector(".vivacite_physique_score").value) +
    parseInt(dialog_model_1.querySelector(".perception_score").value) +
    parseInt(dialog_model_1.querySelector(".vivacite_mentale_score").value)) / 3);

  dialog_model_1.querySelector(".coordination_ajustement").value = Math.floor((
    dialog_model_1.querySelector(".coordination_score").value - 10) / 2);

  dialog_model_1.querySelector(".sixieme_sens_score").value = Math.round((
    parseInt(dialog_model_1.querySelector(".adaptation_score").value) +
    parseInt(dialog_model_1.querySelector(".perception_score").value)) / 2);

  dialog_model_1.querySelector(".sixieme_sens_ajustement").value = Math.floor((
    dialog_model_1.querySelector(".sixieme_sens_score").value - 10) / 2);
});

// Bouton "Enregistrer" (Enregistre les modifications du modèle)
dialog_model_1.querySelector(".sauvegarder").addEventListener("click", function (event) {
  // Récupération du modèle
  const Nom_model = dialog_model_1.querySelector(".nom_model").textContent;
  const model = Models.find((m) => m.Nom_model === Nom_model);

  // Enregistrement de la race
  const raceOption = dialog_model_1.querySelector(".race_select").value;
  model.Race = raceOption.charAt(0).toUpperCase() + raceOption.slice(1);
  sendMessage("Set", "Race@" + model.Race + "@Model@" + model.Nom_model);

  // Enregistrement du type de magie
  const magieOption = dialog_model_1.querySelector(".magie_select").value;
  model.Magie_type = magieOption.charAt(0).toUpperCase() + magieOption.slice(1);
  sendMessage("Set", "Magie_type@" + model.Magie_type + "@Model@" + model.Nom_model);

  // On traite tous les champs "input" du modèle
  dialog_model_1.querySelectorAll("input").forEach((input) => {
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
/**
 * FICHIER DLG_DIVERS.JS
 * ==================
 * Gestion des dialogues et interfaces utilisateur pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour afficher et gérer les dialogues divers
 */

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
      attaquant.At1_att = false;
      attaquant.At2_att = false;
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
    attaquant.At1_att = false;
    attaquant.At2_att = false;
    dialog_attaque_1.close();
    resoudre_attaque();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
  });

  // Sélection de l'arme principale (1ère main)
  dialog_attaque_1.querySelector(".arme_radio1").addEventListener("change", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    attaquant.At1_att = true;
    attaquant.At2_att = false;
    dialog_attaque_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_attaque(2);
  });

  // Sélection de l'arme secondaire (2nde main)
  dialog_attaque_1.querySelector(".arme_radio2").addEventListener("change", function (event) {
    const attaquant = Pions.find((m) => m.Attaquant);
    attaquant.At1_att = false;
    attaquant.At2_att = true;
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
      attaquant.At1_att = false;
      attaquant.At2_att = false;
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
    attaquant.Jet_att = Math.max(13, jet_0, jet_1, jet_2, jet_3);

    // Calcul du score d'attaque
    const scr_att = calcul_scr_att();

    // Mise à jour de l'interface
    dialog_attaque_2.querySelector(".jet_des").value = attaquant.Jet_att;
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
    attaquant.Loc_att = dialog_attaque_3.querySelector('input[name="loc"]:checked').value;
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
      attaquant.At1_att = false;
      attaquant.At2_att = false;
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
    attaquant.Jet_att =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    // Calcul de la feinte de corps du défenseur
    const fdc_def = calcul_fdc_def();

    // Calcul du score d'attaque
    const scr_att = calcul_scr_att();

    // Mise à jour de l'interface
    dialog_attaque_2.querySelector(".jet_des").value = attaquant.Jet_att;
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
      attaquant.Loc_att = "";

      // Résolution directe de l'attaque échouée
      resoudre_attaque();
      return;
    }

    // Mise à jour de l'interface avec les valeurs d'attaque
    dialog_attaque_3.querySelector(".jet_des").value = attaquant.Jet_att;
    dialog_attaque_3.querySelector(".scr_att").value = scr_att;

    // Couleur selon le succès/échec
    if (scr_att >= 0) {
      dialog_attaque_3.querySelector(".scr_att").style.backgroundColor = "rgb(128, 255, 128)"; // Vert pour succès
    } else {
      dialog_attaque_3.querySelector(".scr_att").style.backgroundColor = "rgb(255, 128, 128)"; // Rouge pour échec
    }

    // Génération de la localisation aléatoire
    const Loc_att = genere_loc_attaque();

    // Configuration de l'affichage selon la localisation générée
    // Tête
    if (Loc_att === "tête") {
      dialog_attaque_3.querySelector(".tete").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".tete_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".tete").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".tete_rd").checked = false;
    }

    // Poitrine
    if (Loc_att === "poitrine") {
      dialog_attaque_3.querySelector(".poitrine").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".poitrine_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".poitrine").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".poitrine_rd").checked = false;
    }

    // Abdomen
    if (Loc_att === "abdomen") {
      dialog_attaque_3.querySelector(".abdomen").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".abdomen_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".abdomen").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".abdomen_rd").checked = false;
    }

    // Bras gauche
    if (Loc_att === "bras gauche") {
      dialog_attaque_3.querySelector(".brasg").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".brasg_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".brasg").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".brasg_rd").checked = false;
    }

    // Bras droit
    if (Loc_att === "bras droit") {
      dialog_attaque_3.querySelector(".brasd").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".brasd_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".brasd").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".brasd_rd").checked = false;
    }

    // Jambe gauche
    if (Loc_att === "jambe gauche") {
      dialog_attaque_3.querySelector(".jambeg").closest("td").style.display = "";
      dialog_attaque_3.querySelector(".jambeg_rd").checked = true;
    } else {
      dialog_attaque_3.querySelector(".jambeg").closest("td").style.display = "none";
      dialog_attaque_3.querySelector(".jambeg_rd").checked = false;
    }

    // Jambe droite
    if (Loc_att === "jambe droite") {
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
    (attaquant.At1_att && w1_att.A_distance) ||
    (attaquant.At2_att && w2_att.A_distance);

  // Calcul du score d'attaque
  const scr_att = calcul_scr_att();

  // Calcul du score de défense selon le type
  let scr_def;
  if (is_distant || defenseur.Arme1 === "Lancement de sort") {
    // Esquive uniquement pour les attaques à distance ou les sorts
    scr_def = defenseur.Jet_def - 10 +
      (defenseur.Esq_def ? defenseur.get_score("Esquive") - defenseur.Nb_action : 0);
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
  switch (attaquant.Loc_att) {
    case "abdomen":
      texte_loc = "à l'" + attaquant.Loc_att; // "à l'abdomen"
      break;
    case "bras gauche":
    case "bras droit":
      texte_loc = "au " + attaquant.Loc_att; // "au bras gauche/droit"
      break;
    case "jambe gauche":
    case "jambe droite":
    case "poitrine":
    case "tête":
      texte_loc = "à la " + attaquant.Loc_att; // "à la jambe", "à la poitrine", etc.
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
    (defenseur.Pr1_def && marge > -2) ||
    (defenseur.Pr2_def && marge > -2) ||
    (defenseur.Esq_def && marge > -4)
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
      defenseur.Pr1_def = false;
      defenseur.Pr2_def = false;
      defenseur.Esq_def = false;
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
    defenseur.Pr1_def = false;
    defenseur.Pr2_def = false;
    defenseur.Esq_def = false;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    resoudre_attaque();
  });

  // Sélection de la parade avec arme principale
  dialog_defense_1.querySelector(".arme_radio1").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.Pr1_def = true;
    defenseur.Pr2_def = false;
    defenseur.Esq_def = false;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_defense(2);
  });

  // Sélection de la parade avec arme secondaire
  dialog_defense_1.querySelector(".arme_radio2").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.Pr1_def = false;
    defenseur.Pr2_def = true;
    defenseur.Esq_def = false;
    dialog_defense_1.close();
    setTimeout(function () {
      canvas.focus({ preventScroll: true });
    }, 50);
    affiche_defense(2);
  });

  // Sélection de l'esquive
  dialog_defense_1.querySelector(".arme_radio3").addEventListener("change", function (event) {
    const defenseur = Pions.find((m) => m.Defenseur);
    defenseur.Pr1_def = false;
    defenseur.Pr2_def = false;
    defenseur.Esq_def = true;
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
    defenseur.Jet_def = Math.max(13, jet_0, jet_1, jet_2, jet_3);
    dialog_defense_2.querySelector(".jet_des").value = defenseur.Jet_def;

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
      defenseur.Pr1_def = false;
      defenseur.Pr2_def = false;
      defenseur.Esq_def = false;
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
  const is_distant = (attaquant.At1_att && w1_att.A_distance) || (attaquant.At2_att && w2_att.A_distance);

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
      par_def_1 = defenseur.get_score("Parade_1");
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
      par_def_2 = defenseur.get_score("Parade_2");
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
    entete += defenseur.Pr1_def || defenseur.Pr1_def ? "Vous parez " : "";
    entete += defenseur.Esq_def ? "Vous esquivez " : "";
    entete += attaquant.Titre + "<hr>";
    dialog_defense_2.querySelector(".nom").innerHTML = entete;

    // Lancement de 3D6 pour la défense
    defenseur.Jet_def =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    dialog_defense_2.querySelector(".jet_des").value = defenseur.Jet_def;

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
    m_pion.Fatigue_sort = sort.Niveau;
    m_pion.Concentration_sort = sort.Niveau;
    m_pion.sendMessage("Fatigue_sort");
    m_pion.sendMessage("Concentration_sort");
    dialog_sort_1.close();
  });

  // Sélection de l'amplification 2
  dialog_sort_1.querySelector(".sort_radio2").addEventListener("change", function (event) {
    const sort = Sorts.find((s) =>
      s.Nom_liste === dialog_sort_1.querySelector(".nom_liste").textContent &&
      s.Nom_sort === dialog_sort_1.querySelector(".nom_sort").textContent);
    m_pion.Fatigue_sort = 2 * sort.Niveau;
    m_pion.Concentration_sort = 2 * sort.Niveau;
    m_pion.sendMessage("Fatigue_sort");
    m_pion.sendMessage("Concentration_sort");
    dialog_sort_1.close();
  });

  // Sélection de l'amplification 3
  dialog_sort_1.querySelector(".sort_radio3").addEventListener("change", function (event) {
    const sort = Sorts.find((s) =>
      s.Nom_liste === dialog_sort_1.querySelector(".nom_liste").textContent &&
      s.Nom_sort === dialog_sort_1.querySelector(".nom_sort").textContent);
    m_pion.Fatigue_sort = 3 * sort.Niveau;
    m_pion.Concentration_sort = 3 * sort.Niveau;
    m_pion.sendMessage("Fatigue_sort");
    m_pion.sendMessage("Concentration_sort");
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
    m_pion.Fatigue_sort = dialog_sort_1.querySelector(".fatigue_cout").value;
    m_pion.Concentration_sort = dialog_sort_1.querySelector(".concentration_cout").value;
    m_pion.sendMessage("Fatigue_sort");
    m_pion.sendMessage("Concentration_sort");
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

    affiche_pion();
  });
}
/**
 * Affiche le dialogue de paramètrage d'un sort
 */
function affiche_param_sort(sort) {
  // Récupération du modèle du personnage lanceur de sort
  const model_object = Models.find((m) => m.Nom_model === m_pion.Model);

  // Initialisation des champs du dialogue
  dialog_sort_1.querySelector(".nom").textContent = m_pion.Titre;
  dialog_sort_1.querySelector(".nom_liste").textContent = sort.Nom_liste;
  dialog_sort_1.querySelector(".nom_sort").textContent = sort.Nom_sort;
  dialog_sort_1.querySelector(".fatigue_actuelle").value = m_pion.Fatigue;
  dialog_sort_1.querySelector(".concentration_actuelle").value = m_pion.Concentration;
  dialog_sort_1.querySelector(".fatigue_max").textContent = model_object.get("fatigue");
  dialog_sort_1.querySelector(".concentration_max").textContent = model_object.Concentration;
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
  const competence_mage = magicien.get_score("Maîtriser la magie");
  const competence_pretre = magicien.get_score("Théognosie");
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
      case "competence":
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

function genere_loc_attaque() {
    const attaquant = Pions.find((m) => m.Attaquant);
  
    // Détermination du type d'arme (à distance ou corps à corps)
    let A_distance = null;
    if (attaquant.At1_att) A_distance = Armes.find((w) => w.Nom_arme === attaquant.Arme1).A_distance;
    if (attaquant.At2_att) A_distance = Armes.find((w) => w.Nom_arme === attaquant.Arme2).A_distance;
  
    // Génération aléatoire de la localisation
    let Loc_att = "";
    while (true) {
      const jet_loc = Math.floor(Math.random() * 20) + 1;
  
      // Table de localisation pour armes de corps à corps
      if (!A_distance) {
        if (jet_loc < 4) Loc_att = "jambe gauche";
        else if (jet_loc < 7) Loc_att = "jambe droite";
        else if (jet_loc < 10) Loc_att = "abdomen";
        else if (jet_loc < 13) Loc_att = "poitrine";
        else if (jet_loc < 16) Loc_att = "bras gauche";
        else if (jet_loc < 19) Loc_att = "bras droit";
        else Loc_att = "tête";
      } else {
        if (jet_loc < 5) Loc_att = "jambe gauche";
        else if (jet_loc < 9) Loc_att = "jambe droite";
        else if (jet_loc < 13) Loc_att = "abdomen";
        else if (jet_loc < 16) Loc_att = "poitrine";
        else if (jet_loc < 18) Loc_att = "bras gauche";
        else if (jet_loc < 20) Loc_att = "bras droit";
        else Loc_att = "tête";
      }
  
      if (dialog_attaque_2.querySelector(".tete").checked && Loc_att === "tête") break;
      if (dialog_attaque_2.querySelector(".poitrine").checked && Loc_att === "poitrine") break;
      if (dialog_attaque_2.querySelector(".abdomen").checked && Loc_att === "abdomen") break;
      if (dialog_attaque_2.querySelector(".brasg").checked && Loc_att === "bras gauche") break;
      if (dialog_attaque_2.querySelector(".brasd").checked && Loc_att === "bras droit") break;
      if (dialog_attaque_2.querySelector(".jambeg").checked && Loc_att === "jambe gauche") break;
      if (dialog_attaque_2.querySelector(".jambed").checked && Loc_att === "jambe droite") break;
    }
  
    return Loc_att;
  }
  
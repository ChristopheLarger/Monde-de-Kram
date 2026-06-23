/**
 * FICHIER DLG_COMBAT.JS
 * =====================
 * Gestion des fenêtres de combat
 */

// === VARIABLES GLOBALES DE DLG_COMBAT ===
let attaquant = null;
let defenseur = null;
let old_defenseur = null;

let double_attaque = false;
let contre_attaque = false;
let main_imposee = 0; // Arme de la seconde attaque : la même que la première en double attaque et l'autre en contre-attaque (1 ou 2)

let affiche_fdc_details = true;
let affiche_att_details = true;
let affiche_ciblage_details = true;
let affiche_def_details = true;

let zone_selectionnee = null;

let melee = null;

/**
 * Initialise le combat
 * @param {Object} new_melee - Nouveau combat
 */
function initialise_melee() {
  melee = Melees[0];
  const liste = melee.get_attaquants_sans_avantage();
  if (liste.length > 0) {
    attaquant = melee.defenseur;
    defenseur = liste[0].pion;
  }
  else {
    attaquant = melee.attaquants[0].pion;
    defenseur = melee.defenseur;
  }
}

// ----------------------------------------- //
// ---------------- ATTAQUE ---------------- //
// ----------------------------------------- //

initialise_attaque();
function initialise_attaque() {
  // Gestion des boutons de la fenêtre d'attaque
  document.querySelector('#table_attaque .rafraichir').addEventListener("click", function (event) {
    affiche_attaque();
  });

  document.querySelector('#table_attaque .annuler').addEventListener("click", function (event) {
    document.querySelector('#table_attaque').style.display = 'none';
  });

  document.querySelector('#table_attaque .appliquer').addEventListener("click", function (event) {
    if (document.querySelector('#table_attaque .arme_radio1').checked) {
      attaquant.Arme1_engagee = true;
    }
    else {
      attaquant.Arme2_engagee = true;
    }
    document.querySelector('#table_defense .marge_attaque').value =
      document.querySelector('#table_attaque .resultat').value;

    document.querySelector('#table_attaque').style.display = 'none';

    if (document.querySelector('#table_attaque .resultat').value >= 0) affiche_defense();
  });

  document.querySelector('#table_attaque .resultat').addEventListener("input", function (event) {
    document.querySelector('#table_attaque .appliquer').disabled = false;
  });

  // Gestion des radio buttons des armes
  document.querySelectorAll('#table_attaque .arme_radio1, #table_attaque .arme_radio2').forEach(element =>
    element.addEventListener("change", function (event) {
      let nom_arme = null;
      if (element.classList.contains('arme_radio1')) {
        nom_arme = document.querySelector('#table_attaque .main1').innerText;
      }
      else {
        nom_arme = document.querySelector('#table_attaque .main2').innerText;
      }

      if (!nom_arme.includes("Arme naturelle ")) {
        const arme = Armes.find(arme => arme.Nom_arme === nom_arme);
        const is_distant = arme.A_distance;
        if (!is_distant) {
          document.querySelector('#table_attaque .att_temps_pour_viser').checked = false;
          document.querySelector('#table_attaque .att_courte_portee').checked = false;
          document.querySelector('#table_attaque .att_longue_portee').checked = false;
        }
        else {
          document.querySelector('#table_attaque .att_gene_mouvements').checked = false;
          document.querySelector('#table_attaque .att_economie_energie').checked = false;
          document.querySelector('#table_attaque .att_double_attaque').checked = false;
        }

        // Affichage des éléments de l'attaque en fonction de la distance
        document.querySelectorAll('#table_attaque .att_distante').forEach(element => element.style.display = is_distant ? '' : 'none');
        document.querySelectorAll('#table_attaque .att_melee').forEach(element => element.style.display = is_distant ? 'none' : '');
      }
      else { // Arme naturelle (monstre) : pas d'attaque à distance, ni autres options
        document.querySelector('#table_attaque .att_temps_pour_viser').checked = false;
        document.querySelector('#table_attaque .att_courte_portee').checked = false;
        document.querySelector('#table_attaque .att_longue_portee').checked = false;
        document.querySelector('#table_attaque .att_gene_mouvements').checked = false;
        document.querySelector('#table_attaque .att_economie_energie').checked = false;
        document.querySelector('#table_attaque .att_double_attaque').checked = false;
        document.querySelectorAll('#table_attaque .att_distante').forEach(element => element.style.display = 'none');
        document.querySelectorAll('#table_attaque .att_melee').forEach(element => element.style.display = '');
      }

      // Malus de mauvaise main (Humanoïdes)
      document.querySelector('#table_attaque .att_mauvaise_main').value = 0;
      const model_att = Models.find(x => x.Nom_model === attaquant.Model);
      if (!model_att.Is_monster) {
        const av = Avantages.find(avantage => avantage.Nom_model === attaquant.Model && avantage.Nom === "Ambidextrie" && avantage.Selection);
        if (element.classList.contains('arme_radio2') && attaquant.Arme1 !== "" && (av === undefined || av === null)) {
          document.querySelector('#table_attaque .att_mauvaise_main').value = -Math.max(Math.floor((18 - model_att.get("coordination")) / 2), 0);
        }
      }

      // Mise à jour du score de l'attaque
      const jet = parseInt(document.querySelector('#table_attaque .jet_des_attaque').value);
      if (!isNaN(jet)) {
        document.querySelector('#table_attaque .resultat').value = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
      }
      else calcul_attaque();
    }));

  document.querySelectorAll('#table_attaque .main1').forEach(element =>
    element.addEventListener("click", function (event) {
      document.querySelector('#table_attaque .arme_radio1').checked = true;
      document.querySelector('#table_attaque .arme_radio1').dispatchEvent(new Event('change'));
    }));

  document.querySelectorAll('#table_attaque .main2').forEach(element =>
    element.addEventListener("click", function (event) {
      document.querySelector('#table_attaque .arme_radio2').checked = true;
      document.querySelector('#table_attaque .arme_radio2').dispatchEvent(new Event('change'));
    }));

  // Affichage du détails du calcul du détails de l'attaque et de la Feinte de corps
  document.querySelectorAll('#table_attaque .fdc_titre, #table_attaque .att_titre').forEach(element =>
    element.addEventListener("click", function (event) {
      const fdc_details = document.querySelector('#table_attaque .fdc_details');
      fdc_details.style.display = fdc_details.style.display === 'none' ? 'table' : 'none';
      affiche_fdc_details = !affiche_fdc_details;

      const att_details = document.querySelector('#table_attaque .att_details');
      att_details.style.display = att_details.style.display === 'none' ? 'table' : 'none';
      affiche_att_details = !affiche_att_details;
    }));

  // Affichage du détails du calcul du ciblage des zones
  document.querySelector('#table_attaque .ciblage_titre').addEventListener("click", function (event) {
    const ciblage_details = document.querySelector('#table_attaque .ciblage_details');
    ciblage_details.style.display = ciblage_details.style.display === 'none' ? 'table' : 'none';
    affiche_ciblage_details = !affiche_ciblage_details;
  });

  // Gestion des checkboxes du défenseur
  ["immobile", "heroisme", "mobilite_reduite", "mobilite_tres_reduite", "non_concentre", "legerement_aveugle", "fortement_aveugle"].forEach(element => {
    document.querySelector(`#table_attaque .def_${element}`).addEventListener("change", function (event) {
      defenseur[`Def_${element}`] = event.target.checked;
      switch (element) {
        case "mobilite_reduite":
          if (event.target.checked && document.querySelector("#table_attaque .def_mobilite_tres_reduite").checked) {
            document.querySelector("#table_attaque .def_mobilite_tres_reduite").checked = false;
            document.querySelector("#table_attaque .def_mobilite_tres_reduite").dispatchEvent(new Event('change'));
          }
          break;
        case "mobilite_tres_reduite":
          if (event.target.checked && document.querySelector("#table_attaque .def_mobilite_reduite").checked) {
            document.querySelector("#table_attaque .def_mobilite_reduite").checked = false;
            document.querySelector("#table_attaque .def_mobilite_reduite").dispatchEvent(new Event('change'));
          }
          break;
        case "legerement_aveugle":
          if (event.target.checked && document.querySelector("#table_attaque .def_fortement_aveugle").checked) {
            document.querySelector("#table_attaque .def_fortement_aveugle").checked = false;
            document.querySelector("#table_attaque .def_fortement_aveugle").dispatchEvent(new Event('change'));
          }
          break;
        case "fortement_aveugle":
          if (event.target.checked && document.querySelector("#table_attaque .def_legerement_aveugle").checked) {
            document.querySelector("#table_attaque .def_legerement_aveugle").checked = false;
            document.querySelector("#table_attaque .def_legerement_aveugle").dispatchEvent(new Event('change'));
          }
          break;
      }
      document.querySelector('#table_attaque .feinte_de_corps').value = calcul_feinte_de_corps();
      document.querySelector('#table_attaque .score_attaque').value = calcul_attaque();

      const jet = parseInt(document.querySelector('#table_attaque .jet_des_attaque').value);
      document.querySelector('#table_attaque .resultat').value = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
    });
  });

  // Gestion des checkboxes de l'attaquant
  ["avantage_positionnel", "heroisme", "temps_pour_viser", "courte_portee", "longue_portee", "gene_mouvements", "economie_energie", "desavantage_positionnel", "double_attaque"].forEach(element => {
    document.querySelector(`#table_attaque .att_${element}`).addEventListener("change", function (event) {
      attaquant[`Att_${element}`] = event.target.checked;
      switch (element) {
        case "avantage_positionnel":
          if (event.target.checked && document.querySelector("#table_attaque .att_desavantage_positionnel").checked) {
            document.querySelector("#table_attaque .att_desavantage_positionnel").checked = false;
            document.querySelector("#table_attaque .att_desavantage_positionnel").dispatchEvent(new Event('change'));
          }
          break;
        case "desavantage_positionnel":
          if (event.target.checked && document.querySelector("#table_attaque .att_avantage_positionnel").checked) {
            document.querySelector("#table_attaque .att_avantage_positionnel").checked = false;
            document.querySelector("#table_attaque .att_avantage_positionnel").dispatchEvent(new Event('change'));
          }
          break;
        case "courte_portee":
          if (event.target.checked && document.querySelector("#table_attaque .att_longue_portee").checked) {
            document.querySelector("#table_attaque .att_longue_portee").checked = false;
            document.querySelector("#table_attaque .att_longue_portee").dispatchEvent(new Event('change'));
          }
          break;
        case "longue_portee":
          if (event.target.checked && document.querySelector("#table_attaque .att_courte_portee").checked) {
            document.querySelector("#table_attaque .att_courte_portee").checked = false;
            document.querySelector("#table_attaque .att_courte_portee").dispatchEvent(new Event('change'));
          }
          break;
      }
      document.querySelector('#table_attaque .feinte_de_corps').value = calcul_feinte_de_corps();
      document.querySelector('#table_attaque .score_attaque').value = calcul_attaque();

      const jet = parseInt(document.querySelector('#table_attaque .jet_des_attaque').value);
      if (!isNaN(jet)) {
        document.querySelector('#table_attaque .resultat').value = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
      }
    });
  });

  // Gestion des boutons de la fenêtre d'attaque
  document.querySelector('#table_attaque .lancer').addEventListener("click", function (event) {
    let jet = 0;
    jet += Math.floor(Math.random() * 6) + 1;
    jet += Math.floor(Math.random() * 6) + 1;
    jet += Math.floor(Math.random() * 6) + 1;

    document.querySelector('#table_attaque .jet_des_attaque').value = jet;
    document.querySelector('#table_attaque .chance').disabled = false;
    document.querySelector('#table_attaque .appliquer').disabled = false;

    let resultat = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
    ['tete', 'brasg', 'poitrine', 'brasd', 'abdomen', 'jambeg', 'jambed'].forEach(z => {
      if (!document.querySelector('#table_attaque .' + z).checked) resultat -= 1;
    });
    document.querySelector('#table_attaque .resultat').value = resultat;
  });

  document.querySelector('#table_attaque .chance').addEventListener("click", function (event) {
    let jet1 = 0;
    jet1 += Math.floor(Math.random() * 6) + 1;
    jet1 += Math.floor(Math.random() * 6) + 1;
    jet1 += Math.floor(Math.random() * 6) + 1;

    let jet2 = 0;
    jet2 += Math.floor(Math.random() * 6) + 1;
    jet2 += Math.floor(Math.random() * 6) + 1;
    jet2 += Math.floor(Math.random() * 6) + 1;

    let jet3 = 0;
    jet3 += Math.floor(Math.random() * 6) + 1;
    jet3 += Math.floor(Math.random() * 6) + 1;
    jet3 += Math.floor(Math.random() * 6) + 1;

    let jet = Math.max(jet1, jet2, jet3, 13, parseInt(document.querySelector('#table_attaque .jet_des_attaque').value));

    document.querySelector('#table_attaque .jet_des_attaque').value = jet;

    let resultat = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
    ['tete', 'brasg', 'poitrine', 'brasd', 'abdomen', 'jambeg', 'jambed'].forEach(z => {
      if (!document.querySelector('#table_attaque .' + z).checked) resultat -= 1;
    });
    document.querySelector('#table_attaque .resultat').value = resultat;
  });

  // Gestion des checkboxes du ciblage des zones
  ['tete', 'brasg', 'poitrine', 'brasd', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
    document.querySelector('#table_attaque .' + zone).addEventListener("change", function (event) {
      if (!event.target.checked) {
        // Le résultat ne peut pas être négatif
        if (parseInt(document.querySelector('#table_attaque .resultat').value) <= 0) event.target.checked = true;

        // On refuse de désactiver la zone si toutes les autres zones sont désactivées : il faut au moins une cible !
        let all_unchecked = true;
        ['tete', 'brasg', 'poitrine', 'brasd', 'abdomen', 'jambeg', 'jambed'].forEach(z => {
          if (document.querySelector('#table_attaque .' + z).checked) all_unchecked = false;
        });
        if (all_unchecked) event.target.checked = true;

        if (!event.target.checked) {
          document.querySelector('#table_attaque .resultat').value = parseInt(document.querySelector('#table_attaque .resultat').value) - 1;
        }
      }
      else {
        document.querySelector('#table_attaque .resultat').value = parseInt(document.querySelector('#table_attaque .resultat').value) + 1;
      }
    });
  });
}

// Calcul et affichage du score de la Feinte de corps
function calcul_feinte_de_corps() {
  // Affichage de la base de la Feinte de corps
  const model_def = Models.find(x => x.Nom_model === defenseur.Model);
  if (model_def === undefined || model_def === null) return -99;

  if (!model_def.Is_monster) {
    const cmp = Competences.find(competence => competence.Nom_model === defenseur.Model && competence.Nom === "Feinte de corps");
    fdc = cmp.get_score();
  }
  else fdc = model_def.Feinte_de_corps;

  document.querySelector('#table_attaque .fdc_base').value = fdc;

  if (document.querySelector('#table_attaque .def_heroisme').checked) fdc += 4;
  if (document.querySelector('#table_attaque .def_mobilite_reduite').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_mobilite_tres_reduite').checked) fdc -= 4;
  if (document.querySelector('#table_attaque .def_non_concentre').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_legerement_aveugle').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_fortement_aveugle').checked) fdc -= 4;
  if (document.querySelector('#table_attaque .def_deux_attaquants').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_plus_de_deux_attaquants').checked) fdc -= 4;
  if (document.querySelector('#table_attaque .def_une_blessure').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_deux_blessures').checked) fdc -= 4;

  if (document.querySelector('#table_attaque .def_immobile').checked) fdc = 0;

  if (fdc < 0) fdc = 0;

  document.querySelector('#table_attaque .feinte_de_corps').value = fdc;

  return fdc;
}


// Calcul et affichage du score d'attaque
function calcul_attaque() {
  const model_att = Models.find(x => x.Nom_model === attaquant.Model);

  // Calcul du score de l'attaque 1
  let att = -99;
  let is_distant = false;
  if (document.querySelector('#table_attaque .arme_radio1').checked) { // Bonne main
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === attaquant.Arme1);
      const cmp = Competences.find(competence => competence.Nom_model === attaquant.Model && competence.Nom === arme.Competence);
      att = cmp.get_score();
      is_distant = arme.A_distance;
    }
    else att = model_att.Attaque_1;
  }
  else if (document.querySelector('#table_attaque .arme_radio2').checked) { // Mauvaise main ==> Malus d'attaque
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === attaquant.Arme2);
      const cmp = Competences.find(competence => competence.Nom_model === attaquant.Model && competence.Nom === arme.Competence);
      att = cmp.get_score()
      is_distant = arme.A_distance;
    }
    else att = model_att.Attaque_2;
  }

  document.querySelector('#table_attaque .att_base').value = att;

  // Affichage des éléments de l'attaque en fonction de la distance
  document.querySelectorAll('#table_attaque .att_distante').forEach(element => element.style.display = is_distant ? '' : 'none');
  document.querySelectorAll('#table_attaque .att_melee').forEach(element => element.style.display = is_distant ? 'none' : '');

  // Affichage des éléments de l'attaque en fonction de l'avantage "Combat contre plusieurs"
  let att_double = false;
  const av = Avantages.find(avantage => avantage.Nom_model === attaquant.Model && avantage.Nom === "Combat contre plusieurs" && avantage.Selection);
  if (av !== undefined && av !== null) {
    if (melee.get_other_attaquant(defenseur, false) != null) att_double = true;
    else if (double_attaque) att_double = true;
  }
  document.querySelector('#table_attaque .att_double').style.display = att_double ? '' : 'none';

  // Calcul du score de l'attaque
  att += parseInt(document.querySelector('#table_attaque .att_escrime').value);
  att += parseInt(document.querySelector('#table_attaque .att_mauvaise_main').value);

  if (document.querySelector('#table_attaque .att_avantage_positionnel').checked) att += 2;
  if (document.querySelector('#table_attaque .att_heroisme').checked) att += 4;
  if (document.querySelector('#table_attaque .att_temps_pour_viser').checked) att += 2;
  if (document.querySelector('#table_attaque .att_courte_portee').checked) att += 2;
  if (document.querySelector('#table_attaque .att_longue_portee').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_gene_mouvements').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_economie_energie').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_desavantage_positionnel').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_double_attaque').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_une_blessure').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_deux_blessures').checked) att -= 4;

  document.querySelector('#table_attaque .score_attaque').value = att;

  return att;
}

// Affichage de la fenêtre d'attaque
function affiche_attaque() {
  document.querySelector('#table_attaque .attaquant').value = attaquant.Titre;
  document.querySelector('#table_attaque .defenseur').value = defenseur.Titre;

  document.querySelector('#table_attaque .resultat').value = "";
  document.querySelector('#table_attaque .jet_des_attaque').value = "";
  ['tete', 'brasg', 'brasd', 'poitrine', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
    document.querySelector('#table_attaque .' + zone).checked = true;
  });

  document.querySelector('#table_attaque .def_immobile').checked = defenseur.Def_immobile;
  document.querySelector('#table_attaque .def_heroisme').checked = defenseur.Def_heroisme;
  document.querySelector('#table_attaque .def_mobilite_reduite').checked = defenseur.Def_mobilite_reduite;
  document.querySelector('#table_attaque .def_mobilite_tres_reduite').checked = defenseur.Def_mobilite_tres_reduite;
  document.querySelector('#table_attaque .def_non_concentre').checked = defenseur.Def_non_concentre;
  document.querySelector('#table_attaque .def_legerement_aveugle').checked = defenseur.Def_legerement_aveugle;
  document.querySelector('#table_attaque .def_fortement_aveugle').checked = defenseur.Def_fortement_aveugle;

  document.querySelector('#table_attaque .att_avantage_positionnel').checked = attaquant.Att_avantage_positionnel;
  document.querySelector('#table_attaque .att_heroisme').checked = attaquant.Att_heroisme;
  document.querySelector('#table_attaque .att_temps_pour_viser').checked = attaquant.Att_temps_pour_viser;
  document.querySelector('#table_attaque .att_courte_portee').checked = attaquant.Att_courte_portee;
  document.querySelector('#table_attaque .att_longue_portee').checked = attaquant.Att_longue_portee;
  document.querySelector('#table_attaque .att_gene_mouvements').checked = attaquant.Att_gene_mouvements;
  document.querySelector('#table_attaque .att_economie_energie').checked = attaquant.Att_economie_energie;
  document.querySelector('#table_attaque .att_desavantage_positionnel').checked = attaquant.Att_desavantage_positionnel;
  document.querySelector('#table_attaque .att_double_attaque').checked = attaquant.Att_double_attaque;

  if (double_attaque) {
    document.querySelector('#table_attaque .att_double_attaque').checked = true;
    document.querySelector('#table_attaque .att_double_attaque').disabled = true;
  }

  // Détermination du nombre d'attaquants (défenseur)
  let nb_attaquants = 1;
  const melee_def = Melees.find(melee => melee.defenseur === defenseur);
  if (melee_def !== undefined) nb_attaquants = melee_def.nb_attaquants();
  if (nb_attaquants === 1) {
    document.querySelector('#table_attaque .def_deux_attaquants').checked = false;
    document.querySelector('#table_attaque .def_plus_de_deux_attaquants').checked = false;
  }
  else if (nb_attaquants === 2) {
    document.querySelector('#table_attaque .def_deux_attaquants').checked = true;
    document.querySelector('#table_attaque .def_plus_de_deux_attaquants').checked = false;
  }
  else if (nb_attaquants > 2) {
    document.querySelector('#table_attaque .def_deux_attaquants').checked = false;
    document.querySelector('#table_attaque .def_plus_de_deux_attaquants').checked = true;
  }

  // Détermination du nombre de blessures (défenseur)
  const nb_blessures_def = defenseur.get_nb_blessures();
  if (nb_blessures_def === 0) {
    document.querySelector('#table_attaque .def_une_blessure').checked = false;
    document.querySelector('#table_attaque .def_deux_blessures').checked = false;
  }
  else if (nb_blessures_def === 1) {
    document.querySelector('#table_attaque .def_une_blessure').checked = true;
    document.querySelector('#table_attaque .def_deux_blessures').checked = false;
  }
  else if (nb_blessures_def > 1) {
    document.querySelector('#table_attaque .def_une_blessure').checked = false;
    document.querySelector('#table_attaque .def_deux_blessures').checked = true;
  }

  // Détermination du nombre de blessures (attaquant)
  const nb_blessures_att = attaquant.get_nb_blessures();
  if (nb_blessures_att === 0) {
    document.querySelector('#table_attaque .att_une_blessure').checked = false;
    document.querySelector('#table_attaque .att_deux_blessures').checked = false;
  }
  else if (nb_blessures_att === 1) {
    document.querySelector('#table_attaque .att_une_blessure').checked = true;
    document.querySelector('#table_attaque .att_deux_blessures').checked = false;
  }
  else if (nb_blessures_att > 1) {
    document.querySelector('#table_attaque .att_une_blessure').checked = false;
    document.querySelector('#table_attaque .att_deux_blessures').checked = true;
  }

  // Affichage du choix de l'arme
  const model_att = Models.find(x => x.Nom_model === attaquant.Model);

  if (model_att.Is_monster && attaquant.Arme1 === "" && (!attaquant.Arme1_engagee || main_imposee === 1)) {
    document.querySelector('#table_attaque .main1').innerText = "Arme naturelle 1";
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'flex';
  }
  else if (attaquant.Arme1 !== "" && attaquant.Arme1 !== "Bouclier" && (!attaquant.Arme1_engagee || main_imposee === 1)) {
    document.querySelector('#table_attaque .main1').innerText = attaquant.Arme1;
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'flex';
  }
  else {
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'none';
  }

  if (model_att.Is_monster && attaquant.Arme2 === "" && model_att.Bool_attaque_2 && (!attaquant.Arme2_engagee || main_imposee === 2)) {
    document.querySelector('#table_attaque .main2').innerText = "Arme naturelle 2";
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'flex';
  }
  else if (attaquant.Arme2 !== "" && attaquant.Arme2 !== "Bouclier" && (!attaquant.Arme2_engagee || main_imposee === 2)) {
    document.querySelector('#table_attaque .main2').innerText = attaquant.Arme2;
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'flex';
  }
  else {
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'none';
  }

  if (document.querySelector('#table_attaque .arme_radio1').closest('div').style.display != 'none') {
    document.querySelector('#table_attaque .arme_radio1').checked = true;
    document.querySelector('#table_attaque .arme_radio1').dispatchEvent(new Event('change'));
  }
  else {
    document.querySelector('#table_attaque .arme_radio2').checked = true;
    document.querySelector('#table_attaque .arme_radio2').dispatchEvent(new Event('change'));
  }

  // Gestion de l'arme imposée (double attaque)
  if (main_imposee === 2) {
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'flex';
    document.querySelector('#table_attaque .arme_radio2').checked = true;
    document.querySelector('#table_attaque .arme_radio2').disabled = false;
    document.querySelector('#table_attaque .arme_radio1').checked = false;
    document.querySelector('#table_attaque .arme_radio1').disabled = true;
  }
  else if (main_imposee === 1) {
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'flex';
    document.querySelector('#table_attaque .arme_radio1').checked = true;
    document.querySelector('#table_attaque .arme_radio1').disabled = false;
    document.querySelector('#table_attaque .arme_radio2').checked = false;
    document.querySelector('#table_attaque .arme_radio2').disabled = true;
  }

  // Malus d'escrime pour combat à deux armes (Humanoïdes)
  document.querySelector('#table_attaque .att_escrime').value = 0;
  if (!model_att.Is_monster && attaquant.Arme1 !== "" && attaquant.Arme1 !== "Bouclier" && attaquant.Arme2 !== "" && attaquant.Arme2 !== "Bouclier") {
    if (attaquant.Arme1 === "Dague" || attaquant.Arme2 === "Dague") {
      document.querySelector('#table_attaque .att_escrime').value = -Math.max(2 - model_att.get_stat_combat("Escrime"), 0);
    }
    else {
      document.querySelector('#table_attaque .att_escrime').value = -Math.max(6 - attaquant.get_stat_combat("Escrime"), 0);
    }
  }

  calcul_feinte_de_corps();
  calcul_attaque();

  // Affichage de la fenêtre d'attaque si une arme est disponible
  if (document.querySelector('#table_attaque .arme_radio1').checked || document.querySelector('#table_attaque .arme_radio2').checked) {
    document.querySelector('#table_attaque').style.display = '';
  }
}

// ----------------------------------------- //
// ---------------- DEFENSE ---------------- //
// ----------------------------------------- //

initialise_defense();
function initialise_defense() {
  // Gestion des boutons de la fenêtre d'attaque
  document.querySelector('#table_defense .rafraichir').addEventListener("click", function (event) {
    affiche_defense();
  });

  document.querySelector('#table_defense .annuler').addEventListener("click", function (event) {
    document.querySelector('#table_dommages .marge_finale').value =
      document.querySelector('#table_defense .marge_attaque').value;

    document.querySelector('#table_defense').style.display = 'none';

    if (document.querySelector('#table_defense .marge_attaque').value >= 0) affiche_dommages();
  });

  document.querySelector('#table_defense .appliquer').addEventListener("click", function (event) {
    // Engager l'arme
    if (document.querySelector('#table_defense .arme_radio1').checked) {
      defenseur.Arme1_engagee = true;
    }
    else if (document.querySelector('#table_defense .arme_radio2').checked) {
      defenseur.Arme2_engagee = true;
    }
    else {
      let nb_esquives = parseInt(defenseur.Nb_esquives);
      if (isNaN(nb_esquives)) nb_esquives = 0;
      defenseur.Nb_esquives = nb_esquives + 1;
    }

    // Perte d'initiative si esquive (-4) ou parade (-2)
    const resultat = parseInt(document.querySelector('#table_defense .resultat').value);
    document.querySelector('#table_defense .initiative').innerText = "";
    if (document.querySelector('#table_defense .arme_radio0').checked && resultat <= -4) { // C'est une esquive
      document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
      if (defenseur === melee.defenseur) {
        melee.set_avantage_next_turn(attaquant, false);
      }
      else melee.set_avantage_next_turn(defenseur, true);
    }
    if (!document.querySelector('#table_defense .arme_radio0').checked && resultat <= -2) { // C'est une parade
      document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
      if (defenseur === melee.defenseur) {
        melee.set_avantage_next_turn(attaquant, false);
      }
      else melee.set_avantage_next_turn(defenseur, true);
    }

    // Affichage des dommages
    document.querySelector('#table_dommages .marge_finale').value = resultat;
    document.querySelector('#table_defense').style.display = 'none';
    affiche_dommages();
  });

  document.querySelector('#table_defense .resultat').addEventListener("input", function (event) {
    const resultat = parseInt(document.querySelector('#table_defense .resultat').value);

    document.querySelector('#table_defense .initiative').innerText = "";
    if (document.querySelector('#table_defense .arme_radio0').checked && resultat <= -4) { // C'est une esquive
      document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
    }
    if (!document.querySelector('#table_defense .arme_radio0').checked && resultat <= -2) { // C'est une parade
      document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
    }

    document.querySelector('#table_defense .appliquer').disabled = false;
  });

  // Gestion des radio buttons des armes
  document.querySelectorAll('#table_defense .arme_radio0, #table_defense .arme_radio1, #table_defense .arme_radio2').forEach(element =>
    element.addEventListener("change", function (event) {
      // Attaque à distance ou non ?
      let att_distante = false;
      const model_att = Models.find(x => x.Nom_model === attaquant.Model);
      if (document.querySelector('#table_attaque .arme_radio1').checked) {
        if (!model_att.Is_monster) {
          const arme = Armes.find(arme => arme.Nom_arme === attaquant.Arme1);
          att_distante = arme.A_distance;
        }
      }
      else if (document.querySelector('#table_attaque .arme_radio2').checked) {
        if (!model_att.Is_monster) {
          const arme = Armes.find(arme => arme.Nom_arme === attaquant.Arme2);
          att_distante = arme.A_distance;
        }
      }

      if (!att_distante) {
        document.querySelector('#table_defense .def_courte_portee').checked = false;
        document.querySelector('#table_defense .def_longue_portee').checked = false;
        document.querySelector('#table_defense .def_courte_portee').closest('tr').style.display = 'none';
        document.querySelector('#table_defense .def_longue_portee').closest('tr').style.display = 'none';
      }
      else {
        document.querySelector('#table_defense .def_courte_portee').closest('tr').style.display = '';
        document.querySelector('#table_defense .def_longue_portee').closest('tr').style.display = '';
      }

      const jet = parseInt(document.querySelector('#table_defense .jet_des_defense').value);
      if (!isNaN(jet)) {
        document.querySelector('#table_defense .resultat').value =
          document.querySelector('#table_defense .marge_attaque').value - Math.max(jet + calcul_defense() - 10, 0);

        const resultat = parseInt(document.querySelector('#table_defense .resultat').value);
        document.querySelector('#table_defense .initiative').innerText = "";
        if (document.querySelector('#table_defense .arme_radio0').checked && resultat <= -4) { // C'est une esquive
          document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
        }
        if (!document.querySelector('#table_defense .arme_radio0').checked && resultat <= -2) { // C'est une parade
          document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
        }
      }
      else calcul_defense();
    }));

  document.querySelector('#table_defense .main0').addEventListener("click", function (event) {
    document.querySelector('#table_defense .arme_radio0').checked = true;
    document.querySelector('#table_defense .arme_radio0').dispatchEvent(new Event('change'));
  });

  document.querySelector('#table_defense .main1').addEventListener("click", function (event) {
    document.querySelector('#table_defense .arme_radio1').checked = true;
    document.querySelector('#table_defense .arme_radio1').dispatchEvent(new Event('change'));
  });

  document.querySelector('#table_defense .main2').addEventListener("click", function (event) {
    document.querySelector('#table_defense .arme_radio2').checked = true;
    document.querySelector('#table_defense .arme_radio2').dispatchEvent(new Event('change'));
  });

  // Affichage du détails du calcul de la défense
  document.querySelectorAll('#table_defense .def_titre').forEach(element =>
    element.addEventListener("click", function (event) {
      const def_details = document.querySelector('#table_defense .def_details');
      def_details.style.display = def_details.style.display === 'none' ? 'table' : 'none';
      affiche_def_details = !affiche_def_details;
    }));

  // Gestion des checkboxes du défenseur
  ["heroisme", "defense_preparee", "allonge_superieure", "sans_vision_claire", "genee_dans_ses_mouvements", "allonge_inferieure", "economie_energie"].forEach(element => {
    document.querySelector(`#table_defense .def_${element}`).addEventListener("change", function (event) {
      defenseur[`Def_${element}`] = event.target.checked;
      document.querySelector('#table_defense .score_defense').value = calcul_defense();

      const jet = parseInt(document.querySelector('#table_defense .jet_des_defense').value);
      if (!isNaN(jet)) des_lances(jet);
      else calcul_defense();
    });
  });

  function des_lances(jet) {
    const marge_att = parseInt(document.querySelector('#table_defense .marge_attaque').value);
    const marge_def = jet + calcul_defense() - 10;
    const marge_finale = marge_att - Math.max(marge_def, 0);

    document.querySelector('#table_defense .jet_des_defense').value = jet;
    document.querySelector('#table_defense .resultat').value = marge_finale;

    document.querySelector('#table_defense .initiative').innerText = "";
    if (document.querySelector('#table_defense .arme_radio0').checked && marge_finale <= -4) { // C'est une esquive
      document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
    }
    if (!document.querySelector('#table_defense .arme_radio0').checked && marge_finale <= -2) { // C'est une parade
      document.querySelector('#table_defense .initiative').innerText = "(Initiative reprise)";
    }

    document.querySelector('#table_defense .appliquer').disabled = false;
  }

  // Gestion des boutons de la fenêtre de défense
  document.querySelector('#table_defense .lancer').addEventListener("click", function (event) {
    let jet = 0;
    jet += Math.floor(Math.random() * 6) + 1;
    jet += Math.floor(Math.random() * 6) + 1;
    jet += Math.floor(Math.random() * 6) + 1;

    des_lances(jet);

    document.querySelector('#table_defense .chance').disabled = false;
  });

  document.querySelector('#table_defense .chance').addEventListener("click", function (event) {
    let jet1 = 0;
    jet1 += Math.floor(Math.random() * 6) + 1;
    jet1 += Math.floor(Math.random() * 6) + 1;
    jet1 += Math.floor(Math.random() * 6) + 1;

    let jet2 = 0;
    jet2 += Math.floor(Math.random() * 6) + 1;
    jet2 += Math.floor(Math.random() * 6) + 1;
    jet2 += Math.floor(Math.random() * 6) + 1;

    let jet3 = 0;
    jet3 += Math.floor(Math.random() * 6) + 1;
    jet3 += Math.floor(Math.random() * 6) + 1;
    jet3 += Math.floor(Math.random() * 6) + 1;

    let jet = Math.max(jet1, jet2, jet3, 13, parseInt(document.querySelector('#table_defense .jet_des_defense').value));

    des_lances(jet);
  });
}

// Calcul et affichage du score de la défense
function calcul_defense() {
  const model_def = Models.find(x => x.Nom_model === defenseur.Model);

  // Calcul du score de défense
  let def = -99;
  if (document.querySelector('#table_defense .arme_radio1').checked) {
    if (!model_def.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === defenseur.Arme1);
      const cmp = Competences.find(competence => competence.Nom_model === defenseur.Model && competence.Nom === arme.Competence);
      def = Math.round(arme.Facteur_parade * cmp.get_score());
    }
    else def = model_def.Parade_1;
  }
  else if (document.querySelector('#table_defense .arme_radio2').checked) {
    if (!model_def.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === defenseur.Arme2);
      const cmp = Competences.find(competence => competence.Nom_model === defenseur.Model && competence.Nom === arme.Competence);
      def = Math.round(arme.Facteur_parade * cmp.get_score());
    }
    else def = model_def.Parade_2;
  }
  else if (document.querySelector('#table_defense .arme_radio0').checked) {
    let nb_esquives = parseInt(defenseur.Nb_esquives);
    if (isNaN(nb_esquives)) nb_esquives = 0;

    if (!model_def.Is_monster) {
      const cmp = Competences.find(competence => competence.Nom_model === defenseur.Model && competence.Nom === "Esquive");
      def = cmp.get_score() - nb_esquives;
    }
    else def = model_def.Esquive - nb_esquives;
  }
  document.querySelector('#table_defense .def_base').value = def;

  // Malus d'escrime pour combat à deux armes (Humanoïdes)
  document.querySelector('#table_defense .def_escrime').value = 0;
  if (!model_def.Is_monster &&
    defenseur.Arme1 !== "" &&
    defenseur.Arme1 !== "Bouclier" &&
    defenseur.Arme2 !== "" &&
    defenseur.Arme2 !== "Bouclier" &&
    !document.querySelector('#table_defense .arme_radio0').checked) {
    if (defenseur.Arme1 === "Dague" || defenseur.Arme2 === "Dague") {
      document.querySelector('#table_defense .def_escrime').value = -Math.max(2 - defenseur.get_stat_combat("Escrime"), 0);
    }
    else {
      document.querySelector('#table_defense .def_escrime').value = -Math.max(6 - defenseur.get_stat_combat("Escrime"), 0);
    }
  }

  // Calcul du score de défense
  def += parseInt(document.querySelector('#table_defense .def_escrime').value);

  if (document.querySelector('#table_defense .def_heroisme').checked) def += 4;
  if (document.querySelector('#table_defense .def_defense_preparee').checked) def += 2;
  if (document.querySelector('#table_defense .def_allonge_superieure').checked) def += 2;
  if (document.querySelector('#table_defense .def_longue_portee').checked) def += 2;
  if (document.querySelector('#table_defense .def_sans_vision_claire').checked) def -= 2;
  if (document.querySelector('#table_defense .def_allonge_inferieure').checked) def -= 2;
  if (document.querySelector('#table_defense .def_courte_portee').checked) def -= 2;
  if (document.querySelector('#table_defense .def_economie_energie').checked) def -= 2;
  if (document.querySelector('#table_defense .def_genee_dans_ses_mouvements').checked) def -= 2;

  if (document.querySelector('#table_defense .def_une_blessure').checked) def -= 2;
  if (document.querySelector('#table_defense .def_deux_blessures').checked) def -= 4;

  document.querySelector('#table_defense .score_defense').value = def;

  return def;
}

// Affichage de la fenêtre de défense
function affiche_defense() {
  document.querySelector('#table_defense .attaquant').value = attaquant.Titre;
  document.querySelector('#table_defense .defenseur').value = defenseur.Titre;

  document.querySelector('#table_defense .resultat').value = "";
  document.querySelector('#table_defense .jet_des_defense').value = "";

  document.querySelector('#table_defense .def_heroisme').checked = defenseur.Def_heroisme;
  document.querySelector('#table_defense .def_defense_preparee').checked = defenseur.Def_defense_preparee;
  document.querySelector('#table_defense .def_allonge_superieure').checked = defenseur.Def_allonge_superieure;
  document.querySelector('#table_defense .def_longue_portee').checked = attaquant.Att_longue_portee;
  document.querySelector('#table_defense .def_sans_vision_claire').checked = defenseur.Def_sans_vision_claire;
  document.querySelector('#table_defense .def_allonge_inferieure').checked = defenseur.Def_allonge_inferieure;
  document.querySelector('#table_defense .def_courte_portee').checked = attaquant.Att_courte_portee;
  document.querySelector('#table_defense .def_economie_energie').checked = defenseur.Def_economie_energie;
  document.querySelector('#table_defense .def_genee_dans_ses_mouvements').checked = defenseur.Def_genee_dans_ses_mouvements;

  // Détermination du nombre de blessures (défenseur)
  const nb_blessures_def = defenseur.get_nb_blessures();
  if (nb_blessures_def === 0) {
    document.querySelector('#table_defense .def_une_blessure').checked = false;
    document.querySelector('#table_defense .def_deux_blessures').checked = false;
  }
  else if (nb_blessures_def === 1) {
    document.querySelector('#table_defense .def_une_blessure').checked = true;
    document.querySelector('#table_defense .def_deux_blessures').checked = false;
  }
  else if (nb_blessures_def > 1) {
    document.querySelector('#table_defense .def_une_blessure').checked = false;
    document.querySelector('#table_defense .def_deux_blessures').checked = true;
  }


  // Attaque à distance ou non ?
  let att_distante = false;
  const model_att = Models.find(x => x.Nom_model === attaquant.Model);
  if (document.querySelector('#table_attaque .arme_radio1').checked) {
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === attaquant.Arme1);
      att_distante = arme.A_distance;
    }
  }
  else if (document.querySelector('#table_attaque .arme_radio2').checked) {
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === attaquant.Arme2);
      att_distante = arme.A_distance;
    }
  }
  // Détermination du modèle du défenseur
  const model_def = Models.find(x => x.Nom_model === defenseur.Model);

  // Affichage du choix de l'arme
  const arme1 = Armes.find(arme => arme.Nom_arme === defenseur.Arme1);
  if (model_def.Is_monster && defenseur.Arme1 === "" && model_def.Bool_parade_1 && !defenseur.Arme1_engagee) {
    document.querySelector('#table_defense .main1').innerText = "Arme naturelle 1";
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'flex';
  }
  else if (defenseur.Arme1.toLowerCase().includes("bouclier") && !defenseur.Arme1_engagee) {
    document.querySelector('#table_defense .main1').innerText = defenseur.Arme1;
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'flex';
  }
  else if (defenseur.Arme1 !== "" && !att_distante && !defenseur.Arme1_engagee && arme1.Facteur_parade !== null) {
    document.querySelector('#table_defense .main1').innerText = defenseur.Arme1;
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'flex';
  }
  else {
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'none';
  }

  const arme2 = Armes.find(arme => arme.Nom_arme === defenseur.Arme2);
  if (model_def.Is_monster && defenseur.Arme2 === "" && model_def.Bool_attaque_2 && model_def.Bool_parade_2 && !defenseur.Arme2_engagee) {
    document.querySelector('#table_defense .main2').innerText = "Arme naturelle 2";
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'flex';
  }
  else if (defenseur.Arme2.toLowerCase().includes("bouclier") && !defenseur.Arme2_engagee) {
    document.querySelector('#table_defense .main2').innerText = defenseur.Arme2;
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'flex';
  }
  else if (defenseur.Arme2 !== "" && !att_distante && !defenseur.Arme2_engagee && arme2.Facteur_parade !== null) {
    document.querySelector('#table_defense .main2').innerText = defenseur.Arme2;
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'flex';
  }
  else {
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'none';
  }

  if (document.querySelector('#table_defense .arme_radio1').closest('div').style.display !== 'none') {
    document.querySelector('#table_defense .arme_radio1').checked = true;
    document.querySelector('#table_defense .arme_radio1').dispatchEvent(new Event('change'));
  }
  else if (document.querySelector('#table_defense .arme_radio2').closest('div').style.display !== 'none') {
    document.querySelector('#table_defense .arme_radio2').checked = true;
    document.querySelector('#table_defense .arme_radio2').dispatchEvent(new Event('change'));
  }
  else {
    document.querySelector('#table_defense .arme_radio0').checked = true;
    document.querySelector('#table_defense .arme_radio0').dispatchEvent(new Event('change'));
  }

  calcul_defense();

  // Affichage de la fenêtre de défense si la marge d'attaque est positive
  if (parseInt(document.querySelector('#table_attaque .resultat').value) < 0) {
    document.querySelector('#table_defense .appliquer').dispatchEvent(new Event('click'));
  }
  else document.querySelector('#table_defense').style.display = '';
}

// ------------------------------------------ //
// ---------------- DOMMAGES ---------------- //
// ------------------------------------------ //

initialise_dommages();
function initialise_dommages() {
  // Gestion des boutons de la fenêtre d'attaque
  document.querySelector('#table_dommages .rafraichir').addEventListener("click", function (event) {
    affiche_dommages();
  });

  document.querySelector('#table_dommages .appliquer').addEventListener("click", function (event) {
    const dommages = parseInt(document.querySelector('#table_dommages .dommages').value);
      if (dommages > 0) {
      switch (zone_selectionnee) {
        case 'general': defenseur.General += dommages; defenseur.sendMessage("General", defenseur.General); break;
        case 'tete': defenseur.Tete += dommages; defenseur.sendMessage("Tete", defenseur.Tete); break;
        case 'brasg': defenseur.Brasg += dommages; defenseur.sendMessage("Brasg", defenseur.Brasg); break;
        case 'brasd': defenseur.Brasd += dommages; defenseur.sendMessage("Brasd", defenseur.Brasd); break;
        case 'poitrine': defenseur.Poitrine += dommages; defenseur.sendMessage("Poitrine", defenseur.Poitrine); break;
        case 'abdomen': defenseur.Abdomen += dommages; defenseur.sendMessage("Abdomen", defenseur.Abdomen); break;
        case 'jambeg': defenseur.Jambeg += dommages; defenseur.sendMessage("Jambeg", defenseur.Jambeg); break;
        case 'jambed': defenseur.Jambed += dommages; defenseur.sendMessage("Jambed", defenseur.Jambed); break;
      }

      // Perte de l'initiative contre tous les autres joueurs si blessé
      if (defenseur === melee.defenseur) {
        for (const a of melee.attaquants) a.avantage_next_turn = true;
      }
      else melee.set_avantage_next_turn(defenseur, false);
    }

    // On efface le pion si le nombre de blessures est supérieur au nombre de blessures max
    const model_def = Models.find(x => x.Nom_model === defenseur.Model);
    if (defenseur.get_nb_blessures() >= model_def.Nb_blessures_max) {
      if (defenseur === melee.defenseur) {
        // La mêlée est à effacer
        Melees.splice(Melees.indexOf(melee), 1);
      }
      else if (melee.nb_attaquants() > 1) {
        // On retire l'attaquant de la mêlée
        melee.rmv_attaquant(defenseur);
      }
      else {
        // La mêlée est à effacer
        Melees.splice(Melees.indexOf(melee), 1);
      }

      // On efface le pion de la carte
      defenseur.rmv();
      Map.generateHexMap();
      Map.drawHexMap();
    }

    document.querySelector('#table_dommages').style.display = 'none';

    // Gestion de la contre-attaque
    if (contre_attaque) {
      contre_attaque = false;
      const tmp = attaquant; // On remet les rôles en place
      attaquant = defenseur;
      defenseur = tmp;
    }
    else if (dommages === 0) {
      contre_attaque = true;
      const tmp = attaquant; // On inverse les rôles
      attaquant = defenseur;
      defenseur = tmp;
      affiche_attaque();
      return;

    }

    // Gestion de la double attaque
    if (double_attaque) {
      double_attaque = false;
      main_imposee = null;
      defenseur = old_defenseur; // On remet le défenseur principal en place
      old_defenseur = null;
    }
    else if (document.querySelector('#table_attaque .att_double_attaque').checked) {
      double_attaque = true;
      main_imposee = document.querySelector('#table_attaque .arme_radio1').checked ? 1 : 2;
      // On désengage l'arme de l'attaquant
      // if (main_imposee === 1) attaquant.Arme1_engagee = false;
      // else attaquant.Arme2_engagee = false;
      old_defenseur = defenseur;
      const m = Melees.find(melee => melee.defenseur === attaquant);
      defenseur = m.get_other_attaquant(defenseur, false);
      affiche_attaque();
      return;
    }
  });

  document.querySelector('#table_dommages .dommages').addEventListener("input", function (event) {
    set_blessures_defenseur();
  });

  // Gestion des radio buttons des armes
  ['general', 'tete', 'brasg', 'brasd', 'poitrine', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
    document.querySelector(`#table_dommages .${zone}`).addEventListener("change", function (event) {
      zone_selectionnee = zone;
      calcul_dommages();
    });

    document.querySelector(`#table_dommages .${zone}`).closest('label').addEventListener("click", function (event) {
      const radio = event.target.closest('td').querySelector('input[type="radio"]');
      if (!radio.disabled) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
    });
  });

  // Affichage du détails du ciblage des dommages
  document.querySelector('#table_dommages .ciblage_titre').addEventListener("click", function (event) {
    const ciblage_details = document.querySelector('#table_dommages .ciblage_details');
    ciblage_details.style.display = ciblage_details.style.display === 'none' ? '' : 'none';
    affiche_ciblage_details = !affiche_ciblage_details;
  });

  function des_lances() {
    let jet = Math.floor(Math.random() * 20) + 1;

    let zone = "general";
    if (jet <= 3) zone = "jambeg";
    else if (jet <= 6) zone = "jambed";
    else if (jet <= 9) zone = "abdomen";
    else if (jet <= 12) zone = "poitrine";
    else if (jet <= 15) zone = "brasg";
    else if (jet <= 18) zone = "brasd";
    else if (jet <= 20) zone = "tete";

    return zone;
  }

  // Gestion des boutons de la fenêtre de dommages
  document.querySelector('#table_dommages .lancer').addEventListener("click", function (event) {
    let zone = des_lances();
    while (!document.querySelector('#table_attaque .' + zone).checked) zone = des_lances();

    document.querySelector('#table_dommages .' + zone).disabled = false;

    document.querySelector('#table_dommages .' + zone).checked = true;
    document.querySelector('#table_dommages .' + zone).dispatchEvent(new Event('change'));

    document.querySelector('#table_dommages .appliquer').disabled = false;
    document.querySelector('#table_dommages .chance').disabled = false;
    calcul_dommages();
  });

  document.querySelector('#table_dommages .chance').addEventListener("click", function (event) {
    for (let i = 0; i < 3; i++) {
      // On vérifie qu'il y a au moins une zone à activer
      let has_disabled_zone = false;
      ['tete', 'brasg', 'brasd', 'poitrine', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
        if (document.querySelector('#table_attaque .' + zone).checked && document.querySelector('#table_dommages .' + zone).disabled) {
          has_disabled_zone = true;
        }
      });
      if (!has_disabled_zone) break;

      // On active une nouvelle zone aléatoirement
      let zone = des_lances();
      while (!document.querySelector('#table_attaque .' + zone).checked || !document.querySelector('#table_dommages .' + zone).disabled) {
        zone = des_lances();
      }
      document.querySelector('#table_dommages .' + zone).disabled = false;
    }

    calcul_dommages();
  });
}

function set_blessures_defenseur() {
  // Blessures subies par le défenseur
  const model_def = Models.find(x => x.Nom_model === defenseur.Model);
  const seuil_blessures = model_def.get("seuil_blessures");
  const blessures_zone = zone_selectionnee === null ? defenseur.General : defenseur[zone_selectionnee.charAt(0).toUpperCase() + zone_selectionnee.slice(1)];
  let dommages = parseInt(document.querySelector('#table_dommages .dommages').value);
  if (isNaN(dommages)) dommages = 0;

  if ((blessures_zone % seuil_blessures) + dommages >= 3 * seuil_blessures) {
    document.querySelector('#table_dommages .nb_blessures').innerHTML = "(+3 blessures ";
    if (defenseur.get_nb_blessures() + 3 > model_def.Nb_blessures_max) {
      document.querySelector('#table_dommages .nb_blessures').innerHTML += "==> Inapte)";
    }
    else {
      document.querySelector('#table_dommages .nb_blessures').innerHTML += "==> Apte)";
    }
  }
  else if ((blessures_zone % seuil_blessures) + dommages >= 2 * seuil_blessures) {
    document.querySelector('#table_dommages .nb_blessures').innerHTML = "(+2 blessures ";
    if (defenseur.get_nb_blessures() + 2 > model_def.Nb_blessures_max) {
      document.querySelector('#table_dommages .nb_blessures').innerHTML += "==> Inapte)";
    }
    else {
      document.querySelector('#table_dommages .nb_blessures').innerHTML += "==> Apte)";
    }
  }
  else if ((blessures_zone % seuil_blessures) + dommages >= seuil_blessures) {
    document.querySelector('#table_dommages .nb_blessures').innerHTML = "(+1 blessure ";
    if (defenseur.get_nb_blessures() + 1 > model_def.Nb_blessures_max) {
      document.querySelector('#table_dommages .nb_blessures').innerHTML += "==> Inapte)";
    }
    else {
      document.querySelector('#table_dommages .nb_blessures').innerHTML += "==> Apte)";
    }
  }
  else {
    document.querySelector('#table_dommages .nb_blessures').innerHTML = "(blessure superficielle)";
  }
}

function calcul_dommages() {
  const marge_finale = parseInt(document.querySelector('#table_dommages .marge_finale').value);
  const main_attaquant = document.querySelector('#table_attaque .arme_radio1').checked ? 1 : 2;
  const arme = Armes.find(arme => arme.Nom_arme === attaquant["Arme" + main_attaquant]);
  const model_att = Models.find(x => x.Nom_model === attaquant.Model);
  const model_def = Models.find(x => x.Nom_model === defenseur.Model);

  // Calcul des dommages de l'arme
  let dommages = 0;
  if (model_att.Is_monster && arme === undefined && main_attaquant === 1) {
    dommages = Math.round(marge_finale * model_att.Coefficient_dommages_1 + model_att.Bonus_dommages_1);
  }
  else if (model_att.Is_monster && arme === undefined && main_attaquant === 2) {
    dommages = Math.round(marge_finale * model_att.Coefficient_dommages_2 + model_att.Bonus_dommages_2);
  }
  else {
    dommages = Math.round(marge_finale * arme.Facteur + arme.Bonus);
    if (dommages > arme.Plafond) dommages = arme.Plafond;
    if (!model_att.Is_monster) {
      const bonus_force = Math.floor((attaquant.get("force") - 10) / 2);
      dommages += Math.round(arme.Coeff_force * Math.min(bonus_force, marge_finale));
    }
  }

  // Calcul de l'armure du défenseur
  const armure = zone_selectionnee === 'general' ? model_def.getArmureGenerale() : model_def["Armure_" + zone_selectionnee];
  dommages -= armure;

  if (dommages < 0) dommages = 0;

  document.querySelector('#table_dommages .dommages').value = dommages;

  set_blessures_defenseur();

  return dommages;
}

// Affichage de la fenêtre des dommages
function affiche_dommages() {
  // Détermination du nombre de blessures (défenseur)
  document.querySelector('#table_dommages .attaquant').value = attaquant.Titre;
  document.querySelector('#table_dommages .defenseur').value = defenseur.Titre;

  document.querySelector('#table_dommages .dommages').value = "";
  ['tete', 'brasg', 'brasd', 'poitrine', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
    document.querySelector('#table_dommages .' + zone).disabled = true;
  });

  const model_def = Models.find(x => x.Nom_model === defenseur.Model);
  document.querySelector('#table_dommages .seuil_blessures').value = model_def.get("seuil_blessures");
  document.querySelector('#table_dommages .general_armure').innerText = "(Bl : " + defenseur.General + " - Arm : " + model_def.getArmureGenerale() + ")";
  document.querySelector('#table_dommages .tete_armure').innerText = "(Bl : " + defenseur.Tete + " - Arm : " + model_def.Armure_tete + ")";
  document.querySelector('#table_dommages .brasg_armure').innerText = "(Bl : " + defenseur.Brasg + " - Arm : " + model_def.Armure_brasg + ")";
  document.querySelector('#table_dommages .brasd_armure').innerText = "(Bl : " + defenseur.Brasd + " - Arm : " + model_def.Armure_brasd + ")";
  document.querySelector('#table_dommages .poitrine_armure').innerText = "(Bl : " + defenseur.Poitrine + " - Arm : " + model_def.Armure_poitrine + ")";
  document.querySelector('#table_dommages .abdomen_armure').innerText = "(Bl : " + defenseur.Abdomen + " - Arm : " + model_def.Armure_abdomen + ")";
  document.querySelector('#table_dommages .jambeg_armure').innerText = "(Bl : " + defenseur.Jambeg + " - Arm : " + model_def.Armure_jambeg + ")";
  document.querySelector('#table_dommages .jambed_armure').innerText = "(Bl : " + defenseur.Jambed + " - Arm : " + model_def.Armure_jambed + ")";

  zone_selectionnee = 'general';

  calcul_dommages();

  // Affichage de la fenêtre de dommages si des dommages sont potentiels
  let dommages_potentiel = false;
  if (document.querySelector('#table_defense .resultat').value > 0) dommages_potentiel = true;
  else if (document.querySelector('#table_defense .resultat').value = 0) {
    const jet = parseInt(document.querySelector('#table_defense .jet_des_defense').value);
    if (!isNaN(jet) && (jet + calcul_defense() - 10 < 0)) dommages_potentiel = true;
  }
  if (!dommages_potentiel) {
    document.querySelector('#table_dommages .appliquer').dispatchEvent(new Event('click'));
  }
  else document.querySelector('#table_dommages').style.display = '';

}
/**
 * FICHIER DLG_COMBAT.JS
 * =====================
 * Gestion des fenêtres de combat
 */

// === VARIABLES GLOBALES DE DLG_COMBAT ===
let Attaquant = null;
let Defenseur = null;

let affiche_fdc_details = true;
let affiche_att_details = true;
let affiche_ciblage_details = true;
let affiche_def_details = true;

let zone_selectionnee = null;
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

  document.querySelector('#table_attaque .attaquer').addEventListener("click", function (event) {
    if (document.querySelector('#table_attaque .arme_radio1').checked) {
      Attaquant.Arme1_engagee = true;
    }
    else {
      Attaquant.Arme2_engagee = true;
    }
    document.querySelector('#table_defense .marge_attaque').value =
      document.querySelector('#table_attaque .att_reussite').value;

    document.querySelector('#table_attaque').style.display = 'none';

    if (document.querySelector('#table_attaque .att_reussite').value >= 0) affiche_defense();
  });

  // Gestion des radio buttons des armes
  document.querySelectorAll('#table_attaque .arme_radio1, #table_attaque .arme_radio2').forEach(element =>
    element.addEventListener("change", function (event) {
      let nom_arme = null;
      if (element.classList.contains('arme_radio1') || element.classList.contains('main1')) {
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
      else { // Arme naturelle (monstre) : pas d'attaque à distance
        document.querySelector('#table_attaque .att_temps_pour_viser').checked = false;
        document.querySelector('#table_attaque .att_courte_portee').checked = false;
        document.querySelector('#table_attaque .att_longue_portee').checked = false;
        document.querySelector('#table_attaque .att_gene_mouvements').checked = false;
        document.querySelector('#table_attaque .att_economie_energie').checked = false;
        document.querySelector('#table_attaque .att_double_attaque').checked = false;
        document.querySelectorAll('#table_attaque .att_distante').forEach(element => element.style.display = 'none');
        document.querySelectorAll('#table_attaque .att_melee').forEach(element => element.style.display = '');
      }

      const jet = parseInt(document.querySelector('#table_attaque .jet_des_attaque').value);
      if (!isNaN(jet)) {
        document.querySelector('#table_attaque .att_reussite').value = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
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
  document.querySelector('#table_attaque .def_immobile').addEventListener("change", function (event) {
    Defenseur.Def_immobile = event.target.checked;
    calcul_feinte_de_corps();
  });
  document.querySelector('#table_attaque .def_heroisme').addEventListener("change", function (event) {
    Defenseur.Def_heroisme = event.target.checked;
    calcul_feinte_de_corps();
  });
  document.querySelector('#table_attaque .def_mobilite_reduite').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_mobilite_tres_reduite').checked = false;
    Defenseur.Def_mobilite_tres_reduite = false;
    Defenseur.Def_mobilite_reduite = event.target.checked;
    calcul_feinte_de_corps();
  });
  document.querySelector('#table_attaque .def_mobilite_tres_reduite').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_mobilite_reduite').checked = false;
    Defenseur.Def_mobilite_reduite = false;
    Defenseur.Def_mobilite_tres_reduite = event.target.checked;
    calcul_feinte_de_corps();
  });
  document.querySelector('#table_attaque .def_non_concentre').addEventListener("change", function (event) {
    Defenseur.Def_non_concentre = event.target.checked;
    calcul_feinte_de_corps();
  });
  document.querySelector('#table_attaque .def_legerement_aveugle').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_fortement_aveugle').checked = false;
    Defenseur.Def_fortement_aveugle = false;
    Defenseur.Def_legerement_aveugle = event.target.checked;
    calcul_feinte_de_corps();
  });
  document.querySelector('#table_attaque .def_fortement_aveugle').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_legerement_aveugle').checked = false;
    Defenseur.Def_legerement_aveugle = false;
    Defenseur.Def_fortement_aveugle = event.target.checked;
    calcul_feinte_de_corps();
  });

  // Gestion des checkboxes de l'attaquant
  document.querySelector('#table_attaque .att_avantage_positionnel').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_desavantage_positionnel').checked = false;
    Attaquant.Att_desavantage_positionnel = false;
    Attaquant.Att_avantage_positionnel = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_heroisme').addEventListener("change", function (event) {
    Attaquant.Att_heroisme = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_temps_pour_viser').addEventListener("change", function (event) {
    Attaquant.Att_temps_pour_viser = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_courte_portee').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_longue_portee').checked = false;
    Attaquant.Att_longue_portee = false;
    Attaquant.Att_courte_portee = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_longue_portee').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_courte_portee').checked = false;
    Attaquant.Att_courte_portee = false;
    Attaquant.Att_longue_portee = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_gene_mouvements').addEventListener("change", function (event) {
    Attaquant.Att_gene_mouvements = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_economie_energie').addEventListener("change", function (event) {
    Attaquant.Att_economie_energie = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_desavantage_positionnel').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_avantage_positionnel').checked = false;
    Attaquant.Att_avantage_positionnel = false;
    Attaquant.Att_desavantage_positionnel = event.target.checked;
    calcul_attaque();
  });
  document.querySelector('#table_attaque .att_double_attaque').addEventListener("change", function (event) {
    Attaquant.Att_double_attaque = event.target.checked;
    calcul_attaque();
  });

  // Gestion des boutons de la fenêtre d'attaque
  document.querySelector('#table_attaque .lancer').addEventListener("click", function (event) {
    let jet = 0;
    jet += Math.floor(Math.random() * 6) + 1;
    jet += Math.floor(Math.random() * 6) + 1;
    jet += Math.floor(Math.random() * 6) + 1;

    document.querySelector('#table_attaque .jet_des_attaque').value = jet;
    document.querySelector('#table_attaque .att_reussite').value = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
    document.querySelector('#table_attaque .chance').disabled = false;
    document.querySelector('#table_attaque .attaquer').disabled = false;
    document.querySelector('#table_attaque .annuler').disabled = true;
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
    document.querySelector('#table_attaque .att_reussite').value = jet + calcul_attaque() - calcul_feinte_de_corps() - 10;
  });

  // Gestion des checkboxes du ciblage des zones
  ['tete', 'brasg', 'poitrine', 'brasd', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
    document.querySelector('#table_attaque .' + zone).addEventListener("change", function (event) {
      if (!event.target.checked) {
        if (parseInt(document.querySelector('#table_attaque .att_reussite').value) > 0) {
          document.querySelector('#table_attaque .att_reussite').value = parseInt(document.querySelector('#table_attaque .att_reussite').value) - 1;
        }
        else event.target.checked = true;
      }
      else {
        document.querySelector('#table_attaque .att_reussite').value = parseInt(document.querySelector('#table_attaque .att_reussite').value) + 1;
      }
    });
  });
}

// Calcul et affichage du score de la Feinte de corps
function calcul_feinte_de_corps() {
  // Affichage de la base de la Feinte de corps
  const model_def = Models.find(x => x.Nom_model === Defenseur.Model);
  if (!model_def.Is_monster) {
    const cmp = Competences.find(competence => competence.Nom_model === Defenseur.Model && competence.Nom === "Feinte de corps");
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
  const model_att = Models.find(x => x.Nom_model === Attaquant.Model);

  // Calcul du score de l'attaque 1
  let att = -99;
  let is_distant = false;
  if (document.querySelector('#table_attaque .arme_radio1').checked) {
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === Attaquant.Arme1);
      const cmp = Competences.find(competence => competence.Nom_model === Attaquant.Model && competence.Nom === arme.Competence);
      att = cmp.get_score();
      is_distant = arme.A_distance;
    }
    else att = model_att.Attaque_1;
  }
  else if (document.querySelector('#table_attaque .arme_radio2').checked) {
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === Attaquant.Arme2);
      const cmp = Competences.find(competence => competence.Nom_model === Attaquant.Model && competence.Nom === arme.Competence);
      att = cmp.get_score();
      is_distant = arme.A_distance;
    }
    else att = model_att.Attaque_2;
  }

  document.querySelector('#table_attaque .att_base').value = att;

  // Affichage des éléments de l'attaque en fonction de la distance
  document.querySelectorAll('#table_attaque .att_distante').forEach(element => element.style.display = is_distant ? '' : 'none');
  document.querySelectorAll('#table_attaque .att_melee').forEach(element => element.style.display = is_distant ? 'none' : '');

  // Affichage des éléments de l'attaque en fonction du nombre de defenseur (combat contre plusieurs)
  let nb_def = 1;
  const av = Avantages.find(avantage => avantage.Nom_model === Attaquant.Model && avantage.Nom === "Combat contre plusieurs" && avantage.Selection);
  if (av !== undefined && av !== null) {
    const melee = Melees.find(melee => melee.defenseur === Attaquant);
    if (melee !== undefined && melee !== null) nb_def = melee.nb_attaquants();
  }
  let att_double = nb_def > 1;

  // ------------------------------------------------------------------- //
  // ToDo : si att_double, créer une seconde attaque 1 seconde plus tard //
  // ------------------------------------------------------------------- //

  document.querySelector('#table_attaque .att_double').style.display = att_double ? '' : 'none';

  // Calcul du score de l'attaque
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
  document.querySelector('#table_attaque').style.display = '';

  document.querySelector('#table_attaque .attaquant').value = Attaquant.Titre;
  document.querySelector('#table_attaque .defenseur').value = Defenseur.Titre;

  document.querySelector('#table_attaque .def_immobile').checked = Defenseur.Def_immobile;
  document.querySelector('#table_attaque .def_heroisme').checked = Defenseur.Def_heroisme;
  document.querySelector('#table_attaque .def_mobilite_reduite').checked = Defenseur.Def_mobilite_reduite;
  document.querySelector('#table_attaque .def_mobilite_tres_reduite').checked = Defenseur.Def_mobilite_tres_reduite;
  document.querySelector('#table_attaque .def_non_concentre').checked = Defenseur.Def_non_concentre;
  document.querySelector('#table_attaque .def_legerement_aveugle').checked = Defenseur.Def_legerement_aveugle;
  document.querySelector('#table_attaque .def_fortement_aveugle').checked = Defenseur.Def_fortement_aveugle;

  document.querySelector('#table_attaque .att_avantage_positionnel').checked = Attaquant.Att_avantage_positionnel;
  document.querySelector('#table_attaque .att_heroisme').checked = Attaquant.Att_heroisme;
  document.querySelector('#table_attaque .att_temps_pour_viser').checked = Attaquant.Att_temps_pour_viser;
  document.querySelector('#table_attaque .att_courte_portee').checked = Attaquant.Att_courte_portee;
  document.querySelector('#table_attaque .att_longue_portee').checked = Attaquant.Att_longue_portee;
  document.querySelector('#table_attaque .att_gene_mouvements').checked = Attaquant.Att_gene_mouvements;
  document.querySelector('#table_attaque .att_economie_energie').checked = Attaquant.Att_economie_energie;
  document.querySelector('#table_attaque .att_desavantage_positionnel').checked = Attaquant.Att_desavantage_positionnel;
  document.querySelector('#table_attaque .att_double_attaque').checked = Attaquant.Att_double_attaque;

  // Détermination du nombre d'attaquants (défenseur)
  let nb_attaquants = 1;
  const melee_def = Melees.find(melee => melee.defenseur === Defenseur);
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
  const nb_blessures_def = Defenseur.get_nb_blessures();
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
  const nb_blessures_att = Attaquant.get_nb_blessures();
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
  const model_att = Models.find(x => x.Nom_model === Attaquant.Model);
  if (model_att.Is_monster && Attaquant.Arme1 === "") {
    document.querySelector('#table_attaque .main1').innerText = "Arme naturelle 1";
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'flex';
    document.querySelector('#table_attaque .arme_radio1').checked = true;
    document.querySelector('#table_attaque .arme_radio1').dispatchEvent(new Event('change'));
  }
  else if (Attaquant.Arme1 !== "" && Attaquant.Arme1 !== "Bouclier") {
    document.querySelector('#table_attaque .main1').innerText = Attaquant.Arme1;
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'flex';
    document.querySelector('#table_attaque .arme_radio1').checked = true;
    document.querySelector('#table_attaque .arme_radio1').dispatchEvent(new Event('change'));
  }
  else {
    document.querySelector('#table_attaque .arme_radio1').closest('div').style.display = 'none';
  }

  if (model_att.Is_monster && Attaquant.Arme2 === "" && model_att.Bool_attaque_2) {
    document.querySelector('#table_attaque .main2').innerText = "Arme naturelle 2";
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'flex';
    if (!document.querySelector('#table_attaque .arme_radio1').checked) {
      document.querySelector('#table_attaque .arme_radio2').checked = true;
      document.querySelector('#table_attaque .arme_radio2').dispatchEvent(new Event('change'));
    }
  }
  else if (Attaquant.Arme2 !== "" && Attaquant.Arme2 !== "Bouclier") {
    document.querySelector('#table_attaque .main2').innerText = Attaquant.Arme2;
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'flex';
    if (!document.querySelector('#table_attaque .arme_radio1').checked) {
      document.querySelector('#table_attaque .arme_radio2').checked = true;
      document.querySelector('#table_attaque .arme_radio2').dispatchEvent(new Event('change'));
    }
  }
  else {
    document.querySelector('#table_attaque .arme_radio2').closest('div').style.display = 'none';
  }

  calcul_feinte_de_corps();
  calcul_attaque();
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

  document.querySelector('#table_defense .dommages').addEventListener("click", function (event) {
    if (document.querySelector('#table_defense .arme_radio1').checked) {
      Defenseur.Arme1_engagee = true;
    }
    else if (document.querySelector('#table_defense .arme_radio2').checked) {
      Defenseur.Arme2_engagee = true;
    }
    else {
      Defenseur.Nb_esquives++;
    }
    document.querySelector('#table_dommages .marge_finale').value =
      document.querySelector('#table_defense .resultat').value;

    document.querySelector('#table_defense').style.display = 'none';

    if (document.querySelector('#table_defense .resultat').value > 0) affiche_dommages();
    else if (document.querySelector('#table_defense .resultat').value = 0) {
      const jet = parseInt(document.querySelector('#table_defense .jet_des_defense').value);
      if (!isNaN(jet) && (jet + calcul_defense() - 10 < 0)) affiche_dommages();
    }
  });

  // Gestion des radio buttons des armes
  document.querySelectorAll('#table_defense .arme_radio0, #table_defense .arme_radio1, #table_defense .arme_radio2').forEach(element =>
    element.addEventListener("change", function (event) {
      // Attaque à distance ou non ?
      let att_distante = false;
      const model_att = Models.find(x => x.Nom_model === Attaquant.Model);
      if (document.querySelector('#table_attaque .arme_radio1').checked) {
        if (!model_att.Is_monster) {
          const arme = Armes.find(arme => arme.Nom_arme === Attaquant.Arme1);
          att_distante = arme.A_distance;
        }
      }
      else if (document.querySelector('#table_attaque .arme_radio2').checked) {
        if (!model_att.Is_monster) {
          const arme = Armes.find(arme => arme.Nom_arme === Attaquant.Arme2);
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
  document.querySelector('#table_defense .def_heroisme').addEventListener("change", function (event) {
    Defenseur.Def_heroisme = event.target.checked;
    calcul_defense();
  });
  document.querySelector('#table_defense .def_defense_preparee').addEventListener("change", function (event) {
    calcul_defense();
  });
  document.querySelector('#table_defense .def_allonge_superieure').addEventListener("change", function (event) {
    Defenseur.Def_allonge_superieure = event.target.checked;
    calcul_defense();
  });
  document.querySelector('#table_defense .def_sans_vision_claire').addEventListener("change", function (event) {
    Defenseur.Def_sans_vision_claire = event.target.checked;
    calcul_defense();
  });
  document.querySelector('#table_defense .def_genee_dans_ses_mouvements').addEventListener("change", function (event) {
    Defenseur.Def_genee_dans_ses_mouvements = event.target.checked;
    calcul_defense();
  });
  document.querySelector('#table_defense .def_allonge_inferieure').addEventListener("change", function (event) {
    Defenseur.Def_allonge_inferieure = event.target.checked;
    calcul_defense();
  });
  document.querySelector('#table_defense .def_economie_energie').addEventListener("change", function (event) {
    Defenseur.Def_economie_energie = event.target.checked;
    calcul_defense();
  });

  function des_lances(jet) {
    const marge_att = parseInt(document.querySelector('#table_defense .marge_attaque').value);
    const marge_def = jet + calcul_defense() - 10;
    const marge_finale = marge_att - Math.max(marge_def, 0);

    document.querySelector('#table_defense .jet_des_defense').value = jet;
    document.querySelector('#table_defense .resultat').value = marge_finale;

    document.querySelector('#table_defense .dommages').disabled = false;
    document.querySelector('#table_defense .annuler').disabled = true;
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
  const model_def = Models.find(x => x.Nom_model === Defenseur.Model);

  // Calcul du score de défense
  let def = -99;
  if (document.querySelector('#table_defense .arme_radio1').checked) {
    if (!model_def.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === Defenseur.Arme1);
      const cmp = Competences.find(competence => competence.Nom_model === Defenseur.Model && competence.Nom === arme.Competence);
      def = Math.round(arme.Facteur_parade * cmp.get_score());
    }
    else def = model_def.Parade_1;
  }
  else if (document.querySelector('#table_defense .arme_radio2').checked) {
    if (!model_def.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === Defenseur.Arme2);
      const cmp = Competences.find(competence => competence.Nom_model === Defenseur.Model && competence.Nom === arme.Competence);
      def = Math.round(arme.Facteur_parade * cmp.get_score());
    }
    else def = model_def.Parade_2;
  }
  else if (document.querySelector('#table_defense .arme_radio0').checked) {
    let nb_esquives = parseInt(Defenseur.Nb_esquives);
    if (isNaN(nb_esquives)) nb_esquives = 0;

    if (!model_def.Is_monster) {
      const cmp = Competences.find(competence => competence.Nom_model === Defenseur.Model && competence.Nom === "Esquive");
      def = cmp.get_score() - nb_esquives;
    }
    else def = model_def.Esquive - nb_esquives;
  }
  document.querySelector('#table_defense .def_base').value = def;

  // Calcul du score de défense
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
  document.querySelector('#table_defense').style.display = '';

  document.querySelector('#table_defense .attaquant').value = Attaquant.Titre;
  document.querySelector('#table_defense .defenseur').value = Defenseur.Titre;

  document.querySelector('#table_defense .def_heroisme').checked = Defenseur.Def_heroisme;
  document.querySelector('#table_defense .def_defense_preparee').checked = Defenseur.Def_defense_preparee;
  document.querySelector('#table_defense .def_allonge_superieure').checked = Defenseur.Def_allonge_superieure;
  document.querySelector('#table_defense .def_longue_portee').checked = Attaquant.Att_longue_portee;
  document.querySelector('#table_defense .def_sans_vision_claire').checked = Defenseur.Def_sans_vision_claire;
  document.querySelector('#table_defense .def_allonge_inferieure').checked = Defenseur.Def_allonge_inferieure;
  document.querySelector('#table_defense .def_courte_portee').checked = Attaquant.Att_courte_portee;
  document.querySelector('#table_defense .def_economie_energie').checked = Defenseur.Def_economie_energie;
  document.querySelector('#table_defense .def_genee_dans_ses_mouvements').checked = Defenseur.Def_genee_dans_ses_mouvements;

  // Détermination du nombre de blessures (défenseur)
  const nb_blessures_def = Defenseur.get_nb_blessures();
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
  const model_att = Models.find(x => x.Nom_model === Attaquant.Model);
  if (document.querySelector('#table_attaque .arme_radio1').checked) {
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === Attaquant.Arme1);
      att_distante = arme.A_distance;
    }
  }
  else if (document.querySelector('#table_attaque .arme_radio2').checked) {
    if (!model_att.Is_monster) {
      const arme = Armes.find(arme => arme.Nom_arme === Attaquant.Arme2);
      att_distante = arme.A_distance;
    }
  }
  // Détermination du modèle du défenseur
  const model_def = Models.find(x => x.Nom_model === Defenseur.Model);

  // Affichage du choix de l'arme
  const arme1 = Armes.find(arme => arme.Nom_arme === Defenseur.Arme1);
  if (model_def.Is_monster && Defenseur.Arme1 === "" && model_def.Bool_parade_1 && !Defenseur.Arme1_engagee) {
    document.querySelector('#table_defense .main1').innerText = "Arme naturelle 1";
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'flex';
    document.querySelector('#table_defense .arme_radio1').checked = true;
    document.querySelector('#table_defense .arme_radio1').dispatchEvent(new Event('change'));
  }
  else if (Defenseur.Arme1.toLowerCase().includes("bouclier") && !Defenseur.Arme1_engagee) {
    document.querySelector('#table_defense .main1').innerText = Defenseur.Arme1;
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'flex';
    document.querySelector('#table_defense .arme_radio1').checked = true;
    document.querySelector('#table_defense .arme_radio1').dispatchEvent(new Event('change'));
  }
  else if (Defenseur.Arme1 !== "" && !att_distante && !Defenseur.Arme1_engagee && arme1.Facteur_parade !== null) {
    document.querySelector('#table_defense .main1').innerText = Defenseur.Arme1;
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'flex';
    document.querySelector('#table_defense .arme_radio1').checked = true;
    document.querySelector('#table_defense .arme_radio1').dispatchEvent(new Event('change'));
  }
  else {
    document.querySelector('#table_defense .arme_radio1').closest('div').style.display = 'none';
  }

  const arme2 = Armes.find(arme => arme.Nom_arme === Defenseur.Arme2);
  if (model_def.Is_monster && Defenseur.Arme2 === "" && model_def.Bool_attaque_2 && model_def.Bool_parade_2 && !Defenseur.Arme2_engagee) {
    document.querySelector('#table_defense .main2').innerText = "Arme naturelle 2";
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'flex';
    if (!document.querySelector('#table_defense .arme_radio1').checked) {
      document.querySelector('#table_defense .arme_radio2').checked = true;
    }
    document.querySelector('#table_defense .arme_radio2').dispatchEvent(new Event('change'));
  }
  else if (Defenseur.Arme2.toLowerCase().includes("bouclier") && !Defenseur.Arme2_engagee) {
    document.querySelector('#table_defense .main2').innerText = Defenseur.Arme2;
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'flex';
    if (!document.querySelector('#table_defense .arme_radio1').checked) {
      document.querySelector('#table_defense .arme_radio2').checked = true;
    }
    document.querySelector('#table_defense .arme_radio2').dispatchEvent(new Event('change'));
  }
  else if (Defenseur.Arme2 !== "" && !att_distante && !Defenseur.Arme2_engagee && arme2.Facteur_parade !== null) {
    document.querySelector('#table_defense .main2').innerText = Defenseur.Arme2;
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'flex';
    if (!document.querySelector('#table_defense .arme_radio1').checked) {
      document.querySelector('#table_defense .arme_radio2').checked = true;
    }
    document.querySelector('#table_defense .arme_radio2').dispatchEvent(new Event('change'));
  }
  else {
    document.querySelector('#table_defense .arme_radio2').closest('div').style.display = 'none';
  }

  calcul_defense();
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
    switch (zone_selectionnee) {
      case '1': Defenseur.Tete += dommages; break;
      case '2': Defenseur.BrasG += dommages; break;
      case '3': Defenseur.Poitrine += dommages; break;
      case '4': Defenseur.BrasD += dommages; break;
      case '5': Defenseur.Abdomen += dommages; break;
      case '6': Defenseur.JambeG += dommages; break;
      case '7': Defenseur.JambeD += dommages; break;
    }
    document.querySelector('#table_dommages').style.display = 'none';
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

  // Affichage du détails du calcul de la défense
  document.querySelectorAll('#table_dommages .def_titre').forEach(element =>
    element.addEventListener("click", function (event) {
      const def_details = document.querySelector('#table_dommages .def_details');
      def_details.style.display = def_details.style.display === 'none' ? 'table' : 'none';
      affiche_dommages_details = !affiche_dommages_details;
    }));

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

    document.querySelector('#table_dommages .' + zone).disabled = false;

    document.querySelector('#table_dommages .' + zone).checked = true;
    document.querySelector('#table_dommages .' + zone).dispatchEvent(new Event('change'));

    document.querySelector('#table_dommages .appliquer').disabled = false;
    document.querySelector('#table_dommages .chance').disabled = false;
    document.querySelector('#table_dommages .annuler').disabled = true;
    calcul_dommages();
  });

  document.querySelector('#table_dommages .chance').addEventListener("click", function (event) {
    for (let i = 0; i < 3; i++) {
      // On vérifie si toutes les zones sont désactivées
      let has_disabled_zone = false;
      ['tete', 'brasg', 'brasd', 'poitrine', 'abdomen', 'jambeg', 'jambed'].forEach(zone => {
        if (document.querySelector('#table_dommages .' + zone).disabled) {
          has_disabled_zone = true;
        }
      });
      if (!has_disabled_zone) break;

      // On active une nouvelle zone aléatoirement
      let zone = des_lances();
      while (!document.querySelector('#table_dommages .' + zone).disabled) {
        zone = des_lances();
      }
      document.querySelector('#table_dommages .' + zone).disabled = false;
    }

    calcul_dommages();
  });
}

function calcul_dommages() {
  const marge_finale = parseInt(document.querySelector('#table_dommages .marge_finale').value);
  const main_attaquant = document.querySelector('#table_attaque .arme_radio1').checked ? 1 : 2;
  const arme = Armes.find(arme => arme.Nom_arme === Attaquant["Arme" + main_attaquant]);
  const model_att = Models.find(x => x.Nom_model === Attaquant.Model);
  const model_def = Models.find(x => x.Nom_model === Defenseur.Model);

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
      const bonus_force = Math.floor((Attaquant.get("force") - 10) / 2);
      dommages += Math.round(arme.Coeff_force * Math.min(bonus_force, marge_finale));
    }
  }

  // Calcul de l'armure du défenseur
  const armure = zone_selectionnee === null ? model_def.getArmureGenerale() : model_def["Armure_" + zone_selectionnee];
  dommages -= armure;

  if (dommages < 0) dommages = 0;

  document.querySelector('#table_dommages .dommages').value = dommages;

  // Blessures subies par le défenseur
  const seuil_blessures = model_def.get("seuil_blessures");
  const blessures_zone = zone_selectionnee === null ? Defenseur.General : Defenseur[zone_selectionnee.charAt(0).toUpperCase() + zone_selectionnee.slice(1)];

  if ((blessures_zone % seuil_blessures) + dommages >= 3 * seuil_blessures) {
    document.querySelector('#table_dommages .nb_blessures').innerText = "(+3 blessures)";
  }
  else if ((blessures_zone % seuil_blessures) + dommages >= 2 * seuil_blessures) {
    document.querySelector('#table_dommages .nb_blessures').innerText = "(+2 blessures)";
  }
  else if ((blessures_zone % seuil_blessures) + dommages >= seuil_blessures) {
    document.querySelector('#table_dommages .nb_blessures').innerText = "(+1 blessure)";
  }
  else {
    document.querySelector('#table_dommages .nb_blessures').innerText = "(blessure superficielle)";
  }

  return dommages;
}

// Affichage de la fenêtre des dommages
function affiche_dommages() {
  document.querySelector('#table_dommages').style.display = '';

  // Détermination du nombre de blessures (défenseur)
  document.querySelector('#table_dommages .attaquant').value = Attaquant.Titre;
  document.querySelector('#table_dommages .defenseur').value = Defenseur.Titre;

  const model_def = Models.find(x => x.Nom_model === Defenseur.Model);
  document.querySelector('#table_dommages .seuil_blessures').value = model_def.get("seuil_blessures");
  document.querySelector('#table_dommages .general_armure').innerText = "(Bl : " + Defenseur.General + " - Arm : " + model_def.getArmureGenerale() + ")";
  document.querySelector('#table_dommages .tete_armure').innerText = "(Bl : " + Defenseur.Tete + " - Arm : " + model_def.Armure_tete + ")";
  document.querySelector('#table_dommages .brasg_armure').innerText = "(Bl : " + Defenseur.Brasg + " - Arm : " + model_def.Armure_brasg + ")";
  document.querySelector('#table_dommages .brasd_armure').innerText = "(Bl : " + Defenseur.Brasd + " - Arm : " + model_def.Armure_brasd + ")";
  document.querySelector('#table_dommages .poitrine_armure').innerText = "(Bl : " + Defenseur.Poitrine + " - Arm : " + model_def.Armure_poitrine + ")";
  document.querySelector('#table_dommages .abdomen_armure').innerText = "(Bl : " + Defenseur.Abdomen + " - Arm : " + model_def.Armure_abdomen + ")";
  document.querySelector('#table_dommages .jambeg_armure').innerText = "(Bl : " + Defenseur.Jambeg + " - Arm : " + model_def.Armure_jambeg + ")";
  document.querySelector('#table_dommages .jambed_armure').innerText = "(Bl : " + Defenseur.Jambed + " - Arm : " + model_def.Armure_jambed + ")";
}
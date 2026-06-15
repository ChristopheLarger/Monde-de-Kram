/**
 * FICHIER DLG_COMBAT.JS
 * =====================
 * Gestion des fenêtres de combat
 */

// === VARIABLES GLOBALES DE DLG_COMBAT ===
let Attaquant = null;
let Defenseur = null;


initialise_attaque();
function initialise_attaque() {
  // Gestion des radio buttons des armes
  document.querySelector('#table_attaque .arme_radio1').addEventListener("change", function (event) {
    calcul_fdc();
    calcul_att();
  });
  document.querySelector('#table_attaque .arme_radio2').addEventListener("change", function (event) {
    calcul_fdc();
    calcul_att();
  });

  // Affichage du détails du calcul de la Feinte de corps
  document.querySelector('#table_attaque .fdc_titre').addEventListener("click", function (event) {
    event.preventDefault();
    const fdcDetails = document.querySelector('#table_attaque .fdc_details');
    fdcDetails.style.display = fdcDetails.style.display === 'none' ? 'table' : 'none';
  });

  // Affichage du détails du calcul du score d'attaque
  document.querySelector('#table_attaque .att_titre').addEventListener("click", function (event) {
    event.preventDefault();
    const attDetails = document.querySelector('#table_attaque .att_details');
    attDetails.style.display = attDetails.style.display === 'none' ? 'table' : 'none';
  });

  // Gestion des checkboxes du défenseur
  document.querySelector('#table_attaque .def_immobile').addEventListener("change", function (event) {
    calcul_fdc();
  });
  document.querySelector('#table_attaque .def_mobilite_reduite').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_mobilite_tres_reduite').checked = false;
    calcul_fdc();
  });
  document.querySelector('#table_attaque .def_mobilite_tres_reduite').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_mobilite_reduite').checked = false;
    calcul_fdc();
  });
  document.querySelector('#table_attaque .def_non_concentre').addEventListener("change", function (event) {
    calcul_fdc();
  });
  document.querySelector('#table_attaque .def_legerement_aveugle').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_fortement_aveugle').checked = false;
    calcul_fdc();
  });
  document.querySelector('#table_attaque .def_fortement_aveugle').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .def_legerement_aveugle').checked = false;
    calcul_fdc();
  });

  // Gestion des checkboxes de l'attaquant
  document.querySelector('#table_attaque .att_avantage_positionnel').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_desavantage_positionnel').checked = false;
    calcul_att();
  });
  document.querySelector('#table_attaque .att_temps_pour_viser').addEventListener("change", function (event) {
    calcul_att();
  });
  document.querySelector('#table_attaque .att_courte_portee').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_longue_portee').checked = false;
    calcul_att();
  });
  document.querySelector('#table_attaque .att_longue_portee').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_courte_portee').checked = false;
    calcul_att();
  });
  document.querySelector('#table_attaque .att_gene_mouvements').addEventListener("change", function (event) {
    calcul_att();
  });
  document.querySelector('#table_attaque .att_economie_energie').addEventListener("change", function (event) {
    calcul_att();
  });
  document.querySelector('#table_attaque .att_desavantage_positionnel').addEventListener("change", function (event) {
    if (event.target.checked) document.querySelector('#table_attaque .att_avantage_positionnel').checked = false;
    calcul_att();
  });
}

// Calcul et affichage du score de la Feinte de corps
function calcul_fdc() {
  // Affichage de la base de la Feinte de corps
  const model_def = Models.find(x => x.Nom_model === Defenseur.Model);
  if (!model_def.Is_monster) {
    const cmp = Competences.find(competence => competence.Nom_model === Defenseur.Model && competence.Nom === "Feinte de corps");
    fdc = cmp.get_score();
  }
  else fdc = model_def.Feinte_de_corps;

  document.querySelector('#table_attaque .fdc_base').value = fdc;

  if (document.querySelector('#table_attaque .def_immobile').checked) fdc = 0;
  if (document.querySelector('#table_attaque .def_mobilite_reduite').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_mobilite_tres_reduite').checked) fdc -= 4;
  if (document.querySelector('#table_attaque .def_non_concentre').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_legerement_aveugle').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_fortement_aveugle').checked) fdc -= 4;

  if (document.querySelector('#table_attaque .def_deux_attaquants').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_plus_de_deux_attaquants').checked) fdc -= 4;

  if (document.querySelector('#table_attaque .def_une_blessure').checked) fdc -= 2;
  if (document.querySelector('#table_attaque .def_deux_blessures').checked) fdc -= 4;

  if (fdc < 0) fdc = 0;

  document.querySelector('#table_attaque .feinte_de_corps').value = fdc;
}


// Calcul et affichage du score de la Feinte de corps
function calcul_att() {
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

  document.querySelectorAll('#table_attaque .att_distante').forEach(element => 
    element.style.display = is_distant ? '' : 'none');
  document.querySelectorAll('#table_attaque .att_melee').forEach(element =>
    element.style.display = is_distant ? 'none' : '');

  if (document.querySelector('#table_attaque .att_avantage_positionnel').checked) att += 2;
  if (document.querySelector('#table_attaque .att_temps_pour_viser').checked) att += 2;
  if (document.querySelector('#table_attaque .att_courte_portee').checked) att += 2;
  if (document.querySelector('#table_attaque .att_longue_portee').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_gene_mouvements').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_economie_energie').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_desavantage_positionnel').checked) att -= 2;

  if (document.querySelector('#table_attaque .att_une_blessure').checked) att -= 2;
  if (document.querySelector('#table_attaque .att_deux_blessures').checked) att -= 4;

  document.querySelector('#table_attaque .score_attaque').value = att;
}

// Affichage de la fenêtre d'attaque
function affiche_attaque() {
  document.getElementById('table_attaque').style.display = 'block';

  Attaquant = Pions.find(pion => pion.Type === 'allies');
  Defenseur = Pions.find(pion => pion.Type === 'ennemis');

  document.querySelector('#table_attaque .attaquant').value = Attaquant.Titre;
  document.querySelector('#table_attaque .defenseur').value = Defenseur.Titre;

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
  if (Attaquant.Arme1 !== "" && Attaquant.Arme1 !== "Bouclier") {
    document.querySelector('#table_attaque .main1').innerText = Attaquant.Arme1;
    document.querySelector('#table_attaque .arme_radio1').checked = true;
    document.querySelector('#table_attaque .arme_radio1').dispatchEvent(new Event('change'));
  }
  else {
    document.querySelector('#table_attaque .arme_radio1').closest('td').style.display = 'none';
  }
  if (Attaquant.Arme2 !== "" && Attaquant.Arme2 !== "Bouclier") {
    document.querySelector('#table_attaque .main2').innerText = Attaquant.Arme2;
    if (!document.querySelector('#table_attaque .arme_radio1').checked) {
      document.querySelector('#table_attaque .arme_radio2').checked = true;
      document.querySelector('#table_attaque .arme_radio2').dispatchEvent(new Event('change'));
    }
  }
  else {
    document.querySelector('#table_attaque .arme_radio2').closest('td').style.display = 'none';
  }

  calcul_fdc();
  calcul_att();
}
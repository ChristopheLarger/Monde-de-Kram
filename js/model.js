/**
 * FICHIER MODEL.JS
 * =================
 * Classe pour créer des objets modèle de personnage
 */

// Attributs des races
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
  aquante: {
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

// Coûts des attributs
const parametres_couts = {
  0: { cout: -210, ajustement: -5, degres_gen: 270, degres_spe: 60, },
  1: { cout: -190, ajustement: -5, degres_gen: 180, degres_spe: 60, },
  2: { cout: -170, ajustement: -4, degres_gen: 90, degres_spe: 30, },
  3: { cout: -150, ajustement: -4, degres_gen: 75, degres_spe: 30, },
  4: { cout: -130, ajustement: -3, degres_gen: 60, degres_spe: 20, },
  5: { cout: -110, ajustement: -3, degres_gen: 52, degres_spe: 20, },
  6: { cout: -90, ajustement: -2, degres_gen: 45, degres_spe: 15, },
  7: { cout: -70, ajustement: -2, degres_gen: 40, degres_spe: 15, },
  8: { cout: -50, ajustement: -1, degres_gen: 36, degres_spe: 12, },
  9: { cout: -25, ajustement: -1, degres_gen: 33, degres_spe: 12, },
  10: { cout: 0, ajustement: 0, degres_gen: 30, degres_spe: 10, },
  11: { cout: 25, ajustement: 0, degres_gen: 29, degres_spe: 10, },
  12: { cout: 50, ajustement: 1, degres_gen: 27, degres_spe: 9, },
  13: { cout: 80, ajustement: 1, degres_gen: 26, degres_spe: 9, },
  14: { cout: 120, ajustement: 2, degres_gen: 24, degres_spe: 8, },
  15: { cout: 170, ajustement: 2, degres_gen: 23, degres_spe: 8, },
  16: { cout: 230, ajustement: 3, degres_gen: 21, degres_spe: 7, },
  17: { cout: 300, ajustement: 3, degres_gen: 20, degres_spe: 7, },
  18: { cout: 380, ajustement: 4, degres_gen: 18, degres_spe: 6, },
  19: { cout: 470, ajustement: 4, degres_gen: 17, degres_spe: 6, },
  20: { cout: 570, ajustement: 5, degres_gen: 15, degres_spe: 5, },
  21: { cout: 680, ajustement: 5, degres_gen: 14, degres_spe: 5, },
  22: { cout: 800, ajustement: 6, degres_gen: 12, degres_spe: 4, },
  23: { cout: 930, ajustement: 6, degres_gen: 11, degres_spe: 4, },
  24: { cout: 1070, ajustement: 7, degres_gen: 9, degres_spe: 3, },
  25: { cout: 1220, ajustement: 7, degres_gen: 8, degres_spe: 3, },
};

/**
 * Classe représentant un modèle de personnage
 */
class Model {
  /**
   * Crée une nouvelle instance de modèle avec des valeurs par défaut
   * @param {Object} data - Données du modèle (optionnel)
   */
  constructor(data = {}) {
    // Propriétés de base
    this.Nom_model = data.Nom_model || "";
    this.Image = data.Image || null;
    this.Is_joueur = data.Is_joueur || 0;
    this.Is_monster = data.Is_monster || 0;

    this.Nb_blessures_max = data.Nb_blessures_max || 1;

    // Attributs de base (Humanoide)
    this.Race = data.Race || "";
    this.Ambidextre = data.Ambidextre || 0;

    this.Force = data.Force || 0;
    this.Constitution = data.Constitution || 0;
    this.Vivacite_physique = data.Vivacite_physique || 0;
    this.Perception = data.Perception || 0;

    this.Vivacite_mentale = data.Vivacite_mentale || 0;
    this.Volonte = data.Volonte || 0;
    this.Abstraction = data.Abstraction || 0;
    this.Charisme = data.Charisme || 0;

    this.Adaptation = data.Adaptation || 0;
    this.Combat = data.Combat || 0;
    this.Foi = data.Foi || 0;
    this.Magie = data.Magie || 0;
    this.Memoire = data.Memoire || 0;
    this.Telepathie = data.Telepathie || 0;

    // Modificateurs des statistiques d'experience (Humanoide)
    this.Force_experience = data.Force_experience || 0;
    this.Constitution_experience = data.Constitution_experience || 0;
    this.Vivacite_physique_experience = data.Vivacite_physique_experience || 0;
    this.Perception_experience = data.Perception_experience || 0;

    this.Vivacite_mentale_experience = data.Vivacite_mentale_experience || 0;
    this.Volonte_experience = data.Volonte_experience || 0;
    this.Abstraction_experience = data.Abstraction_experience || 0;
    this.Charisme_experience = data.Charisme_experience || 0;

    this.Adaptation_experience = data.Adaptation_experience || 0;
    this.Combat_experience = data.Combat_experience || 0;
    this.Foi_experience = data.Foi_experience || 0;
    this.Magie_experience = data.Magie_experience || 0;
    this.Memoire_experience = data.Memoire_experience || 0;
    this.Telepathie_experience = data.Telepathie_experience || 0;

    // Caractéristiques de base (Monstre) (+VP de l'humanoide)
    this.Seuil_blessures = data.Seuil_blessures || 0;
    this.Fatigue = data.Fatigue || 0;
    this.Puissance_mentale = data.Puissance_mentale || 0;
    this.Puissance_physique = data.Puissance_physique || 0;
    this.Vivacite_physique2 = data.Vivacite_physique2 || 0;
    this.Capacites = data.Capacites || "";
    this.Initiative = data.Initiative || 0;
    this.Agressivite = data.Agressivite || 0;
    this.Sociabilite = data.Sociabilite || 0;
    this.Esquive = data.Esquive || 0;
    this.Feinte_de_corps = data.Feinte_de_corps || 0;
    this.Attaque_1 = data.Attaque_1 || 0;
    this.Parade_1 = data.Parade_1 || 0;
    this.Bool_parade_1 = data.Bool_parade_1 || 0;
    this.Coefficient_dommages_1 = data.Coefficient_dommages_1 || 0;
    this.Bonus_dommages_1 = data.Bonus_dommages_1 || 0;
    this.Attaque_2 = data.Attaque_2 || 0;
    this.Bool_attaque_2 = data.Bool_attaque_2 || 0;
    this.Parade_2 = data.Parade_2 || 0;
    this.Bool_parade_2 = data.Bool_parade_2 || 0;
    this.Coefficient_dommages_2 = data.Coefficient_dommages_2 || 0;
    this.Bonus_dommages_2 = data.Bonus_dommages_2 || 0;

    // Caractéristiques de magie
    this.Magie_type = data.Magie_type || "";
    this.Concentration = data.Concentration || 0;
    this.Liste_pretre = data.Liste_pretre || 0;

    // Protection par zone
    this.Armure_tete = data.Armure_tete || 0;
    this.Armure_poitrine = data.Armure_poitrine || 0;
    this.Armure_abdomen = data.Armure_abdomen || 0;
    this.Armure_brasg = data.Armure_brasg || 0;
    this.Armure_brasd = data.Armure_brasd || 0;
    this.Armure_jambeg = data.Armure_jambeg || 0;
    this.Armure_jambed = data.Armure_jambed || 0;
  }

  /**
     * Envoie un message du Model
     * @param {string} tag - Tag du message
     */
  sendMessage(tag, val = null) {
    switch (tag.toLowerCase()) {
      case "set_nom_model":
        // Set_Nom_model Nom_model@Nouveau_nom
        sendMessage("Set_Nom_model", this.Nom_model + "@" + val);
        return;
      case "set_degres":
        // Set_Degres Nom_competence@Nom_model@Degres
        sendMessage("Set_Degres", val.Nom_competence + "@" + val.Nom_model + "@" + val.Degres);
        return;
    }
    const regexp = /set_(.*)/;
    const match = tag.match(regexp);
    if (match) {
      const attribut = match[1];
      if (!(attribut in this)) return;
      sendMessage("Set_Model_" + attribut, this.Nom_model + "@" + val);
    }
  }

  /**
 * Duplique un modèle de personnage
 * @returns {Model} - Modèle dupliqué
 */
  dupliquer() {
    if (this.Is_joueur) return null; // Impossible de dupliquer un modèle de joueur ???

    const m = new Model(this);

    // Set Nom_model
    let i = 1;
    while (Models.find(x => x.Nom_model === this.Nom_model +
      " (" + String(i).padStart(2, '0') + ")")) i++;
    m.Nom_model = this.Nom_model + " (" + String(i).padStart(2, '0') + ")";

    sendMessage("Copy_Figurine", this.Nom_model + "@" + m.Nom_model);

    Models[Models.length] = m;

    return m;
  }

  /**
  * Calcul le seuil de blessures
  * @returns {number} - Seuil de blessures
  */
  #get_seuil_blessures() {
    if (this.Is_monster) return this.Seuil_blessures;
    return (Math.round(this.get("constitution") / 3) + 2);
  }

  /**
  * Calcul les points de fatigue
  * @returns {number} - Points de fatigue
  */
  #get_fatigue() {
    if (this.Is_monster) return this.Fatigue;
    return (2 * this.get("constitution") + 4);
  }

  /**
  * Calcul les points de concentration
  * @returns {number} - Points de concentration
  */
  get_cout_sorts() {
    if (this.Magie_type !== "classique") return 0;

    let res = 0;
    SortsConnus.filter((sort) => sort.Nom_model === this.Nom_model).forEach((sort) => {
      const don_directeur = this.get(getDonDirecteur(sort.Nom_liste));
      const score = Math.round((don_directeur + this.get("memoire")) / 2);
      const cout_niveau = parametres_couts[score].degres_spe;
      const s = Sorts.find((s) => s.Nom_liste === sort.Nom_liste && s.Nom_sort === sort.Nom_sort);
      res += s.Niveau * cout_niveau;
    });
    return res;
  }

  /**
  * Calcul le coût des caractéristiques de base
  * @returns {number} - Coût des caractéristiques de base
  */
  get_cout_attributs_creation() {
    let res = 0;
    ["force", "constitution", "vivacite_physique", "perception", "vivacite_mentale", "volonte", "abstraction", "charisme"].forEach((attrib) => {
      const att_name = attrib.slice(0, 1).toUpperCase() + attrib.slice(1).toLowerCase();
      res += parametres_couts[this[att_name]].cout;
    });
    return res;
  }

  /**
  * Calcul le coût des caractéristiques de base
  * @returns {number} - Coût des caractéristiques de base
  */
  get_cout_dons_creation() {
    let res = 0;
    ["adaptation", "combat", "foi", "magie", "memoire", "telepathie"].forEach((attrib) => {
      const att_name = attrib.slice(0, 1).toUpperCase() + attrib.slice(1).toLowerCase();
      res += parametres_couts[this[att_name]].cout;
    });
    return res;
  }

  /**
  * Calcul le coût des caractéristiques d'expérience
  * @returns {number} - Coût des caractéristiques d'expérience
  */
  get_cout_attributs_experience() {
    let res = 0;
    ["force", "constitution", "vivacite_physique", "perception", "vivacite_mentale", "volonte", "abstraction", "charisme"].forEach((attrib) => {
      const att_name = attrib.slice(0, 1).toUpperCase() + attrib.slice(1).toLowerCase();
      res += 2 * (parametres_couts[this.get(attrib)].cout - parametres_couts[this[att_name]].cout);
    });
    return res;
  }

  /**
 * Calcul du coût des avantages/désavantages de la création
 */
  get_cout_avantages_creation() {
    let nb_points_cre = 0;
    m_model = this;
    document.querySelectorAll("#div_model_4 tr").forEach((tr) => {
      if (tr.querySelector(".selection_creation") === null) return;
      if (!tr.querySelector(".selection_creation").checked) return;
      nb_points_cre += parseInt(tr.querySelector(".cout").textContent);
    });
    return nb_points_cre;
  }

  /**
   * Calcul du coût des avantages/désavantages de l'expérience
   */
  get_cout_avantages_experience() {
    let nb_points_exp = 0;
    m_model = this;
    document.querySelectorAll("#div_model_4 tr").forEach((tr) => {
      if (tr.querySelector(".selection_experience") === null) return;
      if (!tr.querySelector(".selection_experience").checked) return;
      nb_points_exp += parseInt(tr.querySelector(".cout").textContent);
    });
    return nb_points_exp;
  }

  get_cout_desavantages_creation() {
    let nb_points_cre = 0;
    m_model = this;
    document.querySelectorAll("#div_model_6 tr").forEach((tr) => {
      if (tr.querySelector(".selection_creation") === null) return;
      if (!tr.querySelector(".selection_creation").checked) return;
      nb_points_cre += parseInt(tr.querySelector(".cout").textContent);
    });
    return nb_points_cre;
  }

  /**
  * Calcul le coût de la concentration
  * @returns {number} - Coût de la concentration
  */
  get_cout_concentration() {
    if (this.Magie_type !== "religieuse") return 0;

    const don_directeur = this.get(getDonDirecteur(this.Liste_pretre));
    const score = Math.round((don_directeur + this.get("foi")) / 2);
    const cout_niveau = parametres_couts[score].degres_spe;
    return 2 * cout_niveau * this.Concentration;
  }

  /**
  * Calcul le coût des compétences connues
  * @returns {number} - Coût des compétences connues
  */
  get_cout_competences() {
    let res = 0;
    CompetencesConnues.filter((comp) => comp.Nom_model === this.Nom_model).forEach((comp) => {
      res += this.get_cout(comp.Nom_competence);
    });
    return res;
  }

  /**
  * Calcul les points de concentration
  * @returns {number} - Points de concentration
  */
  #get_concentration() {
    if (this.Magie_type === "religieuse") return this.Concentration;
    if (this.Magie_type === "sans") return 0;
    return Math.ceil(this.get_cout_sorts() / 20); // Magie_type === "classique"
  }

  /**
  * Calcul la coordination
  * @returns {number} - Coordination
  */
  #get_coordination() {
    return Math.round((this.get("vivacite_physique") + this.get("perception") + this.get("vivacite_mentale")) / 3);
  }

  /**
* Calcul la coordination
* @returns {number} - Coordination
*/
  #get_niveau_physique() {
    return Math.round((this.get("force") + this.get("constitution") + this.get("vivacite_physique") + this.get("perception")) / 4);
  }

  /**
  * Récupère la valeur d'un attribut
  * @param {string} attribute - Attribut à récupérer
  * @returns {number} - Valeur de l'attribut
  */
  get(attribute) {
    if (attribute === "seuil_blessures") return this.#get_seuil_blessures();
    if (attribute === "concentration") return this.#get_concentration();
    if (attribute === "fatigue") return this.#get_fatigue();
    if (attribute === "coordination") return this.#get_coordination();
    if (attribute === "niveau_physique") return this.#get_niveau_physique();

    let value = parseInt(this[attribute.slice(0, 1).toUpperCase() + attribute.slice(1).toLowerCase()]) || 0;

    ["force", "constitution", "vivacite_physique", "perception", "vivacite_mentale", "volonte", "abstraction", "charisme", "adaptation", "combat", "foi", "magie", "memoire", "telepathie"].forEach((attrib) => {
      if (attribute === attrib) {
        value += parseInt(this[attrib.slice(0, 1).toUpperCase() + attrib.slice(1).toLowerCase() + "_experience"]) || 0;
        value += parseInt(attributs_races[this.Race][attrib]) || 0;
      }
    });
  
    return value;
  }

  /**
  * Calcul le coût d'une compétence
  * @param {string} Nom_competence - Nom de la compétence
  * @returns {number} - Coût de la compétence
  */
  get_cout(Nom_competence) {
    const degres = CompetencesConnues.find(comp => comp.Nom_model === this.Nom_model && comp.Nom_competence === Nom_competence).Degres;
    let cmp = Competences.find(comp => comp.Nom_competence === Nom_competence);
    let don = cmp.Don;

    if (Nom_competence === "Compétences mineures") return 0;

    if (don !== null && cmp.Competence_majeure !== "Compétences mineures") {
      // Calcul du coût de la compétence majeure
      switch (don) {
        case "Cmbx2":
          return degres * (degres + 1) / 1 * parametres_couts[this.get("combat")].degres_gen;
        case "Cmb":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("combat")].degres_gen;
        case "Mag":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("magie")].degres_gen;
        case "Foi":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("foi")].degres_gen;
        case "Adp":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("adaptation")].degres_gen;
        case "Adp+Mem":
          return degres * (degres + 1) / 2 * parametres_couts[Math.round((this.get("adaptation") + this.get("memoire")) / 2)].degres_gen;
        case "Adp+Thp":
          return degres * (degres + 1) / 2 * parametres_couts[Math.round((this.get("adaptation") + this.get("telepathie")) / 2)].degres_gen;
        case "Thp":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("telepathie")].degres_gen;
        case "Mem":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("memoire")].degres_gen;
      }
    }
    else {
      // Calcul du coût de la compétence mineure
      if (cmp.Competence_majeure !== "Compétences mineures") don = Competences.find(comp => comp.Nom_competence === cmp.Competence_majeure).Don;

      switch (don) {
        case "Cmbx2":
          return degres * (degres + 1) / 1 * parametres_couts[this.get("combat")].degres_spe;
        case "Cmb":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("combat")].degres_spe;
        case "Mag":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("magie")].degres_spe;
        case "Foi":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("foi")].degres_spe;
        case "Adp":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("adaptation")].degres_spe;
        case "Adp+Mem":
          return degres * (degres + 1) / 2 * parametres_couts[Math.round((this.get("adaptation") + this.get("memoire")) / 2)].degres_spe;
        case "Adp+Thp":
          return degres * (degres + 1) / 2 * parametres_couts[Math.round((this.get("adaptation") + this.get("telepathie")) / 2)].degres_spe;
        case "Thp":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("telepathie")].degres_spe;
        case "Mem":
          return degres * (degres + 1) / 2 * parametres_couts[this.get("memoire")].degres_spe;
      }
    }

    return null;
  }

  /**
  * Calcul le score d'une compétence
  * @param {string} Nom_competence - Nom de la compétence
  * @returns {number} - Score de la compétence
  */
  get_score(Nom_competence) {
    const cmp = Competences.find(comp => comp.Nom_competence === Nom_competence);
    const cmp_connue = CompetencesConnues.find(comp => comp.Nom_model === this.Nom_model && comp.Nom_competence === Nom_competence);
    let degres = 0;
    if (cmp_connue !== null && typeof cmp_connue !== "undefined") degres = parseInt(cmp_connue.Degres || 0);

    if (Nom_competence === "Compétences mineures") return 0;

    if (cmp.Attribut !== null) {
      // Calcul du score de la compétence majeure
      switch (cmp.Attribut) {
        case "Co":
          return degres + parametres_couts[this.get("coordination")].ajustement + cmp.Base;
        case "Co+VM":
          return degres + parametres_couts[Math.round((this.get("coordination") + this.get("vivacite_mentale")) / 2)].ajustement + cmp.Base;
        case "Co+VP":
          return degres + parametres_couts[Math.round((this.get("coordination") + this.get("vivacite_physique")) / 2)].ajustement + cmp.Base;
        case "Co+P":
          return degres + parametres_couts[Math.round((this.get("coordination") + this.get("perception")) / 2)].ajustement + cmp.Base;
        case "Co+F":
          return degres + parametres_couts[Math.round((this.get("coordination") + this.get("force")) / 2)].ajustement + cmp.Base;
        case "NP":
          return degres + parametres_couts[this.get("niveau_physique")].ajustement + cmp.Base;
        case "Ab":
          return degres + parametres_couts[this.get("abstraction")].ajustement + cmp.Base;
        case "V":
          return degres + parametres_couts[this.get("volonte")].ajustement + cmp.Base;
        case "VP":
          return degres + parametres_couts[this.get("vivacite_physique")].ajustement + cmp.Base;
        case "P+VM":
          return degres + parametres_couts[Math.round((this.get("perception") + this.get("vivacite_mentale")) / 2)].ajustement + cmp.Base;
        case "Ch":
          return degres + parametres_couts[this.get("charisme")].ajustement + cmp.Base;
        case "Co+V":
          return degres + parametres_couts[Math.round((this.get("coordination") + this.get("volonte")) / 2)].ajustement + cmp.Base;
        case "Co+Ch":
          return degres + parametres_couts[Math.round((this.get("coordination") + this.get("charisme")) / 2)].ajustement + cmp.Base;
      }
    }
    else {
      // Calcul du score de la compétence mineure
      const cmp_majeure = Competences.find(comp => comp.Nom_competence === cmp.Competence_majeure);
      const cmp_majeure_connue = CompetencesConnues.find(comp => comp.Nom_model === this.Nom_model && comp.Nom_competence === cmp.Competence_majeure);
      let degres_majeure = 0;
      if (cmp_majeure_connue !== null && typeof cmp_majeure_connue !== "undefined") degres_majeure = parseInt(cmp_majeure_connue.Degres || 0);

      switch (cmp_majeure.Attribut) {
        case "Co":
          return degres + degres_majeure + parametres_couts[this.get("coordination")].ajustement + cmp.Base + cmp_majeure.Base;
        case "Co+VM":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("coordination") + this.get("vivacite_mentale")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
        case "Co+VP":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("coordination") + this.get("vivacite_physique")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
        case "Co+P":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("coordination") + this.get("perception")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
        case "Co+F":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("coordination") + this.get("force")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
        case "NP":
          return degres + degres_majeure + parametres_couts[this.get("niveau_physique")].ajustement + cmp.Base + cmp_majeure.Base;
        case "Ab":
          return degres + degres_majeure + parametres_couts[this.get("abstraction")].ajustement + cmp.Base + cmp_majeure.Base;
        case "V":
          return degres + degres_majeure + parametres_couts[this.get("volonte")].ajustement + cmp.Base + cmp_majeure.Base;
        case "VP":
          return degres + degres_majeure + parametres_couts[this.get("vivacite_physique")].ajustement + cmp.Base + cmp_majeure.Base;
        case "P+VM":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("perception") + this.get("vivacite_mentale")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
        case "Ch":
          return degres + degres_majeure + parametres_couts[this.get("charisme")].ajustement + cmp.Base + cmp_majeure.Base;
        case "Co+V":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("coordination") + this.get("volonte")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
        case "Co+Ch":
          return degres + degres_majeure + parametres_couts[Math.round((this.get("coordination") + this.get("charisme")) / 2)].ajustement + cmp.Base + cmp_majeure.Base;
      }
    }

    return null;
  }

  /**
  * Calcul l'ajustement d'un attribut
  * @param {string} attribut - Attribut à ajuster
  * @returns {number} - Ajustement de l'attribut
  */
  #get_ajustement(attribut) {
    switch (attribut) {
      case "Co":
        return parametres_couts[this.get("coordination")].ajustement;
      case "Co+VM":
        return parametres_couts[Math.round((this.get("coordination") + this.get("vivacite_mentale")) / 2)].ajustement;
      case "Co+VP":
        return parametres_couts[Math.round((this.get("coordination") + this.get("vivacite_physique")) / 2)].ajustement;
      case "Co+P":
        return parametres_couts[Math.round((this.get("coordination") + this.get("perception")) / 2)].ajustement;
      case "Co+F":
        return parametres_couts[Math.round((this.get("coordination") + this.get("force")) / 2)].ajustement;
      case "NP":
        return parametres_couts[this.get("niveau_physique")].ajustement;
      case "Ab":
        return parametres_couts[this.get("abstraction")].ajustement;
      case "V":
        return parametres_couts[this.get("volonte")].ajustement;
      case "VP":
        return parametres_couts[this.get("vivacite_physique")].ajustement;
      case "P+VM":
        return parametres_couts[Math.round((this.get("perception") + this.get("vivacite_mentale")) / 2)].ajustement;
      case "Ch":
        return parametres_couts[this.get("charisme")].ajustement;
      case "Co+V":
        return parametres_couts[Math.round((this.get("coordination") + this.get("volonte")) / 2)].ajustement;
      case "Co+Ch":
        return parametres_couts[Math.round((this.get("coordination") + this.get("charisme")) / 2)].ajustement;
      default:
        return 0;
    }
  }

  /**
  * Calcul le score d'une compétence
  * @param {string} Nom_competence - Nom de la compétence
  * @returns {number} - Score de la compétence
  */
  get_competence_score(Nom_competence) {
    const classe = Nom_competence.normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll(" ", "_").replaceAll("'", "_").toLowerCase();
    let classe_maitre = null;
    let tr = null;
    let tr_maitre = null;

    document.querySelectorAll("#div_model_5 tr").forEach((element) => {
      if (element.classList.item(0) !== classe) return;
      tr = element;
      classe_maitre = element.classList.item(1);
    });

    document.querySelectorAll("#div_model_5 tr").forEach((element) => {
      if (element.classList.item(0) !== classe_maitre) return;
      tr_maitre = element;
    });

    const degres = tr.querySelector(".degres").value;
    let attribut = tr.querySelectorAll("td")[2].textContent;
    let base = tr.querySelectorAll("td")[4].textContent;

    if (base === "" || base === "-") base = 0;
    if (attribut === "") attribut = 0;

    let score = parseInt(base) + parseInt(degres) + this.#get_ajustement(attribut);

    if (classe_maitre !== null) {
      const degres_maitre = tr_maitre.querySelector(".degres").value;
      let attribut_maitre = tr_maitre.querySelectorAll("td")[2].textContent;
      let base_maitre = tr_maitre.querySelectorAll("td")[4].textContent;

      if (base_maitre === "" || base_maitre === "-") base_maitre = 0;
      if (attribut_maitre === "") attribut_maitre = 0;

      score += parseInt(base_maitre) + parseInt(degres_maitre) + this.#get_ajustement(attribut_maitre);
    }
    return score;
  }
}

// Tableau global contenant tous les modèles de personnages
let Models = [];

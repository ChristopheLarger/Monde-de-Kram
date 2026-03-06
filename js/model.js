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
    this.Pdv = data.Pdv || 0;
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
        // Set_Nom_model@Nom_model@Nouveau_nom
        sendMessage("Set_Nom_model", this.Nom_model + "@" + val);
        break;
    }
  }

  /**
 * Duplique un modèle de personnage
 * @returns {Model} - Modèle dupliqué
 */
  dupliquer() {
    if (this.Is_joueur) return null; // Impossible de dupliquer un modèle de joueur ???

    const m = new Model(this);

    // const champs = Object.keys(this).filter(key => typeof this[key] != "function");
    // for (let i = 0; i < champs.length; i++) {
    //   p[champs[i]] = this[champs[i]];
    // }

    // Set Nom_model
    let i = 1;
    while (Models.find(x => x.Nom_model === this.Nom_model +
      " (" + String(i).padStart(2, '0') + ")")) i++;
    m.Nom_model = this.Nom_model + " (" + String(i).padStart(2, '0') + ")";

    Models[Models.length] = m;

    return m;
  }
}

// Tableau global contenant tous les modèles de personnages
let Models = [];

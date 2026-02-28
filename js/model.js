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
    this.Is_joueur = data.Is_joueur || false;
    this.Capacites = data.Capacites || "";
    this.Race = data.Race || "";
    this.Magie_type = data.Magie_type || "";
    this.Fatigue = data.Fatigue || null;
    this.Concentration = data.Concentration || 0;
    this.Liste_pretre = data.Liste_pretre || null;

    // Statistiques
    this.Puissance_mentale = data.Puissance_mentale || 0;
    this.Puissance_physique = data.Puissance_physique || 0;

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

    // Modificateurs des statistiques d'experience
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

    // Capacités de combat
    this.Ambidextre = data.Ambidextre || false;

    // Protection par zone
    this.Armure_tete = data.Armure_tete || 0;
    this.Armure_poitrine = data.Armure_poitrine || 0;
    this.Armure_abdomen = data.Armure_abdomen || 0;
    this.Armure_brasg = data.Armure_brasg || 0;
    this.Armure_brasd = data.Armure_brasd || 0;
    this.Armure_jambeg = data.Armure_jambeg || 0;
    this.Armure_jambed = data.Armure_jambed || 0;

    // Points de vie par zone
    this.Pdv = data.Pdv || 0;
    this.Tete = data.Tete || 0;
    this.Poitrine = data.Poitrine || 0;
    this.Abdomen = data.Abdomen || 0;
    this.Brasg = data.Brasg || 0;
    this.Brasd = data.Brasd || 0;
    this.Jambeg = data.Jambeg || 0;
    this.Jambed = data.Jambed || 0;

    if (this.Fatigue === null || this.Fatigue < 1)
      this.Fatigue = 2 * this.Constitution + 4;

    if (this.Pdv === null || this.Pdv< 1) {
      this.Pdv = this.Constitution + 5;
      this.Tete = Math.round(this.Pdv / 5);
      this.Poitrine = Math.round(this.Pdv / 3);
      this.Abdomen = Math.round(this.Pdv / 3);
      this.Brasg = Math.round(this.Pdv / 4);
      this.Brasd = Math.round(this.Pdv / 4);
      this.Jambeg = Math.round(this.Pdv * 0.4);
      this.Jambed = Math.round(this.Pdv * 0.4);
    }
  }
}
// Tableau global contenant tous les modèles de personnages
let Models = [];

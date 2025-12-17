/**
 * FICHIER MODEL.JS
 * =================
 * Classe pour créer des objets modèle de personnage
 */

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
    this.Etat = data.Etat || "";
    this.Race = data.Race || "";
    this.Magie_type = data.Magie_type || "";

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

    // staistiques modales details du model
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

    // États
    this.Fatigue = data.Fatigue || null;
    this.Concentration = data.Concentration || 0;
    this.Liste_pretre = data.Liste_pretre || null;

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
  }
}
// Tableau global contenant tous les modèles de personnages
let Models = [];

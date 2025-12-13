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

        // Statistiques
        this.Pm = data.Pm || null;
        this.Pp = data.Pp || null;

        this.Force = data.Force || null;
        this.Constitution = data.Constitution || null;
        this.Vp = data.Vp || null;
        this.Perception = data.Perception || null;

        this.Vm = data.Vm || null;
        this.Volonte = data.Volonte || null;
        this.Abstraction = data.Abstraction || null;
        this.Charisme = data.Charisme || null;

        this.Adaptation = data.Adaptation || null;
        this.Combat = data.Combat || null;
        this.Foi = data.Foi || null;
        this.Magie = data.Magie || null;
        this.Memoire = data.Memoire || null;
        this.Telepathie = data.Telepathie || null;

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

        if (this.Fatigue === null || this.Fatigue < 1) this.Fatigue = 2 * this.Constitution + 4;
    }
}

// Tableau global contenant tous les modèles de personnages
let Models = [];

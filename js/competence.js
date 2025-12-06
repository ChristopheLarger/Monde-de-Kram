/**
 * FICHIER COMPETENCE.JS
 * =================
 * Classe pour créer des objets compétence
 */

/**
 * Classe représentant une compétence
 */
class Competence {
    /**
     * Crée une nouvelle instance de compétence avec des valeurs par défaut
     * @param {Object} data - Données de la compétence (optionnel)
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom_competence = data.Nom_competence || null;
        this.Competence_majeure = data.Competence_majeure || null;
        this.Is_personnel = data.Is_personnel || false;
        this.Attribut = data.Attribut || null;
        this.Base = data.Base || 0;
    }
}

// Tableau global contenant toutes les compétences
let Competences = [];

/**
 * Classe représentant une compétence connue
 */
class CompetenceConnue {
    /**
     * Crée une nouvelle instance de compétence connue avec des valeurs par défaut
     * @param {Object} data - Données de la compétence connue (optionnel)
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom_competence = data.Nom_competence || null;
        this.Nom_model = data.Nom_model || null;
        this.Degres = data.Degres || 0;
    }
}

// Tableau global contenant toutes les compétences connues
let CompetencesConnues = [];

/**
* Classe représentant un bonus de sort
 */
class Bonus {
    /**
     * Crée une nouvelle instance de bonus avec des valeurs par défaut
     * @param {Object} data - Données du bonus (optionnel)
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom_bonus = data.Nom_bonus || null;
        this.Nature = data.Nature || null;
        this.Ordre = data.Ordre || 0;
   }
}

// Tableau global contenant tous les bonus
let ListeBonus = [];

/**
 * Classe représentant un bonus de sort
 */
class Bonus_sort {
    /**
     * Crée une nouvelle instance de bonus de sort avec des valeurs par défaut
     * @param {Object} data - Données du bonus de sort (optionnel)
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom_bonus = data.Nom_bonus || null;
        this.Nom_liste = data.Nom_liste || null;
        this.Nom_sort = data.Nom_sort || null;
        this.Valeur = data.Valeur || 0;
    }
}

// Tableau global contenant tous les bonus de sort
let Bonus_sorts = [];
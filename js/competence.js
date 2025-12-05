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

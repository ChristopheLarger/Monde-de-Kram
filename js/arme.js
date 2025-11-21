/**
 * FICHIER ARME.JS
 * ===============
 * Classe pour créer des objets arme
 */

/**
 * Classe représentant une arme
 */
class Arme {
    /**
     * Crée une nouvelle instance d'arme avec des valeurs par défaut
     * @param {Object} data - Données de l'arme (optionnel)
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom = data.Nom || "";
        this.Is_personnel = data.Is_personnel || false;
        this.Deux_mains = data.Deux_mains || false;
        this.A_projectile = data.A_projectile || false;

        // Statistiques de combat
        this.Facteur = data.Facteur || 1;
        this.Bonus = data.Bonus || 0;
        this.Plafond = data.Plafond || 0;
        this.Coeff_force = data.Coeff_force || 0;
        
        // Caractéristiques tactiques
        this.A_distance = data.A_distance || false;
        this.Portee = data.Portee || null;
        this.Init = data.Init || 0;
    }
}

// Tableau global contenant toutes les armes disponibles
let Armes = [];
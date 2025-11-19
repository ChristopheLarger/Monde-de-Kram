/**
 * FICHIER ARME.JS - VERSION SIMPLIFIÉE
 * =====================================
 * Factory function pour créer des objets arme
 * Remplace la classe complexe par une fonction simple
 */

/**
 * Crée un objet arme avec des valeurs par défaut
 * @param {Object} data - Données de l'arme (optionnel)
 * @returns {Object} Objet arme
 */
function createArme(data = {}) {
    return {
        // Propriétés de base
        Nom: data.Nom || "",
        Is_personnel: data.Is_personnel || false,
        Deux_mains: data.Deux_mains || false,
        A_projectile: data.A_projectile || false,

        // Statistiques de combat
        Facteur: data.Facteur || 1,
        Bonus: data.Bonus || 0,
        Plafond: data.Plafond || 0,
        Coeff_force: data.Coeff_force || 0,
        
        // Caractéristiques tactiques
        A_distance: data.A_distance || false,
        Portee: data.Portee || null,
        Init: data.Init || 0
    };
}

// Tableau global contenant toutes les armes disponibles
let Armes = [];
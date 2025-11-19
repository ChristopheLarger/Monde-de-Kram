/**
 * FICHIER MODEL.JS
 * =================
 * Factory function pour créer des objets modèle de personnage
 * Remplace la classe complexe par une fonction simple avec méthodes utilitaires
 */

/**
 * Crée un objet modèle de personnage avec des valeurs par défaut
 * @param {Object} data - Données du modèle (optionnel)
 * @returns {Object} Objet modèle avec méthodes utilitaires
 */
function createModel(data = {}) {
    const model = {
        // Propriétés de base
        Nom: data.Nom || "",
        Image: data.Image || null,
        Is_joueur: data.Is_joueur || false,
        Capacites: data.Capacites || "",
        Etat: data.Etat || "",
        
        // Statistiques de base
        Pm: data.Pm || null,
        Pp: data.Pp || null,
        Vp: data.Vp || null,
        Fdc: data.Fdc || null,
        
        // États temporaires
        Fatigue: data.Fatigue || 0,
        Concentration: data.Concentration || 0,
        
        // Capacités de combat
        Ambidextre: data.Ambidextre || false,
        Escrime: data.Escrime || 0,
        Coordination: data.Coordination || null,
        Force: data.Force || null,
        
        // Armes et compétences
        Arme_1: data.Arme_1 || "",
        Att_1: data.Att_1 || null,
        Par_1: data.Par_1 || null,
        Arme_2: data.Arme_2 || "",
        Att_2: data.Att_2 || null,
        Par_2: data.Par_2 || null,
        Arme_3: data.Arme_3 || "",
        Att_3: data.Att_3 || null,
        Par_3: data.Par_3 || null,
        Par_Bouclier: data.Par_Bouclier || 0,
        Esquive: data.Esquive || 0,
        
        // Protection par zone
        Armure_tete: data.Armure_tete || 0,
        Armure_poitrine: data.Armure_poitrine || 0,
        Armure_abdomen: data.Armure_abdomen || 0,
        Armure_brasg: data.Armure_brasg || 0,
        Armure_brasd: data.Armure_brasd || 0,
        Armure_jambeg: data.Armure_jambeg || 0,
        Armure_jambed: data.Armure_jambed || 0,
        
        // Points de vie par zone
        Pdv: data.Pdv || 0,
        Tete: data.Tete || 0,
        Poitrine: data.Poitrine || 0,
        Abdomen: data.Abdomen || 0,
        Brasg: data.Brasg || 0,
        Brasd: data.Brasd || 0,
        Jambeg: data.Jambeg || 0,
        Jambed: data.Jambed || 0,
        
        // Méthodes utilitaires
        malus_2nde_main() {
            if (this.Ambidextre) return 0;
            return this.Coordination === null ? 0 : Math.floor((18 - this.Coordination) / 2);
        }
    };
    
    return model;
}

// Tableau global contenant tous les modèles de personnages
let Models = [];

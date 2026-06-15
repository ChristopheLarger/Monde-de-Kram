/**
 * FICHIER COMBAT.JS
 * ==================
 * Système de combat simplifié utilisant les utilitaires
 * Remplace le code complexe par des fonctions plus lisibles
 */

/**
 * Détermine si deux pions sont en combat au corps à corps
 * @param {Object} pion1 - Premier pion
 * @param {Object} pion2 - Deuxième pion
 * @returns {boolean} true si en combat au corps à corps
 */
function isCaC(pion1, pion2) {
    /**
     * Calcule la distance entre deux hexagones
     * @param {number} col1 - Colonne du premier hexagone
     * @param {number} row1 - Ligne du premier hexagone
     * @param {number} col2 - Colonne du deuxième hexagone
     * @param {number} row2 - Ligne du deuxième hexagone
     * @returns {number} Distance entre les deux hexagones
     */
    function hexDistance(col1, row1, col2, row2) {
        const x1 = col1 * (3 / 2);
        const y1 = row1 * Math.sqrt(3) + (Math.abs(col1) % 2) * (Math.sqrt(3) / 2);
        const x2 = col2 * (3 / 2);
        const y2 = row2 * Math.sqrt(3) + (Math.abs(col2) % 2) * (Math.sqrt(3) / 2);

        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / Math.sqrt(3);

        return Math.round(100 * dist) / 100;
    }
    const distance = hexDistance(
        parseInt(pion1.Position.split(',')[0]),
        parseInt(pion1.Position.split(',')[1]),
        parseInt(pion2.Position.split(',')[0]),
        parseInt(pion2.Position.split(',')[1])
    );

    return distance <= 1.5; // Distance de corps à corps
}

/**
 * Classe Melee - Représente un combat au corps à corps
 */
class Melee {
    /**
     * Initialise un combat au corps à corps
     * @param {Object} def - Pion défenseur
     * @param {Object} att1 - Pion attaquant 1
     */
    constructor(def, att1, att2 = null, att3 = null, att4 = null, att5 = null, att6 = null) {
        this.defenseur = def;

        this.attaquant_1 = att1;
        this.attaquant_2 = att2;
        this.attaquant_3 = att3;
        this.attaquant_4 = att4;
        this.attaquant_5 = att5;
        this.attaquant_6 = att6;

        // Calcul des initiatives pour déterminer l'avantage
        const init_def = def.calculateInitiative();

        // Détermination de l'avantage des attaquants selon l'initiative et la valeur de VP
        let avantage = false;
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] === null) continue;

            const init_att = this["attaquant_" + i].calculateInitiative();

            if (init_def < init_att) {
                this["avantage_" + i] = false;
            }
            else if (init_def > init_att) {
                this["avantage_" + i] = true;
            }
            else if (this["attaquant_" + i].Vivacite_physique > this.defenseur.Vivacite_physique) {
                this["avantage_" + i] = true;
            }
            else if (this["attaquant_" + i].Vivacite_physique < this.defenseur.Vivacite_physique) {
                this["avantage_" + i] = false;
            }
            else {
                this["avantage_" + i] = (this["attaquant_" + i].Type === "allies");
            }

            if (this["avantage_" + i]) avantage = true;
        }

        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] !== null) this["avantage_" + i] = avantage;
        }
    }

    /**
     * Retourne l'avantage d'un attaquant
     * @param {number} i - Indice de l'attaquant
     * @returns {boolean} true si l'attaquant a l'avantage
     */
    get_avantage(att) {
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] === att) return this["avantage_" + i];
        }
        return null;
    }

    /**
     * Ajoute un attaquant au combat
     * @param {Object} att - Pion attaquant
     * @returns {boolean} true si l'attaquant a été ajouté
     */
    add_attaquant(att) {
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] === null) {
                this["attaquant_" + i] = att;
                return true;
            }
        }
        return false;
    }

    is_attaquant(att) {
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] === att) return true;
        }
        return false;
    }

    /**
     * Retire un attaquant du combat
     * @param {Object} att - Pion attaquant
     * @returns {boolean} true si l'attaquant a été retiré
     */
    rmv_attaquant(att) {
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] === att) {
                this["attaquant_" + i] = null;
                return true;
            }
        }
        return false;
    }

    /**
     * Retourne le nombre d'attaquants dans le combat
     * @returns {number} Nombre d'attaquants
     */
    nb_attaquants() {
        let res = 0;
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] !== null) res++;
        }
        return res;
    }

    /**
     * Définit l'avantage d'un attaquant
     * @param {Object} att - Pion attaquant
     * @param {boolean} avantage - Avantage de l'attaquant
     * @returns {boolean} true si l'avantage a été défini
     */
    set_avantage(att, avantage) {
        for (let i = 1; i <= 6; i++) {
            if (this["attaquant_" + i] === att) {
                this["avantage_" + i] = avantage;
                return true;
            }
        }
        return false;
    }
}

let Melees = [];

/**
 * Classe Attaque - Représente une attaque dans l'ordre d'initiative
 */
class Attaque {
    Pion = null;
    Timing = 0;

    /**
     * Tri des attaques par timing puis par type, modèle et indice
     */
    static tri(x, y) {
        // 1er critère : Timing
        if (x.Timing !== y.Timing) {
            return x.Timing - y.Timing;
        }

        // 2ème critère : Type (alliés vs ennemis)
        if (x.Pion.Type !== y.Pion.Type) {
            return x.Pion.Type.localeCompare(y.Pion.Type);
        }

        // 3ème critère : Indice
        return x.Pion.Indice - y.Pion.Indice;
    }
}

let Attaques = [];

/**
 * Initialise et démarre le système d'attaques
 */
function next_round() {
}
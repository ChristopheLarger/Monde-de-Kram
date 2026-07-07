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

class Attaquant {
    constructor(pion) {
        this.pion = pion;
        this.avantage = false;
        this.avantage_next_turn = false;
    }
}
/**
 * Classe Melee - Représente un combat au corps à corps (1 vs 1 ou 1 vs plusieurs)
 */
class Melee {
    /**
     * Initialise un combat au corps à corps
     * @param {Object} def - Pion défenseur
     * @param {Object} att1 - Pion attaquant 1
     * @param {Object} att2 - Pion attaquant 2
     * @param {Object} att3 - Pion attaquant 3
     * @param {Object} att4 - Pion attaquant 4
     * @param {Object} att5 - Pion attaquant 5
     * @param {Object} att6 - Pion attaquant 6
     */
    constructor(def, att1, att2 = null, att3 = null, att4 = null, att5 = null, att6 = null) {
        this.defenseur = def;
        this.attaquants = [new Attaquant(att1)];
        if (att2 !== null) this.attaquants.push(new Attaquant(att2));
        if (att3 !== null) this.attaquants.push(new Attaquant(att3));
        if (att4 !== null) this.attaquants.push(new Attaquant(att4));
        if (att5 !== null) this.attaquants.push(new Attaquant(att5));
        if (att6 !== null) this.attaquants.push(new Attaquant(att6));

        // Calcul des initiatives pour déterminer l'avantage
        const init_def = def.calculateInitiative();

        // Détermination de l'avantage des attaquants selon l'initiative et la valeur de VP
        let avantage = false;
        for (const att of this.attaquants) {
            const pion = att.pion;
            const init_att = pion.calculateInitiative();
            const vp_att = pion.get_attribut("Vivacite_physique");
            const vp_def = this.defenseur.get_attribut("Vivacite_physique");

            if (init_def < init_att) att.avantage = false;
            else if (init_def > init_att) att.avantage = true;
            else if (vp_att > vp_def) att.avantage = true;
            else if (vp_att < vp_def) att.avantage = false;
            else att.avantage = (pion.Type === "allies");

            if (att.avantage) avantage = true;
        }

        for (const att of this.attaquants) {
            att.avantage = avantage;
        }
    }

    /**
     * Passe au tour suivant (recopie les avantages futurs en actuels)
     */
    next_turn() {
        for (const a of this.attaquants) {
            a.avantage = a.avantage_next_turn;
        }
    }

    /**
     * Retourne la liste des attaquants sans avantage
     * @returns {Array} Liste des attaquants sans avantage
     */
    get_defenseurs() {
        let liste_attaquants = [];
        for (const a of this.attaquants) {
            if (!a.avantage) liste_attaquants.push(a.pion);
        }
        return liste_attaquants;
    }

    /**
     * Retourne le prochain attaquant avec avantage
     * @returns {Object|null} Prochain attaquant avec avantage
     */
    get_next_attaquant() {
        let next_attaquant = null;
        let vp_max = -99;

        for (const a of this.attaquants) {
            if (a.avantage && !a.pion.has_attaqued) {
                if (a.pion.get_attribut("Vivacite_physique") > vp_max) {
                    vp_max = a.pion.get_attribut("Vivacite_physique");
                    next_attaquant = a.pion;
                }
            }
        }
        return next_attaquant;
    }

    /**
     * Retourne l'avantage d'un attaquant
     * @param {Object} att - Pion attaquant
     * @returns {boolean|null} true si l'attaquant a l'avantage
     */
    get_avantage(att) {
        const found = this.attaquants.find(a => a.pion === att);
        return found ? found.avantage : null;
    }

    /**
     * Ajoute un attaquant au combat
     * @param {Object} att - Pion attaquant
     * @returns {boolean} true si l'attaquant a été ajouté
     */
    add_attaquant(att) {
        if (this.attaquants.length >= 6) return false;
        if (this.attaquants.find(a => a.pion === att)) return true;

        const nouveau = new Attaquant(att);
        nouveau.avantage = true;
        for (const a of this.attaquants) {
            if (!a.avantage) nouveau.avantage = false;
        }
        this.attaquants.push(nouveau);
        return true;
    }

    /**
     * Retire un attaquant du combat
     * @param {Object} att - Pion attaquant
     * @returns {boolean} true si l'attaquant a été retiré
     */
    rmv_attaquant(att) {
        const index = this.attaquants.findIndex(a => a.pion === att);
        if (index === -1) return false;
        this.attaquants.splice(index, 1);
        return true;
    }

    /**
     * Retourne le nombre d'attaquants dans le combat
     * @returns {number} Nombre d'attaquants
     */
    nb_attaquants() {
        return this.attaquants.length;
    }

    /**
     * Retourne le nombre d'attaquants au corps-à-corps
     * @returns {number} Nombre d'attaquants au corps-à-corps
     */
    nb_attaquants_CaC() {
        return this.attaquants.filter(a => isCaC(a.pion, this.defenseur)).length;
    }

    /**
     * Définit l'avantage du tour suivant pour un attaquant
     * @param {Object} att - Pion attaquant
     * @param {boolean} avantage - Avantage du tour suivant
     * @returns {boolean} true si l'avantage a été défini
     */
    set_avantage_next_turn(att, avantage) {
        const found = this.attaquants.find(a => a.pion === att);
        if (!found) return false;
        found.avantage_next_turn = avantage;
        return true;
    }
}

let Melees = [];

function add_combat(att, def) {
    const cac = isCaC(att, def);
    if (!cac) {
        console.log("Le pion " + att.Titre + " attaque le pion " + def.Titre + " à distance");
        return true; // L'attaquant attaque le défenseur à distance
    }

    const melee_0 = Melees.find(m => m.defenseur === att);
    if (melee_0) {
        console.log("Le pion " + att.Titre + " est déjà dans un combat (defenseur)");
        return false; // L'attaquant est déjà dans un combat
    }

    const melee_1 = Melees.find(m => m.attaquants.some(a => a.pion === att));
    if (melee_1) {
        console.log("Le pion " + att.Titre + " est déjà dans un combat (attaquant)");
        return false; // L'attaquant est déjà dans un combat
    }

    const melee_2 = Melees.find(m => m.defenseur === def);
    if (melee_2) {
        const ok = melee_2.add_attaquant(att); // L'attaquant s'ajoute à la liste des attaquants du défenseur
        if (!ok) {
            console.log("Le pion " + def.Titre + " est déjà attaqué par 6 personnages");
            return false;
        }
        return true;
    }

    const melee_3 = Melees.find(m => m.attaquants.some(a => a.pion === def));
    if (melee_3 && melee_3.nb_attaquants() === 1) {
        // 1 vs 1
        // On intervertit les rôles du defenseur et de l'attaquant et on ajoute l'attaquant au combat
        Melees.push(new Melee(melee_3.attaquants[0].pion, melee_3.defenseur, att));
        Melees.splice(Melees.indexOf(melee_3), 1);
        return true;
    }
    else if (melee_3) {
        // 1 vs plusieurs
        // Le defenseur fait partie des attaquants d'un autre combat : on le retire de ce combat et on créé un nouveau combat
        melee_3.rmv_attaquant(def);
        Melees.push(new Melee(def, att));
        return true;
    }

    // L'attaquant et le défenseur ne font partie d'aucun combat : on créé un nouveau combat
    Melees.push(new Melee(def, att));
    return true;
}

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
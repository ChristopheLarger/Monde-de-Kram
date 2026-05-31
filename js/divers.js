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
        this.Nom_model = data.Nom_model || null;
        this.Nom = data.Nom || null;
        this.Degres = data.Degres || 0;
    }

    /**
     * Traite un message reçu via WebSocket pour modifier une compétence
     * @param {string} tag - Tag du message
     * @param {string} val - Valeur du message
    */
    sendMessage(tag, val = null) {
        switch (tag.toLowerCase()) {
            case "set_degres":
                sendMessage(`Set_Degres`, `${this.Nom_model}@${this.Nom}@${val}`);
                break;
        }
    }

    /**
    * Calcul l'ajustement d'un attribut
    * @param {string} attribut - Attribut à ajuster
    * @returns {number} - Ajustement de l'attribut
    */
    #get_ajustement(attribut) {
        const model = Models.find(m => m.Nom_model === this.Nom_model);
        switch (attribut) {
            case "Co":
                return parametres_couts[model.get("coordination")].ajustement;
            case "Co+VM":
                return parametres_couts[Math.round((model.get("coordination") + model.get("vivacite_mentale")) / 2)].ajustement;
            case "Co+VP":
                return parametres_couts[Math.round((model.get("coordination") + model.get("vivacite_physique")) / 2)].ajustement;
            case "Co+P":
                return parametres_couts[Math.round((model.get("coordination") + model.get("perception")) / 2)].ajustement;
            case "Co+F":
                return parametres_couts[Math.round((model.get("coordination") + model.get("force")) / 2)].ajustement;
            case "NP":
                return parametres_couts[model.get("niveau_physique")].ajustement;
            case "Ab":
                return parametres_couts[model.get("abstraction")].ajustement;
            case "V":
                return parametres_couts[model.get("volonte")].ajustement;
            case "VP":
                return parametres_couts[model.get("vivacite_physique")].ajustement;
            case "P+VM":
                return parametres_couts[Math.round((model.get("perception") + model.get("vivacite_mentale")) / 2)].ajustement;
            case "Ch":
                return parametres_couts[model.get("charisme")].ajustement;
            case "Co+V":
                return parametres_couts[Math.round((model.get("coordination") + model.get("volonte")) / 2)].ajustement;
            case "Co+Ch":
                return parametres_couts[Math.round((model.get("coordination") + model.get("charisme")) / 2)].ajustement;
            default:
                return 0;
        }
    }
    /**
     * Calcul le score d'une compétence
     * @returns {number} - Score de la compétence
     */
    get_score() {
        const classe = this.Nom.normalize('NFD').replace(/\p{Diacritic}/gu, '').replaceAll(" ", "_").replaceAll("'", "_").toLowerCase();
        let classe_maitre = null;
        let tr = null;

        document.querySelectorAll("#div_model_5 tr").forEach((element) => {
            if (element.classList.item(0) !== classe) return;
            tr = element;
            if (element.classList.item(1) !== "competences_mineures" && element.classList.item(1) !== null) classe_maitre = element.classList.item(1);
        });

        let base = tr.querySelector(".base").value;
        let attribut = this.#get_ajustement(tr.querySelector(".attribut").value);
        if (base === "" || base === "-") base = 0;
        if (attribut === "") attribut = 0;

        let score = parseInt(base) + parseInt(this.Degres) + parseInt(attribut);

        if (classe_maitre === null) return score;

        let tr_maitre = Array.from(document.querySelectorAll("#div_model_5 tr")).find(element => element.classList.item(0) === classe_maitre);
        const Nom_competence_maitre = tr_maitre.querySelectorAll("td")[0].textContent.split(" :")[0];
        const cmp_maitre = Competences.find(comp => comp.Nom_model === this.Nom_model && comp.Nom === Nom_competence_maitre);
        if (cmp_maitre === null || typeof cmp_maitre === "undefined") return score;

        let base_maitre = tr_maitre.querySelector(".base").value;
        let attribut_maitre = this.#get_ajustement(tr_maitre.querySelector(".attribut").value);

        if (base_maitre === "" || base_maitre === "-") base_maitre = 0;
        if (attribut_maitre === "") attribut_maitre = 0;

        score += parseInt(base_maitre) + parseInt(cmp_maitre.Degres) + parseInt(attribut_maitre);

        return score;
    }
}

// Tableau global contenant toutes les compétences
let Competences = [];

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
        this.Succes = data.Succes || false;
        this.Valeur = data.Valeur || null;
    }
}

// Tableau global contenant tous les bonus de sort
let Bonus_sorts = [];

/**
 * Classe représentant un avantage
 */
class Avantage {
    /**
     * Crée une nouvelle instance de avantage avec des valeurs par défaut
     * @param {Object} data - Données du avantage (optionnel)
     * @param {string} Nom_model - Nom du modèle
     * @param {string} Nom - Nom de l'avantage
     * @param {boolean} Selection_creation - Selection de l'avantage pour la création
     * @param {boolean} Selection_experience - Selection de l'avantage pour l'expérience
     * @param {number} Niveau - Niveau de l'avantage
     * @param {string} Parametre - Option de l'avantage
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom_model = data.Nom_model || null;
        this.Nom = data.Nom || null;
        this.Selection_creation = data.Selection_creation || false;
        this.Selection_experience = data.Selection_experience || false;
        this.Niveau = data.Niveau || 1;
        this.Parametre = data.Parametre || null;
    }

    sendMessage(tag) {
        switch (tag.toLowerCase()) {
            case "set_avantage":
                sendMessage(`Set_Avantage`,
                    `${this.Nom_model}@${this.Nom}@${this.Selection_creation ? 1 : 0}@${this.Selection_experience ? 1 : 0}@${this.Niveau}@${this.Parametre || ""}`);
                break;
        }
    }
}

// Tableau global contenant tous les avantages
let Avantages = [];

/**
 * Classe représentant un désavantage
 */
class Desavantage {
    /**
     * Crée une nouvelle instance de désavantage avec des valeurs par défaut
     * @param {Object} data - Données du désavantage (optionnel)
     * @param {string} Nom_model - Nom du modèle
     * @param {string} Nom - Nom du désavantage
     * @param {boolean} Selection - Selection du désavantage
     * @param {number} Niveau - Niveau du désavantage
     */
    constructor(data = {}) {
        // Propriétés de base
        this.Nom_model = data.Nom_model || null;
        this.Nom = data.Nom || null;
        this.Selection = data.Selection || false;
        this.Niveau = data.Niveau || 0;
    }

    sendMessage(tag) {
        switch (tag.toLowerCase()) {
            case "set_desavantage":
                sendMessage(`Set_Desavantage`, `${this.Nom_model}@${this.Nom}@${this.Selection ? 1 : 0}@${this.Niveau}`);
                break;
        }
    }
}

// Tableau global contenant tous les désavantages
let Desavantages = [];
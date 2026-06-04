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

    get_cout() {
        let res = null;
        document.querySelectorAll("#div_model_5 tr").forEach((tr) => {
            if (tr.querySelectorAll("td")[0] === null || tr.querySelectorAll("td")[0] === undefined) return;
            if (tr.querySelectorAll("td")[0].textContent.split(" :")[0] !== this.Nom) return;

            let don = tr.querySelector(".don").value;
            if (tr.classList.item(1) !== null && tr.classList.item(1) !== undefined && tr.classList.item(1) !== "competences_mineures") {
                const tr_maitre = Array.from(document.querySelectorAll("#div_model_5 tr")).find(element => element.classList.item(0) === tr.classList.item(1));
                don = tr_maitre.querySelector(".don").value;
            }

            let coeff = null;
            switch (don) {
                case "Cmb":
                    coeff = parametres_couts[m_model.Combat]; break;
                case "Mag":
                    coeff = parametres_couts[m_model.Magie]; break;
                case "Foi":
                    coeff = parametres_couts[m_model.Foi]; break;
                case "Adp":
                    coeff = parametres_couts[m_model.Adaptation]; break;
                case "Thp":
                    coeff = parametres_couts[m_model.Telepathie]; break;
                case "Mem":
                    coeff = parametres_couts[m_model.Memoire]; break;
                case "Adp+Mem":
                    coeff = parametres_couts[Math.round((m_model.Adaptation + m_model.Memoire) / 2)]; break;
                case "Adp+Thp":
                    coeff = parametres_couts[Math.round((m_model.Adaptation + m_model.Telepathie) / 2)]; break;
                default:
                    return;
            }

            if (this.Nom.includes("Jouer Instrument ")) {
                const av = Avantages.filter(avantage => avantage.Nom_model === this.Nom_model && avantage.Nom.includes("Don pour la musique ") && avantage.Selection);
                av.forEach(avantage => {
                    if (avantage.Parametre === "--") coeff = parametres_couts["20"];
                });
            }

            if (this.Nom.includes("Parler ")) {
                const av = Avantages.filter(avantage => avantage.Nom_model === this.Nom_model && avantage.Nom.includes("Don pour les langues ") && avantage.Selection);
                av.forEach(avantage => {
                    if (avantage.Parametre === "--") coeff = parametres_couts["20"];
                });
            }

            if (tr.classList.item(1) === null || tr.classList.item(1) === undefined) {
                res = parseInt(this.Degres) * (parseInt(this.Degres) + 1) / 2 * coeff.degres_gen;
            }
            else {
                res = parseInt(this.Degres) * (parseInt(this.Degres) + 1) / 2 * coeff.degres_spe;
            }

            if (this.Nom.includes("Jouer Instrument ")) {
                const av = Avantages.filter(avantage => avantage.Nom_model === this.Nom_model && avantage.Nom.includes("Don pour la musique ") && avantage.Selection);
                let bonus = 0;
                 av.forEach(avantage => {
                    if ((this.Nom.includes("1") && avantage.Parametre.includes("1")) ||
                        (this.Nom.includes("2") && avantage.Parametre.includes("2")) ||
                        (this.Nom.includes("3") && avantage.Parametre.includes("3"))
                    ) bonus = 6 * (6 + 1) / 2 * coeff.degres_spe;
                });
                res -= bonus;
            }

            if (this.Nom.includes("Parler ")) {
                const av = Avantages.filter(avantage => avantage.Nom_model === this.Nom_model && avantage.Nom.includes("Don pour les langues ") && avantage.Selection);
                let bonus = 0;
                 av.forEach(avantage => {
                    if (this.Nom.toLowerCase().includes(avantage.Parametre)) bonus = 6 * (6 + 1) / 2 * coeff.degres_spe;
                });
                res -= bonus;
            }
        });
        if (this.Nom === "Feinte de corps") return 2 * res;

        return res;
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
        this.Selection = data.Selection || false;
        this.Parametre = data.Parametre || null;
        this.Type = data.Type || null;
        this.Niveau_creation = data.Niveau_creation || null;
        this.Niveau_experience = data.Niveau_experience || null;
    }

    sendMessage(tag) {
        switch (tag.toLowerCase()) {
            case "set_avantage":
                sendMessage(`Set_Avantage`,
                    `${this.Nom_model}@${this.Nom}@${this.Selection ? 1 : 0}@${this.Parametre || ""}@` +
                    `${this.Type || ""}@${this.Niveau_creation || ""}@${this.Niveau_experience || ""}`);
                break;
        }
    }

    get_cout(type) {
        let niveau = this.Niveau_experience;
        if (type === "Création") niveau = this.Niveau_creation;

        if (niveau === "-") {
            return 0;
        }
        else if (this.Nom === "Race non humaine" && type === this.Type) {
            if (this.Parametre.includes("_evolue")) return 12;
            return 8;
        }
        else if (this.Nom === "Sort naturel" && type === this.Type) {
            const nom_liste = shortName[this.Parametre.split(" - ")[0]];
            const nom_sort = this.Parametre.split(" - ")[1];
            const sort = Sorts.find(sort => sort.Nom_liste === nom_liste && sort.Nom_sort === nom_sort);
            return 2 * parseInt(sort.Niveau);
        }
        else if (niveau !== null && niveau !== undefined) {
            const base_cout = (niveau === "-" ? 0 : parseInt(niveau));
            switch (this.Nom) {
                case "Maitre de magie":
                case "Guide spirituel":
                    if (type === "Expérience" && this.Niveau_creation !== "-") return 3 * base_cout;
                    return 10 + 3 * base_cout;
                case "Maitre d'armes":
                    return 6 * base_cout;
                case "Maitre de competence majeure 1":
                case "Maitre de competence majeure 2":
                case "Maitre de competence majeure 3":
                    return 3 * base_cout;
                case "Résistance à la magie":
                    return 5 * base_cout;
                case "Richesse":
                    return 2 * base_cout + 2;
                default:
                    return base_cout;
            }
        }
        else { // if (type === this.Type) {
            let res = null;
            document.querySelectorAll("#div_model_4 tr").forEach((tr) => {
                if (tr.querySelectorAll("td")[1] === null || tr.querySelectorAll("td")[1] === undefined) return;
                if (tr.querySelectorAll("td")[1].textContent.split(" :")[0] === this.Nom) {
                    res = parseInt(tr.querySelector(".cout").value);
                }
            });
            return res;
        }

        return null;
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
        this.Niveau = data.Niveau || null;
    }

    sendMessage(tag) {
        switch (tag.toLowerCase()) {
            case "set_desavantage":
                sendMessage(`Set_Desavantage`, `${this.Nom_model}@${this.Nom}@${this.Selection ? 1 : 0}@${this.Niveau}`);
                break;
        }
    }

    get_cout() {
        switch (this.Nom) {
            case "Jeunesse":
            case "Vieillesse":
                return 2 * this.Niveau;
            case "Laideur":
                return 4 * this.Niveau;
            case "Vulnérabilité à la magie":
                return 6 * this.Niveau;
            case "Pacifisme":
                return 10 * this.Niveau;
        }

        if (this.Niveau !== null && this.Niveau !== undefined) return this.Niveau;

        let res = null;
        document.querySelectorAll("#div_model_6 tr").forEach((tr) => {
            if (tr.querySelectorAll("td")[2] === null || tr.querySelectorAll("td")[2] === undefined) return;
            if (tr.querySelectorAll("td")[2].textContent.split(" :")[0] === this.Nom) {
                res = parseInt(tr.querySelector(".rev").value);
            }
        });
        return res;
    }
}

// Tableau global contenant tous les désavantages
let Desavantages = [];
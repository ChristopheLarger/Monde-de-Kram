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

    /**
     * Calcule le malus pour l'utilisation de la deuxième main
     * @returns {number} Le malus à appliquer
     */
    malus_2nde_main() {
        if (this.Ambidextre) return 0;
        return Math.floor((18 - this.coordination()) / 2);
    }

    coordination() {
        return Math.round((this.Vp + this.Perception + this.Vm) / 3);
    }

    sixieme_sens() {
        return Math.round((this.Perception + this.Adaptation) / 2);
    }

    niveau_mental() {
        return Math.round((this.Force + this.Constitution + this.Vp + this.Perception) / 4);
    }

    niveau_physique() {
        return Math.round((this.Vm + this.Volonte + this.Abstraction + this.Charisme) / 4);
    }

    #get_competence_sub(competence) {
        const comp = Competences.find(comp => comp.Nom_competence === competence);
        if (!comp) return null;

        // Calcul de l'attribut
        let attribut = comp.Attribut;
        switch (attribut) {
            case "Ab":
                attribut = this.Abstraction;
                break;
            case "Ch":
                attribut = this.Charisme;
                break;
            case "Co":
                attribut = this.coordination();
                break;
            case "Co+Ch":
                attribut = (this.coordination() + this.Charisme) / 2;
                break;
            case "Co+F":
                attribut = (this.coordination() + this.Force) / 2;
                break;
            case "Co+P":
                attribut = (this.coordination() + this.Perception) / 2;
                break;
            case "Co+V":
                attribut = (this.coordination() + this.Volonte) / 2;
                break;
            case "Co+VM":
                attribut = (this.coordination() + this.Vm) / 2;
                break;
            case "Co+VP":
                attribut = (this.coordination() + this.Vp) / 2;
                break;
            case "NP":
                attribut = this.niveau_physique();
                break;
            case "P+VM":
                attribut = (this.Perception + this.Vm) / 2;
                break;
            case "V":
                attribut = this.Volonte;
                break;
            case "VP":
                attribut = this.Vp;
                break;
            default:
                attribut = 10; // Attribut par défaut
                break;
        }
        attribut = Math.round((attribut - 10) / 2);

        // Calcul des degrés
        const comp_connue = CompetencesConnues.find(comp =>
            comp.Nom_model === this.Nom_model &&
            comp.Nom_competence === competence);

        if (comp_connue) return comp.Base + attribut + comp_connue.Degres;

        return null;
    }

    get_competence(competence) {
        const degres = this.#get_competence_sub(competence);
        if (degres === null) return null;

        const comp_majeure = Competences.find(comp => comp.Nom_competence === competence).Competence_majeure;
        if (comp_majeure === null) return degres;

        const degres_majeurs = this.#get_competence_sub(comp_majeure);
        if (degres_majeurs === null) return null;

        return degres + degres_majeurs;
    }
}

// Tableau global contenant tous les modèles de personnages
let Models = [];

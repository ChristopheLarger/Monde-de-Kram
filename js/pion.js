/**
 * Classe Pion - Hérite de Map pour représenter un personnage sur la carte
 * Contient toutes les propriétés d'un personnage jouable
 */
class Pion extends Map {
    // === PROPRIÉTÉS DE BASE ===
    Indice = 0;              // Indice de l'occurrence de ce modèle de personnage

    // === ÉTATS DE COMBAT ===
    Attaquant = false;        // Le pion est attaquant
    Defenseur = false;        // Le pion est défenseur
    Nb_action = 0;           // Nombre d'actions dans le tour (malus à l'esquive)
    Arme1_engagee = false;   // L'arme principale a déjà servi au combat ce tour
    Arme2_engagee = false;   // L'arme secondaire a déjà servi au combat ce tour
    Esquive = false;         // Une première esquive a été faite
    Est_blesse = false;      // A été blessé dans le tour
    Vue = 12;                // Portée de vue

    // === PROPRIÉTÉS DE PERSONNAGE ===
    Titre = "";              // Titre affiché du personnage
    Arme1 = "";              // Arme principale
    Arme2 = "";              // Arme secondaire
    Note = "";               // Note personnalisée

    Nom_liste = "";          // Liste du sortilège sélectionnée
    Nom_sort = "";           // Sortilège sélectionné (dans la liste)
    Incantation = 0;         // Temps restant d'incantation du sortilège
    Fatigue_sort = 0;        // Nombre de points de fatigue lié au sortilège
    Concentration_sort = 0;  // Nombre de points de concentration lié au sortilège

    Cible_sort = false;      // Booléen indiquant si le pion est cible d'un sortilège

    // === CAPACITÉS SPÉCIALES ===
    Auto = false;            // Mode automatique (booléen)

    // === ÉTATS DE COMBAT ===
    is_flying = false;       // Booléen indiquant si le pion est en vol

    // === POINTS DE VIE & Co ===
    Fatigue = 0;             // Niveau de fatigue
    Fatigue_down = 0;        // Nombre de points de fatigue perdus durant le round
    Fatigue_eco = false;     // Booléen indiquant si la fatigue est économisée au corps à corps
    Concentration = 0;       // Niveau de concentration
    General = 0;                 // Points de vie totaux
    Tete = 0;                // Points de vie à la tête
    Poitrine = 0;            // Points de vie à la poitrine
    Abdomen = 0;             // Points de vie à l'abdomen
    Brasg = 0;               // Points de vie au bras gauche
    Brasd = 0;               // Points de vie au bras droit
    Jambeg = 0;              // Points de vie à la jambe gauche
    Jambed = 0;              // Points de vie à la jambe droite

    // === ARMURES ===
    Armure_tete = 0;         // Protection de la tête
    Armure_poitrine = 0;     // Protection de la poitrine
    Armure_abdomen = 0;      // Protection de l'abdomen
    Armure_brasg = 0;        // Protection du bras gauche
    Armure_brasd = 0;        // Protection du bras droit
    Armure_jambeg = 0;       // Protection de la jambe gauche
    Armure_jambed = 0;       // Protection de la jambe droite

    // === VARIABLES D'ATTAQUE ===
    jet_att = 0;             // Jet de dés de l'attaque
    loc_att = "";            // Localisation de l'attaque
    at1_att = true;          // Booléen d'attaque de la 1ère main
    at2_att = true;          // Booléen d'attaque de la 2nde main

    // === VARIABLES DE DÉFENSE ===
    jet_def = 0;             // Jet de dés de la défense
    pr1_def = false;         // Booléen de parade de la 1ère main
    pr2_def = false;         // Booléen de parade de la 2nde main
    esq_def = false;         // Booléen d'esquive

    /**
     * Constructeur d'un pion
     * @param {string} type - Type de pion ("allies" ou "ennemis")
     * @param {string} model - Nom du modèle de personnage
     * @param {number} indice - Indice du pion (optionnel, -1 pour auto-assignation)
     */
    constructor(type, model, indice = -1) {
        let p = null;
        if (indice != -1) p = Pions.find(x => x.Type === type && x.Model === model && x.Indice === indice);
        if (p != null && typeof p != "undefined") return p;

        super();
        this.Type = type;
        this.Model = model;

        const m = Models.find(x => x.Nom_model === this.Model);

        if (indice != -1) this.Indice = indice;
        else if (m.Is_joueur) this.Indice = 0;
        else {
            let i = 1;
            while (Pions.find(x => x.Model === model && x.Indice === i)) i++;
            this.Indice = i;
        }

        let s = Pions.find(x => x.Selected);
        if (s != null && typeof s != "undefined") {
            this.Position = this.#findClosestHexFree(s.Position);
        }
        else {
            this.Position = this.#findClosestHexFree("0,0");
        }

        this.Titre = this.Model + (this.Indice === 0 ? "" : (" " + this.Indice.toString().padStart(2, "0")));

        this.Fatigue = m.Fatigue;
        this.Concentration = m.Concentration;
        this.General = 0;
        this.Tete = 0;
        this.Poitrine = 0;
        this.Abdomen = 0;
        this.Brasg = 0;
        this.Brasd = 0;
        this.Jambeg = 0;
        this.Jambed = 0;
        this.Armure_tete = m.Armure_tete;
        this.Armure_poitrine = m.Armure_poitrine;
        this.Armure_abdomen = m.Armure_abdomen;
        this.Armure_brasg = m.Armure_brasg;
        this.Armure_brasd = m.Armure_brasd;
        this.Armure_jambeg = m.Armure_jambeg;
        this.Armure_jambed = m.Armure_jambed;

        if (this.Indice !== 0) this.Auto = true;

        this.setArmes();
    }

    /**
     * Calcul la valeur d'un attribut
     * @param {string} attribut - Nom de l'attribut
     * @returns {number} - Valeur de l'attribut
     */
    getValue(attribut) {
        const model = Models.find(m => m.Nom_model === this.Model);
        let bonus = model[attribut];
        if (bonus !== null && typeof bonus !== "undefined") bonus += this.get_bonus(attribut);
        return bonus;
    }

    get_bonus(attribut) {
        let bonus = 0;
        Attaques.filter(a =>
            a.Model === this.Model &&
            a.Indice === this.Indice &&
            a.Competence === attribut &&
            a.Timing > Nb_rounds * 5
        ).forEach(a => {
            bonus += a.Bonus;
        });
        return bonus;
    }

    /**
     * Calcul le malus de la 2nde main
     * @returns {number} - Malus de la 2nde main
     */
    // malus_2nde_main() {
    //     const model = Models.find(m => m.Nom_model === this.Model);
    //     if (model.Ambidextre) return 0;
    //     return Math.floor((18 - this.coordination()) / 2);
    // }

    /**
     * Calcul la coordination
     * @returns {number} - Coordination
     */
    coordination() {
        return Math.round((this.getValue("Vivacite_physique") + this.getValue("Perception") + this.getValue("Vivacite_mentale")) / 3);
    }

    /**
     * Calcul le sixième sens
     * @returns {number} - Sixième sens
     */
    sixieme_sens() {
        return Math.round((this.getValue("Perception") + this.getValue("Adaptation")) / 2);
    }

    /**
     * Calcul le niveau mental
     * @returns {number} - Niveau mental
     */
    niveau_mental() {
        return Math.round((this.getValue("Force") + this.getValue("Constitution") + this.getValue("Vivacite_physique") + this.getValue("Perception")) / 4);
    }

    /**
     * Calcul le niveau physique
     * @returns {number} - Niveau physique
     */
    niveau_physique() {
        return Math.round((this.getValue("Vivacite_mentale") + this.getValue("Volonte") + this.getValue("Abstraction") + this.getValue("Charisme")) / 4);
    }

    /**
     * Calcul le score d'une compétence
     * @param {string} competence - Nom de la compétence
     * @returns {number} - Score de la compétence
     */
    #get_score_sub(competence) {
        const model = Models.find(m => m.Nom_model === this.Model);
        const comp = Competences.find(comp => comp.Nom_model === this.Model && comp.Nom === competence);

        if (comp === null || typeof comp === "undefined") return null;
        
        // Calcul de l'attribut
        let attribut = 0;
        if (!model.Is_monster) {
            attribut = comp.Attribut;
            switch (attribut) {
                case "Ab":
                    attribut = this.getValue("Abstraction");
                    break;
                case "Ch":
                    attribut = this.getValue("Charisme");
                    break;
                case "Co":
                    attribut = this.coordination();
                    break;
                case "Co+Ch":
                    attribut = (this.coordination() + this.getValue("Charisme")) / 2;
                    break;
                case "Co+F":
                    attribut = (this.coordination() + this.getValue("Force")) / 2;
                    break;
                case "Co+P":
                    attribut = (this.coordination() + this.getValue("Perception")) / 2;
                    break;
                case "Co+V":
                    attribut = (this.coordination() + this.getValue("Volonte")) / 2;
                    break;
                case "Co+VM":
                    attribut = (this.coordination() + this.getValue("Vivacite_mentale")) / 2;
                    break;
                case "Co+VP":
                    attribut = (this.coordination() + this.getValue("Vivacite_physique")) / 2;
                    break;
                case "NP":
                    attribut = this.niveau_physique();
                    break;
                case "P+VM":
                    attribut = (this.getValue("Perception") + this.getValue("Vivacite_mentale")) / 2;
                    break;
                case "V":
                    attribut = this.getValue("Volonte");
                    break;
                case "VP":
                    attribut = this.getValue("Vivacite_physique");
                    break;
                default:
                    attribut = 10; // Attribut par défaut
                    break;
            }
            attribut = Math.round((attribut - 10) / 2);
        }

        return comp.Base + attribut;
    }

    /**
     * Calcul la compétence
     * @param {string} competence - Nom de la compétence
     * @returns {number} - Compétence
     */
    get_score(competence) {
        const model = Models.find(m => m.Nom_model === this.Model);
        let ratio = 1;

        if (model.Is_monster) {
            switch (competence) {
                case "Esquive":
                    return model.Esquive;
                case "Feinte_de_corps":
                    return model.Feinte_de_corps;
                case "Attaque_1":
                    return model.Attaque_1;
                case "Parade_1":
                    return model.Bool_parade_1 ? model.Parade_1 : null;
                case "Attaque_2":
                    return model.Bool_attaque_2 ? model.Attaque_2 : null;
                case "Parade_2":
                    return (model.Bool_attaque_2 && model.Bool_parade_2) ? model.Parade_2 : null;
            }
        }
        else {
            switch (competence) {
                case "Attaque_1":
                    competence = Armes.find(a => a.Nom_arme === this.Arme1).Competence;
                    break;
                case "Parade_1":
                    competence = Armes.find(a => a.Nom_arme === this.Arme1).Competence;
                    ratio = Armes.find(a => a.Nom_arme === this.Arme1).Facteur_parade;
                    break;
                case "Attaque_2":
                    competence = Armes.find(a => a.Nom_arme === this.Arme2).Competence;
                    break;
                case "Parade_2":
                    competence = Armes.find(a => a.Nom_arme === this.Arme2).Competence;
                    ratio = Armes.find(a => a.Nom_arme === this.Arme2).Facteur_parade;
                    break;
            }
        }

        if (competence === null || typeof competence === "undefined") return null;

        // Calcul du score de la compétence
        const score = this.#get_score_sub(competence);
        if (score === null) return null;

        // // Calcul de la compétence majeure
        // const comp_majeure = Competences.find(comp => comp.Nom_competence === competence).Competence_majeure;
        // if (comp_majeure === null) return Math.round(score * ratio);

        // // Calcul du score total
        // return Math.round((score + this.#get_score_sub(comp_majeure)) * ratio);
    }

    /**
     * Définit les armes du pion
     */
    setArmes() {
        const model = Models.find(m => m.Nom_model === this.Model);

        if (model.Is_monster) {
            // Sélection de l'arme par défaut si le personnage est un monstre
            this.Arme1 = this.Model;
            if (Armes.find(a => a.Nom_arme === this.Model).Deux_mains) this.Arme2 = "";
            else this.Arme2 = this.Model;
        }
        else {
            // Sélection des armes par défaut si le personnage n'est pas un monstre
            let comp_max = -99;
            let arme_max = "";
            Armes.forEach(arme => {
                if (arme.Nom_arme === "Bouclier") return;
                const comp = this.get_score(arme.Competence);
                if (comp !== null && comp > comp_max) {
                    comp_max = comp;
                    arme_max = arme.Nom_arme;
                }
            });
            this.Arme1 = arme_max;

            const w = Armes.find(x => x.Nom_arme === this.Arme1);
            if (w !== null && typeof w != "undefined" && w.Deux_main) this.Arme2 = "";
            else this.Arme2 = "Bouclier";
        }
    }

    /**
     * Envoie un message à la carte
     * @param {string} tag - Tag du message
     */
    sendMessage(tag) {
        const champs = Object.keys(this).filter(key => typeof this[key] != "function");
        switch (tag.toLowerCase()) {
            case "setall":
                sendMessage("Map_Create", this.Model + "@" + this.Indice + "@" + this.Type);

                champs.forEach(c => {
                    if (["Type", "Model", "Indice"].includes(c)) return;
                    const cmd = "Map_" + c.substring(0, 1).toUpperCase() + c.substring(1).toLowerCase();
                    sendMessage(cmd, this.Model + "@" + this.Indice + "@" + this[c]);
                });
                break;
            case "clearall":
                sendMessage("Map_ClearAll", "@@");
                break;
            default:
                const champ = champs.find(x => x.toLowerCase() === tag.toLowerCase());
                const cmd = "Map_" + champ.substring(0, 1).toUpperCase() + champ.substring(1).toLowerCase();
                sendMessage(cmd, this.Model + "@" + this.Indice + "@" + this[champ]);
                break;
        }
    }

    /**
     * Reçoit un message de la carte
     * @param {string} data - Message reçu
     */
    static receiveMessage(data) {
        var regex = new RegExp("^.*: Map_([a-zA-Z0-9_]+) ([^@]+)@([0-9]+)@(.*)$");
        var result = data.match(regex);
        if (!result) return false;
        const code = result[1];
        const model = result[2];
        const indice = parseInt("0" + result[3], 10);
        const val = result[4];

        switch (code.toLowerCase()) {
            case "create":
                Pions[Pions.length] = new Pion(val, model, indice);
                break;
            case "clearall":
                Pions = new Array;
                break;
            default:
                const p = Pions.find(x => x.Model === model && x.Indice === indice);
                const champs = Object.keys(p).filter(key => typeof this[key] != "function");
                const champ = champs.find(x => x.toLowerCase() === code.toLowerCase());
                if (["Titre", "Control", "Arme1", "Arme2", "Note", "loc_att", "Type", "Position"].includes(champ)) {
                    p[champ] = val;
                }
                else p[champ] = parseInt(val, 10);
                break;
        }
        Map.generateHexMap();
        Map.drawHexMap();
        return true;
    }

    /**
     * Trouve le hexagone le plus proche libre
     * @param {string} pos - Position en coordonnées hexagonales (Col, Row)
     * @returns {string} - Position en coordonnées hexagonales (Col, Row)
     */
    #findClosestHexFree(pos) {
        const col = pos.split(",")[0];
        const row = pos.split(",")[1];
        let closest = null;
        let minDistance = Infinity;

        Map.generateHexMap();

        hexMap.forEach(hex => {
            const p = Pions.find(x => x.Position === hex.col + "," + hex.row);
            const t = Terrains.find(x =>
                x.Position === hex.col + "," + hex.row && x.Model === "Rocher");

            if (p != null && typeof p != "undefined") return;
            if (t != null && typeof t != "undefined") return;

            const dist = Map.distance(col, row, hex.col, hex.row);

            if (dist < minDistance) {
                minDistance = dist;
                closest = hex;
            }
        });
        if (closest === null) return pos;
        return closest.col + "," + closest.row;
    }

    /**
     * Calcul l'armure générale (moyenne des différentes parties)
     * @returns {number} - Armure générale
     */
    armure_generale() {
        let a = 0;
        a += parseInt(this.Armure_tete);
        a += parseInt(this.Armure_poitrine);
        a += parseInt(this.Armure_abdomen);
        a += parseInt(this.Armure_brasg);
        a += parseInt(this.Armure_brasd);
        a += parseInt(this.Armure_jambeg);
        a += parseInt(this.Armure_jambed);

        return Math.floor(a / 7);
    }

    /**
     * Duplique un pion de la carte
     * @returns {Pion} - Pion dupliqué
     */
    dupliquer() {
        const p = new Pion(this.Type, this.Model);
        const m = Models.find(x => x.Nom_model === this.Model);

        if (m.Is_joueur) return null;

        const champs = Object.keys(this).filter(key => typeof this[key] != "function");
        for (let i = 0; i < champs.length; i++) {
            p[champs[i]] = this[champs[i]];
        }

        // Set Indice
        let i = 1;
        while (Pions.find(x => x.Model === this.Model && x.Indice === i)) i++;
        p.Indice = i;

        // Set Position
        p.Position = this.#findClosestHexFree(this.Position);

        // Set Titre
        var regex = new RegExp("^(.+) ([0-9]+)$");
        var result = this.Titre.match(regex);
        if (result) {
            p.Titre = result[1] + " " + p.Indice.toString().padStart(2, "0");
        }
        else {
            p.Titre = this.Titre + " " + p.Indice.toString().padStart(2, "0");
        }

        Pions[Pions.length] = p;

        p.sendMessage("setall");

        Map.generateHexMap();
        Map.drawHexMap();

        return p;
    }

    /**
     * Ajoute un pion sur la carte
     * @param {string} type - Type du pion
     * @param {string} model - Modèle du pion
     * @param {number} indice - Indice du pion
     * @returns {Pion} - Pion ajouté
     */
    static add(type, model, indice = -1) {
        let m = Models.find(x => x.Nom_model === model);
        if (m === null || typeof m === "undefined") return null;

        let p = Pions.find(x => x.Type === type && x.Model === model && x.Indice === indice);
        if (p === null || typeof p === "undefined") {
            Pions[Pions.length] = new Pion(type, model, indice);
            p = Pions[Pions.length - 1];
        }

        Map.generateHexMap();
        Map.drawHexMap();

        return p;
    }

    /**
     * Retire un pion de la carte
     */
    rmv() {
        const index = Pions.indexOf(this);
        Pions.splice(index, 1);
        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Renseigne sur le fait qu'un hexagone soit visible ou non du pion
     * @param {number} col - Colonne de l'hexagone
     * @param {number} row - Ligne de l'hexagone
     * @returns {boolean} - True si l'hexagone est visible, false sinon
     */
    ligne_de_vue(col, row) {
        const start_col = this.Position.split(",")[0];
        const start_row = this.Position.split(",")[1];
        const start_x = start_col * hexHSpacing;
        const start_y = start_row * hexVSpacing + ((start_col % 2 != 0) ? hexVSpacing / 2 : 0);

        const end_col = col;
        const end_row = row;
        const end_x = end_col * hexHSpacing;
        const end_y = end_row * hexVSpacing + ((end_col % 2 != 0) ? hexVSpacing / 2 : 0);

        let is_visible = true;

        // Si le pion n'est pas en vol, on tient compte des terrains qui cachent la vue
        if (!this.is_flying) {
            Terrains.filter(x => x.Model != "Eau").forEach(t => {
                if (!is_visible) return;

                const hex_col = t.Position.split(",")[0];
                const hex_row = t.Position.split(",")[1];
                const hex_x = hex_col * hexHSpacing;
                const hex_y = hex_row * hexVSpacing + ((hex_col % 2 != 0) ? hexVSpacing / 2 : 0);

                if (hex_x === start_x && hex_y === start_y) return;
                if (hex_x === end_x && hex_y === end_y) return;

                if (Forme.lineIntersectsHexagon(
                    { x: start_x, y: start_y },
                    { x: end_x, y: end_y },
                    { x: hex_x, y: hex_y })) {
                    is_visible = false;
                }
            });
        }

        // En vol ou pas, on ne voit pas derrière les murs à cause des plafonds
        Formes.filter(x => x.type === "Mur").forEach(m => {
            if (!is_visible) return;

            if (m.hexagonIntersectsRectangle({ x: end_x + offsetX, y: end_y + offsetY })) return;

            if (m.lineIntersectsRectangle(
                { x: start_x + offsetX, y: start_y + offsetY },
                { x: end_x + offsetX, y: end_y + offsetY })) {
                is_visible = false;
            }
        });

        return is_visible;
    }

    /**
     * Centre le pion sur la carte
     */
    centrer() {
        const col = this.Position.split(",")[0];
        const row = this.Position.split(",")[1];

        let x = col * hexHSpacing;
        let y = row * hexVSpacing + ((col % 2 != 0) ? hexVSpacing / 2 : 0);

        offsetX = canvas.width / 2 - x;
        offsetY = canvas.height / 2 - y;
    }

    /**
     * Ouvre la fenetre de dialogue de modification d'un pion
     */
    affiche_Details() {
        m_pion = this;
        affiche_pion();
    }

    /**
     * Déplace le pion sur la carte
     * @param {number} col_end - Colonne de la position d'arrivée
     * @param {number} row_end - Ligne de la position d'arrivée
     */
    deplace_a(col_end, row_end) {
        const pos = this.Position.split(",");
        let col_start = parseInt(pos[0], 10);
        let row_start = parseInt(pos[1], 10);

        // Si le pion est déjà à la position d'arrivée, on ne fait rien
        if (col_start === col_end && row_start === row_end) return;

        // Si le pion est en combat, on ne peut pas se déplacer
        if (init_round) {
            Messages.ecriture_directe("Le pion " + this.Titre + " est déjà en combat et ne peut pas se déplacer.");
            return;
        }

        this.Position = col_end + "," + row_end;

        if (!Cacs_save) Cacs_save = [];

        // On réinitialise les avantages des combats au corps à corps pour ce pion
        Cacs_save.forEach(c => {
            if ((c.Model_allie === this.Model && c.Indice_allie === this.Indice) ||
                (c.Model_ennemi === this.Model && c.Indice_ennemi === this.Indice)) {
                c.init_avantage();
            }
        });

        // On supprime les combats au corps à corps qui ne sont plus en combat
        Cacs_save = Cacs_save.filter(c => c.Avantage !== 0)

        // On ajoute les combats au corps à corps qui sont en combat
        Pions.forEach(pion1 => {
            if (pion1.Type !== "allies") return;

            Pions.forEach(pion2 => {
                if (pion2.Type !== "ennemis") return;

                // Si le combat existe déjà, on ne l'ajoute pas
                if (Cacs_save.find(c => c.Model_allie === pion1.Model &&
                    c.Indice_allie === pion1.Indice &&
                    c.Model_ennemi === pion2.Model &&
                    c.Indice_ennemi === pion2.Indice)) return;

                // Créer un combat au corps à corps entre les deux pions
                if (isInMeleeCombat(pion1, pion2)) {
                    const c = new Cac();
                    c.Model_allie = pion1.Model;
                    c.Indice_allie = pion1.Indice;
                    c.Model_ennemi = pion2.Model;
                    c.Indice_ennemi = pion2.Indice;
                    c.Attaque = 0;
                    c.init_avantage();
                    Cacs_save.push(c);
                }
            });
        });

        this.sendMessage("Position");
    }

    /**
     * Sauvegarde au sort
     * @param {string} save - Sauvegarde au sort
     * @returns {number} - Résultat de la sauvegarde
     */
    sauvegarde_au_sort(save) {
        if (save === "(Néant)") return null;
        if (save === "Spéciale") return null;

        const jet =
            Math.floor(Math.random() * 6) + 1 +
            Math.floor(Math.random() * 6) + 1 +
            Math.floor(Math.random() * 6) + 1;

        save = save.replace("(", "").replace(")", "");

        let auto_save = false;
        let regex = /\[.*\]/;
        let match = regex.exec(save);
        if (match) auto_save = true;

        let pion = this;
        if (auto_save) {
            pion = Pions.find((p) => p.Attaquant); // Le magicien
        }

        save = save.replace("Con", pion.getValue("Constitution"));
        save = save.replace("Cor", pion.coordination());
        save = save.replace("Vol", pion.getValue("Volonte"));
        save = save.replace("Abs", pion.getValue("Abstraction"));
        save = save.replace("Foi", pion.getValue("Foi"));
        save = save.replace("Mag", pion.getValue("Magie"));
        save = save.replace("6eS", pion.sixieme_sens());
        save = save.replace("Mem", pion.getValue("Memoire"));
        save = save.replace("NM", pion.niveau_mental());
        save = save.replace("Per", pion.getValue("Perception"));
        save = save.replace("Thp", pion.getValue("Telepathie"));
        save = save.replace("VM", pion.getValue("Vivacite_mentale"));
        save = save.replace("Cha", pion.getValue("Charisme"));

        save = eval(save);

        save -= jet;

        return (auto_save ? -save : save);
    }

    /**
     * Dégâts du sort
     * @param {number} save - Sauvegarde au sort
     * @param {string} degats - Dégâts du sort
     * @param {string} type - Type de dégâts
     * @returns {number} - Nombre de points de dégâts
     */
    degats_du_sort(save, degats, type) {
        if (degats === "(Néant)") return 0;

        const magicien = Pions.find((p) => p.Attaquant);

        let MR = 0;
        let ME = 0;
        if (save >= 0) MR = save;
        else ME = -save;

        degats = degats.replace("(", "").replace(")", "");
        degats = degats.replace(/(\d+)(M[R|E])/, "$1*$2");
        degats = degats.replace(/MR/g, MR);
        degats = degats.replace(/ME/g, ME);
        degats = eval(degats);

        if (degats > 0) this.Est_blesse = true;

        // Localisation des dégâts (si le sort est localisé)
        if (type === "localisés") {
            let loc_att = "";
            const jet_loc = Math.floor(Math.random() * 20) + 1;
            if (jet_loc < 5) loc_att = "jambe gauche";
            else if (jet_loc < 9) loc_att = "jambe droite";
            else if (jet_loc < 13) loc_att = "abdomen";
            else if (jet_loc < 16) loc_att = "poitrine";
            else if (jet_loc < 18) loc_att = "bras gauche";
            else if (jet_loc < 20) loc_att = "bras droit";
            else loc_att = "tête";

            let texte_loc = "";
            switch (loc_att) {
                case "abdomen":
                    this.Abdomen -= degats;
                    texte_loc = "à l'" + loc_att; // "à l'abdomen"
                    break;
                case "bras gauche":
                    this.Brasg -= degats;
                    texte_loc = "au " + loc_att; // "au bras gauche/droit"
                    break;
                case "bras droit":
                    this.Brasd -= degats;
                    texte_loc = "au " + loc_att; // "au bras gauche/droit"
                    break;
                case "jambe gauche":
                    this.Jambeg -= degats;
                    texte_loc = "à la " + loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
                case "jambe droite":
                    this.Jambed -= degats;
                    texte_loc = "à la " + loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
                case "poitrine":
                    this.Poitrine -= degats;
                    texte_loc = "à la " + loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
                case "tête":
                    this.Tete -= degats;
                    texte_loc = "à la " + loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
            }

            Messages.ecriture_directe(`${magicien.Titre} occasionne ${degats} points de dégâts ${texte_loc} à ${this.Titre}`);
        }
        else {
            this.General -= degats;
            Messages.ecriture_directe(`${magicien.Titre} occasionne ${degats} points de dégâts généraux à ${this.Titre}`);
        }

        return degats;
    }

    /**
     * Durée du sort
     * @param {number} save - Sauvegarde au sort
     * @param {string} duree - Durée du sort
     * @returns {number} - Durée du sort
     */
    duree_du_sort(save, duree) {
        if (duree === "(Néant)") return 0;

        duree = duree.replace("(", "").replace(")", "");
        duree = duree.replace(/(\d+)(M[R|E])/, "$1*$2");

        duree = duree.replace(/MR/g, save);
        duree = duree.replace(/ME/g, save);
        duree = eval(duree);

        return duree;
    }
}
let Pions = new Array;

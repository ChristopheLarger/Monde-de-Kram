/**
 * Classe Pion - Hérite de Map pour représenter un personnage sur la carte
 * Contient toutes les propriétés d'un personnage jouable (il se réfère à un modèle de personnage)
 */
class Pion {
    constructor(data = {}) {
        this.Type = data.Type || "";            // Type : "allies" ou "ennemis"
        this.Model = data.Model || "";          // Modèle de personnage
        this.Indice = data.Indice || 0;         // Indice du pion
        this.Position = data.Position || "0,0"; // Position en coordonnées hexagonales (Col, Row)
        this.Selected = data.Selected || false; // État de sélection
        this.Auto = data.Auto || false;

        this.Titre = data.Titre || "";
        this.Arme1 = data.Arme1 || "";
        this.Arme2 = data.Arme2 || "";
        this.Note = data.Note || "";
        this.Vue = data.Vue || 1;

        this.Fatigue = data.Fatigue || 0;
        this.Concentration = data.Concentration || 0;

        this.General = data.General || 0;
        this.Tete = data.Tete || 0;
        this.Poitrine = data.Poitrine || 0;
        this.Abdomen = data.Abdomen || 0;
        this.Brasg = data.Brasg || 0;
        this.Brasd = data.Brasd || 0;
        this.Jambeg = data.Jambeg || 0;
        this.Jambed = data.Jambed || 0;
    }

    /**
     * Mise à jour d'un pion
     * @param {string} type - Type de pion ("allies" ou "ennemis")
     * @param {string} model - Nom du modèle de personnage
     * @param {number} indice - Indice du pion (optionnel, -1 pour auto-assignation)
     */
    mise_a_jour_pion(type, model, indice = -1) {
        let p = null;
        if (indice != -1) p = Pions.find(x => x.Type === type && x.Model === model && x.Indice === indice);
        if (p != null && typeof p != "undefined") return p;

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

        if (this.Indice !== 0) this.Auto = true;

        this.Fatigue = m.get("fatigue");
        this.Concentration = m.get("concentration");

        if (!m.Is_monster) this.#setArmes();

        Pions.push(this);
        this.sendMessage("setall");

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Calcul la valeur d'un attribut
     * @param {string} attribut - Nom de l'attribut
     * @returns {number} - Valeur de l'attribut
     */
    get_attribut(attribut) {
        switch (attribut) {
            case "coordination":
                return Math.round((this.get_attribut("Vivacite_physique") + this.get_attribut("Perception") + this.get_attribut("Vivacite_mentale")) / 3);
            case "niveau_mental":
                return Math.round((this.get_attribut("Force") + this.get_attribut("Constitution") + this.get_attribut("Vivacite_physique") + this.get_attribut("Perception")) / 4);
            case "niveau_physique":
                return Math.round((this.get_attribut("Vivacite_mentale") + this.get_attribut("Volonte") + this.get_attribut("Abstraction") + this.get_attribut("Charisme")) / 4);
            case "sixieme_sens":
                return Math.round((this.get_attribut("Perception") + this.get_attribut("Adaptation")) / 2);
            default:
                const model = Models.find(m => m.Nom_model === this.Model);
                let res = parseInt(model[attribut]) || 0;
                if (res !== null && typeof res !== "undefined") res += this.get_bonus(attribut);
                return res;
        }
    }

    /**
     * Calcul le bonus d'un attribut
     * @param {string} attribut - Nom de l'attribut
     * @returns {number} - Bonus de l'attribut
     */
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
     * Calcul la compétence
     * @param {string} stat_combat - Nom de la compétence
     * @returns {number} - Compétence
     */
    #get_competence(nom_competence) {
        let cmp = Competences.find(c => c.Nom_model === this.Model && c.Nom === nom_competence);
        if (cmp === null || typeof cmp === "undefined") {
            cmp = new Competence({ Nom_model: this.Model, Nom: nom_competence, Degres: 0 });
            Competences.push(cmp);
        }
        let score = cmp.get_score();
        score += this.get_bonus(nom_competence);
        return score;
    }

    /**
     * Calcul la valeur de statistique de combat
     * @param {string} stat_combat - Nom de la statistique de combat
     * @returns {number} - Valeur de la statistique de combat
     */
    get_stat_combat(stat_combat) {
        const model = Models.find(m => m.Nom_model === this.Model);

        switch (stat_combat) {
            case "Esquive":
                if (model.Is_monster) return model[stat_combat];
                else return this.#get_competence("Esquive");
            case "Feinte_de_corps":
                if (model.Is_monster) return model[stat_combat];
                else return this.#get_competence("Feinte de corps");
            case "Attaque_1":
                if (this.Arme1 !== null && typeof this.Arme1 !== "undefined" && this.Arme1 !== "") {
                    const nom_competence = Armes.find(a => a.Nom_arme === this.Arme1).Competence;
                    return this.#get_competence(nom_competence);
                }
                else if (model.Is_monster) return model["Attaque_1"];
                else return null;
            case "Parade_1":
                if (this.Arme1 !== null && typeof this.Arme1 !== "undefined" && this.Arme1 !== "") {
                    const nom_competence = Armes.find(a => a.Nom_arme === this.Arme1).Competence;
                    const ratio = Armes.find(a => a.Nom_arme === this.Arme1).Facteur_parade;
                    return Math.round(this.#get_competence(nom_competence) * ratio);
                }
                else if (model.Is_monster) return model.Bool_parade_1 ? model.Parade_1 : null;
                else return null;
            case "Attaque_2":
                if (this.Arme2 !== null && typeof this.Arme2 !== "undefined" && this.Arme2 !== "") {
                    const nom_competence = Armes.find(a => a.Nom_arme === this.Arme2).Competence;
                    return this.#get_competence(nom_competence);
                }
                else if (model.Is_monster) return model.Bool_attaque_2 ? model.Attaque_2 : null;
                else return null;
            case "Parade_2":
                if (this.Arme2 !== null && typeof this.Arme2 !== "undefined" && this.Arme2 !== "") {
                    const nom_competence = Armes.find(a => a.Nom_arme === this.Arme2).Competence;
                    const ratio = Armes.find(a => a.Nom_arme === this.Arme2).Facteur_parade;
                    return Math.round(this.#get_competence(nom_competence) * ratio);
                }
                else if (model.Is_monster) return (model.Bool_attaque_2 && model.Bool_parade_2) ? model.Parade_2 : null;
                else return null;
            default:
                return null;
        }
    }

    /**
     * Définit les armes du pion
     */
    #setArmes() {
        let comp_max = -99;
        let arme_max = "";
        Armes.forEach(arme => {
            if (arme.Nom_arme === "Bouclier") return;
            const comp = this.get_stat_combat(arme.Competence);
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

    /**
     * Envoie un message au serveur pour mettre à jour un pion
     * @param {string} tag - Tag du message
     */
    sendMessage(tag) {
        const champs = Object.keys(this).filter(key => typeof this[key] != "function");
        switch (tag.toLowerCase()) {
            case "setall":
                champs.forEach(champ => {
                    const cmd = "Set_Pion_" + champ.substring(0, 1).toUpperCase() + champ.substring(1).toLowerCase();
                    sendMessage(cmd, this.Type + "@" + this.Model + "@" + this.Indice + "@" + this[champ]);
                });
                break;
            case "rmv":
                sendMessage("Rmv_Pion", this.Type + "@" + this.Model + "@" + this.Indice);
                break;
            default:
                const champ = champs.find(x => x.toLowerCase() === tag.toLowerCase());
                const cmd = "Set_Pion_" + champ.substring(0, 1).toUpperCase() + champ.substring(1).toLowerCase();
                sendMessage(cmd, this.Type + "@" + this.Model + "@" + this.Indice + "@" + this[champ]);
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

        let p = null;
        switch (code.toLowerCase()) {
            // case "create":
            //     p = new Pion();
            //     p.mise_a_jour_pion(model, val, indice);
            //     break;
            case "clearall":
                Pions = new Array;
                break;
            default:
                p = Pions.find(x => x.Model === model && x.Indice === indice);
                const champs = Object.keys(p).filter(key => typeof this[key] != "function");
                const champ = champs.find(x => x.toLowerCase() === code.toLowerCase());
                if (["Titre", "Control", "Arme1", "Arme2", "Note", "Loc_att", "Type", "Position"].includes(champ)) {
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
            if (p != null && typeof p != "undefined") return;

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
     * Duplique un pion de la carte
     * @returns {Pion} - Pion dupliqué
     */
    dupliquer() {
        const p = new Pion();
        p.mise_a_jour_pion(this.Type, this.Model);
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

        // Set Autres champs
        p.Fatigue = m.get("fatigue");
        p.Concentration = m.get("concentration");
        p.Selected = false;

        Pions.push(p);

        p.sendMessage("setall");

        Map.generateHexMap();
        Map.drawHexMap();

        return p;
    }

    /**
     * Retire un pion de la carte
     */
    rmv() {
        this.sendMessage("rmv");
        Pions.splice(Pions.indexOf(this), 1);

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

        // Si le pion n'est pas en vol, on tient compte des terrains qui cachent la vue (striés)
        if (!this.Is_flying) {
            Terrains.filter(x => x.Type === "strie").forEach(t => {
                if (!is_visible) return;

                const hex_col = t.Position.split(",")[0];
                const hex_row = t.Position.split(",")[1];
                const hex_x = hex_col * hexHSpacing;
                const hex_y = hex_row * hexVSpacing + ((hex_col % 2 != 0) ? hexVSpacing / 2 : 0);

                if (hex_x === start_x && hex_y === start_y) return;
                if (hex_x === end_x && hex_y === end_y) return;

                if (Map.lineIntersectsHexagon(
                    { x: start_x, y: start_y },
                    { x: end_x, y: end_y },
                    { x: hex_x, y: hex_y })) {
                    is_visible = false;
                }
            });
        }

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
    deplace_sur_la_carte(col_end, row_end) {
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
                if (isCaC(pion1, pion2)) {
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

        save = save.replace("Con", pion.get_attribut("Constitution"));
        save = save.replace("Cor", pion.get_attribut("Coordination"));
        save = save.replace("Vol", pion.get_attribut("Volonte"));
        save = save.replace("Abs", pion.get_attribut("Abstraction"));
        save = save.replace("Foi", pion.get_attribut("Foi"));
        save = save.replace("Mag", pion.get_attribut("Magie"));
        save = save.replace("6eS", pion.get_attribut("Sixieme_sens"));
        save = save.replace("Mem", pion.get_attribut("Memoire"));
        save = save.replace("NM", pion.get_attribut("Niveau_mental"));
        save = save.replace("Per", pion.get_attribut("Perception"));
        save = save.replace("Thp", pion.get_attribut("Telepathie"));
        save = save.replace("VM", pion.get_attribut("Vivacite_mentale"));
        save = save.replace("Cha", pion.get_attribut("Charisme"));

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
            let Loc_att = "";
            const jet_loc = Math.floor(Math.random() * 20) + 1;
            if (jet_loc < 5) Loc_att = "jambe gauche";
            else if (jet_loc < 9) Loc_att = "jambe droite";
            else if (jet_loc < 13) Loc_att = "abdomen";
            else if (jet_loc < 16) Loc_att = "poitrine";
            else if (jet_loc < 18) Loc_att = "bras gauche";
            else if (jet_loc < 20) Loc_att = "bras droit";
            else Loc_att = "tête";

            let texte_loc = "";
            switch (Loc_att) {
                case "abdomen":
                    this.Abdomen -= degats;
                    texte_loc = "à l'" + Loc_att; // "à l'abdomen"
                    break;
                case "bras gauche":
                    this.Brasg -= degats;
                    texte_loc = "au " + Loc_att; // "au bras gauche/droit"
                    break;
                case "bras droit":
                    this.Brasd -= degats;
                    texte_loc = "au " + Loc_att; // "au bras gauche/droit"
                    break;
                case "jambe gauche":
                    this.Jambeg -= degats;
                    texte_loc = "à la " + Loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
                case "jambe droite":
                    this.Jambed -= degats;
                    texte_loc = "à la " + Loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
                case "poitrine":
                    this.Poitrine -= degats;
                    texte_loc = "à la " + Loc_att; // "à la jambe", "à la poitrine", etc.
                    break;
                case "tête":
                    this.Tete -= degats;
                    texte_loc = "à la " + Loc_att; // "à la jambe", "à la poitrine", etc.
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

    /** Propriétés sérialisables du constructeur Pion */
    static getSerializableKeys() {
        return Object.keys(new Pion());
    }

    /** Convertit un pion en objet simple (sans méthodes) */
    static toData(pion) {
        const data = {};
        Pion.getSerializableKeys().forEach((key) => {
            data[key] = pion[key];
        });
        return data;
    }

    /** Sérialise le tableau Pions pour export JSON */
    static serializeAll() {
        return Pions.map((p) => Pion.toData(p));
    }

    /** Construit le document JSON de sauvegarde */
    static buildSaveDocument() {
        return {
            version: 1,
            savedAt: new Date().toISOString(),
            pions: Pion.serializeAll()
        };
    }

    /** Télécharge le tableau Pions dans un fichier JSON */
    static saveToFile() {
        const doc = Pion.buildSaveDocument();
        const json = JSON.stringify(doc, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pions_" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + ".json";
        link.click();
        URL.revokeObjectURL(link.href);
        return doc;
    }

    /** Enregistre sur le serveur (fichier + base MySQL), réservé au MJ */
    static async saveToServer(doc = null) {
        const payload = doc || Pion.buildSaveDocument();
        const response = await fetch("save_pions.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.ok) throw new Error(result.message || "Échec de la sauvegarde serveur");
        return result;
    }

    /** Charge le tableau Pions depuis des données JSON */
    static loadAll(pionsData) {
        if (!Array.isArray(pionsData)) throw new Error("Format invalide : tableau « pions » attendu");
        Pions.length = 0;
        pionsData.forEach((data) => Pions.push(new Pion(data)));
        Map.generateHexMap();
        Map.drawHexMap();
        Map.drawHexMap(true);
    }

    /** Charge depuis un fichier JSON local */
    static async loadFromFile(file) {
        const text = await file.text();
        const doc = JSON.parse(text);
        const list = Array.isArray(doc) ? doc : doc.pions;
        Pion.loadAll(list);
        if (document.getElementById("joueur").value === "MJ") {
            await Pion.saveToServer({ version: 1, savedAt: new Date().toISOString(), pions: list });
        }
    }

    /** Charge depuis le fichier serveur data/pions.json */
    static async loadFromServer() {
        const response = await fetch("load_pions.php");
        const doc = await response.json();
        if (!doc.ok) throw new Error(doc.message || "Échec du chargement serveur");
        Pion.loadAll(doc.pions);
    }

    /** Sauvegarde locale + serveur si MJ */
    static async saveAll() {
        const doc = Pion.saveToFile();
        if (document.getElementById("joueur").value === "MJ") {
            await Pion.saveToServer(doc);
        }
    }

    /**
     * Calcule l'initiative d'un pion
     * @param {Object} pion - Pion dont calculer l'initiative
     * @returns {number} Initiative calculée
     */
    calculateInitiative(main = 0) {
        const arme1 = this.Arme1 ? Armes.find(a => a.Nom_arme === this.Arme1) : null;
        const arme2 = this.Arme2 ? Armes.find(a => a.Nom_arme === this.Arme2) : null;
        if (arme1 === null && arme2 === null) return 0;

        const init1 = arme1 ? arme1.Init : 99;
        const init2 = arme2 ? arme2.Init : 99;
        const Vp_bonus = - Math.floor((this.get_attribut("Vivacite_physique") - 10) / 2);
        const res1 = init1 + Vp_bonus + this.get_bonus("Initiative");
        const res2 = init2 + Vp_bonus + this.get_bonus("Initiative");

        if (main === 1) return res1;
        if (main === 2) return res2;

        return Math.min(res1, res2);
    }

    get_nb_blessures() {
        const model = Models.find((x) => x.Nom_model === this.Model);
        const seuil_blessures = model.get("seuil_blessures");
        let nb_blessures = 0;
        ["General", "Tete", "Brasg", "Brasd", "Poitrine", "Abdomen", "Jambeg", "Jambed"].forEach(zone => {
            if (this[zone] >= seuil_blessures) nb_blessures++;
            if (this[zone] >= 2 *seuil_blessures) nb_blessures++;
        });
        return nb_blessures;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const btnSave = document.getElementById("save_pions");
    const btnLoad = document.getElementById("load_pions");
    const btnLoadServer = document.getElementById("load_pions_server");
    const inputLoad = document.getElementById("load_pions_file");

    if (btnSave) {
        btnSave.addEventListener("click", async () => {
            try {
                await Pion.saveAll();
                Messages.ecriture_directe("Pions sauvegardés.");
            } catch (e) {
                Messages.ecriture_directe("Erreur sauvegarde pions : " + e.message);
            }
        });
    }
    if (btnLoad && inputLoad) {
        btnLoad.addEventListener("click", () => inputLoad.click());
        inputLoad.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            event.target.value = "";
            if (!file) return;
            try {
                await Pion.loadFromFile(file);
                Messages.ecriture_directe("Pions chargés depuis le fichier.");
            } catch (e) {
                Messages.ecriture_directe("Erreur chargement pions : " + e.message);
            }
        });
    }
    if (btnLoadServer) {
        btnLoadServer.addEventListener("click", async () => {
            try {
                await Pion.loadFromServer();
                Messages.ecriture_directe("Pions chargés depuis le serveur.");
            } catch (e) {
                Messages.ecriture_directe("Erreur chargement serveur : " + e.message);
            }
        });
    }
});

let Pions = new Array;

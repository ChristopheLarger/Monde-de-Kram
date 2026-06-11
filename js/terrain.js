class Terrain {
    constructor(data = {}) {
        this.Type = data.Type || "";          // Type : "allies" ou "ennemis"
        this.Model = data.Model || "";         // Modèle de personnage
        this.Position = data.Position || "0,0";    // Position en coordonnées hexagonales (Col, Row)
        this.Selected = data.Selected || false;    // État de sélection

        this.color = data.color || "#000000";
    }

    /**
     * Envoie un message via WebSocket pour synchroniser le terrain
     * @param {string} tag - Type d'action ("add" ou "rmv")
     */
    sendMessage(tag) {
        switch (tag.toLowerCase()) {
            case "add":
                sendMessage("Terrain_Add", this.Model + "@" + this.Position);
                break;
            case "rmv":
                sendMessage("Terrain_Rmv", this.Model + "@" + this.Position);
                break;
        }
    }

    /**
     * Traite un message reçu via WebSocket pour créer/supprimer un terrain
     * @param {string} data - Message reçu du serveur
     * @returns {boolean} - true si le message a été traité
     */
    static receiveMessage(data) {
        var regex = new RegExp("^MJ: Terrain_([a-zA-Z0-9_]+) ([^@]*)@(.*)$");
        var result = data.match(regex);
        if (!result) return false;

        const code = result[1];
        const model = result[2];
        const pos = result[3];

        // Action selon le type de message
        switch (code.toLowerCase()) {
            case "add":
                Terrain.add(model, pos);
                return true;
            case "rmv":
                const t = Terrains.find(x => x.Position === pos);
                t.rmv();
                return true;
            default:
        }
        return false;
    }

    /**
     * Ajoute un terrain sur la carte
     * @param {string} type_terrain - Type de terrain à ajouter
     * @param {string} pos - Position où ajouter le terrain
     */
    static add(type_terrain, pos) {
        let t = Terrains.find(x => x.Position === pos);

        if (type_terrain === "gomme" && t != null && typeof t != "undefined") {
            Terrains.splice(Terrains.indexOf(t), 1);
        }
        else if (t != null && typeof t != "undefined") {
            t.Model = type_terrain.substring(0, 1).toUpperCase() + type_terrain.substring(1);
        }
        else if (type_terrain != "gomme") {
            t = new Terrain(type_terrain, pos);
            Terrains.push(t);
        }

        if (document.getElementById("joueur").value === "MJ") t.sendMessage("Add");

        t.affiche_terrain();

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Supprime le terrain de la carte
     */
    rmv() {
        if (document.getElementById("joueur").value === "MJ") this.sendMessage("Rmv");

        Terrains.splice(Terrains.indexOf(this), 1);

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Active/désactive le mode de placement de terrain
     * @param {string} terrain - Type de terrain ("rocher", "arbre", "eau", "gomme")
     */
    static set_terrain(terrain) {
        let type = terrain;
        if (terrain === "gomme") type = "gomme";

        if (document.getElementById(type).style.border === "2px solid rgb(20, 20, 20)") {
            document.getElementById(type).style.border = "none";
            default_cursor = "default";
            canvas.style.cursor = default_cursor;
            isMode_terrain = false;
            type_terrain = "";
            return;
        }
        else
            document.getElementById(type).style.border = "2px solid rgb(20, 20, 20)";

        switch (terrain) {
            case "gomme":
                default_cursor = "url('images/Gomme.png') 20 60, auto";
                break;
        }
        canvas.style.cursor = default_cursor;
        isMode_terrain = true;
        type_terrain = terrain;
    }
}

let Terrains = new Array;

/**
 * Définit la couleur de la forme
 * @param {string} color - Couleur de la forme
 */
function set_forme_color(color) {
    forme_color.value = color;
    last_forme_color = color;
    document.getElementById("forme_color_btn").style.backgroundColor = color;
    document.querySelectorAll("#forme_color_palette .color-picker-swatch").forEach((swatch) => {
        swatch.classList.toggle("is-selected", swatch.dataset.color === color);
    });
    forme_color.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Initialise la palette de couleurs pour les formes
 */
init_forme_color_palette();
function init_forme_color_palette() {
    const palette = document.getElementById("forme_color_palette");
    const btn = document.getElementById("forme_color_btn");

    palette_de_couleurs.forEach((color) => {
        const swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "color-picker-swatch";
        swatch.dataset.color = color;
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.addEventListener("click", (event) => {
            event.stopPropagation();
            set_forme_color(color);
            palette.classList.remove("is-open");
        });
        palette.appendChild(swatch);
    });

    set_forme_color(forme_color.value);

    btn.addEventListener("click", (event) => {
        event.stopPropagation();
        palette.classList.toggle("is-open");
    });

    document.addEventListener("click", () => palette.classList.remove("is-open"));
}
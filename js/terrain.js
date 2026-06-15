class Terrain {
    constructor(data = {}) {
        this.Type = data.Type || "";            // Type : "strie" ou "non_strie"
        this.Position = data.Position || "0,0"; // Position en coordonnées hexagonales (Col, Row)
        this.Color = data.Color || "#000000";   // Couleur du terrain
    }

    /**
     * Envoie un message via WebSocket pour synchroniser le terrain
     * @param {string} tag - Type d'action ("add" ou "rmv")
     */
    sendMessage(tag) {
        switch (tag.toLowerCase()) {
            case "add":
                sendMessage("Set_Terrain", this.Type + "@" + this.Position + "@" + this.Color);
                break;
            case "rmv":
                sendMessage("Rmv_Terrain", this.Type + "@" + this.Position + "@" + this.Color);
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
        const color = document.getElementById("color_terrain").value;
        let t = Terrains.find(x => x.Position === pos);

        if (type_terrain === "gomme" && t != null && typeof t != "undefined") {
            t.rmv();
        }
        else if (t != null && typeof t != "undefined") {
            t.sendMessage("rmv");
            t.Type = type_terrain;
            t.Color = color;
            t.sendMessage("add");
        }
        else if (type_terrain != "gomme") {
            t = new Terrain({ Type: type_terrain, Position: pos, Color: color });
            t.sendMessage("add");
            Terrains.push(t);
        }

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
     * @param {string} terrain - Type de terrain ("non_strie", "strie", "gomme")
     */
    static set_terrain(terrain) {
        let type = terrain;

        if (document.getElementById(type).style.border === "2px solid rgb(20, 20, 20)") {
            document.getElementById(type).style.border = "none";
            default_cursor = "default";
            canvas.style.cursor = default_cursor;
            isMode_terrain = false;
            type_terrain = "";
            return;
        }
        else {
            document.getElementById("non_strie").style.border = "none";
            document.getElementById("strie").style.border = "none";
            document.getElementById("gomme").style.border = "none";
            document.getElementById(type).style.border = "2px solid rgb(20, 20, 20)";
        }

        switch (terrain) {
            case "non_strie":
                default_cursor = "url('images/Hex - curseur.png') 10 12, auto";
                break;
            case "strie":
                default_cursor = "url('images/Hex strie - curseur.png') 10 12, auto";
                break;
            case "gomme":
                default_cursor = "url('images/Gomme - curseur.png') 10 10, auto";
                break;
        }
        canvas.style.cursor = default_cursor;
        isMode_terrain = true;
        type_terrain = terrain;
    }

    static getSerializableKeys() {
        return Object.keys(new Terrain());
    }

    static toData(terrain) {
        const data = {};
        Terrain.getSerializableKeys().forEach((key) => {
            data[key] = terrain[key];
        });
        return data;
    }

    static serializeAll() {
        return Terrains.map((t) => Terrain.toData(t));
    }

    static buildSaveDocument() {
        return {
            version: 1,
            savedAt: new Date().toISOString(),
            terrains: Terrain.serializeAll()
        };
    }

    static saveToFile() {
        const doc = Terrain.buildSaveDocument();
        const json = JSON.stringify(doc, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "terrains_" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-") + ".json";
        link.click();
        URL.revokeObjectURL(link.href);
        return doc;
    }

    static async saveToServer(doc = null) {
        const payload = doc || Terrain.buildSaveDocument();
        const response = await fetch("save_terrains.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!result.ok) throw new Error(result.message || "Échec de la sauvegarde serveur");
        return result;
    }

    static loadAll(terrainsData) {
        if (!Array.isArray(terrainsData)) throw new Error("Format invalide : tableau « terrains » attendu");
        Terrains.length = 0;
        terrainsData.forEach((data) => Terrains.push(new Terrain(data)));
        Map.generateHexMap();
        Map.drawHexMap();
    }

    static async loadFromFile(file) {
        const text = await file.text();
        const doc = JSON.parse(text);
        const list = Array.isArray(doc) ? doc : doc.terrains;
        Terrain.loadAll(list);
        if (document.getElementById("joueur").value === "MJ") {
            await Terrain.saveToServer({ version: 1, savedAt: new Date().toISOString(), terrains: list });
        }
    }

    static async loadFromServer() {
        const response = await fetch("load_terrains.php");
        const doc = await response.json();
        if (!doc.ok) throw new Error(doc.message || "Échec du chargement serveur");
        Terrain.loadAll(doc.terrains);
    }

    static async saveAll() {
        const doc = Terrain.saveToFile();
        if (document.getElementById("joueur").value === "MJ") {
            await Terrain.saveToServer(doc);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const btnSave = document.getElementById("save_terrains");
    const btnLoad = document.getElementById("load_terrains");
    const btnLoadServer = document.getElementById("load_terrains_server");
    const inputLoad = document.getElementById("load_terrains_file");

    if (btnSave) {
        btnSave.addEventListener("click", async () => {
            try {
                await Terrain.saveAll();
                Messages.ecriture_directe("Terrains sauvegardés.");
            } catch (e) {
                Messages.ecriture_directe("Erreur sauvegarde terrains : " + e.message);
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
                await Terrain.loadFromFile(file);
                Messages.ecriture_directe("Terrains chargés depuis le fichier.");
            } catch (e) {
                Messages.ecriture_directe("Erreur chargement terrains : " + e.message);
            }
        });
    }
    if (btnLoadServer) {
        btnLoadServer.addEventListener("click", async () => {
            try {
                await Terrain.loadFromServer();
                Messages.ecriture_directe("Terrains chargés depuis le serveur.");
            } catch (e) {
                Messages.ecriture_directe("Erreur chargement serveur : " + e.message);
            }
        });
    }
});

let Terrains = new Array;
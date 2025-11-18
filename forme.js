/**
 * FICHIER FORME.JS - VERSION SIMPLIFIÉE
 * ======================================
 * Factory function et utilitaires pour les formes géométriques
 * Simplifie la gestion des rectangles et ellipses sur la carte
 */

/**
 * Crée un objet forme avec des valeurs par défaut
 * @param {string} type - Type de forme ("Rectangle" ou "Ellipse")
 * @param {Object} data - Données de la forme (optionnel)
 * @returns {Object} Objet forme avec méthodes utilitaires
 */
function createForme(type, data = {}) {
    return {
        type: type,
        x: data.x || 0,
        y: data.y || 0,
        width: data.width || 0,
        height: data.height || 0,
        theta: data.theta || 0,
        color: data.color || null,

        // Méthodes utilitaires
        sendMessage(tag) {
            const coords = `${this.x}@${this.y}@${this.width}@${this.height}`;
            switch (tag.toLowerCase()) {
                case "add":
                    sendMessage(`${this.type}_Add`, `${coords}@${this.color}`);
                    break;
                case "rmv":
                    sendMessage(`${this.type}_Rmv`, `${coords}@`);
                    break;
            }
        }
    };
}

/**
 * Utilitaires pour les formes géométriques
 */
const FormeUtils = {
    /**
     * Traite un message reçu via WebSocket pour créer/supprimer une forme
     */
    receiveMessage(data) {
        const regex = /^.*:<p class='vip' title='([A-Za-z]+)_([a-zA-Z0-9_]+) .+>([0-9]+)@([0-9]+)@([0-9]+)@([0-9]+)@(.*)<\/p>$/;
        const result = data.match(regex);
        if (!result) return false;

        const type = result[1];
        if (!["Rectangle", "Ellipse"].includes(type)) return false;

        const code = result[2];
        const x = parseInt(result[3], 10);
        const y = parseInt(result[4], 10);
        const width = parseInt(result[5], 10);
        const height = parseInt(result[6], 10);
        const color = result[7];

        switch (code.toLowerCase()) {
            case "add":
                Formes.push(createForme(type, { x, y, width, height, color }));
                return true;
            case "rmv":
                // TODO : Implémenter la suppression de forme
                return true;
        }
        return false;
    },

    /**
     * Active/désactive le mode de dessin de forme
     */
    setFormeMode(forme) {
        // Réinitialiser tous les modes
        this.resetAllModes();

        const type = forme === "gomme" ? "gomme_f" : forme;
        const element = document.getElementById(type);

        if (element.style.border === "2px solid black") {
            element.style.border = "none";
            this.disableFormeMode();
        } else {
            element.style.border = "2px solid black";
            this.enableFormeMode(forme);
        }
    },

    resetAllModes() {
        // Désactiver le mode terrain
        ["rocher", "arbre", "eau", "gomme_t"].forEach(id => {
            document.getElementById(id).style.border = "none";
        });
        isMode_terrain = false;
        type_terrain = "";

        // Désactiver le mode forme
        ["rectangle", "ellipse", "mur", "scission", "gomme_f"].forEach(id => {
            document.getElementById(id).style.border = "none";
        });
    },

    disableFormeMode() {
        default_cursor = "default";
        canvas.style.cursor = default_cursor;
        isMode_forme = false;
        type_forme = "";
    },

    enableFormeMode(forme) {
        const cursors = {
            rectangle: "url('Images/Rectangle.png') 26 12, auto",
            ellipse: "url('Images/Ellipse.png') 33 33, auto",
            mur: "url('Images/Mur.png') 33 33, auto",
            // scission: "url('Images/Scission.png') 33 33, auto",
            gomme: "default"
        };

        default_cursor = cursors[forme] || "default";
        canvas.style.cursor = default_cursor;
        isMode_forme = true;
        type_forme = forme;
    },

    /**
     * Fait pivoter un point autour d'un centre selon un angle donné
     */
    rotatePoint(px, py, cx, cy, angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const dx = px - cx;
        const dy = py - cy;
        return {
            x: cx + dx * cos - dy * sin,
            y: cy + dx * sin + dy * cos
        };
    },

    /**
     * Vérifie si un point est sur le contour du rectangle
     */
    isOnRectangle(forme, x, y) {
        const cx = forme.x + forme.width / 2;
        const cy = forme.y + forme.height / 2;
        const rp = this.rotatePoint(x, y, cx, cy, -forme.theta);

        return (Math.abs(rp.y - forme.y) < 10 && Math.abs(rp.x - forme.x - forme.width / 2) < forme.width / 2 + 10) ||
            (Math.abs(rp.y - forme.y - forme.height) < 10 && Math.abs(rp.x - forme.x - forme.width / 2) < forme.width / 2 + 10) ||
            (Math.abs(rp.x - forme.x) < 10 && Math.abs(rp.y - forme.y - forme.height / 2) < forme.height / 2 + 10) ||
            (Math.abs(rp.x - forme.x - forme.width) < 10 && Math.abs(rp.y - forme.y - forme.height / 2) < forme.height / 2 + 10);
    },

    /**
     * Vérifie si un point est DANS le rectangle "mur" (inclusion)
     */
    isOnMur(forme, x, y) {
        // Ramener le point dans le repère non-rotaté du rectangle
        const cx = forme.x + forme.width / 2;
        const cy = forme.y + forme.height / 2;
        const rp = this.rotatePoint(x, y, cx, cy, -forme.theta);

        // Gérer les largeurs/hauteurs éventuellement négatives
        const minX = Math.min(forme.x, forme.x + forme.width);
        const maxX = Math.max(forme.x, forme.x + forme.width);
        const minY = Math.min(forme.y, forme.y + forme.height);
        const maxY = Math.max(forme.y, forme.y + forme.height);

        return (rp.x >= minX && rp.x <= maxX && rp.y >= minY && rp.y <= maxY);
    },

    /**
     * Vérifie si un point est sur un sommet du rectangle
     */
    isOnSommetRectangle(forme, x, y) {
        const rp = this.rotatePoint(x, y, forme.x + forme.width / 2, forme.y + forme.height / 2, -forme.theta);

        if ((Math.abs(rp.y - forme.y) < 10) && (Math.abs(rp.x - forme.x) < 10)) {
            return { x: 0, y: 0 };
        }
        if ((Math.abs(rp.y - forme.y) < 10) && (Math.abs(rp.x - forme.x - forme.width) < 10)) {
            return { x: forme.width, y: 0 };
        }
        if ((Math.abs(rp.y - forme.y - forme.height) < 10) && (Math.abs(rp.x - forme.x) < 10)) {
            return { x: 0, y: forme.height };
        }
        if ((Math.abs(rp.y - forme.y - forme.height) < 10) && (Math.abs(rp.x - forme.x - forme.width) < 10)) {
            return { x: forme.width, y: forme.height };
        }
        return null;
    },

    /**
     * Vérifie si un point est sur le contour de l'ellipse
     */
    isOnEllipse(forme, x, y) {
        const rp = this.rotatePoint(x, y, forme.x, forme.y, -forme.theta);
        return Math.abs(((rp.x - forme.x) / (forme.width / 2)) ** 2 +
            ((rp.y - forme.y) / (forme.height / 2)) ** 2 - 1) < 0.2;
    },

    /**
     * Vérifie si un point est sur un sommet de l'ellipse
     */
    isOnSommetEllipse(forme, x, y) {
        const rp = this.rotatePoint(x, y, forme.x, forme.y, -forme.theta);

        if ((Math.abs(rp.y - forme.y) < 10) && (Math.abs(rp.x - forme.x - forme.width / 2) < 10)) {
            return { x: forme.width / 2, y: 0 };
        }
        if ((Math.abs(rp.y - forme.y) < 10) && (Math.abs(rp.x - forme.x + forme.width / 2) < 10)) {
            return { x: -forme.width / 2, y: 0 };
        }
        if ((Math.abs(rp.y - forme.y - forme.height / 2) < 10) && (Math.abs(rp.x - forme.x) < 10)) {
            return { x: 0, y: forme.height / 2 };
        }
        if ((Math.abs(rp.y - forme.y + forme.height / 2) < 10) && (Math.abs(rp.x - forme.x) < 10)) {
            return { x: 0, y: -forme.height / 2 };
        }
        return null;
    },

    /**
     * Vérifie si un rectangle et un hexagone se croisent
     * @param {Object} rectangle - Rectangle avec {x, y, width, height, theta}
     * @param {Object} hexagon - Hexagone avec {x, y} (centre)
     * @returns {boolean} - true si les formes se croisent
     */
    rectangleHexagonIntersect(rectangle, hexagon) {
        // 1. Obtenir les 6 sommets de l'hexagone
        const hexVertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexVertices.push({
                x: hexagon.x + hexSize * Math.cos(angle),
                y: hexagon.y + hexSize * Math.sin(angle)
            });
        }
        
        // 2. Obtenir les 4 sommets du rectangle (dans le repère non-rotaté)
        const rectCenterX = rectangle.x + rectangle.width / 2;
        const rectCenterY = rectangle.y + rectangle.height / 2;
        
        const rectVertices = [
            { x: rectangle.x, y: rectangle.y },
            { x: rectangle.x + rectangle.width, y: rectangle.y },
            { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
            { x: rectangle.x, y: rectangle.y + rectangle.height }
        ];
        
        // Transformer les sommets du rectangle selon la rotation
        const rotatedRectVertices = rectVertices.map(v => 
            this.rotatePoint(v.x, v.y, rectCenterX, rectCenterY, rectangle.theta || 0)
        );
        
        // 3. Vérifier si un sommet de l'hexagone est dans le rectangle
        for (const vertex of hexVertices) {
            if (this.isPointInRotatedRectangle(vertex, rectangle)) {
                return true;
            }
        }
        
        // 4. Vérifier si un sommet du rectangle est dans l'hexagone
        for (const vertex of rotatedRectVertices) {
            if (this.isPointInHexagon(vertex, hexagon, hexSize)) {
                return true;
            }
        }
        
        // 5. Vérifier si les arêtes se croisent
        // Arêtes de l'hexagone
        for (let i = 0; i < 6; i++) {
            const hexEdgeStart = hexVertices[i];
            const hexEdgeEnd = hexVertices[(i + 1) % 6];
            
            // Arêtes du rectangle
            for (let j = 0; j < 4; j++) {
                const rectEdgeStart = rotatedRectVertices[j];
                const rectEdgeEnd = rotatedRectVertices[(j + 1) % 4];
                
                if (this.segmentsIntersect(hexEdgeStart, hexEdgeEnd, rectEdgeStart, rectEdgeEnd)) {
                    return true;
                }
            }
        }
        
        return false;
    },

    /**
     * Vérifie si un point est dans un rectangle rotaté
     * @param {Object} point - Point avec {x, y}
     * @param {Object} rectangle - Rectangle avec {x, y, width, height, theta}
     * @returns {boolean} - true si le point est dans le rectangle
     */
    isPointInRotatedRectangle(point, rectangle) {
        const cx = rectangle.x + rectangle.width / 2;
        const cy = rectangle.y + rectangle.height / 2;
        const rp = this.rotatePoint(point.x, point.y, cx, cy, -(rectangle.theta || 0));
        
        const minX = Math.min(rectangle.x, rectangle.x + rectangle.width);
        const maxX = Math.max(rectangle.x, rectangle.x + rectangle.width);
        const minY = Math.min(rectangle.y, rectangle.y + rectangle.height);
        const maxY = Math.max(rectangle.y, rectangle.y + rectangle.height);
        
        return (rp.x >= minX && rp.x <= maxX && rp.y >= minY && rp.y <= maxY);
    },

    /**
     * Vérifie si un point est dans un hexagone
     * @param {Object} point - Point avec {x, y}
     * @param {Object} hexagon - Hexagone avec {x, y} (centre)
     * @param {number} hexSize - Taille de l'hexagone en pixels
     * @returns {boolean} - true si le point est dans l'hexagone
     */
    isPointInHexagon(point, hexagon, hexSize) {
        const dx = point.x - hexagon.x;
        const dy = point.y - hexagon.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= hexSize;
    },

    /**
     * Vérifie si deux segments de droite se croisent
     * @param {Object} p1 - Premier point du premier segment {x, y}
     * @param {Object} p2 - Deuxième point du premier segment {x, y}
     * @param {Object} p3 - Premier point du deuxième segment {x, y}
     * @param {Object} p4 - Deuxième point du deuxième segment {x, y}
     * @returns {boolean} - true si les segments se croisent
     */
    segmentsIntersect(p1, p2, p3, p4) {
        const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
        return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
    }
};

// === VARIABLES GLOBALES ===

let Formes = []; // Tableau contenant toutes les formes dessinées
let SelectRectangle = createForme("Rectangle", { color: "rgb(64, 64, 255)" }); // Rectangle de sélection

// === ÉVÉNEMENTS D'INTERFACE ===

// Clic droit sur le bouton rectangle : ouvre le dialogue de dimensions
document.getElementById("rectangle").addEventListener("contextmenu", function (event) {
    event.preventDefault();
    afficher_dim_rectangle();
});

// Clic droit sur le bouton ellipse : ouvre le dialogue de dimensions
document.getElementById("ellipse").addEventListener("contextmenu", function (event) {
    event.preventDefault();
    afficher_dim_ellipse();
});
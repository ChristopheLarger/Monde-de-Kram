/**
 * FICHIER FORME.JS - VERSION SIMPLIFIÉE
 * ======================================
 * Factory function et utilitaires pour les formes géométriques
 * Simplifie la gestion des rectangles et ellipses sur la carte
 */

/**
 * Classe pour les formes géométriques
 */
class Forme {
    /**
     * Constructeur pour créer une forme
     * @param {string} type - Type de forme ("Rectangle", "Ellipse", "Mur")
     * @param {Object} data - Données de la forme (optionnel)
     */
    constructor(type, data = {}) {
        this.type = type;
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.width = Math.abs(data.width || 0);
        this.height = Math.abs(data.height || 0);
        this.theta = data.theta || 0;
        this.color = data.color || null;
    }

    /**
     * Traite un message reçu via WebSocket pour créer/supprimer une forme
     */
    sendMessage(tag) {
        const data = `${this.x}@${this.y}@${this.width}@${this.height}@${this.theta}@${this.color}`;
        switch (tag.toLowerCase()) {
            case "add":
                sendMessage(`${this.type}_Add`, `${hexSize}@${offsetX}@${offsetY}@${data}`);
                break;
            case "rmv":
                sendMessage(`${this.type}_Rmv`, `${hexSize}@${offsetX}@${offsetY}@${data}`);
                break;
        }
    }

    static receiveMessage(data) {
        const regex = /^MJ: ([A-Za-z]+)_([a-zA-Z]+) ([0-9\-\.]+)@([0-9\-\.]+)@([0-9\-\.]+)@([0-9\-\.]+)@([0-9\-\.]+)@([0-9\-\.]+)@([0-9\-\.]+)@([0-9\-\.]+)@(.*)$/;
        const result = data.match(regex);
        if (!result) return false;

        const type = result[1];
        if (!["Rectangle", "Ellipse", "Mur"].includes(type)) return false;

        const code = result[2];
        const hexSize_MJ = parseFloat(result[3]);
        const offsetX_MJ = parseFloat(result[4]);
        const offsetY_MJ = parseFloat(result[5]);
        let x = parseFloat(result[6]);
        let y = parseFloat(result[7]);
        let width = parseFloat(result[8]);
        let height = parseFloat(result[9]);
        const theta = parseFloat(result[10]);
        const color = result[11];

        // Adaptation des dimensions à la configuration du client (déplacement et zoom)
        const ratio = hexSize / hexSize_MJ;
        x = (x - offsetX_MJ) * ratio + offsetX;
        y = (y - offsetY_MJ) * ratio + offsetY;
        width = width * ratio;
        height = height * ratio;

        switch (code.toLowerCase()) {
            case "add":
                Formes.push(new Forme(type, { x, y, width, height, theta, color }));
                // Régénérer la carte
                Map.generateHexMap();
                Map.drawHexMap();
                return true;
            case "rmv":
                const f = Formes.find(frm =>
                    Math.abs(frm.x - x) < 1e-6 &&
                    Math.abs(frm.y - y) < 1e-6 &&
                    Math.abs(frm.width - width) < 1e-6 &&
                    Math.abs(frm.height - height) < 1e-6 &&
                    Math.abs(frm.theta - theta) < 1e-6 &&
                    frm.color === color);
                if (f !== null && typeof f !== "undefined") {
                    Formes.splice(Formes.indexOf(f), 1);
                    // Régénérer la carte
                    Map.generateHexMap();
                    Map.drawHexMap();
                    return true;
                }
        }
        return false;
    }

    /**
     * Active/désactive le mode de dessin de forme
     */
    static setFormeMode(forme) {
        // Réinitialiser tous les modes
        this.resetAllModes();

        const type = forme === "gomme" ? "gomme_f" : forme;
        const element = document.getElementById(type);

        if (element.style.border === "2px solid black") {
            element.style.border = "none";
            this.#disableFormeMode();
        } else {
            element.style.border = "2px solid black";
            this.#enableFormeMode(forme);
        }
    }

    static resetAllModes() {
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
    }

    static #disableFormeMode() {
        default_cursor = "default";
        canvas.style.cursor = default_cursor;
        isMode_forme = false;
        type_forme = "";
    }

    static #enableFormeMode(forme) {
        const cursors = {
            rectangle: "url('images/Rectangle.png') 39 25, auto",
            ellipse: "url('images/Ellipse.png') 39 25, auto",
            mur: "url('images/Mur.png') 39 25, auto",
            gomme: "default"
        };

        default_cursor = cursors[forme] || "default";
        canvas.style.cursor = default_cursor;
        isMode_forme = true;
        type_forme = forme;
    }

    /**
     * Fait pivoter un point autour d'un centre selon un angle donné
     */
    static rotatePoint(px, py, cx, cy, angle) {
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        const dx = px - cx;
        const dy = py - cy;
        return {
            x: cx + dx * cos - dy * sin,
            y: cy + dx * sin + dy * cos
        };
    }

    /**
     * Vérifie si un point est sur le contour du rectangle
     */
    isOnRectangle(x, y) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const rp = Forme.rotatePoint(x, y, cx, cy, -this.theta);

        return (Math.abs(rp.y - this.y) < 10 && Math.abs(rp.x - this.x - this.width / 2) < this.width / 2 + 10) ||
            (Math.abs(rp.y - this.y - this.height) < 10 && Math.abs(rp.x - this.x - this.width / 2) < this.width / 2 + 10) ||
            (Math.abs(rp.x - this.x) < 10 && Math.abs(rp.y - this.y - this.height / 2) < this.height / 2 + 10) ||
            (Math.abs(rp.x - this.x - this.width) < 10 && Math.abs(rp.y - this.y - this.height / 2) < this.height / 2 + 10);
    }

    /**
     * Vérifie si un point est DANS le rectangle "mur" (inclusion)
     */
    isOnMur(x, y) {
        // Ramener le point dans le repère non-rotaté du rectangle
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const rp = Forme.rotatePoint(x, y, cx, cy, -this.theta);

        // Gérer les largeurs/hauteurs éventuellement négatives
        const minX = Math.min(this.x, this.x + this.width);
        const maxX = Math.max(this.x, this.x + this.width);
        const minY = Math.min(this.y, this.y + this.height);
        const maxY = Math.max(this.y, this.y + this.height);

        return (rp.x >= minX && rp.x <= maxX && rp.y >= minY && rp.y <= maxY);
    }

    /**
     * Vérifie si un point est sur un sommet du rectangle
     */
    isOnSommetRectangle(x, y) {
        const rp = Forme.rotatePoint(x, y, this.x + this.width / 2, this.y + this.height / 2, -this.theta);

        if ((Math.abs(rp.y - this.y) < 10) && (Math.abs(rp.x - this.x) < 10)) {
            return { x: 0, y: 0 };
        }
        if ((Math.abs(rp.y - this.y) < 10) && (Math.abs(rp.x - this.x - this.width) < 10)) {
            return { x: this.width, y: 0 };
        }
        if ((Math.abs(rp.y - this.y - this.height) < 10) && (Math.abs(rp.x - this.x) < 10)) {
            return { x: 0, y: this.height };
        }
        if ((Math.abs(rp.y - this.y - this.height) < 10) && (Math.abs(rp.x - this.x - this.width) < 10)) {
            return { x: this.width, y: this.height };
        }
        return null;
    }

    /**
     * Vérifie si un point est sur le contour de l'ellipse
     */
    isOnEllipse(x, y) {
        const rp = Forme.rotatePoint(x, y, this.x, this.y, -this.theta);
        return Math.abs(((rp.x - this.x) / (this.width / 2)) ** 2 +
            ((rp.y - this.y) / (this.height / 2)) ** 2 - 1) < 0.2;
    }

    /**
     * Vérifie si un point est sur un sommet de l'ellipse
     */
    isOnSommetEllipse(x, y) {
        const rp = Forme.rotatePoint(x, y, this.x, this.y, -this.theta);

        if ((Math.abs(rp.y - this.y) < 10) && (Math.abs(rp.x - this.x - this.width / 2) < 10)) {
            return { x: this.width / 2, y: 0 };
        }
        if ((Math.abs(rp.y - this.y) < 10) && (Math.abs(rp.x - this.x + this.width / 2) < 10)) {
            return { x: -this.width / 2, y: 0 };
        }
        if ((Math.abs(rp.y - this.y - this.height / 2) < 10) && (Math.abs(rp.x - this.x) < 10)) {
            return { x: 0, y: this.height / 2 };
        }
        if ((Math.abs(rp.y - this.y + this.height / 2) < 10) && (Math.abs(rp.x - this.x) < 10)) {
            return { x: 0, y: -this.height / 2 };
        }
        return null;
    }

    /**
     * Vérifie si deux segments de droite se croisent
     * @param {Object} p1 - Premier point du premier segment {x, y}
     * @param {Object} p2 - Deuxième point du premier segment {x, y}
     * @param {Object} p3 - Premier point du deuxième segment {x, y}
     * @param {Object} p4 - Deuxième point du deuxième segment {x, y}
     * @returns {boolean} - true si les segments se croisent
     */
    static #segmentsIntersect(p1, p2, p3, p4) {
        // Sous-fonction : Vérifie si un point est sur un segment (utilisé pour les cas limites)
        function isPointOnSegment(segStart, segEnd, point) {
            // Vérifier si le point est colinéaire avec le segment
            const crossProduct = (point.y - segStart.y) * (segEnd.x - segStart.x) -
                (point.x - segStart.x) * (segEnd.y - segStart.y);
            if (Math.abs(crossProduct) > 1e-10) return false;

            // Vérifier si le point est dans la bounding box du segment
            const minX = Math.min(segStart.x, segEnd.x);
            const maxX = Math.max(segStart.x, segEnd.x);
            const minY = Math.min(segStart.y, segEnd.y);
            const maxY = Math.max(segStart.y, segEnd.y);

            return (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY);
        }

        // Fonction pour calculer l'orientation de trois points (CCW)
        const ccw = (A, B, C) => {
            return (C.y - A.y) * (B.x - A.x) - (B.y - A.y) * (C.x - A.x);
        };

        // Vérifier si les segments se croisent
        const o1 = ccw(p1, p2, p3);
        const o2 = ccw(p1, p2, p4);
        const o3 = ccw(p3, p4, p1);
        const o4 = ccw(p3, p4, p2);

        // Cas général : les segments se croisent si les orientations sont différentes
        if ((o1 * o2 < 0) && (o3 * o4 < 0)) {
            return true;
        }

        // Cas spéciaux : segments colinéaires ou points sur les bords
        // Vérifier si p3 est sur le segment p1-p2
        if (o1 === 0 && isPointOnSegment(p1, p2, p3)) return true;
        // Vérifier si p4 est sur le segment p1-p2
        if (o2 === 0 && isPointOnSegment(p1, p2, p4)) return true;
        // Vérifier si p1 est sur le segment p3-p4
        if (o3 === 0 && isPointOnSegment(p3, p4, p1)) return true;
        // Vérifier si p2 est sur le segment p3-p4
        if (o4 === 0 && isPointOnSegment(p3, p4, p2)) return true;

        return false;
    }

    /**
     * Vérifie si un segment de droite (définie par deux points) coupe un rectangle
     * @param {Object} linePoint1 - Premier point du segment de droite {x, y}
     * @param {Object} linePoint2 - Deuxième point du segment de droite {x, y}
     * @param {Object} rectangle - Rectangle avec {x, y, width, height, theta}
     *                              où x et y sont les coordonnées du coin supérieur gauche (ou coin de départ si width/height sont négatifs)
     * @returns {boolean} - true si la droite coupe le rectangle
     */
    lineIntersectsRectangle(linePoint1, linePoint2) {
        // Sous-fonction : Vérifie si un point est dans un rectangle rotaté
        function isPointInRotatedRectangle(r, point) {
            // Gérer les largeurs/hauteurs éventuellement négatives (cohérent avec lineIntersectsRectangle)
            const minX = Math.min(r.x, r.x + r.width);
            const maxX = Math.max(r.x, r.x + r.width);
            const minY = Math.min(r.y, r.y + r.height);
            const maxY = Math.max(r.y, r.y + r.height);

            // Calculer le centre de manière cohérente
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            const rp = Forme.rotatePoint(point.x, point.y, cx, cy, -(r.theta || 0));

            return (rp.x >= minX && rp.x <= maxX && rp.y >= minY && rp.y <= maxY);
        }

        // Gérer les largeurs/hauteurs éventuellement négatives
        const minX = Math.min(this.x, this.x + this.width);
        const maxX = Math.max(this.x, this.x + this.width);
        const minY = Math.min(this.y, this.y + this.height);
        const maxY = Math.max(this.y, this.y + this.height);

        // Obtenir les 4 sommets du rectangle (dans le repère non-rotaté)
        const rectCenterX = (minX + maxX) / 2;
        const rectCenterY = (minY + maxY) / 2;

        const rectVertices = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
        ];

        // Transformer les sommets du rectangle selon la rotation
        const rotatedRectVertices = rectVertices.map(v =>
            Forme.rotatePoint(v.x, v.y, rectCenterX, rectCenterY, this.theta || 0)
        );

        // Vérifier d'abord si un des points du segment est dans le rectangle
        const p1Inside = isPointInRotatedRectangle(this, linePoint1);
        const p2Inside = isPointInRotatedRectangle(this, linePoint2);

        // Si les deux points sont dedans, le segment est entièrement dans le rectangle
        if (p1Inside && p2Inside) {
            return true;
        }

        // Vérifier si le segment coupe l'une des 4 arêtes du rectangle
        for (let i = 0; i < 4; i++) {
            const edgeStart = rotatedRectVertices[i];
            const edgeEnd = rotatedRectVertices[(i + 1) % 4];

            if (Forme.#segmentsIntersect(linePoint1, linePoint2, edgeStart, edgeEnd)) {
                return true;
            }
        }

        // Si un point est dedans et l'autre dehors, le segment coupe forcément
        if (p1Inside !== p2Inside) {
            return true;
        }

        // Vérifier si la droite infinie (prolongement du segment) coupe le rectangle rotaté
        // Pour cela, on transforme le segment dans le repère du rectangle non-rotaté
        const dx = linePoint2.x - linePoint1.x;
        const dy = linePoint2.y - linePoint1.y;

        // Si le segment est un point
        if (dx === 0 && dy === 0) {
            return p1Inside;
        }

        // Transformer les points du segment dans le repère non-rotaté du rectangle
        const linePoint1Rotated =
            Forme.rotatePoint(linePoint1.x, linePoint1.y, rectCenterX, rectCenterY, -(this.theta || 0));
        const linePoint2Rotated =
            Forme.rotatePoint(linePoint2.x, linePoint2.y, rectCenterX, rectCenterY, -(this.theta || 0));

        // Maintenant, vérifier si le segment (dans le repère non-rotaté) coupe le rectangle (non-rotaté)
        // Le rectangle non-rotaté va de minX à maxX et de minY à maxY

        // Calculer la direction du segment dans le repère non-rotaté
        const dxRot = linePoint2Rotated.x - linePoint1Rotated.x;
        const dyRot = linePoint2Rotated.y - linePoint1Rotated.y;

        // Vérifier si la droite infinie coupe le rectangle en testant les 4 coins du rectangle non-rotaté
        const rectCorners = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
        ];

        let cornersOnSameSide = true;
        let firstCornerSide = null;

        for (const corner of rectCorners) {
            // Calculer de quel côté de la droite se trouve le coin
            const side = (corner.x - linePoint1Rotated.x) * dyRot - (corner.y - linePoint1Rotated.y) * dxRot;

            if (firstCornerSide === null) {
                firstCornerSide = side > 0 ? 1 : (side < 0 ? -1 : 0);
            } else {
                const currentSide = side > 0 ? 1 : (side < 0 ? -1 : 0);
                if (currentSide !== 0 && firstCornerSide !== 0 && currentSide !== firstCornerSide) {
                    cornersOnSameSide = false;
                    break;
                }
            }
        }

        // Si les coins ne sont pas tous du même côté, la droite coupe le rectangle
        if (!cornersOnSameSide) {
            // Vérifier que le segment lui-même intersecte la bounding box du rectangle non-rotaté
            const segMinX = Math.min(linePoint1Rotated.x, linePoint2Rotated.x);
            const segMaxX = Math.max(linePoint1Rotated.x, linePoint2Rotated.x);
            const segMinY = Math.min(linePoint1Rotated.y, linePoint2Rotated.y);
            const segMaxY = Math.max(linePoint1Rotated.y, linePoint2Rotated.y);

            if (maxX >= segMinX && minX <= segMaxX && maxY >= segMinY && minY <= segMaxY) {
                return true;
            }
        }

        return false;
    }

    /**
     * Vérifie si un segment de droite (défini par deux points) coupe un hexagone
     * @param {Object} linePoint1 - Premier point du segment de droite {x, y}
     * @param {Object} linePoint2 - Deuxième point du segment de droite {x, y}
     * @param {Object} hexagon - Hexagone avec {x, y} (centre)
     * @returns {boolean} - true si le segment coupe l'hexagone
     */
    static lineIntersectsHexagon(linePoint1, linePoint2, hexagon) {
        // Sous-fonction : Vérifie si un point est dans un hexagone
        function isPointInHexagon(point, hexagon) {
            const dx = point.x - hexagon.x;
            const dy = point.y - hexagon.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= hexSize;
        }

        // Obtenir les 6 sommets de l'hexagone
        const hexVertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexVertices.push({
                x: hexagon.x + hexSize * Math.cos(angle),
                y: hexagon.y + hexSize * Math.sin(angle)
            });
        }

        // Vérifier si le segment coupe l'une des 6 arêtes de l'hexagone
        for (let i = 0; i < 6; i++) {
            const edgeStart = hexVertices[i];
            const edgeEnd = hexVertices[(i + 1) % 6];

            if (Forme.#segmentsIntersect(linePoint1, linePoint2, edgeStart, edgeEnd)) {
                return true;
            }
        }

        // Vérifier aussi si les deux points du segment sont de part et d'autre de l'hexagone
        // On vérifie si un point est à l'intérieur et l'autre à l'extérieur
        const p1Inside = isPointInHexagon(linePoint1, hexagon);
        const p2Inside = isPointInHexagon(linePoint2, hexagon);

        // Si un point est dedans et l'autre dehors, le segment coupe forcément
        if (p1Inside !== p2Inside) {
            return true;
        }

        // Si les deux points sont dedans, le segment est entièrement dans l'hexagone
        if (p1Inside && p2Inside) {
            return true;
        }

        return false;
    }

    /**
     * Vérifie si un hexagone coupe un rectangle (avec rotation)
     * @param {Object} hexagon - Hexagone avec {x, y} (centre de l'hexagone)
     * @returns {boolean} - true si l'hexagone coupe le rectangle
     */
    hexagonIntersectsRectangle(hexagon) {
        // Sous-fonction : Vérifie si un point est dans un hexagone
        function isPointInHexagon(point, hexCenter) {
            // Calculer les 6 sommets de l'hexagone
            let points = [];
            for (let i = 0; i < 6; i++) {
                let angle = (Math.PI / 3) * i;
                let dx = hexCenter.x + hexSize * Math.cos(angle);
                let dy = hexCenter.y + hexSize * Math.sin(angle);
                points.push({ x: dx, y: dy });
            }

            // Ray casting : tirer un rayon horizontal vers la droite et compter les intersections
            let inside = false;
            const epsilon = 0.0001;

            for (let i = 0, j = 5; i < 6; j = i++) {
                const xi = points[i].x, yi = points[i].y;
                const xj = points[j].x, yj = points[j].y;

                if (Math.abs(yi - yj) < epsilon) continue;

                const yiAbove = yi > point.y + epsilon;
                const yjAbove = yj > point.y + epsilon;
                const yOverlap = (yiAbove !== yjAbove);

                if (yOverlap) {
                    const t = (point.y - yi) / (yj - yi);
                    const xIntersect = xi + t * (xj - xi);

                    if (point.x < xIntersect - epsilon) inside = !inside;
                }
            }

            return inside;
        }

        // Sous-fonction : Vérifie si un point est dans un rectangle rotaté
        function isPointInRotatedRectangle(rect, point) {
            const minX = Math.min(rect.x, rect.x + rect.width);
            const maxX = Math.max(rect.x, rect.x + rect.width);
            const minY = Math.min(rect.y, rect.y + rect.height);
            const maxY = Math.max(rect.y, rect.y + rect.height);

            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;
            const rp = Forme.rotatePoint(point.x, point.y, cx, cy, -(rect.theta || 0));

            return (rp.x >= minX && rp.x <= maxX && rp.y >= minY && rp.y <= maxY);
        }

        // Obtenir les 6 sommets de l'hexagone
        const hexVertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            hexVertices.push({
                x: hexagon.x + hexSize * Math.cos(angle),
                y: hexagon.y + hexSize * Math.sin(angle)
            });
        }

        // Vérifier si au moins un sommet de l'hexagone est dans le rectangle
        for (const vertex of hexVertices) {
            if (isPointInRotatedRectangle(this, vertex)) {
                return true;
            }
        }

        // Vérifier si le centre de l'hexagone est dans le rectangle
        if (isPointInRotatedRectangle(this, hexagon)) {
            return true;
        }

        // Obtenir les 4 sommets du rectangle (dans le repère non-rotaté)
        const minX = Math.min(this.x, this.x + this.width);
        const maxX = Math.max(this.x, this.x + this.width);
        const minY = Math.min(this.y, this.y + this.height);
        const maxY = Math.max(this.y, this.y + this.height);

        const rectCenterX = (minX + maxX) / 2;
        const rectCenterY = (minY + maxY) / 2;

        const rectVertices = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
        ];

        // Transformer les sommets du rectangle selon la rotation
        const rotatedRectVertices = rectVertices.map(v =>
            Forme.rotatePoint(v.x, v.y, rectCenterX, rectCenterY, this.theta || 0)
        );

        // Vérifier si au moins un sommet du rectangle est dans l'hexagone
        for (const vertex of rotatedRectVertices) {
            if (isPointInHexagon(vertex, hexagon)) {
                return true;
            }
        }

        // Vérifier si les arêtes de l'hexagone coupent les arêtes du rectangle
        for (let i = 0; i < 6; i++) {
            const hexEdgeStart = hexVertices[i];
            const hexEdgeEnd = hexVertices[(i + 1) % 6];

            for (let j = 0; j < 4; j++) {
                const rectEdgeStart = rotatedRectVertices[j];
                const rectEdgeEnd = rotatedRectVertices[(j + 1) % 4];

                if (Forme.#segmentsIntersect(hexEdgeStart, hexEdgeEnd, rectEdgeStart, rectEdgeEnd)) {
                    return true;
                }
            }
        }

        return false;
    }
}

// === VARIABLES GLOBALES ===

let Formes = []; // Tableau contenant toutes les formes dessinées
let SelectRectangle = new Forme("Rectangle", { color: "rgb(64, 64, 255)" }); // Rectangle de sélection

// === ÉVÉNEMENTS D'INTERFACE ===

// Clic droit sur le bouton rectangle : ouvre le dialogue de dimensions
document.getElementById("rectangle").addEventListener("contextmenu", function (event) {
    event.preventDefault();
    afficher_dim_rectangle();
});

// Clic droit sur le bouton mur : ouvre le dialogue de dimensions
document.getElementById("mur").addEventListener("contextmenu", function (event) {
    event.preventDefault();
    afficher_dim_mur();
});

// Clic droit sur le bouton ellipse : ouvre le dialogue de dimensions
document.getElementById("ellipse").addEventListener("contextmenu", function (event) {
    event.preventDefault();
    afficher_dim_ellipse();
});
/**
 * FICHIER MAP.JS
 * ===============
 * Gestion de la carte hexagonale et des pions pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour l'affichage, la manipulation et l'interaction avec la carte
 */

// === RÉFÉRENCES DOM ===
// Éléments d'interface utilisateur
const tooltip = document.getElementById("tooltip");           // Tooltip pour afficher des informations
const canvas_color = document.getElementById("canvas_color"); // Sélecteur de couleur pour le canvas
const forme_color = document.getElementById("forme_color");     // Sélecteur de couleur pour les formes
const canvas = document.getElementById("hexCanvas");          // Canvas principal pour la carte
const canvas_selected = document.getElementById("hexCanvas_selected"); // Canvas pour les sélections

// === PARAMÈTRES DE LA CARTE ===
// Dimensions et espacement des hexagones
let hexDimensionsX = 20;                    // Largeur de la carte en hexagones
let hexDimensionsY = 20;                    // Hauteur de la carte en hexagones
let hexSize = 40;                           // Taille des hexagones en pixels
let hexWidth = Math.sqrt(3) * hexSize;      // Largeur d'un hexagone
let hexHeight = 2 * hexSize;                 // Hauteur d'un hexagone
let hexHSpacing = hexSize * 1.5;            // Espacement horizontal entre hexagones
let hexVSpacing = hexHeight * Math.sqrt(3) / 2; // Espacement vertical entre hexagones

// === VARIABLES DE POSITION ET INTERACTION ===
let offsetX = canvas.width / 2;             // Décalage horizontal initial (centre de l'écran)
let offsetY = canvas.height / 2;            // Décalage vertical initial (centre de l'écran)

// États de glissement (dragging)
let isDragging_select = false;              // Glissement pour sélection
let isDragging_left = false;                // Glissement avec clic gauche
let isDragging_right = false;               // Glissement avec clic droit

// Modes d'interaction
let isMode_terrain = false;                 // Mode placement de terrain
let isMode_forme = false;                   // Mode placement de formes
let type_terrain = "";                      // Type de terrain sélectionné
let type_forme = "";                        // Type de forme sélectionné
let old_forme = "";                         // Ancien type de forme

// Variables de position et interface
let lastMouseX = 0, lastMouseY = 0;         // Dernière position de la souris
let last_forme_color = "#000000";           // Dernière couleur de forme utilisée
let default_cursor = "default";             // Curseur par défaut
let index_forme_zoom = null;                // Index de la forme en cours de zoom
let index_forme_move = null;                // Index de la forme en cours de déplacement
let sommet = null;                          // Sommet d'une forme en cours de modification
let hexMap = new Array;                     // Tableau contenant la grille d'hexagones

// === IMAGES DE TERRAIN ===
// images pour les différents types de terrain
const image_rocher = new Image();
image_rocher.src = "images/Rocher.png";
const image_arbre = new Image();
image_arbre.src = "images/Arbre.png";
const image_eau = new Image();
image_eau.src = "images/Eau.png";

// === IMAGES DE PIONS ===
// images pour les différents types de pions
const image_auto = new Image();
image_auto.src = "images/Auto.png";
const image_cac = new Image();
image_cac.src = "images/Cac.png";
const image_dist = new Image();
image_dist.src = "images/Dist.png";
const image_mage = new Image();
image_mage.src = "images/Mage.png";

// === IMAGES DE FOND ===
let image_fond = null;                       // Image de fond de la carte
let forme_fond = null;                       // Forme de fond

/**
 * Classe Map - Représente un élément sur la carte hexagonale
 * Peut être un pion (allié/ennemi) ou un terrain
 */
class Map {
    Type = "";          // Type : "allies", "ennemis" ou "terrains"
    Model = "";         // Modèle de personnage ou terrain
    Position = "0,0";    // Position en coordonnées hexagonales (Col, Row)
    Selected = false;    // État de sélection

    /**
     * Traite les messages reçus via WebSocket
     * @param {string} data - Message reçu du serveur
     */
    static receiveMessage(data) {
        // TODO : Implémenter le traitement des messages
    }

    /**
     * Vérifie si une case est visible par les alliés
     * @param {number} col - Colonne de la case à vérifier
     * @param {number} row - Ligne de la case à vérifier
     * @returns {boolean} - true si la case est visible
     */
    static is_visible(col, row) {
        let is_find = false;
        // Vérifier la visibilité pour chaque pion allié
        Pions.filter(x => x.Type === "allies").forEach(p => {
            const col_p = parseInt(p.Position.split(",")[0], 10);
            const row_p = parseInt(p.Position.split(",")[1], 10);

            // Vérifier la distance et la ligne de vue
            if (Map.distance(col_p, row_p, col, row) <= p.Vue &&
                p.ligne_de_vue(col, row)) {
                is_find = true;
            }
        });
        return is_find;
    }

    static get_ColRow(x, y) {
        // Calculer la colonne approximative
        // Utiliser Math.floor au lieu de Math.round pour les valeurs négatives pour éviter les arrondis incorrects
        let col;
        if (x >= 0) {
            col = Math.round(x / hexHSpacing);
        } else {
            // Pour les valeurs négatives, utiliser Math.ceil pour arrondir vers 0
            col = Math.ceil(x / hexHSpacing);
        }

        // Pour la ligne, on doit tenir compte du décalage des colonnes impaires
        // La formule inverse de get_XY : y = row * hexVSpacing + ((col % 2 != 0) ? hexVSpacing / 2 : 0)
        // Donc : row = (y - ((col % 2 != 0) ? hexVSpacing / 2 : 0)) / hexVSpacing
        const yAdjusted = y - ((col % 2 != 0) ? hexVSpacing / 2 : 0);
        let row;
        if (yAdjusted >= 0) {
            row = Math.round(yAdjusted / hexVSpacing);
        } else {
            // Pour les valeurs négatives, utiliser Math.ceil pour arrondir vers 0
            row = Math.ceil(yAdjusted / hexVSpacing);
        }

        return { col: col, row: row };
    }


    /**
     * Vérifie si un point (px, py) est à l'intérieur d'un hexagone centré en (cx, cy)
     * @param {number} px - Coordonnée X du point à tester
     * @param {number} py - Coordonnée Y du point à tester
     * @param {number} cx - Coordonnée X du centre de l'hexagone
     * @param {number} cy - Coordonnée Y du centre de l'hexagone
     * @returns {boolean} - true si le point est à l'intérieur de l'hexagone
     */
    static isPointInHexagon(px, py, cx, cy) {
        // Calculer les 6 sommets de l'hexagone (même orientation que drawHexagon)
        let points = [];
        for (let i = 0; i < 6; i++) {
            let angle = (Math.PI / 3) * i;
            let dx = cx + hexSize * Math.cos(angle);
            let dy = cy + hexSize * Math.sin(angle);
            points.push({ x: dx, y: dy });
        }

        // Pour les points entre les deux rayons, utiliser le ray casting
        // Ray casting : tirer un rayon horizontal vers la droite et compter les intersections
        let inside = false;
        const epsilon = 0.0001; // Tolérance pour les comparaisons flottantes

        for (let i = 0, j = 5; i < 6; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;

            // Ignorer les arêtes horizontales (pas d'intersection avec un rayon horizontal)
            if (Math.abs(yi - yj) < epsilon) continue;

            // Vérifier si le rayon horizontal du point intersecte cette arête
            // L'arête doit chevaucher la ligne y = py (un sommet strictement au-dessus, l'autre strictement en-dessous)
            const yiAbove = yi > py + epsilon;
            const yjAbove = yj > py + epsilon;
            const yOverlap = (yiAbove !== yjAbove);

            if (yOverlap) {
                // Calculer l'intersection x de l'arête avec la ligne y = py
                const t = (py - yi) / (yj - yi);
                const xIntersect = xi + t * (xj - xi);

                // Le rayon part de (px, py) vers la droite, donc on vérifie si px < xIntersect
                if (px < xIntersect - epsilon) inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Convertit les coordonnées hexagonales (col, row) en coordonnées pixels (x, y)
     * @param {number} col - Colonne de l'hexagone
     * @param {number} row - Ligne de l'hexagone
     * @returns {Object} - {x, y} coordonnées en pixels
     */
    static get_XY(col, row) {
        const x = col * hexHSpacing;
        const y = row * hexVSpacing + ((col % 2 != 0) ? hexVSpacing / 2 : 0);
        return { x: x, y: y };
    }

    /**
     * Calcule la position de la souris sur le canvas en tenant compte du border et de l'échelle
     * @param {MouseEvent} event - Événement de souris
     * @returns {Object} - {x, y} coordonnées ajustées
     */
    static getMousePosition(event) {
        const rect = canvas.getBoundingClientRect();
        // Prendre en compte le border du canvas (1px de chaque côté)
        const borderWidth = 1; // canvas.style.borderWidth;
        let mouseX = event.clientX - rect.left - borderWidth;
        let mouseY = event.clientY - rect.top - borderWidth;

        // Vérifier si le canvas a une échelle différente (si width/height CSS != width/height canvas)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Ajuster les coordonnées si nécessaire
        return {
            x: mouseX * scaleX,
            y: mouseY * scaleY
        };
    }

    /**
     * Trouve l'hexagone contenant le point (px, py) en tenant compte de l'offset
     * @param {number} px - Coordonnée X du point (en pixels, relative au canvas)
     * @param {number} py - Coordonnée Y du point (en pixels, relative au canvas)
     * @returns {Object} - {col, row} de l'hexagone trouvé
     */
    static getHexagonAtPoint(px, py) {
        // Convertir les coordonnées en tenant compte de l'offset
        const x = px - offsetX;
        const y = py - offsetY;

        // Trouver l'hexagone le plus proche en utilisant get_ColRow pour être cohérent
        const colRow = Map.get_ColRow(x, y);
        const col = colRow.col;
        const row = colRow.row;

        // Tester une zone de 3x3 hexagones autour du point calculé
        // pour s'assurer de ne pas manquer l'hexagone correct à cause d'arrondis
        const candidates = [];

        // Ajouter l'hexagone principal et tous les hexagones dans un rayon de 1
        for (let dcol = -1; dcol <= 1; dcol++) {
            for (let drow = -1; drow <= 1; drow++) {
                candidates.push({ col: col + dcol, row: row + drow });
            }
        }

        // Trier les candidats par distance au centre de l'hexagone pour tester le plus proche en premier
        candidates.sort((a, b) => {
            const aXY = Map.get_XY(a.col, a.row);
            const bXY = Map.get_XY(b.col, b.row);
            const dist1 = Math.sqrt((aXY.x - x) ** 2 + (aXY.y - y) ** 2);
            const dist2 = Math.sqrt((bXY.x - x) ** 2 + (bXY.y - y) ** 2);
            return dist1 - dist2;
        });

        // Tester les candidats triés par distance
        let bestCandidate = null;
        let bestDistance = Infinity;

        for (const candidate of candidates) {
            const hexXY = Map.get_XY(candidate.col, candidate.row);
            const hexCenterX = hexXY.x + offsetX;
            const hexCenterY = hexXY.y + offsetY;

            const isIn = Map.isPointInHexagon(px, py, hexCenterX, hexCenterY);
            const dist = Math.sqrt((px - hexCenterX) ** 2 + (py - hexCenterY) ** 2);

            if (isIn && dist < bestDistance) {
                bestDistance = dist;
                bestCandidate = candidate;
            }
        }

        if (bestCandidate) {
            return bestCandidate;
        }

        // Si aucun hexagone ne contient le point, retourner l'hexagone initial
        return { col: col, row: row };
    }

    /**
     * Calcule la distance entre deux hexagones
     * @param {number} col1 - Colonne du premier hexagone
     * @param {number} row1 - Ligne du premier hexagone
     * @param {number} col2 - Colonne du deuxième hexagone
     * @param {number} row2 - Ligne du deuxième hexagone
     * @returns {number} - Distance entre les deux hexagones
     */
    static distance(col1, row1, col2, row2) {
        // Conversion des coordonnées hexagonales en coordonnées cartésiennes
        // Le pas est de 3 mètres entre les hexagones.
        const x1 = col1 * (3 / 2);
        const y1 = row1 * (Math.sqrt(3)) + (Math.abs(col1) % 2) * (Math.sqrt(3) / 2);
        const x2 = col2 * (3 / 2);
        const y2 = row2 * (Math.sqrt(3)) + (Math.abs(col2) % 2) * (Math.sqrt(3) / 2);

        // Calcul de la distance euclidienne
        const dist = 3 * Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / Math.sqrt(3);

        return Math.round(100 * dist) / 100;
    }

    /**
     * Génère la grille d'hexagones de la carte
     * Crée un tableau contenant toutes les cases hexagonales avec leurs propriétés
     */
    static generateHexMap() {
        hexMap = new Array;

        // Parcours de toutes les cases de la grille
        for (let row = -hexDimensionsY; row < hexDimensionsY + 1; row++) {
            for (let col = -hexDimensionsX; col < hexDimensionsX + 1; col++) {
                // Calcul de la position en pixels
                let x = col * hexHSpacing;
                let y = row * hexVSpacing + ((col % 2 != 0) ? hexVSpacing / 2 : 0);

                // Propriétés par défaut de la case
                let color = "rgb(192, 192, 192)"; // Couleur de brouillard
                let strie = false;                 // Pas de striage par défaut
                let brouillard = !Map.is_visible(col, row); // Brouillard si non visible

                // Si la case est visible (pas de brouillard)
                if (!brouillard) {
                    color = "rgb(255, 255, 255)";
                    Terrains.filter(t => t.Position === col + "," + row).forEach(t => {
                        if (t.Model === "Rocher") color = "rgb(128, 128, 128)";
                        else if (t.Model === "Arbre") color = "rgb(128, 255, 128)";
                        else if (t.Model === "Eau") color = "rgb(0, 255, 255)";
                    });
                    Pions.filter(p => p.Position === col + "," + row).forEach(p => {
                        if (p.Type === "ennemis") strie = true;
                        if (p.Attaquant) color = "rgb(255, 0, 0)";
                        else if (p.Defenseur) color = "rgb(0, 0, 255)";
                        else if (p.Selected && p.Type === "allies") color = "rgb(192, 192, 255)";
                        else if (p.Selected && p.Type === "ennemis") color = "rgb(255, 192, 192)";
                    });
                }

                hexMap.push({ x, y, col, row, color, strie, brouillard });
            }
        }
    }

    // On dessine un hexagone.
    static drawHexagon(x, y, color, strie, text, brouillard, selected = false) {
        if (selected) {
            const ctx = canvas_selected.getContext("2d");

            // Utiliser les mêmes dimensions que le canvas principal
            // canvas_selected.width = canvas.width;
            // canvas_selected.height = canvas.height;

            // Repositionner le canvas_selected pour qu'il se superpose exactement au canvas principal
            // canvas_selected.style.left = "0px";
            // canvas_selected.style.top = "0px";

            // On dessine l'image au centre de l'hexagone
            const imgSize = hexSize * 1.2;
            const p = Pions.find(q => q.Selected && q.Position === text);
            if (p != null && typeof p != "undefined") {
                const m = Models.find(x => x.Nom === p.Model);
                ctx.drawImage(m.Image, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
            }
            return;
        }

        const ctx = canvas.getContext("2d");

        // On enregistre et dessine les sommets des hexagones.
        ctx.beginPath();
        let points = [];
        for (let i = 0; i < 6; i++) {
            let angle = (Math.PI / 3) * i;
            let dx = x + hexSize * Math.cos(angle);
            let dy = y + hexSize * Math.sin(angle);
            points.push({ dx, dy });
            ctx.lineTo(dx, dy);
        }
        ctx.closePath();

        // On remplit de la couleur indiquée, si ce n'est pas du blanc.
        if (color != "rgb(255, 255, 255)") {
            if (document.getElementById("joueur").value !== "MJ") {
                ctx.fillStyle = color;
                ctx.fill();
            }
            else {
                if (brouillard) ctx.globalAlpha = 0.8;
                ctx.fillStyle = color;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        // On dessine le contour de l'hexagone.
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        // On dessine l'image au centre de l'hexagone
        if (!brouillard || document.getElementById("joueur").value === "MJ") {
            if (strie) {
                // On définit un clip pour ne dessiner que dans l'hexagone
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(points[0].dx, points[0].dy);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].dx, points[i].dy);
                }
                ctx.closePath();
                ctx.clip();

                // On strie l'hexagone dans le clip
                const spacing = Math.round(hexSize / 8);
                const minX = Math.min(...points.map(p => p.dx)) - spacing;
                const maxX = Math.max(...points.map(p => p.dx)) + spacing;
                const minY = Math.min(...points.map(p => p.dy)) - spacing;
                const maxY = Math.max(...points.map(p => p.dy)) + spacing;
                ctx.beginPath();
                ctx.strokeStyle = "gray";
                ctx.lineWidth = 1;
                for (let x = minX - (maxY - minY); x <= maxX; x += spacing) {
                    ctx.moveTo(x, minY);
                    ctx.lineTo(x + (maxY - minY), maxY);
                }
                ctx.stroke();
                ctx.restore(); // Supprime le clip
            }

            // On dessine l'image au centre de l'hexagone
            const imgSize = hexSize * 1.2;
            const p = Pions.find(q => q.Position === text);
            const t = Terrains.find(r => r.Position === text)
            if (p != null && typeof p != "undefined") {
                const m = Models.find(n => n.Nom === p.Model);
                ctx.drawImage(m.Image, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
                if (p.Cac) ctx.drawImage(image_cac, x + hexSize - imgSize / 3.3, y - imgSize / 8, imgSize / 4, imgSize / 4);
                if (p.Dist) ctx.drawImage(image_dist, x + hexSize * Math.cos(Math.PI / 3) - imgSize / 4.5, y - hexSize * Math.sin(Math.PI / 3), imgSize / 3, imgSize / 3);
                if (p.Mage) ctx.drawImage(image_mage, x + hexSize * Math.cos(2 * Math.PI / 3) - imgSize / 9, y - hexSize * Math.sin(2 * Math.PI / 3), imgSize / 3, imgSize / 3);
                if (p.Auto) ctx.drawImage(image_auto, x - hexSize + imgSize / 24, y - imgSize / 6, imgSize / 3, imgSize / 3);
            }
            else if (t != null && typeof t != "undefined" && t.Model === "Rocher") {
                ctx.drawImage(image_rocher, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
            }
            else if (t != null && typeof t != "undefined" && t.Model === "Arbre") {
                ctx.drawImage(image_arbre, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
            }
            else if (t != null && typeof t != "undefined" && t.Model === "Eau") {
                ctx.drawImage(image_eau, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
            }

            // On ajoute l'indice sur l'image le cas échéant
            if (p != null && typeof p != "undefined" && p.Indice != 0) {
                ctx.fillStyle = "black";
                ctx.font = `Bold ${hexSize / 3}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(p.Indice, x, y + 0.63 * imgSize);
            }
        }
    }

    /**
     * Dessine la carte hexagonale complète
     * @param {boolean} selected - Si true, dessine sur le canvas de sélection
     */
    static drawHexMap(selected = false) {
        function get_height() {
            let h = window.innerHeight;
            h -= document.getElementById("div_cartouche").offsetHeight;
            h -= document.getElementById("table_dialogue").offsetHeight;
            h -= document.getElementById("div_tools").offsetHeight;
            h -= 28;
            return h;
        }

        if (selected) {
            const ctx = canvas_selected.getContext("2d");

            // Utiliser les mêmes dimensions que le canvas principal
            canvas_selected.width = canvas.width;
            canvas_selected.height = canvas.height;

            // Repositionner le canvas_selected pour qu'il se superpose exactement au canvas principal
            const combatDiv = document.getElementById("combat");
            if (combatDiv) {
                const combatRect = combatDiv.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();

                // Position relative du canvas par rapport au conteneur #combat
                const relativeLeft = canvasRect.left - combatRect.left;
                const relativeTop = canvasRect.top - combatRect.top;

                canvas_selected.style.left = relativeLeft + "px";
                canvas_selected.style.top = relativeTop + "px";
            }

            ctx.clearRect(0, 0, canvas_selected.width, canvas_selected.height);
            hexMap.forEach(hex => {
                Map.drawHexagon(hex.x + offsetX, hex.y + offsetY,
                    null, null, `${hex.col},${hex.row}`, null, true);
            });
            return;
        }

        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = get_height();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chargement de la carte de fond
        if (image_fond != null) ctx.drawImage(image_fond, forme_fond.x, forme_fond.y, forme_fond.width, forme_fond.height);

        hexMap.forEach(hex => {
            Map.drawHexagon(hex.x + offsetX, hex.y + offsetY,
                hex.color, hex.strie, `${hex.col},${hex.row}`, hex.brouillard);
        });

        if (isMode_forme && type_forme === "ellipse") {
            // Dessiner l'ellipse de sélection par-dessus les hexagones
            ctx.beginPath();
            ctx.ellipse(SelectRectangle.x, // x
                SelectRectangle.y, // y
                Math.abs(SelectRectangle.width) / 2, // rayonX
                Math.abs(SelectRectangle.height) / 2, // rayonY
                0, // rotation
                0, // Angle de départ
                Math.PI * 2); // Angle final
            ctx.strokeStyle = SelectRectangle.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        else {
            // Dessiner le rectangle de sélection par-dessus les hexagones
            ctx.beginPath();
            ctx.strokeStyle = SelectRectangle.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(SelectRectangle.x, SelectRectangle.y, SelectRectangle.width, SelectRectangle.height);
        }

        // Dessine les formes rectangulaires de l'utilisateur
        Formes.filter(x => x.type === "Rectangle" || x.type === "Mur").forEach(r => {
            ctx.save();
            ctx.beginPath();
            ctx.translate(r.x + r.width / 2, r.y + r.height / 2);
            ctx.rotate(r.theta);
            ctx.lineWidth = 5;
            if (r.type === "Mur") {
                ctx.fillStyle = r.color;
                ctx.fillRect(- r.width / 2, - r.height / 2, r.width, r.height);
            }
            else {
                ctx.strokeStyle = r.color;
                ctx.strokeRect(- r.width / 2, - r.height / 2, r.width, r.height);
            }
            ctx.restore();
        });

        // Dessine les formes elliptiques de l'utilisateur
        Formes.filter(x => x.type === "Ellipse").forEach(e => {
            ctx.save();
            ctx.beginPath();
            ctx.translate(e.x, e.y);
            ctx.rotate(e.theta);
            ctx.strokeStyle = e.color;
            ctx.lineWidth = 5;
            ctx.ellipse(
                0, // x
                0, // y
                Math.abs(e.width) / 2, // rayonX
                Math.abs(e.height) / 2, // rayonY
                0, // rotation
                0, // Angle de départ
                Math.PI * 2); // Angle final
            ctx.stroke();
            ctx.restore();
        });
    }

    /**
     * Met à jour le tooltip avec les informations de la case survolée
     * @param {number} col - Colonne de la case
     * @param {number} row - Ligne de la case
     */
    static update_tooltip(col, row) {
        const p = Pions.find(x => x.Position === col + "," + row);

        // Masquer le tooltip en mode forme ou terrain
        if (isMode_forme || isMode_terrain) {
            tooltip.style.display = "none";
            return;
        }
        tooltip.style.display = "block";

        // Afficher le titre du pion si visible
        if (p != null && typeof p != "undefined" && Map.is_visible(col, row)) {
            tooltip.innerHTML = p.Titre + "<br>";
        }
        else tooltip.innerHTML = "";

        // Calculer et afficher la distance depuis le pion sélectionné
        const p_sel = Pions.find(x => x.Selected);
        if (p_sel != null && typeof p_sel != "undefined") {
            const c_sel = p_sel.Position.split(",")[0];
            const r_sel = p_sel.Position.split(",")[1];
            tooltip.innerHTML += "(" + Map.distance(c_sel, r_sel, col, row) + " m)";
        }
        else {
            tooltip.innerHTML += "(--)";
        }
    }
}

/**
 * Classe Terrain - Hérite de Map pour représenter les éléments de terrain
 * Gère les rochers, arbres, eau, etc. sur la carte
 */
class Terrain extends Map {

    /**
     * Constructeur d'un terrain
     * @param {string} type_terrain - Type de terrain (rocher, arbre, eau, etc.)
     * @param {string} pos - Position en coordonnées hexagonales
     */
    constructor(type_terrain, pos) {
        super();
        this.Type = "terrains";
        this.Model = type_terrain.substring(0, 1).toUpperCase() + type_terrain.substring(1);
        this.Position = pos;
        this.Selected = false;
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
            const index = Terrains.indexOf(t);
            Terrains.splice(index, 1);
        }
        else if (t != null && typeof t != "undefined") {
            t.Model = type_terrain.substring(0, 1).toUpperCase() + type_terrain.substring(1);
        }
        else if (type_terrain != "gomme") {
            t = new Terrain(type_terrain, pos);
            Terrains[Terrains.length] = t;
        }

        if (document.getElementById("joueur").value === "MJ") t.sendMessage("Add");

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Supprime le terrain de la carte
     */
    rmv() {
        const index = Terrains.indexOf(this);
        if (document.getElementById("joueur").value === "MJ") this.sendMessage("Rmv");

        Terrains.splice(index, 1);

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Active/désactive le mode de placement de terrain
     * @param {string} terrain - Type de terrain ("rocher", "arbre", "eau", "gomme")
     */
    static set_terrain(terrain) {
        document.getElementById("rectangle").style.border = "none";
        document.getElementById("ellipse").style.border = "none";
        document.getElementById("mur").style.border = "none";
        document.getElementById("scission").style.border = "none";
        document.getElementById("gomme_f").style.border = "none";
        isMode_forme = false;
        type_forme = "";

        if (terrain != "rocher")
            document.getElementById("rocher").style.border = "none";
        if (terrain != "arbre")
            document.getElementById("arbre").style.border = "none";
        if (terrain != "eau")
            document.getElementById("eau").style.border = "none";
        if (terrain != "gomme")
            document.getElementById("gomme_t").style.border = "none";

        let type = terrain;
        if (terrain === "gomme") type = "gomme_t";

        if (document.getElementById(type).style.border === "2px solid black") {
            document.getElementById(type).style.border = "none";
            default_cursor = "default";
            canvas.style.cursor = default_cursor;
            isMode_terrain = false;
            type_terrain = "";
            return;
        }
        else
            document.getElementById(type).style.border = "2px solid black";

        switch (terrain) {
            case "rocher":
                default_cursor = "url('images/Rocher.png') 24 24, auto";
                break;
            case "arbre":
                default_cursor = "url('images/Arbre.png') 24 24, auto";
                break;
            case "eau":
                default_cursor = "url('images/Eau.png') 24 24, auto";
                break;
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

    // === PROPRIÉTÉS DE PERSONNAGE ===
    Titre = "";              // Titre affiché du personnage
    Arme1 = "";              // Arme principale
    Arme2 = "";              // Arme secondaire
    Nom_liste = "";          // Liste du sortilège sélectionnée
    Nom_sort = "";           // Sortilège sélectionné (dans la liste)
    Note = "";               // Note personnalisée

    // === CAPACITÉS SPÉCIALES ===
    Auto = false;            // Mode automatique (booléen)
    Mage = false;            // Magicien (booléen)
    Cac = false;             // Combattant au corps à corps (booléen)
    Dist = false;            // Combattant à distance (booléen)

    // === POINTS DE VIE & Co ===
    Fatigue = 0;             // Niveau de fatigue
    Fatigue_down = 0;        // Nombre de points de fatigue perdus durant le round
    Fatigue_eco = false;     // Booléen indiquant si la fatigue est économisée au corps à corps
    Concentration = 0;       // Niveau de concentration
    Pdv = 0;                 // Points de vie totaux
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

    // === BONUS DE COMBAT ===
    B_fdc = 0;               // Bonus de force de caractère
    B_ini = 0;               // Bonus d'initiative
    B_att = 0;               // Bonus d'attaque
    B_dom = 0;               // Bonus de dommages
    Vue = 30;                // Portée de vision

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

        const m = Models.find(x => x.Nom === this.Model);

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

        this.Arme1 = m.Arme_1;

        this.Fatigue = m.Fatigue;
        this.Concentration = m.Concentration;
        this.Pdv = m.Pdv;
        this.Tete = m.Tete;
        this.Poitrine = m.Poitrine;
        this.Abdomen = m.Abdomen;
        this.Brasg = m.Brasg;
        this.Brasd = m.Brasd;
        this.Jambeg = m.Jambeg;
        this.Jambed = m.Jambed;
        this.Armure_tete = m.Armure_tete;
        this.Armure_poitrine = m.Armure_poitrine;
        this.Armure_abdomen = m.Armure_abdomen;
        this.Armure_brasg = m.Armure_brasg;
        this.Armure_brasd = m.Armure_brasd;
        this.Armure_jambeg = m.Armure_jambeg;
        this.Armure_jambed = m.Armure_jambed;
    }

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

    // On calcul l'armure générale (moyenne des différentes parties)
    armure_generale() {
        let a = 0;
        a += this.Armure_tete;
        a += this.Armure_poitrine;
        a += this.Armure_abdomen;
        a += this.Armure_brasg;
        a += this.Armure_brasd;
        a += this.Armure_jambeg;
        a += this.Armure_jambed;

        return Math.floor(a / 7);
    }

    // On duplique un pion de la carte.
    dupliquer() {
        const p = new Pion(this.Type, this.Model);
        const m = Models.find(x => x.Nom === this.Model);

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

    // On ajoute un pion sur la carte.
    static add(type, model, indice = -1) {
        let p = Pions.find(x => x.Type === type && x.Model === model && x.Indice === indice);
        if (p === null || typeof p === "undefined") {
            Pions[Pions.length] = new Pion(type, model, indice);
            p = Pions[Pions.length - 1];
        }

        Map.generateHexMap();
        Map.drawHexMap();

        return p;
    }

    // On retire un pion de la carte.
    rmv() {
        const index = Pions.indexOf(this);
        Pions.splice(index, 1);
        Map.generateHexMap();
        Map.drawHexMap();
    }

    // Renseigne sur le fait qu'un hexagone soit visible ou non du pion.
    ligne_de_vue(col, row) {
        // Sous-fonction donnant la liste des hexagones sur une ligne
        // function hexLine(start, end) {
        //     // Convertit (col, row) en coordonnées cubiques (q, r, s)
        //     function colRowToCube(col, row) {
        //         let q = col;
        //         let r = row - Math.floor(col / 2);
        //         let s = -q - r;
        //         return [q, r, s];
        //     }

        //     // Convertit (q, r, s) en coordonnées (col, row)
        //     function cubeToColRow(q, r) {
        //         let col = q;
        //         let row = r + Math.floor(q / 2);
        //         return [col, row];
        //     }

        //     // Interpolation linéaire entre a et b
        //     function lerp(a, b, t) {
        //         return a + (b - a) * t;
        //     }

        //     // Interpolation linéaire entre deux points cubiques
        //     function cubeLerp(a, b, t) {
        //         return [
        //             lerp(a[0], b[0], t),
        //             lerp(a[1], b[1], t),
        //             lerp(a[2], b[2], t)
        //         ];
        //     }

        //     // Arrondit les coordonnées cubiques vers l'hexagone le plus proche
        //     function roundCube(cube) {
        //         let [q, r, s] = cube;
        //         let rq = Math.round(q);
        //         let rr = Math.round(r);
        //         let rs = Math.round(s);

        //         let dq = Math.abs(rq - q);
        //         let dr = Math.abs(rr - r);
        //         let ds = Math.abs(rs - s);

        //         if (dq > dr && dq > ds) {
        //             rq = -rr - rs;
        //         } else if (dr > ds) {
        //             rr = -rq - rs;
        //         } else {
        //             rs = -rq - rr;
        //         }

        //         return [rq, rr, rs];
        //     }

        //     let startCube = colRowToCube(...start);
        //     let endCube = colRowToCube(...end);

        //     let n = Math.max(Math.abs(startCube[0] - endCube[0]),
        //         Math.abs(startCube[1] - endCube[1]),
        //         Math.abs(startCube[2] - endCube[2]));

        //     let hexes = [];

        //     for (let i = 0; i <= n; i++) {
        //         let t = i / n;
        //         let cube = cubeLerp(startCube, endCube, t);
        //         let roundedCube = roundCube(cube);
        //         let hex = cubeToColRow(...roundedCube);

        //         // Ajouter uniquement si non déjà présent
        //         if (!hexes.some(h => h[0] === hex[0] && h[1] === hex[1])) {
        //             hexes.push(hex);
        //         }
        //     }

        //     return hexes;
        // }

        // const start_col = parseInt(this.Position.split(",")[0], 10);
        // const start_row = parseInt(this.Position.split(",")[1], 10);
        // const startHex = [start_col, start_row];
        // const endHex = [col, row];

        // const results = hexLine(startHex, endHex);

        // let visible = true;

        // results.forEach(hex => {
        //     if (!visible) return;

        //     // Si le pion est sur la case de départ, on ne fait rien
        //     if (hex[0] === start_col && hex[1] === start_row) return;

        //     // Si le pion est sur la case d'arrivée, on ne fait rien
        //     if (hex[0] === col && hex[1] === row) return;

        //     // Vérification des terrains (si un terrain Rocher ou Arbre est sur le chemin, le pion ne voit pas la case)
        //     const t = Terrains.find(x => x.Model != "Eau" && x.Position === hex[0] + "," + hex[1]);
        //     if (t != null && typeof t != "undefined") visible = false;

        //     const x = hex[0] * hexHSpacing + offsetX;
        //     const y = hex[1] * hexVSpacing + ((hex[0] % 2 != 0) ? hexVSpacing / 2 : 0) + offsetY;
        //     const h = { x: x, y: y };

        //     // Vérification des murs (si un mur est sur le chemin, le pion ne voit pas la case)
        //     const m = Formes.find(r => r.type === "Mur" && Forme.rectangleHexagonIntersect(r, h));
        //     if (m != null && typeof m != "undefined") visible = false;
        // });

        // return visible;

        const start_col = this.Position.split(",")[0];
        const start_row = this.Position.split(",")[1];
        const start_x = start_col * hexHSpacing;
        const start_y = start_row * hexVSpacing + ((start_col % 2 != 0) ? hexVSpacing / 2 : 0);

        const end_col = col;
        const end_row = row;
        const end_x = end_col * hexHSpacing;
        const end_y = end_row * hexVSpacing + ((end_col % 2 != 0) ? hexVSpacing / 2 : 0);

        let is_visible = true;

        Terrains.filter(x => x.Model != "Eau").forEach(t => {
            if (!is_visible) return;

            const hex_col = t.Position.split(",")[0];
            const hex_row = t.Position.split(",")[1];
            const hex_x = hex_col * hexHSpacing;
            const hex_y = hex_row * hexVSpacing + ((hex_col % 2 != 0) ? hexVSpacing / 2 : 0);

            if (Forme.lineIntersectsHexagon({ x: start_x, y: start_y }, { x: end_x, y: end_y }, { x: hex_x, y: hex_y })) {
                is_visible = false;
            }
        });

        Formes.filter(x => x.type === "Mur").forEach(m => {
            if (!is_visible) return;

            if (m.lineIntersectsRectangle({ x: start_x + offsetX, y: start_y + offsetY }, { x: end_x + offsetX, y: end_y + offsetY })) {
                is_visible = false;
            }
        });

        return is_visible;
    }

    centrer() {
        const col = this.Position.split(",")[0];
        const row = this.Position.split(",")[1];

        let x = col * hexHSpacing;
        let y = row * hexVSpacing + ((col % 2 != 0) ? hexVSpacing / 2 : 0);

        offsetX = canvas.width / 2 - x;
        offsetY = canvas.height / 2 - y;
    }

    // Ouvre la fenetre de dialogue de modification d'un pion
    afficher_Details() {
        const col = this.Position.split(",")[0];
        const row = this.Position.split(",")[1];
        afficher_Details(col, row);
    }

    deplace_a(col_end, row_end) {
        const pos = this.Position.split(",");
        let col_start = parseInt(pos[0], 10);
        let row_start = parseInt(pos[1], 10);

        // Si le pion est déjà à la position d'arrivée, on ne fait rien
        if (col_start === col_end && row_start === row_end) return;

        // Si le pion est en combat, on ne peut pas se déplacer
        if (order_combats > -2) {
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
}
let Pions = new Array;

// ///////// //
// Listeners //
// ///////// //

// Click droit sur canvas : annulé
canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

let isMoving_map = false;

// Bouton de la souris abaissé
canvas.addEventListener("mousedown", (event) => {
    const myself = document.getElementById("joueur").value;

    canvas.focus({ preventScroll: true });

    const mousePos = Map.getMousePosition(event);
    const mouseX = mousePos.x;
    const mouseY = mousePos.y;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    // Convertir en coordonnées de grille
    const hex = Map.getHexagonAtPoint(mouseX, mouseY);
    const col = hex.col;
    const row = hex.row;

    const p = Pions.find(x => x.Position === col + "," + row);
    const t = Terrains.find(x => x.Position === col + "," + row);

    // Glisser gauche ou sinon droit en cours
    if (event.button === 0) isDragging_left = true;
    else if (event.button === 2) isDragging_right = true;

    // === GESTION DES CLICS GAUCHES ===
    if (event.button === 0 && p != null && typeof p != "undefined" && p.Defenseur && myself === "MJ") {
        // Clic gauche sur le défenseur choisi => on résout l'attaque
        Pions.forEach(x => { x.Defenseur = false; });
        p.Defenseur = true;
        afficher_attaque(1);
    }
    else if (event.button === 0 && isMode_terrain && type_terrain != "gomme") {
        // Mode terrain : ajout d'un terrain à la position cliquée
        Terrain.add(type_terrain, col + "," + row);
    }
    else if (event.button === 0 && isMode_terrain) {
        // Mode gomme : suppression du terrain à la position cliquée
        if (t != null && typeof t != "undefined") t.rmv();
    }
    else if (event.button === 0 && isMode_forme && type_forme === "scission") {
        // Si mode Scission: procéder à la scission du mur
        let is_find = false;
        Formes.filter(x => x.type === "Mur").forEach(r => {
            if (is_find) return;

            is_find = r.isOnMur(mouseX, mouseY);
            if (!is_find) return;

            // Calculer le centre du rectangle original
            const cx = r.x + r.width / 2;
            const cy = r.y + r.height / 2;

            // Transformer le point de la souris dans le repère local (centré, non-rotaté) du rectangle
            const mousePoint = Forme.rotatePoint(mouseX, mouseY, cx, cy, -r.theta);

            // Convertir en coordonnées locales centrées (comme fillRect(-width/2, -height/2, ...))
            const mouseX_local = mousePoint.x - cx;
            const mouseY_local = mousePoint.y - cy;

            const r1 = new Forme("Mur", { x: r.x, y: r.y, width: r.width, height: r.height, theta: r.theta, color: r.color });
            const r2 = new Forme("Mur", { x: r.x, y: r.y, width: r.width, height: r.height, theta: r.theta, color: r.color });

            // Calculer le coin supérieur gauche visuel de l'original
            // Le coin supérieur gauche local est (-width/2, -height/2) dans le repère centré
            const original_topLeft_local = { x: -r.width / 2, y: -r.height / 2 };
            const original_topLeft_global = Forme.rotatePoint(
                cx + original_topLeft_local.x,
                cy + original_topLeft_local.y,
                cx, cy, r.theta
            );

            if (r.width < r.height) {
                // Scission horizontale
                // Distance depuis le haut du rectangle (dans le repère local centré)
                const cutY_local = mouseY_local - (-r.height / 2);
                const r1_height = Math.max(0, cutY_local - hexSize);
                const r2_height = Math.max(0, r.height - r1_height - 2 * hexSize);

                // r1 : calculer son (x, y) pour que son coin supérieur gauche visuel = original
                // Le coin supérieur gauche local de r1 est (-width/2, -r1_height/2) dans son repère centré
                // On veut que ce point, après rotation de theta autour du centre de r1, soit à original_topLeft_global
                // On inverse : original_topLeft_global - rotate((-width/2, -r1_height/2), theta) = centre de r1
                const r1_topLeft_local = { x: -r.width / 2, y: -r1_height / 2 };
                // Rotation inverse du coin local pour trouver où doit être le centre
                const r1_topLeft_rotated = Forme.rotatePoint(
                    r1_topLeft_local.x,
                    r1_topLeft_local.y,
                    0, 0, r.theta
                );
                // Le centre de r1 dans le repère global
                const r1_centerX = original_topLeft_global.x - r1_topLeft_rotated.x;
                const r1_centerY = original_topLeft_global.y - r1_topLeft_rotated.y;
                // Le (x, y) de r1 dans le repère non-rotaté
                r1.x = r1_centerX - r.width / 2;
                r1.y = r1_centerY - r1_height / 2;
                r1.height = Math.abs(r1_height);
                r1.width = Math.abs(r.width);

                // Pour r2 : calculer son centre pour qu'il commence exactement où r1 se termine
                // Le coin inférieur de r1 dans le repère local centré est à y = -height/2 + r1_height
                // Le coin supérieur de r2 doit être à y = -height/2 + r1_height + 2*hexSize
                // Le centre de r2 dans le repère local centré est à y = -height/2 + r1_height + 2*hexSize + r2_height/2
                const r2_centerY_local = -r.height / 2 + r1_height + 2 * hexSize + r2_height / 2;
                const r2_centerX_local = 0; // Même x que l'original

                // Convertir le centre local de r2 en coordonnées globales (après rotation)
                const r2_center_global = Forme.rotatePoint(cx + r2_centerX_local, cy + r2_centerY_local, cx, cy, r.theta);

                // Le (x, y) de r2 dans le repère non-rotaté
                r2.x = r2_center_global.x - r.width / 2;
                r2.y = r2_center_global.y - r2_height / 2;
                r2.width = Math.abs(r.width);
                r2.height = Math.abs(r2_height);
            }
            else {
                // Scission verticale
                const cutX_local = mouseX_local - (-r.width / 2);
                const r1_width = Math.max(0, cutX_local - hexSize);
                const r2_width = Math.max(0, r.width - r1_width - 2 * hexSize);

                // r1 : calculer son (x, y) pour que son coin supérieur gauche visuel = original
                // Le coin supérieur gauche local de r1 est (-r1_width/2, -height/2) dans son repère centré
                const r1_topLeft_local = { x: -r1_width / 2, y: -r.height / 2 };
                // Rotation inverse du coin local pour trouver où doit être le centre
                const r1_topLeft_rotated = Forme.rotatePoint(
                    r1_topLeft_local.x,
                    r1_topLeft_local.y,
                    0, 0, r.theta
                );
                // Le centre de r1 dans le repère global
                const r1_centerX = original_topLeft_global.x - r1_topLeft_rotated.x;
                const r1_centerY = original_topLeft_global.y - r1_topLeft_rotated.y;
                // Le (x, y) de r1 dans le repère non-rotaté
                r1.x = r1_centerX - r1_width / 2;
                r1.y = r1_centerY - r.height / 2;
                r1.width = Math.abs(r1_width);
                r1.height = Math.abs(r.height);

                // Pour r2 : calculer son centre pour qu'il commence exactement où r1 se termine
                const r2_centerX_local = -r.width / 2 + r1_width + 2 * hexSize + r2_width / 2;
                const r2_centerY_local = 0; // Même y que l'original

                // Convertir le centre local de r2 en coordonnées globales (après rotation)
                const r2_center_global = Forme.rotatePoint(cx + r2_centerX_local, cy + r2_centerY_local, cx, cy, r.theta);

                // Le (x, y) de r2 dans le repère non-rotaté
                r2.x = r2_center_global.x - r2_width / 2;
                r2.y = r2_center_global.y - r.height / 2;
                r2.width = Math.abs(r2_width);
                r2.height = Math.abs(r.height);
            }

            if (index_forme_zoom === Formes.indexOf(r)) index_forme_zoom = null;
            if (index_forme_move === Formes.indexOf(r)) index_forme_move = null;

            Formes.splice(Formes.indexOf(r), 1);
            if (r1.width > 0 && r1.height > 0) Formes.push(r1);
            if (r2.width > 0 && r2.height > 0) Formes.push(r2);
        });
    }
    else if (event.button === 0 && isMode_forme && type_forme != "gomme" && type_forme != "scission") {
        // === MODE FORME : MODIFICATION ===
        // Initialisation de la sélection de forme
        SelectRectangle.x = mouseX;
        SelectRectangle.y = mouseY;
        SelectRectangle.width = 0;
        SelectRectangle.height = 0;

        index_forme_zoom = null;
        index_forme_move = null;
        let is_find = false;

        // Vérification des rectangles pour modification
        Formes.filter(x => x.type === "Rectangle" || x.type === "Mur").forEach(r => {
            if (is_find) return;

            is_find = r.type === "Rectangle" ? r.isOnRectangle(mouseX, mouseY) : r.isOnMur(mouseX, mouseY);
            if (!is_find) return;

            old_forme = type_forme;
            type_forme = r.type === "Rectangle" ? "rectangle" : "mur";
            sommet = r.isOnSommetRectangle(mouseX, mouseY);
            if (sommet != null) {
                // Redimensionnement du rectangle
                index_forme_zoom = Formes.indexOf(r);
            }
            else {
                // Déplacement du rectangle
                index_forme_move = Formes.indexOf(r);
            }
        });

        // Vérification des ellipses pour modification
        Formes.filter(x => x.type === "Ellipse").forEach(e => {
            if (is_find) return;

            is_find = e.isOnEllipse(mouseX, mouseY);
            if (!is_find) return;

            old_forme = type_forme;
            type_forme = "ellipse";
            sommet = e.isOnSommetEllipse(mouseX, mouseY);
            if (sommet != null) {
                // Redimensionnement de l'ellipse
                index_forme_zoom = Formes.indexOf(e);
            }
            else {
                // Déplacement de l'ellipse
                index_forme_move = Formes.indexOf(e);
            }
        });
    }
    else if (event.button === 0 && isMode_forme) {
        // === MODE FORME : SUPPRESSION (GOMME) ===
        SelectRectangle.x = mouseX;
        SelectRectangle.y = mouseY;
        SelectRectangle.width = 0;
        SelectRectangle.height = 0;
        isDragging_select = true;

        let is_find = false;

        // Suppression des rectangles à la position cliquée
        Formes.filter(x => x.type === "Rectangle" || x.type === "Mur").forEach(r => {
            if (r.type === "Rectangle" && !r.isOnRectangle(mouseX, mouseY)) return;
            if (r.type === "Mur" && !r.isOnMur(mouseX, mouseY)) return;
            // Suppression du rectangle
            if (!is_find) Formes.splice(Formes.indexOf(r), 1);
            is_find = true;
        });

        // Suppression des ellipses à la position cliquée
        Formes.filter(x => x.type === "Ellipse").forEach(e => {
            if (!e.isOnEllipse(mouseX, mouseY)) return;
            // Suppression de l'ellipse
            if (!is_find) Formes.splice(Formes.indexOf(e), 1);
            is_find = true;
        });
    }
    else if (event.button === 0 && event.ctrlKey && p != null && typeof p != "undefined" && myself === "MJ") {
        // === SÉLECTION MULTIPLE (CTRL + CLIC) ===
        // Ajout/suppression du pion de la sélection multiple
        if (p.Selected) p.Selected = false;
        else p.Selected = true;
        isDragging_select = false;
        Map.drawHexMap(true);
    }
    else if (event.button === 0 && p != null && typeof p != "undefined" && (["MJ", p.Model, p.Control].includes(myself))) {
        // === SÉLECTION SIMPLE ===
        // Si le pion n'est pas sélectionné, on nettoie la sélection et sélectionne le pion seul
        if (!p.Selected) {
            Pions.forEach(x => { x.Selected = false; });
            p.Selected = true;
        }
        isDragging_select = false;
        Map.drawHexMap(true);
    }
    else if (event.button === 0 && myself === "MJ") {
        // Il n'y a pas de pion à cette position : la sélection est réinitialisée et ouverte
        Pions.forEach(x => { x.Selected = false; });
        SelectRectangle.x = mouseX;
        SelectRectangle.y = mouseY;
        SelectRectangle.width = 0;
        SelectRectangle.height = 0;
        isDragging_select = true;
        Map.drawHexMap(true);
    }
    else if (event.button === 2 && isMode_forme && type_forme != "gomme" && type_forme != "scission") {
        // On fait pivoter une forme
        event.preventDefault();

        index_forme_move = null;
        let is_find = false;

        Formes.filter(f => f.type === "Rectangle" || f.type === "Mur").forEach(r => {
            if (is_find) return;

            is_find = r.isOnRectangle(mouseX, mouseY);
            if (!is_find) return;

            old_forme = type_forme;
            type_forme = r.type === "Rectangle" ? "rectangle" : "mur";
            index_forme_move = Formes.indexOf(r);
        });

        Formes.filter(f => f.type === "Ellipse").forEach(e => {
            if (is_find) return;

            is_find = e.isOnEllipse(mouseX, mouseY);
            if (!is_find) return;

            old_forme = type_forme;
            type_forme = "ellipse";
            index_forme_move = Formes.indexOf(e);
        });
    }
    else if (event.button === 2 && p != null && typeof p != "undefined" && (["MJ", p.Model, p.Control].includes(myself))) {
        // Clic droit : on ouvre la fenetre de modification d'un pion
        event.preventDefault();
        p.afficher_Details();
    }
    else if (event.button === 2) {
        isMoving_map = false;
    }

    // Mise à jour du tooltip (sans que la souris ait bougé)
    Map.update_tooltip(col, row);

    Map.generateHexMap();
    Map.drawHexMap();
});

// Déplacement de la souris
canvas.addEventListener("mousemove", (event) => {
    const mousePos = Map.getMousePosition(event);
    let mouseX = mousePos.x;
    let mouseY = mousePos.y;

    if (isDragging_left && isMode_terrain && type_terrain != "gomme") {
        // Le bouton gauche de la souris est enfoncé : on dessine des tas de terrains
        let col = Math.round((mouseX - offsetX) / hexHSpacing);
        let row = Math.round((mouseY - offsetY - ((col % 2 + 2) % 2) * (hexHeight / 2)) / hexVSpacing);
        Terrain.add(type_terrain, col + "," + row);
        Map.generateHexMap();
        Map.drawHexMap();
    }
    else if (isDragging_left && isMode_terrain) {
        // On supprime les terrains
        let col = Math.round((mouseX - offsetX) / hexHSpacing);
        let row = Math.round((mouseY - offsetY - ((col % 2 + 2) % 2) * (hexHeight / 2)) / hexVSpacing);
        const t = Terrains.find(x => x.Position === col + "," + row);
        if (t != null && typeof t != "undefined") t.rmv();
        Map.generateHexMap();
        Map.drawHexMap();
    }
    else if (isDragging_left && isMode_forme && index_forme_move != null) {
        // Le bouton gauche de la souris est enfoncé : on déplace une forme
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        const r = Formes[index_forme_move];
        r.x += dx;
        r.y += dy;

        Map.drawHexMap();
    }
    else if (isDragging_left && isMode_forme && index_forme_zoom != null) {
        // === REDIMENSIONNEMENT D'UNE FORME ===
        // Le bouton gauche de la souris est enfoncé : on redimensionne une forme
        if (Formes[index_forme_zoom].type === "Rectangle" || Formes[index_forme_zoom].type === "Mur") {
            const r = Formes[index_forme_zoom];

            // === CALCUL DE LA POSITION INITIALE DU SOMMET ===
            let R1 = null;
            if (sommet.x === 0 && sommet.y === 0) {
                // Sommet en bas à droite
                R1 = Forme.rotatePoint(
                    r.x + r.width, r.y + r.height,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }
            else if (sommet.x === 0 && sommet.y != 0) {
                // Sommet en haut à droite
                R1 = Forme.rotatePoint(
                    r.x + r.width, r.y,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }
            else if (sommet.x != 0 && sommet.y === 0) {
                // Sommet en bas à gauche
                R1 = Forme.rotatePoint(
                    r.x, r.y + r.height,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }
            else if (sommet.x != 0 && sommet.y != 0) {
                // Sommet en haut à gauche
                R1 = Forme.rotatePoint(
                    r.x, r.y,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }

            // === CALCUL DU DÉPLACEMENT DE LA SOURIS ===
            const rLM = Forme.rotatePoint(
                mouseX - lastMouseX, mouseY - lastMouseY, 0, 0, - r.theta);

            // === MISE À JOUR DES DIMENSIONS ===
            if (sommet.x === 0) r.width -= rLM.x;
            else r.width += rLM.x;

            if (sommet.y === 0) r.height -= rLM.y;
            else r.height += rLM.y;

            let R2 = null;
            if (sommet.x === 0 && sommet.y === 0) {
                R2 = Forme.rotatePoint(
                    r.x + r.width, r.y + r.height,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }
            else if (sommet.x === 0 && sommet.y != 0) {
                R2 = Forme.rotatePoint(
                    r.x + r.width, r.y,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }
            else if (sommet.x != 0 && sommet.y === 0) {
                R2 = Forme.rotatePoint(
                    r.x, r.y + r.height,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }
            else { // if (sommet.x != 0 && sommet.y != 0) {
                R2 = Forme.rotatePoint(
                    r.x, r.y,
                    r.x + r.width / 2, r.y + r.height / 2,
                    r.theta);
            }

            r.x -= R2.x - R1.x;
            r.y -= R2.y - R1.y;

            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
        else {
            // === REDIMENSIONNEMENT D'UNE ELLIPSE ===
            const e = Formes[index_forme_zoom];

            // === CALCUL DE LA POSITION INITIALE DU SOMMET ===
            let E1 = null;
            if (sommet.x > 0 && sommet.y === 0) {
                // Sommet à droite
                E1 = Forme.rotatePoint(
                    e.x - e.width / 2, e.y,
                    e.x, e.y,
                    e.theta);
            }
            else if (sommet.x < 0 && sommet.y === 0) {
                // Sommet à gauche
                E1 = Forme.rotatePoint(
                    e.x + e.width / 2, e.y,
                    e.x, e.y,
                    e.theta);
            }
            else if (sommet.x === 0 && sommet.y > 0) {
                // Sommet en haut
                E1 = Forme.rotatePoint(
                    e.x, e.y - e.height / 2,
                    e.x, e.y,
                    e.theta);
            }
            else {
                // Sommet en bas
                E1 = Forme.rotatePoint(
                    e.x, e.y + e.height / 2,
                    e.x, e.y,
                    e.theta);
            }

            const rLM = Forme.rotatePoint(
                mouseX - lastMouseX, mouseY - lastMouseY, 0, 0, - e.theta);

            if (sommet.x > 0) e.width += rLM.x;
            else e.width -= rLM.x;

            if (sommet.y > 0) e.height += rLM.y;
            else e.height -= rLM.y;

            let E2 = null;
            if (sommet.x > 0 && sommet.y === 0) {
                E2 = Forme.rotatePoint(
                    e.x - e.width / 2, e.y,
                    e.x, e.y,
                    e.theta);
            }
            else if (sommet.x < 0 && sommet.y === 0) {
                E2 = Forme.rotatePoint(
                    e.x + e.width / 2, e.y,
                    e.x, e.y,
                    e.theta);
            }
            else if (sommet.x === 0 && sommet.y > 0) {
                E2 = Forme.rotatePoint(
                    e.x, e.y - e.height / 2,
                    e.x, e.y,
                    e.theta);
            }
            else {
                E2 = Forme.rotatePoint(
                    e.x, e.y + e.height / 2,
                    e.x, e.y,
                    e.theta);
            }

            e.x -= E2.x - E1.x;
            e.y -= E2.y - E1.y;

            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }

        Map.drawHexMap();
    }
    else if (isDragging_left && isMode_forme && type_forme != "gomme" && type_forme != "scission") {
        // Le bouton gauche de la souris est enfoncé : on dessine une forme (sélection)
        if (type_forme === "ellipse") {
            // Ellipse : la souris est positionnée au bord
            const w = 2 * Math.sqrt(2) * (mouseX - lastMouseX);
            const h = 2 * Math.sqrt(2) * (mouseY - lastMouseY);
            SelectRectangle.width = Math.abs(w);
            SelectRectangle.height = Math.abs(h);
            if (w < 0) SelectRectangle.x = mouseX;
            if (h < 0) SelectRectangle.y = mouseY;
        }
        else { // Rectangle : la souris est le sommet opposé
            const w = (mouseX - lastMouseX);
            const h = (mouseY - lastMouseY);
            SelectRectangle.width = Math.abs(w);
            SelectRectangle.height = Math.abs(h);
            if (w < 0) SelectRectangle.x = mouseX;
            if (h < 0) SelectRectangle.y = mouseY;
        }

        Map.drawHexMap();
    }
    else if (isDragging_left && isDragging_select) {
        // Le mousedown ne s'est pas fait sur un pion : on sélectionne les pions ds le rectangle
        const x1 = lastMouseX - offsetX;
        const y1 = lastMouseY - offsetY;
        const x2 = mouseX - offsetX;
        const y2 = mouseY - offsetY;

        const w = x2 - x1;
        const h = y2 - y1;
        SelectRectangle.width = Math.abs(w);
        SelectRectangle.height = Math.abs(h);
        if (w < 0) SelectRectangle.x = x2 + offsetX;
        if (h < 0) SelectRectangle.y = y2 + offsetY;

        hexMap.forEach(hex => {
            let hexX = hex.col * hexHSpacing;
            let hexY = hex.row * hexVSpacing + ((hex.col % 2 + 2) % 2) * (hexHeight / 2);
            const p = Pions.find(x => x.Position === hex.col + "," + hex.row);
            if (p != null && typeof p != "undefined") {
                p.Selected =
                    hexX >= Math.min(x1, x2) &&
                    hexX <= Math.max(x1, x2) &&
                    hexY >= Math.min(y1, y2) &&
                    hexY <= Math.max(y1, y2);
            }
        });
        Map.generateHexMap();
        Map.drawHexMap();
        Map.drawHexMap(true);
    }
    else if (isDragging_left) {
        // On déplace le(s) pion(s) sélectionné(s)
        const deltaX = mouseX - lastMouseX; // - offsetX;
        const deltaY = mouseY - lastMouseY; // - offsetY;

        // Calculer la position relative du canvas par rapport au conteneur parent
        const combatDiv = document.getElementById("combat");
        const combatRect = combatDiv.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        // Position relative du canvas par rapport au conteneur #combat
        const relativeLeft = canvasRect.left - combatRect.left;
        const relativeTop = canvasRect.top - combatRect.top;

        // Positionner le canvas_selected pour qu'il se superpose exactement au canvas
        canvas_selected.style.left = (relativeLeft + deltaX) + "px";
        canvas_selected.style.top = (relativeTop + deltaY) + "px";

        // S'assurer que les dimensions correspondent
        if (canvas_selected.width != canvas.width) canvas_selected.width = canvas.width;
        if (canvas_selected.height != canvas.height) canvas_selected.height = canvas.height;

        canvas_selected.style.display = "";
    }
    else if (isDragging_right && isMode_forme && index_forme_move != null) {
        // Le bouton droit de la souris est enfoncé : on pivote une forme
        const f = Formes[index_forme_move];
        let O = null;
        let OM = null;
        if (f.type === "Rectangle" || f.type === "Mur") {
            O = { x: f.x + f.width / 2, y: f.y + f.height / 2 };
            OM = { x: f.width / 2, y: f.height / 2 };
        }
        else { // Ellipse
            O = { x: f.x, y: f.y };
            OM = { x: f.width / 2, y: 0 };
        }
        const OP = { x: mouseX - O.x, y: mouseY - O.y };
        // Produit scalaire de OM et OP
        const scalaire = OM.x * OP.x + OM.y * OP.y;
        const vectoriel = OM.x * OP.y - OM.y * OP.x;
        // Normes des vecteurs OM et OP
        const normeOM = Math.sqrt(OM.x ** 2 + OM.y ** 2);
        const normeOP = Math.sqrt(OP.x ** 2 + OP.y ** 2);
        // Calcul de l'angle en radians
        if (vectoriel > 0) f.theta = Math.acos(scalaire / (normeOM * normeOP));
        else f.theta = -Math.acos(scalaire / (normeOM * normeOP));

        Map.drawHexMap();
    }
    else if (isDragging_right) {
        // Bouton droit enfoncé : on déplace la carte
        const deltaX = mouseX - lastMouseX;
        const deltaY = mouseY - lastMouseY;

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        isMoving_map = true;

        offsetX += deltaX;
        Formes.forEach(r => { r.x += deltaX; });
        if (image_fond != null) forme_fond.x += deltaX;

        offsetY += deltaY;
        Formes.forEach(r => { r.y += deltaY; });
        if (image_fond != null) forme_fond.y += deltaY;

        Map.drawHexMap();
    }
    else if (isMode_forme) {
        // On affiche un pointeur en petite main s'il y a une forme à attrapper
        canvas.style.cursor = default_cursor;

        let cursor_zoom = "url('images/Zoom.png') 38 4, auto";
        let cursor_move = "url('images/Move.png') 32 32, auto";
        let cursor_scis = "url('images/Scission.png') 27 24, auto";

        if (type_forme === "gomme") {
            cursor_zoom = "url('images/Gomme.png') 20 60, auto";
            cursor_move = "url('images/Gomme.png') 20 60, auto";
            cursor_scis = "url('images/Gomme.png') 20 60, auto";
        }

        let is_find = false;
        Formes.filter(x => x.type === "Rectangle" || x.type === "Mur").forEach(r => {
            if (is_find) return;

            is_find = r.type === "Rectangle" ? r.isOnRectangle(mouseX, mouseY) : r.isOnMur(mouseX, mouseY);
            if (!is_find) return;

            if (type_forme === "scission" && r.type === "Mur") {
                canvas.style.cursor = cursor_scis;
            }
            else if (type_forme !== "scission" && r.isOnSommetRectangle(mouseX, mouseY)) {
                canvas.style.cursor = cursor_zoom;
            }
            else if (type_forme !== "scission") {
                canvas.style.cursor = cursor_move;
            }
        });

        Formes.filter(x => x.type === "Ellipse").forEach(e => {
            if (is_find) return;

            is_find = e.isOnEllipse(mouseX, mouseY);
            if (!is_find) return;

            const s = e.isOnSommetEllipse(mouseX, mouseY);
            if (s != null) {
                canvas.style.cursor = cursor_zoom;
            }
            else canvas.style.cursor = cursor_move;
        });
    }
    else {
        // Rien n'est en cours : on met simplement à jour le tooltip
        let col = Math.round((mouseX - offsetX) / hexHSpacing);
        let row = Math.round((mouseY - offsetY - ((col % 2 + 2) % 2) * (hexHeight / 2)) / hexVSpacing);

        tooltip.style.left = (event.pageX + 10) + "px";
        tooltip.style.top = (event.pageY + 10) + "px";
        Map.update_tooltip(col, row);
    }
});

// Bouton souris relevé
canvas.addEventListener("mouseup", (event) => {
    if (isMode_forme && isDragging_left && type_forme != "scission") {
        const type = type_forme.substring(0, 1).toUpperCase() + type_forme.substring(1);
        // On enregistre la nouvelle forme
        if (index_forme_move === null) {
            Formes[Formes.length] = new Forme(type);
            const r = Formes[Formes.length - 1];
            r.x = SelectRectangle.x;
            r.y = SelectRectangle.y;
            r.width = SelectRectangle.width;
            r.height = SelectRectangle.height;
            r.color = document.getElementById("forme_color").value;
            r.sendMessage("Add");
        }
    }
    else if (!isMode_terrain && isDragging_left && !isDragging_select) {
        // On déplace le(s) pion(s) de la sélection d'autant que la souris bouge.
        const joueur = document.getElementById("joueur").value;

        const mousePos = Map.getMousePosition(event);
        const deltaX = mousePos.x - lastMouseX;
        const deltaY = mousePos.y - lastMouseY;

        Pions.filter(x => x.Selected && [x.Model, x.Control, "MJ"].includes(joueur)).forEach(p => {
            const pos = p.Position.split(",");
            let col = parseInt(pos[0], 10);
            let row = parseInt(pos[1], 10);

            // Convertir (col, row) en (x, y)
            let x = col * hexHSpacing + offsetX;
            let y = row * hexVSpacing + ((col % 2 + 2) % 2) * (hexHeight / 2) + offsetY;
            // let y = row * hexVSpacing + ((col % 2 != 0) ? hexVSpacing / 2 : 0) + offsetY;

            // Appliquer le déplacement en (x, y)
            x += deltaX;
            y += deltaY;

            // Convertir (x, y) en (col, row)
            col = Math.round((x - offsetX) / hexHSpacing);
            row = Math.round((y - offsetY - ((col % 2 + 2) % 2) * (hexHeight / 2)) / hexVSpacing);

            // Vérifier si la place est disponible
            const q = Pions.find(x => !x.Selected && x.Position === col + "," + row);
            if (q != null && typeof q != "undefined") return;
            const t = Terrains.find(x => x.Model === "Rocher" && x.Position === col + "," + row);
            if (t != null && typeof t != "undefined") return;

            // Déplacer le pion
            p.deplace_a(col, row);
        });
    }
    else if (isDragging_right && !isMode_forme && !isMoving_map) {
        // Clic droit : on ouvre la fenetre de création d'un pion
        event.preventDefault();

        const mousePos = Map.getMousePosition(event);
        let mouseX = mousePos.x;
        let mouseY = mousePos.y;

        // Convertir en coordonnées de grille
        const col = Math.round((mouseX - offsetX) / hexHSpacing);
        const row = Math.round((mouseY - offsetY - ((col % 2 + 2) % 2) * (hexHeight / 2)) / hexVSpacing);

        afficher_Details(col, row);
    }

    isMoving_map = false;

    SelectRectangle.width = 0;
    SelectRectangle.height = 0;

    isDragging_left = false;
    isDragging_right = false;
    canvas_selected.style.display = "none";

    if (old_forme != "") type_forme = old_forme;
    old_forme = "";

    Map.generateHexMap();
    Map.drawHexMap();
    Map.drawHexMap(true);
});

// Touches enfoncées dans la fenetre
document.addEventListener("keydown", function (event) {
    let ratio = 1;

    // Si la touche est enfoncée dans un champ de texte, on ne fait rien
    if (event.target.tagName === "TEXTAREA" || event.target.tagName === "INPUT") {
        return;
    }

    // On fait les actions correspondantes à la touche enfoncée
    switch (event.key) {
        case "Escape":
        case "Esc":
            const elements = document.querySelectorAll("#rocher, #arbre, #eau, #gomme_t, #rectangle, #ellipse, #mur, #scission, #gomme_f");
            elements.forEach(element => { element.style.border = "none"; });
            isMode_terrain = false;
            type_terrain = "";
            isMode_forme = false;
            type_forme = "";
            default_cursor = "default";
            canvas.style.cursor = default_cursor;
            Tool.hidePopup();
            Pions.forEach(x => { x.Attaquant = false; x.Defenseur = false; });
            break_combats = true;
            break;
        case " ":
        case "Spacebar":
            next_attaque();
            break;
        case "Delete":
            // On supprime le(s) pion(s) de la sélection
            let p = Pions.find(x => x.Selected);
            while (p != null && typeof p != "undefined") {
                Pions.splice(Pions.indexOf(p), 1);
                p = Pions.find(x => x.Selected);
            }
            break;
        case "+":
        case "-":
            if (event.key === "+") {
                ratio = (hexSize + 1) / hexSize;
                hexSize++;
            }
            else if (hexSize > 10) {
                ratio = (hexSize - 1) / hexSize;
                hexSize--;
            }
            hexWidth = Math.sqrt(3) * hexSize;
            hexHeight = 2 * hexSize;
            hexHSpacing = hexSize * 1.5;
            hexVSpacing = hexHeight * Math.sqrt(3) / 2;

            Formes.forEach(r => {
                r.x = ratio * (r.x - offsetX) + offsetX;
                r.y = ratio * (r.y - offsetY) + offsetY;
                r.width = ratio * r.width;
                r.height = ratio * r.height;
            });

            if (image_fond != null) {
                forme_fond.x = ratio * (forme_fond.x - offsetX) + offsetX;
                forme_fond.y = ratio * (forme_fond.y - offsetY) + offsetY;
                forme_fond.width = ratio * forme_fond.width;
                forme_fond.height = ratio * forme_fond.height;
            }
            break;
        case "ArrowUp":
            offsetY += 10;
            Formes.forEach(r => { r.y += 10; });
            if (image_fond != null) forme_fond.y += 10;
            break;
        case "ArrowDown":
            offsetY -= 10;
            Formes.forEach(r => { r.y -= 10; });
            if (image_fond != null) forme_fond.y -= 10;
            break;
        case "ArrowLeft":
            offsetX += 10;
            Formes.forEach(r => { r.x += 10; });
            if (image_fond != null) forme_fond.x += 10;
            break;
        case "ArrowRight":
            offsetX -= 10;
            Formes.forEach(r => { r.x -= 10; });
            if (image_fond != null) forme_fond.x -= 10;
            break;
        default:
            return;
    }
    Map.generateHexMap();
    Map.drawHexMap();
});

// === GESTION DE LA SORTIE DU CANVAS ===
// Réinitialisation des états de glissement et masquage du tooltip
canvas.addEventListener("mouseleave", () => {
    isDragging_left = false;
    isDragging_right = false;
    tooltip.style.display = "none";
});

// === GESTION DU ZOOM DE LA CARTE ===
canvas.addEventListener("wheel", function (event) {
    event.preventDefault();

    // Calculer la position de la souris
    const mousePos = Map.getMousePosition(event);
    const mouseX = mousePos.x;
    const mouseY = mousePos.y;

    // Trouver la case sous la souris avant le zoom
    const hex = Map.getHexagonAtPoint(mouseX, mouseY);
    const col = hex.col;
    const row = hex.row;

    // Calculer la position de cette case avant le zoom
    const hexXY_before = Map.get_XY(col, row);
    const caseX_before = hexXY_before.x + offsetX;
    const caseY_before = hexXY_before.y + offsetY;

    // Calculer la distance relative entre la souris et la case avant le zoom
    const relX_before = mouseX - caseX_before;
    const relY_before = mouseY - caseY_before;

    // Appliquer le zoom
    let ratio = 1;
    if (event.deltaY > 0) {
        // Zoom out (molette vers le bas)
        if (hexSize < 10) return;
        d = -hexSize / 10;
    } else {
        // Zoom in (molette vers le haut)
        d = hexSize / 10;
    }
    ratio = (hexSize + d) / hexSize;
    hexSize += d;
    hexWidth = Math.sqrt(3) * hexSize;
    hexHeight = 2 * hexSize;
    hexHSpacing = hexSize * 1.5;
    hexVSpacing = hexHeight * Math.sqrt(3) / 2;

    // Calculer la position de la case après le zoom
    const hexXY_after = Map.get_XY(col, row);

    // Ajuster offsetX et offsetY pour que la case reste sous la souris
    offsetX = mouseX - relX_before * ratio - hexXY_after.x;
    offsetY = mouseY - relY_before * ratio - hexXY_after.y;

    Formes.forEach(r => {
        r.x = ratio * (r.x - offsetX) + offsetX;
        r.y = ratio * (r.y - offsetY) + offsetY;
        r.width = ratio * r.width;
        r.height = ratio * r.height;
    });

    if (image_fond != null) {
        forme_fond.x = ratio * (forme_fond.x - offsetX) + offsetX;
        forme_fond.y = ratio * (forme_fond.y - offsetY) + offsetY;
        forme_fond.width = ratio * forme_fond.width;
        forme_fond.height = ratio * forme_fond.height;
    }

    Map.generateHexMap();
    Map.drawHexMap();
});

// === SYNCHRONISATION DE LA CARTE ===
// Bouton de synchronisation : envoie toutes les données de la carte aux joueurs
document.getElementById("synchroniser").addEventListener("click", () => {
    // On efface tout
    Map.sendMessage("ClearAll");
    // On renvoie tout
    Pions.forEach(p => { p.sendMessage("SetAll"); });
});

// === GESTION DE LA COULEUR DES FORMES ===
// Changement de couleur des formes et fermeture de la fenêtre de sélection
document.getElementById("forme_color").addEventListener("input", function () {
    // === FONCTIONS UTILITAIRES DE CONVERSION DE COULEURS ===

    // Convertit HEX en RGB
    function hexToRgb(hex) {
        let bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    // Convertit RGB en HSL
    function rgbToHsl(rgb) {
        let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // Gris
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    // Détecte si seul le Hue (teinte) a changé
    function isHueChange(oldColor, newColor) {
        let hslOld = rgbToHsl(hexToRgb(oldColor));
        let hslNew = rgbToHsl(hexToRgb(newColor));
        return hslOld.h !== hslNew.h && hslOld.s === hslNew.s && hslOld.l === hslNew.l;
    }

    // Si seule la teinte a changé, on ne touche à rien, sinon, on ferme la pop-up de sélection de couleur.
    if (isHueChange(last_forme_color, this.value)) return;
    last_forme_color = this.value;
    let newInput = this.cloneNode(true);
    this.parentNode.replaceChild(newInput, this);
    newInput.addEventListener("input", arguments.callee);
});

// === GESTION DU FOND DE CARTE ===
// Changement du fond de la carte
document.getElementById("img_fond").addEventListener("change", async (event) => {
    const form = document.getElementById("upload_fond");
    const formData = new FormData(form);
    await fetch("upload.php", { method: "POST", body: formData });

    if (event.target.files.length === 0) {
        // Aucun fichier sélectionné
        image_fond = null;
    }
    else {
        image_fond = new Image();
        image_fond.src = `images/Fond.jpg?t=${new Date().getTime()}`;
    }

    afficher_dim_carte();
});
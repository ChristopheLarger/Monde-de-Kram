/**
 * FICHIER MAP.JS
 * ===============
 * Gestion de la carte hexagonale et des pions pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour l'affichage, la manipulation et l'interaction avec la carte
 */

// === RÉFÉRENCES DOM ===
// === GESTION DE LA COULEUR DES FORMES ===
const palette_de_couleurs = [
    "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#8B4513", "#D2691E",
    "#8B0000", "#FF0000", "#FF6600", "#FFD700", "#FFFF00", "#ADFF2F", "#00FF00", "#006400",
    "#00FFFF", "#00BFFF", "#0000FF", "#000080", "#4B0082", "#8B00FF", "#FF00FF", "#FF1493",
    "#A0522D", "#F4A460", "#DEB887", "#556B2F", "#228B22", "#2F4F4F", "#4682B4", "#87CEEB"
];
// Éléments d'interface utilisateur
const tooltip = document.getElementById("tooltip");                    // Tooltip pour afficher des informations
const canvas = document.getElementById("hexCanvas");                   // Canvas principal pour la carte
const canvas_selected = document.getElementById("hexCanvas_selected"); // Canvas pour les sélections

// === PARAMÈTRES DE LA CARTE ===
// Dimensions et espacement des hexagones
let hexDimensionsX = 20;                        // Largeur de la carte en hexagones
let hexDimensionsY = 20;                        // Hauteur de la carte en hexagones
let hexSize = 40;                               // Taille des hexagones en pixels
let hexWidth = Math.sqrt(3) * hexSize;          // Largeur d'un hexagone
let hexHeight = 2 * hexSize;                    // Hauteur d'un hexagone
let hexHSpacing = hexSize * 1.5;                // Espacement horizontal entre hexagones
let hexVSpacing = hexHeight * Math.sqrt(3) / 2; // Espacement vertical entre hexagones
let hexSize_zoom = 200;                         // Taille des hexagones en pixels pour le zoom

// === VARIABLES DE POSITION ET INTERACTION ===
let offsetX = canvas.width / 2;             // Décalage horizontal initial (centre de l'écran)
let offsetY = canvas.height / 2;            // Décalage vertical initial (centre de l'écran)

// États de glissement (dragging)
let isDragging_select = false;              // Glissement pour sélection
let isDragging_left = false;                // Glissement avec clic gauche
let isDragging_right = false;               // Glissement avec clic droit
let SelectRectangle = { x: 0, y: 0, width: 0, height: 0, color: "blue" }; // Rectangle de sélection

// Modes d'interaction
let isMode_terrain = false;                 // Mode placement de terrain
let type_terrain = "";                      // Type de terrain sélectionné
let isMode_coordonnees = false;             // Mode affichage des coordonnées

// Variables de position et interface
let lastMouseX = 0, lastMouseY = 0;         // Dernière position de la souris
let default_cursor = "default";             // Curseur par défaut
let hexMap = new Array;                     // Tableau contenant la grille d'hexagones

// === IMAGES DE PIONS ===
// images utilisées pour les différents types de pions
const image_auto = new Image();
image_auto.src = "images/Auto.png";

// === IMAGES DE FOND ===
let image_fond = null;                       // Image de fond de la carte
let forme_fond = { x: 0, y: 0, width: 0, height: 0 }; // Forme de fond

/**
 * Classe Map - Représente un élément sur la carte hexagonale
 * Peut être un pion (allié/ennemi) ou un terrain
 */
class Map {
    /**
     * Dessine une image centrée en (centerX, centerY) en conservant ses proportions,
     * en l'inscrivant dans un carré de côté maxSize.
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLImageElement} img
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} maxSize
     */
    static drawImageCenteredFit(ctx, img, centerX, centerY, maxSize) {
        const w = img.naturalWidth || img.width || 1;
        const h = img.naturalHeight || img.height || 1;
        const scale = Math.min(maxSize / w, maxSize / h);
        const drawW = w * scale;
        const drawH = h * scale;
        ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    }

    /**
     * Assombrit une couleur rgb(...) ou #hex de percent %.
     */
    static darkenColor(color, percent = 50) {
        const factor = 1 - percent / 100;
        let r, g, b;
        if (color.startsWith("#")) {
            const hex = color.length === 4
                ? "#" + color.slice(1).split("").map(c => c + c).join("")
                : color;
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else {
            [r, g, b] = color.match(/\d+/g).map(Number);
        }
        return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
    }

    /** Couleur terrain laissant voir le fond de carte (pas de remplissage) */
    static isTerrainTransparent(color) {
        return color === "transparent"
            || color === "rgb(255, 255, 255)"
            || (typeof color === "string" && color.toLowerCase() === "#ffffff");
    }

    /** Opacité du remplissage des hexagones coloriés (terrain, pions…) */
    static hexColorAlpha = 0.7;

    /** Recalcule la position et la taille du fond de carte sur le canvas */
    static updateFormeFond() {
        if (image_fond == null) return;
        const hexHS = hexSize * 1.5;
        const hexVS = hexSize * Math.sqrt(3);
        forme_fond.width = (2 * hexDimensionsX + 1.5) * hexHS;
        forme_fond.height = (2 * hexDimensionsY + 1.5) * hexVS;
        forme_fond.x = offsetX - forme_fond.width / 2;
        forme_fond.y = offsetY - forme_fond.height / 2 + hexVS / 4;
    }

    /** Charge l'image de fond (ex. images/Figurines/Fond.png) */
    static loadImageFond(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                image_fond = img;
                Map.updateFormeFond();
                resolve(img);
            };
            img.onerror = () => reject(new Error("Image de fond introuvable : " + src));
            img.src = src;
        });
    }

    /**
     * Traite les messages reçus via WebSocket
     * @param {string} data - Message reçu du serveur
     */
    // static receiveMessage(data) {
    //     const regex = /^MJ: Mode_coordonnees ([0-1])$/;
    //     const result = data.match(regex);
    //     if (!result) return false;

    //     isMode_coordonnees = (result[1] === "1") ? true : false;

    //     Map.generateHexMap();
    //     Map.drawHexMap();

    //     return true;
    // }

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
            if (Map.distance(col_p, row_p, col, row) <= p.Vue && p.ligne_de_vue(col, row)) {
                is_find = true;
            }
        });
        return is_find;
    }

    static get_ColRow(x, y) {
        // Calculer la colonne approximative
        let col;
        if (x >= 0) {
            col = Math.round(x / hexHSpacing);
        } else {
            // Pour les valeurs négatives, utiliser Math.ceil pour arrondir vers 0
            col = Math.ceil(x / hexHSpacing);
        }

        // Pour la ligne, on doit tenir compte du décalage des colonnes impaires
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
        const x1 = col1 * (3 / 2);
        const y1 = row1 * (Math.sqrt(3)) + (Math.abs(col1) % 2) * (Math.sqrt(3) / 2);
        const x2 = col2 * (3 / 2);
        const y2 = row2 * (Math.sqrt(3)) + (Math.abs(col2) % 2) * (Math.sqrt(3) / 2);

        // Calcul de la distance euclidienne
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / Math.sqrt(3);

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
                let isInBrouillard = !Map.is_visible(col, row); // Brouillard si non visible

                // Si la case est visible (pas de brouillard)
                color = "rgb(255, 255, 255)";
                Terrains.filter(t => t.Position === col + "," + row).forEach(t => {
                    color = t.Color;
                });

                // Définition de la couleur de l'hexagone en fonction du type de pion
                let magicien = Pions.find(p => p.Attaquant && p.Nom_liste != "");
                if (typeof magicien === "undefined") magicien = null;

                Pions.filter(p => p.Position === col + "," + row).forEach(p => {
                    if (p.Attaquant && magicien === null) color = "rgb(255, 0, 0)";
                    else if (p.Defenseur && magicien === null) color = "rgb(0, 0, 255)";
                    else if (p.Cible_sort && magicien !== null) color = "rgb(0, 255, 0)";
                    else if (p.Selected && p.Type === "allies") color = "rgb(192, 192, 255)";
                    else if (p.Selected && p.Type === "ennemis") color = "rgb(255, 192, 192)";
                });

                hexMap.push({ x, y, col, row, color, isInBrouillard });
            }
        }
    }

    /**
     * Dessine un hexagone sur le canvas
     * @param {number} x - Coordonnée X du centre de l'hexagone
     * @param {number} y - Coordonnée Y du centre de l'hexagone
     * @param {string} color - Couleur de l'hexagone
     * @param {boolean} strie - Si true, l'hexagone est strié
     * @param {string} text - Texte à afficher sur l'hexagone
     * @param {boolean} isInBrouillard - Si true, l'hexagone est dans le brouillard
     * @param {boolean} selected - Si true, l'hexagone est sélectionné
     */
    static drawHexagon(x, y, color, text, isInBrouillard, selected = false) {
        if (selected) {
            const ctx = canvas_selected.getContext("2d");

            // On dessine l'image au centre de l'hexagone (proportions conservées)
            const imgSize = hexSize * 1.2;
            const p = Pions.find(q => q.Selected && q.Position === text);
            if (p != null && typeof p != "undefined") {
                const m = Models.find(x => x.Nom_model === p.Model);
                Map.drawImageCenteredFit(ctx, m.Image, x, y, imgSize);
            }
            return;
        }

        const ctx = canvas.getContext("2d");

        // On enregistre et dessine les sommets des hexagones.
        ctx.save();
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

        // Transparent = laisse voir le fond de carte
        const isTransparent = Map.isTerrainTransparent(color);
        if (isInBrouillard) {
            if (document.getElementById("joueur").value === "MJ") {
                // MJ : voile gris semi-transparent, la carte reste visible en dessous
                if (!isTransparent) {
                    ctx.globalAlpha = 0.65;
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
                ctx.fillStyle = "rgba(100, 100, 100, 0.75)";
                ctx.fill();
            } else {
                ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
                ctx.fill();
            }
        } else if (!isTransparent) {
            ctx.globalAlpha = Map.hexColorAlpha;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // On ne dessine pas le contour si le brouillard est actif et que le joueur n'est pas MJ
        if (isInBrouillard && document.getElementById("joueur").value !== "MJ") return;

        // On dessine le contour de l'hexagone et la couleur de l'hexagone
        ctx.strokeStyle = "rgb(200, 150, 150)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        let strie = false;
        Terrains.filter(t => t.Position === text).forEach(t => {
            if (t.Type === "strie") strie = true;
        });
        Pions.filter(p => p.Position === text).forEach(p => {
            if (p.Type === "ennemis") strie = true;
            else strie = false; // On ne strie pas les terrains où il y a un allié
        });

        // On dessine l'image au centre de l'hexagone
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

            if (color === "rgb(192, 192, 192)") {
                ctx.strokeStyle = "white";
            }
            else {
                ctx.strokeStyle = "gray";
            }

            ctx.lineWidth = 1;
            for (let x = minX - (maxY - minY); x <= maxX; x += spacing) {
                ctx.moveTo(x, minY);
                ctx.lineTo(x + (maxY - minY), maxY);
            }
            ctx.stroke();
            ctx.restore(); // Supprime le clip
        }

        // On dessine l'image au centre de l'hexagone (proportions conservées)
        const imgSize = hexSize * 1.2;
        const p = Pions.find(q => q.Position === text);
        if (p != null && typeof p != "undefined") {
            const m = Models.find(n => n.Nom_model === p.Model);
            Map.drawImageCenteredFit(ctx, m.Image, x, y, imgSize);
            if (p.Auto) {
                ctx.drawImage(
                    image_auto,
                    x - hexSize + imgSize / 24,
                    y - imgSize / 6,
                    imgSize / 3,
                    imgSize / 3);
            }
        }

        // On ajoute l'indice sur l'image le cas échéant
        if (p != null && typeof p != "undefined" && p.Indice != 0) {
            ctx.fillStyle = "rgb(20, 20, 20)";
            ctx.font = `Bold ${hexSize / 3}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.Indice,
                x + hexSize * Math.cos(Math.PI / 3) - imgSize / 9,
                y - hexSize * Math.sin(Math.PI / 3) + imgSize / 6);

        }

        // Réinitialiser les propriétés du contexte pour éviter qu'elles n'affectent les hexagones suivants
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(20, 20, 20)";

        // Affiche les coordonnées si le mode est activé
        if (isMode_coordonnees) {
            ctx.fillStyle = "rgb(20, 20, 20)";
            ctx.font = `Bold ${hexSize / 3}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, x, y);
        }
    }

    /**
     * Dessine du texte sur le canvas
     * @param {string} text - Texte à afficher
     * @param {number} fontSize - Taille de la police
     * @param {number} x - Coordonnée X du texte
     * @param {number} y - Coordonnée Y du texte
     * @param {string} background - Couleur de fond
     * @param {string} color - Couleur du texte
     * @param {string} textAlign - Alignement du texte
     */
    static drawText(text, fontSize, x, y, background = "", color = "rgb(20, 20, 20)", textAlign = "center") {
        if (text === "") return;
        const ctx = canvas_zoom.getContext("2d");
        ctx.font = `Bold ${fontSize}px Arial`;
        ctx.textAlign = textAlign;
        ctx.textBaseline = "middle";
        const textX = canvas.width / 2 + x;
        const textY = canvas.height / 2 + y;
        // Dessiner le fond blanc si pas de transparence
        if (background !== "") {
            // Mesurer le texte pour calculer la taille du fond
            const textHeight = parseInt(ctx.font.match(/\d+/)[0], 10); // Extraire la taille de la police
            // Ajouter du padding autour du texte
            const padding = textHeight * 0.3;
            const rectWidth = ctx.measureText(text).width + padding * 2;
            const rectHeight = textHeight + padding * 2;
            // Dessiner le fond blanc
            ctx.fillStyle = background;
            switch (textAlign) {
                case "left":
                    ctx.fillRect(textX - padding, textY - rectHeight / 2, 2 * rectWidth, rectHeight);
                    break;
                case "right":
                    ctx.fillRect(textX - rectWidth + padding, textY - rectHeight / 2, rectWidth, rectHeight);
                    break;
                default:
                    ctx.fillRect(textX - rectWidth / 2, textY - rectHeight / 2, rectWidth, rectHeight);
                    break;
            }
        }
        // Dessiner le texte
        ctx.fillStyle = color;
        ctx.fillText(text, textX, textY);
    }

    /**
     * Dessine la carte hexagonale complète
     * @param {boolean} selected - Si true, dessine sur le canvas de sélection
     */
    static drawHexMap(selected = false) {
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
                    hex.color, `${hex.col},${hex.row}`, null, true);
            });
            return;
        }

        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - document.getElementById("barre_outils").offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (image_fond != null && forme_fond.width > 0 && forme_fond.height > 0
            && image_fond.complete && image_fond.naturalWidth > 0) {
            ctx.drawImage(
                image_fond,
                forme_fond.x,
                forme_fond.y,
                forme_fond.width,
                forme_fond.height);
        }

        hexMap.forEach(hex => {
            Map.drawHexagon(
                hex.x + offsetX,
                hex.y + offsetY,
                hex.color,
                `${hex.col},${hex.row}`,
                hex.isInBrouillard);
        });

        // Dessiner le rectangle de sélection par-dessus les hexagones
        ctx.beginPath();
        ctx.strokeStyle = SelectRectangle.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(SelectRectangle.x, SelectRectangle.y, SelectRectangle.width, SelectRectangle.height);
    }

    /**
     * Met à jour le tooltip avec les informations de la case survolée
     * @param {number} col - Colonne de la case
     * @param {number} row - Ligne de la case
     */
    static update_tooltip(col, row) {
        tooltip.style.display = "block";
        tooltip.innerHTML = "";

        // Calculer et afficher la distance depuis le pion sélectionné
        const p_sel = Pions.find(x => x.Selected);
        if (p_sel != null && typeof p_sel != "undefined") {
            const c_sel = p_sel.Position.split(",")[0];
            const r_sel = p_sel.Position.split(",")[1];
            tooltip.innerHTML += "(" + Map.distance(c_sel, r_sel, col, row) + " cases)";
        }

        if (isMode_coordonnees) {
            tooltip.innerHTML += (tooltip.innerHTML.length > 0 ? "<br>" : "") + "(" + col + ", " + row + ")";
        }

        if (tooltip.innerHTML === "") tooltip.style.display = "none";
    }

    /**
     * Active ou désactive le mode affichage des coordonnées
     */
    static setMode_coordonnees() {
        isMode_coordonnees = !isMode_coordonnees;

        sendMessage("Mode_coordonnees", isMode_coordonnees ? "1" : "0");

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Définit la portée de vue des pions
     */
    static setPortee_vue() {
        const portee_vue = parseInt(document.getElementById("portee_vue").value);
        if (portee_vue < 1) portee_vue = 1;
        if (portee_vue > 99) portee_vue = 99;
        document.getElementById("portee_vue").value = portee_vue;

        // Tout le monde a cette portée de vue par défaut
        Pions.forEach(p => {
            p.Vue = portee_vue;
            p.sendMessage("Vue");
        });

        Map.generateHexMap();
        Map.drawHexMap();
    }

    /**
     * Vérifie si deux segments de droite se croisent
     * @param {Object} p1 - Premier point du premier segment {x, y}
     * @param {Object} p2 - Deuxième point du premier segment {x, y}
     * @param {Object} p3 - Premier point du deuxième segment {x, y}
     * @param {Object} p4 - Deuxième point du deuxième segment {x, y}
     * @returns {boolean} - true si les segments se croisent
     */
    static segmentsIntersect(p1, p2, p3, p4) {
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

            if (Map.segmentsIntersect(linePoint1, linePoint2, edgeStart, edgeEnd)) {
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
}

// ///////// //
// Listeners //
// ///////// //

let isMoving_map = false;

// Click droit sur canvas : annulé
canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

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
    let magicien = Pions.find(x => x.Attaquant && x.Nom_liste != "");
    if (typeof magicien === "undefined") magicien = null;

    // Glisser gauche ou sinon droit en cours
    if (event.button === 0) isDragging_left = true;
    else if (event.button === 2) isDragging_right = true;

    // === GESTION DES CLICS GAUCHES ===
    if (event.button === 0 && p != null && typeof p != "undefined" && p.Defenseur && myself === "MJ") {
        // Clic gauche sur le défenseur choisi => on résout l'attaque
        Pions.forEach(x => { x.Defenseur = false; });
        p.Defenseur = true;
        affiche_attaque(1);
    }
    else if (event.button === 0 && p != null && typeof p != "undefined" && magicien != null) {
        // Clic gauche sur la cible de sort choisi => on le marque comme cible
        p.Cible_sort = !p.Cible_sort;
        p.affiche_Details();
    }
    else if (event.button === 0 && isMode_terrain && type_terrain != "gomme") {
        // Mode terrain : ajout d'un terrain à la position cliquée
        Terrain.add(type_terrain, col + "," + row);
    }
    else if (event.button === 0 && isMode_terrain) {
        // Mode gomme : suppression du terrain à la position cliquée
        if (t != null && typeof t != "undefined") t.rmv();
    }
    else if (event.button === 0 && event.ctrlKey && p != null && typeof p != "undefined" && myself === "MJ") {
        // === SÉLECTION MULTIPLE (CTRL + CLIC) ===
        // Ajout/suppression du pion de la sélection multiple
        if (p.Selected) p.Selected = false;
        else p.Selected = true;
        isDragging_select = false;
        p.affiche_Details();
        Map.drawHexMap(true);
    }
    else if (event.button === 0 && p != null &&
        typeof p != "undefined" && (["MJ", p.Model, p.Control].includes(myself))) {
        // === SÉLECTION SIMPLE ===
        // Si le pion n'est pas sélectionné, on nettoie la sélection et sélectionne le pion seul
        if (!p.Selected) {
            Pions.forEach(x => { x.Selected = false; });
            p.Selected = true;
        }
        isDragging_select = false;
        p.affiche_Details();
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
    else if (event.button === 2 && p != null &&
        typeof p != "undefined" && (["MJ", p.Model, p.Control].includes(myself))) {
        // Clic droit : on ouvre la fenetre de modification d'un pion
        event.preventDefault();
        p.affiche_Details();
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

    // Convertir en coordonnées de grille
    const hex = Map.getHexagonAtPoint(mouseX, mouseY);
    const col = hex.col;
    const row = hex.row;

    const p = Pions.find(x => x.Position === col + "," + row);

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

        // La présence du magicien indique que l'on selectionne les cibles du sortilège
        let magicien = Pions.find(x => x.Attaquant && x.Nom_liste != "");
        if (typeof magicien === "undefined") magicien = null;

        hexMap.forEach(hex => {
            let hexX = hex.col * hexHSpacing;
            let hexY = hex.row * hexVSpacing + ((hex.col % 2 + 2) % 2) * (hexHeight / 2);
            const p = Pions.find(x => x.Position === hex.col + "," + hex.row);
            if (p != null && typeof p != "undefined") {
                if (magicien != null) {
                    p.Cible_sort =
                        hexX >= Math.min(x1, x2) &&
                        hexX <= Math.max(x1, x2) &&
                        hexY >= Math.min(y1, y2) &&
                        hexY <= Math.max(y1, y2);
                }
                else {
                    p.Selected =
                        hexX >= Math.min(x1, x2) &&
                        hexX <= Math.max(x1, x2) &&
                        hexY >= Math.min(y1, y2) &&
                        hexY <= Math.max(y1, y2);
                }
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
    else if (isDragging_right) {
        // Bouton droit enfoncé : on déplace la carte
        const deltaX = mouseX - lastMouseX;
        const deltaY = mouseY - lastMouseY;

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        isMoving_map = true;

        offsetX += deltaX;
        if (image_fond != null) forme_fond.x += deltaX;

        offsetY += deltaY;
        if (image_fond != null) forme_fond.y += deltaY;

        Map.drawHexMap();
    }
    else {
        // On ne montre pas le tooltip dans le cas d'un affichage zoom de l'hexagone
        if ((Map.is_visible(col, row) || document.getElementById("joueur").value === "MJ") &&
            p != null && typeof p != "undefined") {
            tooltip.style.display = "none";
        }
        else {
            tooltip.style.display = "block";
            tooltip.style.left = (event.pageX + 10) + "px";
            tooltip.style.top = (event.pageY + 10) + "px";
            Map.update_tooltip(col, row);
        }
    }
});

// Bouton souris relevé
canvas.addEventListener("mouseup", (event) => {
    if (!isMode_terrain && isDragging_left && !isDragging_select) {
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

            // Déplacer le pion
            p.deplace_sur_la_carte(col, row);
        });
    }
    else if (isDragging_right && !isMoving_map) {
        // Clic droit : on ouvre la fenetre de création d'un pion
        event.preventDefault();

        const mousePos = Map.getMousePosition(event);
        let mouseX = mousePos.x;
        let mouseY = mousePos.y;

        // Convertir en coordonnées de grille
        const col = Math.round((mouseX - offsetX) / hexHSpacing);
        const row = Math.round((mouseY - offsetY - ((col % 2 + 2) % 2) * (hexHeight / 2)) / hexVSpacing);

        m_pion = Pions.find(x => x.Position === col + "," + row);
        if (m_pion != null && typeof m_pion != "undefined") {
            affiche_pion();
        }
        else {
            // Affichage du dialogue de création d'un nouveau pion
            m_pion = null;
            affiche_pion(col, row);
        }
    }

    isMoving_map = false;

    SelectRectangle.width = 0;
    SelectRectangle.height = 0;

    isDragging_left = false;
    isDragging_right = false;
    canvas_selected.style.display = "none";

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
            const elements = document.querySelectorAll("#non_strie, #strie, #gomme");
            elements.forEach(element => { element.style.border = "none"; });
            isMode_terrain = false;
            type_terrain = "";
            isMode_forme = false;
            type_forme = "";
            default_cursor = "default";
            canvas.style.cursor = default_cursor;
            Pions.forEach(x => { x.Attaquant = false; x.Defenseur = false; });
            break_combats = true;
            break;
        case " ":
        case "Spacebar":
            event.preventDefault();
            event.stopPropagation();

            let magicien =
                Pions.find(x => x.Attaquant && x.Nom_liste != null && x.Nom_liste != "" && x.Incantation <= 5);
            if (magicien !== null && typeof magicien !== "undefined") {
                affiche_confirm_sort();
            }
            else next_attaque();
            break;
        case "Delete":
            // On supprime le(s) pion(s) de la sélection
            let p = Pions.find(x => x.Selected);
            while (p != null && typeof p != "undefined") {
                p.rmv();
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

            if (image_fond != null) {
                forme_fond.x = ratio * (forme_fond.x - offsetX) + offsetX;
                forme_fond.y = ratio * (forme_fond.y - offsetY) + offsetY;
                forme_fond.width = ratio * forme_fond.width;
                forme_fond.height = ratio * forme_fond.height;
            }
            break;
        case "ArrowUp":
            offsetY += 10;
            if (image_fond != null) forme_fond.y += 10;
            break;
        case "ArrowDown":
            offsetY -= 10;
            if (image_fond != null) forme_fond.y -= 10;
            break;
        case "ArrowLeft":
            offsetX += 10;
            if (image_fond != null) forme_fond.x += 10;
            break;
        case "ArrowRight":
            offsetX -= 10;
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
    let d = 0;
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

    if (image_fond != null) {
        forme_fond.x = ratio * (forme_fond.x - mouseX) + mouseX;
        forme_fond.y = ratio * (forme_fond.y - mouseY) + mouseY;
        forme_fond.width = ratio * forme_fond.width;
        forme_fond.height = ratio * forme_fond.height;
    }

    // Calculer la position de la case après le zoom
    const hexXY_after = Map.get_XY(col, row);

    // Ajuster offsetX et offsetY pour que la case reste sous la souris
    offsetX = mouseX - relX_before * ratio - hexXY_after.x;
    offsetY = mouseY - relY_before * ratio - hexXY_after.y;

    Map.generateHexMap();
    Map.drawHexMap();
});
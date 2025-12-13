/**
 * FICHIER COMBAT.JS
 * ==================
 * Système de combat simplifié utilisant les utilitaires
 * Remplace le code complexe par des fonctions plus lisibles
 */

// === VARIABLES GLOBALES DE COMBAT ===
let Attaques = [];              // Tableau contenant toutes les attaques
let current_attaque = null;     // Attaque en cours
let Cacs = [];                  // Tableau des combats au corps à corps
let Cacs_save = null;           // Tableau des combats futurs
let break_combats = false;      // Flag d'arrêt du combat
let Nb_rounds = 0;              // Nombre de rounds de combat

let contre_attaque = null;      // contre-attaque

/**
 * Calcule la distance entre deux points hexagonaux
 * @param {number} col1 - Colonne du premier hexagone
 * @param {number} row1 - Ligne du premier hexagone
 * @param {number} col2 - Colonne du deuxième hexagone
 * @param {number} row2 - Ligne du deuxième hexagone
 * @returns {number} Distance entre les deux hexagones
 */
function hexDistance(col1, row1, col2, row2) {
    const x1 = col1 * (3 / 2);
    const y1 = row1 * Math.sqrt(3) + (Math.abs(col1) % 2) * (Math.sqrt(3) / 2);
    const x2 = col2 * (3 / 2);
    const y2 = row2 * Math.sqrt(3) + (Math.abs(col2) % 2) * (Math.sqrt(3) / 2);

    const dist = 3 * Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / Math.sqrt(3);

    return Math.round(100 * dist) / 100;
}

/**
 * Calcule l'initiative d'un pion
 * @param {Object} pion - Pion dont calculer l'initiative
 * @returns {number} Initiative calculée
 */
function calculateInitiative(pion, main = 0) {
    const arme1 = pion.Arme1 ? Armes.find(a => a.Nom_arme === pion.Arme1) : null;
    const arme2 = pion.Arme2 ? Armes.find(a => a.Nom_arme === pion.Arme2) : null;
    const init1 = arme1 ? arme1.Init : 99;
    const init2 = arme2 ? arme2.Init : 99;
    const vitesseBonus = Math.floor((pion.getValue("Vp") - 10) / 2);
    const res1 = init1 - ((arme1 && arme1.A_projectile) ? 0 : vitesseBonus) - pion.B_ini;
    const res2 = init2 - ((arme2 && arme2.A_projectile) ? 0 : vitesseBonus) - pion.B_ini;

    if (main === 1) return res1;
    if (main === 2) return res2;
    return Math.min(res1, res2);
}

/**
 * Détermine si deux pions sont en combat au corps à corps
 * @param {Object} pion1 - Premier pion
 * @param {Object} pion2 - Deuxième pion
 * @returns {boolean} true si en combat au corps à corps
 */
function isInMeleeCombat(pion1, pion2) {
    const distance = hexDistance(
        parseInt(pion1.Position.split(',')[0]),
        parseInt(pion1.Position.split(',')[1]),
        parseInt(pion2.Position.split(',')[0]),
        parseInt(pion2.Position.split(',')[1])
    );

    return distance <= 4.5; // Distance de corps à corps
}

/**
 * Classe Attaque - Représente une attaque dans l'ordre d'initiative
 */
class Attaque {
    Model = "";        // Modèle du personnage
    Indice = 0;        // Indice du pion
    Timing = 0;        // Timing d'initiative

    // Attaque de l'une des 2 mains
    Main = null;       // Main de l'attaque (1 ou 2)

    // Bonus / malus temporaires
    Competence = null; // Competence de l'attaque (si bonus)
    Bonus = null;      // Bonus de l'attaque (si bonus)

    /**
     * Tri des attaques par timing puis par type, modèle et indice
     */
    static tri(x, y) {
        // 1er critère : Timing
        if (x.Timing !== y.Timing) {
            return x.Timing - y.Timing;
        }

        // 2ème critère : Type (alliés vs ennemis)
        const xType = Pions.find(p => p.Model === x.Model && p.Indice === x.Indice)?.Type || "";
        const yType = Pions.find(p => p.Model === y.Model && p.Indice === y.Indice)?.Type || "";
        if (xType !== yType) {
            return xType.localeCompare(yType);
        }

        // 3ème critère : Nom du modèle
        if (x.Model !== y.Model) {
            return x.Model.localeCompare(y.Model);
        }

        // 4ème critère : Indice
        return x.Indice - y.Indice;
    }
}

/**
 * Clone un tableau de Cac en préservant les méthodes de la classe
 * @param {Array<Cac>} cacs - Tableau de Cac à cloner
 * @returns {Array<Cac>} Nouveau tableau de Cac avec méthodes préservées
 */
function cloneCacs(cacs) {
    if (!cacs || !Array.isArray(cacs)) {
        return [];
    }
    return cacs.map(cac => {
        // Créer une nouvelle instance de Cac
        const cloned = new Cac();
        // Copier toutes les propriétés
        cloned.Model_allie = cac.Model_allie;
        cloned.Indice_allie = cac.Indice_allie;
        cloned.Model_ennemi = cac.Model_ennemi;
        cloned.Indice_ennemi = cac.Indice_ennemi;
        cloned.Avantage = cac.Avantage;
        cloned.Attaque = cac.Attaque;
        // Les méthodes sont automatiquement préservées car cloned est une instance de Cac
        return cloned;
    });
}

/**
 * Classe Cac - Représente un combat au corps à corps
 */
class Cac {
    Model_allie = "";  // Modèle du personnage allié
    Indice_allie = 0;  // Indice du pion allié
    Model_ennemi = ""; // Modèle du personnage ennemi
    Indice_ennemi = 0; // Indice du pion ennemi
    Avantage = 0;      // Qui a l'avantage ? 0 = aucun, 1 = allié, 2 = ennemi
    Attaque = 0;      // Qui a attaqué ? 0 = aucun, 1 = allié, 2 = ennemi

    /**
    * Initialise l'avantage d'un combat au corps à corps
    */
    init_avantage() {
        const pion1 = Pions.find(p => p.Model === this.Model_allie && p.Indice === this.Indice_allie);
        const pion2 = Pions.find(p => p.Model === this.Model_ennemi && p.Indice === this.Indice_ennemi);

        // Si les pions ne sont plus au corps à corps, on réinitialise l'avantage
        if (!isInMeleeCombat(pion1, pion2)) {
            this.Avantage = 0; // Marque le corps à corps comme terminé
            return;
        }

        // Calcul des initiatives pour déterminer l'avantage
        const init1 = calculateInitiative(pion1);
        const init2 = calculateInitiative(pion2);

        // Détermination de l'avantage selon l'initiative et la valeur de VP
        // Avantage 1 = allié (pion1), Avantage 2 = ennemi (pion2), 0 = aucun
        this.Avantage = 0;
        if (init1 < init2) {
            this.Avantage = 1;  // Allié plus rapide
        }
        else if (init1 > init2) {
            this.Avantage = 2;  // Ennemi plus rapide
        }
        else if (pion1.Vp >= pion2.Vp) {
            this.Avantage = 1;  // Égalité, allié avec plus de VP
        }
        else {
            this.Avantage = 2;  // Égalité, ennemi avec plus de VP
        }

        // Exceptions spéciales pour les sorciers
        if (pion1.Arme1 === "Lancement de sort" && pion2.Arme1 === "Lancement de sort") this.Avantage = 0;
        else if (pion2.Arme1 === "Lancement de sort") this.Avantage = 1;
        else if (pion1.Arme1 === "Lancement de sort") this.Avantage = 2;
    }
}

/**
 * Initialise et démarre le système d'attaques
 */
function start_next_round() {
    // Restauration des combats au corps à corps
    if (Cacs_save != null) {
        Cacs = cloneCacs(Cacs_save); // Clone de Cacs_save avec méthodes préservées
        Nb_rounds++;
    }
    else {
        Cacs = [];

        Pions.filter(pion1 => pion1.Type === "allies").forEach(pion1 => {
            Pions.filter(pion2 => pion2.Type === "ennemis").forEach(pion2 => {
                // Si les pions sont en combat en mélée, on crée un combat au corps à corps
                if (isInMeleeCombat(pion1, pion2)) {
                    const c = new Cac();
                    c.Model_allie = pion1.Model;
                    c.Indice_allie = pion1.Indice;
                    c.Model_ennemi = pion2.Model;
                    c.Indice_ennemi = pion2.Indice;
                    c.Attaque = 0;
                    c.init_avantage();
                    Cacs.push(c);
                }
            });
        });

        // Clone de Cacs avec méthodes préservées
        Cacs_save = cloneCacs(Cacs);
        Nb_rounds = 0;
    }

    // Réinitialisation des états des pions
    Pions.forEach(pion => {
        pion.Attaquant = false;
        pion.Defenseur = false;
        pion.Nb_action = 0;
        pion.Arme1_engagee = false;
        pion.Arme2_engagee = false;
        pion.Esquive = false;
        pion.Est_blesse = false;
        pion.at1_att = true;
        pion.at2_att = true;
        pion.pr1_def = true;
        pion.pr2_def = true;
        pion.esq_def = true;
        pion.Fatigue_down = 0;
    });

    // Calcul des timings d'initiative
    Pions.forEach(pion => {
        if (pion.Arme1 === "Lancement de sort") {
            // Création de l'attaque : lancement de sort
            const sort = Sorts.find(s => s.Nom_liste === pion.Nom_liste && s.Nom_sort === pion.Nom_sort);
            if (sort === null || typeof sort === "undefined") return;

            // Si le temps d'incantation du sort est differente de celui de base, on ne relance pas le sort
            if (pion.Incantation !== expurger_temps_sort(sort.Incantation)) return;

            const attaque1 = new Attaque();
            attaque1.Model = pion.Model;
            attaque1.Indice = pion.Indice;
            attaque1.Main = 1;
            attaque1.Timing = Nb_rounds * 5 + pion.Incantation;
            Attaques.push(attaque1);
            return;
        }

        // Attaque de la 1ère main
        const init1 = calculateInitiative(pion, 1);
        const attaque1 = new Attaque();
        attaque1.Model = pion.Model;
        attaque1.Indice = pion.Indice;
        attaque1.Timing = Nb_rounds * 5 + 2 + 0.1 * init1;
        attaque1.Main = 1;
        Attaques.push(attaque1);

        // Attaque de la 2nde main (si possible)
        if (pion.Arme2 && pion.Arme2 !== "" && pion.Arme2 !== "Bouclier") {
            const init2 = calculateInitiative(pion, 2);
            const attaque2 = new Attaque();
            attaque2.Model = pion.Model;
            attaque2.Indice = pion.Indice;
            attaque2.Timing = Nb_rounds * 5 + 3 + 0.1 * init2;
            attaque2.Main = 2;
            Attaques.push(attaque2);
        }
    });

    // Tri des attaques
    Attaques.sort(Attaque.tri);

    // Réinitialisation des variables
    break_combats = false;
    contre_attaque = null;

    Messages.ecriture_directe("Phase de combat initialisée");
}

let init_round = false;
/**
 * Passe à l'attaque suivante dans l'ordre d'initiative
 */
function next_attaque() {
    // Initialisation du round si c'est le début du round
    if (!init_round) {
        init_round = true;
        start_next_round();
    }

    // Fin du round si toutes les attaques sont terminées
    if (break_combats || Attaques.filter(a => a.Competence === null).length === 0) {
        // Prend l'avantage sur les attaquants qui n'ont pas attaqué
        Cacs.filter(c => c.Attaque === 0 && c.Avantage === 1).forEach(x => {
            const attaquant = Pions.find(p => p.Model === x.Model_allie && p.Indice === x.Indice_allie);
            const defenseur = Pions.find(p => p.Model === x.Model_ennemi && p.Indice === x.Indice_ennemi);
            prend_avantage(defenseur, attaquant);
        });
        Cacs.filter(c => c.Attaque === 0 && c.Avantage === 2).forEach(x => {
            const defenseur = Pions.find(p => p.Model === x.Model_allie && p.Indice === x.Indice_allie);
            const attaquant = Pions.find(p => p.Model === x.Model_ennemi && p.Indice === x.Indice_ennemi);
            prend_avantage(defenseur, attaquant);
        });

        // Réinitialisation des états d'attaque/défense
        Pions.forEach(pion => { pion.Attaquant = false; pion.Defenseur = false; });

        // Génération de la carte
        Map.generateHexMap();
        Map.drawHexMap();

        // Fin du round
        break_combats = true;
        contre_attaque = null;
        init_round = false;
        Messages.ecriture_directe("Fin de la phase combat");
        return;
    }

    // On expurge les éléments passé de date (dont ceux ayant Compétence non nulle)
    Attaques = Attaques.filter(a => a.Timing >= Nb_rounds * 5);
    Attaques.sort(Attaque.tri);

    // Passage à l'attaque suivante
    current_attaque = Attaques.filter(a => a.Competence === null)[0];
    const index = Attaques.indexOf(current_attaque);
    Attaques.splice(index, 1);

    // Fermeture de tous les dialogues de combat
    [dialog_attaque_1, dialog_attaque_2, dialog_attaque_3, dialog_defense_1, dialog_defense_2]
        .forEach(dialog => dialog.close());

    // Réinitialisation des états des pions
    Pions.forEach(pion => {
        pion.Attaquant = false;
        pion.Defenseur = false;
        pion.Selected = false;
        pion.Cible_sort = false;
    });

    // Sélection de l'attaquant actuel
    const attaquant = Pions.find(p => p.Model === current_attaque.Model && p.Indice === current_attaque.Indice);
    attaquant.Attaquant = true;

    // Réinitialisation des états d'attaque
    if (current_attaque.Main === 1) {
        attaquant.at1_att = true;
        attaquant.at2_att = false;
    }
    else if (current_attaque.Main === 2) {
        attaquant.at1_att = false;
        attaquant.at2_att = true;
    }
    else {
        attaquant.at1_att = false;
        attaquant.at2_att = false;
    }

    // Gestion des lancements de sorts
    if (attaquant.Arme1 === "Lancement de sort") {
        if (current_attaque.Timing > Nb_rounds * 5 + 5) {
            attaquant.Incantation -= 5;
            Attaques.push(current_attaque);
            next_attaque();
            return;
        }

        Messages.ecriture_directe(`Lancement de sort par ${attaquant.Titre} (${current_attaque.Timing.toFixed(2)}s)...`);

        // Perdre X point de fatigue pour le lanceur de sort (X étant généralement le niveau du sort ou un multiple)
        attaquant.Fatigue -= attaquant.Fatigue_sort;
        attaquant.Fatigue_down = attaquant.Fatigue_sort;

        // Sélection du lanceur de sort pour connaitre la distance entre lui et les autres pions
        attaquant.Selected = true;

        // Identification des cibles de sort : potentiellement tout le monde, mais au début aucune cible
        Pions.forEach(pion => { pion.Cible_sort = false; });

        // Affichage du panneau d'information du sort
        const sort = Sorts.find(s => s.Nom_liste === attaquant.Nom_liste && s.Nom_sort === attaquant.Nom_sort);
        if (sort !== null && typeof sort !== "undefined") {
            createSpellInfo(document.body, sort);
            if (sort.zone === "le magicien") attaquant.Cible_sort = true;
        }

        // Ne pas Fermer le panneau d'information du sort en cliquant ailleurs
        document.removeEventListener("click", closeSpellInfo);

        // Réinitialisation de la contre-attaque
        contre_attaque = null;

        // Mise à jour de la carte
        Map.generateHexMap();
        Map.drawHexMap();

        // next_attaque(); // Ne pas passer à l'attaque suivante : il faut selectionner les cibles du sort
        return;
    }

    // Identification de l'arme
    let arme = null;
    if (current_attaque.Main === 1) arme = attaquant.Arme1 ? Armes.find(a => a.Nom_arme === attaquant.Arme1) : null;
    else if (current_attaque.Main === 2) arme = attaquant.Arme2 ? Armes.find(a => a.Nom_arme === attaquant.Arme2) : null;

    // Initialisation des défenseurs
    if (contre_attaque) {
        contre_attaque.Defenseur = true;
    }
    else {
        Pions.forEach(pion => {
            if (pion.Type === attaquant.Type) return; // Pas de défense contre ceux du même camp

            // Attaque à distance : tous les ennemis peuvent défendre s'ils sont à portée
            if (arme && arme.A_distance) {
                const distance = hexDistance(
                    parseInt(attaquant.Position.split(',')[0]),
                    parseInt(attaquant.Position.split(',')[1]),
                    parseInt(pion.Position.split(',')[0]),
                    parseInt(pion.Position.split(',')[1])
                );
                if (distance <= arme.Portee) pion.Defenseur = true;
                return;
            }

            // Combat au corps à corps : vérifier les Cacs
            const combat = Cacs.find(c => {
                if (attaquant.Type === "allies") {
                    return c.Model_allie === current_attaque.Model && c.Indice_allie === current_attaque.Indice &&
                        c.Model_ennemi === pion.Model && c.Indice_ennemi === pion.Indice && c.Avantage === 1;
                } else {
                    return c.Model_allie === pion.Model && c.Indice_allie === pion.Indice &&
                        c.Model_ennemi === current_attaque.Model && c.Indice_ennemi === current_attaque.Indice && c.Avantage === 2;
                }
            });

            if (combat) pion.Defenseur = true;
        });
    }

    // Vérifier s'il y a des défenseurs
    if (!Pions.find(p => p.Defenseur)) {
        contre_attaque = null;
        next_attaque();
        return;
    }

    Map.generateHexMap();
    Map.drawHexMap();

    // Vérifier si des attaques sont possibles
    if ((!attaquant.Arme1 || attaquant.Arme1 === "" || attaquant.Arme1_engagee) &&
        (!attaquant.Arme2 || attaquant.Arme2 === "" || attaquant.Arme2 === "Bouclier" || attaquant.Arme2_engagee) &&
        (!arme || arme.A_distance)) {
        contre_attaque = null;
        next_attaque();
        return;
    }

    // Afficher le dialogue d'attaque (la cible est définie dans le cas d'une contre-attaque)
    if (contre_attaque || Pions.filter(p => p.Defenseur).length === 1) afficher_attaque(1);

    contre_attaque = null;
}

/**
 * Calcule la feinte de corps du défenseur
 */
function calcul_fdc_def() {
    const defenseur = Pions.find(p => p.Defenseur);

    if (dialog_attaque_2.querySelector(".surprise_totale").checked) return 0;
    if (dialog_attaque_2.querySelector(".immobile").checked) return 0;
    if (defenseur.Poitrine < 0) return 0;

    let fdc = defenseur.get_competence("Feinte de corps") + (defenseur.B_fdc || 0);

    // On perd 2 en FdC pour chaque attaquant au corps-à-corps qui a l'avantage
    let malus_FdC = 0;
    Cacs.forEach(c => {
        if (c.Model_allie === defenseur.Model && c.Indice_allie === defenseur.Indice && c.Avantage === 2) {
            malus_FdC += 2;
        }
        if (c.Model_ennemi === defenseur.Model && c.Indice_ennemi === defenseur.Indice && c.Avantage === 1) {
            malus_FdC += 2;
        }
    });
    if (malus_FdC > 0) malus_FdC -= 2; // La diminution de FdC n'est valable qu'au-delà du 1er attaquant
    fdc -= malus_FdC;

    // Malus de feinte de corps du défenseur
    if (dialog_attaque_2.querySelector(".surprise_partielle").checked) fdc -= 2;
    if (dialog_attaque_2.querySelector(".autre_action").checked) fdc -= 2;
    if (dialog_attaque_2.querySelector(".gene_mouvements").checked) fdc -= 2;
    if (dialog_attaque_2.querySelector(".aveugle").checked) fdc -= 2;
    if (defenseur.Jambeg < 0) fdc -= 2;
    if (defenseur.Jambed < 0) fdc -= 2;
    if (defenseur.Abdomen < 0) fdc -= 2;

    // Variation MJ
    const var_mj = parseInt(dialog_attaque_2.querySelector(".var_mj").value || 0);
    if (var_mj < 0 || var_mj > 0) fdc += var_mj;

    if (fdc < 0) fdc = 0;

    return fdc;
}

/**
 * Génère les explications pour le score d'attaque
 * @param {number} fdc - Facteur de difficulté de combat du défenseur
 * @returns {string} Explication du calcul du score d'attaque
 */
function explications_fdc_def() {
    const defenseur = Pions.find(p => p.Defenseur);
    let fdc = 0;

    let explication = `<strong>Calcul de la feinte de corps du défenseur :</strong><br>`;

    if (dialog_attaque_2.querySelector(".surprise_totale").checked) explication += `Surpise totale : FdC = 0<br>`;
    else if (dialog_attaque_2.querySelector(".immobile").checked) explication += `Immobile : FdC = 0<br>`;
    else if (defenseur.Poitrine < 0) explication += `Poitrine gravement blessée : FdC = 0<br>`;
    else {
        fdc = defenseur.get_competence("Feinte de corps");
        explication += `Base du modèle : ${defenseur.get_competence("Feinte de corps") || 0}<br>`;

        if (defenseur.B_fdc !== 0) {
            explication += `Bonus de feinte de corps : ${defenseur.B_fdc || 0}<br>`;
            fdc += (defenseur.B_fdc || 0);
        }
        if (dialog_attaque_2.querySelector(".surprise_partielle").checked) {
            explication += `Surpise partielle : -2<br>`;
            fdc -= 2;
        }
        if (dialog_attaque_2.querySelector(".autre_action").checked) {
            explication += `Autre action : -2<br>`;
            fdc -= 2;
        }
        if (dialog_attaque_2.querySelector(".gene_mouvements").checked) {
            explication += `Gêné dans ses mouvements : -2<br>`;
            fdc -= 2;
        }
        if (dialog_attaque_2.querySelector(".aveugle").checked) {
            explication += `Aveuglé : -2<br>`;
            fdc -= 2;
        }
        if (defenseur.Jambeg < 0) {
            explication += `Jambe gauche gravement blessée : -2<br>`;
            fdc -= 2;
        }
        if (defenseur.Jambed < 0) {
            explication += `Jambe droite gravement blessée : -2<br>`;
            fdc -= 2;
        }
        if (defenseur.Abdomen < 0) {
            explication += `Abdomen gravement blessé : -2<br>`;
            fdc -= 2;
        }

        // On perd 2 en FdC pour chaque attaquant au corps-à-corps qui a l'avantage
        let malus_FdC = 0;
        Cacs.forEach(c => {
            if (c.Model_allie === defenseur.Model && c.Indice_allie === defenseur.Indice && c.Avantage === 2) {
                malus_FdC += 2;
            }
            if (c.Model_ennemi === defenseur.Model && c.Indice_ennemi === defenseur.Indice && c.Avantage === 1) {
                malus_FdC += 2;
            }
        });
        if (malus_FdC > 0) malus_FdC -= 2; // La diminution de FdC n'est valable qu'au-delà du 1er attaquant

        if (malus_FdC > 0) {
            explication += `Nombre d'attaquants au corps-à-corps avec avantage : ${-malus_FdC}<br>`;
            fdc -= malus_FdC;
        }

        // Variation MJ
        const var_mj = parseInt(dialog_attaque_2.querySelector(".var_mj").value || 0);
        if (var_mj < 0 || var_mj > 0) {
            explication += `Variation MJ : ${var_mj}<br>`;
            fdc += var_mj;
        }

        // La feinte de corps ne peut pas être négative
        if (fdc < 0) {
            explication += `La feinte de corps ne peut pas être négative : FdC = 0<br>`;
            fdc = 0;
        }
    }

    explication += `Score final : ${fdc}<br>`;

    return explication;
}

/**
 * Calcule le score d'attaque final
 */
function calcul_scr_att() {
    const attaquant = Pions.find(p => p.Attaquant);
    let score = attaquant.jet_att;

    // Malus de base de -10
    score -= 10;

    // Malus de feinte de corps du défenseur
    score -= calcul_fdc_def();

    // Bonus de compétence d'arme
    if (attaquant.at1_att && attaquant.Arme1) {
        const Arme1 = Armes.find(a => a.Nom_arme === attaquant.Arme1);
        if (Arme1 !== null) {
            score += attaquant.get_competence(Arme1.Competence);
        }
    }

    if (attaquant.at2_att && attaquant.Arme2) {
        const Arme2 = Armes.find(a => a.Nom_arme === attaquant.Arme2);
        if (Arme2 !== null) {
            score += attaquant.get_competence(Arme2.Competence);
        }
    }

    // Bonus d'attaque
    score += attaquant.B_att;

    // Malus d'escrime pour combat à deux armes
    if ((attaquant.at1_att || attaquant.at2_att) && attaquant.Arme1 && attaquant.Arme1 !== "" && attaquant.Arme2 && attaquant.Arme2 !== "") {
        if (attaquant.Arme1 !== "Bouclier" && attaquant.Arme2 !== "Bouclier") {
            if (attaquant.Arme1 === "Dague" || attaquant.Arme2 === "Dague") {
                score -= Math.max(2 - attaquant.get_competence("Escrime"), 0);
            } else {
                score -= Math.max(6 - attaquant.get_competence("Escrime"), 0);
            }
        }
    }

    // Malus de zones corporelles non sélectionnées
    let malus_selected_zones = 0;
    if (!dialog_attaque_2.querySelector(".tete").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".poitrine").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".abdomen").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".brasg").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".brasd").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".jambeg").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".jambed").checked) malus_selected_zones++;
    score -= malus_selected_zones;

    return score;
}

/**
 * Génère les explications pour le score d'attaque
 * @param {number} fdc - Facteur de difficulté de combat du défenseur
 * @returns {string} Explication du calcul du score d'attaque
 */
function explications_scr_att() {
    const attaquant = Pions.find(p => p.Attaquant);

    let explication = `<strong>Calcul du score d'attaque :</strong><br>`;
    explication += `Jet de dés : ${attaquant.jet_att || 0}<br>`;
    explication += `Moins la Base : -10<br>`;
    let competence = 0;
    if (attaquant.at1_att && attaquant.Arme1) {
        const Arme1 = Armes.find(a => a.Nom_arme === attaquant.Arme1);
        if (Arme1 !== null) {
            competence = attaquant.get_competence(Arme1.Competence);
        }
    }
    else if (attaquant.at2_att && attaquant.Arme2) {
        const Arme2 = Armes.find(a => a.Nom_arme === attaquant.Arme2);
        if (Arme2 !== null) {
            competence = attaquant.get_competence(Arme2.Competence);
        }
    }
    explication += `Plus la Compétence de l'arme : ${competence}<br>`;

    let fdc = calcul_fdc_def();
    explication += `Moins la Feinte de corps : ${-fdc}<br>`;
    if ((attaquant.B_att || 0) !== 0) explication += `Bonus d'attaque : ${attaquant.B_att || 0}<br>`;

    let scoreFinal = attaquant.jet_att - 10 + competence - fdc + (attaquant.B_att || 0);

    // Malus d'escrime pour combat à deux armes
    if ((attaquant.at1_att || attaquant.at2_att) && attaquant.Arme1 && attaquant.Arme1 !== "" && attaquant.Arme2 && attaquant.Arme2 !== "") {
        if (attaquant.Arme1 !== "Bouclier" && attaquant.Arme2 !== "Bouclier") {
            if (attaquant.Arme1 === "Dague" || attaquant.Arme2 === "Dague") {
                explication += `Moins le Malus d'escrime : ${Math.max(2 - attaquant.get_competence("Escrime"), 0)}<br>`;
                scoreFinal -= Math.max(2 - attaquant.get_competence("Escrime"), 0);
            } else {
                explication += `Moins le Malus d'escrime : ${Math.max(6 - attaquant.get_competence("Escrime"), 0)}<br>`;
                scoreFinal -= Math.max(6 - attaquant.get_competence("Escrime"), 0);
            }
        }
    }

    // Malus de zones corporelles non sélectionnées
    let malus_selected_zones = 0;
    if (!dialog_attaque_2.querySelector(".tete").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".poitrine").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".abdomen").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".brasg").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".brasd").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".jambeg").checked) malus_selected_zones++;
    if (!dialog_attaque_2.querySelector(".jambed").checked) malus_selected_zones++;

    if (malus_selected_zones > 0) explication += `Moins ${malus_selected_zones} zone(s) : ${-malus_selected_zones}<br>`;
    scoreFinal -= malus_selected_zones;

    explication += `Score final : ${scoreFinal}<br>`;

    if (scoreFinal >= 0) {
        explication += `<br><span style="color: green;">✓ Attaque réussie</span>`;
    } else {
        explication += `<br><span style="color: red;">✗ Attaque échouée</span>`;
    }

    return explication;
}

/**
 * Calcule le score de défense final
 */
function calcul_scr_def() {
    const defenseur = Pions.find(p => p.Defenseur);
    let score = defenseur.jet_def;
    score -= 10;

    // Bonus de parade
    if (defenseur.pr1_def || defenseur.pr2_def) {
        let competenceArme = 0;

        let Arme1 = Armes.find(a => a.Nom_arme === defenseur.Arme1);
        if (typeof Arme1 === "undefined") Arme1 = null;
        if (defenseur.pr1_def && Arme1 !== null && Arme1.Facteur_parade !== null) {
            competenceArme += Arme1.Facteur_parade * defenseur.get_competence(Arme1.Competence);
        }

        let Arme2 = Armes.find(a => a.Nom_arme === defenseur.Arme2);
        if (typeof Arme2 === "undefined") Arme2 = null;
        if (defenseur.pr2_def && Arme2 !== null && Arme2.Facteur_parade !== null) {
            competenceArme += Arme2.Facteur_parade * defenseur.get_competence(Arme2.Competence);
        }

        score += competenceArme;
    }

    // Bonus d'esquive
    if (defenseur.esq_def) {
        score += defenseur.get_competence("Esquive");
        if (defenseur.Nb_action > 0) {
            score -= defenseur.Nb_action;
        }
    }

    // Malus d'escrime pour combat à deux armes
    if ((defenseur.pr1_def || defenseur.pr2_def) && defenseur.Arme1 && defenseur.Arme1 !== "" && defenseur.Arme2 && defenseur.Arme2 !== "") {
        if (defenseur.Arme1 !== "Bouclier" && defenseur.Arme2 !== "Bouclier") {
            if (defenseur.Arme1 === "Dague" || defenseur.Arme2 === "Dague") {
                score -= Math.max(2 - defenseur.get_competence("Escrime"), 0);
            } else {
                score -= Math.max(6 - defenseur.get_competence("Escrime"), 0);
            }
        }
    }

    // Bonus de défense
    score += defenseur.B_def;

    return score;
}

/**
 * Génère les explications pour le score de défense
 * @returns {string} Explication du calcul du score de défense
 */
function explications_scr_def() {
    const defenseur = Pions.find(p => p.Defenseur);

    let explication = `<strong>Calcul du score de défense :</strong><br>`;
    explication += `Jet de dés : ${defenseur.jet_def || 0}<br>`;
    explication += `Moins la Base : -10<br>`;

    let competenceArme = 0;
    let scoreFinal = 0;

    // Bonus de parade
    if (defenseur.pr1_def || defenseur.pr2_def) {
        const Arme1 = Armes.find(a => a.Nom_arme === defenseur.Arme1);
        if (defenseur.pr1_def && Arme1 !== null && Arme1.Facteur_parade !== null) {
            competenceArme += Arme1.Facteur_parade * defenseur.get_competence(Arme1.Competence);
        }

        const Arme2 = Armes.find(a => a.Nom_arme === defenseur.Arme2);
        if (defenseur.pr2_def && Arme2 !== null && Arme2.Facteur_parade !== null) {
            competenceArme += Arme2.Facteur_parade * defenseur.get_competence(Arme2.Competence);
        }
        explication += `Plus la Compétence de parade : ${competenceArme}<br>`;
        scoreFinal = defenseur.jet_def - 10 + competenceArme;
    }

    // Bonus d'esquive
    if (defenseur.esq_def) {
        explication += `Plus la Compétence d'esquive : ${defenseur.get_competence("Esquive")}<br>`;
        if ((defenseur.Nb_action || 0) > 0) explication += `Moins le Nombre d'actions : ${-defenseur.Nb_action}<br>`;
        scoreFinal = defenseur.jet_def - 10 + (defenseur.get_competence("Esquive") || 0) - (defenseur.Nb_action || 0);
    }

    // Malus d'escrime pour combat à deux armes
    if ((defenseur.pr1_def || defenseur.pr2_def) && defenseur.Arme1 && defenseur.Arme1 !== "" && defenseur.Arme2 && defenseur.Arme2 !== "") {
        if (defenseur.Arme1 !== "Bouclier" && defenseur.Arme2 !== "Bouclier") {
            if (defenseur.Arme1 === "Dague" || defenseur.Arme2 === "Dague") {
                explication += `Moins le Malus d'escrime : ${Math.max(2 - defenseur.get_competence("Escrime"), 0)}<br>`;
                scoreFinal -= Math.max(2 - defenseur.get_competence("Escrime"), 0);
            } else {
                explication += `Moins le Malus d'escrime : ${Math.max(6 - defenseur.get_competence("Escrime"), 0)}<br>`;
                scoreFinal -= Math.max(6 - defenseur.get_competence("Escrime"), 0);
            }
        }
    }

    // Bonus de défense
    if ((defenseur.B_def || 0) !== 0) explication += `Bonus de défense : ${defenseur.B_def || 0}<br>`;
    scoreFinal += (defenseur.B_def || 0);

    explication += `Score final : ${scoreFinal}<br>`;

    if (scoreFinal >= 0) {
        explication += `<br><span style="color: green;">✓ Défense réussie</span>`;
    } else {
        explication += `<br><span style="color: red;">✗ Défense échouée</span>`;
    }

    return explication;
}

/**
 * Calcule les dommages finaux infligés par une attaque
 * Prend en compte : la marge d'attaque, les caractéristiques de l'arme,
 * le bonus de force de l'attaquant, et la réduction par l'armure du défenseur
 * @param {number} margin - Marge d'attaque (différence entre score d'attaque et de défense)
 * @returns {number} Dommages finaux infligés (après réduction par l'armure)
 */
function calcul_dommages(margin) {
    // Récupération des pions attaquant et défenseur
    const attaquant = Pions.find(p => p.Attaquant);
    const defenseur = Pions.find(p => p.Defenseur);

    // Détermination de l'arme utilisée (1ère ou 2nde main)
    let arme = null;
    if (attaquant.at1_att) arme = attaquant.Arme1 ? Armes.find(a => a.Nom_arme === attaquant.Arme1) : null;
    if (attaquant.at2_att) arme = attaquant.Arme2 ? Armes.find(a => a.Nom_arme === attaquant.Arme2) : null;

    // Dommages de base = marge × facteur de l'arme + bonus fixe de l'arme
    let damage = margin * arme.Facteur + arme.Bonus;

    // Application du plafond : les dommages ne peuvent pas dépasser le maximum de l'arme
    if (damage > arme.Plafond) damage = arme.Plafond;

    // Le coefficient de force de l'arme multiplie le modificateur de force du personnage
    const model_att = Models.find(m => m.Nom_model === attaquant.Model);
    damage += arme.Coeff_force * Math.floor((attaquant.getValue("Force") - 10) / 2);

    // Arrondi des dommages pour éviter les décimales
    damage = Math.round(damage);

    // Détermination de la valeur d'armure selon la localisation de l'attaque
    let armor = 0;
    switch (attaquant.loc_att) {
        case "Tete": armor = defenseur.Armure_tete; break;
        case "Poitrine": armor = defenseur.Armure_poitrine; break;
        case "Abdomen": armor = defenseur.Armure_abdomen; break;
        case "Brasg": armor = defenseur.Armure_brasg; break;
        case "Brasd": armor = defenseur.Armure_brasd; break;
        case "Jambeg": armor = defenseur.Armure_jambeg; break;
        case "Jambed": armor = defenseur.Armure_jambed; break;
    }

    // Calcul des dégâts réels après réduction par l'armure
    damage = Math.max(damage - armor, 0);

    return damage;
}

/**
 * Prend l'avantage sur l'autre au corps à corps
 * @param {object} gagnant - Pion gagant l'avantage
 * @param {object} perdant - Pion perdant l'avantage
 */
function prend_avantage(gagnant, perdant) {
    const cac1 = Cacs_save.find(c =>
        c.Model_allie === perdant.Model &&
        c.Indice_allie === perdant.Indice &&
        c.Model_ennemi === gagnant.Model &&
        c.Indice_ennemi === gagnant.Indice);
    if (cac1 && cac1.Avantage != 2) {
        cac1.Avantage = 2;
        Messages.ecriture_directe(`${gagnant.Titre} prend l'avantage sur ${perdant.Titre}`);
    }
    const cac2 = Cacs_save.find(c =>
        c.Model_allie === gagnant.Model &&
        c.Indice_allie === gagnant.Indice &&
        c.Model_ennemi === perdant.Model &&
        c.Indice_ennemi === perdant.Indice);
    if (cac2 && cac2.Avantage != 1) {
        cac2.Avantage = 1;
        Messages.ecriture_directe(`${gagnant.Titre} prend l'avantage sur ${perdant.Titre}`);
    }
}

/**
 * Declare une attaque au corps à corps
 * @param {object} attaquant - Pion attaquant
 * @param {object} defenseur - Pion defenseur
 */
function declare_attaque(attaquant, defenseur) {
    const cac1 = Cacs.find(c =>
        c.Model_allie === attaquant.Model &&
        c.Indice_allie === attaquant.Indice &&
        c.Model_ennemi === defenseur.Model &&
        c.Indice_ennemi === defenseur.Indice);
    if (cac1) {
        cac1.Attaque = 1;
    }

    const cac2 = Cacs.find(c =>
        c.Model_allie === defenseur.Model &&
        c.Indice_allie === defenseur.Indice &&
        c.Model_ennemi === attaquant.Model &&
        c.Indice_ennemi === attaquant.Indice);
    if (cac2) {
        cac2.Attaque = 2;
    }
}

/**
 * Process une contre-attaque
 * Si une contre-attaque est possible, elle est déclarée
 */
function contre_attaque_defenseur() {
    const attaquant = Pions.find(p => p.Attaquant);
    const defenseur = Pions.find(p => p.Defenseur);

    if (contre_attaque) return;

    if (defenseur.Esquive) return;

    if (defenseur.Est_blesse) return;

    if ((!defenseur.Arme1 || defenseur.Arme1 === "" || defenseur.Arme1_engagee) &&
        (!defenseur.Arme2 || defenseur.Arme2 === "" || defenseur.Arme2_engagee)) return;

    let arme = null;
    if (attaquant.at1_att) {
        arme = (attaquant.Arme1 && attaquant.Arme1 !== "") ? Armes.find(a => a.Nom_arme === attaquant.Arme1) : null;
    }
    else if (attaquant.at2_att) {
        arme = (attaquant.Arme2 && attaquant.Arme2 !== "") ? Armes.find(a => a.Nom_arme === attaquant.Arme2) : null;
    }
    if (arme && arme.A_distance) return;

    // Ramener la future attaque du defenseur à la prochaine position
    let next_att_def = null;
    Attaques.filter(x =>
        x.Model === defenseur.Model &&
        x.Indice === defenseur.Indice &&
        x.Competence === null).forEach(a => {
            if (a.Main === 1) {
                if (!defenseur.Arme1 || defenseur.Arme1 === "") return;
                if (defenseur.Arme1 === "Bouclier") return;
                if (defenseur.Arme1 === "Lancement de sort") return;
                if (defenseur.Arme1_engagee) return;
            }
            if (a.Main === 2) {
                if (!defenseur.Arme2 || defenseur.Arme2 === "") return;
                if (defenseur.Arme2 === "Bouclier") return;
                if (defenseur.Arme2 === "Lancement de sort") return;
                if (defenseur.Arme2_engagee) return;
            }
            next_att_def = a;
        });

    if (next_att_def !== null && typeof next_att_def !== "undefined") {
        // Ramener la future attaque du defenseur à la prochaine position
        next_att_def.Timing = Nb_rounds * 5 + 0.01;
        Attaques.sort(Attaque.tri);

        contre_attaque = attaquant;

        // Message informant de la contre-attaque
        Messages.ecriture_directe(`${defenseur.Titre} contre-attaque ${attaquant.Titre}`);
    }
}

/**
 * Résout une attaque complète
 * Calcule les scores d'attaque et de défense, détermine le résultat,
 * applique les dégâts si l'attaque réussit, et passe à l'attaque suivante
 */
function resoudre_attaque() {
    // Récupération des pions et calcul des scores
    let attaquant = Pions.find(p => p.Attaquant);
    let defenseur = Pions.find(p => p.Defenseur);
    const scr_att = calcul_scr_att();
    const scr_def = calcul_scr_def();
    const margin = scr_att - Math.max(scr_def, 0);

    // Si l'attaquant lance un sort, on ne fait rien
    if (attaquant.Arme1 === "Lancement de sort") return;

    // Si l'attaquant est blessé, on perd l'avantage et on passe à l'attaque suivante
    if (attaquant.Est_blesse) {
        prend_avantage(defenseur, attaquant);
        contre_attaque_defenseur();
        next_attaque();
        return;
    }

    // S'il n'y a pas d'attaque, on passe à l'attaque suivante
    if (!attaquant.at1_att && !attaquant.at2_att) {
        contre_attaque_defenseur();
        next_attaque();
        return;
    }

    // Declarer l'attaque au corps à corps
    declare_attaque(attaquant, defenseur);

    // Perdre de la fatigue pour l'attaquant et/ou le défenseur selon la situation
    if (isInMeleeCombat(attaquant, defenseur)) {
        // Perdre 1 ou 2 points de fatigue pour chaque corps à corps en combat (selon la fatigue économisée)
        const fatigue_malus_attaquant = attaquant.Fatigue_eco ? 1 : 2;
        if (attaquant.Fatigue_down < fatigue_malus_attaquant) {
            attaquant.Fatigue -= (fatigue_malus_attaquant - attaquant.Fatigue_down);
            attaquant.Fatigue_down = fatigue_malus_attaquant;
        }
        const fatigue_malus_defenseur = defenseur.Fatigue_eco ? 1 : 2;
        if (defenseur.Fatigue_down < fatigue_malus_defenseur) {
            defenseur.Fatigue -= (fatigue_malus_defenseur - defenseur.Fatigue_down);
            defenseur.Fatigue_down = fatigue_malus_defenseur;
        }
    }
    else {
        // Perdre 1 point de fatigue pour l'attaquant dans les autres cas
        if (attaquant.Fatigue_down < 1) {
            attaquant.Fatigue -= 1;
            attaquant.Fatigue_down = 1;
        }
    }

    // Compter pour une action de l'attaquant
    attaquant.Nb_action++;

    // Marquer les armes attaquantes comme engagées (utilisées pour cette action)
    if (attaquant.at1_att) attaquant.Arme1_engagee = true;
    else if (attaquant.at2_att) attaquant.Arme2_engagee = true;

    if (scr_att >= 0) {
        // Marquer les armes defenseurs comme engagées (utilisées pour cette action)
        if (defenseur.pr1_def) defenseur.Arme1_engagee = true;
        else if (defenseur.pr2_def) defenseur.Arme2_engagee = true;

        // Marquer l'esquive comme utilisée (si elle a été utilisée)
        if (defenseur.esq_def) {
            defenseur.Esquive = true;
        }

        // Compter les actions de défense utilisées
        if (defenseur.pr1_def || defenseur.pr2_def || defenseur.esq_def) {
            defenseur.Nb_action++;
        }
    }

    // Case 1 : Défense échouée (scr_def négatif mais marge positive ou nulle)
    if (scr_def < 0 && margin >= 0) {
    }
    // Case 2 : Attaque interceptée partiellement (marge positive)
    else if ((margin > 0)) {
    }
    // Case 3 : Attaque interceptée mais attaquant garde l'avantage : Parade avec marge > -2 ou esquive avec marge > -4
    else if ((defenseur.pr1_def && margin > -2) || (defenseur.pr2_def && margin > -2) || (defenseur.esq_def && margin > -4)) {
    }
    // Case 4 : Attaque interceptée complètement, défenseur prend l'avantage
    else {
        if (!contre_attaque) prend_avantage(defenseur, attaquant);
    }

    // Déterminer si l'attaque réussit (marge > 0 ou marge = 0 mais défense échouée)
    if (margin > 0 || (margin === 0 && scr_def < 0)) {
        // === ATTAQUE RÉUSSIE ===

        // Calcul des dommages
        let damage = calcul_dommages(margin);

        // Appliquer les dégâts à la zone corporelle appropriée
        if (damage > 0) {
            defenseur.Pdv -= damage;

            switch (attaquant.loc_att) {
                case "tête": defenseur.Tete -= damage; break;
                case "poitrine": defenseur.Poitrine -= damage; break;
                case "abdomen": defenseur.Abdomen -= damage; break;
                case "bras gauche": defenseur.Brasg -= damage; break;
                case "bras droit": defenseur.Brasd -= damage; break;
                case "jambe gauche": defenseur.Jambeg -= damage; break;
                case "jambe droite": defenseur.Jambed -= damage; break;
            }

            // Génération du texte de localisation de l'attaque
            let texte_loc = "";
            switch (attaquant.loc_att) {
                case "abdomen":
                    texte_loc = "à l'" + attaquant.loc_att;  // "à l'abdomen"
                    break;
                case "bras gauche":
                case "bras droit":
                    texte_loc = "au " + attaquant.loc_att;  // "au bras gauche/droit"
                    break;
                case "jambe gauche":
                case "jambe droite":
                case "poitrine":
                case "tête":
                    texte_loc = "à la " + attaquant.loc_att;  // "à la jambe", "à la poitrine", etc.
                    break;
            }

            // Marquer le pion comme blessé
            defenseur.Est_blesse = true;

            // Message informant du succès de l'attaque
            Messages.ecriture_directe(`${attaquant.Titre} blesse ${defenseur.Titre} : ${damage} point(s) de vie ${texte_loc}`);

            // L'attaquant prend l'avantage sur le défenseur
            prend_avantage(attaquant, defenseur);
        }
    }
    else { // if (scr_def >= 0) {
        contre_attaque_defenseur();
    }

    next_attaque();
}
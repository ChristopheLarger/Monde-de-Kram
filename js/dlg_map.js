/**
 * FICHIER DLG_MAP.JS
 * ==================
 * Gestion des dialogues et interfaces utilisateur pour le jeu "Le Monde de Kram"
 * Contient toutes les fonctions pour afficher et gérer les dialogues de la carte
 */

/**
 * Initialise le dialogue de dimensions de la carte
 */
initialise_dim_carte();
function initialise_dim_carte() {
  const dialog_dim_carte = document.getElementById("dialog_dim_carte");

  // Validation des dimensions de carte
  dialog_dim_carte.querySelector("#Valider").addEventListener("click", function (event) {
    // Récupération des dimensions saisies
    const w = dialog_dim_carte.querySelector(".largeur").value;
    const h = dialog_dim_carte.querySelector(".hauteur").value;

    // Calcul des dimensions hexagonales
    hexDimensionsX = Math.round((((w - 1) / 2 / 3) * Math.sqrt(3)) / 1.5);
    hexDimensionsY = Math.round((h - 1) / 2 / 3);

    // Création de la forme de fond si une image est définie
    if (image_fond != null) {
      const hexHS = hexSize * 1.5;
      const hexVS = hexSize * Math.sqrt(3);

      forme_fond = new Forme("Rectangle");
      forme_fond.width = (2 * hexDimensionsX + 1.5) * hexHS;
      forme_fond.height = (2 * hexDimensionsY + 1.5) * hexVS;
      forme_fond.x = offsetX - forme_fond.width / 2;
      forme_fond.y = offsetY - forme_fond.height / 2 + hexVS / 4;
    }

    // Régénération et redessin de la carte
    Map.generateHexMap();
    Map.drawHexMap();

    dialog_dim_carte.close();
  });

  // Gestion de la touche Entrée pour valider
  dialog_dim_carte.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      dialog_dim_carte.querySelector("#Valider").click();
    }
  });

  // Calcul automatique de la hauteur selon la largeur
  dialog_dim_carte.querySelector(".largeur").addEventListener("input", function (event) {
    if (image_fond === null) return;
    dialog_dim_carte.querySelector(".hauteur").value = Math.round(
      (event.target.value * image_fond.height) / image_fond.width);
  });

  // Calcul automatique de la largeur selon la hauteur
  dialog_dim_carte.querySelector(".hauteur").addEventListener("input", function (event) {
    if (image_fond === null) return;
    dialog_dim_carte.querySelector(".largeur").value = Math.round(
      (event.target.value * image_fond.width) / image_fond.height);
  });
}

/**
 * Affiche le dialogue pour définir les dimensions de la carte
 * Permet de spécifier la largeur et la hauteur de la carte de fond
 */
function affiche_dim_carte() {
    // Valeur par défaut pour la largeur si vide
    if (dialog_dim_carte.querySelector(".largeur").value === "") {
      dialog_dim_carte.querySelector(".largeur").value = 100;
    }
  
    // Gestion de la hauteur selon l'image de fond
    if (image_fond == null) {
      dialog_dim_carte.querySelector(".hauteur").value = 100;
    } else {
      // Calcul automatique de la hauteur basé sur l'image de fond
      image_fond.onload = function () {
        dialog_dim_carte.querySelector(".hauteur").value = Math.round(
          (dialog_dim_carte.querySelector(".largeur").value * image_fond.height) / image_fond.width);
      };
    }
    dialog_dim_carte.showModal();
  }
  
  /**
   * Initialise le dialogue de dimensions d'un rectangle
   */
  initialise_dim_rectangle();
  function initialise_dim_rectangle() {
    const dialog_dim_rectangle = document.getElementById("dialog_dim_rectangle");
  
    // Fermeture du dialogue de création de rectangle
    dialog_dim_rectangle.querySelector("#Fermer").addEventListener("click", function (event) {
      dialog_dim_rectangle.close();
    });
  
    // Création d'un rectangle avec les dimensions spécifiées
    dialog_dim_rectangle.querySelector("#Creer").addEventListener("click", function (event) {
      // Récupération des dimensions saisies
      const w = dialog_dim_rectangle.querySelector(".largeur").value;
      const h = dialog_dim_rectangle.querySelector(".hauteur").value;
  
      // Création de la nouvelle forme rectangle
      Formes[Formes.length] = new Forme("Rectangle");
      const r = Formes[Formes.length - 1];
  
      // Calcul des dimensions en pixels selon le système hexagonal
      r.width = Math.abs((w / 3) * Math.sqrt(3) * hexSize);
      r.height = Math.abs((h / 3) * Math.sqrt(3) * hexSize);
  
      // Positionnement au centre du canvas
      r.x = canvas.width / 2 - r.width / 2;
      r.y = canvas.height / 2 - r.height / 2;
  
      // Application de la couleur sélectionnée
      r.color = document.getElementById("forme_color").value;
  
      dialog_dim_rectangle.close();
      Map.drawHexMap();
    });
  
    // Gestion de la touche Entrée pour créer le rectangle
    dialog_dim_rectangle.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        dialog_dim_rectangle.querySelector("#Creer").click();
      }
    });
  }
  
  /**
   * Affiche le dialogue pour définir les dimensions d'un rectangle
   */
  function affiche_dim_rectangle() {
    Forme.setFormeMode("rectangle");
    dialog_dim_rectangle.showModal();
  }
  
  /**
   * Initialise le dialogue de dimensions d'un mur
   */
  initialise_dim_mur();
  function initialise_dim_mur() {
    const dialog_dim_mur = document.getElementById("dialog_dim_mur");
  
    // Fermeture du dialogue de création de rectangle
    dialog_dim_mur.querySelector("#Fermer").addEventListener("click", function (event) {
      dialog_dim_mur.close();
    });
  
    // Création d'un rectangle avec les dimensions spécifiées
    dialog_dim_mur.querySelector("#Creer").addEventListener("click", function (event) {
      // Récupération des dimensions saisies
      const w = dialog_dim_mur.querySelector(".largeur").value;
      const h = dialog_dim_mur.querySelector(".hauteur").value;
  
      // Création de la nouvelle forme rectangle
      Formes[Formes.length] = new Forme("Mur");
      const r = Formes[Formes.length - 1];
  
      // Calcul des dimensions en pixels selon le système hexagonal
      r.width = Math.abs((w / 3) * Math.sqrt(3) * hexSize);
      r.height = Math.abs((h / 3) * Math.sqrt(3) * hexSize);
  
      // Positionnement au centre du canvas
      r.x = canvas.width / 2 - r.width / 2;
      r.y = canvas.height / 2 - r.height / 2;
  
      // Application de la couleur sélectionnée
      r.color = document.getElementById("forme_color").value;
  
      dialog_dim_mur.close();
      Map.drawHexMap();
    });
  
    // Gestion de la touche Entrée pour créer le rectangle
    dialog_dim_mur.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        dialog_dim_mur.querySelector("#Creer").click();
      }
    });
  }
  
  /**
   * Affiche le dialogue pour définir les dimensions d'un mur
   */
  function affiche_dim_mur() {
    Forme.setFormeMode("mur");
    dialog_dim_mur.showModal();
  }
  
  /**
   * Initialise le dialogue de dimensions d'une ellipse
   */
  initialise_dim_ellipse();
  function initialise_dim_ellipse() {
    const dialog_dim_ellipse = document.getElementById("dialog_dim_ellipse");
  
    // Fermeture du dialogue de création d'ellipse
    dialog_dim_ellipse.querySelector("#Fermer").addEventListener("click", function (event) {
      dialog_dim_ellipse.close();
    });
  
    // Création d'une ellipse avec les dimensions spécifiées
    dialog_dim_ellipse.querySelector("#Creer").addEventListener("click", function (event) {
      // Récupération des dimensions saisies
      const w = dialog_dim_ellipse.querySelector(".grand_axe").value;
      const h = dialog_dim_ellipse.querySelector(".petit_axe").value;
  
      // Création de la nouvelle forme ellipse
      Formes[Formes.length] = new Forme("Ellipse");
      const e = Formes[Formes.length - 1];
  
      // Calcul des dimensions en pixels selon le système hexagonal
      e.width = Math.abs((w / 3) * Math.sqrt(3) * hexSize);
      e.height = Math.abs((h / 3) * Math.sqrt(3) * hexSize);
  
      // Positionnement au centre du canvas
      e.x = canvas.width / 2;
      e.y = canvas.height / 2;
  
      // Application de la couleur sélectionnée
      e.color = document.getElementById("forme_color").value;
  
      dialog_dim_ellipse.close();
      Map.drawHexMap();
    });
  
    // Gestion de la touche Entrée pour créer l'ellipse
    dialog_dim_ellipse.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        dialog_dim_ellipse.querySelector("#Creer").click();
      }
    });
  
    // Synchronisation automatique du petit axe avec le grand axe
    dialog_dim_ellipse.querySelector(".grand_axe").addEventListener("input", function (event) {
      dialog_dim_ellipse.querySelector(".petit_axe").value = event.target.value;
    });
  }
  
  /**
   * Affiche le dialogue pour définir les dimensions d'une ellipse
   */
  function affiche_dim_ellipse() {
    Forme.setFormeMode("ellipse");
    dialog_dim_ellipse.showModal();
  }
  
// === ÉVÉNEMENTS GÉNÉRAUX ===

// Tooltips pour les boutons de terrain, formes et coordonnées
document.addEventListener("mouseover", function (event) {
    if (["rocher", "arbre", "eau", "gomme_t",
      "rectangle", "ellipse", "mur", "scission", "gomme_f",
      "coordonnees", "forme_color_btn", "portee_vue"].includes(event.target.id)) {
      tooltip.style.left = event.clientX + 10 + "px";
      tooltip.style.top = event.clientY + 10 + "px";
      tooltip.style.display = "block";
      if (event.target.id === "forme_color_btn") {
        tooltip.innerHTML = "Couleur de la forme";
      } else {
        tooltip.innerHTML = event.target.alt;
      }
    }
  });
  
  // Tooltips pour les boutons de terrain, formes et coordonnées
  document.addEventListener("mouseout", function (event) {
    if (["rocher", "arbre", "eau", "gomme_t",
      "rectangle", "ellipse", "mur", "scission", "gomme_f",
      "coordonnees", "forme_color_btn"].includes(event.target.id)) {
      tooltip.style.display = "none";
    }
  });
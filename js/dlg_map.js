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
    const w = Number(dialog_dim_carte.querySelector(".largeur").value);
    Map.setHexDimensionsFromFond(w);
    Map.updateFormeFond();
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
}

/**
 * Affiche le dialogue pour définir les dimensions de la carte
 * Permet de spécifier la largeur de la carte de fond (hauteur déduite des proportions de l'image)
 */
function affiche_dim_carte() {
  dialog_dim_carte.querySelector(".largeur").value = carteLargeurCasesDefaut;
  dialog_dim_carte.showModal();
}

// === ÉVÉNEMENTS GÉNÉRAUX ===

// === GESTION DU FOND DE CARTE ===
document.getElementById("img_fond").addEventListener("change", async (event) => {
  const form = document.getElementById("upload_fond");
  const formData = new FormData(form);
  const blobUrl = URL.createObjectURL(event.target.files[0]);
  formData.append("image", event.target.files[0]);
  formData.append("nom", "Fond");
  fetch("upload.php", { method: "POST", body: formData })
    .then((r) => r.json())
    .then((data) => {
      if (data.ok) {
        if (event.target.files.length === 0) {
          // Aucun fichier sélectionné
          image_fond = null;
        }
        else {
          image_fond = new Image();
          image_fond.onload = function () {
            Map.setHexDimensionsFromFond(carteLargeurCasesDefaut);
            Map.updateFormeFond();
            Map.generateHexMap();
            Map.drawHexMap();
            affiche_dim_carte();
          };
          image_fond.src = data.path + "?v=" + (data.version || Date.now());
        }
        URL.revokeObjectURL(blobUrl);
      }
      else console.warn("Upload fond:", data.message);
    })
    .catch((e) => {
      console.warn("Upload fond:", e);
      URL.revokeObjectURL(blobUrl);
    });
});

// Tooltips pour les boutons de terrain, formes et coordonnées
document.addEventListener("mouseover", function (event) {
  if (["non_strie", "strie", "gomme",
    "coordonnees", "color_terrain_btn", "portee_vue"].includes(event.target.id)) {
    tooltip.style.left = event.clientX + 10 + "px";
    tooltip.style.top = event.clientY + 10 + "px";
    tooltip.style.display = "block";
    if (event.target.id === "color_terrain_btn") {
      tooltip.innerHTML = "Couleur du terrain";
    } else {
      tooltip.innerHTML = event.target.alt;
    }
  }
});

// Tooltips pour les boutons de terrain, formes et coordonnées
document.addEventListener("mouseout", function (event) {
  if (["non_strie", "strie", "gomme",
    "coordonnees", "color_terrain_btn"].includes(event.target.id)) {
    tooltip.style.display = "none";
  }
});

/**
 * Affiche le dialogue de modification d'un terrain
 */
function affiche_terrain() {
  document.getElementById("div_pion").style.display = "none";
  document.getElementById("div_model").style.display = "none";
  document.getElementById("div_terrain").style.display = "block";
}

/**
 * Initialise la palette de couleurs pour les terrains (32 : transparent + 31 couleurs)
 */
const TERRAIN_COLOR_TRANSPARENT = "transparent";
const PALETTE_TERRAIN_COUNT = 32;

init_color_terrain();
function init_color_terrain() {
  const palette = document.getElementById("color_terrain_palette");
  const btn = document.getElementById("color_terrain_btn");

  const swatchTransparent = document.createElement("button");
  swatchTransparent.type = "button";
  swatchTransparent.className = "color-picker-swatch color-picker-swatch-transparent";
  swatchTransparent.dataset.color = TERRAIN_COLOR_TRANSPARENT;
  swatchTransparent.title = "Transparent";
  swatchTransparent.addEventListener("click", (event) => {
    event.stopPropagation();
    set_color_terrain(TERRAIN_COLOR_TRANSPARENT);
    palette.classList.remove("is-open");
  });
  palette.appendChild(swatchTransparent);

  palette_de_couleurs.slice(0, PALETTE_TERRAIN_COUNT - 1).forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-picker-swatch";
    swatch.dataset.color = color;
    swatch.style.backgroundColor = color;
    swatch.title = color;
    swatch.addEventListener("click", (event) => {
      event.stopPropagation();
      set_color_terrain(color);
      palette.classList.remove("is-open");
    });
    palette.appendChild(swatch);
  });

  set_color_terrain(document.getElementById("color_terrain").value);

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    palette.classList.toggle("is-open");
  });

  document.addEventListener("click", () => palette.classList.remove("is-open"));
}

/**
 * Définit la couleur du terrain
 * @param {string} color - Couleur du terrain
 */
function set_color_terrain(color) {
  const btn = document.getElementById("color_terrain_btn");
  document.getElementById("color_terrain").value = color;
  if (color === TERRAIN_COLOR_TRANSPARENT) {
    btn.style.backgroundColor = "";
    btn.classList.add("is-transparent");
  } else {
    btn.style.backgroundColor = color;
    btn.classList.remove("is-transparent");
  }
  document.querySelectorAll("#color_terrain_palette .color-picker-swatch").forEach((swatch) => {
    swatch.classList.toggle("is-selected", swatch.dataset.color === color);
  });
  document.getElementById("color_terrain_palette").dispatchEvent(new Event("input", { bubbles: true }));
}
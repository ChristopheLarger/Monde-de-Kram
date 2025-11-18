/**
 * Crée un objet Liste avec des valeurs par défaut
 * @param {Object} data - Données de la Liste (optionnel)
 * @returns {Object} Objet Liste
 */
function createListeMagie(data = {}) {
  return {
    Nom_liste: data.Nom_liste || "",
  };
}

// Tableau global contenant toutes les listes de magie disponibles
let ListesMagie = [];

/**
 * Crée un objet sort avec des valeurs par défaut
 * @param {Object} data - Données de sort (optionnel)
 * @returns {Object} Objet sort
 */
function createSort(data = {}) {
  return {
    Nom_sort: data.Nom_sort || "",
    Nom_liste: data.Nom_liste || "",
    Niveau: data.Niveau || 0,
    Portee: data.Portee || "",
    Incantation: data.Incantation || "",
    Duree: data.Duree || "",
    Sauvegarde: data.Sauvegarde || "",
    Zone: data.Zone || "",
    Description: data.Description || "",
    Col: data.Col || 0,
  };
}

// Tableau global contenant toutes les sorts disponibles
let Sorts = [];

/**
 * Crée un objet connecteur avec des valeurs par défaut
 * @param {Object} data - Données du connecteur (optionnel)
 * @returns {Object} Objet connecteur
 */

function createConnecteur(data = {}) {
  return {
    Nom_liste: data.Nom_liste || "",
    Pred_sort: data.Pred_sort || "",
    Suc_sort: data.Suc_sort || "",
  };
}

// Tableau global contenant toutes les connecteurs disponibles
let Connecteurs = [];

shortName = {
  Air: "liste de l'air",
  Controle: "liste du contrôle de soi",
  Surnaturelles: "liste des créatures surnaturelles",
  Magie: "liste de la magie pure",
  Metamorphoses: "liste de la métamorphose",
  Nature: "liste de la nature",
  Terre: "liste de la terre",
  Lumiere: "liste de la lumière et de l'électricité",
  Detections: "liste des détections",
  Illusions: "liste de l'illusion",
  Esprits: "liste de la maîtrise des esprits",
  Isolement: "liste de l'isolement",
  Feu: "liste du feu",
  Froid: "liste du froid",
  Eau: "liste de l'eau",
  Harmonie: "liste de l'harmonie",
};

function getMaxSize(Nom_liste) {
  let maxSize = 0;
  Sorts.forEach(s => {
    if (s.Nom_liste !== Nom_liste) return;
    if (s.Col > maxSize) maxSize = s.Col;
  });
  return maxSize;
}

// Initialisation quand le DOM est prêt
document.addEventListener("DOMContentLoaded", function () {
  // Récupération des éléments (si présents sur la page)
  const btn = document.getElementById("btn");
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector("#modal .close");

  // Fonctions protégées
  function openModal() {
    if (modal) modal.style.display = "flex";
  }

  function closeModal() {
    if (modal) modal.style.display = "none";
  }

  // Lier les événements seulement si les éléments existent
  if (btn && modal) {
    btn.addEventListener("click", openModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.style.display === "flex") {
        closeModal();
      }
    });
  }
});

// Gestion des clics sur les boutons magiques
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("magic-button")) {
    // Animation du bouton cliqué
    event.target.style.transform = "scale(0.95)";
    event.target.style.backgroundColor = "#2c5aa0";

    setTimeout(() => {
      event.target.style.transform = "scale(1)";
      event.target.style.backgroundColor = "#4a90e2";
    }, 150);

    // Ouvrir la liste voulue si le bouton associé est cliqué
    createListeModal(shortName[event.target.id]);
  }
});

// Fonction pour créer dynamiquement une modale de liste de magie
function createListeModal(Nom_liste) {
  // Filtrer les sorts pour cette liste
  const sortsListe = Sorts.filter((sort) => sort.Nom_liste === Nom_liste);

  // Filtrer les connecteurs pour cette liste
  const connecteursListe = Connecteurs.filter((conn) => conn.Nom_liste === Nom_liste);

  // Créer la modale
  const modal = document.createElement("div");
  modal.id = "modal";
  modal.className = "modal";
  modal.style.display = "flex";

  // Créer le contenu de la modale
  const modalContent = document.createElement("div");
  modalContent.id = "modal-content";
  modalContent.className = "modal-content";

  // Bouton de fermeture
  const closeBtn = document.createElement("span");
  closeBtn.id = "close";
  closeBtn.className = "close";
  closeBtn.innerHTML = "&times;";

  // Titre
  const title = document.createElement("h1");
  title.id = "title";
  title.className = "title";
  title.textContent = Nom_liste;

  // Conteneur des niveaux et sorts
  const conteneur = document.createElement("div");
  conteneur.id = "conteneur";
  conteneur.className = "conteneur";

  // Créer les niveaux et sorts
  const niveaux = {};
  sortsListe.forEach((sort) => {
    if (!niveaux[sort.Niveau]) {
      niveaux[sort.Niveau] = [];
    }
    niveaux[sort.Niveau].push(sort);
  });

  // Trier les niveaux
  const niveauxTries = Object.keys(niveaux)
    .map(Number)
    .sort((a, b) => a - b);

  // Créer les niveaux HTML
  niveauxTries.forEach((niveau) => {
    const levelDiv = document.createElement("div");
    levelDiv.id = `level-${niveau}`;
    levelDiv.className = "level";
    levelDiv.style.cssText =
      "grid-template-columns: 30px repeat(" + getMaxSize(Nom_liste) + ", minmax(0, 1fr));";

    // Numéro de niveau
    const levelNumber = document.createElement("div");
    levelNumber.id = `level-number-${niveau}`;
    levelNumber.className = "level-number";
    levelNumber.textContent = niveau;

    levelDiv.appendChild(levelNumber);

    // Créer les sorts pour ce niveau
    niveaux[niveau].forEach((sort) => {
      const spellNode = document.createElement("div");
      spellNode.id = `spell-${sort.Nom_sort}`;
      spellNode.className = "spell-node";
      spellNode.setAttribute("data-spell", sort.Nom_sort);
      spellNode.textContent = sort.Nom_sort;
      spellNode.classList.add(`col-${sort.Col + 1}`);

      // Gestion du hover
      spellNode.addEventListener("mouseenter", function () {
        this.style.transform = "translateY(-2px)";
        this.style.boxShadow = "0 10px 18px rgba(0, 0, 0, 0.15)";
        this.style.backgroundColor = "#e3f2fd";
      });
      spellNode.addEventListener("mouseleave", function () {
        this.style.transform = "translateY(0)";
        this.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.08)";
        this.style.backgroundColor = "";
      });

      levelDiv.appendChild(spellNode);
    });

    conteneur.appendChild(levelDiv);
  });

  // Créer le SVG pour les flèches
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "svg";
  // svg.className = "svg";
  svg.style.cssText =
    "position: absolute; top: 0; left: 0; z-index: 0; pointer-events: none; overflow: visible;";
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  // Créer le marqueur de flèche
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.id = "marker";
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "4");
  marker.setAttribute("refX", "5");
  marker.setAttribute("refY", "2");
  marker.setAttribute("orient", "auto");

  const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  polygon.id = "polygon";
  polygon.setAttribute("points", "0 0, 6 2, 0 4");
  polygon.setAttribute("fill", "#666");
  polygon.setAttribute("opacity", "0.8");

  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);
  conteneur.insertBefore(svg, conteneur.firstChild);

  // Créer le panneau d'information des sorts
  const spellInfo = document.createElement("div");
  spellInfo.id = "spell-info";
  spellInfo.className = "spell-info";
  spellInfo.innerHTML = `
    <span class="close">&times;</span>
    <h3><span id="spell-name"></span> (niv <span id="spell-level"></span>)</h3>
    <table>
      <tr>
        <td><strong>Portée :</strong></td>
        <td><span id="spell-portee"></span></td>
      </tr>
      <tr>
        <td><strong>Incantation :</strong></td>
        <td><span id="spell-incantation"></span></td>
      </tr>
      <tr>
        <td><strong>Durée :</strong></td>
        <td><span id="spell-duree"></span></td>
      </tr>
      <tr>
        <td><strong>Sauvegarde :</strong></td>
        <td><span id="spell-sauvegarde"></span></td>
      </tr>
      <tr>
        <td><strong>Zone :</strong></td>
        <td><span id="spell-zone"></span></td>
      </tr>
    </table>
    <p id="spell-description" style="text-align: justify;"></p>
  `;

  const spellInfoClose = spellInfo.querySelector(".close");
  if (spellInfoClose) {
    spellInfoClose.addEventListener("click", () => {
      spellInfo.style.display = "none";
    });
  }

  // Assembler la modale
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(title);
  modalContent.appendChild(conteneur);
  modalContent.appendChild(spellInfo);
  modal.appendChild(modalContent);

  // Ajouter la modale au body
  document.body.appendChild(modal);

  // Fonction pour créer les flèches
  function createAllArrows() {
    setTimeout(() => {
      const container = conteneur;
      const containerRect = container.getBoundingClientRect();

      connecteursListe.forEach((conn) => {
        const fromElement = container.querySelector(
          `[data-spell="${conn.Pred_sort}"]`
        );
        const toElement = container.querySelector(
          `[data-spell="${conn.Suc_sort}"]`
        );

        if (fromElement && toElement) {
          const fromRect = fromElement.getBoundingClientRect();
          const toRect = toElement.getBoundingClientRect();

          const fromSort = sortsListe.find((s) => s.Nom_sort === conn.Pred_sort);
          const toSort = sortsListe.find((s) => s.Nom_sort === conn.Suc_sort);

          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

          if (fromSort.Niveau === toSort.Niveau) {
            if (fromSort.Col < toSort.Col) {
              line.setAttribute("x1", fromRect.right - containerRect.left);
              line.setAttribute("y1", fromRect.top + fromRect.height / 2 - containerRect.top);
              line.setAttribute("x2", toRect.left - containerRect.left);
              line.setAttribute("y2", fromRect.top + fromRect.height / 2 - containerRect.top);
            } else {
              line.setAttribute("x1", fromRect.left - containerRect.left);
              line.setAttribute("y1", fromRect.top + fromRect.height / 2 - containerRect.top);
              line.setAttribute("x2", toRect.right - containerRect.left);
              line.setAttribute("y2", fromRect.top + fromRect.height / 2 - containerRect.top);
            }
          } else {
            line.setAttribute("x1", fromRect.left + fromRect.width / 2 - containerRect.left);
            line.setAttribute("y1", fromRect.bottom - containerRect.top);
            line.setAttribute("x2", toRect.left + toRect.width / 2 - containerRect.left);
            line.setAttribute("y2", toRect.top - containerRect.top);
          }

          line.setAttribute("stroke", "#666");
          line.setAttribute("stroke-width", "2.5");
          line.setAttribute("marker-end", `url(#arrowhead)`);
          line.setAttribute("opacity", "0.75");

          svg.appendChild(line);
        }
      });
    }, 500);
  }

  // Créer les flèches après le rendu
  createAllArrows();

  // Gestion des clics sur les sorts
  conteneur.addEventListener("click", function (e) {
    if (e.target.classList.contains("spell-node")) {
      const spellName = e.target.getAttribute("data-spell");
      const sort = sortsListe.find((s) => s.Nom_sort === spellName);

      if (sort) {
        document.getElementById(`spell-name`).textContent = sort.Nom_sort;
        document.getElementById(`spell-level`).textContent = sort.Niveau;
        document.getElementById(`spell-portee`).textContent = sort.Portee;
        document.getElementById(`spell-incantation`).textContent = sort.Incantation;
        document.getElementById(`spell-duree`).textContent = sort.Duree;
        document.getElementById(`spell-sauvegarde`).textContent = sort.Sauvegarde;
        document.getElementById(`spell-zone`).textContent = sort.Zone;
        document.getElementById(`spell-description`).textContent = sort.Description;

        spellInfo.style.display = "block";

        // Animation du sort cliqué
        e.target.classList.add("clicked");
        setTimeout(() => {
          e.target.classList.remove("clicked");
        }, 1000);
      }
    }
  });

  // Fermer les informations en cliquant ailleurs
  document.addEventListener("click", function (e) {
    if (
      !e.target.classList.contains("spell-node") &&
      !e.target.closest(".spell-info")
    ) {
      spellInfo.style.display = "none";
    }
  });

  // Gestion de la fermeture
  closeBtn.addEventListener("click", function () {
    document.body.removeChild(modal);
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.parentNode) {
      document.body.removeChild(modal);
    }
  });

  return modal;
}
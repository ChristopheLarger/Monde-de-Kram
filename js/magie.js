/**
 * Classe représentant une liste de magie
 */
class Liste {
  /**
   * Crée une nouvelle instance de liste avec des valeurs par défaut
   * @param {Object} data - Données de la liste (optionnel)
   */
  constructor(data = {}) {
    this.Nom_liste = data.Nom_liste || "";
  }
}

// Tableau global contenant toutes les listes de magie disponibles
let Listes = [];

/**
 * Classe représentant un sort de magie
 */
class Sort {
  /**
   * Crée une nouvelle instance de sort avec des valeurs par défaut
   * @param {Object} data - Données du sort (optionnel)
   */
  constructor(data = {}) {
    this.Nom_sort = data.Nom_sort || "";
    this.Nom_liste = data.Nom_liste || "";
    this.Niveau = data.Niveau || 0;
    this.Portee = data.Portee || "";
    this.Incantation = data.Incantation || "";
    this.Duree = data.Duree || "";
    this.Sauvegarde = data.Sauvegarde || "";
    this.Zone = data.Zone || "";
    this.Description = data.Description || "";
    this.Col = data.Col || 0;
  }
}

// Tableau global contenant toutes les sorts disponibles
let Sorts = [];

/**
 * Classe représentant un connecteur de magie
 */
class Connecteur {
  /**
   * Crée une nouvelle instance de connecteur avec des valeurs par défaut
   * @param {Object} data - Données du connecteur (optionnel)
   */
  constructor(data = {}) {
    this.Nom_liste = data.Nom_liste || "";
    this.Pred_sort = data.Pred_sort || "";
    this.Suc_sort = data.Suc_sort || "";
  }
}

// Tableau global contenant toutes les connecteurs disponibles
let Connecteurs = [];

/**
 * Classe représentant un sort connu par un personnage
 */
class SortConnu {
  /**
   * Crée une nouvelle instance de sort connu avec des valeurs par défaut
   * @param {Object} data - Données du sort connu (optionnel)
   */
  constructor(data = {}) {
    this.Nom_liste = data.Nom_liste || "";
    this.Nom_sort = data.Nom_sort || "";
    this.Nom_model = data.Nom_model || "";
  }
}

// Tableau global contenant toutes les sorts connus disponibles
let SortsConnus = [];

// Tableau global contenant les noms courts et longs des listes de magie
const shortName = Object.freeze({
  Air: "Liste de l'air",
  Controle: "Liste du contrôle de soi",
  Surnaturelles: "Liste des créatures surnaturelles",
  Magie: "Liste de la magie pure",
  Metamorphoses: "Liste de la métamorphose",
  Nature: "Liste de la nature",
  Terre: "Liste de la terre",
  Lumiere: "Liste de la lumière et de l'électricité",
  Detections: "Liste des détections",
  Illusions: "Liste de l'illusion",
  Esprits: "Liste de la maîtrise des esprits",
  Isolement: "Liste de l'isolement",
  Feu: "Liste du feu",
  Froid: "Liste du froid",
  Eau: "Liste de l'eau",
  Harmonie: "Liste de l'harmonie",
});

/**
 * Récupère le nom court d'une liste de magie à partir de son nom complet
 * @param {string} Nom_liste - Le nom de la liste de magie
 * @returns {string} Le nom court de la liste de magie
 */
function getShortName(Nom_liste) {
  for (const [key, value] of Object.entries(shortName)) {
    if (value === Nom_liste) {
      return key;
    }
  }
  return null;
}

/**
 * Récupère la taille maximale des colonnes d'un niveau pour une liste de magie
 * @param {string} Nom_liste - Le nom de la liste de magie
 * @returns {number} La taille maximale des colonnes
 */
function getMaxSize(Nom_liste) {
  let maxSize = 0;
  Sorts.forEach((s) => {
    if (s.Nom_liste !== Nom_liste) return;
    if (s.Col > maxSize) maxSize = s.Col;
  });
  return maxSize;
}

// Initialisation quand le DOM est prêt
document.addEventListener("DOMContentLoaded", function () {
  // Récupération des éléments (si présents sur la page)
  const modal = document.getElementById("modal");
  const closeBtn = document.querySelector("#modal .close");

  function closeModal() {
    if (modal) modal.style.display = "none";
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

// Gestion du menu contextuel
let stopContextMenu = false;

// Gestion du menu contextuel sur les boutons magiques
document.addEventListener("contextmenu", function (event) {

  if (stopContextMenu) {
    event.preventDefault();
    event.stopPropagation();
    stopContextMenu = false;

    return false;
  }
});

/**
 * Gère le clic sur les boutons magiques pour ouvrir la liste voulue
 * @param {MouseEvent} event - L'événement de clic
 */
document.addEventListener("mousedown", function (event) {

  if (event.target.classList.contains("magic-button")) {
    stopContextMenu = true;
    // Ouvrir la liste voulue si le bouton associé est cliqué
    createListeModal(shortName[event.target.id]);

    return false;
  }
});

/**
 * Crée dynamiquement le panneau d'information du sort
 * @param {HTMLElement} modalContent - Le contenu de la modale
 * @param {Object} sort - Le sort à afficher
  */
function createSpellInfo(modalContent, sort) {
  // Supprimer le panneau d'information existant s'il existe...
  if (document.getElementById(`spell-info`)) document.getElementById(`spell-info`).remove();

  // Créer le panneau d'information des sorts
  const spellInfo = document.createElement("div");
  spellInfo.id = "spell-info";
  spellInfo.className = "spell-info";

  // Ajouter le bouton de fermeture
  const spanClose = document.createElement("span");
  spanClose.className = "close";
  spanClose.innerHTML = "&times;";
  spellInfo.appendChild(spanClose);

  // Ajouter le titre du sort
  const h3 = document.createElement("h3");
  const h3_span1 = document.createElement("span");
  h3_span1.id = "spell-name";
  const h3_span2 = document.createElement("span");
  h3_span2.id = "spell-level";
  h3.appendChild(h3_span1);
  h3.appendChild(document.createTextNode(" (niv "));
  h3.appendChild(h3_span2);
  h3.appendChild(document.createTextNode(")"));
  spellInfo.appendChild(h3);

  // Créer le tableau pour les informations du sort
  const table = document.createElement("table");

  // Ligne 1 : Portée
  const tr1 = document.createElement("tr");
  const td1_label = document.createElement("td");
  td1_label.innerHTML = "<strong>Portée :</strong>";
  tr1.appendChild(td1_label);
  const td1_value = document.createElement("td");
  const td_span_portee = document.createElement("span");
  td_span_portee.id = "spell-portee";
  td1_value.appendChild(td_span_portee);
  tr1.appendChild(td1_value);
  table.appendChild(tr1);

  // Ligne 2 : Incantation
  const tr2 = document.createElement("tr");
  const td2_label = document.createElement("td");
  td2_label.innerHTML = "<strong>Incantation :</strong>";
  tr2.appendChild(td2_label);
  const td2_value = document.createElement("td");
  const td_span_incantation = document.createElement("span");
  td_span_incantation.id = "spell-incantation";
  td2_value.appendChild(td_span_incantation);
  tr2.appendChild(td2_value);
  table.appendChild(tr2);

  // Ligne 3 : Durée
  const tr3 = document.createElement("tr");
  const td3_label = document.createElement("td");
  td3_label.innerHTML = "<strong>Durée :</strong>";
  tr3.appendChild(td3_label);
  const td3_value = document.createElement("td");
  const td_span_duree = document.createElement("span");
  td_span_duree.id = "spell-duree";
  td3_value.appendChild(td_span_duree);
  tr3.appendChild(td3_value);
  table.appendChild(tr3);

  // Ligne 4 : Sauvegarde
  const tr4 = document.createElement("tr");
  const td4_label = document.createElement("td");
  td4_label.innerHTML = "<strong>Sauvegarde :</strong>";
  tr4.appendChild(td4_label);
  const td4_value = document.createElement("td");
  const td_span_sauvegarde = document.createElement("span");
  td_span_sauvegarde.id = "spell-sauvegarde";
  td4_value.appendChild(td_span_sauvegarde);
  tr4.appendChild(td4_value);
  table.appendChild(tr4);

  // Ligne 5 : Zone
  const tr5 = document.createElement("tr");
  const td5_label = document.createElement("td");
  td5_label.innerHTML = "<strong>Zone :</strong>";
  tr5.appendChild(td5_label);
  const td5_value = document.createElement("td");
  const td_span_zone = document.createElement("span");
  td_span_zone.id = "spell-zone";
  td5_value.appendChild(td_span_zone);
  tr5.appendChild(td5_value);
  table.appendChild(tr5);

  // Ajouter le tableau au panneau d'information
  spellInfo.appendChild(table);

  // Ligne 6 : Description
  const p = document.createElement("p");
  p.id = "spell-description";
  p.style.textAlign = "justify";
  spellInfo.appendChild(p);

  // Ajouter le panneau d'information au contenu de la modale
  modalContent.appendChild(spellInfo);

  // Injecter les informations du sort dans le panneau d'information
  document.getElementById(`spell-name`).textContent = sort.Nom_sort;
  document.getElementById(`spell-level`).textContent = sort.Niveau;
  document.getElementById(`spell-portee`).textContent = sort.Portee;
  document.getElementById(`spell-incantation`).textContent = sort.Incantation;
  document.getElementById(`spell-duree`).textContent = sort.Duree;
  document.getElementById(`spell-sauvegarde`).textContent = sort.Sauvegarde;
  document.getElementById(`spell-zone`).textContent = sort.Zone;
  document.getElementById(`spell-description`).textContent = sort.Description;

  // Afficher le panneau d'information
  document.getElementById(`spell-info`).style.display = "block";

  // Ajouter le gestionnaire de clic sur le bouton de fermeture
  spellInfo.querySelector(".close").addEventListener("click", () => {
    // Masquer le panneau d'information
    document.getElementById(`spell-info`).style.display = "none";
  });
}

/**
 * Ferme le panneau d'information du sort en cliquant ailleurs
 * @param {MouseEvent} event - L'événement de clic
 */
function closeSpellInfo(event) {
  if (!event.target.classList.contains("spell-node") &&
    document.getElementById(`spell-info`) &&
    !event.target.closest(".spell-info")) {
    document.getElementById(`spell-info`).style.display = "none";
  }
}

/**
 * Expurgue le temps d'incantation d'un sort pour obtenir le nombre de secondes
 * @param {string} Incantation - Le temps d'incantation du sort
 * @returns {number} Le nombre de secondes
 */
function expurger_incantation(Incantation) {
  let temps = 0;
  if (Incantation === "2 s (4s)") temps = 2;
  if (Incantation === "1/10 s") temps = 0.1;
  if (Incantation.endsWith(" s")) temps = parseInt(Incantation.replace(" s", ""));
  if (Incantation.endsWith(" min")) temps = 60 * parseInt(Incantation.replace(" min", ""));
  if (Incantation.endsWith(" minutes")) temps = 60 * parseInt(Incantation.replace(" minutes", ""));
  if (Incantation.endsWith(" h")) temps = 3600 * parseInt(Incantation.replace(" h", ""));
  if (Incantation.endsWith(" jour")) temps = 24 * 3600 * parseInt(Incantation.replace(" jour", ""));
  if (Incantation.endsWith(" semaine")) temps = 7 * 24 * 3600 * parseInt(Incantation.replace(" semaine", ""));

  return temps;
}

/**
 * Crée dynamiquement une modale de liste de magie
 * @param {string} Nom_liste - Le nom de la liste de magie
 * @returns {HTMLElement} La modale de la liste de magie
 */
function createListeModal(Nom_liste) {
  // Fonction pour créer les flèches
  function createAllArrows() {
    setTimeout(() => {
      const container = conteneur;
      const containerRect = container.getBoundingClientRect();
      const connecteursListe = Connecteurs.filter((conn) => conn.Nom_liste === Nom_liste);

      connecteursListe.forEach((conn) => {
        const fromElement = container.querySelector(`[data-spell="${conn.Pred_sort}"]`);
        const toElement = container.querySelector(`[data-spell="${conn.Suc_sort}"]`);

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

  // Filtrer les sorts pour cette liste
  const sortsListe = Sorts.filter((sort) => sort.Nom_liste === Nom_liste);

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
  const niveauxTries = Object.keys(niveaux).map(Number).sort((a, b) => a - b);

  // Créer les niveaux HTML
  niveauxTries.forEach((niveau) => {
    const levelDiv = document.createElement("div");
    levelDiv.id = `level-${niveau}`;
    levelDiv.className = "level";
    levelDiv.style.cssText =
      "grid-template-columns: 30px repeat(" +
      getMaxSize(Nom_liste) +
      ", minmax(0, 1fr));";

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

      // Vérifier si le sort est connu par le joueur sélectionné
      if (typeof m_selected !== "undefined" && m_selected !== null && m_selected.Model) {
        const isKnown = SortsConnus.some((sc) =>
          sc.Nom_model === m_selected.Model &&
          sc.Nom_liste === Nom_liste &&
          sc.Nom_sort === sort.Nom_sort);
        if (isKnown) {
          spellNode.style.color = "white";
          spellNode.style.backgroundColor = "green";
        }
      }

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


  // Assembler la modale
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(title);
  modalContent.appendChild(conteneur);
  modal.appendChild(modalContent);

  // Ajouter la modale au body
  document.body.appendChild(modal);

  // Créer les flèches après le rendu
  createAllArrows();

  // Gestion des clics sur les sorts
  conteneur.addEventListener("contextmenu", function (e) {
    if (e.target.classList.contains("spell-node")) {
      e.preventDefault();

      const sort = sortsListe.find((s) => s.Nom_sort === e.target.getAttribute("data-spell"));
      if (sort && typeof m_selected !== "undefined" && m_selected !== null) {
        // Stocker le sortilège sélectionné et le nom de la liste dans le pion
        m_selected.Nom_liste = sort.Nom_liste;
        m_selected.Nom_sort = sort.Nom_sort;
        m_selected.Incantation = expurger_incantation(sort.Incantation);

        // Mise à jour du sortilège sélectionné
        if (m_selected.Nom_sort && m_selected.Nom_sort !== "" && m_selected.Nom_sort !== "0" &&
          m_selected.Nom_liste && m_selected.Nom_liste !== "" && m_selected.Nom_liste !== "0") {
          dialog_details_2.querySelector(".liste").textContent = m_selected.Nom_liste;
          dialog_details_2.querySelector(".sort").textContent = m_selected.Nom_sort;
          dialog_details_2.querySelector(".info_principale").textContent =
          " (" + m_selected.Incantation + " s / " + expurger_incantation(sort.Incantation) + ")";
          afficher_param_sort(sort);
        } else {
          dialog_details_2.querySelector(".liste").textContent = "--";
          dialog_details_2.querySelector(".sort").textContent = "";
          dialog_details_2.querySelector(".info_principale").textContent = "";
        }

        // Fermer la modale
        if (modal && modal.parentNode) {
          document.body.removeChild(modal);
        }
        if (document.getElementById("modal")) {
          document.getElementById("modal").style.display = "none";
        }
      }
    }
  });

  conteneur.addEventListener("click", function (e) {
    if (e.target.classList.contains("spell-node")) {
      // Si Ctrl est pressé, ne pas ouvrir les informations du sort
      if (e.ctrlKey) {
        e.preventDefault();
        // Alterner entre vert et blanc (couleur par défaut)
        if (e.target.style.backgroundColor === "green") {
          // Si déjà vert, remettre en blanc (ou supprimer le style pour revenir à la couleur par défaut)
          e.target.style.backgroundColor = "";
          e.target.style.color = "";
        } else {
          // Sinon, mettre en vert
          e.target.style.backgroundColor = "green";
          e.target.style.color = "white";
        }
        return; // Empêcher l'ouverture du panneau d'information
      }

      // Code normal pour ouvrir les informations du sort (sans Ctrl)
      const sort = sortsListe.find((s) => s.Nom_sort === e.target.getAttribute("data-spell"));
      if (sort) {
        // Ajouter le panneau d'information du sort au contenu de la modale
        createSpellInfo(modalContent, sort);

        // Fermer le panneau d'information du sort en cliquant ailleurs
        document.addEventListener("click", closeSpellInfo);

        // Animation du sort cliqué
        e.target.classList.add("clicked");
        setTimeout(() => { e.target.classList.remove("clicked"); }, 500);
      }
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

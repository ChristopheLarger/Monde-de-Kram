/**
 * FICHIER GENERAL.JS
 * ===================
 * Ce fichier contient les fonctions générales et la communication WebSocket
 * pour le système de jeu de rôle "Le Monde de Kram"
 */

// === CONNEXION WEBSOCKET ===
// Connexion au serveur WebSocket (local ou distant)
// const ws = new WebSocket('ws://93.19.210.23:8080');  // Serveur distant
const ws = new WebSocket('ws://localhost:8080');        // Serveur local

/**
 * Gestionnaire des messages WebSocket entrants
 */
ws.onmessage = function (event) {
    console.log("MESSAGE", event.data);

    // Route le message vers les gestionnaires appropriés
    const handlers = [
        () => Localisation.receiveMessage(event.data),
        () => Login.receiveMessage(event.data),
        () => Terrain.receiveMessage(event.data),
        () => Pion.receiveMessage(event.data),
        () => Forme.receiveMessage(event.data),
        () => Map.receiveMessage(event.data),
        () => Messages.receiveMessage(event.data)
    ];
    for (const handler of handlers) {
        if (handler()) return true;
    }

    // Message de chat générique
    const result = event.data.match(/^([^:]*): (.*)$/);
    if (result) {
        Messages.write_chat(result[1], result[2]);
        return true;
    }

    return false;
};

/**
 * Envoie un message via WebSocket avec formatage automatique
 * @param {string} header - En-tête du message
 * @param {string} content - Contenu du message
 * @param {boolean} copyToChat - Si true, affiche dans le chat local
 */
function send(header, content, copyToChat = false) {
    const player = document.getElementById("joueur").value;
    const message = `${player}: ${header} ${content}`;
    ws.send(message);
    if (copyToChat) {
        Messages.ecriture_directe(`${header} ${content}`);
    }
}

/**
 * Envoie un message via WebSocket (fonction de compatibilité)
 * @param {string} entete - En-tête du message
 * @param {string} msg - Contenu du message
 * @param {boolean} copie - Si true, affiche le message dans le chat local
 */
function sendMessage(entete, msg, copie = false) {
    send(entete, msg, copie);
}

/**
 * Fonction utilitaire pour créer une pause asynchrone
 * @param {number} ms - Durée de la pause en millisecondes
 * @returns {Promise} - Promise qui se résout après la pause
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Classe Localisation - Gère la géolocalisation des utilisateurs (SIMPLIFIÉE)
 * Utilise les utilitaires pour simplifier le code
 */
class Localisation {
    static Ip;      // Adresse IP de l'utilisateur
    static Ville;   // Ville de l'utilisateur
    static Pays;    // Pays de l'utilisateur

    /**
     * Constructeur - Récupère les informations de localisation
     */
    constructor() {
        if (typeof Localisation.Ip != "undefined") return;

        // Récupération des données de géolocalisation via l'API ipinfo.io
        fetch("https://ipinfo.io/json?token=de767c312bfb8e")
            .then(response => response.json())
            .then(data => {
                Localisation.Ip = data.ip;
                Localisation.Ville = data.city;
                Localisation.Pays = data.country;
            })
            .catch(error => console.error("Erreur : ", error));
    }

    /**
     * Envoie les informations de localisation au serveur
     */
    static async sendMessage() {
        // Attendre que les données de localisation soient disponibles
        while (typeof Localisation.Ip === "undefined") await sleep(500);
        send("newMJ", `${Localisation.Pays}@${Localisation.Ville}@${Localisation.Ip}`);
    }

    /**
     * Traite les messages de changement de MJ (SIMPLIFIÉ)
     */
    static receiveMessage(data) {
        const result = data.match(/^MJ: newMJ ([^@]+)@([^@]+)@([^@]+)$/);
        if (!result) return false;

        alert(`Nouveau MJ désigné (Pays : ${result[1]}, Ville : ${result[2]}, IP : ${result[3]})`);
        location.reload(true);
        return true;
    }
}

/**
 * Classe Login - Gère la connexion des joueurs (SIMPLIFIÉE)
 */
class Login {
    /**
     * Envoie un message de connexion au serveur
     */
    static sendMessage() {
        send("login", "Connecté");
    }

    /**
     * Traite les messages de connexion des autres joueurs (SIMPLIFIÉ)
     */
    static receiveMessage(data) {
        const result = data.match(/^(.+): login .+$/);
        if (!result) return false;

        // Créer le chat pour le nouveau joueur s'il n'existe pas
        if (!document.getElementById(`chat_${result[1].toLowerCase()}`)) {
            Messages.write_chat(result[1], "");
        }

        // Ajouter le pion du joueur à la liste des alliés
        Pion.add("allies", result[1], 0);
        return true;
    }
}

/**
 * Classe Tool - Outils utilitaires pour l'interface
 * Gère l'affichage des popups et autres éléments d'interface
 */
class Tool {
    /**
     * Affiche un popup avec le texte donné
     * @param {string} text - Texte à afficher dans le popup
     */
    static showPopup(text) {
        const popup = document.getElementById("popup");
        popup.innerHTML = text;
        popup.style.display = "block";
        popup.style.opacity = "1";
    }

    /**
     * Masque le popup actuellement affiché
     */
    static hidePopup() {
        const popup = document.getElementById("popup");
        popup.style.opacity = "0";
        popup.style.display = "none";
    }
}

/**
 * Classe LancerDes - Gère les lancers de dés (SIMPLIFIÉE)
 * Utilise les utilitaires mathématiques pour simplifier le code
 */
class LancerDes {
    /**
     * Lance des dés selon un format (ex: "3D6", "2D10+5")
     * @param {string} formula - Formule de dés
     * @returns {number} Résultat du lancer
     */
    static rollDice(formula) {
        let regex = /^(\d*)$/;
        let match = formula.match(regex);
        if (match) return parseInt(formula, 10);

        regex = /^(\d*)[dD](\d+)([+-]*\d*)$/;
        match = formula.match(regex);
        if (!match) return null;

        const numDice = parseInt(match[1]) || 1;
        const numFaces = parseInt(match[2]);
        const modifier = parseInt(match[3]) || 0;

        let result = 0;
        for (let i = 0; i < numDice; i++) {
            result += Math.floor(Math.random() * numFaces) + 1;
        }
        return result + modifier;
    }

    /**
     * Lance 3 dés à 6 faces (3D6)
     */
    static sendMessage_3D6() {
        const result = LancerDes.rollDice("3D6");
        send("3D6", result.toString().padStart(2, '0'), true);
    }

    /**
     * Lance des dés selon un format personnalisé (ex: 5D12+3) (SIMPLIFIÉ)
     */
    static sendMessage_DX() {
        const formula = document.getElementById("personnalisation").value;
        const result = LancerDes.rollDice(formula);

        if (result === 0) {
            alert("Format non compris, utilisez le format tel 5D12+3, etc.");
            return;
        }

        send(formula, result.toString().padStart(2, '0'), true);
    }
}

/**
 * Classe Messages - Gère le système de chat et de communication
 * Permet d'afficher les messages des joueurs et de gérer l'interface de chat
 */
class Messages {
    static message_temp = null;  // Message temporaire affiché

    /**
     * Écrit un message dans le chat d'un joueur
     * @param {string} joueur - Nom du joueur
     * @param {string} msg - Message à afficher
     */
    static write_chat(joueur, msg) {
        if (document.getElementById("chat_mj") === null) {
            Messages.construct_chat("MJ");
        }
        if (document.getElementById(("chat_" + joueur).toLowerCase()) === null) {
            Messages.construct_chat(joueur);
        }

        let div = document.getElementById(("chat_" + joueur).toLowerCase());

        let ligne = document.createElement("div");
        ligne.innerHTML = msg;
        div.appendChild(ligne);

        div = document.getElementById(("dial_" + joueur).toLowerCase());
        div.scrollTop = div.scrollHeight;
    }

    /**
     * Écrit directement un message dans le chat du joueur actuel
     * @param {string} txt - Texte à afficher
     * @param {boolean} temporaire - Si true, le message peut être remplacé
     */
    static ecriture_directe(txt, temporaire = false) {
        const joueur = document.getElementById("joueur").value;

        if (document.getElementById("chat_mj") === null) {
            Messages.construct_chat("MJ");
        }
        if (document.getElementById(("chat_" + joueur).toLowerCase()) === null) {
            Messages.construct_chat(joueur);
        }
        let div = document.getElementById(("chat_" + joueur).toLowerCase());

        if (Messages.message_temp != null) {
            div.removeChild(Messages.message_temp);
            Messages.message_temp = null;
        }

        // Timestamp
        let ligne = document.createElement("div");
        ligne.innerHTML = new Date().toLocaleTimeString() + " : " + txt;
        div.appendChild(ligne);

        if (temporaire) {
            Messages.message_temp = ligne;
        }

        div = document.getElementById(("dial_" + joueur).toLowerCase());
        div.scrollTop = div.scrollHeight;
    }

    /**
     * Construit l'interface de chat pour un joueur
     * @param {string} joueur - Nom du joueur
     */
    static construct_chat(joueur) {
        let tr = document.getElementById("titre_dialogue");
        let td = tr.insertCell();
        td.style.width = "15%";
        let div = document.createElement("div");
        div.className = "titre_dialogue";
        td.appendChild(div);
        let span = document.createElement("span");
        span.id = ("titre_" + joueur).toLowerCase();
        span.className = "titre_perso";
        span.textContent = joueur;
        div.appendChild(span);
        let p = document.createElement("p");
        if (joueur != "MJ") p.innerHTML =
            " (F : <input type='text' id='" + ("fat_" + joueur).toLowerCase() +
            "' style='width: 25px;' " + (document.getElementById("joueur").value === "MJ" ? "" : "disabled") + ">" +
            " C : <input type='text' id='" + ("con_" + joueur).toLowerCase() +
            "' style='width: 25px;' " + (document.getElementById("joueur").value === "MJ" ? "" : "disabled") + ">)";
        else p.innerHTML = "&nbsp;";
        div.appendChild(p);

        span.addEventListener("click", () => {
            if (tr.style.display === "") tr.style.display = "none";
            else tr.style.display = "";
            Map.drawHexMap();
        });

        tr = document.getElementById("dialogue");
        td = tr.insertCell(-1);
        td.style.width = "15%";
        div = document.createElement("div");
        div.id = ("dial_" + joueur).toLowerCase();
        div.className = "dialogue";
        td.appendChild(div);
        let div2 = document.createElement("div");
        div2.id = ("chat_" + joueur).toLowerCase();
        div.appendChild(div2);

        let trs = tr.getElementsByTagName("td");
        trs[0].style.width = 15 * (trs.length - 1) + "%";

        document.getElementById(("titre_" + joueur).toLowerCase()).addEventListener("contextmenu", function (event) {
            event.preventDefault(); // Empêche l'affichage du menu contextuel par défaut
            afficher_Details_pion(joueur);
        });

        if (joueur === "MJ") return;

        const m = Models.find(x => x.Nom_model === joueur);
        document.getElementById(("fat_" + joueur).toLowerCase()).value = m.Fatigue;
        document.getElementById(("con_" + joueur).toLowerCase()).value = m.Concentration;

        document.getElementById(("fat_" + joueur).toLowerCase()).addEventListener("input", function (event) {
            const p = Pions.find(x => x.Model === joueur);
            p.Fatigue = event.target.value;
            sendMessage("Fatigue", joueur + "@" + event.target.value);
        });

        document.getElementById(("con_" + joueur).toLowerCase()).addEventListener("input", function (event) {
            const p = Pions.find(x => x.Model === joueur);
            p.Concentration = event.target.value;
            sendMessage("Concentration", joueur + "@" + event.target.value);
        });
    }

    /**
     * Traite les messages de fatigue et concentration
     * @param {string} data - Message reçu du serveur
     * @returns {boolean} - true si le message a été traité
     */
    static receiveMessage(data) {
        var regex = new RegExp("^MJ: (Fatigue|Concentration) ([^@]+)@([0-9]+)$");
        var result = data.match(regex);
        if (!result) return false;
        const cmd = result[1];
        const joueur = result[2];
        const val = parseInt(result[3], 10);
        const p = Pions.find(x => x.Model === joueur);
        switch (cmd) {
            case "Fatigue":
                p.Fatigue = val;
                document.getElementById(("fat_" + joueur).toLowerCase()).value = val;
                break;
            case "Concentration":
                p.Concentration = val;
                document.getElementById(("con_" + joueur).toLowerCase()).value = val;
                break;
        }
        return true;
    }
}

// === ÉVÉNEMENTS D'INTERFACE ===
// Gestion des événements de l'interface utilisateur

// Fermeture du popup avec la touche Échap
document.getElementById("popup").addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        event.target.style.opacity = "0";
        event.target.style.display = "none";
    }
});

// Lancement de 3D6 au clic sur le bouton
document.getElementById("3D6").addEventListener("click", function (event) {
    LancerDes.sendMessage_3D6();
});

// Lancement de dés personnalisés avec la touche Entrée
document.getElementById("personnalisation").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        LancerDes.sendMessage_DX();
    }
});

// === CHANGEMENT DE RÔLE (JOUEUR/MJ) ===
// Initialisation du jeu selon le rôle sélectionné
document.getElementById("joueur").addEventListener("change", function (event) {
    const joueur = event.target;
    let p = null;
    joueur.disabled = true;

    new Localisation();

    // === INITIALISATION SELON LE RÔLE ===
    if (joueur.value === "MJ") {
        // Mode Maître de Jeu
        document.getElementById("titre_dialogue").innerHTML = "";
        document.getElementById("dialogue").innerHTML = "";

        Localisation.sendMessage();
    }
    else {
        // Mode Joueur
        document.getElementById("div_tools").style.display = "none";
    }

    // Ouverture de la fenêtre de discussion MJ
    Messages.write_chat("MJ", "");

    document.getElementById("combat").style.display = "";

    // === CRÉATION DU PION JOUEUR ===
    if (joueur.value != "MJ") {
        if (document.getElementById(("chat_" + joueur).toLowerCase()) === null) {
            Messages.write_chat(joueur.value, "");
        }
        p = Pion.add("allies", joueur.value, 0);
        Login.sendMessage();
    }

    // === INITIALISATION DE LA CARTE ===
    Map.generateHexMap();
    Map.drawHexMap();

    // === POSITIONNEMENT DE LA VUE ===
    if (p != null && typeof p !== "undefined") p.centrer();
    else {
        // Centrage par défaut si pas de pion
        offsetX = canvas.width / 2;
        offsetY = canvas.height / 2;
    }

    canvas.focus({ preventScroll: true });

    // === RÉGÉNÉRATION FINALE DE LA CARTE ===
    Map.generateHexMap();
    Map.drawHexMap();
});
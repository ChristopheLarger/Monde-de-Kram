<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Le Monde de Kram - Jeu de Rôle</title>
    <link rel="stylesheet" href="css/index.css">
    <link rel="stylesheet" href="css/magie.css">
</head>

<body>

<?php include("interface.html"); ?>

<!-- Chargement des scripts JavaScript dans l'ordre de dépendance -->
<script src="js/model.js"></script>     <!-- Classes de base pour les modèles de personnages -->
<script src="js/arme.js"></script>      <!-- Classes pour les armes -->
<script src="js/map.js"></script>       <!-- Gestion de la carte hexagonale et des pions -->
<script src="js/forme.js"></script>     <!-- Gestion des formes géométriques -->
<script src="js/general.js"></script>   <!-- Fonctions générales et communication WebSocket -->
<script src="js/dialog.js"></script>    <!-- Gestion des dialogues et interfaces utilisateur -->
<script src="js/combat.js"></script>    <!-- Système de combat simplifié -->
<script src="js/magie.js"></script>    <!-- Système de magie -->

<script>
<?php
// === FONCTIONS UTILITAIRES POUR L'INITIALISATION ===
/**
 * Convertit une valeur de base de données en JavaScript
 */
function toJS($value, $type = 'string') {
    switch ($type) {
        case 'int':
            return is_null($value) ? "null" : "parseInt('0" . $value . "', 10)";
        case 'bool':
            return ($value === '1' || $value === 1 || $value === true || strtolower($value) === 'true') ? "true" : "false";
        case 'null':
            return is_null($value) ? "null" : "parseInt('0" . $value . "', 10)";
        default:
            return "`" . addslashes($value) . "`";
    }
}

/**
 * Génère le code JavaScript pour initialiser un modèle
 */
function generateModelJS($row, $index) {
    $js = "Models[$index] = createModel({\n";
    $js .= "    Nom: " . toJS($row['Nom']) . ",\n";
    // $js .= "    Image: new Image(\"Images/" . $row['Nom'] . ".png\"),\n";
    $js .= "    Is_joueur: " . toJS($row['Is_joueur'], 'bool') . ",\n";
    $js .= "    Capacites: " . toJS($row['Capacites']) . ",\n";
    $js .= "    Etat: " . toJS($row['Etat']) . ",\n";
    $js .= "    Pm: " . toJS($row['PM'], 'null') . ",\n";
    $js .= "    Pp: " . toJS($row['PP'], 'null') . ",\n";
    $js .= "    Vp: " . toJS($row['VP'], 'int') . ",\n";
    $js .= "    Fdc: " . toJS($row['FdC'], 'int') . ",\n";
    $js .= "    Fatigue: " . toJS($row['Fatigue'], 'int') . ",\n";
    $js .= "    Concentration: " . toJS($row['Concentration'], 'int') . ",\n";
    $js .= "    Ambidextre: " . toJS($row['Ambidextre'], 'bool') . ",\n";
    $js .= "    Escrime: " . toJS($row['Escrime'], 'int') . ",\n";
    $js .= "    Coordination: " . toJS($row['Coordination'], 'null') . ",\n";
    $js .= "    Force: " . toJS($row['Force'], 'null') . ",\n";
    $js .= "    Arme_1: " . toJS($row['Arme_1']) . ",\n";
    $js .= "    Att_1: " . toJS($row['Att_1'], 'null') . ",\n";
    $js .= "    Par_1: " . toJS($row['Par_1'], 'null') . ",\n";
    $js .= "    Arme_2: " . toJS($row['Arme_2']) . ",\n";
    $js .= "    Att_2: " . toJS($row['Att_2'], 'null') . ",\n";
    $js .= "    Par_2: " . toJS($row['Par_2'], 'null') . ",\n";
    $js .= "    Arme_3: " . toJS($row['Arme_3']) . ",\n";
    $js .= "    Att_3: " . toJS($row['Att_3'], 'null') . ",\n";
    $js .= "    Par_3: " . toJS($row['Par_3'], 'null') . ",\n";
    $js .= "    Par_Bouclier: " . toJS($row['Par_Bouclier'], 'int') . ",\n";
    $js .= "    Esquive: " . toJS($row['Esquive'], 'int') . ",\n";
    $js .= "    Armure_tete: " . toJS($row['Armure_Tete'], 'int') . ",\n";
    $js .= "    Armure_poitrine: " . toJS($row['Armure_Poitrine'], 'int') . ",\n";
    $js .= "    Armure_abdomen: " . toJS($row['Armure_Abdomen'], 'int') . ",\n";
    $js .= "    Armure_brasg: " . toJS($row['Armure_BrasG'], 'int') . ",\n";
    $js .= "    Armure_brasd: " . toJS($row['Armure_BrasD'], 'int') . ",\n";
    $js .= "    Armure_jambeg: " . toJS($row['Armure_JambeG'], 'int') . ",\n";
    $js .= "    Armure_jambed: " . toJS($row['Armure_JambeD'], 'int') . ",\n";
    $js .= "    Pdv: " . toJS($row['PdV'], 'int') . ",\n";
    $js .= "    Tete: " . toJS($row['Tete'], 'int') . ",\n";
    $js .= "    Poitrine: " . toJS($row['Poitrine'], 'int') . ",\n";
    $js .= "    Abdomen: " . toJS($row['Abdomen'], 'int') . ",\n";
    $js .= "    Brasg: " . toJS($row['BrasG'], 'int') . ",\n";
    $js .= "    Brasd: " . toJS($row['BrasD'], 'int') . ",\n";
    $js .= "    Jambeg: " . toJS($row['JambeG'], 'int') . ",\n";
    $js .= "    Jambed: " . toJS($row['JambeD'], 'int') . "\n";
    $js .= "});\n";
    return $js;
}

/**
 * Génère le code JavaScript pour initialiser une arme
 */
function generateArmeJS($row, $index) {
    $js = "Armes[$index] = createArme({\n";
    $js .= "    Nom: " . toJS($row['Nom']) . ",\n";
    $js .= "    Is_personnel: " . toJS($row['Is_personnel'], 'bool') . ",\n";
    $js .= "    Deux_mains: " . toJS($row['Deux_mains'], 'bool') . ",\n";
    $js .= "    A_projectile: " . toJS($row['A_projectile'], 'bool') . ",\n";
    $js .= "    Facteur: " . toJS($row['Facteur'], 'int') . ",\n";
    $js .= "    Bonus: " . toJS($row['Bonus'], 'int') . ",\n";
    $js .= "    Plafond: " . toJS($row['Plafond'], 'int') . ",\n";
    $js .= "    Coeff_force: " . toJS($row['Coeff_force'], 'int') . ",\n";
    $js .= "    A_distance: " . toJS($row['A_distance'], 'bool') . ",\n";
    $js .= "    Portee: " . toJS($row['Portee'], 'int') . ",\n";
    $js .= "    Init: " . toJS($row['Init'], 'int') . "\n";
    $js .= "});\n";
    return $js;
}

/**
 * Génère le code JavaScript pour initialiser les listes de magie
 */
function generateListeMagieJS($row, $index) {
    $js = "ListesMagie[$index] = createListeMagie({\n";
    $js .= "    Nom_liste: " . toJS($row['NOM_LISTE']) . "\n";
    $js .= "});\n";
    return $js;
}
/**
 * Génère le code JavaScript pour initialiser les sorts de magie
 */
function generateSortJS($row, $index) {
    $js = "Sorts[$index] = createSort({\n";
    $js .= "    Nom_sort: " . toJS($row['NOM_SORT']) . ",\n";
    $js .= "    Nom_liste: " . toJS($row['NOM_LISTE']) . ",\n";
    $js .= "    Niveau: " . toJS($row['NIVEAU'], 'int') . ",\n";
    $js .= "    Portee: " . toJS($row['PORTEE']) . ",\n";
    $js .= "    Incantation: " . toJS($row['INCANTATION']) . ",\n";
    $js .= "    Duree: " . toJS($row['DUREE']) . ",\n";
    $js .= "    Sauvegarde: " . toJS($row['SAUVEGARDE']) . ",\n";
    $js .= "    Zone: " . toJS($row['ZONE']) . ",\n";
    $js .= "    Description: " . toJS($row['DESCRIPTION']) . ",\n";
    $js .= "    Col: " . toJS($row['COL'], 'int') . "\n";
    $js .= "});\n";
    return $js;
}
/**
 * Génère le code JavaScript pour initialiser les connecteurs de magie
 */
function generateConnecteurJS($row, $index) {
    $js = "Connecteurs[$index] = createConnecteur({\n";
    $js .= "    Nom_liste: " . toJS($row['NOM_LISTE']) . ",\n";
    $js .= "    Pred_sort: " . toJS($row['PRED_SORT']) . ",\n";
    $js .= "    Suc_sort: " . toJS($row['SUC_SORT']) . "\n";
    $js .= "});\n";
    return $js;
}

// === CONNEXION À LA BASE DE DONNÉES ===
$conn = new mysqli('192.168.1.242', 'kram_app', 'Titoon#01', 'Kram');
$conn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, true);

if ($conn->connect_error) {
    echo "alert('Echec de connexion à la base de données');\n";
    return;
}

$conn->set_charset("utf8");

// === CHARGEMENT DES MODÈLES DE PERSONNAGES (SIMPLIFIÉ) ===
$query = "SELECT * FROM perso ORDER BY Is_joueur DESC, Nom ASC";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $ligne = 0;
    while ($row = $result->fetch_assoc()) {
        // Debug pour voir les valeurs de la base de données
        echo generateModelJS($row, $ligne);
        $ligne++;
    }
}

// === CHARGEMENT DES ARMES (SIMPLIFIÉ) ===
$query = "SELECT * FROM arme ORDER BY Nom ASC";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $ligne = 0;
    while ($row = $result->fetch_assoc()) {
        echo generateArmeJS($row, $ligne);
        $ligne++;
    }
}
// === CHARGEMENT DES LISTES DE MAGIE ===
$query = "SELECT * FROM liste";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $ligne = 0;
    while ($row = $result->fetch_assoc()) {
        // Debug pour voir les valeurs de la base de données
        echo generateListeMagieJS($row, $ligne);
        $ligne++;
    }
    // === CHARGEMENT DES SORTS ===
$query = "SELECT * FROM sort ORDER BY Nom_liste ASC, Niveau ASC, Col ASC";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $ligne = 0;
    while ($row = $result->fetch_assoc()) {
        echo generateSortJS($row, $ligne);
        $ligne++;
    }
}
// === CHARGEMENT DES CONNECTEURS ===
$query = "SELECT * FROM connecteur";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $ligne = 0;
    while ($row = $result->fetch_assoc()) {
        echo generateConnecteurJS($row, $ligne);
        $ligne++;
    }
}
}

$conn->close();
?>

// === INITIALISATION DES IMAGES ===
// Chargement des images pour tous les modèles
for (let i = 0; i < Models.length; i++) {
    Models[i].Image = new Image();
    Models[i].Image.src = "Images/" + Models[i].Nom + ".png";
    Models[i].Image.onerror = function() {
        console.warn("Image non trouvée pour " + Models[i].Nom + ": Images/" + Models[i].Nom + ".png");
    };
}

// === INITIALISATION DE L'INTERFACE ===
// Ajout des joueurs dans le sélecteur
for (let i = 0; i < Models.length; i++) {
    if (Models[i].Is_joueur) {
        let nouvelleOption = document.createElement("option");
        nouvelleOption.value = Models[i].Nom;
        nouvelleOption.textContent = Models[i].Nom;
        document.getElementById("joueur").appendChild(nouvelleOption);
    }
}

// === Initialisation du jeu pour les tests ===
// ============================================

// Pré-sélectionner "Maitre du Jeu" dès l'ouverture du site
document.getElementById("joueur").value = "MJ";

// Déclencher l'événement change pour initialiser l'interface
const changeEvent = new Event('change', { bubbles: true, cancelable: true });
document.getElementById("joueur").dispatchEvent(changeEvent);

// Attendre que l'interface soit complètement initialisée
setTimeout(function() {
    // Créer un pion de modèle "Christophe" de type "allié"
    const christophe = Pion.add("allies", "Christophe");
    if (christophe) {
        christophe.Control = "MJ";
    }
    // Créer un pion de modèle "Elémental d'air" de type "ennemi"
    const elemental_eau = Pion.add("allies", "Elémental d'eau");
    if (elemental_eau) {
        elemental_eau.Control = "MJ";
    }    
    // Créer un pion de modèle "Guilhem" de type "ennemi"
    const guilhem = Pion.add("ennemis", "Guilhem");
    if (guilhem) {
        guilhem.Control = "MJ";
    }    
    // Créer un pion de modèle "Elémental d'air" de type "ennemi"
    const elemental_air = Pion.add("ennemis", "Elémental d'air");
    if (elemental_air) {
        elemental_air.Control = "MJ";
    }
    
    // Régénérer la carte pour afficher les nouveaux pions
    Map.generateHexMap();
    Map.drawHexMap();
    
    // Donner le focus à la carte
    canvas.focus({ preventScroll: true });
}, 200);
</script>
</body>
</html>

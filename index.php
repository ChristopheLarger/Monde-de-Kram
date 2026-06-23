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
    <script src="js/model.js"></script> <!-- Classes de base pour les modèles de personnages -->
    <script src="js/pion.js"></script> <!-- Classes pour les pions -->
    <script src="js/arme.js"></script> <!-- Classes pour les armes -->
    <script src="js/divers.js"></script> <!-- Classes diverses -->
    <script src="js/map.js"></script> <!-- Gestion de la carte hexagonale -->
    <script src="js/terrain.js"></script> <!-- Gestion des terrains -->
    <script src="js/general.js"></script> <!-- Fonctions générales et communication WebSocket -->
    <script src="js/magie.js"></script> <!-- Système de magie -->
    <script src="js/combat.js"></script> <!-- Système de combat -->
    <script src="js/dlg_perso.js"></script> <!-- Gestion des dialogues des personnages -->
    <script src="js/dlg_map.js"></script> <!-- Gestion des dialogues de la carte -->
    <script src="js/dlg_combat.js"></script> <!-- Gestion des dialogues de combat -->

    <script>
        <?php
        // === FONCTIONS UTILITAIRES POUR L'INITIALISATION ===
        /**
         * Convertit une valeur de base de données en JavaScript
         */
        function toJS($value, $type = 'string')
        {
            switch ($type) {
                case 'int':
                    return is_null($value) ? "null" : "parseInt('0" . $value . "')";
                case 'int2':
                    return is_null($value) ? "null" : "parseInt('" . $value . "')";
                case 'bool':
                    return ($value === '1' || $value === 1 || $value === true || strtolower($value) === 'true') ? "true" : "false";
                case 'null':
                    return is_null($value) ? "null" : json_encode($value);
                default:
                    return json_encode($value);
            }
        }

        /**
         * Génère le code JavaScript pour initialiser un modèle
         */
        function generateModelJS($row, $index)
        {
            $js = "Models[$index] = new Model({\n";
            $js .= "    Nom_model: " . toJS($row['Nom_model']) . ",\n";
            $js .= "    Is_joueur: " . toJS($row['Is_joueur'], 'bool') . ",\n";
            $js .= "    Is_monster: " . toJS($row['Is_monster'], 'bool') . ",\n";

            $js .= "    Force: " . toJS($row['Force'], 'int') . ",\n";
            $js .= "    Constitution: " . toJS($row['Constitution'], 'int') . ",\n";
            $js .= "    Vivacite_physique: " . toJS($row['Vivacite_physique'], 'int') . ",\n";
            $js .= "    Perception: " . toJS($row['Perception'], 'int') . ",\n";

            $js .= "    Vivacite_mentale: " . toJS($row['Vivacite_mentale'], 'int') . ",\n";
            $js .= "    Volonte: " . toJS($row['Volonte'], 'int') . ",\n";
            $js .= "    Abstraction: " . toJS($row['Abstraction'], 'int') . ",\n";
            $js .= "    Charisme: " . toJS($row['Charisme'], 'int') . ",\n";

            $js .= "    Adaptation: " . toJS($row['Adaptation'], 'int') . ",\n";
            $js .= "    Combat: " . toJS($row['Combat'], 'int') . ",\n";
            $js .= "    Foi: " . toJS($row['Foi'], 'int') . ",\n";
            $js .= "    Magie: " . toJS($row['Magie'], 'int') . ",\n";
            $js .= "    Memoire: " . toJS($row['Memoire'], 'int') . ",\n";
            $js .= "    Telepathie: " . toJS($row['Telepathie'], 'int') . ",\n";

            $js .= "    Force_experience: " . toJS($row['Force_experience'], 'int') . ",\n";
            $js .= "    Constitution_experience: " . toJS($row['Constitution_experience'], 'int') . ",\n";
            $js .= "    Vivacite_physique_experience: " . toJS($row['Vivacite_physique_experience'], 'int') . ",\n";
            $js .= "    Perception_experience: " . toJS($row['Perception_experience'], 'int') . ",\n";

            $js .= "    Vivacite_mentale_experience: " . toJS($row['Vivacite_mentale_experience'], 'int') . ",\n";
            $js .= "    Volonte_experience: " . toJS($row['Volonte_experience'], 'int') . ",\n";
            $js .= "    Abstraction_experience: " . toJS($row['Abstraction_experience'], 'int') . ",\n";
            $js .= "    Charisme_experience: " . toJS($row['Charisme_experience'], 'int') . ",\n";
            
            $js .= "    Adaptation_experience: " . toJS($row['Adaptation_experience'], 'int') . ",\n";
            $js .= "    Combat_experience: " . toJS($row['Combat_experience'], 'int') . ",\n";
            $js .= "    Foi_experience: " . toJS($row['Foi_experience'], 'int') . ",\n";
            $js .= "    Magie_experience: " . toJS($row['Magie_experience'], 'int') . ",\n";
            $js .= "    Memoire_experience: " . toJS($row['Memoire_experience'], 'int') . ",\n";
            $js .= "    Telepathie_experience: " . toJS($row['Telepathie_experience'], 'int') . ",\n";

            $js .= "    Nb_blessures_max: " . toJS($row['Nb_blessures_max'], 'int') . ",\n";
            $js .= "    Vue: " . toJS($row['Vue'], 'int') . ",\n";
            
            $js .= "    Seuil_blessures: " . toJS($row['Seuil_blessures'], 'int') . ",\n";
            $js .= "    Fatigue: " . toJS($row['Fatigue'], 'int') . ",\n";
            $js .= "    Puissance_mentale: " . toJS($row['Puissance_mentale'], 'int') . ",\n";
            $js .= "    Puissance_physique: " . toJS($row['Puissance_physique'], 'int') . ",\n";
            $js .= "    Vivacite_physique2: " . toJS($row['Vivacite_physique2'], 'int') . ",\n";
            $js .= "    Capacites: " . toJS($row['Capacites']) . ",\n";
            $js .= "    Initiative: " . toJS($row['Initiative'], 'int') . ",\n";
            $js .= "    Agressivite: " . toJS($row['Agressivite'], 'int') . ",\n";
            $js .= "    Sociabilite: " . toJS($row['Sociabilite'], 'int') . ",\n";
            $js .= "    Esquive: " . toJS($row['Esquive'], 'int') . ",\n";
            $js .= "    Feinte_de_corps: " . toJS($row['Feinte_de_corps'], 'int') . ",\n";
            $js .= "    Attaque_1: " . toJS($row['Attaque_1'], 'int') . ",\n";
            $js .= "    Parade_1: " . toJS($row['Parade_1'], 'int') . ",\n";
            $js .= "    Bool_parade_1: " . toJS($row['Bool_parade_1'], 'bool') . ",\n";
            $js .= "    Coefficient_dommages_1: " . toJS($row['Coefficient_dommages_1']) . ",\n";
            $js .= "    Bonus_dommages_1: " . toJS($row['Bonus_dommages_1'], 'int') . ",\n";
            $js .= "    Attaque_2: " . toJS($row['Attaque_2'], 'int') . ",\n";
            $js .= "    Bool_attaque_2: " . toJS($row['Bool_attaque_2'], 'bool') . ",\n";
            $js .= "    Parade_2: " . toJS($row['Parade_2'], 'int') . ",\n";
            $js .= "    Bool_parade_2: " . toJS($row['Bool_parade_2'], 'bool') . ",\n";
            $js .= "    Coefficient_dommages_2: " . toJS($row['Coefficient_dommages_2']) . ",\n";
            $js .= "    Bonus_dommages_2: " . toJS($row['Bonus_dommages_2'], 'int') . ",\n";

            $js .= "    Concentration: " . toJS($row['Concentration'], 'int') . ",\n";

            $js .= "    Armure_tete: " . toJS($row['Armure_Tete'], 'int') . ",\n";
            $js .= "    Armure_poitrine: " . toJS($row['Armure_Poitrine'], 'int') . ",\n";
            $js .= "    Armure_abdomen: " . toJS($row['Armure_Abdomen'], 'int') . ",\n";
            $js .= "    Armure_brasg: " . toJS($row['Armure_BrasG'], 'int') . ",\n";
            $js .= "    Armure_brasd: " . toJS($row['Armure_BrasD'], 'int') . ",\n";
            $js .= "    Armure_jambeg: " . toJS($row['Armure_JambeG'], 'int') . ",\n";
            $js .= "    Armure_jambed: " . toJS($row['Armure_JambeD'], 'int') . ",\n";

            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser une arme
         */
        function generateArmeJS($row, $index)
        {
            $js = "Armes[$index] = new Arme({\n";
            $js .= "    Nom_arme: " . toJS($row['Nom_arme']) . ",\n";
            $js .= "    Competence: " . toJS($row['Competence']) . ",\n";
            $js .= "    Facteur_parade: " . toJS($row['Facteur_parade'], 'null') . ",\n";
            $js .= "    Is_personnel: " . toJS($row['Is_personnel'], 'bool') . ",\n";
            $js .= "    Deux_mains: " . toJS($row['Deux_mains'], 'bool') . ",\n";
            $js .= "    A_projectile: " . toJS($row['A_projectile'], 'bool') . ",\n";
            $js .= "    Facteur: " . toJS($row['Facteur'], 'null') . ",\n";
            $js .= "    Bonus: " . toJS($row['Bonus'], 'int') . ",\n";
            $js .= "    Plafond: " . toJS($row['Plafond'], 'int') . ",\n";
            $js .= "    Coeff_force: " . toJS($row['Coeff_force'], 'null') . ",\n";
            $js .= "    A_distance: " . toJS($row['A_distance'], 'bool') . ",\n";
            $js .= "    Portee: " . toJS($row['Portee'], 'int') . ",\n";
            $js .= "    Init: " . toJS($row['Init'], 'int') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les listes de magie
         */
        function generateListeMagieJS($row, $index)
        {
            $js = "Listes[$index] = new Liste({\n";
            $js .= "    Nom_liste: " . toJS($row['Nom_liste']) . ",\n";
            $js .= "    Nom_jumelee: " . toJS($row['Nom_jumelee']) . "\n";
            $js .= "});\n";
            return $js;
        }
        /**
         * Génère le code JavaScript pour initialiser les sorts de magie
         */
        function generateSortJS($row, $index)
        {
            $js = "Sorts[$index] = new Sort({\n";
            $js .= "    Nom_sort: " . toJS($row['Nom_sort']) . ",\n";
            $js .= "    Nom_liste: " . toJS($row['Nom_liste']) . ",\n";
            $js .= "    Niveau: " . toJS($row['Niveau'], 'int') . ",\n";
            $js .= "    Portee: " . toJS($row['Portee']) . ",\n";
            $js .= "    Incantation: " . toJS($row['Incantation']) . ",\n";
            $js .= "    Duree: " . toJS($row['Duree']) . ",\n";
            $js .= "    Sauvegarde: " . toJS($row['Sauvegarde']) . ",\n";
            $js .= "    Zone: " . toJS($row['Zone']) . ",\n";
            $js .= "    Description: " . toJS($row['Description']) . ",\n";
            $js .= "    Col: " . toJS($row['Col'], 'int') . "\n";
            $js .= "});\n";
            return $js;
        }
        /**
         * Génère le code JavaScript pour initialiser les connecteurs de magie
         */
        function generateConnecteurJS($row, $index)
        {
            $js = "Connecteurs[$index] = new Connecteur({\n";
            $js .= "    Nom_liste: " . toJS($row['Nom_liste']) . ",\n";
            $js .= "    Pred_sort: " . toJS($row['Pred_sort']) . ",\n";
            $js .= "    Suc_sort: " . toJS($row['Suc_sort']) . "\n";
            $js .= "});\n";
            return $js;
        }
        /**
         * Génère le code JavaScript pour initialiser les connecteurs de magie
         */
        function generateSortConnuJS($row, $index)
        {
            $js = "SortsConnus[$index] = new SortConnu({\n";
            $js .= "    Nom_liste: " . toJS($row['Nom_liste']) . ",\n";
            $js .= "    Nom_sort: " . toJS($row['Nom_sort']) . ",\n";
            $js .= "    Nom_model: " . toJS($row['Nom_model']) . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les compétences
         */
        function generateCompetenceJS($row, $index)
        {
            $js = "Competences[$index] = new Competence({\n";
            $js .= "    Nom_model: " . toJS($row['Nom_model']) . ",\n";
            $js .= "    Nom: " . toJS($row['Nom']) . ",\n";
            $js .= "    Degres: " . toJS($row['Degres'], 'int') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les désavantages
         */
        function generateAvantageJS($row, $index)
        {
            $js = "Avantages[$index] = new Avantage({\n";
            $js .= "    Nom_model: " . toJS($row['Nom_model']) . ",\n";
            $js .= "    Nom: " . toJS($row['Nom']) . ",\n";
            $js .= "    Selection: " . toJS($row['Selection'], 'bool') . ",\n";
            $js .= "    Parametre: " . toJS($row['Parametre'], 'null') . ",\n";
            $js .= "    Type: " . toJS($row['Type'], 'null') . ",\n";
            $js .= "    Niveau_creation: " . toJS($row['Niveau_creation'], 'null') . ",\n";
            $js .= "    Niveau_experience: " . toJS($row['Niveau_experience'], 'null') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les désavantages
         */
        function generateDesavantageJS($row, $index)
        {
            $js = "Desavantages[$index] = new Desavantage({\n";
            $js .= "    Nom_model: " . toJS($row['Nom_model']) . ",\n";
            $js .= "    Nom: " . toJS($row['Nom']) . ",\n";
            $js .= "    Selection: " . toJS($row['Selection'], 'bool') . ",\n";
            $js .= "    Niveau: " . toJS($row['Niveau'], 'null') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les bonus
         */
        function generateBonusJS($row, $index)
        {
            $js = "ListeBonus[$index] = new Bonus({\n";
            $js .= "    Nom_bonus: " . toJS($row['Nom_bonus']) . ",\n";
            $js .= "    Nature: " . toJS($row['Nature']) . ",\n";
            $js .= "    Ordre: " . toJS($row['Ordre'], 'int2') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les bonus de sort
         */
        function generateBonusSortJS($row, $index)
        {
            $js = "Bonus_sorts[$index] = new Bonus_sort({\n";
            $js .= "    Nom_bonus: " . toJS($row['Nom_bonus']) . ",\n";
            $js .= "    Nom_liste: " . toJS($row['Nom_liste']) . ",\n";
            $js .= "    Nom_sort: " . toJS($row['Nom_sort']) . ",\n";
            $js .= "    Succes: " . toJS($row['Succes'], 'bool') . ",\n";
            $js .= "    Valeur: " . toJS($row['Valeur'], 'null') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser un terrain
         * Correspond intégralement et exclusivement aux propriétés du constructeur Pion (js/terrain.js)
         */
        function generateTerrainJS($row, $index)
        {
            $js = "Terrains[$index] = new Terrain({\n";
            $js .= "    Type: " . toJS($row['Type']) . ",\n";
            $js .= "    Position: " . toJS($row['Position']) . ",\n";
            $js .= "    Color: " . toJS($row['Color']) . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser un pion
         * Correspond intégralement et exclusivement aux propriétés du constructeur Pion (js/pion.js)
         */
        function generatePionJS($row, $index)
        {
            $js = "Pions[$index] = new Pion({\n";
            $js .= "    Type: " . toJS($row['Type']) . ",\n";
            $js .= "    Model: " . toJS($row['Model']) . ",\n";
            $js .= "    Position: " . toJS($row['Position']) . ",\n";
            $js .= "    Selected: " . toJS($row['Selected'], 'bool') . ",\n";
            $js .= "    Indice: " . toJS($row['Indice'], 'int') . ",\n";
            $js .= "    Vue: " . toJS($row['Vue'], 'int') . ",\n";
            $js .= "    Titre: " . toJS($row['Titre']) . ",\n";
            $js .= "    Arme1: " . toJS($row['Arme1']) . ",\n";
            $js .= "    Arme2: " . toJS($row['Arme2']) . ",\n";
            $js .= "    Note: " . toJS($row['Note']) . ",\n";
            $js .= "    Fatigue: " . toJS($row['Fatigue'], 'int') . ",\n";
            $js .= "    Concentration: " . toJS($row['Concentration'], 'int') . ",\n";
            $js .= "    General: " . toJS($row['General'], 'int') . ",\n";
            $js .= "    Tete: " . toJS($row['Tete'], 'int') . ",\n";
            $js .= "    Poitrine: " . toJS($row['Poitrine'], 'int') . ",\n";
            $js .= "    Abdomen: " . toJS($row['Abdomen'], 'int') . ",\n";
            $js .= "    Brasg: " . toJS($row['Brasg'], 'int') . ",\n";
            $js .= "    Brasd: " . toJS($row['Brasd'], 'int') . ",\n";
            $js .= "    Jambeg: " . toJS($row['Jambeg'], 'int') . ",\n";
            $js .= "    Jambed: " . toJS($row['Jambed'], 'int') . ",\n";
            $js .= "});\n";
            return $js;
        }

        // === CONNEXION À LA BASE DE DONNÉES ===
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');
        $conn->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, true);

        if ($conn->connect_error) {
            echo "alert('Echec de connexion à la base de données');\n";
            return;
        }

        $conn->set_charset("utf8");

        // === CHARGEMENT DES MODÈLES DE PERSONNAGES (SIMPLIFIÉ) ===
        $query = "SELECT * FROM model ORDER BY Is_joueur DESC, Nom_model ASC";
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
        $query = "SELECT * FROM arme ORDER BY Nom_arme ASC";
        $result = $conn->query($query);

        if ($result->num_rows > 0) {
            $ligne = 0;
            while ($row = $result->fetch_assoc()) {
                echo generateArmeJS($row, $ligne);
                $ligne++;
            }
        }
        // === CHARGEMENT DES LISTES DE MAGIE ===
        $query = "SELECT * FROM liste ORDER BY Nom_liste ASC";
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
            $query = "SELECT * FROM connecteur ORDER BY Nom_liste ASC, Pred_sort ASC, Suc_sort ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateConnecteurJS($row, $ligne);
                    $ligne++;
                }
            }


            // === CHARGEMENT DES SORTS CONNUS ===
            $query = "SELECT * FROM sort_connu ORDER BY Nom_model ASC, Nom_liste ASC, Nom_sort ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateSortConnuJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES COMPÉTENCES ===
            $query = "SELECT * FROM competence ORDER BY Nom_model ASC, Nom ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateCompetenceJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES AVANTAGES ===
            $query = "SELECT * FROM avantage ORDER BY Nom_model ASC, Nom ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateAvantageJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES DESAVANTAGES ===
            $query = "SELECT * FROM desavantage ORDER BY Nom_model ASC, Nom ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateDesavantageJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES BONUS ===
            $query = "SELECT * FROM bonus ORDER BY Nature ASC, Ordre ASC, Nom_bonus ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateBonusJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES BONUS DE SORT ===
            $query = "SELECT * FROM bonus_sort ORDER BY Nom_liste ASC, Nom_sort ASC, Nom_bonus ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateBonusSortJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES TERRAINS ===
            $query = "SELECT * FROM terrain ORDER BY `Type` ASC, Position ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateTerrainJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES PIONS ===
            $query = "SELECT * FROM pion ORDER BY Type ASC, Model ASC, Indice ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generatePionJS($row, $ligne);
                    $ligne++;
                }
            }
        }

        $conn->close();
        ?>

        // === INITIALISATION DES IMAGES ===
        // Chargement des images pour tous les modèles
        let count = 0;
        for (let i = 0; i < Models.length; i++) {
            Models[i].Image = new Image();
            Models[i].Image.onload = function() { count++; }
            Models[i].Image.src = "Images/Figurines/" + Models[i].Nom_model + ".png";
            Models[i].Image.onerror = function() {
                console.warn("Image non trouvée pour " + Models[i].Nom_model + ": images/Figurines/" + Models[i].Nom_model + ".png");
            };
        }

        (async () => { // Attendre que les images soient chargées
            while (count < Models.length) { await sleep(100); }
            await Map.loadImageFond("images/Figurines/Fond.png").catch(() => {});
            Map.generateHexMap();
            Map.drawHexMap();
        })();

        // === INITIALISATION DE L'INTERFACE ===
        // Ajout des joueurs dans le sélecteur
        for (let i = 0; i < Models.length; i++) {
            if (Models[i].Is_joueur) {
                let nouvelleOption = document.createElement("option");
                nouvelleOption.value = Models[i].Nom_model;
                nouvelleOption.textContent = Models[i].Nom_model;
                document.getElementById("joueur").appendChild(nouvelleOption);
            }
        }

        // Donner le focus à la carte
        canvas.focus({ preventScroll: true });

        // === Initialisation du jeu pour les tests ===
        // ============================================

        // Pré-sélectionner "Maitre du Jeu" dès l'ouverture du site
        document.getElementById("joueur").value = "MJ";
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        document.getElementById("joueur").dispatchEvent(changeEvent);

        const def = Pions.find(pion => pion.Type === 'allies');
        const att1 = Pions.filter(pion => pion.Type === 'ennemis')[0];
        const att2 = Pions.filter(pion => pion.Type === 'ennemis')[1];
        const m = new Melee(def, att1, att2);
        Melees.push(m);

        initialise_melee();
        affiche_attaque();
    </script>
</body>

</html>
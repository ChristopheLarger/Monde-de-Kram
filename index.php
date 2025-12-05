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
    <script src="js/arme.js"></script> <!-- Classes pour les armes -->
    <script src="js/competence.js"></script> <!-- Classes pour les armes -->
    <script src="js/map.js"></script> <!-- Gestion de la carte hexagonale et des pions -->
    <script src="js/forme.js"></script> <!-- Gestion des formes géométriques -->
    <script src="js/general.js"></script> <!-- Fonctions générales et communication WebSocket -->
    <script src="js/dialog.js"></script> <!-- Gestion des dialogues et interfaces utilisateur -->
    <script src="js/magie.js"></script> <!-- Système de magie -->
    <script src="js/combat.js"></script> <!-- Système de combat simplifié -->

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
                    return is_null($value) ? "null" : "parseInt('0" . $value . "', 10)";
                case 'int2':
                    return is_null($value) ? "null" : "parseInt('" . $value . "', 10)";
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
            // $js .= "    Image: new Image(\"Images/" . $row['Nom'] . ".png\"),\n";
            $js .= "    Is_joueur: " . toJS($row['Is_joueur'], 'bool') . ",\n";
            $js .= "    Capacites: " . toJS($row['Capacites']) . ",\n";
            $js .= "    Etat: " . toJS($row['Etat']) . ",\n";

            $js .= "    Pm: " . toJS($row['PM'], 'int') . ",\n";
            $js .= "    Pp: " . toJS($row['PP'], 'int') . ",\n";

            $js .= "    Force: " . toJS($row['Force'], 'int') . ",\n";
            $js .= "    Constitution: " . toJS($row['Constitution'], 'int') . ",\n";
            $js .= "    Vp: " . toJS($row['VP'], 'int') . ",\n";
            $js .= "    Perception: " . toJS($row['Perception'], 'int') . ",\n";

            $js .= "    Vm: " . toJS($row['VM'], 'int') . ",\n";
            $js .= "    Volonte: " . toJS($row['Volonte'], 'int') . ",\n";
            $js .= "    Abstraction: " . toJS($row['Abstraction'], 'int') . ",\n";
            $js .= "    Charisme: " . toJS($row['Charisme'], 'int') . ",\n";

            $js .= "    Adaptation: " . toJS($row['Adaptation'], 'int') . ",\n";
            $js .= "    Combat: " . toJS($row['Combat'], 'int') . ",\n";
            $js .= "    Foi: " . toJS($row['Foi'], 'int') . ",\n";
            $js .= "    Magie: " . toJS($row['Magie'], 'int') . ",\n";
            $js .= "    Memoire: " . toJS($row['Memoire'], 'int') . ",\n";
            $js .= "    Telepathie: " . toJS($row['Telepathie'], 'int') . ",\n";

            $js .= "    Fatigue: " . toJS($row['Fatigue'], 'int') . ",\n";
            $js .= "    Concentration: " . toJS($row['Concentration'], 'int') . ",\n";
            $js .= "    Liste_pretre: " . toJS($row['Liste_pretre'], 'null') . ",\n";

            $js .= "    Ambidextre: " . toJS($row['Ambidextre'], 'bool') . ",\n";

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
        function generateArmeJS($row, $index)
        {
            $js = "Armes[$index] = new Arme({\n";
            $js .= "    Nom_arme: " . toJS($row['Nom_arme']) . ",\n";
            $js .= "    Competence: " . toJS($row['Competence']) . ",\n";
            $js .= "    Facteur_parade: " . toJS($row['Facteur_parade'], 'int') . ",\n";
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
            $js .= "    Nom_competence: " . toJS($row['Nom_competence']) . ",\n";
            $js .= "    Competence_majeure: " . toJS($row['Competence_majeure']) . ",\n";
            $js .= "    Attribut: " . toJS($row['Attribut'], 'null') . ",\n";
            $js .= "    Base: " . toJS($row['Base'], 'int2') . "\n";
            $js .= "});\n";
            return $js;
        }

        /**
         * Génère le code JavaScript pour initialiser les compétences connues
         */
        function generateCompetenceConnueJS($row, $index)
        {
            $js = "CompetencesConnues[$index] = new CompetenceConnue({\n";
            $js .= "    Nom_competence: " . toJS($row['Nom_competence']) . ",\n";
            $js .= "    Nom_model: " . toJS($row['Nom_model']) . ",\n";
            $js .= "    Degres: " . toJS($row['Degres'], 'int') . "\n";
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
            $query = "SELECT * FROM competence ORDER BY Nom_competence ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateCompetenceJS($row, $ligne);
                    $ligne++;
                }
            }

            // === CHARGEMENT DES COMPÉTENCES CONNUES ===
            $query = "SELECT * FROM comp_connue ORDER BY Nom_model ASC, Nom_competence ASC";
            $result = $conn->query($query);

            if ($result->num_rows > 0) {
                $ligne = 0;
                while ($row = $result->fetch_assoc()) {
                    echo generateCompetenceConnueJS($row, $ligne);
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
            Models[i].Image.src = "Images/" + Models[i].Nom_model + ".png";
            Models[i].Image.onerror = function() {
                console.warn("Image non trouvée pour " + Models[i].Nom_model + ": images/" + Models[i].Nom_model + ".png");
            };
        }
        
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

        // === Initialisation du jeu pour les tests ===
        // ============================================

        // Pré-sélectionner "Maitre du Jeu" dès l'ouverture du site
        document.getElementById("joueur").value = "MJ";

        // Déclencher l'événement change pour initialiser l'interface
        const changeEvent = new Event('change', {
            bubbles: true,
            cancelable: true
        });
        document.getElementById("joueur").dispatchEvent(changeEvent);

        // Attendre que l'interface soit complètement initialisée
        setTimeout(function() {
            const christophe = Pion.add("allies", "Christophe");
            const elemental_eau = Pion.add("allies", "Elémental d'eau");
            const guilhem = Pion.add("ennemis", "Guilhem");
            const elemental_air = Pion.add("ennemis", "Elémental d'air");

            // Simuler un lancement de sort pour le personnage Guilhem
            // guilhem.Arme1 = "Lancement de sort";
            // guilhem.Nom_liste = "Liste du contrôle de soi";
            // guilhem.Nom_sort = "Vivacité physique";
            // guilhem.Incantation = 2;

            // next_attaque();

            // Régénérer la carte pour afficher les nouveaux pions
            Map.generateHexMap();
            Map.drawHexMap();

            // Donner le focus à la carte
            canvas.focus({ preventScroll: true });
        }, 200);
    </script>
</body>

</html>
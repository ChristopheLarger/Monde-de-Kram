<?php

/**
 * FICHIER SERVER.PHP
 * ===================
 * Serveur WebSocket pour le jeu de rôle "Le Monde de Kram"
 * Utilise la bibliothèque Ratchet pour gérer les connexions WebSocket
 * et synchroniser les données entre les joueurs en temps réel
 */

// === IMPORTS RATCHET ===
// Importation des classes nécessaires pour le serveur WebSocket
use Ratchet\MessageComponentInterface;  // Interface pour les composants de message
use Ratchet\ConnectionInterface;        // Interface pour les connexions
use Ratchet\Http\HttpServer;            // Serveur HTTP pour Ratchet
use Ratchet\WebSocket\WsServer;         // Serveur WebSocket
use Ratchet\Server\IoServer;            // Serveur I/O principal

// === CHARGEMENT DES DÉPENDANCES ===
// Chargement automatique des classes via Composer
require 'vendor/autoload.php';

/**
 * Classe ChatServer - Serveur WebSocket principal
 * Gère les connexions, messages et synchronisation entre joueurs
 * Implémente l'interface MessageComponentInterface de Ratchet
 */
class ChatServer implements MessageComponentInterface
{
    /**
     * @var \SplObjectStorage $clients - Stockage des connexions clients actives
     */
    protected $clients;

    /**
     * Constructeur du serveur
     * Initialise le stockage des connexions clients
     */
    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    /**
     * Gestionnaire d'ouverture de connexion
     * Appelé lorsqu'un nouveau client se connecte au serveur
     * 
     * @param ConnectionInterface $conn - Connexion du nouveau client
     */
    public function onOpen(ConnectionInterface $conn) {
        // Ajouter le nouveau client à la liste des connexions actives
        $this->clients->attach($conn);
        echo "Nouvelle connexion ({$conn->resourceId})\n";
    }

    /**
     * Gestionnaire de messages entrants
     * Traite les messages reçus et les diffuse aux autres clients
     * 
     * @param ConnectionInterface $from - Connexion de l'expéditeur
     * @param string $msg - Message reçu
     */
    public function onMessage(ConnectionInterface $from, $msg) {
        echo "Msg : " . $msg . "\n";
        if (function_exists('ob_flush')) { @ob_flush(); }
        @flush();

        $this->Bascule_sort_connu($msg);
        $this->Set_Model($msg);
        $this->Set_Terrain($msg);
        $this->Rmv_Terrain($msg);
        $this->Set_Pion($msg);
        $this->Rmv_Pion($msg);
        $this->Set_Nom_model($msg);
        $this->Set_Degres($msg);
        $this->Set_Avantage($msg);
        $this->Set_Desavantage($msg);
        $this->Copy_Model($msg);

        // === DIFFUSION DU MESSAGE ===
        foreach ($this->clients as $client) {
            if ($from != $client) {
                $client->send($msg);
            }
        }
    }

    /**
     * FONCTION DE COPIE DE LA FIGURINE
     * ================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la copie de la figurine a réussi
     */
    private function Copy_Model($msg) {
        $regex = "/^MJ: Copy_Model ([^@]+)@([^@]+)$/";

        if (! preg_match($regex, $msg, $result)) return false;

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            // Changement du nom du modèle dans la base de données
            $sql = "INSERT INTO `model` (
                `Nom_model`, `Is_joueur`, `Is_monster`, `Capacites`, `Race`, `Puissance_mentale`, `Puissance_physique`, `Fatigue`, `Concentration`, `Ambidextre`, `Force`, `Constitution`, `Vivacite_physique`, `Perception`, `Vivacite_mentale`, `Abstraction`, `Volonte`, `Charisme`, `Foi`, `Magie`, `Adaptation`, `Combat`, `Memoire`, `Telepathie`, `Force_experience`, `Constitution_experience`, `Vivacite_physique_experience`, `Perception_experience`, `Vivacite_mentale_experience`, `Abstraction_experience`, `Volonte_experience`, `Charisme_experience`, `Adaptation_experience`, `Combat_experience`, `Foi_experience`, `Magie_experience`, `Telepathie_experience`, `Memoire_experience`, `Armure_Tete`, `Armure_Poitrine`, `Armure_Abdomen`, `Armure_BrasG`, `Armure_BrasD`, `Armure_JambeG`, `Armure_JambeD`, `Seuil_blessures`, `Nb_blessures_max`, `Vivacite_physique2`, `Initiative`, `Agressivite`, `Sociabilite`, `Esquive`, `Feinte_de_corps`, `Attaque_1`, `Parade_1`, `Bool_parade_1`, `Coefficient_dommages_1`, `Bonus_dommages_1`, `Attaque_2`, `Bool_attaque_2`, `Parade_2`, `Bool_parade_2`, `Coefficient_dommages_2`, `Bonus_dommages_2`, `Vue`)
                SELECT
                ?, `Is_joueur`, `Is_monster`, `Capacites`, `Race`, `Puissance_mentale`, `Puissance_physique`, `Fatigue`, `Concentration`, `Ambidextre`, `Force`, `Constitution`, `Vivacite_physique`, `Perception`, `Vivacite_mentale`, `Abstraction`, `Volonte`, `Charisme`, `Foi`, `Magie`, `Adaptation`, `Combat`, `Memoire`, `Telepathie`, `Force_experience`, `Constitution_experience`, `Vivacite_physique_experience`, `Perception_experience`, `Vivacite_mentale_experience`, `Abstraction_experience`, `Volonte_experience`, `Charisme_experience`, `Adaptation_experience`, `Combat_experience`, `Foi_experience`, `Magie_experience`, `Telepathie_experience`, `Memoire_experience`, `Armure_Tete`, `Armure_Poitrine`, `Armure_Abdomen`, `Armure_BrasG`, `Armure_BrasD`, `Armure_JambeG`, `Armure_JambeD`, `Seuil_blessures`, `Nb_blessures_max`, `Vivacite_physique2`, `Initiative`, `Agressivite`, `Sociabilite`, `Esquive`, `Feinte_de_corps`, `Attaque_1`, `Parade_1`, `Bool_parade_1`, `Coefficient_dommages_1`, `Bonus_dommages_1`, `Attaque_2`, `Bool_attaque_2`, `Parade_2`, `Bool_parade_2`, `Coefficient_dommages_2`, `Bonus_dommages_2`, `Vue`
                FROM `model`
                WHERE `Nom_model` = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $result[2], $result[1]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }

            $sql = "INSERT INTO `competence` (`Nom_model`, `Nom`, `Degres`)
                SELECT ?, `Nom`, `Degres`
                FROM `competence`
                WHERE `Nom_model` = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $result[2], $result[1]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }

            $sql = "INSERT INTO `avantage` (`Nom_model`, `Nom`, `Selection`, `Parametre`, `Type`, `Niveau_creation`, `Niveau_experience`)
                SELECT ?, `Nom`, `Selection`, `Parametre`, `Type`, `Niveau_creation`, `Niveau_experience`
                FROM `avantage`
                WHERE `Nom_model` = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $result[2], $result[1]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }

            $sql = "INSERT INTO `desavantage` (`Nom_model`, `Nom`, `Selection`, `Niveau`)
                SELECT ?, `Nom`, `Selection`, `Niveau`
                FROM `desavantage`
                WHERE `Nom_model` = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $result[2], $result[1]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }

            $sql = "INSERT INTO `sort_connu` (`Nom_model`, `Nom_liste`, `Nom_sort`)
            SELECT ?, `Nom_liste`, `Nom_sort`
            FROM `sort_connu`
            WHERE `Nom_model` = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $result[2], $result[1]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }

            $stmt->close();
        }
        
        // Copie du fichier image
        $ancien = "/xampp/htdocs/Kram/Images/Figurines/" . $result[1] . ".png";
        $nouveau = "/xampp/htdocs/Kram/Images/Figurines/" . $result[2] . ".png";
        copy($ancien, $nouveau);

        return true;
    }

    /**
     * FONCTION DE CHANGEMENT DE NOM DU MODELE
     * =======================================
     * @param string $msg - Message contenant les données
     * @return bool - true si le changement de nom du modèle a réussi
     */
    private function Set_Nom_model($msg) {
        $regex = "/^MJ: Set_Nom_model ([^@]+)@([^@]+)$/";

        if (! preg_match($regex, $msg, $result)) return false;

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            // Changement du nom du modèle dans la base de données
            $sql = "UPDATE model SET Nom_model = ? WHERE Nom_model = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $result[2], $result[1]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        // Changement du nom du fichier image
        $ancien = "/xampp/htdocs/Kram/Images/Figurines/" . $result[1] . ".png";
        $nouveau = "/xampp/htdocs/Kram/Images/Figurines/" . $result[2] . ".png";
        rename($ancien, $nouveau);

        return true;
    }

    /**
     * FONCTION DE CHANGEMENT D'UN ATTRIBUT DU MODELE
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Set_Model($msg) {
        $regex = "/^MJ: Set_Model_([^@ ]+) ([^@]+)@([^@]+)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $attribut = $result[1];
        $nom_model = $result[2];
        $valeur = $result[3];

        if ($valeur == "true") $valeur = 1;
        else if ($valeur == "false") $valeur = 0;

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            // Modification de l'attribut du modèle dans la base de données
            $sql = "UPDATE model SET `" . $attribut . "` = ? WHERE Nom_model = ?";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $valeur, $nom_model);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

    /**
     * FONCTION DE CHANGEMENT D'UN ATTRIBUT DU PION
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Set_Terrain($msg) {
        $regex = "/^MJ: Set_Terrain ([^@]+)@([^@]+)@([^@]+)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $type = $result[1];
        $position = $result[2];
        $color = $result[3];

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        }
        else{
            // Si le terrain n'existe pas, on l'ajoute
            $query = "SELECT * FROM terrain WHERE `Position` = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("s", $position);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $resultMysql = $stmt->get_result();
            if ($resultMysql->num_rows == 0) {
                $sql = "INSERT INTO terrain (`Type`, `Position`, `Color`) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sss", $type, $position, $color);
                $stmt->execute();
                if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            } else {
                $sql = "UPDATE terrain SET `Type` = ?, `Color` = ? WHERE `Position` = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sss", $type, $color, $position);
                $stmt->execute();
                if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            }
            $stmt->close();
        }

        return true;
    }

        /**
     * FONCTION DE CHANGEMENT D'UN ATTRIBUT DU PION
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Rmv_Terrain($msg) {
        $regex = "/^MJ: Rmv_Terrain ([^@]+)@([^@]+)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $type = $result[1];
        $model = $result[2];
        $indice = $result[3];

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            // Modification de l'attribut du modèle dans la base de données
            $sql = "DELETE FROM pion WHERE `Type` = ? AND Model = ? AND Indice = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssi", $type, $model, $indice);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

    /**
     * FONCTION DE CHANGEMENT D'UN ATTRIBUT DU PION
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Set_Pion($msg) {
        $regex = "/^MJ: Set_Pion_([^@ ]+) ([^@]+)@([^@]+)@([^@]+)@([^@]*)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $attribut = $result[1];
        $type = $result[2];
        $model = $result[3];
        $indice = $result[4];
        $valeur = $result[5];

        if ($valeur == "true") $valeur = 1;
        else if ($valeur == "false") $valeur = 0;

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else if ($attribut == "Type") {
            $old_type = ($valeur === "allies") ? "ennemis" : "allies";
            $sql = "UPDATE pion SET `Type` = ? WHERE `Type` = ? AND `Model` = ? AND `Indice` = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssi", $valeur, $old_type, $model, $indice);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        } else if ($attribut == "Model" || $attribut == "Indice") {
            echo "Modifier le modèle ou l'indice du pion n'est pas prévu.\n";
        }
        else{
            // Si le pion n'existe pas, on l'ajoute
            $query = "SELECT * FROM pion WHERE `Type` = ? AND `Model` = ? AND `Indice` = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("sss", $type, $model, $indice);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $resultMysql = $stmt->get_result();
            if ($resultMysql->num_rows == 0) {
                $sql = "INSERT INTO pion (`Type`, `Model`, `Indice`) VALUES (?, ?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssi", $type, $model, $indice);
                $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            }

            // Modification de l'attribut du modèle dans la base de données
            $sql = "UPDATE pion SET `" . $attribut . "` = ? WHERE Type = ? AND Model = ? AND Indice = ?";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssi", $valeur, $type, $model, $indice);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

        /**
     * FONCTION DE CHANGEMENT D'UN ATTRIBUT DU PION
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Rmv_Pion($msg) {
        $regex = "/^MJ: Rmv_Pion ([^@]+)@([^@]+)@([^@]+)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $type = $result[1];
        $model = $result[2];
        $indice = $result[3];

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            // Modification de l'attribut du modèle dans la base de données
            $sql = "DELETE FROM pion WHERE `Type` = ? AND Model = ? AND Indice = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ssi", $type, $model, $indice);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

    /**
     * FONCTION DE CHANGEMENT D'UN AVANTAGE DU MODELE
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Set_Avantage($msg) {
        $regex = "/^MJ: Set_Avantage ([^@]+)@([^@]+)@([^@]+)@([^@]*)@([^@]*)@([^@]*)@([^@]*)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $nom_model = $result[1];
        $nom = $result[2];
        $selection = $result[3];
        $parametre = $result[4];
        $type = $result[5];
        $niveau_creation = $result[6];
        $niveau_experience = $result[7];

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            $query = "SELECT * FROM avantage WHERE Nom_model = ? AND Nom = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $nom_model, $nom);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $resultMysql = $stmt->get_result();

            if ($resultMysql->num_rows > 0) {
                $sql = "UPDATE avantage SET Selection = ?, Parametre = ?, `Type` = ?, Niveau_creation = ?, Niveau_experience = ? WHERE Nom_model = ? AND Nom = ?";
            } else {
                $sql = "INSERT INTO avantage (Selection, Parametre, `Type`, Niveau_creation, Niveau_experience, Nom_model, Nom) VALUES (?, ?, ?, ?, ?, ?, ?)";
            }
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issssss", $selection, $parametre, $type, $niveau_creation, $niveau_experience, $nom_model, $nom);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

    /**
     * FONCTION DE CHANGEMENT D'UN DESAVANTAGE DU MODELE
     * ==============================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification de l'attribut a réussi
     */
    private function Set_Desavantage($msg) {
        $regex = "/^MJ: Set_Desavantage ([^@]+)@([^@]+)@([^@]+)@([^@]+)$/";
        if (! preg_match($regex, $msg, $result)) return false;

        $nom_model = $result[1];
        $nom = $result[2];
        $selection = $result[3];
        $niveau = $result[4];

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            $query = "SELECT * FROM desavantage WHERE Nom_model = ? AND Nom = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $nom_model, $nom);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $resultMysql = $stmt->get_result();

            if ($resultMysql->num_rows > 0) {
                $sql = "UPDATE desavantage SET Selection = ?, Niveau = ? WHERE Nom_model = ? AND Nom = ?";
            } else {
                $sql = "INSERT INTO desavantage (Selection, Niveau, Nom_model, Nom) VALUES (?, ?, ?, ?)";
            }
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iiss", $selection, $niveau, $nom_model, $nom);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

    /**
     * FONCTION DE BASCULE DES SORTS CONNUS
     * ====================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la bascule du sort connu a réussi
     */
    private function Bascule_sort_connu($msg) {
        $regex = "/^MJ: Bascule_sort_connu ([^@]+)@([^@]+)@([^@]+)$/";

        if (! preg_match($regex, $msg, $result)) return false;

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            $query = "SELECT * FROM sort_connu WHERE Nom_model = ? AND Nom_liste = ? AND Nom_sort = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("sss", $result[1], $result[2], $result[3]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $resultMysql = $stmt->get_result();

            if ($resultMysql->num_rows > 0) {
                $sql = "DELETE FROM sort_connu WHERE Nom_model = ? AND Nom_liste = ? AND Nom_sort = ?";
            } else {
                $sql = "INSERT INTO sort_connu (Nom_model, Nom_liste, Nom_sort) VALUES (?, ?, ?)";
            }
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sss", $result[1], $result[2], $result[3]);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

        /**
     * FONCTION DE MODIFICATION DES DEGRES D'UNE COMPETENCE CONNUE
     * ===========================================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification des degrés d'une compétence connue a réussi
     */
    private function Set_Degres($msg) {
        $regex = "/^MJ: Set_Degres ([^@]+)@([^@]+)@([^@]+)$/";

        if (! preg_match($regex, $msg, $result)) return false;

        $nom_model = $result[1];
        $nom = $result[2];
        $degres = $result[3];

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            $query = "SELECT * FROM competence WHERE Nom_model = ? AND Nom = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("ss", $nom_model, $nom);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $resultMysql = $stmt->get_result();

            if ($resultMysql->num_rows > 0) {
                $sql = "UPDATE competence SET Degres = ? WHERE Nom_model = ? AND Nom = ?";
            } else {
                $sql = "INSERT INTO competence (Degres, Nom_model, Nom) VALUES (?, ?, ?)";
            }
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iss", $degres, $nom_model, $nom);
            $stmt->execute();
            if ($stmt->error) { echo "Erreur SQL : " . $stmt->error . "\n"; }
            $stmt->close();
        }

        return true;
    }

    /**
     * Gestionnaire de fermeture de connexion
     * Appelé lorsqu'un client se déconnecte du serveur
     * 
     * @param ConnectionInterface $conn - Connexion du client qui se déconnecte
     */
    public function onClose(ConnectionInterface $conn) {
        // Retirer le client de la liste des connexions actives
        $this->clients->detach($conn);
        echo "Connexion fermée ({$conn->resourceId})\n";
    }

    /**
     * Gestionnaire d'erreurs
     * Appelé en cas d'erreur sur une connexion
     * 
     * @param ConnectionInterface $conn - Connexion en erreur
     * @param \Exception $e - Exception levée
     */
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Erreur : {$e->getMessage()}\n";
        // Fermer la connexion en erreur
        $conn->close();
    }
}

// === CONFIGURATION ET DÉMARRAGE DU SERVEUR ===
// Création du serveur WebSocket sur le port 8080
// Le serveur écoute sur toutes les interfaces (0.0.0.0:8080)
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ChatServer()
        )
    ),
    8080
);

// === MESSAGE DE DÉMARRAGE ===
echo "Serveur WebSocket Ratchet démarré sur ws://0.0.0.0:8080\n";

// === DÉMARRAGE DU SERVEUR ===
// Le serveur entre dans une boucle infinie pour traiter les connexions
$server->run();

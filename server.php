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
    public function __construct()
    {
        $this->clients = new \SplObjectStorage;
    }

    /**
     * Gestionnaire d'ouverture de connexion
     * Appelé lorsqu'un nouveau client se connecte au serveur
     * 
     * @param ConnectionInterface $conn - Connexion du nouveau client
     */
    public function onOpen(ConnectionInterface $conn)
    {
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
    public function onMessage(ConnectionInterface $from, $msg)
    {
        $this->Set_champs($msg);

        $this->Bascule_sort_connu($msg);

        // === DIFFUSION DU MESSAGE ===
        // Parcourir tous les clients connectés
        foreach ($this->clients as $client) {
            echo "Msg : " . $msg . "\n";
            // Ne pas renvoyer le message à l'expéditeur
            if ($from != $client) {
                
                // Envoyer le message aux clients
                $client->send($msg);
            }
        }
    }

    /**
     * FONCTION DE BASCULE DES SORTS CONNUS
     * ====================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la bascule du sort connu a réussi
     */
    private function Bascule_sort_connu($msg)
    {
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
            $resultMysql = $stmt->get_result();

            if ($resultMysql->num_rows > 0) {
                $sql = "DELETE FROM sort_connu WHERE Nom_model = ? AND Nom_liste = ? AND Nom_sort = ?";
            } else {
                $sql = "INSERT INTO sort_connu (Nom_model, Nom_liste, Nom_sort) VALUES (?, ?, ?)";
            }
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sss", $result[1], $result[2], $result[3]);
            $stmt->execute();
            $stmt->close();
        }

        return true;
    }

    const Id_table = [
        "Arme" => "Nom_arme",
        "Bonus" => "Nom_bonus",
        "Bonus_sort" => "Nom_liste@Nom_sort@Nom_bonus@Succes",
        "Competence" => "Nom_competence",
        "Comp_connue" => "Nom_competence@Nom_model",
        "Connecteur" => "Nom_liste@Pred_sort@Suc_sort",
        "Liste" => "Nom_liste",
        "Model" => "Nom_model",
        "Sort" => "Nom_liste@Nom_sort",
        "Sort_connu" => "Nom_model@Nom_liste@Nom_sort",
        "Model" => "Nom_model",
    ];
    /**
     * FONCTION DE MODIFICATION D'UN CHAMPS D'UNE TABLE
     * ================================================
     * @param string $msg - Message contenant les données
     * @return bool - true si la modification du champs a réussi
     */
    private function Set_champs($msg)
    {
        // Set Nom_attribut@Valeur_attribut@Nom_table@Id_table
        // Exemple : Set Force@10@Model@Guilhem
        $regex = "/^MJ: Set ([^@]+)@([^@]+)@([^@]+)@(.+)$/";

        if (! preg_match($regex, $msg, $result)) return false;
        
        // Extraction des clés et des valeurs de l'ID de la table
        $key = $Id_table[$result[3]].split("@");
        $value = $result[4].split("@");

        // Connexion à la base de données MySQL
        $conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');

        if ($conn->connect_error) {
            echo "Echec de connexion à la base de données.\n";
            die("Échec de la connexion : " . $conn->connect_error);
        } else {
            $query = "UPDATE " . $result[3] . " SET " . $result[1] . " = " . $result[2];
            $query .= " WHERE " . $key[0] . " = " . $value[0];
            for ($i = 1; $i < count($key); $i++) {
                $query .= " AND " . $key[$i] . " = " . $value[$i];
            }
            $stmt = $conn->prepare($query);
            $stmt->execute();
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
    public function onClose(ConnectionInterface $conn)
    {
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
    public function onError(ConnectionInterface $conn, \Exception $e)
    {
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

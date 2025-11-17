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
use Ratchet\Http\HttpServer;           // Serveur HTTP pour Ratchet
use Ratchet\WebSocket\WsServer;        // Serveur WebSocket
use Ratchet\Server\IoServer;          // Serveur I/O principal

// === CHARGEMENT DES DÉPENDANCES ===
// Chargement automatique des classes via Composer
require 'vendor/autoload.php';

/**
 * Classe ChatServer - Serveur WebSocket principal
 * Gère les connexions, messages et synchronisation entre joueurs
 * Implémente l'interface MessageComponentInterface de Ratchet
 */
class ChatServer implements MessageComponentInterface {
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
        // === FONCTIONNALITÉS DE BASE DE DONNÉES (COMMENTÉES) ===
        // Ces fonctions permettaient de sauvegarder automatiquement les changements
        // de statistiques des personnages en base de données
        // $this->msgSet("Fatigue", $msg);
        // $this->msgSet("Concentration", $msg);
        // $this->msgSet("PdV", $msg);
        // $this->msgSet("Tete", $msg);
        // $this->msgSet("Poitrine", $msg);
        // $this->msgSet("Abdomen", $msg);
        // $this->msgSet("BrasG", $msg);
        // $this->msgSet("BrasD", $msg);
        // $this->msgSet("JambeG", $msg);
        // $this->msgSet("JambeD", $msg);
        
        // === DIFFUSION DU MESSAGE ===
        // Parcourir tous les clients connectés
        foreach ($this->clients as $client) {
            // Ne pas renvoyer le message à l'expéditeur
            if ($from != $client) {
                echo "Msg : " . $msg . "\n";
                // Envoyer le message au client
                $client->send($msg);
            }
        }
    }

    /**
     * FONCTION DE SAUVEGARDE EN BASE DE DONNÉES (COMMENTÉE)
     * =====================================================
     * Cette fonction était utilisée pour sauvegarder automatiquement
     * les changements de statistiques des personnages en base de données
     * 
     * @param string $param - Nom du paramètre à sauvegarder
     * @param string $msg - Message contenant les données
     * @return bool - true si la sauvegarde a réussi
     */
    // private function msgSet($param, $msg) {
    //     // Expression régulière pour extraire les données du message
    //     $regex = "/^MJ:\<p class='vip' title='" . $param . " .+\>(.+)@(.*)\<\/p\>$/";
    //     if (! preg_match($regex, $msg, $result)) return false;
    //     if ($result[2] === "") $result[2] = "0";

    //     echo $param . " -- " . $result[1] . " -- " . $result[2] . "\n";

    //     // Connexion à la base de données MySQL
    //     $conn = new mysqli('localhost', 'root', 'Titoon#01', 'Kram');

    //     if ($conn->connect_error) {
    //         echo "Echec de connexion à la base de données.\n";
    //         die("Échec de la connexion : " . $conn->connect_error);
    //     }
    //     else {
            
    //         // Préparation de la requête SQL de mise à jour
    //         $sql = "UPDATE perso SET " . $param . " = ? WHERE perso.Nom = ?";
    //         $stmt = $conn->prepare($sql);
            
    //         if (! $stmt) {
    //             echo "Erreur de préparation de la requête : " . $conn->error . ".\n";
    //         } else {
    //             // Liaison des paramètres et exécution de la requête
    //             $stmt->bind_param("ss", $result[2], $result[1]); // "ss" signifie 2 chaînes (string)
    //             if (! $stmt->execute()) {
    //                 echo "Erreur lors de la requête en base de données : " . $stmt->error . ".\n";
    //             }
    //             $stmt->close();
    //         }
    //         $conn->close();
    //     }
        
    //     return true;
    // }

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
?>
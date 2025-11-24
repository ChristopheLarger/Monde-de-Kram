<?php
/**
 * Script pour vérifier les noms exacts des tables dans la base de données
 */

$conn = new mysqli('192.168.1.242', 'kram_app', 'Titoon#01', 'Kram');

if ($conn->connect_error) {
    die("Échec de connexion : " . $conn->connect_error);
}

$conn->set_charset("utf8");

echo "<h2>Vérification des noms de tables</h2>";

// Lister toutes les tables de la base de données
$query = "SHOW TABLES";
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    echo "<h3>Tables trouvées dans la base de données 'Kram' :</h3><ul>";
    while ($row = $result->fetch_array()) {
        $tableName = $row[0];
        echo "<li><strong>" . htmlspecialchars($tableName) . "</strong>";
        
        // Vérifier si c'est la table perso
        if (strtolower($tableName) === 'perso' || strtolower($tableName) === 'perso') {
            echo " <span style='color: green;'>✓ Table perso trouvée</span>";
            
            // Vérifier les colonnes Arme_1, Arme_2, Arme_3
            $colQuery = "SHOW COLUMNS FROM `$tableName` LIKE 'Arme_%'";
            $colResult = $conn->query($colQuery);
            if ($colResult && $colResult->num_rows > 0) {
                echo "<ul>";
                while ($colRow = $colResult->fetch_assoc()) {
                    echo "<li>Colonne : " . htmlspecialchars($colRow['Field']) . " (Type: " . htmlspecialchars($colRow['Type']) . ")</li>";
                }
                echo "</ul>";
            }
        }
        echo "</li>";
    }
    echo "</ul>";
} else {
    echo "<p style='color: red;'>Aucune table trouvée dans la base de données.</p>";
}

// Vérifier spécifiquement la table perso avec différents noms possibles
echo "<h3>Recherche de la table perso :</h3>";
$possibleNames = ['perso', 'Perso', 'PERSO', 'personnage', 'Personnage'];
foreach ($possibleNames as $name) {
    $query = "SELECT COUNT(*) as count FROM information_schema.TABLES 
              WHERE TABLE_SCHEMA = 'Kram' AND TABLE_NAME = '$name'";
    $result = $conn->query($query);
    if ($result) {
        $row = $result->fetch_assoc();
        if ($row['count'] > 0) {
            echo "<p style='color: green;'>✓ Table '$name' existe</p>";
        } else {
            echo "<p style='color: gray;'>✗ Table '$name' n'existe pas</p>";
        }
    }
}

$conn->close();
?>


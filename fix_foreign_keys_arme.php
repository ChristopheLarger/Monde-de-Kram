<?php
/**
 * Script pour créer les clés étrangères Perso.Arme_1, Arme_2, Arme_3 -> Arme.Nom
 * Résout l'erreur MySQL 1452
 */

$conn = new mysqli('192.168.1.242', 'kram_app', 'Titoon#01', 'Kram');

if ($conn->connect_error) {
    die("Échec de connexion : " . $conn->connect_error);
}

$conn->set_charset("utf8");

echo "<h2>Résolution de l'erreur 1452 - Clés étrangères Arme</h2>";

// ============================================
// VÉRIFICATION PRÉALABLE : Vérifier que les tables existent
// ============================================
echo "<h3>Vérification préalable : Existence des tables</h3>";

$query = "SHOW TABLES LIKE 'perso'";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    echo "<p style='color: green;'>✓ Table 'perso' existe</p>";
} else {
    echo "<p style='color: red;'>✗ ERREUR : Table 'perso' n'existe pas !</p>";
    echo "<p>Vérifiez le nom exact de la table avec : SHOW TABLES;</p>";
    $conn->close();
    exit;
}

$query = "SHOW TABLES LIKE 'arme'";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    echo "<p style='color: green;'>✓ Table 'arme' existe</p>";
} else {
    echo "<p style='color: red;'>✗ ERREUR : Table 'arme' n'existe pas !</p>";
    echo "<p>Vérifiez le nom exact de la table avec : SHOW TABLES;</p>";
    $conn->close();
    exit;
}

// ============================================
// ÉTAPE 1 : Vérifier si Arme.Nom est unique
// ============================================
echo "<h3>Étape 1 : Vérification de l'index UNIQUE sur Arme.Nom</h3>";

$query = "
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM 
    information_schema.STATISTICS
WHERE 
    TABLE_SCHEMA = 'Kram'
    AND TABLE_NAME = 'arme'
    AND COLUMN_NAME = 'Nom'
    AND NON_UNIQUE = 0
";

$result = $conn->query($query);
$hasUniqueIndex = ($result && $result->num_rows > 0);

if ($hasUniqueIndex) {
    echo "<p style='color: green;'>✓ Un index UNIQUE existe déjà sur Arme.Nom</p>";
} else {
    echo "<p style='color: orange;'>⚠ Aucun index UNIQUE trouvé sur Arme.Nom</p>";
    
    // Vérifier s'il y a des doublons dans Arme.Nom
    $query = "SELECT Nom, COUNT(*) as count FROM arme GROUP BY Nom HAVING count > 1";
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        echo "<p style='color: red;'>✗ ERREUR : Il y a des doublons dans Arme.Nom :</p><ul>";
        while ($row = $result->fetch_assoc()) {
            echo "<li>" . htmlspecialchars($row['Nom']) . " (apparaît " . $row['count'] . " fois)</li>";
        }
        echo "</ul><p>Vous devez d'abord supprimer les doublons avant de créer l'index UNIQUE.</p>";
    } else {
        echo "<p>Création de l'index UNIQUE sur Arme.Nom...</p>";
        $query = "ALTER TABLE `arme` ADD UNIQUE INDEX idx_nom_unique (Nom)";
        if ($conn->query($query)) {
            echo "<p style='color: green;'>✓ Index UNIQUE créé avec succès</p>";
            $hasUniqueIndex = true;
        } else {
            echo "<p style='color: red;'>✗ Erreur lors de la création de l'index : " . $conn->error . "</p>";
        }
    }
}

// ============================================
// ÉTAPE 2 : Vérifier les données orphelines
// ============================================
echo "<h3>Étape 2 : Vérification des données orphelines</h3>";

$hasOrphanData = false;

// Vérifier Arme_1
$query = "
SELECT DISTINCT p.Arme_1 as valeur
FROM `perso` p
LEFT JOIN `arme` a ON p.Arme_1 = a.Nom
WHERE p.Arme_1 IS NOT NULL 
  AND p.Arme_1 != ''
  AND a.Nom IS NULL
";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    $hasOrphanData = true;
    echo "<p style='color: orange;'>⚠ Valeurs orphelines dans Arme_1 :</p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . htmlspecialchars($row['valeur']) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p style='color: green;'>✓ Toutes les valeurs de Arme_1 sont valides</p>";
}

// Vérifier Arme_2
$query = "
SELECT DISTINCT p.Arme_2 as valeur
FROM `perso` p
LEFT JOIN `arme` a ON p.Arme_2 = a.Nom
WHERE p.Arme_2 IS NOT NULL 
  AND p.Arme_2 != ''
  AND a.Nom IS NULL
";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    $hasOrphanData = true;
    echo "<p style='color: orange;'>⚠ Valeurs orphelines dans Arme_2 :</p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . htmlspecialchars($row['valeur']) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p style='color: green;'>✓ Toutes les valeurs de Arme_2 sont valides</p>";
}

// Vérifier Arme_3
$query = "
SELECT DISTINCT p.Arme_3 as valeur
FROM `perso` p
LEFT JOIN `arme` a ON p.Arme_3 = a.Nom
WHERE p.Arme_3 IS NOT NULL 
  AND p.Arme_3 != ''
  AND a.Nom IS NULL
";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    $hasOrphanData = true;
    echo "<p style='color: orange;'>⚠ Valeurs orphelines dans Arme_3 :</p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . htmlspecialchars($row['valeur']) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p style='color: green;'>✓ Toutes les valeurs de Arme_3 sont valides</p>";
}

// ============================================
// ÉTAPE 3 : Nettoyer les données orphelines
// ============================================
if ($hasOrphanData) {
    echo "<h3>Étape 3 : Nettoyage des données orphelines</h3>";
    
    // Nettoyer Arme_1
    $query = "
    UPDATE `perso` p
    LEFT JOIN `arme` a ON p.Arme_1 = a.Nom
    SET p.Arme_1 = NULL
    WHERE p.Arme_1 IS NOT NULL 
      AND p.Arme_1 != ''
      AND a.Nom IS NULL
    ";
    if ($conn->query($query)) {
        echo "<p style='color: green;'>✓ Arme_1 nettoyé (" . $conn->affected_rows . " lignes modifiées)</p>";
    }
    
    // Nettoyer Arme_2
    $query = "
    UPDATE `perso` p
    LEFT JOIN `arme` a ON p.Arme_2 = a.Nom
    SET p.Arme_2 = NULL
    WHERE p.Arme_2 IS NOT NULL 
      AND p.Arme_2 != ''
      AND a.Nom IS NULL
    ";
    if ($conn->query($query)) {
        echo "<p style='color: green;'>✓ Arme_2 nettoyé (" . $conn->affected_rows . " lignes modifiées)</p>";
    }
    
    // Nettoyer Arme_3
    $query = "
    UPDATE `perso` p
    LEFT JOIN `arme` a ON p.Arme_3 = a.Nom
    SET p.Arme_3 = NULL
    WHERE p.Arme_3 IS NOT NULL 
      AND p.Arme_3 != ''
      AND a.Nom IS NULL
    ";
    if ($conn->query($query)) {
        echo "<p style='color: green;'>✓ Arme_3 nettoyé (" . $conn->affected_rows . " lignes modifiées)</p>";
    }
}

// ============================================
// ÉTAPE 4 : Créer les clés étrangères
// ============================================
if ($hasUniqueIndex) {
    echo "<h3>Étape 4 : Création des clés étrangères</h3>";
    
    // Supprimer les clés étrangères existantes si elles existent
    $query = "
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'Kram'
      AND TABLE_NAME = 'perso'
      AND CONSTRAINT_NAME IN ('fk_perso_arme1', 'fk_perso_arme2', 'fk_perso_arme3')
    ";
    
    // Vérifier d'abord que la table perso existe pour éviter l'erreur 1109
    $checkTable = $conn->query("SHOW TABLES LIKE 'perso'");
    if (!$checkTable || $checkTable->num_rows == 0) {
        echo "<p style='color: red;'>✗ ERREUR 1109 : La table 'perso' n'existe pas dans la base de données 'Kram'</p>";
        echo "<p>Vérifiez le nom exact de la table avec : SHOW TABLES;</p>";
        $conn->close();
        exit;
    }
    $result = $conn->query($query);
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $fkName = $row['CONSTRAINT_NAME'];
            $dropQuery = "ALTER TABLE perso DROP FOREIGN KEY $fkName";
            if ($conn->query($dropQuery)) {
                echo "<p>Clé étrangère $fkName supprimée</p>";
            }
        }
    }
    
    // Créer la clé étrangère pour Arme_1
    $query = "
    ALTER TABLE `perso`
    ADD CONSTRAINT fk_perso_arme1
    FOREIGN KEY (Arme_1) REFERENCES `arme`(Nom)
    ON DELETE SET NULL
    ON UPDATE CASCADE
    ";
    if ($conn->query($query)) {
        echo "<p style='color: green;'>✓ Clé étrangère fk_perso_arme1 créée avec succès</p>";
    } else {
        echo "<p style='color: red;'>✗ Erreur lors de la création de fk_perso_arme1 : " . $conn->error . "</p>";
    }
    
    // Créer la clé étrangère pour Arme_2
    $query = "
    ALTER TABLE `perso`
    ADD CONSTRAINT fk_perso_arme2
    FOREIGN KEY (Arme_2) REFERENCES `arme`(Nom)
    ON DELETE SET NULL
    ON UPDATE CASCADE
    ";
    if ($conn->query($query)) {
        echo "<p style='color: green;'>✓ Clé étrangère fk_perso_arme2 créée avec succès</p>";
    } else {
        echo "<p style='color: red;'>✗ Erreur lors de la création de fk_perso_arme2 : " . $conn->error . "</p>";
    }
    
    // Créer la clé étrangère pour Arme_3
    $query = "
    ALTER TABLE `perso`
    ADD CONSTRAINT fk_perso_arme3
    FOREIGN KEY (Arme_3) REFERENCES `arme`(Nom)
    ON DELETE SET NULL
    ON UPDATE CASCADE
    ";
    if ($conn->query($query)) {
        echo "<p style='color: green;'>✓ Clé étrangère fk_perso_arme3 créée avec succès</p>";
    } else {
        echo "<p style='color: red;'>✗ Erreur lors de la création de fk_perso_arme3 : " . $conn->error . "</p>";
    }
    
    echo "<h3 style='color: green;'>✓ Processus terminé !</h3>";
} else {
    echo "<h3 style='color: red;'>✗ Impossible de créer les clés étrangères : Arme.Nom n'est pas unique</h3>";
}

$conn->close();
?>


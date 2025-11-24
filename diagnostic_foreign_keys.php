<?php
/**
 * Script de diagnostic pour les erreurs de clés étrangères (1452)
 */

$conn = new mysqli('192.168.1.242', 'kram_app', 'Titoon#01', 'Kram');

if ($conn->connect_error) {
    die("Échec de connexion : " . $conn->connect_error);
}

$conn->set_charset("utf8");

echo "<h2>Diagnostic des clés étrangères</h2>";

// Récupérer toutes les contraintes de clés étrangères
$query = "
SELECT 
    TABLE_NAME as 'Table',
    COLUMN_NAME as 'Colonne',
    CONSTRAINT_NAME as 'Contrainte',
    REFERENCED_TABLE_NAME as 'Table référencée',
    REFERENCED_COLUMN_NAME as 'Colonne référencée'
FROM 
    information_schema.KEY_COLUMN_USAGE
WHERE 
    REFERENCED_TABLE_SCHEMA = 'Kram'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME
";

$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Table</th><th>Colonne</th><th>Contrainte</th><th>Table référencée</th><th>Colonne référencée</th></tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($row['Table']) . "</td>";
        echo "<td>" . htmlspecialchars($row['Colonne']) . "</td>";
        echo "<td>" . htmlspecialchars($row['Contrainte']) . "</td>";
        echo "<td>" . htmlspecialchars($row['Table référencée']) . "</td>";
        echo "<td>" . htmlspecialchars($row['Colonne référencée']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>Aucune contrainte de clé étrangère trouvée.</p>";
}

// Vérifier les données orphelines dans sort_connu
echo "<h3>Vérification des données orphelines dans sort_connu</h3>";

// Vérifier Nom_liste
$query = "
SELECT DISTINCT sc.Nom_liste 
FROM sort_connu sc 
LEFT JOIN liste l ON sc.Nom_liste = l.NOM_LISTE 
WHERE l.NOM_LISTE IS NULL
";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    echo "<p><strong>Nom_liste invalides :</strong></p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . htmlspecialchars($row['Nom_liste']) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p>✓ Tous les Nom_liste sont valides</p>";
}

// Vérifier Nom_sort
$query = "
SELECT DISTINCT sc.Nom_sort, sc.Nom_liste
FROM sort_connu sc 
LEFT JOIN sort s ON sc.Nom_sort = s.NOM_SORT AND sc.Nom_liste = s.NOM_LISTE
WHERE s.NOM_SORT IS NULL
";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    echo "<p><strong>Nom_sort invalides :</strong></p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . htmlspecialchars($row['Nom_sort']) . " (liste: " . htmlspecialchars($row['Nom_liste']) . ")</li>";
    }
    echo "</ul>";
} else {
    echo "<p>✓ Tous les Nom_sort sont valides</p>";
}

// Vérifier Nom_perso
$query = "
SELECT DISTINCT sc.Nom_perso 
FROM sort_connu sc 
LEFT JOIN perso p ON sc.Nom_perso = p.Nom 
WHERE p.Nom IS NULL
";
$result = $conn->query($query);
if ($result && $result->num_rows > 0) {
    echo "<p><strong>Nom_perso invalides :</strong></p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . htmlspecialchars($row['Nom_perso']) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<p>✓ Tous les Nom_perso sont valides</p>";
}

$conn->close();
?>


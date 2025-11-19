<?php
/**
 * FICHIER UPLOAD.PHP
 * ===================
 * Script de téléchargement d'images pour le jeu "Le Monde de Kram"
 * Permet aux utilisateurs d'uploader des images de fond pour la carte
 * Gère la validation des types de fichiers et le stockage sécurisé
 */

// === VÉRIFICATION DE LA MÉTHODE DE REQUÊTE ===
// Vérifier que la requête est bien en POST et qu'un fichier image est présent
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    
    // === VALIDATION DU TYPE DE FICHIER ===
    // Extraire l'extension du fichier uploadé en minuscules
    $imageFileType = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    
    // === VÉRIFICATION DE L'EXTENSION ===
    // Seules les images JPG/JPEG sont autorisées pour des raisons de sécurité
    if ($imageFileType != 'jpg' && $imageFileType != 'jpeg') {
        echo "Seules les images JPG sont autorisées.";
        exit;
    }
    
    // === TÉLÉCHARGEMENT DU FICHIER ===
    // Déplacer le fichier temporaire vers le dossier images avec le nom "Fond.jpg"
    // Le fichier remplacera l'ancienne image de fond si elle existe
    move_uploaded_file($_FILES['image']['tmp_name'], 'images/Fond.jpg');
}
?>

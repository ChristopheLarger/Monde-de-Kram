<?php
/**
 * FICHIER UPLOAD.PHP
 * ===================
 * Script de téléchargement d'images pour le jeu "Le Monde de Kram"
 * Enregistre l'image en images/Figurines/<nom>.png (PNG/JPEG/GIF/WebP acceptés).
 */

@ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

if (!extension_loaded('gd')) {
    echo json_encode(['ok' => false, 'message' => 'Extension GD non chargée sur le serveur']);
    exit;
}

// Empêcher l'affichage des erreurs PHP en HTML (toujours renvoyer du JSON)
ob_start();
set_error_handler(function ($errno, $errstr) {
    ob_end_clean();
    echo json_encode(['ok' => false, 'message' => 'Erreur serveur: ' . $errstr]);
    exit;
});

// Vérification de la méthode de la requête et de l'existence du paramètre image
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['image'])) {
    echo json_encode(['ok' => false, 'message' => 'Requête invalide']);
    exit;
}

// Récupération du fichier uploadé
$file = $_FILES['image'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['ok' => false, 'message' => 'Erreur upload: ' . $file['error']]);
    exit;
}

// Dossier de destination (chemin normalisé pour Windows)
$dir = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, __DIR__ . '/images/Figurines'), DIRECTORY_SEPARATOR);
if (!is_dir($dir)) {
    if (!@mkdir($dir, 0755, true)) {
        echo json_encode(['ok' => false, 'message' => 'Impossible de créer le dossier images/Figurines']);
        exit;
    }
}

// Récupération du nom de l'image
$nom = isset($_POST['nom']) ? trim((string) $_POST['nom']) : '';

// Enregistrement sous le nom donné
$nom = str_replace(['../', '..\\', '/', '\\', "\0"], '', $nom);
if (strlen($nom) > 256) {
    echo json_encode(['ok' => false, 'message' => 'Nom invalide']);
    exit;
}

// Vérification du type de fichier
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);
$allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
if (!in_array($mime, $allowed)) {
    echo json_encode(['ok' => false, 'message' => 'Type de fichier non autorisé']);
    exit;
}

try {
    $dest = $dir . DIRECTORY_SEPARATOR . $nom . '.png';

    $img = null;
    switch ($mime) {
        case 'image/jpeg':
        case 'image/jpg':
            $img = @imagecreatefromjpeg($file['tmp_name']);
            break;
        case 'image/gif':
            $img = @imagecreatefromgif($file['tmp_name']);
            break;
        case 'image/webp':
            $img = @imagecreatefromwebp($file['tmp_name']);
            break;
        case 'image/png':
            $img = @imagecreatefrompng($file['tmp_name']);
            break;
    }
    if (!$img) {
        echo json_encode(['ok' => false, 'message' => 'Impossible de lire l\'image (format ou fichier invalide)']);
        exit;
    }

    // Rendre transparente la couleur du pixel en bas à droite (convention du jeu)
    $width = imagesx($img);
    $height = imagesy($img);
    if ($width > 0 && $height > 0) {
        if (imageistruecolor($img)) {
            // Image truecolor (JPEG, PNG 24b, WebP…) : activer alpha et rendre transparents les pixels de cette couleur
            $key = imagecolorat($img, $width - 1, $height - 1);
            $kr = ($key >> 16) & 0xFF;
            $kg = ($key >> 8) & 0xFF;
            $kb = $key & 0xFF;
            imagealphablending($img, false);
            imagesavealpha($img, true);
            for ($y = 0; $y < $height; $y++) {
                for ($x = 0; $x < $width; $x++) {
                    $c = imagecolorat($img, $x, $y);
                    if ((($c >> 16) & 0xFF) === $kr && (($c >> 8) & 0xFF) === $kg && ($c & 0xFF) === $kb) {
                        imagesetpixel($img, $x, $y, (127 << 24) | ($kr << 16) | ($kg << 8) | $kb);
                    }
                }
            }
        } else {
            // Image à palette (GIF, PNG 8b) : déclarer l’index du pixel en bas à droite comme transparent
            $index = @imagecolorat($img, $width - 1, $height - 1);
            if ($index !== false) {
                @imagecolortransparent($img, (int) $index);
            }
        }
    }

    // Écrire d'abord dans un fichier temporaire (évite "Permission denied" si le fichier cible est verrouillé)
    $destTmp = $dir . DIRECTORY_SEPARATOR . $nom . '.png.tmp';
    $ok = @imagepng($img, $destTmp, 0);
    imagedestroy($img);
    if (!$ok || !file_exists($destTmp)) {
        if (file_exists($destTmp)) @unlink($destTmp);
        ob_end_clean();
        echo json_encode(['ok' => false, 'message' => 'Échec enregistrement (fichier temporaire)']);
        exit;
    }
    // Remplacer le fichier final par le temporaire (atomique quand possible)
    if (!@rename($destTmp, $dest)) {
        @unlink($destTmp);
        ob_end_clean();
        echo json_encode(['ok' => false, 'message' => 'Impossible de remplacer l\'image (fichier peut-être ouvert ailleurs). Fermez l\'image et réessayez.']);
        exit;
    }

    // Retour de la réponse (vider tout sorti parasite puis envoyer le JSON)
    ob_end_clean();
    echo json_encode(['ok' => true, 'path' => 'images/Figurines/' . $nom . '.png']);
} catch (Throwable $e) {
    if (ob_get_level()) ob_end_clean();
    echo json_encode(['ok' => false, 'message' => 'Erreur: ' . $e->getMessage()]);
}

<?php
/**
 * Sauvegarde le tableau Terrains en fichier JSON et en base MySQL.
 * POST : { "version": 1, "terrains": [ ... ] }
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Méthode POST requise']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['terrains']) || !is_array($data['terrains'])) {
    echo json_encode(['ok' => false, 'message' => 'JSON invalide : propriété « terrains » attendue']);
    exit;
}

$terrains = $data['terrains'];

$dir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
    echo json_encode(['ok' => false, 'message' => 'Impossible de créer le dossier data/']);
    exit;
}

$saveDoc = [
    'version' => $data['version'] ?? 1,
    'savedAt' => $data['savedAt'] ?? date('c'),
    'terrains' => $terrains
];

$file = $dir . DIRECTORY_SEPARATOR . 'terrains.json';
if (file_put_contents($file, json_encode($saveDoc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    echo json_encode(['ok' => false, 'message' => 'Impossible d\'écrire data/terrains.json']);
    exit;
}

$conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');
if ($conn->connect_error) {
    echo json_encode(['ok' => false, 'message' => 'Connexion MySQL échouée']);
    exit;
}
$conn->set_charset('utf8mb4');

if (!$conn->query('DELETE FROM terrain')) {
    echo json_encode(['ok' => false, 'message' => 'Erreur SQL DELETE : ' . $conn->error]);
    exit;
}

$sql = "INSERT INTO terrain (`Type`, `Position`, `Color`) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['ok' => false, 'message' => 'Erreur préparation INSERT : ' . $conn->error]);
    exit;
}

foreach ($terrains as $terrain) {
    $type = (string) ($terrain['Type'] ?? '');
    $position = (string) ($terrain['Position'] ?? '0,0');
    $color = (string) ($terrain['Color'] ?? '#000000');
    $stmt->bind_param('sss', $type, $position, $color);
    $stmt->execute();
    if ($stmt->error) {
        echo json_encode(['ok' => false, 'message' => 'Erreur INSERT : ' . $stmt->error]);
        exit;
    }
}

$stmt->close();
$conn->close();

echo json_encode([
    'ok' => true,
    'message' => 'Sauvegarde réussie',
    'count' => count($terrains),
    'file' => 'data/terrains.json'
]);

<?php
/**
 * Sauvegarde le tableau Pions en fichier JSON et en base MySQL.
 * POST : { "version": 1, "pions": [ ... ] }
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'message' => 'Méthode POST requise']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['pions']) || !is_array($data['pions'])) {
    echo json_encode(['ok' => false, 'message' => 'JSON invalide : propriété « pions » attendue']);
    exit;
}

$pions = $data['pions'];

$dir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
    echo json_encode(['ok' => false, 'message' => 'Impossible de créer le dossier data/']);
    exit;
}

$saveDoc = [
    'version' => $data['version'] ?? 1,
    'savedAt' => $data['savedAt'] ?? date('c'),
    'pions' => $pions
];

$file = $dir . DIRECTORY_SEPARATOR . 'pions.json';
if (file_put_contents($file, json_encode($saveDoc, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    echo json_encode(['ok' => false, 'message' => 'Impossible d\'écrire data/pions.json']);
    exit;
}

$columns = [
    'Type', 'Model', 'Position', 'Selected', 'Indice',
    'Vue', 'Titre', 'Arme1', 'Arme2', 'Note',
    'Auto', 'Fatigue', 'Concentration', 'General', 'Tete', 'Poitrine', 'Abdomen', 'Brasg', 'Brasd',
    'Jambeg', 'Jambed'
];

$bools = [
    'Selected', 'Auto'
];

$ints = [
    'Indice', 'Vue', 'Fatigue', 'Concentration', 'General', 'Tete', 'Poitrine',
    'Abdomen', 'Brasg', 'Brasd', 'Jambeg', 'Jambed'
];

$conn = new mysqli('localhost', 'kram_app', 'Titoon#01', 'Kram');
if ($conn->connect_error) {
    echo json_encode(['ok' => false, 'message' => 'Connexion MySQL échouée']);
    exit;
}
$conn->set_charset('utf8mb4');

if (!$conn->query('DELETE FROM pion')) {
    echo json_encode(['ok' => false, 'message' => 'Erreur SQL DELETE : ' . $conn->error]);
    exit;
}

$colList = '`' . implode('`, `', $columns) . '`';
$placeholders = implode(', ', array_fill(0, count($columns), '?'));
$sql = "INSERT INTO pion ($colList) VALUES ($placeholders)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['ok' => false, 'message' => 'Erreur préparation INSERT : ' . $conn->error]);
    exit;
}

foreach ($pions as $pion) {
    $values = [];
    foreach ($columns as $col) {
        $val = $pion[$col] ?? null;
        if (in_array($col, $bools, true)) {
            $val = ($val === true || $val === 1 || $val === '1' || $val === 'true') ? 1 : 0;
        } elseif (in_array($col, $ints, true)) {
            $val = (int) $val;
        } else {
            $val = (string) ($val ?? '');
        }
        $values[] = $val;
    }
    $types = str_repeat('s', count($columns));
    $stmt->bind_param($types, ...$values);
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
    'count' => count($pions),
    'file' => 'data/pions.json'
]);

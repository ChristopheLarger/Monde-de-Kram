<?php
/**
 * Charge le tableau Terrains depuis data/terrains.json
 */

header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'terrains.json';

if (!is_file($file)) {
    echo json_encode(['ok' => false, 'message' => 'Fichier data/terrains.json introuvable']);
    exit;
}

$raw = file_get_contents($file);
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['terrains']) || !is_array($data['terrains'])) {
    echo json_encode(['ok' => false, 'message' => 'Format de data/terrains.json invalide']);
    exit;
}

echo json_encode([
    'ok' => true,
    'version' => $data['version'] ?? 1,
    'savedAt' => $data['savedAt'] ?? null,
    'terrains' => $data['terrains']
], JSON_UNESCAPED_UNICODE);

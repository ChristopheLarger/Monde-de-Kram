<?php
/**
 * Charge le tableau Pions depuis data/pions.json
 */

header('Content-Type: application/json; charset=utf-8');

$file = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'pions.json';

if (!is_file($file)) {
    echo json_encode(['ok' => false, 'message' => 'Fichier data/pions.json introuvable']);
    exit;
}

$raw = file_get_contents($file);
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['pions']) || !is_array($data['pions'])) {
    echo json_encode(['ok' => false, 'message' => 'Format de data/pions.json invalide']);
    exit;
}

echo json_encode([
    'ok' => true,
    'version' => $data['version'] ?? 1,
    'savedAt' => $data['savedAt'] ?? null,
    'pions' => $data['pions']
], JSON_UNESCAPED_UNICODE);

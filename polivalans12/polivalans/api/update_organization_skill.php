<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0); // hata mesajlarını gizle
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// echo json_encode(['success' => true]);
// exit;

// Hataları kullanıcıya gösterme, log dosyasına yaz
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

require_once __DIR__ . '/../config.php';

// PDO bağlantısının varlığını kontrol et
if (!isset($pdo)) {
    echo json_encode(['success' => false, 'message' => 'PDO bağlantısı bulunamadı.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['organization_skill_id'], $data['priority'])) {
    echo json_encode(['success' => false, 'message' => 'Eksik parametre.']);
    exit;
}

$organizationSkillId = intval($data['organization_skill_id']);
$priority = trim($data['priority']);

if ($organizationSkillId <= 0 || !in_array($priority, ['low', 'medium', 'high'])) {
    echo json_encode(['success' => false, 'message' => 'Geçersiz veri.']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE organization_skills SET priority = ? WHERE id = ?");
    $stmt->execute([$priority, $organizationSkillId]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı hatası: ' . $e->getMessage()]);
}

<?php
require_once 'config.php'; // PDO bağlantısı zaten config.php'de var

header('Content-Type: application/json');

if (!isset($_GET['organization_id'])) {
    echo json_encode([]);
    exit;
}

$orgId = intval($_GET['organization_id']);

try {
    $stmt = $pdo->prepare("
        SELECT s.skill_name 
        FROM organization_skills os
        JOIN skills s ON os.skill_id = s.id
        WHERE os.organization_id = :orgId AND s.is_active = 1
        ORDER BY s.skill_name ASC
    ");
    $stmt->execute(['orgId' => $orgId]);
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($skills);
} catch (PDOException $e) {
    // Hata JSON olarak dön
    echo json_encode(['error' => 'Veritabanı hatası: ' . $e->getMessage()]);
}

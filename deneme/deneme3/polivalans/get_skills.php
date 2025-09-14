<?php
require_once 'config.php'; // PDO bağlantısı zaten config.php'de var

header('Content-Type: application/json');

if (!isset($_GET['organization_id'])) {
    echo json_encode([]);
    exit;
}

$orgId = intval($_GET['organization_id']);

try {
    $stmt = $pdo->prepare("SELECT skill_name FROM organization_skills WHERE organization_id = :orgId ORDER BY skill_name ASC");
    $stmt->execute(['orgId' => $orgId]);
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($skills);
} catch (PDOException $e) {
    // Hata JSON olarak dön
    echo json_encode(['error' => 'Veritabanı hatası: ' . $e->getMessage()]);
}

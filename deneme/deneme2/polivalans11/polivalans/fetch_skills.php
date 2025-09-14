<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Veritabanı bağlantısı (config.php dosyanda $pdo tanımlı olmalı)
require_once 'config.php';

try {
    $query = "
        SELECT 
            skill_name,
            COUNT(*) AS skill_count
        FROM organization_skills
        GROUP BY skill_name
        ORDER BY skill_name
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = [];
    foreach ($results as $row) {
        $data[$row['skill_name']] = (int)$row['skill_count'];
    }

    header('Content-Type: application/json');
    echo json_encode($data);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı hatası: ' . $e->getMessage()]);
}

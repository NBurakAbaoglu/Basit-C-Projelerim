<?php
header('Content-Type: application/json');

// config.php dosyasını dahil et
require_once 'config.php';

try {
    if (!isset($pdo)) {
        throw new Exception('PDO bağlantısı bulunamadı.');
    }

    $sql = "SELECT organization_id, row_name, image_name FROM organization_images";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $results
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

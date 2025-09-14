<?php
header('Content-Type: application/json');

require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['organization_id']) || !isset($input['row_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Eksik parametre']);
    exit;
}

$organization_id = $input['organization_id'];
$row_name = $input['row_name'];
$image_name = isset($input['image_name']) ? $input['image_name'] : 'pie (2).png';

try {
    // Öncelikle aynı kayıt var mı kontrol et
    $stmt = $pdo->prepare("SELECT * FROM organization_images WHERE organization_id = ? AND row_name = ? AND image_name = ?");
    $stmt->execute([$organization_id, $row_name, $image_name]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Kayıt zaten varsa onu döndür
        echo json_encode(['success' => true, 'data' => $existing, 'message' => 'Kayıt zaten mevcut']);
        exit;
    }

    // Kayıt yoksa yeni kayıt oluştur
    $stmt = $pdo->prepare("INSERT INTO organization_images (organization_id, row_name, image_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->execute([$organization_id, $row_name, $image_name]);

    $lastId = $pdo->lastInsertId();

    $stmt = $pdo->prepare("SELECT * FROM organization_images WHERE id = ?");
    $stmt->execute([$lastId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $row]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı hatası', 'message' => $e->getMessage()]);
    exit;
}

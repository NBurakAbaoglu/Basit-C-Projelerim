<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

try {
    $mysqli = getDBConnection();
    if (!$mysqli) {
        throw new Exception("Veritabanı bağlantısı kurulamadı");
    }
    
    // Tüm kişi-organizasyon resim eşleştirmelerini getir
    $sql = "SELECT 
                poi.id,
                p.name as person_name,
                o.name as organization_name,
                poi.image_name,
                poi.created_at,
                poi.updated_at
            FROM person_organization_images poi
            JOIN persons p ON poi.person_id = p.id
            JOIN organizations o ON poi.organization_id = o.id
            ORDER BY p.name, o.name";
    
    $images = fetchAll($mysqli, $sql, []);
    
    echo json_encode([
        'success' => true, 
        'images' => $images
    ]);
    
} catch (Exception $e) {
    error_log("Resim yükleme hatası: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Hata: ' . $e->getMessage()]);
}
?>

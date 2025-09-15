<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

try {
    $mysqli = getDBConnection();
    if (!$mysqli) {
        throw new Exception("Veritabanı bağlantısı kurulamadı");
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $personName = $input['person_name'] ?? null;
    $organizationName = $input['organization_name'] ?? null;
    $imageName = $input['image_name'] ?? 'pie (2).png';
    
    if (!$personName || !$organizationName) {
        throw new Exception("Kişi adı ve organizasyon adı gerekli");
    }
    
    // Kişi ID'sini bul
    $personSQL = "SELECT id FROM persons WHERE name = ?";
    $person = fetchRow($mysqli, $personSQL, [$personName]);
    
    if (!$person) {
        throw new Exception("Kişi bulunamadı: " . $personName);
    }
    
    // Organizasyon ID'sini bul
    $orgSQL = "SELECT id FROM organizations WHERE name = ?";
    $organization = fetchRow($mysqli, $orgSQL, [$organizationName]);
    
    if (!$organization) {
        throw new Exception("Organizasyon bulunamadı: " . $organizationName);
    }
    
    // Mevcut kayıt var mı kontrol et
    $checkSQL = "SELECT id FROM person_organization_images WHERE person_id = ? AND organization_id = ?";
    $existing = fetchRow($mysqli, $checkSQL, [$person['id'], $organization['id']]);
    
    if ($existing) {
        // Mevcut kaydı güncelle
        $updateSQL = "UPDATE person_organization_images SET image_name = ? WHERE person_id = ? AND organization_id = ?";
        $result = executeQuery($mysqli, $updateSQL, [$imageName, $person['id'], $organization['id']]);
        
        if ($result) {
            echo json_encode([
                'success' => true, 
                'message' => 'Resim başarıyla güncellendi',
                'person_id' => $person['id'],
                'organization_id' => $organization['id'],
                'image_name' => $imageName
            ]);
        } else {
            throw new Exception("Resim güncellenemedi");
        }
    } else {
        // Yeni kayıt ekle
        $insertSQL = "INSERT INTO person_organization_images (person_id, organization_id, image_name) VALUES (?, ?, ?)";
        $result = executeQuery($mysqli, $insertSQL, [$person['id'], $organization['id'], $imageName]);
        
        if ($result) {
            $imageId = $mysqli->insert_id;
            echo json_encode([
                'success' => true, 
                'message' => 'Resim başarıyla kaydedildi',
                'image_id' => $imageId,
                'person_id' => $person['id'],
                'organization_id' => $organization['id'],
                'image_name' => $imageName
            ]);
        } else {
            throw new Exception("Resim kaydedilemedi");
        }
    }
    
} catch (Exception $e) {
    error_log("Resim kaydetme hatası: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Hata: ' . $e->getMessage()]);
}
?>

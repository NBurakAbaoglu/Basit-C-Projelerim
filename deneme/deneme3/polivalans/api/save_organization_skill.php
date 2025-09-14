<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

try {
    $mysqli = getDBConnection();
    if (!$mysqli) {
        throw new Exception("Veritabanı bağlantısı kurulamadı");
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $organizationId = $input['organization_id'] ?? null;
    $skillName = trim($input['skill_name'] ?? '');
    $skillDescription = trim($input['skill_description'] ?? '');

    if (!$organizationId || !$skillName || !$skillDescription) {
        throw new Exception("Tüm alanlar zorunludur");
    }

    // Aynı organizasyon ve aynı isimde beceri var mı kontrol et
    $checkSQL = "SELECT id FROM organization_skills WHERE organization_id = ? AND LOWER(skill_name) = LOWER(?)";
    $stmt = $mysqli->prepare($checkSQL);
    if (!$stmt) {
        throw new Exception("Sorgu hazırlanamadı: " . $mysqli->error);
    }
    $stmt->bind_param('is', $organizationId, $skillName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Aynı beceri zaten var
        echo json_encode([
            'success' => false,
            'message' => "Bu beceri zaten bu organizasyona eklenmiş."
        ]);
        exit;
    }
    $stmt->close();

    // Yeni beceriyi ekle
    $insertSQL = "INSERT INTO organization_skills (organization_id, skill_name, skill_description) VALUES (?, ?, ?)";
    $stmtInsert = $mysqli->prepare($insertSQL);
    if (!$stmtInsert) {
        throw new Exception("Sorgu hazırlanamadı: " . $mysqli->error);
    }
    $stmtInsert->bind_param('iss', $organizationId, $skillName, $skillDescription);

    if ($stmtInsert->execute()) {
        echo json_encode([
            'success' => true,
            'message' => "Beceri başarıyla eklendi."
        ]);
    } else {
        throw new Exception("Beceri eklenemedi: " . $stmtInsert->error);
    }
    $stmtInsert->close();

    $mysqli->close();

} catch (Exception $e) {
    error_log("Beceri ekleme hatası: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => "Hata: " . $e->getMessage()
    ]);
}
?>

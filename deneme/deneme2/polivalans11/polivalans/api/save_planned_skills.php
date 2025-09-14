<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    $mysqli = getDBConnection();
    if (!$mysqli) throw new Exception("Veritabanı bağlantısı kurulamadı");

    $input = json_decode(file_get_contents('php://input'), true);
    $personName = $input['person_name'] ?? null;
    $organizationName = $input['organization_name'] ?? null;
    $skills = $input['skills'] ?? [];

    if (!$personName || !$organizationName || empty($skills)) {
        throw new Exception("Gerekli veriler eksik");
    }

    // 1️⃣ person bilgilerini al: id, company_name, title, registration_no
    $stmt = $mysqli->prepare("
        SELECT id, company_name, title, registration_no 
        FROM persons 
        WHERE name = ?
        LIMIT 1
    ");
    $stmt->bind_param("s", $personName);
    $stmt->execute();
    $stmt->bind_result($personId, $companyName, $title, $registrationNo);
    if (!$stmt->fetch()) throw new Exception("Person bulunamadı");
    $stmt->close();

    $successCount = 0;

    foreach ($skills as $skillName) {
        // 2️⃣ organization_id ve skill_id bul
        $stmt = $mysqli->prepare("
            SELECT os.id, os.organization_id 
            FROM organization_skills os
            INNER JOIN organizations o ON os.organization_id = o.id
            WHERE os.skill_name = ? AND o.name = ?
            LIMIT 1
        ");
        $stmt->bind_param("ss", $skillName, $organizationName);
        $stmt->execute();
        $stmt->bind_result($skillId, $organizationId);

        if (!$stmt->fetch()) {
            $stmt->close();
            continue; // skill veya organization bulunamazsa atla
        }
        $stmt->close();

        // 3️⃣ planned_skills tablosuna ekle (mevcut planları silmeden)
        $insertSQL = "
            INSERT INTO planned_skills 
            (person_id, organization_id, skill_id, company_name, title, registration_no, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE skill_id = skill_id
        ";
        $stmt = $mysqli->prepare($insertSQL);
        $stmt->bind_param("iiisss", $personId, $organizationId, $skillId, $companyName, $title, $registrationNo);

        if ($stmt->execute()) $successCount++;
        $stmt->close();
    }

    echo json_encode([
        'success' => true,
        'message' => $successCount . ' beceri başarıyla planlandı',
        'saved_count' => $successCount
    ]);

} catch (Exception $e) {
    error_log("Planlanan beceri kaydetme hatası: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Hata: ' . $e->getMessage()
    ]);
}
?>

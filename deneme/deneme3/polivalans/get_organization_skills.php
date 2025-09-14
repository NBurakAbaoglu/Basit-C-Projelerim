<?php
require_once __DIR__ . '/config.php';


header('Content-Type: application/json; charset=utf-8');

try {
    $mysqli = getDBConnection();

    if (!$mysqli) {
        throw new Exception("Veritabanı bağlantısı kurulamadı");
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['organization_id']) && !empty($input['organization_id'])) {
        // Organizasyon bazlı becerileri getir
        $organizationId = $input['organization_id'];
        $sql = "SELECT id, skill_name, skill_description, created_at FROM organization_skills WHERE organization_id = ? ORDER BY created_at ASC";
        $skills = fetchAll($mysqli, $sql, [$organizationId]);

        echo json_encode([
            'success' => true,
            'skills' => $skills
        ]);
    } else {
        // organization_id yoksa, genel skill listesi ve organizasyon sayısı ile
        $query = "
            SELECT skill_name, COUNT(DISTINCT organization_id) AS org_count
            FROM organization_skills
            GROUP BY skill_name
            ORDER BY skill_name
        ";

        $stmt = $mysqli->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();

        $skillsSummary = [];
        while ($row = $result->fetch_assoc()) {
            $skillsSummary[] = $row;
        }

        echo json_encode([
            'success' => true,
            'skills_summary' => $skillsSummary
        ]);
    }

} catch (Exception $e) {
    error_log("Beceri getirme hatası: " . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Hata: ' . $e->getMessage()
    ]);
}
?>

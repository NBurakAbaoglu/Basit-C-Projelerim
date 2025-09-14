<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    // Skill_name ile eşleşen event'leri de almak için JOIN kullanacağız
    $stmt = $pdo->prepare("
        SELECT 
            ps.id AS planned_skill_id,
            ps.person_id,
            ps.skill_id,
            os.skill_name,
            e.teacher_id,
            e.event_date,
            e.event_name
        FROM planned_skills ps
        LEFT JOIN organization_skills os ON ps.skill_id = os.id
        LEFT JOIN events e ON os.skill_name = e.event_name
    ");
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı hatası: ' . $e->getMessage()]);
}
?>

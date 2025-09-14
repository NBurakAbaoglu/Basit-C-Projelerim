<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');

try {
    $mysqli = getDBConnection();
    if (!$mysqli) throw new Exception("Veritabanı bağlantısı kurulamadı");

    $query = "
        SELECT 
            ps.id,
            p.name AS person_name,
            o.name AS organization_name,
            os.skill_name,
            pl.teacher_id,
            pl.success_status
        FROM planned_skills ps
        INNER JOIN persons p ON ps.person_id = p.id
        INNER JOIN organization_skills os ON ps.skill_id = os.id
        INNER JOIN organizations o ON ps.organization_id = o.id
        LEFT JOIN planlandi pl ON ps.person_id = pl.person_id AND ps.skill_id = pl.skill_id
    ";

    $result = $mysqli->query($query);
    if (!$result) throw new Exception("Sorgu hatası: " . $mysqli->error);

    $plannedSkills = [];
    while ($row = $result->fetch_assoc()) {
        $plannedSkills[] = [
            'id' => $row['id'],
            'person_name' => $row['person_name'],
            'organization_name' => $row['organization_name'],
            'skill_name' => $row['skill_name'],
            'teacher_id' => $row['teacher_id'],
            'success_status' => $row['success_status'] ?? 'pending'
        ];
    }

    echo json_encode([
        'success' => true,
        'planned_skills' => $plannedSkills
    ]);

} catch (Exception $e) {
    error_log("Planned skills çekme hatası: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Hata: ' . $e->getMessage()
    ]);
}
?>

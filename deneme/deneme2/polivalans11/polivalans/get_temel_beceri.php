<?php
header('Content-Type: application/json');
require_once 'config.php'; // PDO bağlantısı

try {
    // Planned skills + persons + organization_skills
    $query = "
        SELECT 
            ps.id,
            ps.organization_id,
            ps.registration_no,
            ps.company_name,
            ps.title,
            ps.person_id,
            ps.skill_id,
            CONCAT(p.name) AS person_name,
            os.skill_name,
            pl.teacher_id AS selected_teacher,   -- planlandi tablosundan seçilmiş eğitmen
            pl.event_id AS selected_event,       -- planlandi tablosundan seçilmiş etkinlik
            pl.success_status AS success_status  -- planlandi tablosundan başarı durumu
        FROM planned_skills ps
        LEFT JOIN persons p ON ps.person_id = p.id
        LEFT JOIN organization_skills os ON ps.skill_id = os.id
        LEFT JOIN planlandi pl 
            ON ps.person_id = pl.person_id 
            AND ps.organization_id = pl.organization_id
            AND ps.skill_id = pl.skill_id
        ORDER BY ps.id ASC
    ";
    $stmt = $pdo->query($query);
    $plannedSkills = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Events tablosu
    $eventsStmt = $pdo->query("SELECT * FROM events");
    $events = $eventsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Teachers tablosu (tep_teachers)
    $teachersStmt = $pdo->query("SELECT id, person_name FROM tep_teachers");
    $teachers = $teachersStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'plannedSkills' => $plannedSkills,
        'events' => $events,
        'teachers' => $teachers
    ]);

} catch(PDOException $e){
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}

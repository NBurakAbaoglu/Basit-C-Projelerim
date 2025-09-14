<?php
require_once 'config.php'; // PDO bağlantısı config.php'de var
header('Content-Type: application/json');

try {
    // Formdan gelen veriler
    $organization_name = $_POST['multiSkill'] ?? '';
    $skill_name        = $_POST['basicSkill'] ?? '';
    $teacher_name      = $_POST['teacher'] ?? '';
    $start_date        = $_POST['startDate'] ?? '';
    $end_date          = $_POST['endDate'] ?? '';
    $capacity          = $_POST['quota'] ?? '';
    $description       = $_POST['description'] ?? '';

    if (
        $organization_name === '' || 
        $skill_name === '' || 
        $teacher_name === '' || 
        $start_date === '' || 
        $end_date === '' || 
        $capacity === ''
    ) {
        throw new Exception("Lütfen tüm zorunlu alanları doldurun.");
    }

    // organization_skills tablosundan skill_name'e göre lesson_id çek
    $stmtLesson = $pdo->prepare("SELECT id FROM organization_skills WHERE skill_name = :skillName LIMIT 1");
    $stmtLesson->execute(['skillName' => $skill_name]);
    $lesson = $stmtLesson->fetch();

    if (!$lesson) {
        throw new Exception("Seçilen ders organization_skills tablosunda bulunamadı.");
    }

    $lesson_id = $lesson['id'];

    // teacher_id'yi bul (teachers tablosundan)
    $stmtTeacher = $pdo->prepare("
        SELECT t.id 
        FROM teachers t
        INNER JOIN tep_teachers tt ON CONCAT(t.first_name, ' ', t.last_name) = tt.person_name
        WHERE tt.person_name = :teacherName 
          AND tt.skill_name = :skillName
        LIMIT 1
    ");
    $stmtTeacher->execute(['teacherName' => $teacher_name, 'skillName' => $skill_name]);
    $teacher = $stmtTeacher->fetch();

    if (!$teacher) throw new Exception("Seçilen öğretmen bulunamadı.");

    $teacher_id = $teacher['id'];

    // event_name olarak Çoklu Beceri seçilen değer
    $event_name = $organization_name;

    // Veriyi events tablosuna ekle
    $stmtInsert = $pdo->prepare("
        INSERT INTO events 
            (event_name, event_date, end_date, teacher_id, lesson_id, course_title, capacity, enrolled_count, description, status, created_at)
        VALUES 
            (:event_name, :start_date, :end_date, :teacher_id, :lesson_id, :course_title, :capacity, 0, :description, 'active', NOW())
    ");

    $stmtInsert->execute([
        'event_name'   => $event_name,
        'start_date'   => $start_date,
        'end_date'     => $end_date,
        'teacher_id'   => $teacher_id,
        'lesson_id'    => $lesson_id,
        'course_title' => $skill_name,
        'capacity'     => $capacity,
        'description'  => $description
    ]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

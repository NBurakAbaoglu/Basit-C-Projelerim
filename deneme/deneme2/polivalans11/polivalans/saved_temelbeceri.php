<?php
header('Content-Type: application/json');
require_once 'config.php';
ini_set('display_errors', 0);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success'=>false, 'message'=>'Geçersiz veri']);
    exit;
}

try {
    // Önce aynı person_id, organization_id, skill_id kombinasyonu var mı kontrol et
    $checkStmt = $pdo->prepare("
        SELECT id FROM planlandi 
        WHERE person_id = :person_id 
        AND organization_id = :organization_id 
        AND skill_id = :skill_id
        LIMIT 1
    ");
    $checkStmt->execute([
        ':person_id' => $data['person_id'],
        ':organization_id' => $data['organization_id'],
        ':skill_id' => $data['skill_id']
    ]);
    
    $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingRecord) {
        // Mevcut kaydı güncelle
        $stmt = $pdo->prepare("
            UPDATE planlandi SET
            teacher_id = :teacher_id,
            event_id = :event_id,
            target_level = :target_level,
            start_date = :start_date,
            end_date = :end_date,
            status = :status,
            priority = :priority,
            notes = :notes,
            success_status = :success_status,
            updated_at = NOW()
            WHERE id = :id
        ");
        $stmt->execute([
            ':teacher_id' => $data['teacher_id'],
            ':event_id' => $data['event_id'],
            ':target_level' => $data['target_level'],
            ':start_date' => $data['start_date'],
            ':end_date' => $data['end_date'],
            ':status' => $data['status'],
            ':priority' => $data['priority'],
            ':notes' => $data['notes'],
            ':success_status' => $data['success_status'],
            ':id' => $existingRecord['id']
        ]);
        echo json_encode(['success'=>true, 'message'=>'Kayıt güncellendi']);
    } else {
        // Yeni kayıt ekle
        $stmt = $pdo->prepare("
            INSERT INTO planlandi
            (person_id, organization_id, skill_id, teacher_id, event_id, target_level, start_date, end_date, status, priority, notes, success_status, created_by, created_at, updated_at)
            VALUES
            (:person_id, :organization_id, :skill_id, :teacher_id, :event_id, :target_level, :start_date, :end_date, :status, :priority, :notes, :success_status, :created_by, NOW(), NOW())
        ");
        $stmt->execute([
            ':person_id' => $data['person_id'],
            ':organization_id' => $data['organization_id'],
            ':skill_id' => $data['skill_id'],
            ':teacher_id' => $data['teacher_id'],
            ':event_id' => $data['event_id'],
            ':target_level' => $data['target_level'],
            ':start_date' => $data['start_date'],
            ':end_date' => $data['end_date'],
            ':status' => $data['status'],
            ':priority' => $data['priority'],
            ':notes' => $data['notes'],
            ':success_status' => $data['success_status'],
            ':created_by' => $data['created_by']
        ]);
        echo json_encode(['success'=>true, 'message'=>'Yeni kayıt eklendi']);
    }
} catch (PDOException $e) {
    echo json_encode(['success'=>false, 'message'=>$e->getMessage()]);
}

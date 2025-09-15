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
        
        // 🔄 Aynı beceri adına sahip diğer organizasyonlardaki becerileri de güncelle
        syncSkillStatusAcrossOrganizations($data['person_id'], $data['skill_id'], $data['success_status'], $data['status'], $pdo);
        
        echo json_encode(['success'=>true, 'message'=>'Kayıt güncellendi ve diğer organizasyonlarla senkronize edildi']);
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
        
        // 🔄 Aynı beceri adına sahip diğer organizasyonlardaki becerileri de güncelle
        syncSkillStatusAcrossOrganizations($data['person_id'], $data['skill_id'], $data['success_status'], $data['status'], $pdo);
        
        echo json_encode(['success'=>true, 'message'=>'Yeni kayıt eklendi ve diğer organizasyonlarla senkronize edildi']);
    }
} catch (PDOException $e) {
    echo json_encode(['success'=>false, 'message'=>$e->getMessage()]);
}

/**
 * Aynı beceri adına sahip tüm organizasyonlardaki becerilerin durumunu senkronize eder
 */
function syncSkillStatusAcrossOrganizations($personId, $skillId, $successStatus, $status, $pdo) {
    try {
        // Önce bu skill_id'nin hangi skill_name'e ait olduğunu bul
        $skillNameStmt = $pdo->prepare("
            SELECT s.skill_name 
            FROM skills s
            INNER JOIN organization_skills os ON s.id = os.skill_id
            WHERE os.id = ?
            LIMIT 1
        ");
        $skillNameStmt->execute([$skillId]);
        $skillName = $skillNameStmt->fetch(PDO::FETCH_ASSOC)['skill_name'];
        
        if (!$skillName) {
            return; // Skill name bulunamazsa işlemi durdur
        }
        
        // Aynı skill_name'e sahip tüm organization_skills'leri bul
        $allSkillsStmt = $pdo->prepare("
            SELECT os.id as organization_skill_id, o.name as organization_name
            FROM skills s
            INNER JOIN organization_skills os ON s.id = os.skill_id
            INNER JOIN organizations o ON os.organization_id = o.id
            WHERE s.skill_name = ? AND s.is_active = 1
        ");
        $allSkillsStmt->execute([$skillName]);
        $allSkills = $allSkillsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $syncedCount = 0;
        
        // Her organizasyon için aynı kişinin bu becerisini güncelle
        foreach ($allSkills as $skill) {
            $orgSkillId = $skill['organization_skill_id'];
            $orgName = $skill['organization_name'];
            
            // Bu kişi ve organizasyon için planlandi kaydı var mı kontrol et
            $checkStmt = $pdo->prepare("
                SELECT id FROM planlandi 
                WHERE person_id = ? AND skill_id = ?
                LIMIT 1
            ");
            $checkStmt->execute([$personId, $orgSkillId]);
            $existingRecord = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingRecord) {
                // Mevcut kaydı güncelle
                $updateStmt = $pdo->prepare("
                    UPDATE planlandi SET
                    success_status = ?,
                    status = ?,
                    updated_at = NOW()
                    WHERE id = ?
                ");
                $updateStmt->execute([$successStatus, $status, $existingRecord['id']]);
                $syncedCount++;
            } else {
                // Yeni kayıt oluştur (sadece temel bilgilerle)
                $insertStmt = $pdo->prepare("
                    INSERT INTO planlandi
                    (person_id, organization_id, skill_id, success_status, status, created_at, updated_at)
                    VALUES
                    (?, (SELECT organization_id FROM organization_skills WHERE id = ?), ?, ?, ?, NOW(), NOW())
                ");
                $insertStmt->execute([$personId, $orgSkillId, $orgSkillId, $successStatus, $status]);
                $syncedCount++;
            }
        }
        
        error_log("🔄 Beceri senkronizasyonu: {$skillName} - {$syncedCount} organizasyon güncellendi");
        
    } catch (Exception $e) {
        error_log("❌ Beceri senkronizasyon hatası: " . $e->getMessage());
    }
}

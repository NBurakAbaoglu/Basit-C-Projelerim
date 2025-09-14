<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['person_id']) || !isset($input['organization_id']) || !isset($input['selected_skills'])) {
        throw new Exception('Person ID, Organization ID ve Selected Skills gerekli');
    }
    
    $person_id = $input['person_id'];
    $organization_id = $input['organization_id'];
    $selected_skills = $input['selected_skills'];
    
    // Transaction başlat
    $pdo->beginTransaction();
    
    try {
        foreach ($selected_skills as $skill) {
            // Çoklu beceri kaydı için yeni tablo oluştur (multi_skills)
            $query = "
                INSERT INTO multi_skills (
                    person_id, 
                    organization_id, 
                    skill_id, 
                    skill_name, 
                    source_organization_id,
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                    updated_at = NOW()
            ";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute([
                $person_id,
                $organization_id,
                $skill['skill_id'],
                $skill['skill_name'],
                $skill['organization_id']
            ]);
        }
        
        // Transaction'ı commit et
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Çoklu beceriler başarıyla kaydedildi',
            'saved_count' => count($selected_skills)
        ]);
        
    } catch (Exception $e) {
        // Transaction'ı rollback et
        $pdo->rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

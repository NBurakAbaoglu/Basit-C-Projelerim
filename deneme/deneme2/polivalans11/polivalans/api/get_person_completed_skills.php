<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['organization_id']) || !isset($input['person_id'])) {
        throw new Exception('Organization ID ve Person ID gerekli');
    }
    
    $organization_id = $input['organization_id'];
    $person_id = $input['person_id'];
    
    // Bu kişinin tamamlanan becerilerini al
    $query = "
        SELECT 
            ps.id,
            ps.person_id,
            ps.skill_id,
            os.skill_name,
            pl.success_status,
            pl.id as planlandi_id
        FROM planned_skills ps
        LEFT JOIN organization_skills os ON ps.skill_id = os.id
        LEFT JOIN planlandi pl 
            ON ps.person_id = pl.person_id 
            AND ps.organization_id = pl.organization_id
            AND ps.skill_id = pl.skill_id
        WHERE ps.organization_id = ? AND ps.person_id = ? AND pl.success_status = 'completed'
        ORDER BY ps.skill_id
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$organization_id, $person_id]);
    $skills = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'skills' => $skills
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

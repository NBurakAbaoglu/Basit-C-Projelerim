<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

try {
    // Tüm organizasyon becerilerini al
    $query = "
        SELECT 
            os.id,
            os.organization_id,
            os.skill_name,
            o.name as organization_name
        FROM organization_skills os
        LEFT JOIN organizations o ON os.organization_id = o.id
        ORDER BY o.name, os.skill_name
    ";
    
    $stmt = $pdo->query($query);
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

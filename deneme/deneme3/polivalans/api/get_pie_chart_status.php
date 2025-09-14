<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['organization_id']) || !isset($input['row_name'])) {
        throw new Exception('Organization ID ve row name gerekli');
    }
    
    $organization_id = $input['organization_id'];
    $row_name = $input['row_name'];
    
    // Pie chart durumunu veritabanından al
    $stmt = $pdo->prepare("
        SELECT image_name, updated_at 
        FROM organization_images 
        WHERE organization_id = ? AND row_name = ?
        LIMIT 1
    ");
    $stmt->execute([$organization_id, $row_name]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        $is_completed = ($result['image_name'] === 'pie (3).png');
        echo json_encode([
            'success' => true,
            'image_name' => $result['image_name'],
            'is_completed' => $is_completed,
            'updated_at' => $result['updated_at']
        ]);
    } else {
        // Kayıt yoksa varsayılan olarak pending
        echo json_encode([
            'success' => true,
            'image_name' => 'pie (2).png',
            'is_completed' => false,
            'updated_at' => null
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>

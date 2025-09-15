<?php
header('Content-Type: application/json');
include 'config.php';

$mysqli = getDBConnection();

if (!$mysqli) {
    echo json_encode(['success' => false, 'message' => 'Veritabanı bağlantısı kurulamadı']);
    exit;
}

if (!isset($_GET['organization_id'])) {
    echo json_encode(['success' => false, 'message' => 'organization_id parametresi eksik']);
    exit;
}

$organization_id = intval($_GET['organization_id']);

// Hazırlanmış sorgu
$stmt = $mysqli->prepare("SELECT image_name FROM organization_images WHERE organization_id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Sorgu hazırlanamadı: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param("i", $organization_id);
$stmt->execute();
$result = $stmt->get_result();

$images = [];
while ($row = $result->fetch_assoc()) {
    $images[] = $row['image_name'];
}

$stmt->close();
closeDBConnection($mysqli);

echo json_encode(['success' => true, 'images' => $images]);
exit;

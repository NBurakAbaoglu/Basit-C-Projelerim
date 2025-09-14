<?php
require_once 'config.php'; // PDO bağlantısı config.php'de var
header('Content-Type: application/json');

$organization_name = isset($_GET['organization_name']) ? $_GET['organization_name'] : null;
$skill_name = isset($_GET['skill_name']) ? $_GET['skill_name'] : null;

try {
    $sql = "SELECT person_name, organization_name, skill_name 
            FROM tep_teachers 
            WHERE 1=1";
    $params = [];

    if ($organization_name) {
        $sql .= " AND organization_name = :orgName";
        $params['orgName'] = $organization_name;
    }

    if ($skill_name) {
        $sql .= " AND skill_name = :skillName";
        $params['skillName'] = $skill_name;
    }

    $sql .= " ORDER BY person_name ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($teachers);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Veritabanı hatası: ' . $e->getMessage()]);
}

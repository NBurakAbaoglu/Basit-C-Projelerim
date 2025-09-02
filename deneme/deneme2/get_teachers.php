<?php
/**
 * Eğitimci Listesi ve Kontenjan API
 * 
 * Bu API, events tablosundan eğitimci verilerini ve kontenjan bilgilerini getirir.
 * Başka bir veritabanına aktarırken aşağıdaki değişiklikleri yapın:
 * 
 * 1. Veritabanı bağlantı bilgilerini güncelleyin (config.php)
 * 2. Tablo adlarını kendi yapınıza göre değiştirin
 * 3. Sütun adlarını kendi yapınıza göre değiştirin
 * 4. Veri tiplerini kendi veritabanı motorunuza göre ayarlayın
 * 
 * @author Sistem Geliştirici
 * @version 1.0
 * @since 2024-01-01
 */

// ===== GEREKLİ DOSYALAR =====
require_once '../config.php';  // Veritabanı bağlantı bilgileri burada

// ===== HTTP BAŞLIKLARI =====
// CORS desteği ve JSON yanıt formatı
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// ===== HATA YÖNETİMİ =====
// Hataları JSON formatında döndür
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    // ===== PARAMETRE ALMA =====
    // URL'den ders ID'si veya ders adını al
    $lesson_id = $_GET['lesson_id'] ?? null;        // Ders ID'si (örn: 1, 2, 3)
    $lesson_name = $_GET['lesson_name'] ?? null;    // Ders adı (örn: "Matematik", "Fizik")
    
    // ===== VERİTABANI SORGUSU =====
    if ($lesson_id || $lesson_name) {
        // Belirli bir ders için eğitimcileri getir
        // lesson_id ile eşleşen kayıtları bul
        if ($lesson_id) {
            $whereSql = "lesson_id = ?";
            $params = [$lesson_id];
        } else {
            $whereSql = "lesson_name = ?";
            $params = [$lesson_name];
        }
        
        // Kontenjan bilgileriyle birlikte eğitimci verilerini getir
        $query = "
            SELECT 
                teacher_id,                    -- Öğretmen ID'si
                teacher_name,                  -- Öğretmen adı
                capacity,                      -- Toplam kapasite
                enrolled_count,                -- Kayıtlı öğrenci sayısı
                (capacity - enrolled_count) as available_slots,  -- Boş kontenjan
                CASE 
                    WHEN (capacity - enrolled_count) > 0 THEN 'available'      -- Kontenjan var
                    WHEN (capacity - enrolled_count) = 0 THEN 'full'           -- Dolu
                    ELSE 'overbooked'                                           -- Aşırı kayıt
                END as capacity_status,        -- Kontenjan durumu
                ROUND((enrolled_count / capacity) * 100, 1) as occupancy_percentage  -- Doluluk %
            FROM events 
            WHERE $whereSql AND status = 'active'  -- Sadece aktif etkinlikler
            ORDER BY available_slots DESC, teacher_name ASC  -- Önce boş kontenjanı olanlar
        ";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
    } else {
        // Tüm aktif eğitimcileri getir
        $query = "
            SELECT 
                teacher_id,                    -- Öğretmen ID'si
                teacher_name,                  -- Öğretmen adı
                lesson_id,                     -- Ders ID'si
                lesson_name,                   -- Ders adı
                capacity,                      -- Toplam kapasite
                enrolled_count,                -- Kayıtlı öğrenci sayısı
                (capacity - enrolled_count) as available_slots,  -- Boş kontenjan
                CASE 
                    WHEN (capacity - enrolled_count) > 0 THEN 'available'      -- Kontenjan var
                    WHEN (capacity - enrolled_count) = 0 THEN 'full'           -- Dolu
                    ELSE 'overbooked'                                           -- Aşırı kayıt
                END as capacity_status,        -- Kontenjan durumu
                ROUND((enrolled_count / capacity) * 100, 1) as occupancy_percentage  -- Doluluk %
            FROM events 
            WHERE status = 'active'            -- Sadece aktif etkinlikler
            ORDER BY lesson_name, available_slots DESC, teacher_name ASC  -- Derse göre grupla
        ";
        
        $stmt = $pdo->query($query);
    }
    
    // ===== SONUÇLARI İŞLEME =====
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($teachers) > 0) {
        // Başarılı yanıt - eğitimci verileri bulundu
        $response = [
            'success' => true,
            'message' => 'Eğitimciler başarıyla getirildi',
            'count' => count($teachers),
            'teachers' => $teachers,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Debug bilgisi (geliştirme ortamında)
        error_log("✅ Eğitimciler getirildi: " . count($teachers) . " kayıt");
        
    } else {
        // Eğitimci bulunamadı - test verileri döndür
        $mockTeachers = [
            [
                'teacher_id' => 'T001',
                'teacher_name' => 'Ahmet Yılmaz (Test)',
                'lesson_id' => $lesson_id ?: 1,
                'lesson_name' => $lesson_name ?: 'Test Dersi',
                'capacity' => 25,
                'enrolled_count' => 18,
                'available_slots' => 7,
                'capacity_status' => 'available',
                'occupancy_percentage' => 72.0
            ],
            [
                'teacher_id' => 'T002',
                'teacher_name' => 'Fatma Demir (Test)',
                'lesson_id' => $lesson_id ?: 1,
                'lesson_name' => $lesson_name ?: 'Test Dersi',
                'capacity' => 30,
                'enrolled_count' => 30,
                'available_slots' => 0,
                'capacity_status' => 'full',
                'occupancy_percentage' => 100.0
            ]
        ];
        
        $response = [
            'success' => true,
            'message' => 'Eğitimci bulunamadı, test verileri döndürülüyor',
            'count' => count($mockTeachers),
            'teachers' => $mockTeachers,
            'is_mock_data' => true,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        // Debug bilgisi
        error_log("⚠️ Eğitimci bulunamadı, test verileri döndürüldü");
    }
    
} catch (PDOException $e) {
    // Veritabanı hatası
    $response = [
        'success' => false,
        'message' => 'Veritabanı hatası: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Hata logla (güvenlik için detayları kullanıcıya gösterme)
    error_log("❌ Veritabanı hatası: " . $e->getMessage());
    
} catch (Exception $e) {
    // Genel hata
    $response = [
        'success' => false,
        'message' => 'Sistem hatası: ' . $e->getMessage(),
        'error_code' => $e->getCode(),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Hata logla
    error_log("❌ Genel hata: " . $e->getMessage());
}

// ===== YANITI DÖNDÜRME =====
// JSON formatında yanıt döndür
echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

// ===== VERİTABANI BAĞLANTISINI KAPAT =====
// PDO bağlantısı otomatik olarak kapanır, manuel kapatmaya gerek yok

// ===== KULLANIM ÖRNEKLERİ =====
/*
1. Belirli bir ders için eğitimcileri getir:
   GET /api/get_teachers.php?lesson_id=1
   
2. Ders adına göre eğitimcileri getir:
   GET /api/get_teachers.php?lesson_name=Matematik
   
3. Tüm eğitimcileri getir:
   GET /api/get_teachers.php

4. Yanıt formatı:
   {
     "success": true,
     "message": "Eğitimciler başarıyla getirildi",
     "count": 2,
     "teachers": [
       {
         "teacher_id": "1",
         "teacher_name": "Ahmet Yılmaz",
         "capacity": 25,
         "enrolled_count": 18,
         "available_slots": 7,
         "capacity_status": "available",
         "occupancy_percentage": 72.0
       }
     ],
     "timestamp": "2024-01-01 12:00:00"
   }
*/

// ===== VERİTABANI UYARILARI =====
/*
Başka bir veritabanına aktarırken:

1. MySQL -> PostgreSQL:
   - ROUND() -> ROUND()
   - LIMIT -> LIMIT
   - AUTO_INCREMENT -> SERIAL

2. MySQL -> SQL Server:
   - ROUND() -> ROUND()
   - LIMIT -> TOP
   - AUTO_INCREMENT -> IDENTITY

3. MySQL -> SQLite:
   - ROUND() -> ROUND()
   - LIMIT -> LIMIT
   - AUTO_INCREMENT -> INTEGER PRIMARY KEY

4. Tablo yapısı değişiklikleri:
   - events -> training_events
   - teacher_id -> instructor_id
   - lesson_id -> course_id
   - capacity -> max_students
   - enrolled_count -> current_students
*/
?>

-- ===== KONTENJAN SİSTEMİ VERİTABANI YAPISI =====
-- Bu dosya, eğitim planı sayfasındaki kontenjan sistemini desteklemek için gerekli tabloları tanımlar
-- Başka bir veritabanına aktarırken, tablo adlarını ve sütun adlarını kendi yapınıza göre değiştirin

-- ===== EVENTS TABLOSU (Eğitim Etkinlikleri) =====
-- Bu tablo, her eğitim etkinliği için öğretmen, ders ve kontenjan bilgilerini tutar
CREATE TABLE IF NOT EXISTS `events` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Benzersiz etkinlik ID\'si',
    `teacher_id` int(11) NOT NULL COMMENT 'Öğretmen ID\'si (teachers tablosuyla ilişkili)',
    `teacher_name` varchar(255) NOT NULL COMMENT 'Öğretmen adı (görüntüleme için)',
    `lesson_id` int(11) NOT NULL COMMENT 'Ders ID\'si (lessons tablosuyla ilişkili)',
    `lesson_name` varchar(255) NOT NULL COMMENT 'Ders adı (görüntüleme için)',
    `start_date` date NOT NULL COMMENT 'Eğitim başlangıç tarihi',
    `end_date` date NOT NULL COMMENT 'Eğitim bitiş tarihi',
    `capacity` int(11) NOT NULL DEFAULT 30 COMMENT 'Maksimum öğrenci kapasitesi (varsayılan: 30)',
    `enrolled_count` int(11) NOT NULL DEFAULT 0 COMMENT 'Şu anda kayıtlı öğrenci sayısı',
    `status` enum('active','inactive','cancelled') NOT NULL DEFAULT 'active' COMMENT 'Etkinlik durumu',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Kayıt oluşturma tarihi',
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Son güncelleme tarihi',
    PRIMARY KEY (`id`),
    KEY `idx_teacher_lesson` (`teacher_id`, `lesson_id`),
    KEY `idx_lesson_status` (`lesson_id`, `status`),
    KEY `idx_capacity` (`capacity`, `enrolled_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eğitim etkinlikleri ve kontenjan bilgileri';

-- ===== ÖRNEK VERİLER =====
-- Bu veriler test amaçlıdır, kendi verilerinizle değiştirin
INSERT INTO `events` (`teacher_id`, `teacher_name`, `lesson_id`, `lesson_name`, `start_date`, `end_date`, `capacity`, `enrolled_count`, `status`) VALUES
(1, 'Ahmet Yılmaz', 1, 'Matematik', '2024-01-15', '2024-01-20', 25, 18, 'active'),
(2, 'Fatma Demir', 1, 'Matematik', '2024-01-15', '2024-01-20', 30, 30, 'active'),
(3, 'Mehmet Kaya', 2, 'Fizik', '2024-01-16', '2024-01-21', 20, 15, 'active'),
(4, 'Ayşe Özkan', 2, 'Fizik', '2024-01-16', '2024-01-21', 25, 22, 'active'),
(5, 'Ali Veli', 3, 'Kimya', '2024-01-17', '2024-01-22', 30, 0, 'active');

-- ===== EVENT_PARTICIPANTS TABLOSU (Katılımcılar) =====
-- Bu tablo, her etkinliğe katılan öğrencileri takip eder
CREATE TABLE IF NOT EXISTS `event_participants` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Benzersiz katılımcı ID\'si',
    `event_id` int(11) NOT NULL COMMENT 'Etkinlik ID\'si (events tablosuyla ilişkili)',
    `person_name` varchar(255) NOT NULL COMMENT 'Katılımcı adı',
    `enrollment_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Kayıt tarihi',
    `status` enum('enrolled','completed','dropped') NOT NULL DEFAULT 'enrolled' COMMENT 'Katılım durumu',
    PRIMARY KEY (`id`),
    KEY `idx_event_person` (`event_id`, `person_name`),
    CONSTRAINT `fk_event_participants_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Etkinlik katılımcıları';

-- ===== KONTENJAN HESAPLAMA GÖRÜNÜMÜ =====
-- Bu görünüm, her öğretmen için kontenjan durumunu hesaplar ve kolay erişim sağlar
-- Başka veritabanında view oluşturulamıyorsa, bu sorguyu doğrudan kullanabilirsiniz
CREATE OR REPLACE VIEW `teacher_capacity_status` AS
SELECT
    e.teacher_id,                    -- Öğretmen ID'si
    e.teacher_name,                  -- Öğretmen adı
    e.lesson_id,                     -- Ders ID'si
    e.lesson_name,                   -- Ders adı
    e.capacity,                      -- Toplam kapasite
    e.enrolled_count,                -- Kayıtlı öğrenci sayısı
    (e.capacity - e.enrolled_count) as available_slots,  -- Boş kontenjan sayısı
    CASE
        WHEN (e.capacity - e.enrolled_count) > 0 THEN 'available'      -- Kontenjan var
        WHEN (e.capacity - e.enrolled_count) = 0 THEN 'full'           -- Dolu
        ELSE 'overbooked'                                               -- Aşırı kayıt
    END as capacity_status,           -- Kontenjan durumu (available/full/overbooked)
    ROUND((e.enrolled_count / e.capacity) * 100, 1) as occupancy_percentage  -- Doluluk yüzdesi
FROM events e 
WHERE e.status = 'active'            -- Sadece aktif etkinlikleri göster
ORDER BY e.lesson_id, e.teacher_name;

-- ===== KONTENJAN SİSTEMİ İÇİN GEREKLİ İNDEKSLER =====
-- Performans için ek indeksler (isteğe bağlı)
CREATE INDEX IF NOT EXISTS `idx_events_capacity_status` ON `events` (`capacity`, `enrolled_count`, `status`);
CREATE INDEX IF NOT EXISTS `idx_events_lesson_teacher` ON `events` (`lesson_id`, `teacher_id`, `status`);

-- ===== VERİTABANI UYARILARI =====
-- 1. Tablo adlarını kendi yapınıza göre değiştirin (örn: events -> training_events)
-- 2. Sütun adlarını kendi yapınıza göre değiştirin (örn: teacher_id -> instructor_id)
-- 3. Veri tiplerini kendi veritabanı motorunuza göre ayarlayın
-- 4. Karakter setini kendi dil desteğinize göre ayarlayın
-- 5. Foreign key kısıtlamalarını kendi tablo yapınıza göre güncelleyin
-- 6. View oluşturulamıyorsa, teacher_capacity_status sorgusunu doğrudan kullanın

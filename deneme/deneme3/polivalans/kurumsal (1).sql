-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 14 Eyl 2025, 08:48:52
-- Sunucu sürümü: 10.4.32-MariaDB
-- PHP Sürümü: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `kurumsal`
--

DELIMITER $$
--
-- Yordamlar
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetOrganizationSkills` (IN `org_id` INT)   BEGIN
    SELECT 
        os.id,
        os.skill_name,
        os.skill_description,
        COUNT(ps.id) AS planned_count,
        COUNT(e.id) AS events_count
    FROM organization_skills os
    LEFT JOIN planned_skills ps ON os.id = ps.skill_id
    LEFT JOIN events e ON os.id = e.lesson_id
    WHERE os.organization_id = org_id
    GROUP BY os.id, os.skill_name, os.skill_description
    ORDER BY os.skill_name;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetPersonDetails` (IN `person_name` VARCHAR(255))   BEGIN
    SELECT 
        p.id,
        p.name,
        p.company_name,
        p.title,
        p.registration_no,
        COUNT(ps.id) AS planned_skills_count,
        GROUP_CONCAT(DISTINCT o.name ORDER BY o.name SEPARATOR ', ') AS organizations
    FROM persons p
    LEFT JOIN planned_skills ps ON p.id = ps.person_id
    LEFT JOIN organizations o ON ps.organization_id = o.id
    WHERE p.name = person_name
    GROUP BY p.id, p.name, p.company_name, p.title, p.registration_no;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `event_name` varchar(255) NOT NULL,
  `event_date` date NOT NULL,
  `end_date` date NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `lesson_id` int(11) DEFAULT NULL,
  `course_title` varchar(255) DEFAULT NULL,
  `capacity` int(11) NOT NULL DEFAULT 0,
  `enrolled_count` int(11) NOT NULL DEFAULT 0,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive','cancelled','completed') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `events`
--

INSERT INTO `events` (`id`, `event_name`, `event_date`, `end_date`, `teacher_id`, `lesson_id`, `course_title`, `capacity`, `enrolled_count`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'İnsan Kaynakları', '2024-02-15', '2024-02-16', 1, 1, 'İşe Alım Süreçleri', 20, 0, 'İşe alım süreçlerinin etkili yönetimi', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 'İnsan Kaynakları', '2024-02-20', '2024-02-21', 1, 2, 'Performans Değerlendirme', 15, 0, 'Performans değerlendirme teknikleri', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 'Bilgi İşlem', '2024-02-25', '2024-02-26', 2, 3, 'Web Geliştirme', 25, 0, 'Modern web geliştirme teknikleri', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 'Bilgi İşlem', '2024-03-01', '2024-03-02', 2, 4, 'Veritabanı Yönetimi', 20, 0, 'MySQL veritabanı yönetimi', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 'Muhasebe', '2024-03-05', '2024-03-06', 3, 5, 'Mali Tablolar', 18, 0, 'Mali tablo hazırlama teknikleri', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08');

--
-- Tetikleyiciler `events`
--
DELIMITER $$
CREATE TRIGGER `tr_update_enrolled_count` BEFORE UPDATE ON `events` FOR EACH ROW BEGIN
    -- This trigger can be extended to automatically update enrolled_count
    -- based on related tables like enrollments or registrations
    IF NEW.capacity < 0 THEN
        SET NEW.capacity = 0;
    END IF;
    
    IF NEW.enrolled_count < 0 THEN
        SET NEW.enrolled_count = 0;
    END IF;
    
    IF NEW.enrolled_count > NEW.capacity THEN
        SET NEW.enrolled_count = NEW.capacity;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `organizations`
--

CREATE TABLE `organizations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `column_position` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `organizations`
--

INSERT INTO `organizations` (`id`, `name`, `column_position`, `created_at`, `updated_at`) VALUES
(1, 'İnsan Kaynakları', 4, '2025-09-13 21:45:08', '2025-09-14 06:47:36'),
(2, 'Bilgi İşlem', 5, '2025-09-13 21:45:08', '2025-09-14 06:47:36'),
(3, 'Muhasebe', 6, '2025-09-13 21:45:08', '2025-09-14 06:47:36'),
(4, 'Satış', 7, '2025-09-13 21:45:08', '2025-09-14 06:47:36'),
(5, 'Pazarlama', 8, '2025-09-13 21:45:08', '2025-09-14 06:47:36');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `organization_images`
--

CREATE TABLE `organization_images` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `row_name` varchar(255) DEFAULT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `organization_skills`
--

CREATE TABLE `organization_skills` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `skill_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `organization_skills`
--

INSERT INTO `organization_skills` (`id`, `organization_id`, `skill_name`, `skill_description`, `created_at`, `updated_at`) VALUES
(1, 1, 'İşe Alım Süreçleri', 'İşe alım süreçlerinin yönetimi ve değerlendirme teknikleri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 1, 'Performans Değerlendirme', 'Çalışan performans değerlendirme sistemleri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 2, 'Web Geliştirme', 'HTML, CSS, JavaScript ve PHP ile web uygulaması geliştirme', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 2, 'Veritabanı Yönetimi', 'MySQL veritabanı tasarımı ve yönetimi', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 3, 'Mali Tablolar', 'Bilanço, gelir tablosu ve nakit akış tablosu hazırlama', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(6, 3, 'Vergi Mevzuatı', 'Güncel vergi mevzuatı ve uygulamaları', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(7, 4, 'Müşteri İlişkileri', 'Müşteri memnuniyeti ve ilişki yönetimi', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(8, 4, 'Satış Teknikleri', 'Etkili satış stratejileri ve teknikleri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(9, 5, 'Dijital Pazarlama', 'Sosyal medya ve online pazarlama stratejileri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(10, 5, 'Marka Yönetimi', 'Marka kimliği ve pozisyonlama', '2025-09-13 21:45:08', '2025-09-13 21:45:08');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `persons`
--

CREATE TABLE `persons` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `registration_no` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `persons`
--

INSERT INTO `persons` (`id`, `name`, `company_name`, `title`, `registration_no`, `created_at`, `updated_at`) VALUES
(1, 'Ahmet Yılmaz', 'ABC Şirketi', 'Yazılım Geliştirici', 'EMP001', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 'Ayşe Demir', 'XYZ Ltd.', 'İnsan Kaynakları Uzmanı', 'EMP002', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 'Mehmet Kaya', 'DEF A.Ş.', 'Muhasebeci', 'EMP003', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 'Fatma Öz', 'GHI Şirketi', 'Satış Temsilcisi', 'EMP004', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 'Ali Veli', 'JKL Ltd.', 'Pazarlama Uzmanı', 'EMP005', '2025-09-13 21:45:08', '2025-09-13 21:45:08');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `person_organization_images`
--

CREATE TABLE `person_organization_images` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `image_name` varchar(255) NOT NULL DEFAULT 'pie (2).png',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `planlandi`
--

CREATE TABLE `planlandi` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `event_id` int(11) DEFAULT NULL,
  `target_level` int(11) DEFAULT 3,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('planned','in_progress','completed','cancelled') DEFAULT 'planned',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `planned_skills`
--

CREATE TABLE `planned_skills` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `registration_no` varchar(100) DEFAULT NULL,
  `target_level` int(11) DEFAULT 3,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('planned','in_progress','completed','cancelled') DEFAULT 'planned',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `planned_skills`
--

INSERT INTO `planned_skills` (`id`, `person_id`, `organization_id`, `skill_id`, `company_name`, `title`, `registration_no`, `target_level`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 3, 'ABC Şirketi', 'Yazılım Geliştirici', 'EMP001', 4, '2024-02-25', '2024-02-26', 'planned', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 2, 1, 1, 'XYZ Ltd.', 'İnsan Kaynakları Uzmanı', 'EMP002', 3, '2024-02-15', '2024-02-16', 'planned', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 3, 3, 5, 'DEF A.Ş.', 'Muhasebeci', 'EMP003', 4, '2024-03-05', '2024-03-06', 'planned', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 4, 4, 7, 'GHI Şirketi', 'Satış Temsilcisi', 'EMP004', 3, '2024-03-10', '2024-03-11', 'planned', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 5, 5, 9, 'JKL Ltd.', 'Pazarlama Uzmanı', 'EMP005', 4, '2024-03-15', '2024-03-16', 'planned', '2025-09-13 21:45:08', '2025-09-13 21:45:08');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `specialization` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `teachers`
--

INSERT INTO `teachers` (`id`, `first_name`, `last_name`, `email`, `phone`, `specialization`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Zeynep', 'Akın', 'zeynep.akin@example.com', NULL, 'İnsan Kaynakları ve Organizasyonel Gelişim', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 'Prof. Dr. Mustafa', 'Özkan', 'mustafa.ozkan@example.com', NULL, 'Bilgisayar Mühendisliği ve Yazılım Geliştirme', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 'Doç. Dr. Elif', 'Yıldız', 'elif.yildiz@example.com', NULL, 'Maliye ve Muhasebe', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 'Uzm. Ahmet', 'Çelik', 'ahmet.celik@example.com', NULL, 'Satış ve Pazarlama', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 'Dr. Fatma', 'Şahin', 'fatma.sahin@example.com', NULL, 'Dijital Pazarlama ve Marka Yönetimi', '2025-09-13 21:45:08', '2025-09-13 21:45:08');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `tep_teachers`
--

CREATE TABLE `tep_teachers` (
  `id` int(11) NOT NULL,
  `person_name` varchar(255) NOT NULL,
  `organization_name` varchar(255) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `tep_teachers`
--

INSERT INTO `tep_teachers` (`id`, `person_name`, `organization_name`, `skill_name`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Zeynep Akın', 'İnsan Kaynakları', 'İşe Alım Süreçleri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 'Dr. Zeynep Akın', 'İnsan Kaynakları', 'Performans Değerlendirme', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 'Prof. Dr. Mustafa Özkan', 'Bilgi İşlem', 'Web Geliştirme', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 'Prof. Dr. Mustafa Özkan', 'Bilgi İşlem', 'Veritabanı Yönetimi', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 'Doç. Dr. Elif Yıldız', 'Muhasebe', 'Mali Tablolar', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(6, 'Doç. Dr. Elif Yıldız', 'Muhasebe', 'Vergi Mevzuatı', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(7, 'Uzm. Ahmet Çelik', 'Satış', 'Müşteri İlişkileri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(8, 'Uzm. Ahmet Çelik', 'Satış', 'Satış Teknikleri', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(9, 'Dr. Fatma Şahin', 'Pazarlama', 'Dijital Pazarlama', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(10, 'Dr. Fatma Şahin', 'Pazarlama', 'Marka Yönetimi', '2025-09-13 21:45:08', '2025-09-13 21:45:08');

-- --------------------------------------------------------

--
-- Görünüm yapısı durumu `v_events_with_teachers`
-- (Asıl görünüm için aşağıya bakın)
--
CREATE TABLE `v_events_with_teachers` (
`id` int(11)
,`event_name` varchar(255)
,`event_date` date
,`end_date` date
,`course_title` varchar(255)
,`capacity` int(11)
,`enrolled_count` int(11)
,`available_slots` bigint(12)
,`description` text
,`status` enum('active','inactive','cancelled','completed')
,`teacher_name` varchar(201)
,`teacher_email` varchar(255)
,`skill_name` varchar(255)
,`skill_description` text
);

-- --------------------------------------------------------

--
-- Görünüm yapısı durumu `v_organization_skills_summary`
-- (Asıl görünüm için aşağıya bakın)
--
CREATE TABLE `v_organization_skills_summary` (
`organization_name` varchar(255)
,`total_skills` bigint(21)
,`skills_list` mediumtext
);

-- --------------------------------------------------------

--
-- Görünüm yapısı durumu `v_planned_skills_details`
-- (Asıl görünüm için aşağıya bakın)
--
CREATE TABLE `v_planned_skills_details` (
`id` int(11)
,`person_id` int(11)
,`organization_id` int(11)
,`skill_id` int(11)
,`person_name` varchar(255)
,`company_name` varchar(255)
,`title` varchar(255)
,`registration_no` varchar(100)
,`organization_name` varchar(255)
,`skill_name` varchar(255)
,`skill_description` text
,`target_level` int(11)
,`start_date` date
,`end_date` date
,`status` enum('planned','in_progress','completed','cancelled')
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Görünüm yapısı `v_events_with_teachers`
--
DROP TABLE IF EXISTS `v_events_with_teachers`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_events_with_teachers`  AS SELECT `e`.`id` AS `id`, `e`.`event_name` AS `event_name`, `e`.`event_date` AS `event_date`, `e`.`end_date` AS `end_date`, `e`.`course_title` AS `course_title`, `e`.`capacity` AS `capacity`, `e`.`enrolled_count` AS `enrolled_count`, `e`.`capacity`- `e`.`enrolled_count` AS `available_slots`, `e`.`description` AS `description`, `e`.`status` AS `status`, concat(`t`.`first_name`,' ',`t`.`last_name`) AS `teacher_name`, `t`.`email` AS `teacher_email`, `os`.`skill_name` AS `skill_name`, `os`.`skill_description` AS `skill_description` FROM ((`events` `e` left join `teachers` `t` on(`e`.`teacher_id` = `t`.`id`)) left join `organization_skills` `os` on(`e`.`lesson_id` = `os`.`id`)) ;

-- --------------------------------------------------------

--
-- Görünüm yapısı `v_organization_skills_summary`
--
DROP TABLE IF EXISTS `v_organization_skills_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_organization_skills_summary`  AS SELECT `o`.`name` AS `organization_name`, count(`os`.`id`) AS `total_skills`, group_concat(`os`.`skill_name` order by `os`.`skill_name` ASC separator ', ') AS `skills_list` FROM (`organizations` `o` left join `organization_skills` `os` on(`o`.`id` = `os`.`organization_id`)) GROUP BY `o`.`id`, `o`.`name` ;

-- --------------------------------------------------------

--
-- Görünüm yapısı `v_planned_skills_details`
--
DROP TABLE IF EXISTS `v_planned_skills_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_planned_skills_details`  AS SELECT `ps`.`id` AS `id`, `ps`.`person_id` AS `person_id`, `ps`.`organization_id` AS `organization_id`, `ps`.`skill_id` AS `skill_id`, `p`.`name` AS `person_name`, `p`.`company_name` AS `company_name`, `p`.`title` AS `title`, `p`.`registration_no` AS `registration_no`, `o`.`name` AS `organization_name`, `os`.`skill_name` AS `skill_name`, `os`.`skill_description` AS `skill_description`, `ps`.`target_level` AS `target_level`, `ps`.`start_date` AS `start_date`, `ps`.`end_date` AS `end_date`, `ps`.`status` AS `status`, `ps`.`created_at` AS `created_at`, `ps`.`updated_at` AS `updated_at` FROM (((`planned_skills` `ps` join `persons` `p` on(`ps`.`person_id` = `p`.`id`)) join `organizations` `o` on(`ps`.`organization_id` = `o`.`id`)) join `organization_skills` `os` on(`ps`.`skill_id` = `os`.`id`)) ;

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_date` (`event_date`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_lesson_id` (`lesson_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_events_dates` (`event_date`,`end_date`);

--
-- Tablo için indeksler `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_column_position` (`column_position`),
  ADD KEY `idx_organizations_name` (`name`);

--
-- Tablo için indeksler `organization_images`
--
ALTER TABLE `organization_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_organization_id` (`organization_id`);

--
-- Tablo için indeksler `organization_skills`
--
ALTER TABLE `organization_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_org_skill` (`organization_id`,`skill_name`),
  ADD KEY `idx_organization_id` (`organization_id`),
  ADD KEY `idx_skill_name` (`skill_name`);

--
-- Tablo için indeksler `persons`
--
ALTER TABLE `persons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_registration_no` (`registration_no`),
  ADD KEY `idx_persons_company` (`company_name`);

--
-- Tablo için indeksler `person_organization_images`
--
ALTER TABLE `person_organization_images`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_person_org_image` (`person_id`,`organization_id`),
  ADD KEY `idx_person_id` (`person_id`),
  ADD KEY `idx_organization_id` (`organization_id`);

--
-- Tablo için indeksler `planlandi`
--
ALTER TABLE `planlandi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_person_id` (`person_id`),
  ADD KEY `idx_organization_id` (`organization_id`),
  ADD KEY `idx_skill_id` (`skill_id`),
  ADD KEY `idx_teacher_id` (`teacher_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_status` (`status`);

--
-- Tablo için indeksler `planned_skills`
--
ALTER TABLE `planned_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_person_org_skill` (`person_id`,`organization_id`,`skill_id`),
  ADD KEY `idx_person_id` (`person_id`),
  ADD KEY `idx_organization_id` (`organization_id`),
  ADD KEY `idx_skill_id` (`skill_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_planned_skills_dates` (`start_date`,`end_date`);

--
-- Tablo için indeksler `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`first_name`,`last_name`);

--
-- Tablo için indeksler `tep_teachers`
--
ALTER TABLE `tep_teachers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_person_name` (`person_name`),
  ADD KEY `idx_organization_name` (`organization_name`),
  ADD KEY `idx_skill_name` (`skill_name`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Tablo için AUTO_INCREMENT değeri `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Tablo için AUTO_INCREMENT değeri `organization_images`
--
ALTER TABLE `organization_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `organization_skills`
--
ALTER TABLE `organization_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Tablo için AUTO_INCREMENT değeri `persons`
--
ALTER TABLE `persons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Tablo için AUTO_INCREMENT değeri `person_organization_images`
--
ALTER TABLE `person_organization_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `planlandi`
--
ALTER TABLE `planlandi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `planned_skills`
--
ALTER TABLE `planned_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Tablo için AUTO_INCREMENT değeri `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Tablo için AUTO_INCREMENT değeri `tep_teachers`
--
ALTER TABLE `tep_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `organization_skills` (`id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `organization_images`
--
ALTER TABLE `organization_images`
  ADD CONSTRAINT `organization_images_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `organization_skills`
--
ALTER TABLE `organization_skills`
  ADD CONSTRAINT `organization_skills_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `person_organization_images`
--
ALTER TABLE `person_organization_images`
  ADD CONSTRAINT `person_organization_images_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `person_organization_images_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Tablo kısıtlamaları `planlandi`
--
ALTER TABLE `planlandi`
  ADD CONSTRAINT `planlandi_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `planlandi_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `planlandi_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `organization_skills` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `planlandi_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `planlandi_ibfk_5` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL;

--
-- Tablo kısıtlamaları `planned_skills`
--
ALTER TABLE `planned_skills`
  ADD CONSTRAINT `planned_skills_ibfk_1` FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `planned_skills_ibfk_2` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `planned_skills_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `organization_skills` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

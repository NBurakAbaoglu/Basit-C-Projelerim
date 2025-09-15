-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 16 Eyl 2025, 00:10:59
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
(1, 'İnsan Kaynakları', '2024-02-15', '2024-02-16', NULL, NULL, 'İşe Alım Süreçleri', 20, 0, 'İşe alım süreçlerinin etkili yönetimi', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(2, 'İnsan Kaynakları', '2024-02-20', '2024-02-21', NULL, NULL, 'Performans Değerlendirme', 15, 0, 'Performans değerlendirme teknikleri', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(3, 'Bilgi İşlem', '2024-02-25', '2024-02-26', NULL, NULL, 'Web Geliştirme', 25, 0, 'Modern web geliştirme teknikleri', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(4, 'Bilgi İşlem', '2024-03-01', '2024-03-02', NULL, NULL, 'Veritabanı Yönetimi', 20, 0, 'MySQL veritabanı yönetimi', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(5, 'Muhasebe', '2024-03-05', '2024-03-06', NULL, NULL, 'Mali Tablolar', 18, 0, 'Mali tablo hazırlama teknikleri', 'active', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(7, '7', '2025-09-20', '2025-09-28', 6, 14, 'Yalın Üretim', 10, 0, '', 'active', '2025-09-14 09:11:48', '2025-09-14 09:11:48'),
(9, '7', '2025-09-15', '2025-09-21', 11, 14, 'Yalın Üretim', 10, 0, '', 'active', '2025-09-14 09:42:57', '2025-09-14 09:42:57'),
(10, '6', '2025-09-20', '2025-09-28', 12, NULL, 'KAZİEN', 10, 0, '', 'active', '2025-09-14 09:43:43', '2025-09-14 09:43:43'),
(11, '6', '2025-09-20', '2025-09-28', 12, NULL, 'KAZİEN', 10, 0, '', 'active', '2025-09-14 12:37:24', '2025-09-14 12:37:24'),
(12, '7', '2025-09-20', '2025-09-28', 15, NULL, 'yalınlaşma', 10, 0, '', 'active', '2025-09-14 12:37:42', '2025-09-14 12:37:42'),
(13, '7', '2025-09-20', '2025-09-21', 15, NULL, 'yalınlaşma', 10, 0, '', 'active', '2025-09-14 18:50:43', '2025-09-14 18:50:43'),
(14, '7', '2025-09-21', '2025-09-27', 15, NULL, 'yalınlaşma', 10, 0, '', 'active', '2025-09-14 18:51:14', '2025-09-14 18:51:14'),
(15, '7', '2025-09-20', '2025-09-28', 13, NULL, 'yalınlaşma', 10, 0, '', 'active', '2025-09-14 18:57:44', '2025-09-14 18:57:44'),
(16, '7', '2025-09-20', '2025-09-28', 11, 13, 'ders1', 5, 0, '', 'active', '2025-09-14 19:00:13', '2025-09-14 19:00:13'),
(17, '8', '2025-09-19', '2025-09-27', 16, 5, 'seri üretim', 4, 0, '', 'active', '2025-09-15 21:44:50', '2025-09-15 21:44:50');

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
-- Tablo için tablo yapısı `multi_skills`
--

CREATE TABLE `multi_skills` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `source_organization_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(6, 'KALİTE KONTROL', 4, '2025-09-14 07:23:25', '2025-09-14 09:23:15'),
(7, 'Yalın', 6, '2025-09-14 09:06:40', '2025-09-14 20:29:12'),
(8, 'üretim', 5, '2025-09-14 20:26:38', '2025-09-14 20:29:12'),
(10, 'denetleme', 7, '2025-09-15 21:04:18', '2025-09-15 21:04:18'),
(15, 'deneme1', 8, '2025-09-15 21:12:14', '2025-09-15 21:12:14'),
(16, 'deneme2', 9, '2025-09-15 21:12:40', '2025-09-15 21:12:40');

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

--
-- Tablo döküm verisi `organization_images`
--

INSERT INTO `organization_images` (`id`, `organization_id`, `row_name`, `image_name`, `created_at`, `updated_at`) VALUES
(12, 6, 'Ahmet Yılmaz', 'pie (2).png', '2025-09-14 11:56:28', '2025-09-15 22:05:37'),
(13, 7, 'Ahmet Yılmaz', 'pie (3).png', '2025-09-14 11:56:28', '2025-09-15 22:05:37'),
(14, 7, 'Ayşe Demir', 'pie (2).png', '2025-09-14 11:56:28', '2025-09-15 22:05:37'),
(15, 7, 'Mehmet Kaya', 'pie (3).png', '2025-09-14 11:56:28', '2025-09-15 22:05:37'),
(16, 6, '1', 'pie (3).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(17, 6, '3', 'pie (3).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(18, 6, '4', 'pie (3).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(19, 7, '3', 'pie (2).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(20, 7, '2', 'pie (2).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(21, 6, '2', 'pie (3).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(22, 6, '5', 'pie (3).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(23, 7, '1', 'pie (2).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(24, 7, '4', 'pie (2).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(25, 7, '5', 'pie (2).png', '2025-09-14 11:56:43', '2025-09-14 11:56:43'),
(26, 6, 'Ayşe Demir', 'pie (2).png', '2025-09-14 11:58:33', '2025-09-15 22:05:37'),
(27, 6, 'Mehmet Kaya', 'pie (2).png', '2025-09-14 11:58:33', '2025-09-15 22:05:37'),
(28, 6, 'Fatma Öz', 'pie (2).png', '2025-09-14 11:58:33', '2025-09-15 22:05:37'),
(29, 6, 'Ali Veli', 'pie (2).png', '2025-09-14 11:58:33', '2025-09-15 22:05:37'),
(30, 7, 'Fatma Öz', 'pie (2).png', '2025-09-14 11:58:33', '2025-09-15 22:05:37'),
(31, 7, 'Ali Veli', 'pie (2).png', '2025-09-14 11:58:33', '2025-09-15 22:05:37'),
(32, 6, 'zeynep duran', 'pie (2).png', '2025-09-14 19:15:28', '2025-09-15 22:05:37'),
(33, 7, 'zeynep duran', 'pie (2).png', '2025-09-14 19:15:28', '2025-09-15 22:05:37'),
(34, 6, 'arif ışık', 'pie (2).png', '2025-09-14 20:01:14', '2025-09-15 22:05:37'),
(35, 7, 'arif ışık', 'pie (2).png', '2025-09-14 20:01:14', '2025-09-15 22:05:37'),
(36, 6, 'mehmetyıldız', 'pie (2).png', '2025-09-14 20:22:07', '2025-09-15 22:05:37'),
(37, 7, 'mehmetyıldız', 'pie (2).png', '2025-09-14 20:22:07', '2025-09-15 22:05:37'),
(38, 6, 'kerim durmaz', 'pie (2).png', '2025-09-14 20:22:32', '2025-09-15 22:05:37'),
(39, 7, 'kerim durmaz', 'pie (2).png', '2025-09-14 20:22:32', '2025-09-15 22:05:37'),
(40, 6, 'burak abaoğlu', 'pie (2).png', '2025-09-14 20:23:55', '2025-09-14 21:18:43'),
(41, 7, 'burak abaoğlu', 'pie (2).png', '2025-09-14 20:23:55', '2025-09-14 21:18:43'),
(42, 6, 'kerimcan soysever', 'pie (2).png', '2025-09-14 20:24:09', '2025-09-15 22:05:37'),
(43, 7, 'kerimcan soysever', 'pie (2).png', '2025-09-14 20:24:09', '2025-09-15 22:05:37'),
(44, 6, 'nazım hikmet', 'pie (2).png', '2025-09-14 20:26:28', '2025-09-15 22:05:37'),
(45, 7, 'nazım hikmet', 'pie (2).png', '2025-09-14 20:26:28', '2025-09-15 22:05:37'),
(46, 8, 'Mehmet Kaya', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(47, 8, 'Fatma Öz', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(48, 8, 'Ali Veli', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(49, 8, 'zeynep duran', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(50, 8, 'arif ışık', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(51, 8, 'mehmetyıldız', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(52, 8, 'kerim durmaz', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(53, 8, 'burak abaoğlu', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-14 21:18:43'),
(54, 8, 'kerimcan soysever', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(55, 8, 'nazım hikmet', 'pie (2).png', '2025-09-14 20:26:38', '2025-09-15 22:05:37'),
(56, 8, 'Ahmet Yılmaz', 'pie (2).png', '2025-09-14 20:29:12', '2025-09-15 22:05:37'),
(57, 6, '', 'pie (2).png', '2025-09-14 20:29:12', '2025-09-15 22:05:37'),
(58, 8, 'Ayşe Demir', 'pie (2).png', '2025-09-14 20:29:12', '2025-09-15 22:05:37'),
(59, 6, 'zeynep duran\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:27', '2025-09-14 20:48:50'),
(60, 6, 'Ahmet Yılmaz\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:27', '2025-09-14 20:48:50'),
(61, 6, 'arif ışık\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(62, 6, 'Mehmet Kaya\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(63, 6, 'Ayşe Demir\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(64, 6, 'Fatma Öz\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(65, 6, 'Ali Veli\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(66, 6, 'mehmetyıldız\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(67, 6, 'kerimcan soysever\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(68, 6, 'kerim durmaz\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(69, 6, 'burak abaoğlu\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(70, 6, 'nazım hikmet\n            \n                ×', 'pie (3).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(71, 8, 'Ayşe Demir\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(72, 8, 'Ahmet Yılmaz\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(73, 8, 'Mehmet Kaya\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(74, 8, 'Fatma Öz\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(75, 8, 'Ali Veli\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(76, 8, 'zeynep duran\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(77, 8, 'arif ışık\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(78, 8, 'mehmetyıldız\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(79, 8, 'kerim durmaz\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(80, 8, 'burak abaoğlu\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(81, 8, 'kerimcan soysever\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(82, 8, 'nazım hikmet\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(83, 7, 'Ahmet Yılmaz\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(84, 7, 'Fatma Öz\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(85, 7, 'Ali Veli\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(86, 7, 'Ayşe Demir\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(87, 7, 'mehmetyıldız\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(88, 7, 'arif ışık\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(89, 7, 'Mehmet Kaya\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(90, 7, 'nazım hikmet\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(91, 7, 'kerimcan soysever\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(92, 7, 'kerim durmaz\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(93, 7, 'burak abaoğlu\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(94, 7, 'zeynep duran\n            \n                ×', 'pie (2).png', '2025-09-14 20:42:28', '2025-09-14 20:48:50'),
(95, 6, 'kazım karabekir', 'pie (2).png', '2025-09-14 21:03:16', '2025-09-15 22:05:37'),
(96, 8, 'kazım karabekir', 'pie (2).png', '2025-09-14 21:03:16', '2025-09-15 22:05:37'),
(97, 7, 'kazım karabekir', 'pie (2).png', '2025-09-14 21:03:16', '2025-09-15 22:05:37'),
(98, 6, 'furkan abaoğlu', 'pie (2).png', '2025-09-14 21:18:06', '2025-09-15 22:05:37'),
(99, 8, 'furkan abaoğlu', 'pie (2).png', '2025-09-14 21:18:06', '2025-09-15 22:05:37'),
(100, 7, 'furkan abaoğlu', 'pie (2).png', '2025-09-14 21:18:06', '2025-09-15 22:05:37'),
(114, 8, '', 'pie (2).png', '2025-09-15 21:04:06', '2025-09-15 22:05:37'),
(115, 7, '', 'pie (2).png', '2025-09-15 21:04:12', '2025-09-15 22:05:37'),
(116, 10, 'Mehmet Kaya', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(117, 10, 'Ali Veli', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(118, 10, 'Fatma Öz', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(119, 10, 'zeynep duran', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(120, 10, 'mehmetyıldız', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(121, 10, 'kerim durmaz', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(122, 10, 'arif ışık', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(123, 10, 'furkan abaoğlu', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(124, 10, 'kerimcan soysever', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(125, 10, 'nazım hikmet', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(126, 10, 'kazım karabekir', 'pie (2).png', '2025-09-15 21:04:18', '2025-09-15 22:05:37'),
(127, 10, 'Ayşe Demir', 'pie (2).png', '2025-09-15 21:05:05', '2025-09-15 22:05:37'),
(128, 10, 'Ahmet Yılmaz', 'pie (2).png', '2025-09-15 21:05:05', '2025-09-15 22:05:37'),
(177, 10, '', 'pie (2).png', '2025-09-15 21:10:13', '2025-09-15 22:05:37'),
(180, 15, 'Fatma Öz', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(181, 15, 'Mehmet Kaya', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(182, 15, 'Ali Veli', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(183, 15, 'zeynep duran', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(184, 15, 'arif ışık', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(185, 15, 'mehmetyıldız', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(186, 15, 'kerim durmaz', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(187, 15, 'furkan abaoğlu', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(188, 15, 'kerimcan soysever', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(189, 15, 'nazım hikmet', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(190, 15, 'kazım karabekir', 'pie (2).png', '2025-09-15 21:12:14', '2025-09-15 22:05:37'),
(191, 16, 'Ayşe Demir', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(192, 16, 'Mehmet Kaya', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(193, 16, 'Ali Veli', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(194, 16, 'Fatma Öz', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(195, 16, 'arif ışık', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(196, 16, 'kerim durmaz', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(197, 16, 'zeynep duran', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(198, 16, 'mehmetyıldız', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(199, 16, 'furkan abaoğlu', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(200, 16, 'nazım hikmet', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(201, 16, 'kerimcan soysever', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(202, 16, 'kazım karabekir', 'pie (2).png', '2025-09-15 21:12:40', '2025-09-15 22:05:38'),
(203, 15, 'Ahmet Yılmaz', 'pie (2).png', '2025-09-15 21:13:21', '2025-09-15 22:05:37'),
(204, 15, 'Ayşe Demir', 'pie (2).png', '2025-09-15 21:13:21', '2025-09-15 22:05:37'),
(205, 16, 'Ahmet Yılmaz', 'pie (3).png', '2025-09-15 21:13:22', '2025-09-15 22:05:37');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `organization_skills`
--

CREATE TABLE `organization_skills` (
  `id` int(11) NOT NULL,
  `organization_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `organization_skills`
--

INSERT INTO `organization_skills` (`id`, `organization_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
(1, 6, 1, 'medium', '2025-09-15 20:56:05', '2025-09-15 20:56:05'),
(3, 7, 3, 'medium', '2025-09-15 20:56:05', '2025-09-15 20:56:05'),
(4, 7, 4, 'medium', '2025-09-15 20:56:05', '2025-09-15 20:56:05'),
(5, 8, 5, 'medium', '2025-09-15 20:56:05', '2025-09-15 20:56:05'),
(8, 10, 3, 'medium', '2025-09-15 21:05:01', '2025-09-15 21:05:01'),
(13, 15, 7, 'medium', '2025-09-15 21:12:35', '2025-09-15 21:12:35'),
(14, 16, 7, 'medium', '2025-09-15 21:12:46', '2025-09-15 21:12:46'),
(15, 7, 8, 'medium', '2025-09-15 21:18:37', '2025-09-15 21:18:37');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `organization_skills_backup`
--

CREATE TABLE `organization_skills_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `organization_id` int(11) NOT NULL,
  `skill_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `skill_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `organization_skills_backup`
--

INSERT INTO `organization_skills_backup` (`id`, `organization_id`, `skill_name`, `skill_description`, `created_at`, `updated_at`) VALUES
(11, 6, 'KAZİEN', 'KAZİEN', '2025-09-14 07:23:33', '2025-09-14 07:23:33'),
(12, 7, 'yalınlaşma', 'yalınlaşma', '2025-09-14 09:06:51', '2025-09-14 09:06:51'),
(13, 7, 'ders1', 'ders1', '2025-09-14 09:06:55', '2025-09-14 09:06:55'),
(14, 7, 'Yalın Üretim', 'Yalın üretim metodolojileri, süreç iyileştirme teknikleri ve israf azaltma yöntemleri', '2025-09-14 09:09:54', '2025-09-14 09:09:54'),
(15, 8, 'seri üretim', 'seri üretim', '2025-09-14 20:26:53', '2025-09-14 20:26:53');

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
(5, 'Ali Veli', 'JKL Ltd.', 'Pazarlama Uzmanı', 'EMP005', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(6, 'zeynep duran', NULL, NULL, NULL, '2025-09-14 19:15:22', '2025-09-14 19:15:22'),
(7, 'arif ışık', NULL, NULL, NULL, '2025-09-14 19:21:01', '2025-09-14 19:21:01'),
(8, 'mehmetyıldız', NULL, NULL, NULL, '2025-09-14 20:20:40', '2025-09-14 20:20:40'),
(9, 'kerim durmaz', NULL, NULL, NULL, '2025-09-14 20:22:19', '2025-09-14 20:22:19'),
(10, 'furkan abaoğlu', NULL, NULL, NULL, '2025-09-14 20:22:49', '2025-09-14 21:22:39'),
(11, 'kerimcan soysever', NULL, NULL, NULL, '2025-09-14 20:24:07', '2025-09-14 20:24:07'),
(12, 'nazım hikmet', NULL, NULL, NULL, '2025-09-14 20:26:27', '2025-09-14 20:26:27'),
(13, 'kazım karabekir', NULL, NULL, NULL, '2025-09-14 21:03:14', '2025-09-14 21:03:14');

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

--
-- Tablo döküm verisi `person_organization_images`
--

INSERT INTO `person_organization_images` (`id`, `person_id`, `organization_id`, `image_name`, `created_at`, `updated_at`) VALUES
(1, 10, 6, 'pie (2).png', '2025-09-14 20:22:49', '2025-09-14 20:22:49'),
(2, 10, 7, 'pie (2).png', '2025-09-14 20:22:49', '2025-09-14 20:22:49'),
(3, 11, 6, 'pie (2).png', '2025-09-14 20:24:07', '2025-09-14 20:24:07'),
(4, 11, 7, 'pie (2).png', '2025-09-14 20:24:07', '2025-09-14 20:24:07'),
(5, 12, 6, 'pie (2).png', '2025-09-14 20:26:27', '2025-09-14 20:26:27'),
(6, 12, 7, 'pie (2).png', '2025-09-14 20:26:27', '2025-09-14 20:26:27');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `success_status` enum('pending','completed') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `planlandi`
--

INSERT INTO `planlandi` (`id`, `person_id`, `organization_id`, `skill_id`, `teacher_id`, `event_id`, `target_level`, `start_date`, `end_date`, `status`, `priority`, `notes`, `created_by`, `created_at`, `updated_at`, `success_status`) VALUES
(4, 1, 7, 14, 6, 7, 1, '2025-09-14', '2025-09-14', '', 'low', '', '1', '2025-09-14 09:11:56', '2025-09-15 21:43:10', 'completed'),
(5, 2, 7, 14, 6, 7, 1, '2025-09-14', '2025-09-14', '', 'low', '', '1', '2025-09-14 09:25:20', '2025-09-14 09:25:20', 'completed'),
(16, 2, 7, 13, 11, 16, 1, '2025-09-14', '2025-09-14', '', 'low', '', '1', '2025-09-14 19:00:23', '2025-09-14 19:00:23', 'pending'),
(17, 1, 7, 13, 11, 16, 1, '2025-09-14', '2025-09-14', '', 'low', '', '1', '2025-09-14 19:00:28', '2025-09-15 21:43:10', 'completed'),
(18, 3, 7, 13, 11, 16, 1, '2025-09-14', '2025-09-14', '', 'low', '', '1', '2025-09-14 19:11:07', '2025-09-14 19:11:07', 'completed'),
(19, 3, 7, 14, 6, 7, 1, '2025-09-14', '2025-09-14', '', 'low', '', '1', '2025-09-14 19:11:08', '2025-09-14 19:11:08', 'completed'),
(21, 1, 16, 14, 11, 7, 1, '2025-09-15', '2025-09-15', '', 'low', '', '1', '2025-09-15 21:43:10', '2025-09-15 21:43:10', 'completed');

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
(11, 2, 7, 13, 'XYZ Ltd.', 'İnsan Kaynakları Uzmanı', 'EMP002', 3, NULL, NULL, 'planned', '2025-09-14 09:07:14', '2025-09-14 09:07:14'),
(12, 1, 7, 14, 'ABC Şirketi', 'Yazılım Geliştirici', 'EMP001', 3, NULL, NULL, 'planned', '2025-09-14 09:10:12', '2025-09-14 09:10:12'),
(13, 1, 7, 13, 'ABC Şirketi', 'Yazılım Geliştirici', 'EMP001', 3, NULL, NULL, 'planned', '2025-09-14 09:18:33', '2025-09-14 09:18:33'),
(21, 2, 7, 14, 'XYZ Ltd.', 'İnsan Kaynakları Uzmanı', 'EMP002', 3, NULL, NULL, 'planned', '2025-09-14 09:25:13', '2025-09-14 09:25:13'),
(26, 3, 7, 13, 'DEF A.Ş.', 'Muhasebeci', 'EMP003', 3, NULL, NULL, 'planned', '2025-09-14 19:10:56', '2025-09-14 19:10:56'),
(27, 3, 7, 14, 'DEF A.Ş.', 'Muhasebeci', 'EMP003', 3, NULL, NULL, 'planned', '2025-09-14 19:10:56', '2025-09-14 19:10:56'),
(32, 10, 8, 15, NULL, NULL, NULL, 3, NULL, NULL, 'planned', '2025-09-14 21:17:49', '2025-09-14 21:17:49'),
(38, 1, 16, 14, 'ABC Şirketi', 'Yazılım Geliştirici', 'EMP001', 3, NULL, NULL, 'planned', '2025-09-15 21:23:45', '2025-09-15 21:23:45'),
(40, 2, 15, 13, 'Test Company', 'Test Title', 'TEST001', 3, NULL, NULL, 'planned', '2025-09-15 21:34:58', '2025-09-15 21:34:58'),
(41, 2, 16, 14, 'Test Company', 'Test Title', 'TEST001', 3, NULL, NULL, 'planned', '2025-09-15 21:34:58', '2025-09-15 21:34:58'),
(42, 1, 8, 5, 'ABC Şirketi', 'Yazılım Geliştirici', 'EMP001', 3, NULL, NULL, 'planned', '2025-09-15 22:09:42', '2025-09-15 22:09:42');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `skill_description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `skills`
--

INSERT INTO `skills` (`id`, `skill_name`, `skill_description`, `category`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'KAZİEN', 'KAZİEN', 'Genel', 1, '2025-09-15 20:46:28', '2025-09-15 20:46:28'),
(2, 'yalınlaşma', 'yalınlaşma', 'Genel', 1, '2025-09-15 20:46:28', '2025-09-15 20:46:28'),
(3, 'ders1', 'ders1', 'Genel', 1, '2025-09-15 20:46:28', '2025-09-15 20:46:28'),
(4, 'Yalın Üretim', 'Yalın üretim metodolojileri, süreç iyileştirme teknikleri ve israf azaltma yöntemleri', 'Genel', 1, '2025-09-15 20:46:28', '2025-09-15 20:46:28'),
(5, 'seri üretim', 'seri üretim', 'Genel', 1, '2025-09-15 20:46:28', '2025-09-15 20:46:28'),
(6, 'kaizen', 'kaizen', 'Temel Beceri', 1, '2025-09-15 21:05:49', '2025-09-15 21:05:49'),
(7, 'DERS2', 'deneme', 'Temel Beceri', 1, '2025-09-15 21:12:35', '2025-09-15 21:12:35'),
(8, 'TEST BECERİ', 'Test açıklama', 'Temel Beceri', 1, '2025-09-15 21:18:37', '2025-09-15 21:18:37');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `specialization` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `teachers`
--

INSERT INTO `teachers` (`id`, `first_name`, `last_name`, `specialization`, `created_at`, `updated_at`) VALUES
(6, 'Dr. Mehmet', 'Kaya', 'Yalın Üretim ve Süreç İyileştirme', '2025-09-14 09:09:04', '2025-09-14 09:09:04'),
(11, 'Nazım Burak', 'Abaoğlu', 'yazılım', '2025-09-14 09:41:27', '2025-09-14 09:41:27'),
(12, 'fatih', 'terim', 'proje', '2025-09-14 09:43:30', '2025-09-14 09:43:30'),
(13, 'eda', 'hanım', 'proje yönetimi', '2025-09-14 12:30:49', '2025-09-14 12:30:49'),
(15, 'volkan', 'bey', 'yalın', '2025-09-14 12:31:22', '2025-09-14 12:31:22'),
(16, 'hikmet', 'kor', 'yazılım geliştirme', '2025-09-15 21:44:38', '2025-09-15 21:44:38');

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
(10, 'Dr. Fatma Şahin', 'Pazarlama', 'Marka Yönetimi', '2025-09-13 21:45:08', '2025-09-13 21:45:08'),
(11, 'Dr. Mehmet Kaya', 'Yalın', 'Yalın Üretim', '2025-09-14 09:09:54', '2025-09-14 09:09:54'),
(12, 'Nazım Burak Abaoğlu', 'Yalın', 'ders1', '2025-09-14 09:41:27', '2025-09-14 09:41:27'),
(13, 'Nazım Burak Abaoğlu', 'Yalın', 'Yalın Üretim', '2025-09-14 09:41:27', '2025-09-14 09:41:27'),
(14, 'fatih terim', 'KALİTE KONTROL', 'KAZİEN', '2025-09-14 09:43:30', '2025-09-14 09:43:30'),
(15, 'eda hanım', 'Yalın', 'Yalın Üretim', '2025-09-14 12:30:49', '2025-09-14 12:30:49'),
(16, 'eda hanım', 'Yalın', 'yalınlaşma', '2025-09-14 12:30:49', '2025-09-14 12:30:49'),
(17, 'eda hanım', 'Yalın', 'ders1', '2025-09-14 12:30:49', '2025-09-14 12:30:49'),
(19, 'volkan bey', 'Yalın', 'Yalın Üretim', '2025-09-14 12:31:22', '2025-09-14 12:31:22'),
(20, 'volkan bey', 'Yalın', 'yalınlaşma', '2025-09-14 12:31:22', '2025-09-14 12:31:22'),
(21, 'volkan bey', 'Yalın', 'ders1', '2025-09-14 12:31:22', '2025-09-14 12:31:22'),
(22, 'hikmet kor', 'üretim', 'seri üretim', '2025-09-15 21:44:38', '2025-09-15 21:44:38');

-- --------------------------------------------------------

--
-- Görünüm yapısı durumu `v_events_with_teachers`
-- (Asıl görünüm için aşağıya bakın)
--
CREATE TABLE `v_events_with_teachers` (
);

-- --------------------------------------------------------

--
-- Görünüm yapısı durumu `v_organization_skills_summary`
-- (Asıl görünüm için aşağıya bakın)
--
CREATE TABLE `v_organization_skills_summary` (
);

-- --------------------------------------------------------

--
-- Görünüm yapısı durumu `v_planned_skills_details`
-- (Asıl görünüm için aşağıya bakın)
--
CREATE TABLE `v_planned_skills_details` (
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
-- Tablo için indeksler `multi_skills`
--
ALTER TABLE `multi_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_person_org_skill` (`person_id`,`organization_id`,`skill_id`),
  ADD KEY `idx_person_id` (`person_id`),
  ADD KEY `idx_organization_id` (`organization_id`),
  ADD KEY `idx_skill_id` (`skill_id`);

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
  ADD UNIQUE KEY `unique_org_skill` (`organization_id`,`skill_id`),
  ADD KEY `idx_organization_id` (`organization_id`),
  ADD KEY `idx_skill_id` (`skill_id`),
  ADD KEY `idx_priority` (`priority`);

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
-- Tablo için indeksler `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_skill_name` (`skill_name`),
  ADD KEY `idx_skill_name` (`skill_name`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_active` (`is_active`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Tablo için AUTO_INCREMENT değeri `multi_skills`
--
ALTER TABLE `multi_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Tablo için AUTO_INCREMENT değeri `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Tablo için AUTO_INCREMENT değeri `organization_images`
--
ALTER TABLE `organization_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- Tablo için AUTO_INCREMENT değeri `organization_skills`
--
ALTER TABLE `organization_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Tablo için AUTO_INCREMENT değeri `persons`
--
ALTER TABLE `persons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Tablo için AUTO_INCREMENT değeri `person_organization_images`
--
ALTER TABLE `person_organization_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Tablo için AUTO_INCREMENT değeri `planlandi`
--
ALTER TABLE `planlandi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Tablo için AUTO_INCREMENT değeri `planned_skills`
--
ALTER TABLE `planned_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- Tablo için AUTO_INCREMENT değeri `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Tablo için AUTO_INCREMENT değeri `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Tablo için AUTO_INCREMENT değeri `tep_teachers`
--
ALTER TABLE `tep_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

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
  ADD CONSTRAINT `organization_skills_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organization_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `planlandi_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `organization_skills` (`id`) ON DELETE CASCADE,
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

-- ===============================================
-- POLİVALANS PROJESİ N:N İLİŞKİ MİGRASYON SCRIPT
-- ===============================================
-- Bu script, organization_skills tablosunu n:n ilişki yapısına dönüştürür
-- Bir organizasyonun birden fazla skill'i olabilir
-- Bir skill'in birden fazla organizasyonda bulunabilir

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Mevcut verileri yedekle
CREATE TABLE organization_skills_backup AS SELECT * FROM organization_skills;

-- 1. Yeni skills tablosu oluştur
CREATE TABLE `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(255) NOT NULL,
  `skill_description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_skill_name` (`skill_name`),
  KEY `idx_skill_name` (`skill_name`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Mevcut organization_skills verilerini skills tablosuna taşı
INSERT INTO `skills` (`skill_name`, `skill_description`, `category`)
SELECT DISTINCT 
    `skill_name`, 
    `skill_description`,
    CASE 
        WHEN `organization_id` = 1 THEN 'İnsan Kaynakları'
        WHEN `organization_id` = 2 THEN 'Bilgi İşlem'
        WHEN `organization_id` = 3 THEN 'Muhasebe'
        WHEN `organization_id` = 4 THEN 'Satış'
        WHEN `organization_id` = 5 THEN 'Pazarlama'
        ELSE 'Genel'
    END as category
FROM `organization_skills_backup`;

-- 3. Eski organization_skills tablosunu sil
DROP TABLE `organization_skills`;

-- 4. Yeni organization_skills junction table oluştur
CREATE TABLE `organization_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organization_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `proficiency_level` int(11) DEFAULT 1 COMMENT '1-5 arası yeterlilik seviyesi',
  `is_required` tinyint(1) DEFAULT 0 COMMENT 'Bu organizasyon için zorunlu mu',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_org_skill` (`organization_id`,`skill_id`),
  KEY `idx_organization_id` (`organization_id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_proficiency_level` (`proficiency_level`),
  KEY `idx_is_required` (`is_required`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `organization_skills_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `organization_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Yedek verilerden yeni junction table'a veri aktar
INSERT INTO `organization_skills` (`organization_id`, `skill_id`, `proficiency_level`, `is_required`, `priority`)
SELECT 
    osb.organization_id,
    s.id as skill_id,
    3 as proficiency_level, -- Varsayılan seviye
    1 as is_required, -- Varsayılan olarak zorunlu
    'medium' as priority
FROM `organization_skills_backup` osb
JOIN `skills` s ON s.skill_name = osb.skill_name;

-- 6. Events tablosundaki lesson_id referansını güncelle
-- Önce events tablosundaki foreign key kısıtlamasını kaldır
ALTER TABLE `events` DROP FOREIGN KEY `events_ibfk_2`;

-- Events tablosundaki lesson_id'yi skill_id olarak güncelle
UPDATE `events` e
JOIN `organization_skills_backup` osb ON e.lesson_id = osb.id
JOIN `skills` s ON s.skill_name = osb.skill_name
SET e.lesson_id = s.id;

-- Events tablosuna yeni foreign key ekle
ALTER TABLE `events` 
ADD CONSTRAINT `events_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `skills` (`id`) ON DELETE SET NULL;

-- 7. Planned_skills tablosundaki skill_id referansını güncelle
-- Önce foreign key kısıtlamasını kaldır
ALTER TABLE `planned_skills` DROP FOREIGN KEY `planned_skills_ibfk_3`;

-- Planned_skills tablosundaki skill_id'yi güncelle
UPDATE `planned_skills` ps
JOIN `organization_skills_backup` osb ON ps.skill_id = osb.id
JOIN `skills` s ON s.skill_name = osb.skill_name
SET ps.skill_id = s.id;

-- Yeni foreign key ekle
ALTER TABLE `planned_skills` 
ADD CONSTRAINT `planned_skills_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

-- 8. Planlandi tablosundaki skill_id referansını güncelle
-- Önce foreign key kısıtlamasını kaldır
ALTER TABLE `planlandi` DROP FOREIGN KEY `planlandi_ibfk_3`;

-- Planlandi tablosundaki skill_id'yi güncelle
UPDATE `planlandi` p
JOIN `organization_skills_backup` osb ON p.skill_id = osb.id
JOIN `skills` s ON s.skill_name = osb.skill_name
SET p.skill_id = s.id;

-- Yeni foreign key ekle
ALTER TABLE `planlandi` 
ADD CONSTRAINT `planlandi_ibfk_3` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;

-- 9. Yedek tabloyu sil
DROP TABLE `organization_skills_backup`;

-- 10. View'ları güncelle
DROP VIEW IF EXISTS `v_events_with_teachers`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_events_with_teachers` AS 
SELECT 
    `e`.`id` AS `id`, 
    `e`.`event_name` AS `event_name`, 
    `e`.`event_date` AS `event_date`, 
    `e`.`end_date` AS `end_date`, 
    `e`.`course_title` AS `course_title`, 
    `e`.`capacity` AS `capacity`, 
    `e`.`enrolled_count` AS `enrolled_count`, 
    `e`.`capacity`- `e`.`enrolled_count` AS `available_slots`, 
    `e`.`description` AS `description`, 
    `e`.`status` AS `status`, 
    concat(`t`.`first_name`,' ',`t`.`last_name`) AS `teacher_name`, 
    `t`.`email` AS `teacher_email`, 
    `s`.`skill_name` AS `skill_name`, 
    `s`.`skill_description` AS `skill_description` 
FROM ((`events` `e` 
    left join `teachers` `t` on(`e`.`teacher_id` = `t`.`id`)) 
    left join `skills` `s` on(`e`.`lesson_id` = `s`.`id`));

DROP VIEW IF EXISTS `v_organization_skills_summary`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_organization_skills_summary` AS 
SELECT 
    `o`.`name` AS `organization_name`, 
    count(`os`.`id`) AS `total_skills`, 
    group_concat(`s`.`skill_name` order by `s`.`skill_name` ASC separator ', ') AS `skills_list` 
FROM (`organizations` `o` 
    left join `organization_skills` `os` on(`o`.`id` = `os`.`organization_id`)
    left join `skills` `s` on(`os`.`skill_id` = `s`.`id`)) 
GROUP BY `o`.`id`, `o`.`name`;

DROP VIEW IF EXISTS `v_planned_skills_details`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_planned_skills_details` AS 
SELECT 
    `ps`.`id` AS `id`, 
    `ps`.`person_id` AS `person_id`, 
    `ps`.`organization_id` AS `organization_id`, 
    `ps`.`skill_id` AS `skill_id`, 
    `p`.`name` AS `person_name`, 
    `p`.`company_name` AS `company_name`, 
    `p`.`title` AS `title`, 
    `p`.`registration_no` AS `registration_no`, 
    `o`.`name` AS `organization_name`, 
    `s`.`skill_name` AS `skill_name`, 
    `s`.`skill_description` AS `skill_description`, 
    `ps`.`target_level` AS `target_level`, 
    `ps`.`start_date` AS `start_date`, 
    `ps`.`end_date` AS `end_date`, 
    `ps`.`status` AS `status`, 
    `ps`.`created_at` AS `created_at`, 
    `ps`.`updated_at` AS `updated_at` 
FROM (((`planned_skills` `ps` 
    join `persons` `p` on(`ps`.`person_id` = `p`.`id`)) 
    join `organizations` `o` on(`ps`.`organization_id` = `o`.`id`)) 
    join `skills` `s` on(`ps`.`skill_id` = `s`.`id`));

-- 11. Stored procedure'ları güncelle
DROP PROCEDURE IF EXISTS `GetOrganizationSkills`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetOrganizationSkills` (IN `org_id` INT)   
BEGIN
    SELECT 
        os.id,
        s.skill_name,
        s.skill_description,
        os.proficiency_level,
        os.is_required,
        os.priority,
        COUNT(ps.id) AS planned_count,
        COUNT(e.id) AS events_count
    FROM organization_skills os
    JOIN skills s ON os.skill_id = s.id
    LEFT JOIN planned_skills ps ON s.id = ps.skill_id AND ps.organization_id = org_id
    LEFT JOIN events e ON s.id = e.lesson_id
    WHERE os.organization_id = org_id
    GROUP BY os.id, s.skill_name, s.skill_description, os.proficiency_level, os.is_required, os.priority
    ORDER BY s.skill_name;
END$$
DELIMITER ;

-- 12. Yeni stored procedure: Bir skill'in hangi organizasyonlarda bulunduğunu getir
DROP PROCEDURE IF EXISTS `GetSkillOrganizations`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetSkillOrganizations` (IN `skill_id` INT)   
BEGIN
    SELECT 
        os.id,
        o.name as organization_name,
        os.proficiency_level,
        os.is_required,
        os.priority,
        COUNT(ps.id) AS planned_count,
        COUNT(e.id) AS events_count
    FROM organization_skills os
    JOIN organizations o ON os.organization_id = o.id
    LEFT JOIN planned_skills ps ON os.skill_id = ps.skill_id AND os.organization_id = ps.organization_id
    LEFT JOIN events e ON os.skill_id = e.lesson_id
    WHERE os.skill_id = skill_id
    GROUP BY os.id, o.name, os.proficiency_level, os.is_required, os.priority
    ORDER BY o.name;
END$$
DELIMITER ;

-- 13. Yeni stored procedure: Tüm skills ve organizasyonlarını getir
DROP PROCEDURE IF EXISTS `GetAllSkillsWithOrganizations`;
DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetAllSkillsWithOrganizations` ()   
BEGIN
    SELECT 
        s.id as skill_id,
        s.skill_name,
        s.skill_description,
        s.category,
        s.is_active,
        GROUP_CONCAT(
            CONCAT(o.name, ' (Seviye: ', os.proficiency_level, ', Zorunlu: ', 
                   CASE WHEN os.is_required = 1 THEN 'Evet' ELSE 'Hayır' END, ')')
            ORDER BY o.name 
            SEPARATOR ', '
        ) as organizations
    FROM skills s
    LEFT JOIN organization_skills os ON s.id = os.skill_id
    LEFT JOIN organizations o ON os.organization_id = o.id
    WHERE s.is_active = 1
    GROUP BY s.id, s.skill_name, s.skill_description, s.category, s.is_active
    ORDER BY s.skill_name;
END$$
DELIMITER ;

COMMIT;

-- ===============================================
-- MİGRASYON TAMAMLANDI
-- ===============================================
-- Artık n:n ilişki yapısı aktif:
-- - Bir organizasyonun birden fazla skill'i olabilir
-- - Bir skill'in birden fazla organizasyonda bulunabilir
-- - organization_skills tablosu junction table olarak çalışır
-- ===============================================

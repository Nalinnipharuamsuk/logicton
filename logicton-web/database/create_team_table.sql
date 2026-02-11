-- Create team table
CREATE TABLE IF NOT EXISTS `Team` (
  `id` VARCHAR(100) PRIMARY KEY,
  `name_th` VARCHAR(100) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `role_th` VARCHAR(100) NOT NULL,
  `role_en` VARCHAR(100) NOT NULL,
  `bio_th` TEXT,
  `bio_en` TEXT,
  `photo` VARCHAR(255),
  `email` VARCHAR(100),
  `linkedin` VARCHAR(255),
  `order` INT DEFAULT 0,
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_order` (`order`),
  KEY `idx_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

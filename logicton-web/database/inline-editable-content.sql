-- Create table for inline editable content
CREATE TABLE IF NOT EXISTS InlineEditableContent (
    id VARCHAR(255) PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    field VARCHAR(100) NOT NULL,
    locale VARCHAR(10) NOT NULL,
    value TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_page_locale (page, locale),
    INDEX idx_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

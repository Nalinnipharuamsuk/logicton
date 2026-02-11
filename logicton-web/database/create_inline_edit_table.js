const mysql = require('mysql2/promise');

async function createTable() {
  const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase'
  };

  const connection = await mysql.createConnection(dbConfig);

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS InlineEditableContent (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page VARCHAR(100) NOT NULL,
      section VARCHAR(100) NOT NULL,
      field VARCHAR(100) NOT NULL,
      locale ENUM('th', 'en') NOT NULL,
      value TEXT NOT NULL,
      isActive TINYINT(1) DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_content (page, section, field, locale),
      KEY idx_page_locale (page, locale),
      KEY idx_isActive (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  try {
    await connection.execute(createTableSQL);
    console.log('Table InlineEditableContent created successfully!');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

createTable();

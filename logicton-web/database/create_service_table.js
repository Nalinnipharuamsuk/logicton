const mysql = require('mysql2/promise');

async function createServiceTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
    multipleStatements: true
  });

  try {
    // Create table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Service (
        id VARCHAR(100) PRIMARY KEY,
        title_th VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        description_th TEXT,
        description_en TEXT,
        features_th TEXT,
        features_en TEXT,
        technologies TEXT,
        icon VARCHAR(50) DEFAULT 'Code',
        category ENUM('web', 'mobile', 'animation', 'framework') DEFAULT 'web',
        \`order\` INT DEFAULT 0,
        isActive TINYINT(1) DEFAULT 1,
        howWeWork_th TEXT,
        howWeWork_en TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_category (category),
        KEY idx_order (\`order\`),
        KEY idx_isActive (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Service table created\n');
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await connection.end();
  }
}

createServiceTable();

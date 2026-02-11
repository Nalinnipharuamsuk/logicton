const mysql = require('mysql2/promise');

async function alterServiceTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
  });

  try {
    console.log('=== Altering Service table ===');

    // Add \`order\` column
    try {
      await connection.execute(`ALTER TABLE Service ADD COLUMN \`order\` INT DEFAULT 0 AFTER category`);
      console.log('✓ Added \`order\` column');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('  - \`order\` column already exists');
      } else {
        throw e;
      }
    }

    // Add howWeWorkTh column
    try {
      await connection.execute(`ALTER TABLE Service ADD COLUMN howWeWorkTh JSON NULL AFTER technologies`);
      console.log('✓ Added howWeWorkTh column');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('  - howWeWorkTh column already exists');
      } else {
        throw e;
      }
    }

    // Add howWeWorkEn column
    try {
      await connection.execute(`ALTER TABLE Service ADD COLUMN howWeWorkEn JSON NULL AFTER howWeWorkTh`);
      console.log('✓ Added howWeWorkEn column');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('  - howWeWorkEn column already exists');
      } else {
        throw e;
      }
    }

    console.log('\n=== Updated Service Table Columns ===');
    const [columns] = await connection.execute('DESCRIBE Service');
    columns.forEach((col) => {
      console.log(`  ${col.Field} - ${col.Type}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

alterServiceTable();

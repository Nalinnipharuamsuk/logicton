const mysql = require('mysql2/promise');

async function checkServiceTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
  });

  try {
    const [columns] = await connection.execute('DESCRIBE Service');
    console.log('=== Service Table Columns ===');
    columns.forEach((col) => {
      console.log(`  ${col.Field} - ${col.Type}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkServiceTable();

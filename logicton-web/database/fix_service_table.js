const mysql = require('mysql2/promise');

async function fixServiceTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
  });

  try {
    console.log('=== Deleting old service data ===');

    // Delete all services
    await connection.execute('DELETE FROM Service');
    console.log('✓ Deleted all old services');

    // Reset auto increment
    await connection.execute('ALTER TABLE Service AUTO_INCREMENT = 1');
    console.log('✓ Reset auto increment\n');

    const [count] = await connection.execute('SELECT COUNT(*) as c FROM Service');
    console.log(`Remaining services: ${count[0].c}\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixServiceTable();

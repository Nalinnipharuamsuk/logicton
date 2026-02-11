const mysql = require('mysql2/promise');

async function listTables() {
  const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase'
  };

  const connection = await mysql.createConnection(dbConfig);

  try {
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in mydatabase:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log('- ' + tableName);
    });
  } catch (error) {
    console.error('Error listing tables:', error.message);
  } finally {
    await connection.end();
  }
}

listTables();

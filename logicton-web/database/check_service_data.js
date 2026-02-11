const mysql = require('mysql2/promise');

async function checkServiceData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
  });

  try {
    console.log('=== Checking Service data in database ===');

    const [services] = await connection.execute('SELECT id, titleEn, \`order\`, isActive FROM Service ORDER BY \`order\` ASC');

    console.log(`Total services: ${services.length}`);
    console.log('\nServices in database:');
    services.forEach((s) => {
      console.log(`  - ${s.id}: ${s.titleEn} (active: ${s.isActive}, order: ${s.order})`);
    });

    // Check first service detail
    if (services.length > 0) {
      const [first] = await connection.execute('SELECT * FROM Service WHERE id = ?', [services[0].id]);
      const service = first[0];
      console.log(`\nFirst service (${service.id}):`);
      console.log(`  titleTh: ${service.titleTh}`);
      console.log(`  featuresTh:`, service.featuresTh);
      console.log(`  howWeWorkTh:`, service.howWeWorkTh);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkServiceData();

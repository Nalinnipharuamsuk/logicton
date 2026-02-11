const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrateServices() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
  });

  try {
    // Read services.json
    console.log('=== Migrating services data ===');
    const servicesPath = path.join(process.cwd(), 'content', 'services', 'services.json');
    const servicesContent = fs.readFileSync(servicesPath, 'utf8');
    const servicesData = JSON.parse(servicesContent);

    for (const service of servicesData.services) {
      await connection.execute(
        `INSERT INTO Service (id, titleTh, titleEn, descriptionTh, descriptionEn, featuresTh, featuresEn, technologies, icon, category, \`order\`, isActive, howWeWorkTh, howWeWorkEn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         titleTh = VALUES(titleTh),
         titleEn = VALUES(titleEn),
         descriptionTh = VALUES(descriptionTh),
         descriptionEn = VALUES(descriptionEn),
         featuresTh = VALUES(featuresTh),
         featuresEn = VALUES(featuresEn),
         technologies = VALUES(technologies),
         icon = VALUES(icon),
         category = VALUES(category),
         \`order\` = VALUES(\`order\`),
         isActive = VALUES(isActive),
         howWeWorkTh = VALUES(howWeWorkTh),
         howWeWorkEn = VALUES(howWeWorkEn)`,
        [
          service.id,
          service.title.th,
          service.title.en,
          service.description.th,
          service.description.en,
          JSON.stringify(service.features.th),
          JSON.stringify(service.features.en),
          JSON.stringify(service.technologies),
          service.icon,
          service.category,
          service.order,
          service.isActive ? 1 : 0,
          service.howWeWork ? JSON.stringify(service.howWeWork.th) : null,
          service.howWeWork ? JSON.stringify(service.howWeWork.en) : null,
        ]
      );
      console.log(`  ✓ ${service.title.en}`);
    }

    // Verify
    const [count] = await connection.execute('SELECT COUNT(*) as c FROM Service');
    console.log(`\n✓ Migration completed! Total: ${count[0].c} services\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

migrateServices();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createAndMigrate() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'myuser',
        password: 'mypassword',
        database: 'mydatabase',
        multipleStatements: true
    });

    try {
        // Create table
        console.log('=== Creating Team table ===');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Team (
              id VARCHAR(100) PRIMARY KEY,
              name_th VARCHAR(100) NOT NULL,
              name_en VARCHAR(100) NOT NULL,
              role_th VARCHAR(100) NOT NULL,
              role_en VARCHAR(100) NOT NULL,
              bio_th TEXT,
              bio_en TEXT,
              photo VARCHAR(255),
              email VARCHAR(100),
              linkedin VARCHAR(255),
              \`order\` INT DEFAULT 0,
              isActive TINYINT(1) DEFAULT 1,
              createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              KEY idx_order (\`order\`),
              KEY idx_isActive (isActive)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Team table created\n');

        // Read and migrate team data
        console.log('=== Migrating team data ===');
        const teamPath = path.join(__dirname, '../content/company/team.json');
        const teamData = JSON.parse(fs.readFileSync(teamPath, 'utf8'));

        for (const member of teamData.members) {
            await connection.execute(
                `INSERT INTO Team (id, name_th, name_en, role_th, role_en, bio_th, bio_en, photo, email, linkedin, \`order\`, isActive)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 name_th = VALUES(name_th),
                 name_en = VALUES(name_en),
                 role_th = VALUES(role_th),
                 role_en = VALUES(role_en),
                 bio_th = VALUES(bio_th),
                 bio_en = VALUES(bio_en),
                 photo = VALUES(photo),
                 email = VALUES(email),
                 linkedin = VALUES(linkedin),
                 \`order\` = VALUES(\`order\`),
                 isActive = VALUES(isActive)`,
                [
                    member.id,
                    member.name.th,
                    member.name.en,
                    member.role.th,
                    member.role.en,
                    member.bio.th,
                    member.bio.en,
                    member.photo,
                    member.email || null,
                    member.linkedin || null,
                    member.order,
                    member.isActive ? 1 : 0
                ]
            );
            console.log(`  ✓ ${member.name.en} - ${member.role.en}`);
        }

        // Verify
        const [count] = await connection.execute('SELECT COUNT(*) as c FROM Team');
        console.log(`\n✓ Migration completed! Total: ${count[0].c} team members\n`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

createAndMigrate();

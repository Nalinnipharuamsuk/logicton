const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrateTeam() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'logicton_db'
    });

    try {
        // Read team data from JSON
        const teamPath = path.join(__dirname, '../content/company/team.json');
        const teamData = JSON.parse(fs.readFileSync(teamPath, 'utf8'));

        console.log(`Migrating ${teamData.members.length} team members...`);

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
            console.log(`✓ Migrated: ${member.name.en}`);
        }

        console.log('\nTeam migration completed!');
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await connection.end();
    }
}

migrateTeam();

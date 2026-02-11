const mysql = require('mysql2/promise');

async function checkTeamTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'myuser',
        password: 'mypassword',
        database: 'mydatabase'
    });

    try {
        // Check if table exists
        const [tables] = await connection.execute("SHOW TABLES LIKE 'Team'");
        console.log('=== Team Table Status ===');
        if (tables.length === 0) {
            console.log('❌ Table "Team" does not exist');
            console.log('\nRun this command to create:');
            console.log('mysql -u root -p logicton_db < database/create_team_table.sql');
            return;
        }
        console.log('✓ Table "Team" exists\n');

        // Check table structure
        console.log('=== Table Structure ===');
        const [columns] = await connection.execute('DESCRIBE Team');
        columns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type}`);
        });
        console.log('');

        // Count records
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM Team');
        console.log(`=== Team Members ===`);
        console.log(`Total: ${count[0].count} records\n`);

        // Show all records
        if (count[0].count > 0) {
            const [members] = await connection.execute(
                'SELECT id, name_en, role_en, `order`, isActive FROM Team ORDER BY `order`'
            );
            console.log('ID                  | Name     | Role              | Order | Active');
            console.log('--------------------|----------|-------------------|-------|--------');
            members.forEach(m => {
                console.log(`${m.id.padEnd(20)}| ${(m.name_en || '').padEnd(8)}| ${(m.role_en || '').padEnd(17)}| ${m.order.toString().padEnd(6)}| ${m.isActive ? '✓' : '✗'}`);
            });
        } else {
            console.log('No records found. Run migration:');
            console.log('node database/migrate_team.js');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkTeamTable();

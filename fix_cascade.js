const pool = require('./config/db');

async function fixConstraints() {
    try {
        console.log('Starting constraint fix...');

        const tables = ['comments', 'subtasks'];

        for (const table of tables) {
            // Find FK constraint name for task_id
            const [rows] = await pool.query(`
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = 'task_id' 
                AND REFERENCED_TABLE_NAME = 'tasks';
            `, [table]);

            if (rows.length > 0) {
                const constraintName = rows[0].CONSTRAINT_NAME;
                console.log(`Found constraint ${constraintName} on table ${table}`);

                // Drop existing constraint
                await pool.query(`ALTER TABLE ${table} DROP FOREIGN KEY ${constraintName}`);
                console.log(`Dropped constraint ${constraintName}`);

                // Add new constraint with CASCADE
                await pool.query(`
                    ALTER TABLE ${table} 
                    ADD CONSTRAINT ${constraintName} 
                    FOREIGN KEY (task_id) 
                    REFERENCES tasks(task_id) 
                    ON DELETE CASCADE
                `);
                console.log(`Added CASCADE constraint to ${table}`);
            } else {
                console.log(`No foreign key to tasks found on ${table} (or it was named differently than expected queries caught)`);
                // Fallback: try to add it assuming it doesn't exist? No, unsafe.
                // Assuming if no FK, maybe it was already dropped or never existed?
                // Let's try adding it just in case it was missing, wrapping in try/catch? 
                // No, better to just log.
            }
        }

        console.log('✅ Constraints updated successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to update constraints:', err);
        process.exit(1);
    }
}

fixConstraints();

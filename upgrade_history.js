const pool = require('./config/db');

async function upgradeHistoryTable() {
    try {
        console.log('Starting history table upgrade...');

        // 1. Add task_title column
        try {
            await pool.query('ALTER TABLE task_history ADD COLUMN task_title VARCHAR(255)');
            console.log('Added task_title column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log('task_title column already exists');
            else throw e;
        }

        // 2. Populate existing titles
        await pool.query(`
            UPDATE task_history h 
            JOIN tasks t ON h.task_id = t.task_id 
            SET h.task_title = t.title
        `);
        console.log('Populated existing task titles');

        // 3. Find and Drop existing Foreign Key
        const [rows] = await pool.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'task_history' 
            AND COLUMN_NAME = 'task_id' 
            AND REFERENCED_TABLE_NAME = 'tasks';
        `);

        if (rows.length > 0) {
            const constraintName = rows[0].CONSTRAINT_NAME;
            await pool.query(`ALTER TABLE task_history DROP FOREIGN KEY ${constraintName}`);
            console.log(`Dropped FK ${constraintName}`);
        }

        // 4. Modify task_id to be NULLABLE
        await pool.query('ALTER TABLE task_history MODIFY task_id INT NULL');
        console.log('Modified task_id to be NULLABLE');

        // 5. Add new FK with ON DELETE SET NULL
        // We need a unique name for the new constraint
        const newConstraintName = 'fk_history_task_set_null';
        await pool.query(`
            ALTER TABLE task_history 
            ADD CONSTRAINT ${newConstraintName} 
            FOREIGN KEY (task_id) 
            REFERENCES tasks(task_id) 
            ON DELETE SET NULL
        `);
        console.log('Added new FK with ON DELETE SET NULL');

        console.log('✅ History table upgraded successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to upgrade history table:', err);
        process.exit(1);
    }
}

upgradeHistoryTable();

const pool = require('./config/db');
const Task = require('./models/taskModel');
const User = require('./models/userModel');

async function debugDelete() {
    try {
        console.log('Starting delete debug...');

        // 1. Create a temp user and task
        const email = `debug_del_${Date.now()}@example.com`;
        const userId = await User.create('Debug User', email, 'password');
        const taskId = await Task.create(userId, 'Task to Delete', 'Desc', '2023-12-31', 'low');

        console.log(`Created Task ${taskId} for User ${userId}`);

        // 2. Add some related data if possible (though we want to see if dry delete fails first)
        // If the error is about history, it might fail even with just history (which is added by controller, but here we are calling model directly)
        // Wait, the controller adds history. If I use model.delete directly, it should work IF DB constraints are fine.
        // But if I want to reproduce "user flow", I should probably manually insert into history/comments/subtasks to simulate a real task.

        // Insert into history (simulating what controller does)
        await pool.query('INSERT INTO task_history (task_id, user_id, action_type, details) VALUES (?, ?, ?, ?)',
            [taskId, userId, 'created', 'debug']);
        console.log('Added history entry');

        // Try to add a comment (if table exists) - guessing table name 'comments'
        try {
            await pool.query('INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)',
                [taskId, userId, 'debug comment']);
            console.log('Added comment');
        } catch (e) { console.log('Could not add comment (maybe table diff)', e.message); }

        // Try to add a subtask (if table exists) - guessing table name 'subtasks'
        try {
            await pool.query('INSERT INTO subtasks (task_id, title, status) VALUES (?, ?, ?)',
                [taskId, 'debug subtask', 'pending']);
            console.log('Added subtask');
        } catch (e) { console.log('Could not add subtask (maybe table diff)', e.message); }


        // 3. Attempt Delete
        console.log('Attempting delete...');
        await Task.delete(taskId, userId);
        console.log('✅ Delete successful');

        process.exit(0);
    } catch (err) {
        console.error('❌ Delete failed:', err);
        process.exit(1);
    }
}

debugDelete();

const pool = require('./config/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks LIMIT 1');
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error('Test query error:', err);
    process.exit(1);
  }
}

test();

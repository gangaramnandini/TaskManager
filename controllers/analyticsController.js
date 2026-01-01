const db = require('../config/db'); // Your configured MySQL connection

// Helper to format Date object to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// Render the analytics dashboard page
exports.renderAnalyticsPage = (req, res) => {
  res.render('analytics', { title: 'Analytics Dashboard' });
};

// Get analytics data for charts (including top priority tasks with formatted due dates)
exports.getAnalyticsData = async (req, res) => {
  const filter = req.query.filter || 'all'; // 'week', 'month', 'all'
  let dateCondition = '';
  const now = new Date();
  const todayStr = formatDate(now);

  if (filter === 'week') {
    let day = now.getDay();
    day = day === 0 ? 7 : day;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    dateCondition = `AND due_date >= '${formatDate(monday)}'`;
  } else if (filter === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    dateCondition = `AND due_date >= '${formatDate(firstDay)}'`;
  }

  try {
    // 1. Fetch basic stats with filter
    // We fetch all relevant tasks first to calculate stats in JS (or could do complex SQL)
    // For simplicity and small scale, let's do SQL aggregation.
    
    // Total Tasks in range
    const [totalRes] = await db.query(
      `SELECT COUNT(*) as count FROM tasks WHERE 1=1 ${dateCondition}`
    );
    const total = totalRes[0].count;

    // Completed in range
    const [completedRes] = await db.query(
      `SELECT COUNT(*) as count FROM tasks WHERE status = 'completed' ${dateCondition}`
    );
    const completed = completedRes[0].count;

    // Pending in range
    const [pendingRes] = await db.query(
      `SELECT COUNT(*) as count FROM tasks WHERE status = 'pending' ${dateCondition}`
    );
    const pending = pendingRes[0].count;

    // Upcoming (Pending + Due Date > Now) in range
    // upcoming implies future due date
    const [upcomingRes] = await db.query(
      `SELECT COUNT(*) as count FROM tasks WHERE status = 'pending' AND due_date > NOW() ${dateCondition}`
    );
    const upcoming = upcomingRes[0].count;


    // 2. Charts Data
    
    // Status Dist (in range)
    const [statusCounts] = await db.query(
      `SELECT status, COUNT(*) AS count FROM tasks WHERE 1=1 ${dateCondition} GROUP BY status`
    );

    // Priority Dist (in range)
    const [priorityCounts] = await db.query(
      `SELECT priority, COUNT(*) AS count FROM tasks WHERE 1=1 ${dateCondition} GROUP BY priority`
    );

    // Trend (Weekly) - this might need adjustment if filter is 'week', but 'week' filter + weekly trend is mostly 1 bar. 
    // If filter is 'week', maybe show daily trend? Let's keep weekly for now or switch to daily if 'week' selected.
    let trendQuery = '';
    if (filter === 'week') {
         trendQuery = `
          SELECT DATE_FORMAT(due_date, '%Y-%m-%d') AS label, COUNT(*) AS count
          FROM tasks
          WHERE due_date IS NOT NULL ${dateCondition}
          GROUP BY label ORDER BY label
        `;
    } else {
        trendQuery = `
          SELECT DATE_FORMAT(due_date, '%Y-%u') AS label, COUNT(*) AS count
          FROM tasks
          WHERE due_date IS NOT NULL ${dateCondition}
          GROUP BY label ORDER BY label
        `;
    }
    const [trendData] = await db.query(trendQuery);


    // 3. Top Priority Tasks (High priority, pending, sorted by due date)
    const [topPriorityTasksRaw] = await db.query(
      `SELECT title, due_date, priority
       FROM tasks
       WHERE priority = 'high' AND status != 'completed' ${dateCondition}
       ORDER BY due_date ASC
       LIMIT 5`
    );

    const topPriorityTasks = topPriorityTasksRaw.map(task => ({
      ...task,
      due_date_formatted: task.due_date
        ? new Date(task.due_date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'
        })
        : 'No due date'
    }));

    res.json({
      stats: { total, completed, pending, upcoming },
      statusData: statusCounts,
      priorityData: priorityCounts,
      trendData: {
        labels: trendData.map(row => row.label),
        data: trendData.map(row => row.count)
      },
      topPriorityTasks
    });

  } catch (err) {
    console.error('Error fetching analytics data:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

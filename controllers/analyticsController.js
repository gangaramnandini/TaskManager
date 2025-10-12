const db = require('../config/db'); // Your configured MySQL connection

// Helper to format Date object to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// Render the analytics dashboard page
exports.renderAnalyticsPage = (req, res) => {
  res.render('analytics', { title: 'Analytics Dashboard' });
};

// Get analytics data for charts
exports.getAnalyticsData = async (req, res) => {
  const filter = req.query.filter || 'all'; // 'week', 'month', 'all'

  let dateCondition = '';
  const now = new Date();

  if(filter === 'week') {
    // Get Monday of current week
    let day = now.getDay();
    day = day === 0 ? 7 : day;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    dateCondition = `AND due_date >= '${formatDate(monday)}'`;
  } else if(filter === 'month') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    dateCondition = `AND due_date >= '${formatDate(firstDay)}'`;
  } else {
    // all time - no date condition
    dateCondition = '';
  }

  try {
    // Status counts
    const [statusCounts] = await db.query(
      'SELECT status, COUNT(*) AS count FROM tasks GROUP BY status'
    );

    // Priority counts
    const [priorityCounts] = await db.query(
      'SELECT priority, COUNT(*) AS count FROM tasks GROUP BY priority'
    );

    // Completion trend - group by ISO week (year-week)
    const [trendData] = await db.query(`
      SELECT DATE_FORMAT(due_date, '%Y-%u') AS week, COUNT(*) AS count
      FROM tasks
      WHERE due_date IS NOT NULL ${dateCondition}
      GROUP BY week ORDER BY week
    `);

    // Format response
    res.json({
      statusData: statusCounts,
      priorityData: priorityCounts,
      trendData: {
        labels: trendData.map(row => row.week),
        data: trendData.map(row => row.count)
      }
    });

  } catch(err) {
    console.error('Error fetching analytics data:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
};

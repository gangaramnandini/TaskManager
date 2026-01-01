const express = require('express');
const pool = require('./config/db');
const path = require('path');
const session = require('express-session');


const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const commentsRoute = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const activityRoutes = require('./routes/activityRoutes');

require('dotenv').config();

const app = express();

// Set EJS as the template engine and enable express-ejs-layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // layout file is views/layout.ejs

// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
  })
);
app.use((req, res, next) => {
  res.locals.userName = req.session.userName || 'User';
  next();
});

// Root Route: Landing Page or Redirect
app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/dashboard');
  }
  res.render('landing', {
    layout: 'layout-landing',
    title: 'Task Manager - Organize Your Work'
  });
});

// Routes
app.use('/auth', authRoutes);
app.use(commentsRoute);
app.use(taskRoutes);
app.use(subtaskRoutes);
// app.use(commentsRoute); -- Moved up
app.use(userRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/activity', activityRoutes);



// Dashboard Route (Protected)
app.get('/dashboard', async (req, res) => {
  if (!req.session.user_id) return res.redirect('/auth/login');

  const userId = req.session.user_id;
  const filter = req.query.filter || 'all';

  try {
    // 1. Fetch Counts
    const [countResults] = await pool.query(`
      SELECT
        SUM(status='pending' AND DATE(due_date) = CURDATE()) AS todayCount,
        SUM(status='pending' AND DATE(due_date) > CURDATE()) AS upcomingCount,
        SUM(status='pending') AS pendingCount,
        SUM(status='completed') AS completedCount
      FROM tasks WHERE user_id = ?;
    `, [userId]);

    const counts = countResults[0];

    // 2. Fetch Tasks with Filter
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    let params = [userId];

    if (filter === 'today') {
      query += ' AND DATE(due_date) = CURDATE()';
    } else if (filter === 'upcoming') {
      query += ' AND DATE(due_date) > CURDATE()';
    } else if (filter === 'pending') {
      query += " AND status = 'pending'";
    } else if (filter === 'completed') {
      query += " AND status = 'completed'";
    }

    query += ' ORDER BY due_date ASC';

    const [tasks] = await pool.query(query, params);

    res.render('dashboard', {
      userName: req.session.userName || 'User',
      todayCount: counts.todayCount,
      upcomingCount: counts.upcomingCount,
      pendingCount: counts.pendingCount,
      completedCount: counts.completedCount,
      tasks,
      activeFilter: filter,
      title: 'Dashboard',
      path: '/dashboard'
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('Database error');
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const commentsRoute = require('./routes/commentRoutes'); 
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
  
// Routes
app.use('/auth', authRoutes);
app.use(taskRoutes);
app.use(subtaskRoutes);
app.use(commentsRoute);


// Redirect root to login page
app.get('/', (req, res) => {
  if (req.session.user_id) {  // use user_id not userId
    res.render('dashboard', {
      userName: req.session.userName || 'User',
      title: 'Dashboard - Task Management System'
    });
  } else {
    res.redirect('/auth/login');
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

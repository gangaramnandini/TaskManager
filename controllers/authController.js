const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const saltRounds = 10;

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    error: null,
    title: 'Login - Task Management System',
    layout: 'layout-auth'
  });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('auth/login', {
      error: 'Please enter both email and password.',
      title: 'Login - Task Management System',
      layout: 'layout-auth'
    });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.render('auth/login', {
        error: 'Invalid email or password.',
        title: 'Login - Task Management System',
        layout: 'layout-auth'
      });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('auth/login', {
        error: 'Invalid email or password.',
        title: 'Login - Task Management System',
        layout: 'layout-auth'
      });
    }

    req.session.user_id = user.user_id;
req.session.userName = user.name;
console.log(req.session.user_id = user.user_id);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('auth/login', {
      error: 'An unexpected error occurred. Please try again.',
      title: 'Login - Task Management System',
      layout: 'layout-auth'
    });
  }
};

exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    error: null,
    title: 'Sign Up - Task Management System',
    layout: 'layout-auth'
  });
};

exports.postSignup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.render('auth/signup', {
      error: 'All fields are required.',
      title: 'Sign Up - Task Management System',
      layout: 'layout-auth'
    });
  }

  if (password !== confirmPassword) {
    return res.render('auth/signup', {
      error: 'Passwords do not match.',
      title: 'Sign Up - Task Management System',
      layout: 'layout-auth'
    });
  }

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.render('auth/signup', {
        error: 'Email is already registered.',
        title: 'Sign Up - Task Management System',
        layout: 'layout-auth'
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      name,
      email,
      hashedPassword
    ]);

    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('auth/signup', {
      error: 'An unexpected error occurred. Please try again.',
      title: 'Sign Up - Task Management System',
      layout: 'layout-auth'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

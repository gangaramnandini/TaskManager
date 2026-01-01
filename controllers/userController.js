const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getProfilePage = async (req, res) => {
    if (!req.session.user_id) return res.redirect('/auth/login');

    try {
        const [rows] = await pool.query('SELECT name, email FROM users WHERE user_id = ?', [req.session.user_id]);
        if (rows.length === 0) return res.redirect('/auth/login');

        res.render('profile', {
            user: rows[0],
            userName: req.session.userName,
            title: 'My Profile',
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading profile');
    }
};

exports.updateProfile = async (req, res) => {
    if (!req.session.user_id) return res.redirect('/auth/login');
    const { name } = req.body;

    try {
        await pool.query('UPDATE users SET name = ? WHERE user_id = ?', [name, req.session.user_id]);
        req.session.userName = name; // Update session
        res.redirect('/profile?success=Profile updated successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?error=Failed to update profile');
    }
};

exports.changePassword = async (req, res) => {
    if (!req.session.user_id) return res.redirect('/auth/login');
    const { currentPassword, newPassword } = req.body;

    try {
        const [rows] = await pool.query('SELECT password FROM users WHERE user_id = ?', [req.session.user_id]);
        const user = rows[0];

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.redirect('/profile?error=Incorrect current password');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, req.session.user_id]);

        res.redirect('/profile?success=Password changed successfully');
    } catch (err) {
        console.error(err);
        res.redirect('/profile?error=Failed to change password');
    }
};

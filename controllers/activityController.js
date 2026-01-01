const History = require('../models/historyModel');

exports.getActivityLog = async (req, res) => {
    try {
        if (!req.session.user_id) {
            return res.redirect('/auth/login');
        }

        const history = await History.getAllByUserId(req.session.user_id);

        res.render('activity-log', {
            title: 'Activity Log',
            userName: req.session.userName || 'User',
            history: history,
            path: '/activity' // For sidebar active state
        });
    } catch (err) {
        console.error('Error fetching activity log:', err);
        res.status(500).send('Error loading activity log');
    }
};

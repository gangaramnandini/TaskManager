module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.session && req.session.user_id) {
        return next();
      }
      res.redirect('/auth/login');
    }
  };
  
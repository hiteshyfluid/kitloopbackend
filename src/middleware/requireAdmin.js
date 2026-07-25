const requireAuth = require('./auth');
const AppError = require('../utils/AppError');

const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      return next(new AppError('Admin access required', 403, 'ADMIN_REQUIRED'));
    }
    next();
  },
];

module.exports = requireAdmin;

const requireAuth = require('./auth');
const AppError = require('../utils/AppError');
const { isAdminRole } = require('./requireRole');

const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    if (!isAdminRole(req.user.role)) {
      return next(new AppError('Admin access required', 403, 'ADMIN_REQUIRED'));
    }
    next();
  },
];

module.exports = requireAdmin;

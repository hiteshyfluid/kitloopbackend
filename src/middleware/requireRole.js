const requireAuth = require('./auth');
const AppError = require('../utils/AppError');

const ADMIN_ROLES = ['admin', 'super_admin'];

// requireRole('admin', 'super_admin') → [requireAuth, roleCheck]
function requireRole(...roles) {
  return [
    requireAuth,
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        const code = roles.length === 1 && roles[0] === 'super_admin' ? 'SUPER_ADMIN_REQUIRED' : 'FORBIDDEN';
        return next(new AppError('You do not have permission to do this', 403, code));
      }
      next();
    },
  ];
}

const isAdminRole = (role) => ADMIN_ROLES.includes(role);

module.exports = requireRole;
module.exports.ADMIN_ROLES = ADMIN_ROLES;
module.exports.isAdminRole = isAdminRole;
module.exports.requireSuperAdmin = requireRole('super_admin');

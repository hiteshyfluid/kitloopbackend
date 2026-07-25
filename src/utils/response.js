const { toSnakeCase } = require('./caseConvert');

function sendSuccess(res, status, payload = {}) {
  res.status(status).json({ success: true, ...toSnakeCase(payload) });
}

module.exports = { sendSuccess };

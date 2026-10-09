function sendSuccess(res, statusCode, data, extra = {}) {
  return res.status(statusCode).json({ success: true, data, ...extra });
}

module.exports = { sendSuccess };

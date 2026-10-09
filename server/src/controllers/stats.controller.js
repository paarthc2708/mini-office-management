const statsService = require("../services/stats.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");

const summary = asyncHandler(async (req, res) => {
  const data = await statsService.getSummary();
  sendSuccess(res, 200, data);
});

module.exports = { summary };

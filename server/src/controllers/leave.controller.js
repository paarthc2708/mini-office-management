const leaveService = require("../services/leave.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");

const create = asyncHandler(async (req, res) => {
  const leave = await leaveService.createLeave(req.body);
  sendSuccess(res, 201, leave);
});

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await leaveService.listLeaves(req.query);
  sendSuccess(res, 200, items, { pagination });
});

const getOne = asyncHandler(async (req, res) => {
  const leave = await leaveService.getLeaveById(req.params.id);
  sendSuccess(res, 200, leave);
});

const updateStatus = asyncHandler(async (req, res) => {
  const leave = await leaveService.updateLeaveStatus(req.params.id, req.body);
  sendSuccess(res, 200, leave);
});

module.exports = { create, list, getOne, updateStatus };

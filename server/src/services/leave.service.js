const Leave = require("../models/Leave.model");
const Employee = require("../models/Employee.model");
const ApiError = require("../utils/ApiError");

async function createLeave({ employeeId, leaveType, startDate, endDate, reason }) {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw ApiError.notFound("Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  const leave = await Leave.create({
    employee: employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: "PENDING",
  });

  return leave.populate("employee", "name employeeCode department");
}

async function listLeaves({ status, employeeId, page, limit }) {
  const filter = {};
  if (status) filter.status = status;
  if (employeeId) filter.employee = employeeId;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Leave.find(filter)
      .populate("employee", "name employeeCode department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getLeaveById(id) {
  const leave = await Leave.findById(id).populate(
    "employee",
    "name employeeCode department"
  );
  if (!leave) {
    throw ApiError.notFound("Leave request not found", "LEAVE_NOT_FOUND");
  }
  return leave;
}

async function updateLeaveStatus(id, { status, reviewedBy }) {
  const leave = await Leave.findById(id);
  if (!leave) {
    throw ApiError.notFound("Leave request not found", "LEAVE_NOT_FOUND");
  }

  if (leave.status !== "PENDING") {
    throw ApiError.conflict(
      `Only pending requests can be reviewed. This request is already ${leave.status}.`,
      "INVALID_STATUS_TRANSITION"
    );
  }

  leave.status = status;
  leave.reviewedBy = reviewedBy || null;
  leave.reviewedAt = new Date();
  await leave.save();

  return leave.populate("employee", "name employeeCode department");
}

module.exports = {
  createLeave,
  listLeaves,
  getLeaveById,
  updateLeaveStatus,
};

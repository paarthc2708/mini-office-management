const Employee = require("../models/Employee.model");
const Leave = require("../models/Leave.model");

async function getSummary() {
  const [
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
    byDepartment,
  ] = await Promise.all([
    Employee.countDocuments({}),
    Employee.countDocuments({ status: "ACTIVE" }),
    Leave.countDocuments({ status: "PENDING" }),
    Leave.countDocuments({ status: "APPROVED" }),
    Leave.countDocuments({ status: "REJECTED" }),
    Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $project: { _id: 0, department: "$_id", count: 1 } },
      { $sort: { department: 1 } },
    ]),
  ]);

  return {
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
    employeesByDepartment: byDepartment,
    leavesByStatus: [
      { status: "PENDING", count: pendingLeaves },
      { status: "APPROVED", count: approvedLeaves },
      { status: "REJECTED", count: rejectedLeaves },
    ],
  };
}

module.exports = { getSummary };

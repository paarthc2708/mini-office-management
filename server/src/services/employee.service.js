const Employee = require("../models/Employee.model");
const Leave = require("../models/Leave.model");
const ApiError = require("../utils/ApiError");

async function createEmployee(payload) {
  const employee = await Employee.create(payload);
  return employee;
}

async function listEmployees({ search, department, status, page, limit }) {
  const filter = {};

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ name: regex }, { email: regex }, { employeeCode: regex }];
  }
  if (department) {
    filter.department = department;
  }
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
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

async function getEmployeeById(id) {
  const employee = await Employee.findById(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found", "EMPLOYEE_NOT_FOUND");
  }
  return employee;
}

async function updateEmployee(id, payload) {
  const employee = await Employee.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    throw ApiError.notFound("Employee not found", "EMPLOYEE_NOT_FOUND");
  }
  return employee;
}

// Deletion policy: hard-delete the employee and cascade-delete their leave
// history. This keeps the dataset simple for this app's scope; a system that
// must retain historical leave records across employee deletions would soft-
// delete (status flag) instead.
async function deleteEmployee(id) {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw ApiError.notFound("Employee not found", "EMPLOYEE_NOT_FOUND");
  }
  await Leave.deleteMany({ employee: id });
  return employee;
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};

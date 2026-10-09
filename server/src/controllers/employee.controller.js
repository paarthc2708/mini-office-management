const employeeService = require("../services/employee.service");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/ApiResponse");

const create = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  sendSuccess(res, 201, employee);
});

const list = asyncHandler(async (req, res) => {
  const { items, pagination } = await employeeService.listEmployees(req.query);
  sendSuccess(res, 200, items, { pagination });
});

const getOne = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  sendSuccess(res, 200, employee);
});

const update = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  sendSuccess(res, 200, employee);
});

const remove = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.status(204).send();
});

module.exports = { create, list, getOne, update, remove };

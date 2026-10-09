const express = require("express");
const controller = require("../controllers/employee.controller");
const validate = require("../middleware/validate");
const {
  createEmployeeBody,
  updateEmployeeBody,
  employeeIdParams,
  listEmployeesQuery,
} = require("../validators/employee.validator");

const router = express.Router();

router.post("/", validate({ body: createEmployeeBody }), controller.create);
router.get("/", validate({ query: listEmployeesQuery }), controller.list);
router.get("/:id", validate({ params: employeeIdParams }), controller.getOne);
router.put(
  "/:id",
  validate({ params: employeeIdParams, body: updateEmployeeBody }),
  controller.update
);
router.delete("/:id", validate({ params: employeeIdParams }), controller.remove);

module.exports = router;

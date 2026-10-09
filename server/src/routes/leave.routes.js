const express = require("express");
const controller = require("../controllers/leave.controller");
const validate = require("../middleware/validate");
const {
  createLeaveBody,
  updateLeaveStatusBody,
  leaveIdParams,
  listLeavesQuery,
} = require("../validators/leave.validator");

const router = express.Router();

router.post("/", validate({ body: createLeaveBody }), controller.create);
router.get("/", validate({ query: listLeavesQuery }), controller.list);
router.get("/:id", validate({ params: leaveIdParams }), controller.getOne);
router.patch(
  "/:id/status",
  validate({ params: leaveIdParams, body: updateLeaveStatusBody }),
  controller.updateStatus
);

module.exports = router;

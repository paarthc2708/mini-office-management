const express = require("express");
const employeeRoutes = require("./employee.routes");
const leaveRoutes = require("./leave.routes");
const statsRoutes = require("./stats.routes");

const router = express.Router();

router.use("/employees", employeeRoutes);
router.use("/leaves", leaveRoutes);
router.use("/stats", statsRoutes);

module.exports = router;

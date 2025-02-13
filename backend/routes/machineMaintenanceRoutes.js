const express = require("express");
const router = express.Router();
const maintenanceController = require("../controllers/machineMaintenanceController");

// Routes for maintenance operations
router.post("/add-maintenance", maintenanceController.addMaintenance);
router.get("/maintenance/:machineId", maintenanceController.getMaintenanceByMachine);
router.get("/maintenance/user/:uid", maintenanceController.getMaintenanceByUser);

module.exports = router;
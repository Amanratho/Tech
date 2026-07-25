
const express = require("express");
const router = express.Router();
const path = require("path");
const { getAllMachines } = require("../controllers/machineShowController");
const { getMachineSummaryByUid } = require("../controllers/machineController");

router.post("/machines", getAllMachines); 
router.post("/machines/summary", getMachineSummaryByUid);


module.exports = router;
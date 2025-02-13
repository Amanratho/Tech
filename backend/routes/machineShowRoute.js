
const express = require("express");
const router = express.Router();
const path = require("path");
const { getAllMachines } = require("../controllers/machineShowController");

router.post("/machines", getAllMachines); 


module.exports = router;
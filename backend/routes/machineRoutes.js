const express = require("express");
const router = express.Router();
const machineController = require("../controllers/machineController");
const {
  upload,
  handleMulterError,
} = require("../middlewares/uploadMiddleware");

// Routes
router.get("/machines", machineController.getAllMachines);

router.post(
  "/addMachine",
  upload.single("image"),
  handleMulterError, // Middleware to handle errors
  machineController.addMachine
);
console.log("ham route tak pahuch gaye hai")

router.get("/machines/:id", machineController.getMachineById);
router.put("/machines/:id", upload.single("image"), machineController.updateMachine);
router.delete("/machines/:id", machineController.deleteMachine);

module.exports = router;

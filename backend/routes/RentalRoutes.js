const express = require("express");
const router = express.Router();
const RentalController = require("../controllers/RentalController");

// Route to add new rental entry
router.post("/add-entry", RentalController.addRentalEntry);

// Route to get EOD / Business Summary (aggregated by date range)
router.get("/eod-summary", RentalController.getEODSummary);

// Route to get filtered statement data (scoped to uid, dynamic filters via query params)
router.get("/statement", RentalController.getStatement);

// Route to get all rentals
router.post("/rentals", RentalController.getAllRentals);

// Route to get rentals by machine ID
router.post("/rentals-by-machine-id", RentalController.getRentalsByMachineId);

// Route to update payment information for a rental entry
router.put("/update-payment", RentalController.updatePayment);

// Route to get customer details by mobile number
router.get("/customer/:mobileNumber", RentalController.getCustomerByMobile);

// Route to edit a rental entry (full update)
router.put("/edit-rental", RentalController.editRental);

// Route to delete multiple rentals (Bills) at once
router.post("/delete-multiple", RentalController.deleteMultipleRentals);

// Route to get all active pending reminders
router.post("/reminders/pending", RentalController.getPendingReminders);

// Route to update reminder date or pendingAmount
router.put("/reminders/update", RentalController.updateReminderDetails);

// Route to complete or delete/cancel reminder
router.put("/reminders/action", RentalController.deleteOrCompleteReminder);

module.exports = router;
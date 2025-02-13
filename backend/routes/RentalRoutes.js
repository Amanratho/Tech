const express = require("express");
const router = express.Router();
const RentalController = require("../controllers/RentalController");

// Route to add new rental entry
router.post("/add-entry", RentalController.addRentalEntry);

// Route to get all rentals
router.post("/rentals", RentalController.getAllRentals);

router.post("/rentals-by-machine-id", RentalController.getRentalsByMachineId);

// Route to update payment information for a rental entry
router.put("/update-payment", RentalController.updatePayment);

// Route to get customer details by mobile number
router.get("/customer/:mobileNumber", RentalController.getCustomerByMobile);


// router.post("/addAdditionalIncome", RentalController.addAdditionalIncome);

// router.post("/addExpense", RentalController.addExpense);

// router.get("/getDetails/:rentalId", RentalController.getRentalDetails);

module.exports = router;

const Rental = require("../models/RentalModel");


exports.addRentalEntry = async (req, res) => {
  try {
    const {
      customerName,
      mobileNumber,
      address,
      operatorName,
      price,
      quantity,
      paidAmount,
      pendingAmount,
      uid,
      machineId,
      rentType,
      jobWork,
    } = req.body;
    const totalAmount = price * quantity;
    const newRental = new Rental({
      customerName,
      mobileNumber,
      address,
      operatorName,
      price,
      quantity,
      totalAmount,
      paidAmount,
      pendingAmount,
      uid,
      machineId,
      rentType,
      jobWork,
    });
    await newRental.save();

    res
      .status(201)
      .json({ message: "Rental entry added successfully", data: newRental });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding rental entry", error: error.message });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const { uid } = req.body;
    
    const rentals = await Rental.find({ uid }); 
    res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rentals", error: error.message });
  }
};

exports.getRentalsByMachineId = async (req, res) => {
  try {
    const { machineId } = req.body;
    
    const rentals = await Rental.find({ machineId });

    if (rentals.length === 0) {
      
      return res.status(404).json({ message: "No rentals found for this machine" });
    }
    res.status(200).json(rentals.length ? rentals : []);
    // res.status(200).json(rentals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rentals", error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { _id, paidAmount, pendingAmount } = req.body; 

    const updatedRental = await Rental.findByIdAndUpdate(
      _id,  
      { paidAmount, pendingAmount },  
      { new: true }  
    );

    if (!updatedRental) {
      return res.status(404).json({ message: 'Rental entry not found' });
    }

    return res.status(200).json({ message: 'Payment updated successfully', data: updatedRental });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Add Additional Income
exports.addAdditionalIncome = async (req, res) => {
  try {
    const { machineId, amount, reason } = req.body;
    const income = new AdditionalIncome({ machineId, amount, reason });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Expense
exports.addExpense = async (req, res) => {
  try {
    const { machineId, amount, reason } = req.body;
    const expense = new Expense({ machineId, amount, reason });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Rental Details including Additional Income and Expenses
exports.getRentalDetails = async (req, res) => {
  try {
    const { machineId } = req.params;
    const rental = await Rental.findById(machineId);
    const incomes = await AdditionalIncome.find({ machineId });
    const expenses = await Expense.find({ machineId });
    
    res.status(200).json({ rental, incomes, expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Multiple Rentals (Bills)
exports.deleteMultipleRentals = async (req, res) => {
  try {
    const { ids } = req.body; // UI se IDs ka array aayega

    // Check agar array khali hai ya bheja hi nahi gaya
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No bills selected for deletion" });
    }

    // MongoDB ka $in operator ek sath saare matching IDs ko delete kar dega
    const result = await Rental.deleteMany({
      _id: { $in: ids }
    });

    return res.status(200).json({ 
      success: true,
      message: `${result.deletedCount} bills deleted successfully!`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error deleting multiple rentals:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error deleting bills", 
      error: error.message 
    });
  }
};



// Get Customer Details by Mobile Number
exports.getCustomerByMobile = async (req, res) => {
  try {
    const { mobileNumber } = req.params; // Get mobile number from request params
    
    // Find the most recent rental entry with this mobile number
    const customer = await Rental.findOne({ mobileNumber }).sort({ createdAt: -1 });
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.status(200).json({
      customerName: customer.customerName,
      address: customer.address,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer details", error: error.message });
  }
};

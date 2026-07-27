const Rental = require("../models/RentalModel");
const Maintenance = require("../models/machineMaintenanceModel");


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
      reminderDate,
      reminderStatus,
      customerMobile,
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
      reminderDate,
      reminderStatus,
      customerMobile,
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

    // Always return an array — never 404 for empty results
    res.status(200).json(rentals || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rentals", error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { _id, id, reminderId, paidAmount, pendingAmount } = req.body;
    const targetId = _id || id || reminderId;

    if (!targetId) {
      return res.status(400).json({ message: "Rental ID is required" });
    }

    const updateFields = { paidAmount, pendingAmount };
    if (Number(pendingAmount) <= 0) {
      updateFields.reminderStatus = "PAID";
    }

    const updatedRental = await Rental.findByIdAndUpdate(
      targetId,
      updateFields,
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

// Edit Rental Entry (Full Update)
exports.editRental = async (req, res) => {
  try {
    const {
      _id,
      customerName,
      mobileNumber,
      address,
      operatorName,
      price,
      quantity,
      paidAmount,
      pendingAmount,
      jobWork,
      reminderDate,
      reminderStatus,
      customerMobile,
    } = req.body;

    if (!_id) {
      return res.status(400).json({ message: "Rental ID is required" });
    }

    const totalAmount = price * quantity;

    const updatedRental = await Rental.findByIdAndUpdate(
      _id,
      {
        customerName,
        mobileNumber,
        address,
        operatorName,
        price,
        quantity,
        totalAmount,
        paidAmount,
        pendingAmount,
        jobWork,
        reminderDate,
        reminderStatus,
        customerMobile,
      },
      { new: true }
    );

    if (!updatedRental) {
      return res.status(404).json({ message: "Rental entry not found" });
    }

    return res.status(200).json({
      message: "Rental updated successfully",
      data: updatedRental,
    });
  } catch (error) {
    console.error("Error editing rental:", error);
    return res.status(500).json({
      message: "Error updating rental",
      error: error.message,
    });
  }
};

// Delete Multiple Rentals (Bills)
exports.deleteMultipleRentals = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No bills selected for deletion" });
    }

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

// Get Customer Details by Mobile Number — scoped to the requesting user
exports.getCustomerByMobile = async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    // uid must be supplied as a query param: /customer/:mobile?uid=xxx
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ message: "uid query parameter is required" });
    }

    // Scope the lookup to THIS user only — prevents cross-user data leaks
    const customer = await Rental.findOne({ mobileNumber, uid }).sort({ createdAt: -1 });

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

// Fetch active pending reminders (status is 'PENDING' and pendingAmount > 0)
exports.getPendingReminders = async (req, res) => {
  try {
    const uid = req.body.uid || req.query.uid;
    if (!uid) {
      return res.status(400).json({ message: "User ID (uid) is required" });
    }

    const reminders = await Rental.find({
      uid,
      reminderStatus: "PENDING",
      pendingAmount: { $gt: 0 },
      reminderDate: { $ne: null }
    }).sort({ reminderDate: 1 });

    res.status(200).json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Error fetching active reminders", error: error.message });
  }
};

// Update just reminderDate or pendingAmount
exports.updateReminderDetails = async (req, res) => {
  try {
    const { _id, reminderDate, pendingAmount } = req.body;
    if (!_id) {
      return res.status(400).json({ message: "Rental ID is required" });
    }

    const updateFields = {};
    if (reminderDate !== undefined) updateFields.reminderDate = reminderDate;
    if (pendingAmount !== undefined) updateFields.pendingAmount = pendingAmount;

    const updatedRental = await Rental.findByIdAndUpdate(
      _id,
      updateFields,
      { new: true }
    );

    if (!updatedRental) {
      return res.status(404).json({ message: "Rental entry not found" });
    }

    res.status(200).json({ message: "Reminder updated successfully", data: updatedRental });
  } catch (error) {
    console.error("Error updating reminder details:", error);
    res.status(500).json({ message: "Error updating reminder details", error: error.message });
  }
};

// Delete a reminder (CANCEL) or mark it as PAID
exports.deleteOrCompleteReminder = async (req, res) => {
  try {
    const { _id, id, action } = req.body;
    const targetId = _id || id;
    if (!targetId) {
      return res.status(400).json({ message: "Rental ID is required" });
    }

    let updatedRental;
    if (action === "PAID" || action === "COMPLETE") {
      const rental = await Rental.findById(targetId);
      if (!rental) {
        return res.status(404).json({ message: "Rental entry not found" });
      }

      const paidAmt = Number(rental.paidAmount) + Number(rental.pendingAmount);
      updatedRental = await Rental.findByIdAndUpdate(
        targetId,
        {
          reminderStatus: "PAID",
          paidAmount: paidAmt,
          pendingAmount: 0
        },
        { new: true }
      );
    } else if (action === "DELETE" || action === "CANCEL") {
      updatedRental = await Rental.findByIdAndUpdate(
        targetId,
        {
          reminderStatus: "CANCELLED",
          reminderDate: null
        },
        { new: true }
      );
    } else {
      return res.status(400).json({ message: "Invalid action. Supported actions are 'PAID', 'DELETE', and 'CANCEL'" });
    }

    res.status(200).json({ message: `Reminder updated successfully`, data: updatedRental });
  } catch (error) {
    console.error("Error performing reminder action:", error);
    res.status(500).json({ message: "Error processing reminder action", error: error.message });
  }
};

// ─── EOD / Business Summary ────────────────────────────────────────────────────
// GET /api/rentals/eod-summary?uid=...&startDate=...&endDate=...
exports.getEODSummary = async (req, res) => {
  try {
    const { uid, startDate, endDate } = req.query;

    if (!uid) {
      return res.status(400).json({ message: "uid is required" });
    }

    // Build a robust UTC date range — always cover the full end-day
    const start = startDate ? new Date(startDate) : new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date(startDate || new Date());
    end.setUTCHours(23, 59, 59, 999);

    // Run both aggregations in parallel for performance
    const [rentalResult, maintenanceResult] = await Promise.all([
      // 1. Sum paidAmount (income) and pendingAmount from Rental collection
      Rental.aggregate([
        {
          $match: {
            uid,
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$paidAmount" },
            totalPending: { $sum: "$pendingAmount" },
            totalBilled: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // 2. Sum expenses from Maintenance collection (type = "expense")
      Maintenance.aggregate([
        {
          $match: {
            uid,
            type: "expense",
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const income = rentalResult[0]?.totalIncome || 0;
    const pending = rentalResult[0]?.totalPending || 0;
    const billed = rentalResult[0]?.totalBilled || 0;
    const count = rentalResult[0]?.count || 0;
    const expenses = maintenanceResult[0]?.totalExpenses || 0;
    const netProfit = income - expenses;

    res.status(200).json({
      totalIncome: income,
      totalPending: pending,
      totalBilled: billed,
      totalExpenses: expenses,
      netProfit,
      entryCount: count,
      dateRange: {
        from: start.toISOString(),
        to: end.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching EOD summary:", error);
    res.status(500).json({ message: "Failed to fetch EOD summary", error: error.message });
  }
};
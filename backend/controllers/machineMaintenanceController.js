const Maintenance = require("../models/machineMaintenanceModel");

// Add a new maintenance entry
exports.addMaintenance = async (req, res) => {
  const { type, amount, description, machineId, uid, date } = req.body;

  try {
    if (!type || !amount || !machineId || !uid) {
      return res.status(400).json({
        success: false,
        message: "type, amount, machineId, and uid are required",
      });
    }

    const newMaintenance = await Maintenance.create({
      type,
      amount,
      description: description || "",
      machineId,
      uid,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Maintenance entry added successfully",
      data: newMaintenance,
    });
  } catch (error) {
    console.error("Error adding maintenance:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get maintenance entries for a specific machine
exports.getMaintenanceByMachine = async (req, res) => {
  const { machineId } = req.params;
  const { type } = req.query;

  try {
    const query = { machineId };

    if (type) query.type = type; // Filter by type (income/expense) if provided

    const maintenanceEntries = await Maintenance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Calculate totals
    const totalIncome = maintenanceEntries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = maintenanceEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      totalIncome,
      totalExpense,
      data: maintenanceEntries,
    });
  } catch (error) {
    console.error("Error fetching maintenance entries:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Get maintenance entries for a specific user
exports.getMaintenanceByUser = async (req, res) => {
  const { uid } = req.params;
  const { page = 1, limit = 10, type } = req.query;

  try {
    const query = { uid };

    if (type) query.type = type; // Filter by type (income/expense) if provided

    const maintenanceEntries = await Maintenance.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Maintenance.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      data: maintenanceEntries,
    });
  } catch (error) {
    console.error("Error fetching maintenance entries for user:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// Delete a maintenance entry
exports.deleteMaintenanceEntry = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Maintenance.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Entry deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting maintenance entry:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

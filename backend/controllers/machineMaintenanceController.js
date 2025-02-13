const Maintenance = require("../models/machineMaintenanceModel");
const Machine = require("../models/machineMaintenanceModel"); // Machine model for aggregation

// Add a new maintenance entry
exports.addMaintenance = async (req, res) => {
  const { type, amount, description, machineId, uid } = req.body;

  try {
    const newMaintenance = await Maintenance.create({
      type,
      amount,
      description,
      machineId,
      uid,
    });

    res.status(201).json({
      success: true,
      message: "Maintenance entry added successfully",
      data: newMaintenance,
    });
  } catch (error) {
    console.error("Error adding maintenance:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Get merged machine and maintenance entries
exports.getMachinesWithMaintenance = async (req, res) => {
  const { uid } = req.params;

  try {
    const machines = await Machine.aggregate([
      { $match: { uid: uid } }, // Filter machines by user ID
      {
        $lookup: {
          from: "maintenances", // The maintenance collection
          localField: "_id", // Machine ID
          foreignField: "machineId", // Matching field in maintenance
          as: "maintenanceEntries", // Name of the new field with merged data
        },
      },
      {
        $addFields: {
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$maintenanceEntries.type", "income"] }, "$maintenanceEntries.amount", 0],
            },
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ["$maintenanceEntries.type", "expense"] }, "$maintenanceEntries.amount", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          Machine_name: 1,
          totalIncome: 1,
          totalExpenses: 1,
          profitOrLoss: { $subtract: ["$totalIncome", "$totalExpenses"] },
          maintenanceEntries: 1, // Include the merged maintenance entries
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: machines,
    });
  } catch (error) {
    console.error("Error fetching machines with maintenance:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Get maintenance entries for a specific machine
exports.getMaintenanceByMachine = async (req, res) => {
  const { machineId } = req.params;
  const { page = 1, limit = 10, type } = req.query;

  try {
    const query = { machineId };

    if (type) query.type = type; // Filter by type (income/expense) if provided

    const maintenanceEntries = await Maintenance.find(query)
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
    console.error("Error fetching maintenance entries:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
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
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

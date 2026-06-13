const Machine = require("../models/machineShowModel");

const getAllMachines = async (req, res) => {
  const { uid } = req.body; // Extract uid from the request body

  try {
    // Build filter: default to active-only, allow ?includeArchived=true for P&L pages
    const filter = { uid };
    if (req.query.includeArchived !== 'true') {
      filter.isActive = { $ne: false };
    }

    // Query the database for machines with the given uid
    const machines = await Machine.find(filter); 
    if (!machines || machines.length === 0) {
      return res.status(404).json({ message: "No machines found for this UID" });
    }

    res.status(200).json(machines); // Send machines as a response
  } catch (err) {
    console.error("Error fetching machines:", err);
    res.status(500).json({ message: "Error fetching machines", error: err.message });
  }
};

module.exports = { getAllMachines };
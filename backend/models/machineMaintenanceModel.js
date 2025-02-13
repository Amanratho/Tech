const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["income", "expense"] }, // Specifies whether it's income or expense
  amount: { type: Number, required: true }, // The amount of income or expense
  description: { type: String, maxlength: 255 }, // Optional description
  date: { type: Date, default: Date.now }, // Date of the entry
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true }, // Reference to the machine
  uid: { type: String, required: true }, // User ID for authorization and filtering
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);
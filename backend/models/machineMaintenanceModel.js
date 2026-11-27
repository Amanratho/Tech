const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["income", "expense"] }, // Specifies whether it's income or expense
  amount: { type: Number, required: true }, // The amount of income or expense
  description: { type: String, maxlength: 255 }, // Optional description
  date: { type: Date, default: Date.now }, // Date of the entry
  machineId: { type: String, required: true }, // Machine ID string (matches Machine_id in machineRegModel)
  uid: { type: String, required: true }, // User ID for authorization and filtering
  createdAt: { type: Date, default: Date.now }, // Timestamp for sorting
});

// Performance Indexes
maintenanceSchema.index({ uid: 1, machineId: 1 });
maintenanceSchema.index({ uid: 1, date: -1 });

module.exports = mongoose.model("Maintenance", maintenanceSchema);
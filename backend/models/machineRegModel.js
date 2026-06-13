const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema({
  Machine_id: { type: String, required: true, unique: true },
  Machine_name: { type: String, required: true, maxlength: 50 },
  RentType: { type: String, required: true },
  image: { type: String, required: true },
  uid: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Machine", machineSchema)
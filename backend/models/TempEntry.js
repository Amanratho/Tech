const mongoose = require("mongoose");

const tempEntrySchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  type: { type: String, enum: ['TIME', 'COUNT', 'DISTANCE'], required: true },
  status: { type: String, enum: ['RUNNING', 'STOPPED'], default: 'RUNNING' },
  startTime: { type: Date },
  stopTime: { type: Date },
  currentValue: { type: Number, default: 0 }, // For manual count or distance
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TempEntry", tempEntrySchema);
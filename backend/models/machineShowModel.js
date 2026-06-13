const mongoose = require("mongoose");

const machineShowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  Renttype: {
    type: String,
    required: true,
  },
  rentalPrice: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  uid: { 
    type: String, required: true 
  },
  isActive: { type: Boolean, default: true },
  archivedAt: { type: Date, default: null },
});

module.exports = mongoose.model("machine", machineShowSchema);

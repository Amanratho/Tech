const mongoose = require("mongoose");

// Rental Schema definition
const RentalSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  rentType: { type: String, required: true },
  address: { type: String },
  operatorName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  pendingAmount: { type: Number, required: true },
  uid: { type: String, required: true, },
  machineId: { type: String, required: true,  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Rental Model
const Rental = mongoose.models.Rental || mongoose.model("Rental", RentalSchema);

module.exports = Rental;
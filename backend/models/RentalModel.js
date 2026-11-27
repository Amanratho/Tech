const mongoose = require("mongoose");

// Rental Schema definition
const RentalSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  rentType: { type: String, required: true },
  address: { type: String },
  operatorName: { type: String, required: true },
  jobWork: { type: String, required: false },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  pendingAmount: { type: Number, default: 0 },
  reminderDate: { type: Date },
  reminderStatus: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' },
  customerMobile: { type: String },
  uid: { type: String, required: true, },
  machineId: { type: String, required: true,  },
  isEdited: { type: Boolean, default: false },
  editCount: { type: Number, default: 0 },
  updatedAt: { type: Date },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Performance Indexes: Prevents full-collection scans (COLLSCAN)
RentalSchema.index({ uid: 1, createdAt: -1 });
RentalSchema.index({ uid: 1, machineId: 1 });
RentalSchema.index({ mobileNumber: 1, uid: 1 });
RentalSchema.index({ uid: 1, reminderStatus: 1 });
RentalSchema.index({ reminderDate: 1, reminderStatus: 1 });

// Rental Model
const Rental = mongoose.models.Rental || mongoose.model("Rental", RentalSchema);

module.exports = Rental;
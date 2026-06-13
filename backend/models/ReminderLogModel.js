const mongoose = require("mongoose");

/**
 * ReminderLog — Idempotency Guard
 *
 * Each document records that a specific Rental's reminder was already
 * processed on a given calendar date. Before sending any notification,
 * the reminder service checks for an existing log entry. This makes
 * the endpoint safe to call multiple times per day without sending
 * duplicate messages.
 */
const ReminderLogSchema = new mongoose.Schema({
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Rental",
    required: true,
  },
  // Stored as "YYYY-MM-DD" string for easy date-only comparison
  sentDate: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index — one log per rental per calendar day
ReminderLogSchema.index({ rentalId: 1, sentDate: 1 }, { unique: true });

const ReminderLog =
  mongoose.models.ReminderLog ||
  mongoose.model("ReminderLog", ReminderLogSchema);

module.exports = ReminderLog;

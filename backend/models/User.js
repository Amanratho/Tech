const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: false },
    email: {
      type: String,
      default: function () {
        return `${this.mobileNo || Date.now()}@rentveda.app`;
      },
    },
    mobileNo: { type: String, required: true },
    password: { type: String },
    companyName: { type: String },
    uid: { type: String, required: true, unique: true },
    qrCodeUrl: { type: String },

    // Subscription & Plan Status
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "expired", "grace_period"],
      default: "trial",
    },
    subscriptionPlan: {
      type: String,
      default: "free_trial", // 'free_trial', 'monthly', 'quarterly', 'yearly', 'lifetime'
    },
    trialStartDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Default 90 days (3 months) free trial
    },

    // Account Access Control
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: "",
    },

    // Manual Payment & WhatsApp Support Fallback
    paymentWhatsappNumber: {
      type: String,
      default: "",
    },
    upiId: {
      type: String,
      default: "",
    },
    renewalAmount: {
      type: Number,
      default: 0,
    },

    // Broadcast Announcement & In-App Popups
    announcement: {
      type: String,
      default: "", // e.g. "Special 3 months free trial active!"
    },
    showAnnouncementPopup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model.User || mongoose.model("User", userSchema);

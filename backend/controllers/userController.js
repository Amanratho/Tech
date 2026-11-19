const User = require("../models/User");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const admin = require("../config/firebase");

// @desc    Get user profile by UID (including subscription status and daysLeft)
// @route   GET /api/users/:uid
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();

    // Auto-migrate older user documents without subscription dates
    if (!user.subscriptionEndsAt) {
      const trialDays = 90;
      const trialEndDate = new Date(
        user.createdAt
          ? user.createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000
          : Date.now() + trialDays * 24 * 60 * 60 * 1000
      );
      user.subscriptionStatus = user.subscriptionStatus || "trial";
      user.subscriptionPlan = user.subscriptionPlan || "free_trial";
      user.trialStartDate = user.trialStartDate || user.createdAt || now;
      user.subscriptionEndsAt = trialEndDate;
      await user.save();
    }

    // Auto-update expired status if trial has lapsed
    if (
      user.subscriptionStatus === "trial" &&
      user.subscriptionEndsAt &&
      new Date(user.subscriptionEndsAt) < now
    ) {
      user.subscriptionStatus = "expired";
      await user.save();
    }

    const userData = user.toObject();

    // Calculate days left in subscription / trial
    if (user.subscriptionEndsAt) {
      const diffTime = new Date(user.subscriptionEndsAt).getTime() - now.getTime();
      userData.daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      userData.daysLeft = 90;
    }

    // Flag whether user has set a password (without exposing the hash)
    userData.hasPassword = !!user.password;
    delete userData.password;

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile by UID
// @route   PUT /api/users/:uid
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, mobileNo, companyName, password } = req.body;
    user.username = username || user.username;
    user.mobileNo = mobileNo || user.mobileNo;
    user.companyName = companyName || user.companyName;

    // Optional: Set or update password from profile
    if (password && password.trim().length >= 4) {
      user.password = await bcrypt.hash(password.trim(), 10);
      try {
        await admin.auth().updateUser(user.uid, {
          password: password.trim(),
        });
      } catch (fbErr) {
        console.log("Firebase auth password update notice:", fbErr.message);
      }
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      const qrImageUrl = uploadResult.secure_url;
      user.qrCodeUrl = qrImageUrl;

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    const updatedUser = await user.save();
    const returnUser = updatedUser.toObject();
    returnUser.hasPassword = !!updatedUser.password;
    delete returnUser.password;

    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: returnUser,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// @desc    Update user subscription / plan / status / announcements
// @route   PUT /api/users/subscription/:uid
// @access  Admin / Private
const updateUserSubscription = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      subscriptionStatus,
      subscriptionPlan,
      subscriptionEndsAt,
      extendDays,
      isBlocked,
      blockReason,
      paymentWhatsappNumber,
      upiId,
      renewalAmount,
      announcement,
      showAnnouncementPopup,
    } = req.body;

    if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionPlan !== undefined) user.subscriptionPlan = subscriptionPlan;
    if (subscriptionEndsAt !== undefined) user.subscriptionEndsAt = new Date(subscriptionEndsAt);

    // If extending days (e.g. after receiving payment)
    if (extendDays !== undefined && !isNaN(extendDays)) {
      const baseDate =
        user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > new Date()
          ? new Date(user.subscriptionEndsAt)
          : new Date();
      baseDate.setDate(baseDate.getDate() + Number(extendDays));
      user.subscriptionEndsAt = baseDate;
      user.subscriptionStatus = "active";
    }

    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    if (blockReason !== undefined) user.blockReason = blockReason;
    if (paymentWhatsappNumber !== undefined) user.paymentWhatsappNumber = paymentWhatsappNumber;
    if (upiId !== undefined) user.upiId = upiId;
    if (renewalAmount !== undefined) user.renewalAmount = renewalAmount;
    if (announcement !== undefined) user.announcement = announcement;
    if (showAnnouncementPopup !== undefined) user.showAnnouncementPopup = showAnnouncementPopup;

    const savedUser = await user.save();
    res.json({
      success: true,
      message: "Subscription updated successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subscription",
      error: error.message,
    });
  }
};

// @desc    Delete user profile by UID
// @route   DELETE /api/users/:uid
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.deleteOne({ uid: req.params.uid });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update FCM Token for Push Notifications
// @route   PUT /api/users/fcm-token
// @access  Private
const updateFcmToken = async (req, res) => {
  try {
    const { uid, fcmToken } = req.body;
    const targetUid = uid || req.params.uid;

    if (!targetUid || !fcmToken) {
      return res.status(400).json({ success: false, message: "UID and fcmToken are required" });
    }

    const user = await User.findOne({ uid: targetUid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.fcmToken = fcmToken;
    if (!user.fcmTokens) user.fcmTokens = [];
    if (!user.fcmTokens.includes(fcmToken)) {
      user.fcmTokens.push(fcmToken);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update FCM token",
      error: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserSubscription,
  deleteUserProfile,
  updateFcmToken,
};

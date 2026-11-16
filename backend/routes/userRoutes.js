const express = require("express");
const { upload } = require("../middlewares/uploadMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  updateUserSubscription,
  deleteUserProfile,
  updateFcmToken,
} = require("../controllers/userController");

const router = express.Router();

// Update FCM Token for Push Notifications
router.put("/fcm-token", updateFcmToken);
router.put("/fcm-token/:uid", updateFcmToken);

// Get user profile by UID
router.get("/:uid", getUserProfile);

// Update user profile by UID (with QR code upload)
router.put("/:uid", upload.single("qrImage"), updateUserProfile);

// Update user subscription / status / manual payment / block by UID
router.put("/subscription/:uid", updateUserSubscription);

// Delete user profile by UID
router.delete("/delete/:uid", deleteUserProfile);

module.exports = router;

const express = require("express");
const { upload } = require("../middlewares/uploadMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  updateUserSubscription,
  deleteUserProfile,
} = require("../controllers/userController");

const router = express.Router();

// Get user profile by UID
router.get("/:uid", getUserProfile);

// Update user profile by UID (with QR code upload)
router.put("/:uid", upload.single("qrImage"), updateUserProfile);

// Update user subscription / status / manual payment / block by UID
router.put("/subscription/:uid", updateUserSubscription);

// Delete user profile by UID
router.delete("/delete/:uid", deleteUserProfile);

module.exports = router;

const express = require("express");
const fs = require("fs");
const { upload, cloudinary } = require("../middlewares/uploadMiddleware"); 
const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} = require("../controllers/userController");

const router = express.Router();

// Get user profile by UID
router.get("/:uid", getUserProfile);

// Update user profile by UID (with QR code upload)
router.put("/:uid", upload.single("qrImage"), updateUserProfile);

// Delete user profile by UID
router.delete("/delete/:uid", deleteUserProfile);

module.exports = router;

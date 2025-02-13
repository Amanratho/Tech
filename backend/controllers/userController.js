const User = require("../models/User");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

// @desc    Get user profile by UID
// @route   GET /api/users/:uid
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
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

    const { username, mobileNo, companyName } = req.body;
    user.username = username || user.username;
    // user.email = email || user.email;
    user.mobileNo = mobileNo || user.mobileNo;
    user.companyName = companyName || user.companyName;

    // Handle QR Code Upload
    if (req.file) {
      // Upload QR code to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      const qrImageUrl = uploadResult.secure_url;

      // Save QR Code URL to user profile
      user.qrCodeUrl = qrImageUrl;

      // Delete the uploaded file from the local filesystem
      fs.unlinkSync(req.file.path);
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: updatedUser,
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

// @desc    Delete user profile by UID
// @route   DELETE /api/users/:uid
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};

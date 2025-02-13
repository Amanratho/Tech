const express = require("express");
const { sendOtp, verifyOtp, sendContactEmail } = require("../controllers/otpController");

const router = express.Router();

// Route to send OTP
router.post("/send-otp", sendOtp);

// Route to verify OTP
router.post("/verify-otp", verifyOtp);

router.post("/contact", sendContactEmail);

module.exports = router;
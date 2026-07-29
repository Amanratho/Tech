const otpGenerator = require("otp-generator");

// In-memory storage for OTPs
const otpStore = {};

// Google Apps Script Web App URL for sending emails via HTTP
const GAS_MAIL_URL = "https://script.google.com/macros/s/AKfycbyr1zQJPjVQ_01WLGXGOXelFheNOF-Yv5uaQ-dfWSZ8KLspTwvqF5ynjv-wKPthMky_2w/exec";

// Helper function to send email via GAS
async function sendEmailViaGAS(to, subject, text) {
  const response = await fetch(GAS_MAIL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, text }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Failed to send email via Apps Script");
  }
  return result;
}

// Controller to send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate a 6-digit OTP
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
  });

  // Store OTP in memory with an expiration time
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiration

  try {
    // Send OTP to the user's email via GAS HTTP API (bypasses Render SMTP block)
    await sendEmailViaGAS(
      email,
      "Your OTP Code",
      ` Your OTP code is ${otp}. It will expire in 5 minutes.`
    );

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ 
      error: "Failed to send OTP", 
      details: error.message 
    });
  }
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const storedOtp = otpStore[email];

  if (!storedOtp) {
    return res.status(400).json({ error: "No OTP found for this email" });
  }

  // Check if OTP matches and is not expired
  if (storedOtp.otp === otp && Date.now() < storedOtp.expiresAt) {
    delete otpStore[email]; // Invalidate OTP after successful verification
    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
};

exports.sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Determine where to send the contact email
    const supportEmail = process.env.EMAIL_USER || process.env.GMAIL_USER || "rentvedasupport@gmail.com";
    
    // Send email via GAS HTTP API
    await sendEmailViaGAS(
      supportEmail,
      `New Contact Message from ${name}`,
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

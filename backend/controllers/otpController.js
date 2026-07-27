const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// In-memory storage for OTPs
const otpStore = {};

// Configure Nodemailer transporter using Environment Variables
const EMAIL_USER = (process.env.EMAIL_USER || process.env.GMAIL_USER || "rentvedasupport@gmail.com").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || process.env.GMAIL_PASS || "").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

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
    // Send OTP to the user's email
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: ` Your OTP code is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
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
    // Email options
    const mailOptions = {
      from: email,
      to: EMAIL_USER,
      subject: ` New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};

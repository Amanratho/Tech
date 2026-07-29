const otpGenerator = require("otp-generator");

// In-memory storage for OTPs
const otpStore = {};

// Google Apps Script Web App URL for sending emails via HTTP
const GAS_MAIL_URL = "https://script.google.com/macros/s/AKfycbyr1zQJPjVQ_01WLGXGOXelFheNOF-Yv5uaQ-dfWSZ8KLspTwvqF5ynjv-wKPthMky_2w/exec";

async function sendEmailViaGAS(to, subject, text) {
  const response = await fetch(GAS_MAIL_URL, {
    method: "POST",
    body: JSON.stringify({ to, subject, text }),
  });
  
  const responseText = await response.text();
  try {
    const result = JSON.parse(responseText);
    if (!result.success) {
      throw new Error(result.error || "Failed to send email via Apps Script");
    }
    return result;
  } catch (err) {
    console.error("GAS returned HTML instead of JSON:", responseText.substring(0, 200));
    throw new Error("GAS API Error: " + responseText.substring(0, 100));
  }
}

// Controller to send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Generate a 4-digit OTP
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false,
  });

  // Store OTP in memory with an expiration time
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes expiration

  try {
    // HTML Template for OTP Email
    const emailHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #e2e2e2;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #fbc02d; margin: 0; font-size: 28px; font-weight: 700;">RentVeda</h1>
          <p style="color: #5f5e5e; font-size: 14px; margin-top: 5px;">Your Trusted Rental Partner</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #1a1c1c; font-size: 20px; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #474746; font-size: 15px; line-height: 1.5;">Hello,</p>
          <p style="color: #474746; font-size: 15px; line-height: 1.5;">Please use the following OTP to complete your verification process. This OTP is valid for <strong>5 minutes</strong>.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <div style="display: inline-block; background-color: #fff9e6; border: 2px dashed #fbc02d; padding: 15px 30px; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; color: #795900; letter-spacing: 5px;">${otp}</span>
            </div>
          </div>
          
          <p style="color: #474746; font-size: 15px; line-height: 1.5;">If you didn't request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="color: #636262; font-size: 12px; text-align: center; margin: 0;">&copy; ${new Date().getFullYear()} RentVeda. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send OTP to the user's email via GAS HTTP API
    await sendEmailViaGAS(
      email,
      "Your RentVeda Verification Code",
      emailHtml
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

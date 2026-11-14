const { verify } = require("crypto");
const admin = require("../config/firebase");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const { deleteUserAccount } = require("../services/deleteAccountService");
const firebaseAdmin = require("../config/firebase");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const signup = async (req, res) => {
  const { email } = req.body;

  // OTP send request
  try {
    await sendOtp({ body: { email } }); // Send OTP first
    res.status(200).json({ message: "OTP sent successfully, please verify." });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

const completeSignup = async (req, res) => {
  const { email, password, username, mobileNo, companyName } = req.body;

  // const userRecord = await admin.auth().getUserByEmail(email);
  //     if (userRecord) {
  //       return res
  //         .status(404)
  //         .json({ success: false, error: " This Email is already in use" });
  //     }

  try {
    // Create the user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username, // You can use displayName for the username
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Default 90-day (3 months) free trial
    const trialDays = 90;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Save the user data to MongoDB
    const newUser = new User({
      username,
      email,
      mobileNo,
      companyName,
      // password: hashedPassword,
      uid: userRecord.uid, // Firebase uid
      subscriptionStatus: "trial",
      subscriptionPlan: "free_trial",
      trialStartDate: new Date(),
      subscriptionEndsAt: trialEndDate,
      isBlocked: false,
      blockReason: "",
      paymentWhatsappNumber: process.env.SUPPORT_WHATSAPP || "",
      upiId: process.env.SUPPORT_UPI || "",
      renewalAmount: 0,
      announcement: "Welcome to RentVeda! 90-day free trial active.",
      showAnnouncementPopup: false,
    });

    await newUser.save();

    const token = createToken(newUser._id); // Assuming createToken is a function you have to generate JWT

    res.status(201).json({
      success: true,
      token,
      message: "User successfully created",
      registeredUser: newUser,
    });
  } catch (error) {
    console.error("Error during complete signup:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while completing signup",
    });
  }
};

const login = async (req, res) => {
  const { idToken } = req.body; // Get idToken from frontend

  try {
    // Verify the ID token sent by the client (Firebase authentication)
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid; // Extract UID

    // Find user in MongoDB using Firebase UID
    const dbUser = await User.findOne({ uid });
    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, error: "User not found in database" });
    }

    // Check if user is blocked
    if (dbUser.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        error:
          dbUser.blockReason ||
          "Your account has been suspended. Please contact support.",
      });
    }

    const now = new Date();

    // Auto-migrate older user documents without subscription dates
    if (!dbUser.subscriptionEndsAt) {
      const trialDays = 90;
      const trialEndDate = new Date(
        dbUser.createdAt
          ? dbUser.createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000
          : Date.now() + trialDays * 24 * 60 * 60 * 1000
      );
      dbUser.subscriptionStatus = dbUser.subscriptionStatus || "trial";
      dbUser.subscriptionPlan = dbUser.subscriptionPlan || "free_trial";
      dbUser.trialStartDate = dbUser.trialStartDate || dbUser.createdAt || now;
      dbUser.subscriptionEndsAt = trialEndDate;
      await dbUser.save();
    }

    // Auto-update expired status if trial has lapsed
    if (
      dbUser.subscriptionStatus === "trial" &&
      dbUser.subscriptionEndsAt &&
      new Date(dbUser.subscriptionEndsAt) < now
    ) {
      dbUser.subscriptionStatus = "expired";
      await dbUser.save();
    }

    const userObj = dbUser.toObject();
    if (dbUser.subscriptionEndsAt) {
      const diffTime =
        new Date(dbUser.subscriptionEndsAt).getTime() - now.getTime();
      userObj.daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      userObj.daysLeft = 90;
    }

    // Generate token (if using JWT for additional security)
    const token = createToken(dbUser._id);

    return res.status(200).json({
      success: true,
      token,
      message: "Login successful",
      user: userObj, // Send user data back to frontend
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }

    await deleteUserAccount(uid);
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    await firebaseAdmin.auth().generatePasswordResetLink(email);
    res.status(200).send("Password reset email sent.");
  } catch (error) {
    res.status(500).send("Error sending reset email: " + error.message);
  }
};



const verifyUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required." });
    }

    // Call a service or use logic to verify the idToken
    const verificationResult = await auth.verifyIdToken(idToken);

    if (verificationResult.valid) {
      return res.status(200).json({ message: "Token verified successfully." });
    } else {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  signup,
  login,
  verifyUser,
  completeSignup,
  deleteAccount,
  sendPasswordResetEmail,
};
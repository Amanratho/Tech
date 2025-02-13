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

    // Save the user data to MongoDB
    const newUser = new User({
      username,
      email,
      mobileNo,
      companyName,
      // password: hashedPassword,
      uid: userRecord.uid, // Firebase uid
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

    // Generate token (if using JWT for additional security)
    const token = createToken(dbUser._id);

    return res.status(200).json({
      success: true,
      token,
      message: "Login successful",
      user: dbUser, // Send user data back to frontend
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
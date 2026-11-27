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

    // Default 30-day (1 month) welcome bonus
    const trialDays = 30;
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
      subscriptionPlan: "welcome_bonus_30",
      trialStartDate: new Date(),
      subscriptionEndsAt: trialEndDate,
      isBlocked: false,
      blockReason: "",
      paymentWhatsappNumber: process.env.SUPPORT_WHATSAPP || "",
      upiId: process.env.SUPPORT_UPI || "",
      renewalAmount: 30,
      announcement: "बधाई हो! आपको ₹30 का वेलकम बोनस मिला है (1 महीना वैलिड)।",
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
      const trialDays = 30;
      const trialEndDate = new Date(
        dbUser.createdAt
          ? dbUser.createdAt.getTime() + trialDays * 24 * 60 * 60 * 1000
          : Date.now() + trialDays * 24 * 60 * 60 * 1000
      );
      dbUser.subscriptionStatus = dbUser.subscriptionStatus || "trial";
      dbUser.subscriptionPlan = dbUser.subscriptionPlan || "welcome_bonus_30";
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
      userObj.daysLeft = 30;
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

const phoneLogin = async (req, res) => {
  const { mobileNo, otp, password } = req.body;
  const cleanMobile = (mobileNo || "").toString().trim();

  if (!cleanMobile) {
    return res
      .status(400)
      .json({ success: false, error: "Mobile number is required" });
  }

  try {
    // 1. Check if user exists in database
    let dbUser = await User.findOne({ mobileNo: cleanMobile });

    // Auto-create Demo User for Google Review / Local Testing if not yet in DB
    if (
      !dbUser &&
      (cleanMobile === "9876543210" || cleanMobile === "9999999999")
    ) {
      const demoEmail = `${cleanMobile}@rentveda.app`;
      let firebaseUid = `demo_${cleanMobile}`;
      try {
        const fbUser = await admin.auth().getUserByEmail(demoEmail);
        firebaseUid = fbUser.uid;
      } catch (_) {
        try {
          const newFbUser = await admin.auth().createUser({
            email: demoEmail,
            displayName: "Demo User",
            password: "RentVeda@123",
          });
          firebaseUid = newFbUser.uid;
        } catch (fbErr) {
          console.log("Firebase demo user create info:", fbErr.message);
        }
      }

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 90);

      dbUser = new User({
        username: "Demo User",
        email: demoEmail,
        mobileNo: cleanMobile,
        companyName: "RentVeda Demo",
        uid: firebaseUid,
        subscriptionStatus: "trial",
        subscriptionPlan: "free_trial",
        trialStartDate: new Date(),
        subscriptionEndsAt: trialEndDate,
        isBlocked: false,
      });
      await dbUser.save();
    }

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        error:
          "No account found with this mobile number. Please create an account.",
      });
    }

    // Check if blocked
    if (dbUser.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        error:
          dbUser.blockReason ||
          "Your account has been suspended. Please contact support.",
      });
    }

    // 2. Validate Credentials: Password OR OTP
    let isValid = false;
    if (password) {
      if (dbUser.password) {
        isValid = await bcrypt.compare(password, dbUser.password);
      } else {
        isValid = password === "RentVeda@123";
      }
      if (!isValid) {
        return res
          .status(400)
          .json({ success: false, error: "Incorrect password" });
      }
    } else if (otp) {
      isValid = true;
    } else {
      return res
        .status(400)
        .json({ success: false, error: "Either OTP or Password is required" });
    }

    // 3. Prepare User Object
    const now = new Date();
    if (!dbUser.subscriptionEndsAt) {
      const trialDays = 30;
      const trialEndDate = new Date(
        Date.now() + trialDays * 24 * 60 * 60 * 1000
      );
      dbUser.subscriptionStatus = "trial";
      dbUser.subscriptionPlan = "welcome_bonus_30";
      dbUser.trialStartDate = dbUser.createdAt || now;
      dbUser.subscriptionEndsAt = trialEndDate;
      await dbUser.save();
    }

    const userObj = dbUser.toObject();
    if (dbUser.subscriptionEndsAt) {
      const diffTime =
        new Date(dbUser.subscriptionEndsAt).getTime() - now.getTime();
      userObj.daysLeft = Math.max(
        0,
        Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      );
    } else {
      userObj.daysLeft = 30;
    }

    const adminMobiles = ["9109124564", "9876543210"];
    const adminEmails = ["amanrathod407@gmail.com"];
    const isAdmin =
      dbUser.role === "admin" ||
      adminMobiles.includes(dbUser.mobileNo) ||
      adminEmails.includes((dbUser.email || "").toLowerCase());
    userObj.isAdmin = isAdmin;
    if (isAdmin && dbUser.role !== "admin") {
      dbUser.role = "admin";
      await dbUser.save();
    }

    const token = createToken(dbUser._id);
    let customToken = null;
    try {
      customToken = await admin.auth().createCustomToken(dbUser.uid);
    } catch (tokenErr) {
      console.error("Firebase custom token error:", tokenErr.message);
    }

    return res.status(200).json({
      success: true,
      token,
      customToken,
      message: "Login successful",
      user: userObj,
    });
  } catch (error) {
    console.error("Phone login error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Login failed" });
  }
};

const phoneSignup = async (req, res) => {
  const { mobileNo, username, companyName, password } = req.body;
  const cleanMobile = (mobileNo || "").toString().trim();

  if (!cleanMobile || !username) {
    return res
      .status(400)
      .json({ success: false, error: "Mobile number and name are required" });
  }

  try {
    // Check if user already exists
    const existing = await User.findOne({ mobileNo: cleanMobile });
    if (existing) {
      return res.status(400).json({
        success: false,
        alreadyExists: true,
        error:
          "An account already exists with this mobile number. Please login.",
      });
    }

    // Generate internal email for Firebase
    const internalEmail = `${cleanMobile}@rentveda.app`;
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(internalEmail);
    } catch (_) {
      userRecord = await admin.auth().createUser({
        email: internalEmail,
        displayName: username,
        password: password || "RentVeda@123",
      });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const trialDays = 30;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    const newUser = new User({
      username,
      email: internalEmail,
      mobileNo: cleanMobile,
      password: hashedPassword,
      companyName: companyName || "",
      uid: userRecord.uid,
      subscriptionStatus: "trial",
      subscriptionPlan: "welcome_bonus_30",
      trialStartDate: new Date(),
      subscriptionEndsAt: trialEndDate,
      isBlocked: false,
      renewalAmount: 30,
      announcement: "बधाई हो! आपको ₹30 का वेलकम बोनस मिला है (1 महीना वैलिड)।",
      showAnnouncementPopup: false,
    });

    await newUser.save();

    const token = createToken(newUser._id);
    let customToken = null;
    try {
      customToken = await admin.auth().createCustomToken(newUser.uid);
    } catch (tErr) {
      console.error("Firebase custom token error:", tErr.message);
    }

    const userObj = newUser.toObject();
    userObj.daysLeft = 30;

    return res.status(201).json({
      success: true,
      token,
      customToken,
      message: "Account successfully created",
      user: userObj,
      registeredUser: newUser,
    });
  } catch (error) {
    console.error("Phone signup error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to create account",
    });
  }
};

const phoneEmailLogin = async (req, res) => {
  const { user_json_url, accessToken, access_token } = req.body;
  const token = accessToken || access_token;
  let countryCode = "+91";
  let mobileNo = "";
  let firstName = "";
  let lastName = "";

  try {
    if (user_json_url) {
      const resp = await fetch(user_json_url);
      if (!resp.ok) {
        return res
          .status(400)
          .json({ success: false, error: "Failed to fetch verified data from Phone.Email" });
      }
      const data = await resp.json();
      countryCode = data.user_country_code || "+91";
      mobileNo = (data.user_phone_number || "").toString().trim();
      firstName = data.user_first_name || "";
      lastName = data.user_last_name || "";
    } else if (token) {
      const clientId = process.env.PHONE_EMAIL_CLIENT_ID || "17256383996208663558";
      const params = new URLSearchParams();
      params.append("access_token", token);
      params.append("client_id", clientId);
      const resp = await fetch("https://eapi.phone.email/getuser", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await resp.json();
      if (data.status !== 200) {
        return res
          .status(400)
          .json({ success: false, error: data.message || "Invalid or expired Phone.Email token" });
      }
      countryCode = data.country_code || "+91";
      mobileNo = (data.phone_no || "").toString().trim();
      firstName = data.first_name || "";
      lastName = data.last_name || "";
    } else {
      return res
        .status(400)
        .json({ success: false, error: "user_json_url or accessToken is required" });
    }

    // Clean mobile number (keep 10 digits for Indian numbers)
    let cleanMobile = mobileNo.replace(/\D/g, "");
    if (cleanMobile.length > 10 && cleanMobile.startsWith("91")) {
      cleanMobile = cleanMobile.slice(2);
    }

    if (!cleanMobile) {
      return res
        .status(400)
        .json({ success: false, error: "Valid mobile number could not be extracted" });
    }

    // Check if user already exists
    let user = await User.findOne({ mobileNo: cleanMobile });
    const now = new Date();
    const trialDays = 30; // 30 days ₹30 Welcome Bonus
    const trialEndDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    if (!user) {
      // Auto-create new user account with ₹30 Welcome Bonus (1 Month)
      const displayName =
        [firstName, lastName].filter(Boolean).join(" ").trim() ||
        `User_${cleanMobile.slice(-4)}`;
      const internalEmail = `${cleanMobile}@rentveda.app`;
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(internalEmail);
      } catch (_) {
        userRecord = await admin.auth().createUser({
          email: internalEmail,
          displayName,
          password: "RentVeda@123",
        });
      }

      user = new User({
        username: displayName,
        email: internalEmail,
        mobileNo: cleanMobile,
        uid: userRecord.uid,
        subscriptionStatus: "trial",
        subscriptionPlan: "welcome_bonus_30",
        trialStartDate: now,
        subscriptionEndsAt: trialEndDate,
        isBlocked: false,
        renewalAmount: 30,
        announcement: "बधाई हो! आपको ₹30 का वेलकम बोनस मिला है (1 महीना वैलिड)।",
        showAnnouncementPopup: true,
      });

      await user.save();
    } else {
      // If user exists but missing subscriptionEndsAt
      if (!user.subscriptionEndsAt) {
        user.subscriptionStatus = "trial";
        user.subscriptionPlan = "welcome_bonus_30";
        user.trialStartDate = user.createdAt || now;
        user.subscriptionEndsAt = trialEndDate;
        await user.save();
      }
    }

    // Check block status
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        isBlocked: true,
        error: user.blockReason || "Aapka account admin dwara block kar diya gaya hai.",
      });
    }

    const userObj = user.toObject();
    if (user.subscriptionEndsAt) {
      const diffTime = new Date(user.subscriptionEndsAt).getTime() - now.getTime();
      userObj.daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } else {
      userObj.daysLeft = 30;
    }

    const adminMobiles = ["9109124564", "9876543210"];
    const adminEmails = ["amanrathod407@gmail.com"];
    const isAdmin =
      user.role === "admin" ||
      adminMobiles.includes(user.mobileNo) ||
      adminEmails.includes((user.email || "").toLowerCase());
    userObj.isAdmin = isAdmin;

    const token = createToken(user._id);
    let customToken = null;
    try {
      customToken = await admin.auth().createCustomToken(user.uid);
    } catch (tokenErr) {
      console.error("Firebase custom token error:", tokenErr.message);
    }

    return res.status(200).json({
      success: true,
      token,
      customToken,
      message: "Phone verified and logged in successfully",
      user: userObj,
    });
  } catch (error) {
    console.error("Phone.Email login error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Authentication failed" });
  }
};

module.exports = {
  signup,
  login,
  phoneLogin,
  phoneSignup,
  phoneEmailLogin,
  verifyUser,
  completeSignup,
  deleteAccount,
  sendPasswordResetEmail,
};
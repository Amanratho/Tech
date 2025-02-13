const express = require("express");
const admin = require("../config/firebase");
const {login, verifyUser, completeSignup, signup, deleteAccount,sendPasswordResetEmail} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify", verifyUser);
router.post("/complete-signup", completeSignup);
router.delete("/delete/:uid", deleteAccount);
router.post('/send-password-reset', sendPasswordResetEmail);  // Route to send the reset email
router.post("/check-email", async (req, res) => {
    const { email } = req.body;
  
    try {
      // Check in Firebase
      await admin.auth().getUserByEmail(email);
      return res.json({ exists: true });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        return res.json({ exists: false });
      }
      console.error("Firebase Error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

module.exports = router;
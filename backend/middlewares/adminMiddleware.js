const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminMobiles = ["9109124564", "9876543210"];
const adminEmails = ["amanrathod407@gmail.com"];

const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isAdmin =
      user.role === "admin" ||
      adminMobiles.includes(user.mobileNo) ||
      adminEmails.includes((user.email || "").toLowerCase());

    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied: Admins only" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({ success: false, message: "Authentication failure" });
  }
};

module.exports = { verifyAdmin };

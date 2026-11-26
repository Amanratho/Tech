const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middlewares/adminMiddleware");
const {
  getAdminOverview,
  getAdminUsers,
  getUserDetails,
  updateUserSubscription,
  broadcastAnnouncement,
  clearAnnouncement,
} = require("../controllers/adminController");

// Super Admin Overview Statistics
router.get("/overview", verifyAdmin, getAdminOverview);

// User Management (search, filter, pagination)
router.get("/users", verifyAdmin, getAdminUsers);
router.get("/users/:uid", verifyAdmin, getUserDetails);
router.put("/users/:uid/subscription", verifyAdmin, updateUserSubscription);

// Announcements & Broadcast Notifications
router.post("/broadcast", verifyAdmin, broadcastAnnouncement);
router.post("/clear-announcement", verifyAdmin, clearAnnouncement);

module.exports = router;

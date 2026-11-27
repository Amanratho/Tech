const User = require("../models/User");
const Machine = require("../models/machineRegModel");
const Rental = require("../models/RentalModel");
const admin = require("../config/firebase");

// @desc    Get top-level overview statistics for Super Admin
// @route   GET /api/admin/overview
// @access  Admin Private
exports.getAdminOverview = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalUsers,
      trialUsers,
      activeUsers,
      expiredUsers,
      blockedUsers,
      totalMachines,
      totalRentals,
      financialAgg,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionStatus: "trial", isBlocked: false }),
      User.countDocuments({ subscriptionStatus: "active", isBlocked: false }),
      User.countDocuments({ subscriptionStatus: "expired", isBlocked: false }),
      User.countDocuments({ isBlocked: true }),
      Machine.countDocuments(),
      Rental.countDocuments(),
      Rental.aggregate([
        {
          $group: {
            _id: null,
            totalTurnover: { $sum: "$totalAmount" },
            totalPaid: { $sum: "$paidAmount" },
            totalPending: { $sum: "$pendingAmount" },
          },
        },
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username mobileNo companyName subscriptionStatus subscriptionEndsAt createdAt isBlocked"),
    ]);

    const financials = financialAgg[0] || {
      totalTurnover: 0,
      totalPaid: 0,
      totalPending: 0,
    };

    // Calculate days left for recent users
    const recentFormatted = recentUsers.map((u) => {
      const obj = u.toObject();
      if (obj.subscriptionEndsAt) {
        const diff = new Date(obj.subscriptionEndsAt).getTime() - now.getTime();
        obj.daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      } else {
        obj.daysLeft = 30;
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        trialUsers,
        activeUsers,
        expiredUsers,
        blockedUsers,
        totalMachines,
        totalRentals,
        totalTurnover: financials.totalTurnover,
        totalPaid: financials.totalPaid,
        totalPending: financials.totalPending,
      },
      recentUsers: recentFormatted,
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get filtered/searched list of all users with stats
// @route   GET /api/admin/users
// @access  Admin Private
exports.getAdminUsers = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 50 } = req.query;
    const query = {};

    // Filter by status
    if (status === "blocked") {
      query.isBlocked = true;
    } else if (status === "trial") {
      query.subscriptionStatus = "trial";
      query.isBlocked = false;
    } else if (status === "active") {
      query.subscriptionStatus = "active";
      query.isBlocked = false;
    } else if (status === "expired") {
      query.subscriptionStatus = "expired";
      query.isBlocked = false;
    }

    // Search by name, mobile, company, or email
    if (search.trim()) {
      const reg = new RegExp(search.trim(), "i");
      query.$or = [
        { username: reg },
        { mobileNo: reg },
        { companyName: reg },
        { email: reg },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [totalMatching, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
    ]);

    const now = new Date();

    // Attach machine count & rental count per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const obj = u.toObject();
        if (obj.subscriptionEndsAt) {
          const diff = new Date(obj.subscriptionEndsAt).getTime() - now.getTime();
          obj.daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        } else {
          obj.daysLeft = 30;
        }

        const [machineCount, rentalCount] = await Promise.all([
          Machine.countDocuments({ uid: u.uid }),
          Rental.countDocuments({ uid: u.uid }),
        ]);

        obj.machineCount = machineCount;
        obj.rentalCount = rentalCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      total: totalMatching,
      page: parseInt(page),
      limit: parseInt(limit),
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed info of a single user
// @route   GET /api/admin/users/:uid
// @access  Admin Private
exports.getUserDetails = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [machines, rentals] = await Promise.all([
      Machine.find({ uid }),
      Rental.find({ uid }).sort({ createdAt: -1 }).limit(20),
    ]);

    const now = new Date();
    const userObj = user.toObject();
    if (userObj.subscriptionEndsAt) {
      const diff = new Date(userObj.subscriptionEndsAt).getTime() - now.getTime();
      userObj.daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } else {
      userObj.daysLeft = 30;
    }

    res.status(200).json({
      success: true,
      user: userObj,
      machines,
      recentRentals: rentals,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user subscription, plan, validity extension, or block status
// @route   PUT /api/admin/users/:uid/subscription
// @access  Admin Private
exports.updateUserSubscription = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const {
      subscriptionStatus,
      subscriptionPlan,
      extendDays,
      subscriptionEndsAt,
      isBlocked,
      blockReason,
      paymentWhatsappNumber,
      upiId,
      renewalAmount,
    } = req.body;

    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionPlan) user.subscriptionPlan = subscriptionPlan;

    // Extend days from current end date or from now
    if (extendDays && !isNaN(parseInt(extendDays))) {
      const currentEnd =
        user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > new Date()
          ? new Date(user.subscriptionEndsAt)
          : new Date();
      currentEnd.setDate(currentEnd.getDate() + parseInt(extendDays));
      user.subscriptionEndsAt = currentEnd;
      // Auto reactivate if it was expired
      if (user.subscriptionStatus === "expired") {
        user.subscriptionStatus = "active";
      }
    } else if (subscriptionEndsAt) {
      user.subscriptionEndsAt = new Date(subscriptionEndsAt);
    }

    if (typeof isBlocked === "boolean") {
      user.isBlocked = isBlocked;
      user.blockReason = isBlocked ? (blockReason || "Account suspended by admin") : "";
    }

    if (paymentWhatsappNumber !== undefined) user.paymentWhatsappNumber = paymentWhatsappNumber;
    if (upiId !== undefined) user.upiId = upiId;
    if (renewalAmount !== undefined) user.renewalAmount = renewalAmount;

    await user.save();

    const now = new Date();
    const updatedObj = user.toObject();
    delete updatedObj.password;
    if (updatedObj.subscriptionEndsAt) {
      const diff = new Date(updatedObj.subscriptionEndsAt).getTime() - now.getTime();
      updatedObj.daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: updatedObj,
    });
  } catch (error) {
    console.error("Error updating user subscription:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Broadcast in-app announcement popup or push notification
// @route   POST /api/admin/broadcast
// @access  Admin Private
exports.broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message, showPopup = true, sendPush = true } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    let usersUpdated = 0;
    // 1. Update in-app announcement popup
    if (showPopup) {
      const updateResult = await User.updateMany(
        {},
        {
          announcement: message.trim(),
          showAnnouncementPopup: true,
        }
      );
      usersUpdated = updateResult.modifiedCount || 0;
    }

    // 2. Dispatch FCM Push Notification to all devices
    let pushSuccessCount = 0;
    if (sendPush) {
      try {
        const usersWithTokens = await User.find({
          $or: [
            { fcmToken: { $ne: null, $exists: true } },
            { fcmTokens: { $exists: true, $not: { $size: 0 } } },
          ],
        }).select("fcmToken fcmTokens");

        const allTokens = new Set();
        usersWithTokens.forEach((u) => {
          if (u.fcmToken && u.fcmToken.trim()) allTokens.add(u.fcmToken.trim());
          if (Array.isArray(u.fcmTokens)) {
            u.fcmTokens.forEach((t) => {
              if (t && t.trim()) allTokens.add(t.trim());
            });
          }
        });

        const tokenList = Array.from(allTokens);
        if (tokenList.length > 0 && admin.messaging) {
          // Batch in slices of 500
          for (let i = 0; i < tokenList.length; i += 500) {
            const slice = tokenList.slice(i, i + 500);
            const response = await admin.messaging().sendEachForMulticast({
              tokens: slice,
              notification: {
                title: title || "RentVeda Update",
                body: message.trim(),
              },
              data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                type: "BROADCAST",
              },
            });
            pushSuccessCount += response.successCount;
          }
        }
      } catch (pushErr) {
        console.error("Push dispatch error:", pushErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Broadcast sent successfully",
      usersUpdated,
      pushSuccessCount,
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dismiss / clear announcement popup for all users
// @route   POST /api/admin/clear-announcement
// @access  Admin Private
exports.clearAnnouncement = async (req, res) => {
  try {
    await User.updateMany(
      {},
      {
        showAnnouncementPopup: false,
        announcement: "",
      }
    );
    res.status(200).json({
      success: true,
      message: "Announcement cleared for all users",
    });
  } catch (error) {
    console.error("Error clearing announcement:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

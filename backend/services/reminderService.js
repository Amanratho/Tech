const Rental = require("../models/RentalModel");
const ReminderLog = require("../models/ReminderLogModel");
const User = require("../models/User");
const admin = require("../config/firebase");

// ─── Notification Handlers ───────────────────────────────────────────────────

/** Send FCM Push Notification to machinery owner's phone */
const sendPushNotification = async (rental) => {
  try {
    const ownerUid = rental.uid || rental.userId;
    if (!ownerUid) return;

    const user = await User.findOne({ uid: ownerUid });
    if (!user) return;

    // Collect all unique FCM tokens registered for this user
    const tokens = [];
    if (user.fcmToken) tokens.push(user.fcmToken);
    if (Array.isArray(user.fcmTokens)) {
      for (const t of user.fcmTokens) {
        if (t && !tokens.includes(t)) tokens.push(t);
      }
    }

    if (tokens.length === 0) {
      console.log(`[Push Notification] Owner ${ownerUid} has no FCM token registered.`);
      return;
    }

    const customerName = rental.customerName || "ग्राहक";
    const pendingAmount = rental.pendingAmount || 0;

    const payload = {
      notification: {
        title: "रेंटवेदा रिमाइंडर (RentVeda)",
        body: `${customerName} का ₹${pendingAmount} का भुगतान आज देय है।`,
      },
      data: {
        route: "/reminders",
        rentalId: rental._id ? rental._id.toString() : "",
        customerName: String(customerName),
        pendingAmount: String(pendingAmount),
      },
      android: {
        priority: "high",
        notification: {
          channelId: "rentveda_reminders",
          sound: "default",
          color: "#FFCC00",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
    };

    for (const token of tokens) {
      try {
        await admin.messaging().send({
          token,
          ...payload,
        });
        console.log(`[Push Notification] Successfully sent reminder push to ${ownerUid}`);
      } catch (sendErr) {
        console.warn(`[Push Notification] Send error for token:`, sendErr.message);
        if (
          sendErr.code === "messaging/invalid-registration-token" ||
          sendErr.code === "messaging/registration-token-not-registered"
        ) {
          await User.updateOne({ uid: ownerUid }, { $pull: { fcmTokens: token } });
          if (user.fcmToken === token) {
            await User.updateOne({ uid: ownerUid }, { $set: { fcmToken: null } });
          }
        }
      }
    }
  } catch (err) {
    console.error("[Push Notification] Error:", err.message);
  }
};

/** Send in-app notification to machinery owner (log) */
const sendInAppNotification = (rental) => {
  console.log(
    `[Notification Service] Sending in-app notification to owner (UID: ${rental.uid}) ` +
      `for rental ID: ${rental._id}. Customer Name: ${rental.customerName}`
  );
};

/** Send SMS reminder to customer (placeholder) */
const sendSMSReminder = (rental) => {
  const recipient = rental.customerMobile || rental.mobileNumber;
  console.log(
    `[SMS Service] Sending SMS reminder to ${recipient} ` +
      `for customer "${rental.customerName}" due amount: ₹${rental.pendingAmount}`
  );
};

// ─── Core Reminder Logic ───────────────────────────────────────────────────────

/**
 * processReminders()
 *
 * Finds all PENDING rentals whose reminderDate falls on today,
 * checks the ReminderLog to skip already-notified entries,
 * sends notifications, and records each send in the log.
 *
 * Safe to call multiple times per day — duplicate sends are prevented
 * by the compound unique index on (rentalId, sentDate).
 *
 * @returns {{ processed: number, skipped: number, failed: number, errors: string[] }}
 */
const processReminders = async () => {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Boundaries for today (server-local time)
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0, 0, 0, 0
  );
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23, 59, 59, 999
  );

  // 1. Find all rentals with a reminder due today
  const dueReminders = await Rental.find({
    reminderStatus: "PENDING",
    pendingAmount: { $gt: 0 },
    reminderDate: {
      $gte: startOfToday,
      $lte: endOfToday,
    },
  });

  console.log(
    `⏰ [Reminder] Found ${dueReminders.length} reminders due for today (${today.toDateString()}).`
  );

  // 2. Get IDs that were already processed today (batch query for efficiency)
  const alreadySentLogs = await ReminderLog.find({
    rentalId: { $in: dueReminders.map((r) => r._id) },
    sentDate: todayStr,
  });
  const alreadySentSet = new Set(
    alreadySentLogs.map((log) => log.rentalId.toString())
  );

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  for (const rental of dueReminders) {
    const rentalIdStr = rental._id.toString();

    // 3. Skip if already sent today
    if (alreadySentSet.has(rentalIdStr)) {
      console.log(
        `⏭️  [Reminder] Skipping rental ${rentalIdStr} — already notified today.`
      );
      skipped++;
      continue;
    }

    // 4. Send notifications
    try {
      await sendPushNotification(rental);
      sendInAppNotification(rental);
      sendSMSReminder(rental);

      // 5. Record in the idempotency log
      await ReminderLog.create({
        rentalId: rental._id,
        sentDate: todayStr,
      });

      processed++;
    } catch (err) {
      // If a duplicate-key error sneaks in (race condition between parallel
      // calls), treat it as "already sent" rather than a failure.
      if (err.code === 11000) {
        console.log(
          `⏭️  [Reminder] Race-condition duplicate for rental ${rentalIdStr} — safe to ignore.`
        );
        skipped++;
      } else {
        console.error(
          `❌ [Reminder] Failed to process rental ${rentalIdStr}:`,
          err.message
        );
        failed++;
        errors.push(`${rentalIdStr}: ${err.message}`);
      }
    }
  }

  return { processed, skipped, failed, errors };
};

/** Send direct test push notification to all users with registered FCM tokens */
const sendTestPushToAllUsers = async (customMessage) => {
  try {
    const users = await User.find({
      $or: [
        { fcmToken: { $ne: null, $exists: true } },
        { "fcmTokens.0": { $exists: true } },
      ],
    });

    console.log(`📢 [Test Push] Found ${users.length} users with FCM tokens in DB.`);

    let totalSent = 0;
    const details = [];

    for (const user of users) {
      const tokens = [];
      if (user.fcmToken) tokens.push(user.fcmToken);
      if (Array.isArray(user.fcmTokens)) {
        for (const t of user.fcmTokens) {
          if (t && !tokens.includes(t)) tokens.push(t);
        }
      }

      const payload = {
        notification: {
          title: "🔔 RentVeda टेस्ट रिमाइंडर (8:35 AM)",
          body: customMessage || `नमस्ते ${user.username || "यूजर"}, आपका RentVeda नोटिफिकेशन सिस्टम सफलतापूर्वक काम कर रहा है!`,
        },
        data: {
          route: "/reminders",
          test: "true",
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: "high",
          notification: {
            channelId: "rentveda_reminders",
            sound: "default",
            color: "#FFCC00",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
        },
      };

      for (const token of tokens) {
        try {
          await admin.messaging().send({
            token,
            ...payload,
          });
          totalSent++;
          console.log(`✅ [Test Push] Push sent to user ${user.uid || user.username} (${token.substring(0, 15)}...)`);
          details.push({ uid: user.uid, status: "sent", tokenPrefix: token.substring(0, 15) });
        } catch (err) {
          console.warn(`❌ [Test Push] Failed sending to token ${token.substring(0, 15)}... :`, err.message);
          details.push({ uid: user.uid, status: "error", error: err.message });
        }
      }
    }

    return { usersFound: users.length, totalSent, details };
  } catch (err) {
    console.error("[Test Push] Error:", err.message);
    return { error: err.message };
  }
};

module.exports = { processReminders, sendTestPushToAllUsers, sendPushNotification };

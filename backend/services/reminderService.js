const Rental = require("../models/RentalModel");
const ReminderLog = require("../models/ReminderLogModel");

// ─── Notification Placeholders ─────────────────────────────────────────────────

/** Placeholder: Send in-app notification to machinery owner */
const sendInAppNotification = (rental) => {
  console.log(
    `[Notification Service] Sending in-app notification to owner (UID: ${rental.uid}) ` +
      `for rental ID: ${rental._id}. Customer Name: ${rental.customerName}`
  );
};

/** Placeholder: Send SMS reminder to customer */
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

module.exports = { processReminders };

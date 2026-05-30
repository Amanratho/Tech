const cron = require("node-cron");
const Rental = require("../models/RentalModel");

// Placeholder function: Send in-app notification to machinery owner
const sendInAppNotification = (rental) => {
  console.log(`[Notification Service] Sending in-app notification to owner (UID: ${rental.uid}) for rental ID: ${rental._id}. Customer Name: ${rental.customerName}`);
};

// Placeholder function: Send SMS reminder to customer
const sendSMSReminder = (rental) => {
  const recipient = rental.customerMobile || rental.mobileNumber;
  console.log(`[SMS Service] Sending SMS reminder to ${recipient} for customer "${rental.customerName}" due amount: ₹${rental.pendingAmount}`);
};

// Start the daily cron job scheduled at midnight
const startReminderCron = () => {
  // Runs every day at 00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ [Cron] Running daily payment reminder check...");
    try {
      const today = new Date();
      // Boundaries for today
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      const dueReminders = await Rental.find({
        reminderStatus: "PENDING",
        pendingAmount: { $gt: 0 },
        reminderDate: {
          $gte: startOfToday,
          $lte: endOfToday
        }
      });

      console.log(`⏰ [Cron] Found ${dueReminders.length} reminders due for today (${today.toDateString()}).`);

      for (const rental of dueReminders) {
        sendInAppNotification(rental);
        sendSMSReminder(rental);
      }
    } catch (error) {
      console.error("❌ [Cron] Error running daily reminder check:", error);
    }
  });

  console.log("⏰ Daily payment reminder cron job successfully initialized.");
};

module.exports = { startReminderCron };

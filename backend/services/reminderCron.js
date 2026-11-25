const cron = require("node-cron");
const { processReminders } = require("./reminderService");

// Start the daily reminder cron job
const startReminderCron = () => {
  // Production schedule: Runs every morning at 08:00 AM IST
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("⏰ [Cron] Running daily morning 8:00 AM payment reminder check...");
      try {
        const result = await processReminders();
        console.log("✅ [Cron] Reminder processing complete:", result);
      } catch (error) {
        console.error("❌ [Cron] Error running daily reminder check:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("⏰ Production payment reminder cron job scheduled: 08:00 AM IST daily.");
};

module.exports = { startReminderCron };

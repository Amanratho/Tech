const cron = require("node-cron");
const { processReminders } = require("./reminderService");

// Start the daily reminder cron job (Runs every day at 8:00 AM IST)
const startReminderCron = () => {
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

  console.log("⏰ Daily payment reminder cron job successfully scheduled for 8:00 AM IST.");
};

module.exports = { startReminderCron };

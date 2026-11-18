const cron = require("node-cron");
const { processReminders, sendTestPushToAllUsers } = require("./reminderService");

// Start the daily reminder cron job
const startReminderCron = () => {
  // 1. High-frequency test window: Every minute between 8:35 AM and 8:45 AM IST
  cron.schedule(
    "35-45 8 * * *",
    async () => {
      console.log("⏰ [Cron Test 8:35-8:45 AM] Firing scheduled reminder notification...");
      try {
        // Direct test push to all user devices with FCM tokens
        const pushResult = await sendTestPushToAllUsers(
          "⏰ 8:35 AM टेस्ट रिमाइंडर: RentVeda का ऑटोमैटिक नोटिफिकेशन सही तरीके से प्राप्त हो रहा है!"
        );
        console.log("📢 [Cron Test Push Result]:", pushResult);

        // Also process any actual due payment reminders from database
        const result = await processReminders();
        console.log("✅ [Cron Test DB Reminders Result]:", result);
      } catch (error) {
        console.error("❌ [Cron Test] Error in reminder check:", error);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  // 2. Standard production schedule (Runs every day at 8:00 AM IST)
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

  console.log("⏰ Payment reminder cron job scheduled: 8:35 AM - 8:45 AM IST (Test Window) & 8:00 AM IST (Daily).");
};

module.exports = { startReminderCron };

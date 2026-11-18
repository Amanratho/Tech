const cron = require("node-cron");
const { processReminders, sendTestPushToAllUsers } = require("./reminderService");

// Start the daily reminder cron job
const startReminderCron = () => {
  // 1. High-frequency test window: 09:07 AM to 09:20 AM IST (every 2 minutes)
  cron.schedule(
    "7,9,11,13,15,17,19,20 9 * * *",
    async () => {
      const now = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
      console.log(`⏰ [Cron Test ${now}] Firing scheduled reminder notification...`);
      try {
        // Direct test push to all user devices with FCM tokens
        const pushResult = await sendTestPushToAllUsers(
          `⏰ [${now}] टेस्ट रिमाइंडर: RentVeda का ऑटोमैटिक नोटिफिकेशन सही तरीके से काम कर रहा है!`
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

  console.log("⏰ Payment reminder cron job scheduled: 09:07 AM - 09:20 AM IST (Every 2 mins) & 8:00 AM IST (Daily).");
};

module.exports = { startReminderCron };

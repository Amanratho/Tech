const express = require("express");
const router = express.Router();
const { verifyCronSecret } = require("../middlewares/verifyCronSecret");
const { processReminders } = require("../services/reminderService");

/**
 * GET /api/cron/send-reminders
 *
 * Externally-triggered endpoint that replaces the old node-cron job.
 * Protected by CRON_SECRET so only authorised callers (cron-job.org,
 * Vercel Cron, GitHub Actions, etc.) can invoke it.
 *
 * Safe to call multiple times per day — the service layer ensures
 * no duplicate notifications are sent for the same rental on the
 * same calendar date.
 */
router.get("/send-reminders", verifyCronSecret, async (req, res) => {
  console.log("⏰ [Cron Endpoint] /api/cron/send-reminders triggered.");

  try {
    const result = await processReminders();

    console.log("✅ [Cron Endpoint] Reminder processing complete:", result);

    return res.status(200).json({
      success: true,
      message: "Reminder processing complete.",
      data: result,
    });
  } catch (error) {
    console.error("❌ [Cron Endpoint] Error processing reminders:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing reminders.",
      error: error.message,
    });
  }
});

module.exports = router;

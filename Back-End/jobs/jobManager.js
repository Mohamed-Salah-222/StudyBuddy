const Agenda = require("agenda");
const Reminder = require("../models/reminder");

class JobManager {
  constructor() {
    this.agenda = new Agenda({
      db: {
        address: process.env.MONGODB_URI || "mongodb://localhost:27017/your-app-name",
        collection: "agendaJobs",
      },
      processEvery: "30 seconds",
      maxConcurrency: 20,
      defaultConcurrency: 5,
      defaultLockLifetime: 10000,
    });

    this.setupJobs();
  }

  setupJobs() {
    this.agenda.define("check reminders", async (job) => {
      try {
        console.log("🔍 Checking for pending reminders...");

        const now = new Date();

        const dueReminders = await Reminder.find({
          dueDateTime: { $lte: now },
          notified: false,
        }).populate("user");

        console.log(`📋 Found ${dueReminders.length} due reminders`);

        for (const reminder of dueReminders) {
          try {
            console.log(`🔔 Sending reminder: "${reminder.title}" to user: ${reminder.user?.email || "Unknown"}`);

            // TODO: Implement actual notification (email, push, etc.)
            await this.sendNotification(reminder);

            await Reminder.findByIdAndUpdate(
              reminder._id,
              {
                notified: true,
              },
              { new: true }
            );

            console.log(`✅ Reminder "${reminder.title}" marked as notified`);
            console.log(`📱 Frontend notification will be available for: ${reminder.title}`);
          } catch (error) {
            console.error(`❌ Error processing reminder ${reminder._id}:`, error);
          }
        }
      } catch (error) {
        console.error("❌ Error in check reminders job:", error);
      }
    });

    this.agenda.define("send reminder", async (job) => {
      try {
        const { reminderId } = job.attrs.data;

        const reminder = await Reminder.findById(reminderId).populate("user");

        if (!reminder) {
          console.log(`⚠️ Reminder ${reminderId} not found`);
          return;
        }

        if (reminder.notified) {
          console.log(`⚠️ Reminder ${reminderId} already notified`);
          return;
        }

        console.log(`🔔 Sending scheduled reminder: "${reminder.title}"`);

        await this.sendNotification(reminder);

        await Reminder.findByIdAndUpdate(
          reminder._id,
          {
            notified: true,
          },
          { new: true }
        );

        console.log(`✅ Scheduled reminder "${reminder.title}" sent successfully`);
        console.log(`📱 Frontend notification will be available for: ${reminder.title}`);
      } catch (error) {
        console.error("❌ Error in send reminder job:", error);
      }
    });
  }

  async sendNotification(reminder) {
    // TODO: Implement your notification system here

    console.log(`📧 NOTIFICATION: ${reminder.title}`);
    console.log(`📅 Due: ${reminder.dueDateTime}`);
    console.log(`👤 User: ${reminder.user?.email || "Unknown"}`);
    console.log(`🏷️ Type: ${reminder.type || "general"}`);
    console.log("---");

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  notifyFrontendRealTime(reminder) {}

  async start() {
    try {
      await this.agenda.start();
      console.log("🚀 Job Manager started successfully");

      await this.agenda.every("1 minute", "check reminders");
      console.log("⏰ Recurring reminder check scheduled (every 1 minute)");
      console.log("📱 Frontend will automatically check for new notifications every minute");
    } catch (error) {
      console.error("❌ Error starting Job Manager:", error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.agenda.stop();
      console.log("🛑 Job Manager stopped");
    } catch (error) {
      console.error("❌ Error stopping Job Manager:", error);
    }
  }

  async scheduleReminder(reminderId, dueDateTime) {
    try {
      await this.agenda.schedule(dueDateTime, "send reminder", { reminderId });
      console.log(`📅 Scheduled reminder ${reminderId} for ${dueDateTime}`);
    } catch (error) {
      console.error(`❌ Error scheduling reminder ${reminderId}:`, error);
      throw error;
    }
  }

  async cancelReminder(reminderId) {
    try {
      await this.agenda.cancel({ "data.reminderId": reminderId });
      console.log(`🗑️ Cancelled scheduled jobs for reminder ${reminderId}`);
    } catch (error) {
      console.error(`❌ Error cancelling reminder ${reminderId}:`, error);
    }
  }

  async getStats() {
    try {
      const jobs = await this.agenda.jobs({});
      const running = jobs.filter((job) => job.attrs.lockedAt && !job.attrs.lastFinishedAt);
      const scheduled = jobs.filter((job) => job.attrs.nextRunAt && !job.attrs.lockedAt);
      const completed = jobs.filter((job) => job.attrs.lastFinishedAt);

      return {
        total: jobs.length,
        running: running.length,
        scheduled: scheduled.length,
        completed: completed.length,
      };
    } catch (error) {
      console.error("❌ Error getting job stats:", error);
      return null;
    }
  }
}

module.exports = JobManager;

const Agenda = require("agenda");
const Reminder = require("../models/reminder");

class JobManager {
  constructor() {
    // Initialize Agenda with MongoDB connection
    this.agenda = new Agenda({
      db: {
        address: process.env.MONGODB_URI || "mongodb://localhost:27017/your-app-name",
        collection: "agendaJobs",
      },
      processEvery: "30 seconds", // How often to check for jobs
      maxConcurrency: 20,
      defaultConcurrency: 5,
      defaultLockLifetime: 10000,
    });

    this.setupJobs();
  }

  // Define all job types
  setupJobs() {
    // Job to check and send reminders
    this.agenda.define("check reminders", async (job) => {
      try {
        console.log("🔍 Checking for pending reminders...");

        const now = new Date();

        // Find reminders that are due and haven't been notified yet
        const dueReminders = await Reminder.find({
          dueDateTime: { $lte: now },
          notified: false,
        }).populate("user");

        console.log(`📋 Found ${dueReminders.length} due reminders`);

        for (const reminder of dueReminders) {
          try {
            // Here you would implement your notification logic
            // For now, we'll just log and mark as notified
            console.log(`🔔 Sending reminder: "${reminder.title}" to user: ${reminder.user?.email || "Unknown"}`);

            // TODO: Implement actual notification (email, push, etc.)
            await this.sendNotification(reminder);

            // Mark as notified - IMPORTANT: Use findByIdAndUpdate to ensure updatedAt is set
            await Reminder.findByIdAndUpdate(
              reminder._id,
              {
                notified: true,
                // updatedAt is automatically updated by mongoose timestamps
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

    // Job to schedule individual reminders
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

        // Send the notification
        await this.sendNotification(reminder);

        // Mark as notified - IMPORTANT: Use findByIdAndUpdate to ensure updatedAt is set
        await Reminder.findByIdAndUpdate(
          reminder._id,
          {
            notified: true,
            // updatedAt is automatically updated by mongoose timestamps
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

  // Notification logic (customize based on your needs)
  async sendNotification(reminder) {
    // TODO: Implement your notification system here
    // Examples:
    // - Send email
    // - Send push notification
    // - Send SMS
    // - Log to console (for now)

    console.log(`📧 NOTIFICATION: ${reminder.title}`);
    console.log(`📅 Due: ${reminder.dueDateTime}`);
    console.log(`👤 User: ${reminder.user?.email || "Unknown"}`);
    console.log(`🏷️ Type: ${reminder.type || "general"}`);
    console.log("---");

    // Simulate notification delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Optional: You can add real-time frontend notification here
    // if you're using Socket.IO or Server-Sent Events
    // this.notifyFrontendRealTime(reminder);
  }

  // Optional: Real-time frontend notification (if using Socket.IO)
  notifyFrontendRealTime(reminder) {
    // Example with Socket.IO (uncomment if you're using it):
    /*
    const io = require('../socket'); // Your socket.io instance
    if (io && reminder.user) {
      io.to(reminder.user._id.toString()).emit('new-reminder-notification', {
        id: reminder._id,
        title: reminder.title,
        type: reminder.type,
        dueTime: reminder.dueDateTime,
        message: `Reminder: ${reminder.title}`
      });
      console.log(`📡 Real-time notification sent to user ${reminder.user.email}`);
    }
    */
  }

  // Start the job manager
  async start() {
    try {
      await this.agenda.start();
      console.log("🚀 Job Manager started successfully");

      // Schedule the recurring reminder check job
      await this.agenda.every("1 minute", "check reminders");
      console.log("⏰ Recurring reminder check scheduled (every 1 minute)");
      console.log("📱 Frontend will automatically check for new notifications every minute");
    } catch (error) {
      console.error("❌ Error starting Job Manager:", error);
      throw error;
    }
  }

  // Stop the job manager
  async stop() {
    try {
      await this.agenda.stop();
      console.log("🛑 Job Manager stopped");
    } catch (error) {
      console.error("❌ Error stopping Job Manager:", error);
    }
  }

  // Schedule a specific reminder
  async scheduleReminder(reminderId, dueDateTime) {
    try {
      await this.agenda.schedule(dueDateTime, "send reminder", { reminderId });
      console.log(`📅 Scheduled reminder ${reminderId} for ${dueDateTime}`);
    } catch (error) {
      console.error(`❌ Error scheduling reminder ${reminderId}:`, error);
      throw error;
    }
  }

  // Cancel a scheduled reminder
  async cancelReminder(reminderId) {
    try {
      await this.agenda.cancel({ "data.reminderId": reminderId });
      console.log(`🗑️ Cancelled scheduled jobs for reminder ${reminderId}`);
    } catch (error) {
      console.error(`❌ Error cancelling reminder ${reminderId}:`, error);
    }
  }

  // Get job statistics (useful for monitoring)
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

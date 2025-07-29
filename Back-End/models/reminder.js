const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reminderSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    dueDateTime: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["study", "task", "general", "event", "custom"],
      required: true,
    },
  },
  { timestamps: true }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;

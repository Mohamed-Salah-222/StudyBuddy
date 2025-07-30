const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discussionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
    tags: [String],
    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    comments: {
      type: [String],
    },
  },
  { timestamps: true }
);

const Discussion = mongoose.model("Discussion", discussionSchema);

module.exports = Discussion;

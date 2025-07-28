const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const resourcesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["link", "text", "image", "video", "document"],
      required: true,
    },
    tags: {
      type: [String],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Resources = mongoose.model("Resources", resourcesSchema);

module.exports = Resources;

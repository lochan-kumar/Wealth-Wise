const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "group_invite",
      "invite_accepted",
      "invite_declined",
      "expense_added",
      "budget_alert",
      "budget_exceeded",
      "member_left",
      "group_deleted",
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 1800, // Auto-delete after 30 minutes (1800 seconds)
  },
});

// Index for efficient querying
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model("Notification", NotificationSchema);

const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please add a goal name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  targetAmount: {
    type: Number,
    required: [true, "Please add a target amount"],
    min: [1, "Target amount must be at least 1"],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  deadline: {
    type: Date,
  },
  category: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "failed"],
    default: "active",
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for progress percentage
GoalSchema.virtual("progress").get(function () {
  return Math.min(
    100,
    Math.round((this.currentAmount / this.targetAmount) * 100)
  );
});

// Include virtuals in JSON
GoalSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Goal", GoalSchema);

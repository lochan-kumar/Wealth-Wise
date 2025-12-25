const mongoose = require("mongoose");

// Helper to get current date in IST (India Standard Time)
const getISTDate = () => {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
};

// Helper to get start of month in IST
const getISTMonthStart = (date = new Date()) => {
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(istDate.getUTCFullYear(), istDate.getUTCMonth(), 1) -
      5.5 * 60 * 60 * 1000
  );
};

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    trim: true,
  },
  limit: {
    type: Number,
    required: [true, "Please add a budget limit"],
    min: [1, "Budget limit must be at least 1"],
    default: 5000,
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100,
  },
  currentSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  periodStartDate: {
    type: Date,
    default: getISTMonthStart,
  },
  resetDay: {
    type: Number,
    default: 1, // Day of month when budget resets (1-28)
    min: 1,
    max: 28,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one budget per category per user
BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

// Method to check if period needs reset (uses IST)
BudgetSchema.methods.checkAndResetPeriod = function () {
  const nowIST = getISTDate();
  const startDate = new Date(this.periodStartDate);

  // Calculate next reset date based on resetDay
  let nextResetDate = new Date(startDate);
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);
  nextResetDate.setDate(this.resetDay);

  // If current IST date is past the next reset date, reset the budget
  if (nowIST >= nextResetDate) {
    this.currentSpent = 0;
    // Set new period start to current month's reset day
    const newStart = new Date(nowIST);
    newStart.setDate(this.resetDay);
    newStart.setHours(0, 0, 0, 0);
    this.periodStartDate = newStart;
    return true;
  }
  return false;
};

// Static method to get default period start (1st of current month IST)
BudgetSchema.statics.getDefaultPeriodStart = function () {
  return getISTMonthStart();
};

// Virtual for percentage spent
BudgetSchema.virtual("percentageSpent").get(function () {
  if (this.limit === 0) return 0;
  return Math.round((this.currentSpent / this.limit) * 100);
});

// Virtual for remaining amount
BudgetSchema.virtual("remaining").get(function () {
  return Math.max(0, this.limit - this.currentSpent);
});

// Virtual for days until reset
BudgetSchema.virtual("daysUntilReset").get(function () {
  const nowIST = getISTDate();
  const nextReset = new Date(this.periodStartDate);
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(this.resetDay);

  const diff = nextReset - nowIST;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Include virtuals in JSON
BudgetSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Budget", BudgetSchema);

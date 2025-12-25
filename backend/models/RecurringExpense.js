const mongoose = require("mongoose");

const RecurringExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please add a name for the recurring expense"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
    min: [0.01, "Amount must be greater than 0"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    trim: true,
    default: "Bills",
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Please select an account"],
  },
  dayOfMonth: {
    type: Number,
    required: [true, "Please specify the day of month"],
    min: [1, "Day must be between 1 and 31"],
    max: [31, "Day must be between 1 and 31"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, "Description cannot be more than 200 characters"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastProcessedDate: {
    type: Date,
    default: null,
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

// Update the updatedAt field on save
RecurringExpenseSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
RecurringExpenseSchema.index({ user: 1, isActive: 1 });
RecurringExpenseSchema.index({ user: 1, dayOfMonth: 1 });

module.exports = mongoose.model("RecurringExpense", RecurringExpenseSchema);

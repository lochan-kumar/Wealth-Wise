const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
    min: [0, "Amount cannot be negative"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, "Description cannot be more than 200 characters"],
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: [
      "Food",
      "Transport",
      "Shopping",
      "Bills",
      "Entertainment",
      "Health",
      "Education",
      "Other",
    ],
    default: "Other",
  },
  merchant: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ["manual", "bank"],
    default: "manual",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);

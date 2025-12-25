const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Please select an account"],
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: [true, "Please specify transaction type"],
    default: "expense",
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
    min: [0.01, "Amount must be greater than 0"],
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    trim: true,
    default: "Other",
  },
  payee: {
    type: String,
    trim: true,
    default: "",
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

// Indexes for efficient queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1 });
TransactionSchema.index({ user: 1, account: 1 });
TransactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);

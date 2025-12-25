const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountNumber: {
    type: String,
    required: [true, "Please add an account number"],
    trim: true,
  },
  bankName: {
    type: String,
    trim: true,
    default: "Unknown Bank",
  },
  linkedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for unique account per user
BankAccountSchema.index({ user: 1, accountNumber: 1 }, { unique: true });

module.exports = mongoose.model("BankAccount", BankAccountSchema);

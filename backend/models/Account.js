const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please add an account name"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["cash", "bank"],
    required: true,
  },
  bankName: {
    type: String,
    trim: true,
    default: null,
  },
  accountNumber: {
    type: String,
    trim: true,
    default: null,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    default: 0,
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

// Index for efficient queries
AccountSchema.index({ user: 1, type: 1 });
AccountSchema.index({ user: 1, isDefault: 1 });

// Static method to create default Cash account
AccountSchema.statics.createDefaultCashAccount = async function (userId) {
  return await this.create({
    user: userId,
    name: "Cash",
    type: "cash",
    isDefault: true,
  });
};

// Static method to get available banks
AccountSchema.statics.getAvailableBanks = function () {
  return [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Yes Bank",
    "IndusInd Bank",
  ];
};

module.exports = mongoose.model("Account", AccountSchema);

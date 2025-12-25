const mongoose = require("mongoose");

const DebtTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["borrowed", "lent", "repaid", "received"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Amount must be greater than 0"],
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  linkedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DebtPersonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please add the person's name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  phone: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [300, "Notes cannot be more than 300 characters"],
  },
  transactions: [DebtTransactionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for calculating current balance
// Positive = they owe you, Negative = you owe them
DebtPersonSchema.virtual("balance").get(function () {
  let balance = 0;
  this.transactions.forEach((t) => {
    switch (t.type) {
      case "lent": // You gave them money, they owe you
        balance += t.amount;
        break;
      case "borrowed": // You took from them, you owe them
        balance -= t.amount;
        break;
      case "received": // They paid you back, reduces what they owe
        balance -= t.amount;
        break;
      case "repaid": // You paid them back, reduces what you owe
        balance += t.amount;
        break;
    }
  });
  return balance;
});

// Virtual for status
DebtPersonSchema.virtual("status").get(function () {
  const balance = this.balance;
  if (balance === 0) return "settled";
  if (balance > 0) return "they_owe";
  return "you_owe";
});

// Update timestamp on save
DebtPersonSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Include virtuals in JSON
DebtPersonSchema.set("toJSON", { virtuals: true });
DebtPersonSchema.set("toObject", { virtuals: true });

// Index for efficient queries
DebtPersonSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model("DebtPerson", DebtPersonSchema);

const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Amount must be greater than 0"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  },
});

const DebtSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  personName: {
    type: String,
    required: [true, "Please add the person's name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  type: {
    type: String,
    enum: ["owed_to_me", "i_owe"],
    required: [true, "Please specify debt type"],
  },
  originalAmount: {
    type: Number,
    required: [true, "Please add an amount"],
    min: [0.01, "Amount must be greater than 0"],
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, "Description cannot be more than 300 characters"],
  },
  dueDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "partial", "settled"],
    default: "pending",
  },
  payments: [PaymentSchema],
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
DebtSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Auto-update status based on remaining amount
  if (this.remainingAmount <= 0) {
    this.status = "settled";
    this.remainingAmount = 0;
  } else if (this.remainingAmount < this.originalAmount) {
    this.status = "partial";
  } else {
    this.status = "pending";
  }

  next();
});

// Set remainingAmount to originalAmount on create
DebtSchema.pre("validate", function (next) {
  if (this.isNew && this.remainingAmount === undefined) {
    this.remainingAmount = this.originalAmount;
  }
  next();
});

// Index for efficient queries
DebtSchema.index({ user: 1, type: 1 });
DebtSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Debt", DebtSchema);

const mongoose = require("mongoose");

const ExpenseSplitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  settled: {
    type: Boolean,
    default: false,
  },
  settledAt: Date,
});

const GroupExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, "Expense amount must be positive"],
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  splitType: {
    type: String,
    enum: ["equal", "percentage", "custom"],
    default: "equal",
  },
  splits: [ExpenseSplitSchema],
  date: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  joinedAt: Date,
});

const SplitGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a group name"],
    trim: true,
    maxlength: [50, "Group name cannot exceed 50 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, "Description cannot exceed 200 characters"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [GroupMemberSchema],
  expenses: [GroupExpenseSchema],
  // Setting to control auto-create transaction on settlement
  autoCreateTransaction: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Helper to extract user ID as string (handles both populated and unpopulated)
const getUserId = (user) => {
  if (!user) return null;
  // If populated (has _id property), use that; otherwise it's an ObjectId itself
  return (user._id || user).toString();
};

// Method to calculate balances for all members
SplitGroupSchema.methods.calculateBalances = function () {
  const balances = {};

  // Initialize balances for all accepted members
  this.members.forEach((member) => {
    if (member.status === "accepted") {
      balances[getUserId(member.user)] = 0;
    }
  });
  // Also include creator
  balances[getUserId(this.createdBy)] = 0;

  // Calculate balances from expenses
  this.expenses.forEach((expense) => {
    const payerId = getUserId(expense.paidBy);

    expense.splits.forEach((split) => {
      const userId = getUserId(split.user);
      if (!split.settled) {
        // If not settled, payer is owed money, others owe money
        if (userId !== payerId) {
          balances[payerId] = (balances[payerId] || 0) + split.amount;
          balances[userId] = (balances[userId] || 0) - split.amount;
        }
      }
    });
  });

  return balances;
};

// Method to get simplified debts (who owes whom)
SplitGroupSchema.methods.getSimplifiedDebts = function () {
  const balances = this.calculateBalances();
  const debts = [];

  const creditors = [];
  const debtors = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    if (balance > 0) {
      creditors.push({ userId, amount: balance });
    } else if (balance < 0) {
      debtors.push({ userId, amount: -balance });
    }
  });

  // Simple debt simplification
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let i = 0,
    j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].amount, debtors[j].amount);
    if (amount > 0) {
      debts.push({
        from: debtors[j].userId,
        to: creditors[i].userId,
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditors[i].amount -= amount;
    debtors[j].amount -= amount;

    if (creditors[i].amount === 0) i++;
    if (debtors[j].amount === 0) j++;
  }

  return debts;
};

// Index for efficient querying
SplitGroupSchema.index({ createdBy: 1 });
SplitGroupSchema.index({ "members.user": 1, "members.status": 1 });

module.exports = mongoose.model("SplitGroup", SplitGroupSchema);

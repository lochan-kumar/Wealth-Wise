const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Account = require("../models/Account");
const { detectCategory } = require("../utils/categoryDetector");

// Helper to update budget currentSpent
const updateBudgetSpent = async (userId, category, amount, isAdd = true) => {
  const budget = await Budget.findOne({ user: userId, category });
  if (budget) {
    // Check if period needs reset
    budget.checkAndResetPeriod();

    if (isAdd) {
      budget.currentSpent += amount;
    } else {
      budget.currentSpent = Math.max(0, budget.currentSpent - amount);
    }
    await budget.save();
  }
};

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, category, account, startDate, endDate, payee } = req.query;

    // Build query
    const query = { user: req.user.id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (account) query.account = account;
    if (payee) query.payee = { $regex: payee, $options: "i" };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("account", "name type bankName")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("account", "name type bankName");

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { account, type, amount, description, category, payee, date } =
      req.body;

    // Validate account exists and belongs to user
    const accountDoc = await Account.findOne({
      _id: account,
      user: req.user.id,
    });
    if (!accountDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid account. Please select a valid account.",
      });
    }

    // Check if expense would make balance negative
    if ((type === "expense" || !type) && accountDoc.balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Account has ₹${accountDoc.balance.toLocaleString()} but expense is ₹${amount.toLocaleString()}.`,
      });
    }

    // Auto-detect category if not provided
    const finalCategory =
      category || detectCategory(payee || "", description || "");

    const transaction = await Transaction.create({
      user: req.user.id,
      account,
      type: type || "expense",
      amount,
      description: description || "",
      category: finalCategory,
      payee: payee || "",
      date: date || Date.now(),
      source: "manual",
    });

    // Update budget if it's an expense
    if (transaction.type === "expense") {
      await updateBudgetSpent(
        req.user.id,
        transaction.category,
        transaction.amount,
        true
      );
    }

    // Update account balance
    const balanceChange = transaction.type === "income" ? amount : -amount;
    await Account.findByIdAndUpdate(account, {
      $inc: { balance: balanceChange },
      updatedAt: new Date(),
    });

    // Populate account info for response
    await transaction.populate("account", "name type bankName");

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    // Store old values for budget and balance updates
    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;
    const oldType = transaction.type;
    const oldAccountId = transaction.account.toString();

    // Validate account if being changed
    if (req.body.account) {
      const accountDoc = await Account.findOne({
        _id: req.body.account,
        user: req.user.id,
      });
      if (!accountDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid account" });
      }
    }

    // Get new values (or keep old if not provided)
    const newAmount =
      req.body.amount !== undefined ? req.body.amount : oldAmount;
    const newType = req.body.type || oldType;
    const newAccountId = req.body.account || oldAccountId;

    // Check if anything that affects balance has changed
    const amountChanged = newAmount !== oldAmount;
    const typeChanged = newType !== oldType;
    const accountChanged = newAccountId !== oldAccountId;

    // If amount, type or account changed, update balances
    if (amountChanged || typeChanged || accountChanged) {
      // Reverse the old transaction's effect on old account
      const oldBalanceEffect = oldType === "income" ? oldAmount : -oldAmount;
      await Account.findByIdAndUpdate(oldAccountId, {
        $inc: { balance: -oldBalanceEffect },
        updatedAt: new Date(),
      });

      // Apply the new transaction's effect on new account
      const newBalanceEffect = newType === "income" ? newAmount : -newAmount;
      await Account.findByIdAndUpdate(newAccountId, {
        $inc: { balance: newBalanceEffect },
        updatedAt: new Date(),
      });
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("account", "name type bankName");

    // Update budgets if expense amount/category changed
    if (oldType === "expense") {
      await updateBudgetSpent(req.user.id, oldCategory, oldAmount, false);
    }
    if (transaction.type === "expense") {
      await updateBudgetSpent(
        req.user.id,
        transaction.category,
        transaction.amount,
        true
      );
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction (also removes linked debt transaction)
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    // Update budget if it was an expense
    if (transaction.type === "expense") {
      await updateBudgetSpent(
        req.user.id,
        transaction.category,
        transaction.amount,
        false
      );
    }

    // Reverse account balance change
    const balanceReverse =
      transaction.type === "income" ? -transaction.amount : transaction.amount;
    await Account.findByIdAndUpdate(transaction.account, {
      $inc: { balance: balanceReverse },
      updatedAt: new Date(),
    });

    // Remove linked debt transaction if exists
    const DebtPerson = require("../models/DebtPerson");
    await DebtPerson.updateMany(
      { user: req.user.id },
      { $pull: { transactions: { linkedTransaction: transaction._id } } }
    );

    await transaction.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete all transactions for user
// @route   DELETE /api/transactions/all
// @access  Private
const deleteAllTransactions = async (req, res) => {
  try {
    // Reset all budget currentSpent to 0
    await Budget.updateMany(
      { user: req.user.id },
      { $set: { currentSpent: 0 } }
    );

    // Delete all transactions for user
    const result = await Transaction.deleteMany({ user: req.user.id });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
};

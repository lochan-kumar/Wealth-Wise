const RecurringExpense = require("../models/RecurringExpense");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

// @desc    Get all recurring expenses for user
// @route   GET /api/recurring-expenses
// @access  Private
const getRecurringExpenses = async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = { user: req.user.id };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const expenses = await RecurringExpense.find(query)
      .populate("account", "name type bankName")
      .sort({ dayOfMonth: 1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single recurring expense
// @route   GET /api/recurring-expenses/:id
// @access  Private
const getRecurringExpense = async (req, res) => {
  try {
    const expense = await RecurringExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("account", "name type bankName");

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Recurring expense not found" });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create recurring expense
// @route   POST /api/recurring-expenses
// @access  Private
const createRecurringExpense = async (req, res) => {
  try {
    const { name, amount, category, account, dayOfMonth, description } =
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

    const expense = await RecurringExpense.create({
      user: req.user.id,
      name,
      amount,
      category: category || "Bills",
      account,
      dayOfMonth,
      description,
    });

    await expense.populate("account", "name type bankName");

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update recurring expense
// @route   PUT /api/recurring-expenses/:id
// @access  Private
const updateRecurringExpense = async (req, res) => {
  try {
    let expense = await RecurringExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Recurring expense not found" });
    }

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

    expense = await RecurringExpense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("account", "name type bankName");

    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete recurring expense
// @route   DELETE /api/recurring-expenses/:id
// @access  Private
const deleteRecurringExpense = async (req, res) => {
  try {
    const expense = await RecurringExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Recurring expense not found" });
    }

    await expense.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process recurring expenses for current month
// @route   POST /api/recurring-expenses/process
// @access  Private
const processRecurringExpenses = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Find active recurring expenses that need to be processed
    const expenses = await RecurringExpense.find({
      user: req.user.id,
      isActive: true,
      dayOfMonth: { $lte: currentDay },
    });

    const processedExpenses = [];

    for (const expense of expenses) {
      // Check if already processed this month
      if (expense.lastProcessedDate) {
        const lastProcessed = new Date(expense.lastProcessedDate);
        if (
          lastProcessed.getMonth() === currentMonth &&
          lastProcessed.getFullYear() === currentYear
        ) {
          continue; // Skip if already processed this month
        }
      }

      // Create the transaction
      const transaction = await Transaction.create({
        user: req.user.id,
        account: expense.account,
        type: "expense",
        amount: expense.amount,
        description: expense.description || `Recurring: ${expense.name}`,
        category: expense.category,
        payee: expense.name,
        date: new Date(currentYear, currentMonth, expense.dayOfMonth),
        source: "manual",
      });

      // Update account balance
      await Account.findByIdAndUpdate(expense.account, {
        $inc: { balance: -expense.amount },
        updatedAt: new Date(),
      });

      // Update lastProcessedDate
      expense.lastProcessedDate = new Date();
      await expense.save();

      processedExpenses.push({
        expense: expense.name,
        amount: expense.amount,
        transactionId: transaction._id,
      });
    }

    res.json({
      success: true,
      message: `Processed ${processedExpenses.length} recurring expenses`,
      data: processedExpenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process a single recurring expense
// @route   POST /api/recurring-expenses/:id/process
// @access  Private
const processSingleRecurringExpense = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const expense = await RecurringExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Recurring expense not found" });
    }

    if (!expense.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "This recurring expense is paused" });
    }

    // Check if already processed this month
    if (expense.lastProcessedDate) {
      const lastProcessed = new Date(expense.lastProcessedDate);
      if (
        lastProcessed.getMonth() === currentMonth &&
        lastProcessed.getFullYear() === currentYear
      ) {
        return res.status(400).json({
          success: false,
          message: "This expense has already been processed this month",
        });
      }
    }

    // Create the transaction with the scheduled day of month
    const transaction = await Transaction.create({
      user: req.user.id,
      account: expense.account,
      type: "expense",
      amount: expense.amount,
      description: expense.description || `Recurring: ${expense.name}`,
      category: expense.category,
      payee: expense.name,
      date: new Date(currentYear, currentMonth, expense.dayOfMonth),
      source: "manual",
    });

    // Update account balance
    await Account.findByIdAndUpdate(expense.account, {
      $inc: { balance: -expense.amount },
      updatedAt: new Date(),
    });

    // Update lastProcessedDate
    expense.lastProcessedDate = new Date();
    await expense.save();

    res.json({
      success: true,
      message: `Processed "${
        expense.name
      }" - ₹${expense.amount.toLocaleString()} deducted`,
      data: {
        expense: expense.name,
        amount: expense.amount,
        transactionId: transaction._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRecurringExpenses,
  getRecurringExpense,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpenses,
  processSingleRecurringExpense,
};

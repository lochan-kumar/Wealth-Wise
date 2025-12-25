const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .populate("account", "name type bankName")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("account", "name type bankName");

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category, account } =
      req.body;

    // Validate account if provided
    if (account) {
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
    }

    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      category,
      account,
    });

    await goal.populate("account", "name type bankName");

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
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

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("account", "name type bankName");

    // Auto-update status if target reached
    if (goal.currentAmount >= goal.targetAmount && goal.status === "active") {
      goal.status = "completed";
      await goal.save();
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal progress (with optional expense creation)
// @route   PUT /api/goals/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { amount, accountId } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid amount" });
    }

    let goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    }

    // Use provided accountId or goal's default account
    const targetAccountId = accountId || goal.account;
    let transaction = null;

    // Create expense transaction if account is specified
    if (targetAccountId) {
      const accountDoc = await Account.findOne({
        _id: targetAccountId,
        user: req.user.id,
      });

      if (!accountDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid account. Please select a valid account.",
        });
      }

      // Create the expense transaction
      transaction = await Transaction.create({
        user: req.user.id,
        account: targetAccountId,
        type: "expense",
        amount: amount,
        description: `Savings towards goal: ${goal.name}`,
        category: "Investment",
        payee: `Goal: ${goal.name}`,
        date: new Date(),
        source: "manual",
      });

      // Deduct from account balance
      await Account.findByIdAndUpdate(targetAccountId, {
        $inc: { balance: -amount },
        updatedAt: new Date(),
      });
    }

    goal.currentAmount = (goal.currentAmount || 0) + amount;
    goal.updatedAt = new Date();

    // Auto-complete if target reached
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = "completed";
    }

    await goal.save();
    await goal.populate("account", "name type bankName");

    res.json({
      success: true,
      data: goal,
      transaction: transaction ? transaction._id : null,
      message: transaction
        ? `Added ₹${amount} to goal and created expense record`
        : `Added ₹${amount} to goal`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, message: "Goal not found" });
    }

    await goal.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
};

const Budget = require("../models/Budget");

// @desc    Get all budgets for user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    // Check and reset periods if needed (auto-save)
    for (const budget of budgets) {
      if (budget.checkAndResetPeriod()) {
        await budget.save();
      }
    }

    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, limit, alertThreshold, resetDay } = req.body;

    // Check if budget already exists for this category
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
    });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: "Budget already exists for this category. Use PUT to update.",
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit: limit || 5000,
      alertThreshold: alertThreshold || 80,
      resetDay: resetDay || 1, // Default: reset on 1st of every month
      currentSpent: 0,
      periodStartDate: Budget.getDefaultPeriodStart(), // Uses IST
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    // Only allow updating limit and alertThreshold
    const { limit, alertThreshold } = req.body;
    if (limit) budget.limit = limit;
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;

    await budget.save();

    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    await budget.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get budget status with alerts
// @route   GET /api/budgets/status
// @access  Private
const getBudgetStatus = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });

    const statusData = await Promise.all(
      budgets.map(async (budget) => {
        // Check and reset period if needed (auto-save using IST)
        if (budget.checkAndResetPeriod()) {
          await budget.save();
        }

        const percentage =
          budget.limit > 0
            ? Math.round((budget.currentSpent / budget.limit) * 100)
            : 0;
        const isOverBudget = budget.currentSpent > budget.limit;
        const isNearLimit = percentage >= budget.alertThreshold;

        return {
          _id: budget._id,
          category: budget.category,
          limit: budget.limit,
          currentSpent: budget.currentSpent,
          remaining: Math.max(0, budget.limit - budget.currentSpent),
          percentage,
          alertThreshold: budget.alertThreshold,
          resetDay: budget.resetDay,
          periodStartDate: budget.periodStartDate,
          daysUntilReset: budget.daysUntilReset,
          isOverBudget,
          isNearLimit,
          alert: isOverBudget
            ? `⚠️ Over budget by ₹${budget.currentSpent - budget.limit}!`
            : isNearLimit
            ? `⚡ ${percentage}% of budget used`
            : null,
        };
      })
    );

    res.json({ success: true, data: statusData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset a budget's currentSpent manually
// @route   POST /api/budgets/:id/reset
// @access  Private
const resetBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!budget) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    budget.currentSpent = 0;
    budget.periodStartDate = new Date();
    await budget.save();

    res.json({
      success: true,
      message: "Budget reset successfully",
      data: budget,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
  resetBudget,
};

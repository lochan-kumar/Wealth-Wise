const Category = require("../models/Category");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// @desc    Get all categories for user (seeds defaults if none exist)
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    // Seed default categories if user has none
    await Category.seedDefaultCategories(req.user.id);

    const categories = await Category.find({ user: req.user.id }).sort({
      name: 1,
    });

    // Calculate current spending for each category this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const spending = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const spendingMap = {};
    spending.forEach((s) => {
      spendingMap[s._id] = s.total;
    });

    // Add spending info to categories
    const categoriesWithSpending = categories.map((cat) => ({
      ...cat.toObject(),
      currentSpent: spendingMap[cat.name] || 0,
    }));

    res.json({
      success: true,
      count: categoriesWithSpending.length,
      data: categoriesWithSpending,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, icon, color, budgetLimit, type } = req.body;

    // Check for duplicate name
    const existing = await Category.findOne({
      user: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const category = await Category.create({
      user: req.user.id,
      name,
      icon: icon || "Category",
      color: color || "#6366f1",
      budgetLimit: budgetLimit || null,
      type: type || "expense",
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { name, icon, color, budgetLimit, type } = req.body;

    let category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const oldName = category.name;

    // Check for duplicate name if changing
    if (name && name !== oldName) {
      const existing = await Category.findOne({
        user: req.user.id,
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "A category with this name already exists",
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (budgetLimit !== undefined) category.budgetLimit = budgetLimit;
    if (type !== undefined) category.type = type;

    await category.save();

    // Update transactions if name changed
    if (name && name !== oldName) {
      await Transaction.updateMany(
        { user: req.user.id, category: oldName },
        { $set: { category: name } }
      );
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category (moves transactions to "Other")
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Prevent deleting "Other" category
    if (category.name === "Other" && category.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the default 'Other' category",
      });
    }

    // Move all transactions to "Other"
    const movedCount = await Transaction.updateMany(
      { user: req.user.id, category: category.name },
      { $set: { category: "Other" } }
    );

    // Delete any budgets for this category
    await Budget.deleteMany({ user: req.user.id, category: category.name });

    await category.deleteOne();

    res.json({
      success: true,
      message: `Category deleted. ${movedCount.modifiedCount} transactions moved to "Other".`,
      movedTransactions: movedCount.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category spending summary
// @route   GET /api/categories/summary
// @access  Private
const getCategorySummary = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const categories = await Category.find({ user: req.user.id });

    const spending = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const spendingMap = {};
    spending.forEach((s) => {
      spendingMap[s._id] = { total: s.total, count: s.count };
    });

    const summary = categories.map((cat) => {
      const spent = spendingMap[cat.name]?.total || 0;
      const count = spendingMap[cat.name]?.count || 0;
      const hasLimit = cat.budgetLimit !== null && cat.budgetLimit > 0;

      return {
        _id: cat._id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budgetLimit: cat.budgetLimit,
        currentSpent: spent,
        transactionCount: count,
        percentage: hasLimit
          ? Math.round((spent / cat.budgetLimit) * 100)
          : null,
        remaining: hasLimit ? Math.max(0, cat.budgetLimit - spent) : null,
        isOverBudget: hasLimit && spent > cat.budgetLimit,
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategorySummary,
};

const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Goal = require("../models/Goal");
const DebtPerson = require("../models/DebtPerson");
const RecurringExpense = require("../models/RecurringExpense");
const Category = require("../models/Category");

// @desc    Get all records modified since a given timestamp
// @route   GET /api/changelog
// @access  Private
const getChangelog = async (req, res) => {
  try {
    const { since } = req.query;

    if (!since) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'since' parameter (ISO date string)",
      });
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Use ISO format (e.g., 2025-12-25T00:00:00Z)",
      });
    }

    const userId = req.user.id;

    // Fetch all models modified since the given date
    const [
      transactions,
      accounts,
      goals,
      debtPersons,
      recurringExpenses,
      categories,
    ] = await Promise.all([
      Transaction.find({
        user: userId,
        $or: [
          { createdAt: { $gte: sinceDate } },
          { updatedAt: { $gte: sinceDate } },
        ],
      })
        .populate("account", "name type")
        .sort({ updatedAt: -1 }),
      Account.find({
        user: userId,
        $or: [
          { createdAt: { $gte: sinceDate } },
          { updatedAt: { $gte: sinceDate } },
        ],
      }).sort({ updatedAt: -1 }),
      Goal.find({
        user: userId,
        $or: [
          { createdAt: { $gte: sinceDate } },
          { updatedAt: { $gte: sinceDate } },
        ],
      }).sort({ updatedAt: -1 }),
      DebtPerson.find({
        user: userId,
        $or: [
          { createdAt: { $gte: sinceDate } },
          { updatedAt: { $gte: sinceDate } },
        ],
      }).sort({ updatedAt: -1 }),
      RecurringExpense.find({
        user: userId,
        $or: [
          { createdAt: { $gte: sinceDate } },
          { updatedAt: { $gte: sinceDate } },
        ],
      })
        .populate("account", "name type")
        .sort({ updatedAt: -1 }),
      Category.find({
        user: userId,
        $or: [
          { createdAt: { $gte: sinceDate } },
          { updatedAt: { $gte: sinceDate } },
        ],
      }).sort({ updatedAt: -1 }),
    ]);

    const totalChanges =
      transactions.length +
      accounts.length +
      goals.length +
      debtPersons.length +
      recurringExpenses.length +
      categories.length;

    res.json({
      success: true,
      since: sinceDate.toISOString(),
      queriedAt: new Date().toISOString(),
      totalChanges,
      data: {
        transactions: {
          count: transactions.length,
          records: transactions,
        },
        accounts: {
          count: accounts.length,
          records: accounts,
        },
        goals: {
          count: goals.length,
          records: goals,
        },
        debtPersons: {
          count: debtPersons.length,
          records: debtPersons,
        },
        recurringExpenses: {
          count: recurringExpenses.length,
          records: recurringExpenses,
        },
        categories: {
          count: categories.length,
          records: categories,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChangelog,
};

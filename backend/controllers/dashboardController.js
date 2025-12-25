const Transaction = require("../models/Transaction");

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get this month's summary
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get all-time summary
    const allTimeData = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Parse results
    const parseData = (data) => {
      const income = data.find((d) => d._id === "income") || {
        total: 0,
        count: 0,
      };
      const expense = data.find((d) => d._id === "expense") || {
        total: 0,
        count: 0,
      };
      return {
        totalIncome: income.total,
        totalExpense: expense.total,
        netBalance: income.total - expense.total,
        incomeCount: income.count,
        expenseCount: expense.count,
      };
    };

    res.json({
      success: true,
      data: {
        thisMonth: parseData(monthlyData),
        allTime: parseData(allTimeData),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions by category
// @route   GET /api/dashboard/by-category
// @access  Private
const getByCategory = async (req, res) => {
  try {
    const { type = "expense", period } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === "week") {
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (period === "month") {
      dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    }

    const matchStage = { user: req.user._id, type };
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter;
    }

    const categoryData = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: categoryData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions by date
// @route   GET /api/dashboard/by-date
// @access  Private
const getByDate = async (req, res) => {
  try {
    const { days = 30, type } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const matchStage = {
      user: req.user._id,
      date: { $gte: startDate },
    };
    if (type) matchStage.type = type;

    const dateData = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    res.json({ success: true, data: dateData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transactions by account
// @route   GET /api/dashboard/by-account
// @access  Private
const getByAccount = async (req, res) => {
  try {
    const accountData = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { account: "$account", type: "$type" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "_id.account",
          foreignField: "_id",
          as: "accountInfo",
        },
      },
      { $unwind: "$accountInfo" },
      {
        $project: {
          accountId: "$_id.account",
          accountName: "$accountInfo.name",
          accountType: "$accountInfo.type",
          transactionType: "$_id.type",
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: accountData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top payees
// @route   GET /api/dashboard/by-payee
// @access  Private
const getByPayee = async (req, res) => {
  try {
    const { limit = 10, type = "expense" } = req.query;

    const payeeData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type,
          payee: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$payee",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ success: true, data: payeeData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get spending trends
// @route   GET /api/dashboard/trends
// @access  Private
const getTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ success: true, data: monthlyTrends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSummary,
  getByCategory,
  getByDate,
  getByAccount,
  getByPayee,
  getTrends,
};

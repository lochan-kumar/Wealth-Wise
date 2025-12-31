const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const { generateExcel, generatePDF } = require("../utils/exportHelpers");

// @desc    Export transactions to Excel
// @route   GET /api/export/excel
// @access  Private
const exportToExcel = async (req, res) => {
  try {
    const { startDate, endDate, category, type, account } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (category) query.category = category;
    if (type) query.type = type;
    if (account) query.account = account;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("account", "name")
      .sort({ date: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found for the given criteria",
      });
    }

    await generateExcel(transactions, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export transactions to PDF
// @route   GET /api/export/pdf
// @access  Private
const exportToPDF = async (req, res) => {
  try {
    const { startDate, endDate, category, type, account } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (category) query.category = category;
    if (type) query.type = type;
    if (account) query.account = account;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("account", "name")
      .sort({ date: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found for the given criteria",
      });
    }

    generatePDF(transactions, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate spending insights report
// @route   GET /api/export/spending-report
// @access  Private
const generateSpendingReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    const Category = require("../models/Category");

    // Build date query
    const dateQuery = { user: req.user.id };
    let dateRangeStart = new Date();
    let dateRangeEnd = new Date();

    if (startDate && endDate) {
      dateRangeStart = new Date(startDate);
      dateRangeEnd = new Date(endDate);
    } else {
      // Default to current month
      dateRangeStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      dateRangeEnd = new Date();
    }

    dateQuery.date = { $gte: dateRangeStart, $lte: dateRangeEnd };

    const Transaction = require("../models/Transaction");
    const transactions = await Transaction.find(dateQuery)
      .populate("account", "name")
      .sort({ date: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found for the given period",
      });
    }

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    // Category breakdown (for expenses) - use ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: "expense",
          date: { $gte: dateRangeStart, $lte: dateRangeEnd },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Top categories
    const topCategories = categoryBreakdown.slice(0, 5);

    // Get budget analysis
    const categories = await Category.find({
      user: req.user.id,
      budgetLimit: { $gt: 0 },
    });

    const budgetAnalysis = [];
    for (const cat of categories) {
      const spent =
        categoryBreakdown.find((c) => c._id === cat.name)?.total || 0;
      budgetAnalysis.push({
        category: cat.name,
        limit: cat.budgetLimit,
        spent: spent,
      });
    }

    // Monthly trend (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const monthlyTrend = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedMonthlyTrend = monthlyTrend.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      income: m.income,
      expense: m.expense,
    }));

    // Build report data
    const reportData = {
      transactions,
      dateRange: {
        start: dateRangeStart.toLocaleDateString(),
        end: dateRangeEnd.toLocaleDateString(),
      },
      reportType: reportType || "full",
      summary: {
        totalIncome,
        totalExpense,
        categoryBreakdown,
        topCategories,
        budgetAnalysis,
        monthlyTrend: formattedMonthlyTrend,
      },
    };

    const { generateSpendingReportPDF } = require("../utils/exportHelpers");
    generateSpendingReportPDF(reportData, res);
  } catch (error) {
    console.error("Spending report error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { exportToExcel, exportToPDF, generateSpendingReport };

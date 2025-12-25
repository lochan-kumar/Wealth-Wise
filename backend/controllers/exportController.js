const Transaction = require("../models/Transaction");
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

module.exports = { exportToExcel, exportToPDF };

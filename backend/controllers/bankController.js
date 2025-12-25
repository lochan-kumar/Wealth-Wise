const BankAccount = require("../models/BankAccount");
const Expense = require("../models/Expense");
const {
  simulateBankLookup,
  generateTransactions,
} = require("../utils/bankSimulator");

// @desc    Link a bank account (simulated)
// @route   POST /api/bank/link
// @access  Private
const linkBankAccount = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide account number" });
    }

    // Simulate bank lookup
    const bankInfo = simulateBankLookup(accountNumber);

    if (!bankInfo.found) {
      return res
        .status(404)
        .json({ success: false, message: "Bank account not found" });
    }

    // Check if already linked
    const existingAccount = await BankAccount.findOne({
      user: req.user.id,
      accountNumber,
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "This account is already linked",
      });
    }

    // Create bank account link
    const bankAccount = await BankAccount.create({
      user: req.user.id,
      accountNumber,
      bankName: bankInfo.bankName,
    });

    res.status(201).json({
      success: true,
      message: `Successfully linked ${bankInfo.bankName} account`,
      data: bankAccount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all linked bank accounts
// @route   GET /api/bank/accounts
// @access  Private
const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user.id });
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch transactions from bank (simulated)
// @route   POST /api/bank/fetch-transactions
// @access  Private
const fetchTransactions = async (req, res) => {
  try {
    const { accountId } = req.body;

    // Verify account belongs to user
    const account = await BankAccount.findOne({
      _id: accountId,
      user: req.user.id,
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Bank account not found" });
    }

    // Generate dummy transactions
    const transactions = generateTransactions(15);

    // Save transactions as expenses
    const savedExpenses = await Promise.all(
      transactions.map((t) =>
        Expense.create({
          user: req.user.id,
          amount: t.amount,
          description: t.description,
          category: t.category,
          merchant: t.merchant,
          date: t.date,
          source: "bank",
        })
      )
    );

    res.json({
      success: true,
      message: `Fetched ${savedExpenses.length} transactions from ${account.bankName}`,
      data: savedExpenses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unlink a bank account
// @route   DELETE /api/bank/unlink/:id
// @access  Private
const unlinkBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Bank account not found" });
    }

    await account.deleteOne();

    res.json({
      success: true,
      message: "Bank account unlinked successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  linkBankAccount,
  getBankAccounts,
  fetchTransactions,
  unlinkBankAccount,
};

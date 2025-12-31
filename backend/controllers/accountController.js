const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const { generateTransactions } = require("../utils/bankSimulator");

// @desc    Get all accounts for user
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: 1,
    });
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available banks list
// @route   GET /api/accounts/banks
// @access  Private
const getAvailableBanks = async (req, res) => {
  try {
    const banks = Account.getAvailableBanks();
    res.json({ success: true, data: banks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Link a bank account
// @route   POST /api/accounts/link-bank
// @access  Private
const linkBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber } = req.body;

    // Validate inputs
    if (!bankName || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide bank name and account number",
      });
    }

    // Check if bank is valid
    const validBanks = Account.getAvailableBanks();
    if (!validBanks.includes(bankName)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid bank name. Use GET /api/accounts/banks to see available banks.",
      });
    }

    // Check if account already linked
    const existingAccount = await Account.findOne({
      user: req.user.id,
      accountNumber,
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "This account is already linked",
      });
    }

    // Create bank account
    const account = await Account.create({
      user: req.user.id,
      name: `${bankName} - ****${accountNumber.slice(-4)}`,
      type: "bank",
      bankName,
      accountNumber,
      isDefault: false,
    });

    // Fetch user's categories for generating transactions
    const userCategories = await Category.find({ user: req.user.id });

    // Auto-fetch dummy transactions (100 transactions spanning 1 year, using user's categories)
    const dummyTransactions = generateTransactions(100, {
      daysSpan: 365,
      userCategories: userCategories.map((c) => ({
        name: c.name,
        type: c.type,
      })),
    });

    // Calculate balance change from transactions
    let balanceChange = 0;

    const savedTransactions = await Promise.all(
      dummyTransactions.map((t) => {
        // Update balance change: income adds, expense subtracts
        if (t.type === "income") {
          balanceChange += t.amount;
        } else {
          balanceChange -= t.amount;
        }

        return Transaction.create({
          user: req.user.id,
          account: account._id,
          type: t.type, // Use the type from the transaction (income or expense)
          amount: t.amount,
          description: t.description,
          category: t.category,
          payee: t.payee,
          date: t.date,
          source: "bank",
        });
      })
    );

    // Update account balance
    account.balance += balanceChange;
    account.updatedAt = new Date();
    await account.save();

    // Count income and expense transactions
    const incomeCount = savedTransactions.filter(
      (t) => t.type === "income"
    ).length;
    const expenseCount = savedTransactions.filter(
      (t) => t.type === "expense"
    ).length;

    res.status(201).json({
      success: true,
      message: `Successfully linked ${bankName} and imported ${savedTransactions.length} transactions (${incomeCount} income, ${expenseCount} expense)`,
      data: {
        account,
        transactionsImported: savedTransactions.length,
        balanceChange,
        incomeCount,
        expenseCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unlink a bank account
// @route   DELETE /api/accounts/:id
// @access  Private
const unlinkAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    if (account.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete default Cash account",
      });
    }

    await account.deleteOne();

    res.json({
      success: true,
      message: "Account unlinked successfully",
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update account balance
// @route   PUT /api/accounts/:id
// @access  Private
const updateAccountBalance = async (req, res) => {
  try {
    const { balance } = req.body;

    if (balance === undefined || balance === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide a balance value",
      });
    }

    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    account.balance = balance;
    account.updatedAt = new Date();
    await account.save();

    res.json({
      success: true,
      message: "Balance updated successfully",
      data: account,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAccounts,
  getAvailableBanks,
  linkBankAccount,
  unlinkAccount,
  updateAccountBalance,
};

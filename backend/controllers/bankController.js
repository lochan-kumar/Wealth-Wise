const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
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

    if (!accountId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide account ID" });
    }

    // Verify account belongs to user
    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id,
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found" });
    }

    // Generate dummy transactions (mix of income and expense)
    const transactions = generateTransactions(15);

    // Calculate balance change from transactions
    let balanceChange = 0;

    // Save transactions using Transaction model
    const savedTransactions = await Promise.all(
      transactions.map((t) => {
        // Update balance change: income adds, expense subtracts
        if (t.type === "income") {
          balanceChange += t.amount;
        } else {
          balanceChange -= t.amount;
        }

        return Transaction.create({
          user: req.user.id,
          account: accountId,
          type: t.type,
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

    res.json({
      success: true,
      message: `Fetched ${savedTransactions.length} transactions (${incomeCount} income, ${expenseCount} expense) from bank`,
      data: {
        transactions: savedTransactions,
        balanceChange: balanceChange,
        newBalance: account.balance,
      },
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

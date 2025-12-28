const DebtPerson = require("../models/DebtPerson");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

// @desc    Get all debt persons for user
// @route   GET /api/debts
// @access  Private
const getDebtPersons = async (req, res) => {
  try {
    const persons = await DebtPerson.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json({ success: true, count: persons.length, data: persons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single debt person with transactions
// @route   GET /api/debts/:id
// @access  Private
const getDebtPerson = async (req, res) => {
  try {
    const person = await DebtPerson.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    res.json({ success: true, data: person });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create debt person
// @route   POST /api/debts
// @access  Private
const createDebtPerson = async (req, res) => {
  try {
    const { name, phone, notes } = req.body;

    // Check if person with same name already exists
    const existing = await DebtPerson.findOne({
      user: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A person with this name already exists",
      });
    }

    const person = await DebtPerson.create({
      user: req.user.id,
      name,
      phone,
      notes,
      transactions: [],
    });

    res.status(201).json({ success: true, data: person });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update debt person details
// @route   PUT /api/debts/:id
// @access  Private
const updateDebtPerson = async (req, res) => {
  try {
    const { name, phone, notes } = req.body;

    let person = await DebtPerson.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    if (name) person.name = name;
    if (phone !== undefined) person.phone = phone;
    if (notes !== undefined) person.notes = notes;

    await person.save();

    res.json({ success: true, data: person });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add transaction to debt person
// @route   POST /api/debts/:id/transaction
// @access  Private
const addDebtTransaction = async (req, res) => {
  try {
    const { type, amount, description, date, accountId } = req.body;

    if (!["borrowed", "lent", "repaid", "received"].includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction type. Must be: borrowed, lent, repaid, or received",
      });
    }

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid amount" });
    }

    const person = await DebtPerson.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    let linkedTransaction = null;

    // Create a main transaction if account is specified
    if (accountId) {
      const account = await Account.findOne({
        _id: accountId,
        user: req.user.id,
      });

      if (!account) {
        return res.status(400).json({
          success: false,
          message: "Invalid account",
        });
      }

      // Check balance for outgoing transactions (lent, repaid)
      if ((type === "lent" || type === "repaid") && account.balance < amount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Account has ₹${account.balance.toLocaleString()} but transaction is ₹${amount.toLocaleString()}.`,
        });
      }

      // Determine transaction type and description
      let transactionType, transactionDescription, balanceChange;

      switch (type) {
        case "borrowed":
          // You borrowed from them = money coming to you (income to your account)
          transactionType = "income";
          transactionDescription = `Borrowed from ${person.name}`;
          balanceChange = amount;
          break;
        case "lent":
          // You lent to them = money going out (expense from your account)
          transactionType = "expense";
          transactionDescription = `Lent to ${person.name}`;
          balanceChange = -amount;
          break;
        case "repaid":
          // You repaid them = money going out (expense from your account)
          transactionType = "expense";
          transactionDescription = `Repaid to ${person.name}`;
          balanceChange = -amount;
          break;
        case "received":
          // They repaid you = money coming in (income to your account)
          transactionType = "income";
          transactionDescription = `Received from ${person.name}`;
          balanceChange = amount;
          break;
      }

      // Create the transaction
      linkedTransaction = await Transaction.create({
        user: req.user.id,
        account: accountId,
        type: transactionType,
        amount: amount,
        description: description || transactionDescription,
        category: "Other",
        payee: person.name,
        date: date || new Date(),
        source: "manual",
      });

      // Update account balance
      await Account.findByIdAndUpdate(accountId, {
        $inc: { balance: balanceChange },
        updatedAt: new Date(),
      });
    }

    // Add to person's transaction history
    person.transactions.push({
      type,
      amount,
      description: description || "",
      date: date || new Date(),
      linkedTransaction: linkedTransaction?._id || null,
    });

    await person.save();

    res.status(201).json({
      success: true,
      message: `Transaction added. ${
        linkedTransaction ? "Also created in main transactions." : ""
      }`,
      data: person,
      linkedTransactionId: linkedTransaction?._id || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a transaction from debt person (also deletes linked main transaction)
// @route   DELETE /api/debts/:id/transaction/:transactionId
// @access  Private
const deleteDebtTransaction = async (req, res) => {
  try {
    const person = await DebtPerson.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    const transactionIndex = person.transactions.findIndex(
      (t) => t._id.toString() === req.params.transactionId
    );

    if (transactionIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const removedTx = person.transactions[transactionIndex];
    let linkedDeleted = false;

    // Delete the linked main transaction if exists
    if (removedTx.linkedTransaction) {
      const linkedTx = await Transaction.findById(removedTx.linkedTransaction);
      if (linkedTx) {
        // Reverse account balance
        const balanceReverse =
          linkedTx.type === "income" ? -linkedTx.amount : linkedTx.amount;
        await Account.findByIdAndUpdate(linkedTx.account, {
          $inc: { balance: balanceReverse },
          updatedAt: new Date(),
        });
        await linkedTx.deleteOne();
        linkedDeleted = true;
      }
    }

    // Remove from debt person's history
    person.transactions.splice(transactionIndex, 1);
    await person.save();

    res.json({
      success: true,
      message: linkedDeleted
        ? "Transaction deleted from both debt history and main transactions"
        : "Transaction removed from debt history",
      data: person,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete debt person
// @route   DELETE /api/debts/:id
// @access  Private
const deleteDebtPerson = async (req, res) => {
  try {
    const person = await DebtPerson.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!person) {
      return res
        .status(404)
        .json({ success: false, message: "Person not found" });
    }

    await person.deleteOne();
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get debt summary
// @route   GET /api/debts/summary
// @access  Private
const getDebtSummary = async (req, res) => {
  try {
    const persons = await DebtPerson.find({ user: req.user.id });

    const summary = {
      theyOwe: {
        count: 0,
        total: 0,
        persons: [],
      },
      youOwe: {
        count: 0,
        total: 0,
        persons: [],
      },
      settled: {
        count: 0,
      },
    };

    persons.forEach((person) => {
      const balance = person.balance;
      if (balance > 0) {
        summary.theyOwe.count++;
        summary.theyOwe.total += balance;
        summary.theyOwe.persons.push({ name: person.name, amount: balance });
      } else if (balance < 0) {
        summary.youOwe.count++;
        summary.youOwe.total += Math.abs(balance);
        summary.youOwe.persons.push({
          name: person.name,
          amount: Math.abs(balance),
        });
      } else {
        summary.settled.count++;
      }
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDebtPersons,
  getDebtPerson,
  createDebtPerson,
  updateDebtPerson,
  addDebtTransaction,
  deleteDebtTransaction,
  deleteDebtPerson,
  getDebtSummary,
};

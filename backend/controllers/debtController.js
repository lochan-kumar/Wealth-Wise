const Debt = require("../models/Debt");

// @desc    Get all debts for user
// @route   GET /api/debts
// @access  Private
const getDebts = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = { user: req.user.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const debts = await Debt.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: debts.length, data: debts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single debt
// @route   GET /api/debts/:id
// @access  Private
const getDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!debt) {
      return res
        .status(404)
        .json({ success: false, message: "Debt not found" });
    }

    res.json({ success: true, data: debt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create debt
// @route   POST /api/debts
// @access  Private
const createDebt = async (req, res) => {
  try {
    const { personName, type, originalAmount, description, dueDate } = req.body;

    const debt = await Debt.create({
      user: req.user.id,
      personName,
      type,
      originalAmount,
      remainingAmount: originalAmount,
      description,
      dueDate,
    });

    res.status(201).json({ success: true, data: debt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update debt
// @route   PUT /api/debts/:id
// @access  Private
const updateDebt = async (req, res) => {
  try {
    let debt = await Debt.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!debt) {
      return res
        .status(404)
        .json({ success: false, message: "Debt not found" });
    }

    // Don't allow updating originalAmount or remainingAmount directly
    const { personName, description, dueDate, status } = req.body;
    const updateData = {};
    if (personName) updateData.personName = personName;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (status) updateData.status = status;

    debt = await Debt.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: debt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record a payment on debt
// @route   POST /api/debts/:id/payment
// @access  Private
const recordPayment = async (req, res) => {
  try {
    const { amount, note } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid amount" });
    }

    const debt = await Debt.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!debt) {
      return res
        .status(404)
        .json({ success: false, message: "Debt not found" });
    }

    if (debt.status === "settled") {
      return res
        .status(400)
        .json({ success: false, message: "This debt is already settled" });
    }

    // Add payment to history
    debt.payments.push({
      amount,
      date: new Date(),
      note: note || "",
    });

    // Update remaining amount
    debt.remainingAmount = Math.max(0, debt.remainingAmount - amount);

    await debt.save();

    res.json({
      success: true,
      message: "Payment recorded successfully",
      data: debt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete debt
// @route   DELETE /api/debts/:id
// @access  Private
const deleteDebt = async (req, res) => {
  try {
    const debt = await Debt.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!debt) {
      return res
        .status(404)
        .json({ success: false, message: "Debt not found" });
    }

    await debt.deleteOne();
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
    const debts = await Debt.find({
      user: req.user.id,
      status: { $ne: "settled" },
    });

    const summary = {
      owedToMe: {
        count: 0,
        total: 0,
      },
      iOwe: {
        count: 0,
        total: 0,
      },
    };

    debts.forEach((debt) => {
      if (debt.type === "owed_to_me") {
        summary.owedToMe.count++;
        summary.owedToMe.total += debt.remainingAmount;
      } else {
        summary.iOwe.count++;
        summary.iOwe.total += debt.remainingAmount;
      }
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDebts,
  getDebt,
  createDebt,
  updateDebt,
  recordPayment,
  deleteDebt,
  getDebtSummary,
};

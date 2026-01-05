const SplitGroup = require("../models/SplitGroup");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { createNotification } = require("./notificationController");

// @desc    Get all groups for current user
// @route   GET /api/split-groups
exports.getSplitGroups = async (req, res) => {
  try {
    const groups = await SplitGroup.find({
      $or: [
        { createdBy: req.user._id },
        { members: { $elemMatch: { user: req.user._id, status: "accepted" } } },
      ],
    })
      .populate("createdBy", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    // Calculate summary for each group
    const groupsWithSummary = groups.map((group) => {
      const balances = group.calculateBalances();
      const userBalance = balances[req.user._id.toString()] || 0;
      return {
        ...group.toObject(),
        userBalance,
        totalExpenses: group.expenses.reduce((sum, e) => sum + e.amount, 0),
        memberCount:
          group.members.filter((m) => m.status === "accepted").length + 1,
      };
    });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groupsWithSummary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message,
    });
  }
};

// @desc    Get pending invites for current user
// @route   GET /api/split-groups/invites
exports.getPendingInvites = async (req, res) => {
  try {
    const groups = await SplitGroup.find({
      "members.user": req.user._id,
      "members.status": "pending",
    })
      .populate("createdBy", "name email")
      .populate("members.invitedBy", "name email");

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching invites",
      error: error.message,
    });
  }
};

// @desc    Create new group
// @route   POST /api/split-groups
exports.createSplitGroup = async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await SplitGroup.create({
      name,
      description,
      createdBy: req.user._id,
      members: [],
    });

    await group.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating group",
      error: error.message,
    });
  }
};

// @desc    Get group details
// @route   GET /api/split-groups/:id
exports.getSplitGroup = async (req, res) => {
  try {
    const group = await SplitGroup.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.user", "name email")
      .populate("members.invitedBy", "name email")
      .populate("expenses.paidBy", "name email")
      .populate("expenses.createdBy", "name email")
      .populate("expenses.splits.user", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member or creator
    const isMember =
      group.createdBy._id.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          m.user._id.toString() === req.user._id.toString() &&
          m.status === "accepted"
      );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this group",
      });
    }

    const balances = group.calculateBalances();
    const rawDebts = group.getSimplifiedDebts();

    // Build a lookup map from all members + creator
    const userMap = {};
    userMap[group.createdBy._id.toString()] = {
      _id: group.createdBy._id,
      name: group.createdBy.name,
      email: group.createdBy.email,
    };
    group.members.forEach((m) => {
      if (m.user && m.status === "accepted") {
        userMap[m.user._id.toString()] = {
          _id: m.user._id,
          name: m.user.name,
          email: m.user.email,
        };
      }
    });

    // Populate user info in debts for easier frontend display
    const debts = rawDebts.map((debt) => {
      return {
        from: debt.from,
        to: debt.to,
        amount: debt.amount,
        fromUser: userMap[debt.from] || null,
        toUser: userMap[debt.to] || null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...group.toObject(),
        balances,
        debts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group",
      error: error.message,
    });
  }
};

// @desc    Update group
// @route   PUT /api/split-groups/:id
exports.updateSplitGroup = async (req, res) => {
  try {
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only creator can update
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only creator can update group",
      });
    }

    const { name, description, autoCreateTransaction } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (autoCreateTransaction !== undefined)
      group.autoCreateTransaction = autoCreateTransaction;

    await group.save();

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating group",
      error: error.message,
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/split-groups/:id
exports.deleteSplitGroup = async (req, res) => {
  try {
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Only creator can delete
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only creator can delete group",
      });
    }

    // Notify all members
    for (const member of group.members) {
      if (member.status === "accepted") {
        await createNotification(
          member.user,
          "group_deleted",
          "Group Deleted",
          `The group "${group.name}" has been deleted by the creator.`,
          { groupId: group._id }
        );
      }
    }

    await group.deleteOne();

    res.status(200).json({
      success: true,
      message: "Group deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting group",
      error: error.message,
    });
  }
};

// @desc    Invite member by email
// @route   POST /api/split-groups/:id/invite
exports.inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member or creator
    const isMember =
      group.createdBy.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          m.user.toString() === req.user._id.toString() &&
          m.status === "accepted"
      );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Only group members can invite others",
      });
    }

    // Find user by email
    const userToInvite = await User.findOne({ email: email.toLowerCase() });

    if (!userToInvite) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found",
      });
    }

    // Check if already member or invited
    const existingMember = group.members.find(
      (m) => m.user.toString() === userToInvite._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message:
          existingMember.status === "accepted"
            ? "User is already a member"
            : existingMember.status === "pending"
            ? "User already has a pending invite"
            : "User previously declined. Remove and re-invite.",
      });
    }

    // Check if it's the creator
    if (group.createdBy.toString() === userToInvite._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot invite the group creator",
      });
    }

    // Add to members as pending
    group.members.push({
      user: userToInvite._id,
      status: "pending",
      invitedBy: req.user._id,
    });

    await group.save();

    // Send notification to invited user
    await createNotification(
      userToInvite._id,
      "group_invite",
      "Group Invite",
      `${req.user.name} invited you to join "${group.name}"`,
      { groupId: group._id, inviterId: req.user._id }
    );

    res.status(200).json({
      success: true,
      message: "Invite sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error inviting member",
      error: error.message,
    });
  }
};

// @desc    Respond to invite (accept/decline)
// @route   PUT /api/split-groups/:id/respond
exports.respondToInvite = async (req, res) => {
  try {
    const { accept } = req.body;
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const memberIndex = group.members.findIndex(
      (m) =>
        m.user.toString() === req.user._id.toString() && m.status === "pending"
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No pending invite found",
      });
    }

    if (accept) {
      group.members[memberIndex].status = "accepted";
      group.members[memberIndex].joinedAt = new Date();

      // Notify the inviter
      await createNotification(
        group.members[memberIndex].invitedBy,
        "invite_accepted",
        "Invite Accepted",
        `${req.user.name} accepted your invite to "${group.name}"`,
        { groupId: group._id, userId: req.user._id }
      );
    } else {
      group.members[memberIndex].status = "declined";

      // Notify the inviter
      await createNotification(
        group.members[memberIndex].invitedBy,
        "invite_declined",
        "Invite Declined",
        `${req.user.name} declined your invite to "${group.name}"`,
        { groupId: group._id, userId: req.user._id }
      );
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: accept ? "Invite accepted" : "Invite declined",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error responding to invite",
      error: error.message,
    });
  }
};

// @desc    Leave group
// @route   DELETE /api/split-groups/:id/leave
exports.leaveGroup = async (req, res) => {
  try {
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Creator cannot leave, must delete
    if (group.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Creator cannot leave. Delete the group instead.",
      });
    }

    const memberIndex = group.members.findIndex(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    // Notify creator
    await createNotification(
      group.createdBy,
      "member_left",
      "Member Left",
      `${req.user.name} left the group "${group.name}"`,
      { groupId: group._id, userId: req.user._id }
    );

    res.status(200).json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error leaving group",
      error: error.message,
    });
  }
};

// @desc    Add expense to group
// @route   POST /api/split-groups/:id/expense
exports.addExpense = async (req, res) => {
  try {
    const { description, amount, splitType, customSplits, date } = req.body;
    const group = await SplitGroup.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.user", "name email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Check if user is member or creator
    const isMember =
      group.createdBy._id.toString() === req.user._id.toString() ||
      group.members.some(
        (m) =>
          m.user._id.toString() === req.user._id.toString() &&
          m.status === "accepted"
      );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Only group members can add expenses",
      });
    }

    // Get all accepted members including creator
    const allMemberIds = [
      group.createdBy._id.toString(),
      ...group.members
        .filter((m) => m.status === "accepted")
        .map((m) => m.user._id.toString()),
    ];

    let splits = [];

    if (splitType === "equal") {
      const splitAmount = amount / allMemberIds.length;
      splits = allMemberIds.map((userId) => ({
        user: userId,
        amount: Math.round(splitAmount * 100) / 100,
        percentage: 100 / allMemberIds.length,
      }));
    } else if (splitType === "percentage" && customSplits) {
      // Validate percentages add up to 100
      const totalPercentage = customSplits.reduce(
        (sum, s) => sum + s.percentage,
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: "Percentages must add up to 100",
        });
      }
      splits = customSplits.map((s) => ({
        user: s.userId,
        amount: Math.round(((amount * s.percentage) / 100) * 100) / 100,
        percentage: s.percentage,
      }));
    } else if (splitType === "custom" && customSplits) {
      // Validate custom amounts add up to total
      const totalCustom = customSplits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(totalCustom - amount) > 0.01) {
        return res.status(400).json({
          success: false,
          message: "Custom amounts must add up to total expense",
        });
      }
      splits = customSplits.map((s) => ({
        user: s.userId,
        amount: s.amount,
      }));
    }

    const expense = {
      description,
      amount,
      paidBy: req.user._id,
      splitType: splitType || "equal",
      splits,
      date: date || new Date(),
      createdBy: req.user._id,
    };

    group.expenses.push(expense);
    await group.save();

    // Notify other members about the expense
    for (const memberId of allMemberIds) {
      if (memberId !== req.user._id.toString()) {
        await createNotification(
          memberId,
          "expense_added",
          "New Expense",
          `${req.user.name} added ₹${amount} expense "${description}" in "${group.name}"`,
          { groupId: group._id, expenseId: expense._id }
        );
      }
    }

    await group.populate("expenses.paidBy", "name email");
    await group.populate("expenses.splits.user", "name email");

    res.status(201).json({
      success: true,
      data: group.expenses[group.expenses.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding expense",
      error: error.message,
    });
  }
};

// @desc    Delete expense from group
// @route   DELETE /api/split-groups/:id/expense/:expenseId
exports.deleteExpense = async (req, res) => {
  try {
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const expenseIndex = group.expenses.findIndex(
      (e) => e._id.toString() === req.params.expenseId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const expense = group.expenses[expenseIndex];

    // Only expense creator or group creator can delete
    if (
      expense.createdBy.toString() !== req.user._id.toString() &&
      group.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this expense",
      });
    }

    group.expenses.splice(expenseIndex, 1);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Expense deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting expense",
      error: error.message,
    });
  }
};

// @desc    Settle with member
// @route   POST /api/split-groups/:id/settle
exports.settleWithMember = async (req, res) => {
  try {
    const { memberId, amount } = req.body;
    const group = await SplitGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    // Helper to extract user ID
    const getUserId = (user) => {
      if (!user) return null;
      return (user._id || user).toString();
    };

    // Mark splits as settled
    let settledAmount = 0;
    group.expenses.forEach((expense) => {
      if (getUserId(expense.paidBy) === memberId) {
        const userSplit = expense.splits.find(
          (s) => getUserId(s.user) === req.user._id.toString() && !s.settled
        );
        if (userSplit && settledAmount < amount) {
          const toSettle = Math.min(userSplit.amount, amount - settledAmount);
          if (toSettle === userSplit.amount) {
            userSplit.settled = true;
            userSplit.settledAt = new Date();
          }
          settledAmount += toSettle;
        }
      }
    });

    await group.save();

    // Create transaction if enabled (requires user to have an account)
    if (group.autoCreateTransaction && amount > 0) {
      const Account = require("../models/Account");
      const userAccount = await Account.findOne({ user: req.user._id });
      if (userAccount) {
        await Transaction.create({
          user: req.user._id,
          account: userAccount._id,
          type: "expense",
          amount,
          description: `Settlement in "${group.name}"`,
          category: "Split Group Settlement",
          date: new Date(),
        });
      }
    }

    // Notify the member who received settlement
    const memberUser = await User.findById(memberId);
    await createNotification(
      memberId,
      "expense_added",
      "Settlement Received",
      `${req.user.name} settled ₹${amount} with you in "${group.name}"`,
      { groupId: group._id }
    );

    res.status(200).json({
      success: true,
      message: `Settled ₹${settledAmount}`,
      settledAmount,
    });
  } catch (error) {
    console.error("Settle error:", error);
    res.status(500).json({
      success: false,
      message: "Error settling",
      error: error.message,
    });
  }
};

// @desc    Search users by email
// @route   GET /api/split-groups/search-users
exports.searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || email.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please enter at least 3 characters",
      });
    }

    const users = await User.find({
      email: { $regex: email, $options: "i" },
      _id: { $ne: req.user._id },
    })
      .select("name email")
      .limit(10);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};

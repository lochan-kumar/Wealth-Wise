const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getSplitGroups,
  getPendingInvites,
  createSplitGroup,
  getSplitGroup,
  updateSplitGroup,
  deleteSplitGroup,
  inviteMember,
  respondToInvite,
  leaveGroup,
  addExpense,
  deleteExpense,
  settleWithMember,
  searchUsers,
} = require("../controllers/splitGroupController");

router.use(protect);

// User search for invites
router.get("/search-users", searchUsers);

// Pending invites
router.get("/invites", getPendingInvites);

// Groups CRUD
router.route("/").get(getSplitGroups).post(createSplitGroup);

router
  .route("/:id")
  .get(getSplitGroup)
  .put(updateSplitGroup)
  .delete(deleteSplitGroup);

// Member management
router.post("/:id/invite", inviteMember);
router.put("/:id/respond", respondToInvite);
router.delete("/:id/leave", leaveGroup);

// Expenses
router.post("/:id/expense", addExpense);
router.delete("/:id/expense/:expenseId", deleteExpense);

// Settlement
router.post("/:id/settle", settleWithMember);

module.exports = router;

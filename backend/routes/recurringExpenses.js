const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getRecurringExpenses,
  getRecurringExpense,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  processRecurringExpenses,
  processSingleRecurringExpense,
} = require("../controllers/recurringExpenseController");

// All routes require authentication
router.use(protect);

// Process recurring expenses (must come before /:id route)
router.post("/process", processRecurringExpenses);

// CRUD routes
router.route("/").get(getRecurringExpenses).post(createRecurringExpense);

// Process single recurring expense
router.post("/:id/process", processSingleRecurringExpense);

router
  .route("/:id")
  .get(getRecurringExpense)
  .put(updateRecurringExpense)
  .delete(deleteRecurringExpense);

module.exports = router;

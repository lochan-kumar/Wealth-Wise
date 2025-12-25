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
} = require("../controllers/recurringExpenseController");

// All routes require authentication
router.use(protect);

// Process recurring expenses (must come before /:id route)
router.post("/process", processRecurringExpenses);

// CRUD routes
router.route("/").get(getRecurringExpenses).post(createRecurringExpense);

router
  .route("/:id")
  .get(getRecurringExpense)
  .put(updateRecurringExpense)
  .delete(deleteRecurringExpense);

module.exports = router;

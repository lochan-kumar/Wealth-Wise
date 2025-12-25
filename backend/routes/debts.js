const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getDebtPersons,
  getDebtPerson,
  createDebtPerson,
  updateDebtPerson,
  addDebtTransaction,
  deleteDebtTransaction,
  deleteDebtPerson,
  getDebtSummary,
} = require("../controllers/debtPersonController");

// All routes require authentication
router.use(protect);

// Summary route (must come before /:id route)
router.get("/summary", getDebtSummary);

// Transaction routes
router.post("/:id/transaction", addDebtTransaction);
router.delete("/:id/transaction/:transactionId", deleteDebtTransaction);

// CRUD routes
router.route("/").get(getDebtPersons).post(createDebtPerson);
router
  .route("/:id")
  .get(getDebtPerson)
  .put(updateDebtPerson)
  .delete(deleteDebtPerson);

module.exports = router;

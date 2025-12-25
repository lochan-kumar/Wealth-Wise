const express = require("express");
const router = express.Router();
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
  resetBudget,
} = require("../controllers/budgetController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets with currentSpent
 */
router.get("/", getBudgets);

/**
 * @swagger
 * /api/budgets/status:
 *   get:
 *     summary: Get budget status with alerts (optimized - no aggregation)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget status with percentage, alerts, and remaining
 */
router.get("/status", getBudgetStatus);

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - limit
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other]
 *               limit:
 *                 type: number
 *               alertThreshold:
 *                 type: number
 *                 default: 80
 *     responses:
 *       201:
 *         description: Budget created
 */
router.post("/", createBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update budget limit/threshold
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget updated
 */
router.put("/:id", updateBudget);

/**
 * @swagger
 * /api/budgets/{id}/reset:
 *   post:
 *     summary: Manually reset budget currentSpent to 0
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget reset
 */
router.post("/:id/reset", resetBudget);

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Budget deleted
 */
router.delete("/:id", deleteBudget);

module.exports = router;

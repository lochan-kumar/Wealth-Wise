const express = require("express");
const router = express.Router();
const {
  getSummary,
  getByCategory,
  getByDate,
  getByAccount,
  getByPayee,
  getTrends,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get income/expense summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary with income, expense, and net balance
 */
router.get("/summary", getSummary);

/**
 * @swagger
 * /api/dashboard/by-category:
 *   get:
 *     summary: Get transactions by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           default: expense
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, all]
 *     responses:
 *       200:
 *         description: Category breakdown for charts
 */
router.get("/by-category", getByCategory);

/**
 * @swagger
 * /api/dashboard/by-date:
 *   get:
 *     summary: Get transactions over time
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *     responses:
 *       200:
 *         description: Daily totals for line charts
 */
router.get("/by-date", getByDate);

/**
 * @swagger
 * /api/dashboard/by-account:
 *   get:
 *     summary: Get transactions by account
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account breakdown
 */
router.get("/by-account", getByAccount);

/**
 * @swagger
 * /api/dashboard/by-payee:
 *   get:
 *     summary: Get top payees
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           default: expense
 *     responses:
 *       200:
 *         description: Top payees list
 */
router.get("/by-payee", getByPayee);

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get spending trends (last 6 months)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly income/expense trends
 */
router.get("/trends", getTrends);

module.exports = router;

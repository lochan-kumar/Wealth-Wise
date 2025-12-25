const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - account
 *         - amount
 *       properties:
 *         account:
 *           type: string
 *           description: Account ID (from /api/accounts)
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           default: expense
 *         amount:
 *           type: number
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [Food, Transport, Shopping, Bills, Entertainment, Health, Education, Salary, Investment, Other]
 *         payee:
 *           type: string
 *           description: Who you paid/received from
 *         date:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: account
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/", getTransactions);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post("/", createTransaction);

/**
 * @swagger
 * /api/transactions/all:
 *   delete:
 *     summary: Delete all transactions for user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All transactions deleted
 */
router.delete("/all", deleteAllTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get single transaction
 *     tags: [Transactions]
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
 *         description: Transaction details
 */
router.get("/:id", getTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     tags: [Transactions]
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
 *         description: Transaction updated
 */
router.put("/:id", updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     tags: [Transactions]
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
 *         description: Transaction deleted
 */
router.delete("/:id", deleteTransaction);

module.exports = router;

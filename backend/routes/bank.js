const express = require("express");
const router = express.Router();
const {
  linkBankAccount,
  getBankAccounts,
  fetchTransactions,
  unlinkBankAccount,
} = require("../controllers/bankController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /api/bank/link:
 *   post:
 *     summary: Link a bank account (simulated)
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountNumber
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 description: Bank account number to link
 *     responses:
 *       201:
 *         description: Bank account linked successfully
 *       400:
 *         description: Account already linked
 */
router.post("/link", linkBankAccount);

/**
 * @swagger
 * /api/bank/accounts:
 *   get:
 *     summary: Get all linked bank accounts
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked bank accounts
 */
router.get("/accounts", getBankAccounts);

/**
 * @swagger
 * /api/bank/fetch-transactions:
 *   post:
 *     summary: Fetch transactions from linked bank (simulated)
 *     tags: [Bank]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountId
 *             properties:
 *               accountId:
 *                 type: string
 *                 description: ID of linked bank account
 *     responses:
 *       200:
 *         description: Transactions fetched and saved as expenses
 */
router.post("/fetch-transactions", fetchTransactions);

/**
 * @swagger
 * /api/bank/unlink/{id}:
 *   delete:
 *     summary: Unlink a bank account
 *     tags: [Bank]
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
 *         description: Bank account unlinked
 */
router.delete("/unlink/:id", unlinkBankAccount);

module.exports = router;

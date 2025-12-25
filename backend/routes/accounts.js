const express = require("express");
const router = express.Router();
const {
  getAccounts,
  getAvailableBanks,
  linkBankAccount,
  unlinkAccount,
} = require("../controllers/accountController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all user accounts (Cash + linked banks)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accounts
 */
router.get("/", getAccounts);

/**
 * @swagger
 * /api/accounts/banks:
 *   get:
 *     summary: Get list of available banks to link
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bank names
 */
router.get("/banks", getAvailableBanks);

/**
 * @swagger
 * /api/accounts/link-bank:
 *   post:
 *     summary: Link a bank account (auto-fetches transactions)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankName
 *               - accountNumber
 *             properties:
 *               bankName:
 *                 type: string
 *                 description: Select from /api/accounts/banks list
 *               accountNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bank linked and transactions imported
 */
router.post("/link-bank", linkBankAccount);

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Unlink a bank account
 *     tags: [Accounts]
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
 *         description: Account unlinked
 */
router.delete("/:id", unlinkAccount);

module.exports = router;

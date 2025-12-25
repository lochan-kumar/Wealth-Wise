const express = require("express");
const router = express.Router();
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
} = require("../controllers/goalController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all financial goals
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, failed]
 *     responses:
 *       200:
 *         description: List of goals
 */
router.get("/", getGoals);

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a financial goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - targetAmount
 *             properties:
 *               name:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Goal created
 */
router.post("/", createGoal);

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     summary: Get single goal
 *     tags: [Goals]
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
 *         description: Goal details
 */
router.get("/:id", getGoal);

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     summary: Update goal
 *     tags: [Goals]
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
 *         description: Goal updated
 */
router.put("/:id", updateGoal);

/**
 * @swagger
 * /api/goals/{id}/progress:
 *   put:
 *     summary: Update goal progress
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to add to current progress
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put("/:id/progress", updateProgress);

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete goal
 *     tags: [Goals]
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
 *         description: Goal deleted
 */
router.delete("/:id", deleteGoal);

module.exports = router;

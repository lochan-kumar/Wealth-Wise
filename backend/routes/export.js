const express = require("express");
const router = express.Router();
const {
  exportToExcel,
  exportToPDF,
  generateSpendingReport,
} = require("../controllers/exportController");
const { protect } = require("../middleware/auth");

router.use(protect);

/**
 * @swagger
 * /api/export/excel:
 *   get:
 *     summary: Export expenses to Excel
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/excel", exportToExcel);

/**
 * @swagger
 * /api/export/pdf:
 *   get:
 *     summary: Export expenses to PDF
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/pdf", exportToPDF);

/**
 * @swagger
 * /api/export/spending-report:
 *   get:
 *     summary: Generate spending insights report
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [summary, category, full]
 *     responses:
 *       200:
 *         description: PDF spending report download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/spending-report", generateSpendingReport);

module.exports = router;

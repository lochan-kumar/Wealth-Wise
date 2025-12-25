const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// Generate Excel file from transactions
const generateExcel = async (transactions, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  // Add header row
  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Type", key: "type", width: 10 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Category", key: "category", width: 15 },
    { header: "Payee", key: "payee", width: 20 },
    { header: "Account", key: "account", width: 20 },
    { header: "Description", key: "description", width: 30 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F81BD" },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Add data rows
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((t) => {
    worksheet.addRow({
      date: new Date(t.date).toLocaleDateString(),
      type: t.type,
      amount: t.amount,
      category: t.category,
      payee: t.payee || "-",
      account: t.account?.name || "-",
      description: t.description || "-",
    });

    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  // Summary
  worksheet.addRow({});
  worksheet.addRow({ date: "Total Income", amount: totalIncome });
  worksheet.addRow({ date: "Total Expense", amount: totalExpense });
  worksheet.addRow({ date: "Net Balance", amount: totalIncome - totalExpense });

  // Set response headers
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=transactions.xlsx"
  );

  await workbook.xlsx.write(res);
};

// Generate PDF file from transactions
const generatePDF = (transactions, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=transactions.pdf");

  doc.pipe(res);

  // Title
  doc.fontSize(20).text("WealthWise Transaction Report", { align: "center" });
  doc.moveDown();
  doc
    .fontSize(10)
    .text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: "center",
    });
  doc.moveDown(2);

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;

  // Table header
  const tableTop = doc.y;
  doc.font("Helvetica-Bold").fontSize(9);
  doc.text("Date", 50, tableTop);
  doc.text("Type", 110, tableTop);
  doc.text("Amount", 160, tableTop);
  doc.text("Category", 220, tableTop);
  doc.text("Payee", 290, tableTop);
  doc.text("Account", 380, tableTop);

  doc
    .moveTo(50, tableTop + 12)
    .lineTo(550, tableTop + 12)
    .stroke();

  // Draw rows
  doc.font("Helvetica").fontSize(8);
  let y = tableTop + 20;

  transactions.forEach((t) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    doc.text(new Date(t.date).toLocaleDateString(), 50, y);
    doc.text(t.type, 110, y);
    doc.text(`₹${t.amount}`, 160, y);
    doc.text(t.category, 220, y);
    doc.text((t.payee || "-").substring(0, 15), 290, y);
    doc.text((t.account?.name || "-").substring(0, 15), 380, y);

    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;

    y += 15;
  });

  // Summary
  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(11);
  doc.text(`Total Income: ₹${totalIncome.toLocaleString()}`, 50, y + 20);
  doc.text(`Total Expense: ₹${totalExpense.toLocaleString()}`, 50, y + 35);
  doc.text(
    `Net Balance: ₹${(totalIncome - totalExpense).toLocaleString()}`,
    50,
    y + 50
  );

  doc.end();
};

module.exports = { generateExcel, generatePDF };

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
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, {
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

// Generate Spending Report PDF with insights
const generateSpendingReportPDF = (data, res) => {
  const { transactions, categories, summary, dateRange, reportType } = data;
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=spending_report.pdf"
  );

  doc.pipe(res);

  // Colors
  const emerald = "#059669";
  const darkSlate = "#1e293b";
  const lightGray = "#64748b";
  const bgLight = "#f1f5f9";

  // Header with background
  doc.rect(0, 0, doc.page.width, 120).fill("#059669");
  doc.fontSize(28).fillColor("#ffffff").text("WealthWise", 50, 35);
  doc
    .fontSize(14)
    .fillColor("#d1fae5")
    .text("Spending Insights Report", 50, 70);
  doc
    .fontSize(10)
    .fillColor("#a7f3d0")
    .text(`Report Period: ${dateRange.start} to ${dateRange.end}`, 50, 90);

  // Right side - Generated date
  doc
    .fontSize(9)
    .fillColor("#d1fae5")
    .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 90);

  doc.y = 140;

  // Calculate totals
  const totalIncome = summary.totalIncome || 0;
  const totalExpense = summary.totalExpense || 0;
  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Summary Cards Row
  const cardY = doc.y;
  const cardWidth = 160;
  const cardHeight = 60;
  const cardGap = 15;

  // Income Card
  doc.rect(50, cardY, cardWidth, cardHeight).fill("#dcfce7");
  doc
    .fontSize(9)
    .fillColor("#166534")
    .text("TOTAL INCOME", 60, cardY + 10);
  doc
    .fontSize(16)
    .fillColor("#15803d")
    .text(`Rs ${totalIncome.toLocaleString()}`, 60, cardY + 28);

  // Expense Card
  doc
    .rect(50 + cardWidth + cardGap, cardY, cardWidth, cardHeight)
    .fill("#fee2e2");
  doc
    .fontSize(9)
    .fillColor("#991b1b")
    .text("TOTAL EXPENSES", 60 + cardWidth + cardGap, cardY + 10);
  doc
    .fontSize(16)
    .fillColor("#dc2626")
    .text(
      `Rs ${totalExpense.toLocaleString()}`,
      60 + cardWidth + cardGap,
      cardY + 28
    );

  // Savings Card
  doc
    .rect(50 + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight)
    .fill("#dbeafe");
  doc
    .fontSize(9)
    .fillColor("#1e40af")
    .text("NET SAVINGS", 60 + (cardWidth + cardGap) * 2, cardY + 10);
  doc
    .fontSize(16)
    .fillColor(netSavings >= 0 ? "#2563eb" : "#dc2626")
    .text(
      `Rs ${netSavings.toLocaleString()}`,
      60 + (cardWidth + cardGap) * 2,
      cardY + 28
    );

  doc.y = cardY + cardHeight + 25;

  // Savings Rate indicator
  doc.rect(50, doc.y, 500, 35).fill(bgLight);
  doc
    .fontSize(11)
    .fillColor(darkSlate)
    .text(`Savings Rate: ${savingsRate}%`, 60, doc.y + 10);

  // Progress bar for savings rate
  const barWidth = 300;
  const barHeight = 8;
  const barX = 200;
  const barY = doc.y + 12;
  doc.rect(barX, barY, barWidth, barHeight).fill("#e2e8f0");
  const fillWidth = (Math.min(Math.max(savingsRate, 0), 100) * barWidth) / 100;
  doc
    .rect(barX, barY, fillWidth, barHeight)
    .fill(
      savingsRate >= 20 ? "#22c55e" : savingsRate >= 10 ? "#f59e0b" : "#ef4444"
    );

  doc.y = doc.y + 50;

  // Category Breakdown with Bar Chart
  if (summary.categoryBreakdown && summary.categoryBreakdown.length > 0) {
    doc.fontSize(14).fillColor(emerald).text("[CATEGORY BREAKDOWN]", 50, doc.y);
    doc.moveDown(0.8);

    const maxAmount = Math.max(
      ...summary.categoryBreakdown.map((c) => c.total)
    );
    const chartBarMaxWidth = 250;

    summary.categoryBreakdown.slice(0, 8).forEach((cat, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }

      const percentage =
        totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(1) : 0;
      const barFillWidth = (cat.total / maxAmount) * chartBarMaxWidth;
      const colors = [
        "#ef4444",
        "#f59e0b",
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#6b7280",
      ];

      // Category name
      doc
        .fontSize(10)
        .fillColor(darkSlate)
        .text(cat._id || "Other", 50, doc.y, { width: 100 });

      // Bar
      doc.rect(160, doc.y, chartBarMaxWidth, 12).fill("#e2e8f0");
      doc
        .rect(160, doc.y, barFillWidth, 12)
        .fill(colors[index % colors.length]);

      // Amount and percentage
      doc
        .fillColor(darkSlate)
        .text(`Rs ${cat.total.toLocaleString()} (${percentage}%)`, 420, doc.y);

      doc.y += 22;
    });
    doc.moveDown(1);
  }

  // Top Categories
  if (summary.topCategories && summary.topCategories.length > 0) {
    doc
      .fontSize(14)
      .fillColor(emerald)
      .text("[TOP SPENDING CATEGORIES]", 50, doc.y);
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor(darkSlate);
    summary.topCategories.slice(0, 5).forEach((cat, index) => {
      const rank = ["#1", "#2", "#3", "#4", "#5"][index];
      doc.text(
        `${rank}  ${cat._id}: Rs ${cat.total.toLocaleString()} (${
          cat.count
        } transactions)`
      );
    });
    doc.moveDown(1.5);
  }

  // Budget Analysis
  if (summary.budgetAnalysis && summary.budgetAnalysis.length > 0) {
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 50;
    }

    doc.fontSize(14).fillColor(emerald).text("[BUDGET VS ACTUAL]", 50, doc.y);
    doc.moveDown(0.8);

    summary.budgetAnalysis.forEach((budget) => {
      if (doc.y > 720) {
        doc.addPage();
        doc.y = 50;
      }

      const percentage =
        budget.limit > 0 ? ((budget.spent / budget.limit) * 100).toFixed(0) : 0;
      const status =
        budget.spent > budget.limit
          ? "OVER"
          : budget.spent >= budget.limit * 0.8
          ? "WARNING"
          : "OK";
      const statusColor =
        status === "OVER"
          ? "#ef4444"
          : status === "WARNING"
          ? "#f59e0b"
          : "#22c55e";

      doc
        .fontSize(10)
        .fillColor(darkSlate)
        .text(`${budget.category}:`, 50, doc.y, { continued: true });
      doc.text(
        ` Rs ${budget.spent.toLocaleString()} / Rs ${budget.limit.toLocaleString()} (${percentage}%) `,
        { continued: true }
      );
      doc.fillColor(statusColor).text(`[${status}]`);

      // Progress bar
      const budgetBarY = doc.y + 3;
      doc.rect(50, budgetBarY, 400, 6).fill("#e2e8f0");
      const budgetFillWidth = Math.min(percentage, 100) * 4;
      doc.rect(50, budgetBarY, budgetFillWidth, 6).fill(statusColor);

      doc.y += 20;
    });
    doc.moveDown(1);
  }

  // Monthly Trend
  if (summary.monthlyTrend && summary.monthlyTrend.length > 0) {
    if (doc.y > 600) {
      doc.addPage();
      doc.y = 50;
    }

    doc
      .fontSize(14)
      .fillColor(emerald)
      .text("[MONTHLY SPENDING TREND]", 50, doc.y);
    doc.moveDown(0.8);

    // Simple bar chart for monthly trend
    const maxExpense = Math.max(...summary.monthlyTrend.map((m) => m.expense));
    const trendBarMaxHeight = 80;
    const barStartY = doc.y + trendBarMaxHeight;
    const trendBarWidth = 60;

    summary.monthlyTrend.forEach((month, index) => {
      const barHeight =
        maxExpense > 0 ? (month.expense / maxExpense) * trendBarMaxHeight : 0;
      const barX = 80 + index * (trendBarWidth + 20);

      // Bar
      doc
        .rect(barX, barStartY - barHeight, trendBarWidth, barHeight)
        .fill("#3b82f6");

      // Month label
      doc
        .fontSize(8)
        .fillColor(darkSlate)
        .text(month.month, barX, barStartY + 5, {
          width: trendBarWidth,
          align: "center",
        });

      // Amount on top of bar
      doc
        .fontSize(7)
        .fillColor("#3b82f6")
        .text(
          `Rs ${(month.expense / 1000).toFixed(0)}K`,
          barX,
          barStartY - barHeight - 12,
          { width: trendBarWidth, align: "center" }
        );
    });

    doc.y = barStartY + 30;
    doc.moveDown(1);
  }

  // Key Insights
  if (doc.y > 650) {
    doc.addPage();
    doc.y = 50;
  }

  doc.fontSize(14).fillColor(emerald).text("[KEY INSIGHTS]", 50, doc.y);
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor(darkSlate);

  if (savingsRate >= 20) {
    doc.text("[+] Great job! You are saving more than 20% of your income.");
  } else if (savingsRate >= 10) {
    doc.text(
      "[~] Good savings rate. Consider increasing to 20% for better financial health."
    );
  } else if (savingsRate > 0) {
    doc.text(
      "[!] Your savings rate is low. Try to reduce discretionary spending."
    );
  } else {
    doc.text(
      "[X] You are spending more than you earn. Review your expenses urgently."
    );
  }

  if (summary.topCategories && summary.topCategories.length > 0) {
    const topCategory = summary.topCategories[0];
    doc.text(
      `[*] Your highest spending category is "${
        topCategory._id
      }" at Rs ${topCategory.total.toLocaleString()}.`
    );
  }

  // Footer
  doc.moveDown(3);
  doc
    .fontSize(8)
    .fillColor(lightGray)
    .text(
      "This report was generated by WealthWise - Your Personal Finance Manager",
      { align: "center" }
    );

  doc.end();
};

module.exports = { generateExcel, generatePDF, generateSpendingReportPDF };

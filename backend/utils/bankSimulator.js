const { detectCategory } = require("./categoryDetector");

// Simulated bank names
const bankNames = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
];

// Sample merchants for generating realistic expense transactions
const expenseMerchants = [
  { name: "Swiggy", category: "Food" },
  { name: "Zomato", category: "Food" },
  { name: "Amazon", category: "Shopping" },
  { name: "Flipkart", category: "Shopping" },
  { name: "Uber", category: "Transport" },
  { name: "Ola", category: "Transport" },
  { name: "Netflix", category: "Entertainment" },
  { name: "Spotify", category: "Entertainment" },
  { name: "Reliance Fresh", category: "Food" },
  { name: "Big Bazaar", category: "Shopping" },
  { name: "Apollo Pharmacy", category: "Health" },
  { name: "Airtel", category: "Bills" },
  { name: "Jio", category: "Bills" },
  { name: "Electricity Board", category: "Bills" },
  { name: "Shell Petrol", category: "Transport" },
  { name: "HP Petrol", category: "Transport" },
  { name: "PVR Cinemas", category: "Entertainment" },
  { name: "Udemy", category: "Education" },
  { name: "Coursera", category: "Education" },
  { name: "Gym Membership", category: "Health" },
];

// Sample income sources for generating realistic income transactions
const incomeSources = [
  { name: "Salary Credit", category: "Salary" },
  { name: "Company Payroll", category: "Salary" },
  { name: "Freelance Payment", category: "Freelance" },
  { name: "Client Payment", category: "Freelance" },
  { name: "Interest Credit", category: "Interest" },
  { name: "Bank Interest", category: "Interest" },
  { name: "Amazon Refund", category: "Refund" },
  { name: "Flipkart Refund", category: "Refund" },
  { name: "Cashback Credit", category: "Cashback" },
  { name: "Dividend Credit", category: "Investment" },
  { name: "Rental Income", category: "Rental" },
  { name: "Bonus Credit", category: "Salary" },
];

// Generate random amount based on category and transaction type
const getRandomAmount = (category, type = "expense") => {
  if (type === "income") {
    const incomeRanges = {
      Salary: { min: 30000, max: 100000 },
      Freelance: { min: 5000, max: 50000 },
      Interest: { min: 100, max: 2000 },
      Refund: { min: 200, max: 5000 },
      Cashback: { min: 50, max: 500 },
      Investment: { min: 1000, max: 10000 },
      Rental: { min: 10000, max: 30000 },
    };
    const range = incomeRanges[category] || { min: 1000, max: 10000 };
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  const expenseRanges = {
    Food: { min: 100, max: 2000 },
    Transport: { min: 50, max: 1500 },
    Shopping: { min: 200, max: 10000 },
    Bills: { min: 500, max: 5000 },
    Entertainment: { min: 100, max: 2000 },
    Health: { min: 200, max: 5000 },
    Education: { min: 500, max: 15000 },
    Other: { min: 100, max: 3000 },
  };

  const range = expenseRanges[category] || expenseRanges.Other;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

// Generate random date within last 30 days
const getRandomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  return new Date(now.setDate(now.getDate() - daysAgo));
};

// Simulate bank account lookup
const simulateBankLookup = (accountNumber) => {
  // Simulate that any account number works (for demo purposes)
  const bankIndex =
    Math.abs(
      accountNumber.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % bankNames.length;

  return {
    found: true,
    bankName: bankNames[bankIndex],
    accountNumber: accountNumber,
    accountHolder: "Account Holder",
  };
};

// Generate dummy transactions with both income and expense types
const generateTransactions = (count = 15) => {
  const transactions = [];

  // Generate ~30% income transactions and ~70% expense transactions
  const incomeCount = Math.floor(count * 0.3);
  const expenseCount = count - incomeCount;

  // Generate income transactions
  for (let i = 0; i < incomeCount; i++) {
    const incomeSource =
      incomeSources[Math.floor(Math.random() * incomeSources.length)];

    transactions.push({
      type: "income",
      amount: getRandomAmount(incomeSource.category, "income"),
      payee: incomeSource.name,
      category: incomeSource.category,
      description: `${incomeSource.name}`,
      date: getRandomDate(),
      source: "bank",
    });
  }

  // Generate expense transactions
  for (let i = 0; i < expenseCount; i++) {
    const merchantInfo =
      expenseMerchants[Math.floor(Math.random() * expenseMerchants.length)];
    const category = detectCategory(merchantInfo.name, "");

    transactions.push({
      type: "expense",
      amount: getRandomAmount(category, "expense"),
      payee: merchantInfo.name,
      category: category,
      description: `Payment to ${merchantInfo.name}`,
      date: getRandomDate(),
      source: "bank",
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => b.date - a.date);
};

module.exports = {
  simulateBankLookup,
  generateTransactions,
};

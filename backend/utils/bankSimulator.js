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

// Sample merchants for generating realistic transactions
const sampleMerchants = [
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

// Generate random amount based on category
const getRandomAmount = (category) => {
  const ranges = {
    Food: { min: 100, max: 2000 },
    Transport: { min: 50, max: 1500 },
    Shopping: { min: 200, max: 10000 },
    Bills: { min: 500, max: 5000 },
    Entertainment: { min: 100, max: 2000 },
    Health: { min: 200, max: 5000 },
    Education: { min: 500, max: 15000 },
    Other: { min: 100, max: 3000 },
  };

  const range = ranges[category] || ranges.Other;
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

// Generate dummy transactions
const generateTransactions = (count = 15) => {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    const merchantInfo =
      sampleMerchants[Math.floor(Math.random() * sampleMerchants.length)];
    const category = detectCategory(merchantInfo.name, "");

    transactions.push({
      amount: getRandomAmount(category),
      merchant: merchantInfo.name,
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

const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please add a category name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  icon: {
    type: String,
    default: "Category",
    trim: true,
  },
  color: {
    type: String,
    default: "#6366f1", // Default indigo color
    trim: true,
  },
  budgetLimit: {
    type: Number,
    default: null, // null means no limit (unlimited)
    min: [0, "Budget limit cannot be negative"],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ["expense", "income", "both"],
    default: "expense",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure unique category names per user
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

// Update timestamp on save
CategorySchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Default categories to seed for new users
CategorySchema.statics.getDefaultCategories = function () {
  return [
    { name: "Food", icon: "Restaurant", color: "#ef4444", type: "expense" },
    {
      name: "Transport",
      icon: "DirectionsCar",
      color: "#f97316",
      type: "expense",
    },
    {
      name: "Shopping",
      icon: "ShoppingBag",
      color: "#eab308",
      type: "expense",
    },
    { name: "Bills", icon: "Receipt", color: "#22c55e", type: "expense" },
    { name: "Entertainment", icon: "Movie", color: "#06b6d4", type: "expense" },
    {
      name: "Health",
      icon: "LocalHospital",
      color: "#ec4899",
      type: "expense",
    },
    { name: "Education", icon: "School", color: "#8b5cf6", type: "expense" },
    { name: "Goals", icon: "Flag", color: "#f59e0b", type: "expense" },
    { name: "Salary", icon: "Work", color: "#10b981", type: "income" },
    { name: "Investment", icon: "TrendingUp", color: "#14b8a6", type: "both" },
    {
      name: "Other",
      icon: "MoreHoriz",
      color: "#6b7280",
      type: "both",
      isDefault: true,
    },
  ];
};

// Seed default categories for a user
CategorySchema.statics.seedDefaultCategories = async function (userId) {
  const existingCount = await this.countDocuments({ user: userId });
  if (existingCount > 0) {
    return []; // Already has categories
  }

  const defaults = this.getDefaultCategories();
  const categories = defaults.map((cat) => ({
    ...cat,
    user: userId,
  }));

  return await this.insertMany(categories);
};

module.exports = mongoose.model("Category", CategorySchema);

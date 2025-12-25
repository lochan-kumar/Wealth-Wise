const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategorySummary,
} = require("../controllers/categoryController");

// All routes require authentication
router.use(protect);

// Summary route (must come before /:id)
router.get("/summary", getCategorySummary);

// CRUD routes
router.route("/").get(getCategories).post(createCategory);
router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;

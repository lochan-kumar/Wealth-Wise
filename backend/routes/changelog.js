const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getChangelog } = require("../controllers/changelogController");

// All routes require authentication
router.use(protect);

router.get("/", getChangelog);

module.exports = router;

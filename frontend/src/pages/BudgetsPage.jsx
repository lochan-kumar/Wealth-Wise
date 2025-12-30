import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import {
  getCategories,
  getCategorySummary,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/api";
import { useToast } from "../context/ToastContext";

const colorOptions = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
];

const BudgetsPage = () => {
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    color: "#6366f1",
    budgetLimit: "",
    type: "expense",
    hasLimit: false,
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    budgetLimit: "",
  });

  // Validation functions
  const validateName = (value) => {
    if (value && value.length < 2) return "Name must be at least 2 characters";
    if (value && value.length > 50)
      return "Name must be less than 50 characters";
    return "";
  };

  const validateBudgetLimit = (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0))
      return "Budget limit cannot be negative";
    return "";
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      form.name &&
      !formErrors.name &&
      (!form.hasLimit || (form.budgetLimit && !formErrors.budgetLimit))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, sumRes] = await Promise.all([
        getCategories(),
        getCategorySummary(),
      ]);
      setCategories(catRes.data.data);
      setSummary(sumRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        color: category.color || "#6366f1",
        budgetLimit: category.budgetLimit?.toString() || "",
        type: category.type || "expense",
        hasLimit: category.budgetLimit !== null && category.budgetLimit > 0,
      });
    } else {
      setEditingCategory(null);
      setForm({
        name: "",
        color: "#6366f1",
        budgetLimit: "",
        type: "expense",
        hasLimit: false,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: form.name,
        color: form.color,
        budgetLimit:
          form.hasLimit && form.budgetLimit
            ? parseFloat(form.budgetLimit)
            : null,
        type: form.type,
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, data);
        toast.success("Category updated!");
      } else {
        await createCategory(data);
        toast.success("Category created!");
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving category");
    }
  };

  const handleDelete = async (id, name) => {
    if (name === "Other") {
      toast.warning("Cannot delete the default 'Other' category");
      return;
    }

    if (
      window.confirm(`Delete "${name}"? Transactions will be moved to "Other".`)
    ) {
      try {
        const res = await deleteCategory(id);
        toast.success(res.data.message);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting category");
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "error";
    if (percentage >= 80) return "warning";
    return "primary";
  };

  // Filter categories based on tab
  const filteredSummary = summary.filter((cat) => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return cat.budgetLimit !== null; // With limits
    return cat.budgetLimit === null; // Unlimited
  });

  const totalBudget = summary
    .filter((c) => c.budgetLimit)
    .reduce((sum, c) => sum + c.budgetLimit, 0);
  const totalSpent = summary.reduce((sum, c) => sum + c.currentSpent, 0);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Categories & Budgets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total spent this month: ₹{totalSpent.toLocaleString()}
            {totalBudget > 0 && ` / ₹${totalBudget.toLocaleString()} budgeted`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label={`All (${summary.length})`} />
        <Tab
          label={`With Budget (${summary.filter((c) => c.budgetLimit).length})`}
        />
        <Tab
          label={`Unlimited (${summary.filter((c) => !c.budgetLimit).length})`}
        />
      </Tabs>

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {filteredSummary.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No categories found
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Add Your First Category
              </Button>
            </Card>
          </Grid>
        ) : (
          filteredSummary.map((cat) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat._id}>
              <Card>
                <CardContent>
                  {/* Category Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: cat.color,
                          width: 40,
                          height: 40,
                          fontSize: "1rem",
                        }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{cat.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cat.transactionCount} transactions
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(cat)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={cat.name === "Other"}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Spending Info */}
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: "error.main", mb: 1 }}
                  >
                    ₹{cat.currentSpent.toLocaleString()}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      spent
                    </Typography>
                  </Typography>

                  {/* Budget Progress */}
                  {cat.budgetLimit ? (
                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Budget: ₹{cat.budgetLimit.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: cat.isOverBudget
                              ? "error.main"
                              : "success.main",
                          }}
                        >
                          {cat.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, cat.percentage || 0)}
                        color={getProgressColor(cat.percentage || 0)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography
                        variant="caption"
                        color={
                          cat.isOverBudget ? "error.main" : "text.secondary"
                        }
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {cat.isOverBudget
                          ? `Over budget by ₹${(
                              cat.currentSpent - cat.budgetLimit
                            ).toLocaleString()}`
                          : `₹${cat.remaining?.toLocaleString()} remaining`}
                      </Typography>
                    </Box>
                  ) : (
                    <Chip
                      size="small"
                      label="No budget limit"
                      variant="outlined"
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Category Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={form.name}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, name: value });
                setFormErrors({ ...formErrors, name: validateName(value) });
              }}
              placeholder="e.g., Groceries, Rent, Subscriptions"
              disabled={editingCategory?.name === "Other"}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />

            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Color
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {colorOptions.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setForm({ ...form, color })}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: color,
                      cursor: "pointer",
                      border: form.color === color ? "3px solid white" : "none",
                      boxShadow:
                        form.color === color ? `0 0 0 2px ${color}` : "none",
                    }}
                  />
                ))}
              </Box>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={form.type}
                label="Type"
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <MenuItem value="expense">Expense Category</MenuItem>
                <MenuItem value="income">Income Category</MenuItem>
                <MenuItem value="both">Both (Income & Expense)</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  checked={form.hasLimit}
                  onChange={(e) =>
                    setForm({ ...form, hasLimit: e.target.checked })
                  }
                />
              }
              label="Set a monthly budget limit"
            />

            {form.hasLimit && (
              <TextField
                fullWidth
                label="Monthly Budget Limit"
                type="number"
                value={form.budgetLimit}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, budgetLimit: value });
                  setFormErrors({
                    ...formErrors,
                    budgetLimit: validateBudgetLimit(value),
                  });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                error={!!formErrors.budgetLimit}
                helperText={
                  formErrors.budgetLimit ||
                  "You'll be alerted when spending approaches this limit"
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            {editingCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetsPage;

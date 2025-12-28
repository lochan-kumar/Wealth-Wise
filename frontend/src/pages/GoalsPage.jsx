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
  InputAdornment,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete, Flag, CheckCircle } from "@mui/icons-material";
import {
  getGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  getAccounts,
} from "../services/api";
import AnimatedSnackbar from "../components/AnimatedSnackbar";

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [progressAccount, setProgressAccount] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: 0,
    deadline: "",
    category: "",
  });

  // Validation errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
  });
  const [progressError, setProgressError] = useState("");

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Validation functions
  const validateName = (value) => {
    if (value && value.length < 2) return "Name must be at least 2 characters";
    if (value && value.length > 50)
      return "Name must be less than 50 characters";
    return "";
  };

  const validateTargetAmount = (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num <= 0))
      return "Target amount must be greater than 0";
    return "";
  };

  const validateDeadline = (value, isEditing) => {
    if (value && !isEditing) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) return "Deadline must be a future date";
    }
    return "";
  };

  const validateProgressAmount = (value) => {
    const num = parseFloat(value);
    if (value && (isNaN(num) || num < 0)) return "Amount cannot be negative";
    return "";
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      form.name &&
      form.targetAmount &&
      !formErrors.name &&
      !formErrors.targetAmount &&
      !formErrors.deadline
    );
  };

  // Check if progress form is valid
  const isProgressValid = () => {
    return progressAmount && !progressError;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [goalsRes, accountsRes] = await Promise.all([
        getGoals(),
        getAccounts(),
      ]);
      setGoals(goalsRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const handleOpenDialog = (goal = null) => {
    // Clear validation errors
    setFormErrors({ name: "", targetAmount: "", deadline: "" });

    if (goal) {
      setEditingGoal(goal);
      setForm({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount,
        deadline: goal.deadline
          ? new Date(goal.deadline).toISOString().split("T")[0]
          : "",
        category: goal.category || "",
      });
    } else {
      setEditingGoal(null);
      setForm({
        name: "",
        targetAmount: "",
        currentAmount: 0,
        deadline: "",
        category: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGoal(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        targetAmount: parseFloat(form.targetAmount),
      };

      if (editingGoal) {
        await updateGoal(editingGoal._id, data);
        setSnackbar({
          open: true,
          message: "Goal updated!",
          severity: "success",
        });
      } else {
        await createGoal(data);
        setSnackbar({
          open: true,
          message: "Goal created!",
          severity: "success",
        });
      }
      handleCloseDialog();
      fetchGoals();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error saving goal",
        severity: "error",
      });
    }
  };

  const handleOpenProgressDialog = (goal) => {
    setEditingGoal(goal);
    setProgressAmount("");
    // Default to goal's account or first account
    setProgressAccount(
      goal.account?._id || (accounts.length > 0 ? accounts[0]._id : "")
    );
    setProgressDialogOpen(true);
  };

  const handleAddProgress = async () => {
    try {
      const res = await updateGoalProgress(
        editingGoal._id,
        parseFloat(progressAmount),
        progressAccount || null
      );
      setSnackbar({
        open: true,
        message: res.data.message || "Progress updated!",
        severity: "success",
      });
      setProgressDialogOpen(false);
      fetchGoals();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating progress",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this goal?")) {
      try {
        await deleteGoal(id);
        setSnackbar({
          open: true,
          message: "Goal deleted!",
          severity: "success",
        });
        fetchGoals();
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Error deleting goal",
          severity: "error",
        });
      }
    }
  };

  const getProgress = (goal) => {
    if (!goal.targetAmount) return 0;
    return Math.round((goal.currentAmount / goal.targetAmount) * 100);
  };

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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Financial Goals
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Create Goal
        </Button>
      </Box>

      {/* Goals Grid */}
      <Grid container spacing={3}>
        {goals.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <Flag sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No financial goals yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Create Your First Goal
              </Button>
            </Card>
          </Grid>
        ) : (
          goals.map((goal) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={goal._id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{goal.name}</Typography>
                      {goal.deadline && (
                        <Typography variant="caption" color="text.secondary">
                          Deadline:{" "}
                          {new Date(goal.deadline).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      label={goal.status}
                      color={
                        goal.status === "completed" ? "success" : "primary"
                      }
                      icon={
                        goal.status === "completed" ? (
                          <CheckCircle />
                        ) : undefined
                      }
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        ₹{goal.currentAmount?.toLocaleString()} / ₹
                        {goal.targetAmount?.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {getProgress(goal)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(getProgress(goal), 100)}
                      color={
                        goal.status === "completed" ? "success" : "primary"
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenProgressDialog(goal)}
                      disabled={goal.status === "completed"}
                    >
                      Add Progress
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(goal._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Goal Name"
              value={form.name}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, name: value });
                setFormErrors({ ...formErrors, name: validateName(value) });
              }}
              placeholder="e.g., Vacation Fund, New Car"
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              fullWidth
              label="Target Amount"
              type="number"
              value={form.targetAmount}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, targetAmount: value });
                setFormErrors({
                  ...formErrors,
                  targetAmount: validateTargetAmount(value),
                });
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              error={!!formErrors.targetAmount}
              helperText={formErrors.targetAmount}
            />
            <TextField
              fullWidth
              type="date"
              label="Deadline"
              value={form.deadline}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, deadline: value });
                setFormErrors({
                  ...formErrors,
                  deadline: validateDeadline(value, !!editingGoal),
                });
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayDate() }}
              error={!!formErrors.deadline}
              helperText={
                formErrors.deadline ||
                (!editingGoal ? "Must be a future date" : "")
              }
            />
            <TextField
              fullWidth
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g., Travel, Vehicle, Emergency"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            {editingGoal ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Progress Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Progress to Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Amount to Add"
              type="number"
              value={progressAmount}
              onChange={(e) => {
                const value = e.target.value;
                setProgressAmount(value);
                setProgressError(validateProgressAmount(value));
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              error={!!progressError}
              helperText={progressError}
            />
            <FormControl fullWidth>
              <InputLabel>Deduct from Account</InputLabel>
              <Select
                value={progressAccount}
                label="Deduct from Account"
                onChange={(e) => setProgressAccount(e.target.value)}
              >
                <MenuItem value="">
                  <em>Don't create expense record</em>
                </MenuItem>
                {accounts.map((acc) => (
                  <MenuItem key={acc._id} value={acc._id}>
                    {acc.name} (₹{acc.balance?.toLocaleString() || 0})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info" sx={{ mt: 1 }}>
              If you select an account, an expense record will be created and
              the amount will be deducted from the account balance.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setProgressDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddProgress}
            disabled={!isProgressValid()}
          >
            Add Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <AnimatedSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default GoalsPage;

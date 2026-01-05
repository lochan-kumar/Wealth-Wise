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
  useTheme,
} from "@mui/material";
import { Add, Edit, Delete, Flag, CheckCircle } from "@mui/icons-material";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../services/api";
import { useToast } from "../context/ToastContext";
import AddTransactionDialog from "../components/AddTransactionDialog";

const GoalsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const toast = useToast();

  // Add Progress Dialog state (unified dialog)
  const [addTxDialogOpen, setAddTxDialogOpen] = useState(false);
  const [addTxGoalId, setAddTxGoalId] = useState("");

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const goalsRes = await getGoals();
      setGoals(goalsRes.data.data);
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
        toast.success("Goal updated!");
      } else {
        await createGoal(data);
        toast.success("Goal created!");
      }
      handleCloseDialog();
      fetchGoals();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving goal");
    }
  };

  const handleOpenProgressDialog = (goal) => {
    // Open the unified AddTransactionDialog with goal mode and goal pre-selected
    setAddTxGoalId(goal._id);
    setAddTxDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this goal?")) {
      try {
        await deleteGoal(id);
        toast.success("Goal deleted!");
        fetchGoals();
      } catch (error) {
        toast.error("Error deleting goal");
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingGoal ? "Edit Goal" : "Create Goal"}
        </DialogTitle>
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
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            {editingGoal ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unified Add Transaction Dialog for Goal Progress */}
      <AddTransactionDialog
        open={addTxDialogOpen}
        onClose={() => setAddTxDialogOpen(false)}
        onSuccess={fetchGoals}
        initialMode="goal"
        initialGoalId={addTxGoalId}
      />
    </Box>
  );
};

export default GoalsPage;

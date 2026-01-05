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
  IconButton,
  Chip,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Collapse,
  useTheme,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  SwapHoriz,
} from "@mui/icons-material";
import {
  getDebtPersons,
  getDebtSummary,
  createDebtPerson,
  updateDebtPerson,
  deleteDebtTransaction,
  deleteDebtPerson,
} from "../services/api";
import { useToast } from "../context/ToastContext";
import AddTransactionDialog from "../components/AddTransactionDialog";

// Transaction types for debt display
const transactionTypes = [
  { value: "lent", label: "Lent", icon: <ArrowUpward color="success" /> },
  {
    value: "borrowed",
    label: "Borrowed",
    icon: <ArrowDownward color="error" />,
  },
  {
    value: "lent_repaid",
    label: "Lent Repaid",
    icon: <ArrowDownward color="success" />,
  },
  {
    value: "borrowed_repaid",
    label: "Borrowed Repaid",
    icon: <ArrowUpward color="error" />,
  },
];

const DebtsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [persons, setPersons] = useState([]);
  const [summary, setSummary] = useState({
    theyOwe: { count: 0, total: 0 },
    youOwe: { count: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [expandedPerson, setExpandedPerson] = useState(null);
  const toast = useToast();

  // Add Transaction Dialog state
  const [addTxDialogOpen, setAddTxDialogOpen] = useState(false);
  const [addTxPersonId, setAddTxPersonId] = useState("");

  const [personForm, setPersonForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  // Validation errors
  const [personErrors, setPersonErrors] = useState({
    name: "",
    phone: "",
  });

  // Validation functions
  const validatePersonName = (value) => {
    if (value && value.length < 2) return "Name must be at least 2 characters";
    if (value && value.length > 50)
      return "Name must be less than 50 characters";
    return "";
  };

  const validatePhone = (value) => {
    if (value && !/^\d{10}$/.test(value)) return "Phone must be 10 digits";
    return "";
  };

  // Form validity checks
  const isPersonFormValid =
    personForm.name && !personErrors.name && !personErrors.phone;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [personsRes, summaryRes] = await Promise.all([
        getDebtPersons(),
        getDebtSummary(),
      ]);
      setPersons(personsRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPersonDialog = (person = null) => {
    if (person) {
      setEditingPerson(person);
      setPersonForm({
        name: person.name,
        phone: person.phone || "",
        notes: person.notes || "",
      });
    } else {
      setEditingPerson(null);
      setPersonForm({ name: "", phone: "", notes: "" });
    }
    setPersonDialogOpen(true);
  };

  const handleOpenTransactionDialog = (person) => {
    // Open the unified AddTransactionDialog with debt mode and person pre-selected
    setAddTxPersonId(person._id);
    setAddTxDialogOpen(true);
  };

  const handleSavePerson = async () => {
    try {
      if (editingPerson) {
        await updateDebtPerson(editingPerson._id, personForm);
        toast.success("Person updated!");
      } else {
        await createDebtPerson(personForm);
        toast.success("Person added!");
      }
      setPersonDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving person");
    }
  };

  const handleDeleteTransaction = async (personId, transactionId) => {
    if (window.confirm("Delete this transaction from debt history?")) {
      try {
        await deleteDebtTransaction(personId, transactionId);
        toast.success("Transaction removed!");
        fetchData();
      } catch (error) {
        toast.error("Error deleting transaction");
      }
    }
  };

  const handleDeletePerson = async (id) => {
    if (window.confirm("Delete this person and all their debt history?")) {
      try {
        await deleteDebtPerson(id);
        toast.success("Person deleted!");
        fetchData();
      } catch (error) {
        toast.error("Error deleting person");
      }
    }
  };

  const getBalanceDisplay = (person) => {
    const balance = person.balance;
    if (balance === 0)
      return { text: "Settled", color: "text.secondary", amount: 0 };
    if (balance > 0)
      return { text: "They owe you", color: "success.main", amount: balance };
    return {
      text: "You owe them",
      color: "error.main",
      amount: Math.abs(balance),
    };
  };

  const getTransactionIcon = (type) => {
    const found = transactionTypes.find((t) => t.value === type);
    return found?.icon || <SwapHoriz />;
  };

  const getTransactionLabel = (type) => {
    const found = transactionTypes.find((t) => t.value === type);
    return found?.label || type;
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
          Debt Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenPersonDialog()}
        >
          Add Person
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "success.light",
                  color: "success.contrastText",
                }}
              >
                <TrendingUp />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Others Owe You
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "success.main" }}
                >
                  ₹{summary.theyOwe?.total?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.theyOwe?.count || 0} people
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "error.light",
                  color: "error.contrastText",
                }}
              >
                <TrendingDown />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  You Owe Others
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "error.main" }}
                >
                  ₹{summary.youOwe?.total?.toLocaleString() || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary.youOwe?.count || 0} people
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Persons List */}
      <Grid container spacing={3}>
        {persons.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ textAlign: "center", py: 6 }}>
              <PersonAdd
                sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
              />
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No people added yet
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenPersonDialog()}
              >
                Add Your First Person
              </Button>
            </Card>
          </Grid>
        ) : (
          persons.map((person) => {
            const balanceInfo = getBalanceDisplay(person);
            const isExpanded = expandedPerson === person._id;

            return (
              <Grid size={{ xs: 12, md: 6 }} key={person._id}>
                <Card>
                  <CardContent>
                    {/* Person Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {person.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{person.name}</Typography>
                          {person.phone && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {person.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        label={
                          person.status === "settled"
                            ? "Settled"
                            : balanceInfo.text
                        }
                        color={
                          person.status === "settled"
                            ? "default"
                            : person.balance > 0
                            ? "success"
                            : "error"
                        }
                      />
                    </Box>

                    {/* Balance Display */}
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 600, color: balanceInfo.color, mb: 2 }}
                    >
                      ₹{balanceInfo.amount.toLocaleString()}
                    </Typography>

                    {person.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {person.notes}
                      </Typography>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenTransactionDialog(person)}
                      >
                        Add Transaction
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPersonDialog(person)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePerson(person._id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <Box sx={{ flex: 1 }} />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setExpandedPerson(isExpanded ? null : person._id)
                        }
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    {/* Transaction History */}
                    <Collapse in={isExpanded}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Transaction History ({person.transactions?.length || 0})
                      </Typography>
                      {person.transactions?.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No transactions yet
                        </Typography>
                      ) : (
                        <List dense disablePadding>
                          {person.transactions
                            ?.slice()
                            .reverse()
                            .map((tx) => (
                              <ListItem key={tx._id} disableGutters>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  {getTransactionIcon(tx.type)}
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body2"
                                      component="span"
                                    >
                                      {getTransactionLabel(tx.type)}: ₹
                                      {tx.amount.toLocaleString()}
                                      {tx.linkedTransaction && (
                                        <Chip
                                          size="small"
                                          label="In Txns"
                                          sx={{ ml: 1 }}
                                          variant="outlined"
                                        />
                                      )}
                                    </Typography>
                                  }
                                  secondary={
                                    <>
                                      {tx.description && `${tx.description} • `}
                                      {new Date(tx.date).toLocaleDateString()}
                                    </>
                                  }
                                />
                              </ListItem>
                            ))}
                        </List>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>

      {/* Add/Edit Person Dialog */}
      <Dialog
        open={personDialogOpen}
        onClose={() => setPersonDialogOpen(false)}
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
          {editingPerson ? "Edit Person" : "Add Person"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={personForm.name}
              onChange={(e) => {
                const value = e.target.value;
                setPersonForm({ ...personForm, name: value });
                setPersonErrors({
                  ...personErrors,
                  name: validatePersonName(value),
                });
              }}
              placeholder="e.g., NKS, John Doe"
              error={!!personErrors.name}
              helperText={personErrors.name}
            />
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={personForm.phone}
              onChange={(e) => {
                const value = e.target.value;
                setPersonForm({ ...personForm, phone: value });
                setPersonErrors({
                  ...personErrors,
                  phone: validatePhone(value),
                });
              }}
              placeholder="10 digit number"
              error={!!personErrors.phone}
              helperText={personErrors.phone}
            />
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={personForm.notes}
              onChange={(e) =>
                setPersonForm({ ...personForm, notes: e.target.value })
              }
              placeholder="Any notes about this person"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPersonDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePerson}
            disabled={!isPersonFormValid}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            }}
          >
            {editingPerson ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unified Add Transaction Dialog */}
      <AddTransactionDialog
        open={addTxDialogOpen}
        onClose={() => setAddTxDialogOpen(false)}
        onSuccess={fetchData}
        initialMode="debt"
        initialPersonId={addTxPersonId}
      />
    </Box>
  );
};

export default DebtsPage;

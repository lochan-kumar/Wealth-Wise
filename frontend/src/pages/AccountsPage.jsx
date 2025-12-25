import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import {
  Add,
  AccountBalance,
  Delete,
  CheckCircle,
  Link as LinkIcon,
} from "@mui/icons-material";
import {
  getAccounts,
  getAvailableBanks,
  linkBankAccount,
  unlinkAccount,
} from "../services/api";
import AnimatedSnackbar from "../components/AnimatedSnackbar";

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accRes, banksRes] = await Promise.all([
        getAccounts(),
        getAvailableBanks(),
      ]);
      setAccounts(accRes.data.data);
      setBanks(banksRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setForm({ bankName: "", accountNumber: "" });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const res = await linkBankAccount(form.bankName, form.accountNumber);
      setSnackbar({
        open: true,
        message: `Bank linked! ${res.data.data.transactionsImported} transactions imported.`,
        severity: "success",
      });
      handleCloseDialog();
      fetchData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error linking bank",
        severity: "error",
      });
    }
  };

  const handleUnlink = async (id) => {
    if (window.confirm("Unlink this bank account?")) {
      try {
        await unlinkAccount(id);
        setSnackbar({
          open: true,
          message: "Account unlinked!",
          severity: "success",
        });
        fetchData();
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Error unlinking account",
          severity: "error",
        });
      }
    }
  };

  const cashAccount = accounts.find((a) => a.type === "cash");
  const bankAccounts = accounts.filter((a) => a.type === "bank");

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
          Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<LinkIcon />}
          onClick={handleOpenDialog}
        >
          Link Bank Account
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Cash Account */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                💵 Cash Account
                <Chip label="Default" size="small" color="primary" />
              </Typography>
              {cashAccount ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "success.light",
                      color: "success.contrastText",
                    }}
                  >
                    <AccountBalance fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h6">{cashAccount.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      For cash transactions • Cannot be deleted
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No cash account found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Bank Accounts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🏦 Linked Bank Accounts
              </Typography>
              {bankAccounts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No bank accounts linked
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleOpenDialog}
                  >
                    Link Your First Bank
                  </Button>
                </Box>
              ) : (
                <List>
                  {bankAccounts.map((account, index) => (
                    <Box key={account._id}>
                      <ListItem>
                        <ListItemIcon>
                          <AccountBalance color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={account.name}
                          secondary={account.bankName}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleUnlink(account._id)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < bankAccounts.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Info Card */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>How bank linking works:</strong> When you link a bank
              account, we simulate fetching your recent transactions and import
              them automatically. You can then select this account when adding
              new transactions.
            </Typography>
          </Alert>
        </Grid>
      </Grid>

      {/* Link Bank Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Link Bank Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Bank</InputLabel>
              <Select
                value={form.bankName}
                label="Select Bank"
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              >
                {banks.map((bank) => (
                  <MenuItem key={bank} value={bank}>
                    {bank}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Account Number"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              placeholder="Enter your account number"
            />
            <Alert severity="info" sx={{ mt: 1 }}>
              This is a simulation. Enter any account number to link and import
              dummy transactions.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.bankName || !form.accountNumber}
          >
            Link Account
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

export default AccountsPage;

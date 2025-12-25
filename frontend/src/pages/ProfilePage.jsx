import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Avatar,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Person,
  Lock,
  Download,
  PictureAsPdf,
  TableChart,
  DeleteForever,
  Warning,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import {
  updatePassword,
  exportToExcel,
  exportToPDF,
  deleteAllTransactions,
} from "../services/api";
import AnimatedSnackbar from "../components/AnimatedSnackbar";

const ProfilePage = () => {
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Export form
  const [exportForm, setExportForm] = useState({
    format: "excel",
    startDate: "",
    endDate: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: "New passwords do not match",
        severity: "error",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: "Password must be at least 6 characters",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setSnackbar({
        open: true,
        message: "Password updated successfully!",
        severity: "success",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error updating password",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (exportForm.startDate) params.startDate = exportForm.startDate;
      if (exportForm.endDate) params.endDate = exportForm.endDate;

      let response;
      let filename;

      if (exportForm.format === "excel") {
        response = await exportToExcel(params);
        filename = `transactions_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
      } else {
        response = await exportToPDF(params);
        filename = `transactions_${new Date().toISOString().split("T")[0]}.pdf`;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: "Export successful!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error exporting data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (confirmText !== "DELETE") {
      setSnackbar({
        open: true,
        message: "Please type DELETE to confirm",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await deleteAllTransactions();
      setSnackbar({
        open: true,
        message: res.data.message || "All transactions deleted!",
        severity: "success",
      });
      setConfirmDialogOpen(false);
      setConfirmText("");
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error clearing data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Profile & Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontSize: 28,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.name}</Typography>
                  <Typography color="text.secondary">{user?.email}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Member since:{" "}
                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Lock color="primary" />
                <Typography variant="h6">Change Password</Typography>
              </Box>
              <form onSubmit={handlePasswordChange}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  required
                  helperText="Minimum 6 characters"
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Lock />
                  }
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Data */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <Download color="primary" />
                <Typography variant="h6">Export Transactions</Typography>
              </Box>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Format</InputLabel>
                    <Select
                      value={exportForm.format}
                      label="Format"
                      onChange={(e) =>
                        setExportForm({ ...exportForm, format: e.target.value })
                      }
                    >
                      <MenuItem value="excel">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TableChart fontSize="small" /> Excel (.xlsx)
                        </Box>
                      </MenuItem>
                      <MenuItem value="pdf">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PictureAsPdf fontSize="small" /> PDF
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="From Date (Optional)"
                    value={exportForm.startDate}
                    onChange={(e) =>
                      setExportForm({
                        ...exportForm,
                        startDate: e.target.value,
                      })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="To Date (Optional)"
                    value={exportForm.endDate}
                    onChange={(e) =>
                      setExportForm({ ...exportForm, endDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleExport}
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Download />
                    }
                  >
                    Export
                  </Button>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                Leave dates empty to export all transactions. The file will
                download automatically.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              borderColor: "error.main",
              borderWidth: 2,
              borderStyle: "solid",
            }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Warning color="error" />
                <Typography variant="h6" color="error">
                  Danger Zone
                </Typography>
              </Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>Warning:</strong> This action is irreversible. All your
                transactions will be permanently deleted.
              </Alert>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForever />}
                onClick={() => setConfirmDialogOpen(true)}
              >
                Clear All Transactions
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle
          sx={{
            color: "error.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Warning /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will permanently delete <strong>ALL</strong> your transactions
            and reset all budget tracking.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Type <strong>DELETE</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
              setConfirmText("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearAllData}
            disabled={loading || confirmText !== "DELETE"}
            startIcon={
              loading ? <CircularProgress size={20} /> : <DeleteForever />
            }
          >
            Delete All
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

export default ProfilePage;

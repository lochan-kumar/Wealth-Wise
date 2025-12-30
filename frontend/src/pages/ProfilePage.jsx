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
import { useToast } from "../context/ToastContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation errors
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateNewPassword = (value) => {
    if (value && !passwordRegex.test(value)) {
      return "8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special";
    }
    return "";
  };

  const validateConfirmPassword = (value, newPwd) => {
    if (value && value !== newPwd) return "Passwords do not match";
    return "";
  };

  const isPasswordFormValid =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    !passwordErrors.newPassword &&
    !passwordErrors.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  // Export form
  const [exportForm, setExportForm] = useState({
    format: "excel",
    startDate: "",
    endDate: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating password");
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

      toast.success("Export successful!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error exporting data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (confirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    try {
      const res = await deleteAllTransactions();
      toast.success(res.data.message || "All transactions deleted!");
      setConfirmDialogOpen(false);
      setConfirmText("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error clearing data");
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: value,
                    });
                    setPasswordErrors({
                      ...passwordErrors,
                      newPassword: validateNewPassword(value),
                      confirmPassword: validateConfirmPassword(
                        passwordForm.confirmPassword,
                        value
                      ),
                    });
                  }}
                  sx={{ mb: 2 }}
                  required
                  error={!!passwordErrors.newPassword}
                  helperText={
                    passwordErrors.newPassword ||
                    "8+ chars, 1 upper, 1 lower, 1 number, 1 special"
                  }
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: value,
                    });
                    setPasswordErrors({
                      ...passwordErrors,
                      confirmPassword: validateConfirmPassword(
                        value,
                        passwordForm.newPassword
                      ),
                    });
                  }}
                  sx={{ mb: 2 }}
                  required
                  error={!!passwordErrors.confirmPassword}
                  helperText={passwordErrors.confirmPassword}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !isPasswordFormValid}
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
    </Box>
  );
};

export default ProfilePage;

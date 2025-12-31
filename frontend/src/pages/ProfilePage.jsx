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
  Assessment,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import {
  updatePassword,
  exportToExcel,
  exportToPDF,
  deleteAllTransactions,
  generateSpendingReport,
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

  // Custom Report form
  const [reportForm, setReportForm] = useState({
    reportType: "full",
    dateRange: "thisMonth",
    startDate: "",
    endDate: "",
  });
  const [reportLoading, setReportLoading] = useState(false);

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

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      // Calculate date range
      let startDate, endDate;
      const now = new Date();

      switch (reportForm.dateRange) {
        case "thisMonth":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case "lastMonth":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case "last3Months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          endDate = now;
          break;
        case "last6Months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          endDate = now;
          break;
        case "thisYear":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        case "custom":
          startDate = reportForm.startDate
            ? new Date(reportForm.startDate)
            : new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = reportForm.endDate ? new Date(reportForm.endDate) : now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
      }

      const response = await generateSpendingReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reportType: reportForm.reportType,
      });

      // Download the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `spending_report_${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Report generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error generating report");
    } finally {
      setReportLoading(false);
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

        {/* Custom Reports */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)",
              borderLeft: "4px solid #8b5cf6",
            }}
          >
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <Assessment sx={{ color: "#8b5cf6" }} />
                <Typography variant="h6">Custom Spending Reports</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate detailed PDF reports with spending insights, category
                breakdowns, budget analysis, and personalized financial tips.
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select
                      value={reportForm.reportType}
                      label="Report Type"
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          reportType: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="full">Full Report</MenuItem>
                      <MenuItem value="summary">Summary Only</MenuItem>
                      <MenuItem value="category">Category Analysis</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={reportForm.dateRange}
                      label="Date Range"
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          dateRange: e.target.value,
                        })
                      }
                    >
                      <MenuItem value="thisMonth">This Month</MenuItem>
                      <MenuItem value="lastMonth">Last Month</MenuItem>
                      <MenuItem value="last3Months">Last 3 Months</MenuItem>
                      <MenuItem value="last6Months">Last 6 Months</MenuItem>
                      <MenuItem value="thisYear">This Year</MenuItem>
                      <MenuItem value="custom">Custom Range</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {reportForm.dateRange === "custom" && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={reportForm.startDate}
                        onChange={(e) =>
                          setReportForm({
                            ...reportForm,
                            startDate: e.target.value,
                          })
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={reportForm.endDate}
                        onChange={(e) =>
                          setReportForm({
                            ...reportForm,
                            endDate: e.target.value,
                          })
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </>
                )}
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: reportForm.dateRange === "custom" ? 2 : 3,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleGenerateReport}
                    disabled={reportLoading}
                    startIcon={
                      reportLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PictureAsPdf />
                      )
                    }
                    sx={{
                      bgcolor: "#8b5cf6",
                      "&:hover": { bgcolor: "#7c3aed" },
                    }}
                  >
                    Generate Report
                  </Button>
                </Grid>
              </Grid>
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

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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  useTheme,
  CircularProgress,
  Autocomplete,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Groups,
  Delete,
  Edit,
  PersonAdd,
  Check,
  Close,
  AttachMoney,
  ExitToApp,
  Settings,
  ArrowForward,
} from "@mui/icons-material";
import {
  getSplitGroups,
  getPendingGroupInvites,
  createSplitGroup,
  getSplitGroup,
  updateSplitGroup,
  deleteSplitGroup,
  inviteToGroup,
  respondToGroupInvite,
  leaveGroup,
  addGroupExpense,
  deleteGroupExpense,
  settleWithGroupMember,
  searchUsersForInvite,
} from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const SplitGroupsPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const toast = useToast();
  const { user } = useAuth();

  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [detailTab, setDetailTab] = useState(0);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [groupDetailsOpen, setGroupDetailsOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Current group
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentGroupDetails, setCurrentGroupDetails] = useState(null);

  // Form states
  const [groupForm, setGroupForm] = useState({ name: "", description: "" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    splitType: "equal",
    customSplits: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, invitesRes] = await Promise.all([
        getSplitGroups(),
        getPendingGroupInvites(),
      ]);
      setGroups(groupsRes.data.data || []);
      setInvites(invitesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      await createSplitGroup(groupForm);
      toast.success("Group created!");
      setCreateDialogOpen(false);
      setGroupForm({ name: "", description: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating group");
    }
  };

  const handleOpenGroupDetails = async (group) => {
    try {
      const res = await getSplitGroup(group._id);
      setCurrentGroupDetails(res.data.data);
      setCurrentGroup(group);
      setGroupDetailsOpen(true);
    } catch (error) {
      toast.error("Error loading group details");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Delete this group? This action cannot be undone.")) {
      try {
        await deleteSplitGroup(groupId);
        toast.success("Group deleted");
        setGroupDetailsOpen(false);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting group");
      }
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Leave this group?")) {
      try {
        await leaveGroup(groupId);
        toast.success("Left group");
        setGroupDetailsOpen(false);
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Error leaving group");
      }
    }
  };

  const handleRespondToInvite = async (groupId, accept) => {
    try {
      await respondToGroupInvite(groupId, accept);
      toast.success(accept ? "Joined group!" : "Invite declined");
      fetchData();
    } catch (error) {
      toast.error("Error responding to invite");
    }
  };

  const handleSearchUsers = async (email) => {
    if (email.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const res = await searchUsersForInvite(email);
      setSearchResults(res.data.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInviteMember = async () => {
    try {
      await inviteToGroup(currentGroup._id, inviteEmail);
      toast.success("Invite sent!");
      setInviteDialogOpen(false);
      setInviteEmail("");
      handleOpenGroupDetails(currentGroup);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending invite");
    }
  };

  const handleAddExpense = async () => {
    try {
      await addGroupExpense(currentGroup._id, {
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        splitType: expenseForm.splitType,
        customSplits: expenseForm.customSplits,
      });
      toast.success("Expense added!");
      setExpenseDialogOpen(false);
      setExpenseForm({
        description: "",
        amount: "",
        splitType: "equal",
        customSplits: [],
      });
      handleOpenGroupDetails(currentGroup);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding expense");
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Delete this expense?")) {
      try {
        await deleteGroupExpense(currentGroup._id, expenseId);
        toast.success("Expense deleted");
        handleOpenGroupDetails(currentGroup);
      } catch (error) {
        toast.error("Error deleting expense");
      }
    }
  };

  const handleSettleDebt = async (memberId, amount) => {
    try {
      await settleWithGroupMember(currentGroup._id, memberId, amount);
      toast.success("Settlement recorded!");
      handleOpenGroupDetails(currentGroup);
    } catch (error) {
      toast.error("Error settling");
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSplitGroup(currentGroup._id, {
        autoCreateTransaction: currentGroupDetails.autoCreateTransaction,
      });
      toast.success("Settings updated!");
      setSettingsDialogOpen(false);
    } catch (error) {
      toast.error("Error updating settings");
    }
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return "success.main";
    if (balance < 0) return "error.main";
    return "text.secondary";
  };

  const getBalanceText = (balance) => {
    if (balance > 0) return `You are owed ₹${balance.toFixed(2)}`;
    if (balance < 0) return `You owe ₹${Math.abs(balance).toFixed(2)}`;
    return "Settled up";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          Split Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Group
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label={`My Groups (${groups.length})`} />
        <Tab label={`Pending Invites (${invites.length})`} />
      </Tabs>

      {/* Groups Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {groups.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ textAlign: "center", py: 8, px: 4 }}>
                <Groups sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  No groups yet. Create one to start splitting expenses!
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Create Your First Group
                </Button>
              </Card>
            </Grid>
          ) : (
            groups.map((group) => (
              <Grid item xs={12} md={6} lg={4} key={group._id}>
                <Card
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleOpenGroupDetails(group)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#06b6d4" }}>
                        <Groups />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{group.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {group.memberCount} members
                        </Typography>
                      </Box>
                    </Box>

                    {group.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {group.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Total Expenses
                        </Typography>
                        <Typography variant="h6">
                          ₹{group.totalExpenses?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" color="text.secondary">
                          Your Balance
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ color: getBalanceColor(group.userBalance) }}
                        >
                          {getBalanceText(group.userBalance)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Invites Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {invites.length === 0
            ? null
            : invites.map((group) => (
                <Grid item xs={12} md={6} key={group._id}>
                  <Card>
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "#06b6d4" }}>
                          <Groups />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{group.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Invited by {group.createdBy?.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            color="success"
                            onClick={() =>
                              handleRespondToInvite(group._id, true)
                            }
                          >
                            <Check />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleRespondToInvite(group._id, false)
                            }
                          >
                            <Close />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
        </Grid>
      )}

      {/* Create Group Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 600 }}>Create Group</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupForm.name}
              onChange={(e) =>
                setGroupForm({ ...groupForm, name: e.target.value })
              }
              placeholder="e.g., Trip to Goa, Roommates"
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={groupForm.description}
              onChange={(e) =>
                setGroupForm({ ...groupForm, description: e.target.value })
              }
              placeholder="What's this group for?"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!groupForm.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Group Details Dialog - Redesigned */}
      <Dialog
        open={groupDetailsOpen}
        onClose={() => {
          setGroupDetailsOpen(false);
          setDetailTab(0);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            maxHeight: "85vh",
          },
        }}
      >
        {currentGroupDetails && (
          <>
            {/* Header */}
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "#06b6d4", width: 48, height: 48 }}>
                  <Groups />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {currentGroupDetails.name}
                  </Typography>
                  {currentGroupDetails.description && (
                    <Typography variant="body2" color="text.secondary">
                      {currentGroupDetails.description}
                    </Typography>
                  )}
                </Box>
                <Tooltip title="Settings">
                  <IconButton onClick={() => setSettingsDialogOpen(true)}>
                    <Settings />
                  </IconButton>
                </Tooltip>
              </Box>
            </DialogTitle>

            {/* Tabs */}
            <Tabs
              value={detailTab}
              onChange={(e, v) => setDetailTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
            >
              <Tab label="Overview" />
              <Tab
                label={`Expenses (${
                  currentGroupDetails.expenses?.length || 0
                })`}
              />
              <Tab
                label={`Members (${
                  (currentGroupDetails.members?.filter(
                    (m) => m.status === "accepted"
                  ).length || 0) + 1
                })`}
              />
            </Tabs>

            <DialogContent sx={{ p: 2 }}>
              {/* Overview Tab */}
              {detailTab === 0 && (
                <Box>
                  {/* Quick Actions */}
                  <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<AttachMoney />}
                      onClick={() => setExpenseDialogOpen(true)}
                    >
                      Add Expense
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<PersonAdd />}
                      onClick={() => setInviteDialogOpen(true)}
                    >
                      Invite
                    </Button>
                  </Box>

                  {/* Balance Summary */}
                  {currentGroupDetails.debts?.length > 0 ? (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Settlements Needed
                        </Typography>
                        {currentGroupDetails.debts.map((debt, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              py: 1,
                              borderBottom:
                                index < currentGroupDetails.debts.length - 1
                                  ? 1
                                  : 0,
                              borderColor: "divider",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" fontWeight={500}>
                                {debt.fromUser?.name || "Unknown"}
                              </Typography>
                              <ArrowForward fontSize="small" color="action" />
                              <Typography variant="body2" fontWeight={500}>
                                {debt.toUser?.name || "Unknown"}
                              </Typography>
                              <Chip
                                size="small"
                                label={`₹${debt.amount}`}
                                color="error"
                                variant="outlined"
                              />
                            </Box>
                            {debt.from === user?._id ? (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() =>
                                  handleSettleDebt(debt.to, debt.amount)
                                }
                              >
                                Settle
                              </Button>
                            ) : (
                              <Chip
                                size="small"
                                label="Pending"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent sx={{ textAlign: "center", py: 3 }}>
                        <Check
                          sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                        />
                        <Typography color="text.secondary">
                          All settled up! No debts.
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {/* Stats */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="h5" fontWeight={600}>
                          ₹
                          {currentGroupDetails.expenses
                            ?.reduce((s, e) => s + e.amount, 0)
                            ?.toLocaleString() || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total Expenses
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ flex: 1 }}>
                      <CardContent sx={{ textAlign: "center", py: 2 }}>
                        <Typography variant="h5" fontWeight={600}>
                          {(currentGroupDetails.members?.filter(
                            (m) => m.status === "accepted"
                          ).length || 0) + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Members
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              )}

              {/* Expenses Tab */}
              {detailTab === 1 && (
                <Box>
                  {currentGroupDetails.expenses?.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <AttachMoney
                        sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                      />
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        No expenses yet
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setExpenseDialogOpen(true)}
                      >
                        Add First Expense
                      </Button>
                    </Box>
                  ) : (
                    <List disablePadding>
                      {currentGroupDetails.expenses
                        ?.slice()
                        .reverse()
                        .map((expense) => (
                          <Card
                            key={expense._id}
                            variant="outlined"
                            sx={{ mb: 1.5 }}
                          >
                            <CardContent
                              sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box>
                                  <Typography variant="body1" fontWeight={500}>
                                    {expense.description}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {expense.paidBy?.name} paid ₹
                                    {expense.amount}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    {new Date(
                                      expense.date
                                    ).toLocaleDateString()}{" "}
                                    • {expense.splitType} split
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteExpense(expense._id)
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                    </List>
                  )}
                </Box>
              )}

              {/* Members Tab */}
              {detailTab === 2 && (
                <Box>
                  <List disablePadding>
                    {/* Creator */}
                    <Card variant="outlined" sx={{ mb: 1 }}>
                      <CardContent
                        sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar sx={{ bgcolor: "primary.main" }}>
                            {currentGroupDetails.createdBy?.name?.charAt(0) ||
                              "?"}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight={500}>
                              {currentGroupDetails.createdBy?.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {currentGroupDetails.createdBy?.email}
                            </Typography>
                          </Box>
                          <Chip size="small" label="Creator" color="primary" />
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Other Members */}
                    {currentGroupDetails.members?.map((member) => (
                      <Card
                        key={member.user?._id}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      >
                        <CardContent
                          sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor:
                                  member.status === "accepted"
                                    ? "success.main"
                                    : "warning.main",
                              }}
                            >
                              {member.user?.name?.charAt(0) || "?"}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight={500}>
                                {member.user?.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.user?.email}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={
                                member.status === "accepted"
                                  ? "Member"
                                  : "Pending"
                              }
                              color={
                                member.status === "accepted"
                                  ? "success"
                                  : "warning"
                              }
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => setInviteDialogOpen(true)}
                    sx={{ mt: 2 }}
                  >
                    Invite More People
                  </Button>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
              {currentGroupDetails.createdBy?._id ===
              currentGroup?.createdBy?._id ? (
                <Button
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteGroup(currentGroup._id)}
                >
                  Delete
                </Button>
              ) : (
                <Button
                  color="warning"
                  size="small"
                  startIcon={<ExitToApp />}
                  onClick={() => handleLeaveGroup(currentGroup._id)}
                >
                  Leave
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              <Button
                variant="contained"
                onClick={() => setGroupDetailsOpen(false)}
              >
                Done
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Invite Dialog */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Autocomplete
              freeSolo
              options={searchResults}
              getOptionLabel={(option) =>
                typeof option === "string"
                  ? option
                  : `${option.name} (${option.email})`
              }
              loading={searchLoading}
              onInputChange={(e, value) => {
                setInviteEmail(value);
                handleSearchUsers(value);
              }}
              onChange={(e, value) => {
                if (value && typeof value !== "string") {
                  setInviteEmail(value.email);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search by email"
                  placeholder="Enter email to search"
                  fullWidth
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInviteMember}
            disabled={!inviteEmail || !inviteEmail.includes("@")}
          >
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Description"
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
              placeholder="e.g., Dinner, Groceries"
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, amount: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Split Type</InputLabel>
              <Select
                value={expenseForm.splitType}
                label="Split Type"
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, splitType: e.target.value })
                }
              >
                <MenuItem value="equal">
                  Equal Split (among all members)
                </MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              The expense will be split equally among all group members.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExpenseDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddExpense}
            disabled={!expenseForm.description || !expenseForm.amount}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Group Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentGroupDetails?.autoCreateTransaction ?? true}
                  onChange={(e) =>
                    setCurrentGroupDetails({
                      ...currentGroupDetails,
                      autoCreateTransaction: e.target.checked,
                    })
                  }
                />
              }
              label="Auto-create transaction on settlement"
            />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              When enabled, settling a debt will automatically create a
              transaction in your main transactions.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSettings}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SplitGroupsPage;

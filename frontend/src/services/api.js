import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Auth
export const updatePassword = (currentPassword, newPassword) =>
  axios.put(`${API_URL}/auth/password`, { currentPassword, newPassword });

// Accounts
export const getAccounts = () => axios.get(`${API_URL}/accounts`);
export const getAvailableBanks = () => axios.get(`${API_URL}/accounts/banks`);
export const linkBankAccount = (bankName, accountNumber) =>
  axios.post(`${API_URL}/accounts/link-bank`, { bankName, accountNumber });
export const unlinkAccount = (id) => axios.delete(`${API_URL}/accounts/${id}`);
export const updateAccountBalance = (id, balance) =>
  axios.put(`${API_URL}/accounts/${id}`, { balance });

// Transactions
export const getTransactions = (params) =>
  axios.get(`${API_URL}/transactions`, { params });
export const createTransaction = (data) =>
  axios.post(`${API_URL}/transactions`, data);
export const updateTransaction = (id, data) =>
  axios.put(`${API_URL}/transactions/${id}`, data);
export const deleteTransaction = (id) =>
  axios.delete(`${API_URL}/transactions/${id}`);
export const deleteAllTransactions = () =>
  axios.delete(`${API_URL}/transactions/all`);

// Budgets
export const getBudgets = () => axios.get(`${API_URL}/budgets`);
export const getBudgetStatus = () => axios.get(`${API_URL}/budgets/status`);
export const createBudget = (data) => axios.post(`${API_URL}/budgets`, data);
export const updateBudget = (id, data) =>
  axios.put(`${API_URL}/budgets/${id}`, data);
export const deleteBudget = (id) => axios.delete(`${API_URL}/budgets/${id}`);

// Dashboard
export const getDashboardSummary = () =>
  axios.get(`${API_URL}/dashboard/summary`);
export const getByCategory = (params) =>
  axios.get(`${API_URL}/dashboard/by-category`, { params });
export const getByDate = (params) =>
  axios.get(`${API_URL}/dashboard/by-date`, { params });
export const getTrends = () => axios.get(`${API_URL}/dashboard/trends`);

// Goals
export const getGoals = () => axios.get(`${API_URL}/goals`);
export const createGoal = (data) => axios.post(`${API_URL}/goals`, data);
export const updateGoal = (id, data) =>
  axios.put(`${API_URL}/goals/${id}`, data);
export const updateGoalProgress = (id, amount, accountId, date) =>
  axios.put(`${API_URL}/goals/${id}/progress`, { amount, accountId, date });
export const deleteGoal = (id) => axios.delete(`${API_URL}/goals/${id}`);

// Recurring Expenses
export const getRecurringExpenses = () =>
  axios.get(`${API_URL}/recurring-expenses`);
export const createRecurringExpense = (data) =>
  axios.post(`${API_URL}/recurring-expenses`, data);
export const updateRecurringExpense = (id, data) =>
  axios.put(`${API_URL}/recurring-expenses/${id}`, data);
export const deleteRecurringExpense = (id) =>
  axios.delete(`${API_URL}/recurring-expenses/${id}`);
export const processRecurringExpenses = () =>
  axios.post(`${API_URL}/recurring-expenses/process`);
export const processSingleRecurringExpense = (id) =>
  axios.post(`${API_URL}/recurring-expenses/${id}/process`);

// Debts (Person-based)
export const getDebtPersons = () => axios.get(`${API_URL}/debts`);
export const getDebtSummary = () => axios.get(`${API_URL}/debts/summary`);
export const getDebtPerson = (id) => axios.get(`${API_URL}/debts/${id}`);
export const createDebtPerson = (data) => axios.post(`${API_URL}/debts`, data);
export const updateDebtPerson = (id, data) =>
  axios.put(`${API_URL}/debts/${id}`, data);
export const addDebtTransaction = (personId, data) =>
  axios.post(`${API_URL}/debts/${personId}/transaction`, data);
export const deleteDebtTransaction = (personId, transactionId) =>
  axios.delete(`${API_URL}/debts/${personId}/transaction/${transactionId}`);
export const deleteDebtPerson = (id) => axios.delete(`${API_URL}/debts/${id}`);

// Changelog
export const getChangelog = (since) =>
  axios.get(`${API_URL}/changelog`, { params: { since } });

// Categories
export const getCategories = () => axios.get(`${API_URL}/categories`);
export const getCategorySummary = () =>
  axios.get(`${API_URL}/categories/summary`);
export const createCategory = (data) =>
  axios.post(`${API_URL}/categories`, data);
export const updateCategory = (id, data) =>
  axios.put(`${API_URL}/categories/${id}`, data);
export const deleteCategory = (id) =>
  axios.delete(`${API_URL}/categories/${id}`);

// Export
export const exportToExcel = (params) =>
  axios.get(`${API_URL}/export/excel`, {
    params,
    responseType: "blob",
  });
export const exportToPDF = (params) =>
  axios.get(`${API_URL}/export/pdf`, {
    params,
    responseType: "blob",
  });

// Custom Reports
export const generateSpendingReport = (params) =>
  axios.get(`${API_URL}/export/spending-report`, {
    params,
    responseType: "blob",
  });

// Notifications
export const getNotifications = () => axios.get(`${API_URL}/notifications`);
export const getUnreadNotificationCount = () =>
  axios.get(`${API_URL}/notifications/unread-count`);
export const markNotificationRead = (id) =>
  axios.put(`${API_URL}/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  axios.put(`${API_URL}/notifications/read-all`);
export const deleteNotification = (id) =>
  axios.delete(`${API_URL}/notifications/${id}`);

// Split Groups
export const getSplitGroups = () => axios.get(`${API_URL}/split-groups`);
export const getPendingGroupInvites = () =>
  axios.get(`${API_URL}/split-groups/invites`);
export const searchUsersForInvite = (email) =>
  axios.get(`${API_URL}/split-groups/search-users`, { params: { email } });
export const createSplitGroup = (data) =>
  axios.post(`${API_URL}/split-groups`, data);
export const getSplitGroup = (id) => axios.get(`${API_URL}/split-groups/${id}`);
export const updateSplitGroup = (id, data) =>
  axios.put(`${API_URL}/split-groups/${id}`, data);
export const deleteSplitGroup = (id) =>
  axios.delete(`${API_URL}/split-groups/${id}`);
export const inviteToGroup = (groupId, email) =>
  axios.post(`${API_URL}/split-groups/${groupId}/invite`, { email });
export const respondToGroupInvite = (groupId, accept) =>
  axios.put(`${API_URL}/split-groups/${groupId}/respond`, { accept });
export const leaveGroup = (groupId) =>
  axios.delete(`${API_URL}/split-groups/${groupId}/leave`);
export const addGroupExpense = (groupId, data) =>
  axios.post(`${API_URL}/split-groups/${groupId}/expense`, data);
export const deleteGroupExpense = (groupId, expenseId) =>
  axios.delete(`${API_URL}/split-groups/${groupId}/expense/${expenseId}`);
export const settleWithGroupMember = (groupId, memberId, amount) =>
  axios.post(`${API_URL}/split-groups/${groupId}/settle`, { memberId, amount });

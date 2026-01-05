import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardHome from "./pages/DashboardHome";
import TransactionsPage from "./pages/TransactionsPage";
import BudgetsPage from "./pages/BudgetsPage";
import AccountsPage from "./pages/AccountsPage";
import GoalsPage from "./pages/GoalsPage";
import ProfilePage from "./pages/ProfilePage";
import RecurringExpensesPage from "./pages/RecurringExpensesPage";
import DebtsPage from "./pages/DebtsPage";
import SplitGroupsPage from "./pages/SplitGroupsPage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <NotificationProvider>
                      <DashboardLayout />
                    </NotificationProvider>
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="recurring" element={<RecurringExpensesPage />} />
                <Route path="debts" element={<DebtsPage />} />
                <Route path="split-groups" element={<SplitGroupsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

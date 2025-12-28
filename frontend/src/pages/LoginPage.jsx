import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Validate email on change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Check if form is valid
  const isFormValid = email && password && !emailError;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient Background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
            : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)",
        }}
      />
      {/* Floating Orbs */}
      <Box
        sx={{
          position: "fixed",
          top: "20%",
          right: "15%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
          filter: "blur(20px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <Navbar />
      <Container maxWidth="sm" sx={{ pt: 8, position: "relative", zIndex: 1 }}>
        <Paper
          sx={{
            p: 4,
            background: isDark ? alpha("#1e293b", 0.7) : alpha("#ffffff", 0.85),
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${
              isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08)
            }`,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Welcome Back
            </Typography>
            <Typography color="text.secondary">
              Sign in to continue managing your finances
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              error={!!emailError}
              helperText={emailError}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !isFormValid}
              sx={{ py: 1.5, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </form>

          <Typography textAlign="center" color="text.secondary">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "inherit", fontWeight: 600 }}>
              Sign Up
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

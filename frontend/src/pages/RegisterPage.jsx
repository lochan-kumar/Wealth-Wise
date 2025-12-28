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

// Validation regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Validation handlers
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value && value.length < 2) {
      setNameError("Name must be at least 2 characters");
    } else if (value && value.length > 50) {
      setNameError("Name must be less than 50 characters");
    } else {
      setNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && !passwordRegex.test(value)) {
      setPasswordError(
        "Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&)"
      );
    } else {
      setPasswordError("");
    }
    // Also validate confirm password
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Check if form is valid
  const isFormValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    !nameError &&
    !emailError &&
    !passwordError &&
    !confirmPasswordError &&
    password === confirmPassword;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) return;

    setLoading(true);
    const result = await register(name, email, password);

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
          left: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)",
          filter: "blur(20px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <Navbar />
      <Container
        maxWidth="sm"
        sx={{ pt: 8, pb: 4, position: "relative", zIndex: 1 }}
      >
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
              Create Account
            </Typography>
            <Typography color="text.secondary">
              Start your financial journey today
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
              label="Full Name"
              value={name}
              onChange={handleNameChange}
              required
              error={!!nameError}
              helperText={nameError}
              sx={{ mb: 2 }}
            />
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
              onChange={handlePasswordChange}
              required
              error={!!passwordError}
              helperText={
                passwordError ||
                "8+ chars, 1 upper, 1 lower, 1 number, 1 special"
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
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
              {loading ? <CircularProgress size={24} /> : "Create Account"}
            </Button>
          </form>

          <Typography textAlign="center" color="text.secondary">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "inherit", fontWeight: 600 }}>
              Sign In
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;

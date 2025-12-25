import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  AccountBalance,
  TrendingUp,
  Security,
  Speed,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    title: "Multi-Account Management",
    description:
      "Link multiple bank accounts and track all your finances in one place.",
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: "Smart Analytics",
    description:
      "Visualize spending patterns with interactive charts and insights.",
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: "Budget Alerts",
    description: "Set category budgets and get alerts when approaching limits.",
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: "Real-time Tracking",
    description:
      "Track income and expenses instantly with auto-categorization.",
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "₹50Cr+", label: "Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Rating" },
];

const benefits = [
  "Free forever for personal use",
  "Bank-grade security & encryption",
  "No credit card required to start",
  "Export data anytime",
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: 8,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              color: "text.primary",
            }}
          >
            Personal Finance,{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              Simplified
            </Box>
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: "auto", fontWeight: 400 }}
          >
            The complete platform to track expenses, manage budgets, and achieve
            your financial goals. Trusted by thousands.
          </Typography>
          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              sx={{ px: 4, py: 1.5 }}
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{ px: 4, py: 1.5 }}
            >
              Sign In
            </Button>
          </Box>

          {/* Stats */}
          <Grid container spacing={4} sx={{ maxWidth: 800, mx: "auto" }}>
            {stats.map((stat, index) => (
              <Grid size={{ xs: 6, md: 3 }} key={index}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h4"
            textAlign="center"
            sx={{ mb: 2, fontWeight: 700 }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 500, mx: "auto" }}
          >
            Powerful tools to take control of your money
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 3,
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ color: "primary.main", mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ py: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                Why Choose WealthWise?
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                We built WealthWise to be the simplest, most powerful personal
                finance tool. No complexity, no hidden fees, just clarity.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  >
                    <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                    <Typography>{benefit}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Ready to start?
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Create your free account in seconds
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/register")}
                >
                  Create Free Account
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <Container maxWidth="lg">
          <Box
            sx={{
              py: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} WealthWise. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
              >
                Privacy
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
              >
                Terms
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
              >
                Contact
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

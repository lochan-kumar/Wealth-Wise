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
  useTheme,
  alpha,
} from "@mui/material";
import {
  AccountBalance,
  TrendingUp,
  Security,
  Speed,
  CheckCircle,
  ArrowForward,
  Star,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    title: "Multi-Account Management",
    description:
      "Link multiple bank accounts and track all your finances in one place.",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: "Smart Analytics",
    description:
      "Visualize spending patterns with interactive charts and insights.",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: "Budget Alerts",
    description: "Set category budgets and get alerts when approaching limits.",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: "Real-time Tracking",
    description:
      "Track income and expenses instantly with auto-categorization.",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Glass effect styles
  const glassStyle = {
    background: isDark ? alpha("#1e293b", 0.7) : alpha("#ffffff", 0.85),
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${
      isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08)
    }`,
    borderRadius: 3,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
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
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: isDark
              ? "radial-gradient(ellipse at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 40%)"
              : "radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(147, 51, 234, 0.08) 0%, transparent 50%)",
            animation: "pulse 15s ease-in-out infinite",
          },
          "@keyframes pulse": {
            "0%, 100%": { transform: "translate(0, 0)" },
            "50%": { transform: "translate(-5%, -5%)" },
          },
        }}
      />

      {/* Floating Orbs */}
      <Box
        sx={{
          position: "fixed",
          top: "10%",
          right: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
          filter: "blur(20px)",
          animation: "float 8s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
            "50%": { transform: "translateY(-30px) rotate(180deg)" },
          },
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "20%",
          left: "5%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)",
          filter: "blur(15px)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            pt: { xs: 10, md: 14 },
            pb: 10,
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.75,
              mb: 4,
              borderRadius: 5,
              ...glassStyle,
            }}
          >
            <Star sx={{ fontSize: 16, color: "#fbbf24" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: isDark ? "#f8fafc" : "#1e293b" }}
            >
              Trusted by 10,000+ users worldwide
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              color: isDark ? "#ffffff" : "#1e293b",
              textShadow: isDark ? "0 2px 40px rgba(0,0,0,0.3)" : "none",
              lineHeight: 1.1,
            }}
          >
            Personal Finance,{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Simplified
            </Box>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 5,
              maxWidth: 700,
              mx: "auto",
              fontWeight: 400,
              color: isDark ? alpha("#ffffff", 0.8) : "#64748b",
              lineHeight: 1.6,
            }}
          >
            The complete platform to track expenses, manage budgets, and achieve
            your financial goals with ease.
          </Typography>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mb: 8,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(user ? "/dashboard" : "/register")}
              endIcon={<ArrowForward />}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "#000",
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: "0 10px 40px -10px rgba(251, 191, 36, 0.5)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 20px 50px -10px rgba(251, 191, 36, 0.6)",
                  background:
                    "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
                },
              }}
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                borderWidth: 2,
                borderColor: isDark ? alpha("#ffffff", 0.5) : "#2563eb",
                color: isDark ? "#ffffff" : "#2563eb",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: isDark ? "#ffffff" : "#1d4ed8",
                  backgroundColor: isDark
                    ? alpha("#ffffff", 0.1)
                    : alpha("#2563eb", 0.05),
                  transform: "translateY(-3px)",
                },
              }}
            >
              Sign In
            </Button>
          </Box>

          {/* Stats - Glass Cards */}
          <Box
            sx={{
              ...glassStyle,
              p: 4,
              maxWidth: 900,
              mx: "auto",
            }}
          >
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid size={{ xs: 6, md: 3 }} key={index}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background:
                        "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: isDark ? alpha("#ffffff", 0.7) : "#64748b",
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 10 }}>
          <Typography
            variant="h3"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 800,
              color: isDark ? "#ffffff" : "#1e293b",
            }}
          >
            Everything You Need
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            sx={{
              mb: 8,
              maxWidth: 500,
              mx: "auto",
              color: isDark ? alpha("#ffffff", 0.7) : "#64748b",
            }}
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
                    ...glassStyle,
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: `0 30px 60px -15px ${alpha("#000", 0.3)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 3,
                        background: feature.gradient,
                        boxShadow: `0 10px 30px -10px ${alpha("#000", 0.3)}`,
                        color: "#fff",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1.5,
                        fontWeight: 700,
                        color: isDark ? "#ffffff" : "#1e293b",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isDark ? alpha("#ffffff", 0.7) : "#64748b",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ py: 10 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h3"
                sx={{
                  mb: 3,
                  fontWeight: 800,
                  color: isDark ? "#ffffff" : "#1e293b",
                }}
              >
                Why Choose WealthWise?
              </Typography>
              <Typography
                sx={{
                  mb: 4,
                  color: isDark ? alpha("#ffffff", 0.8) : "#64748b",
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                }}
              >
                We built WealthWise to be the simplest, most powerful personal
                finance tool. No complexity, no hidden fees, just clarity.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {benefits.map((benefit, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      ...glassStyle,
                    }}
                  >
                    <CheckCircle sx={{ color: "#22c55e", fontSize: 24 }} />
                    <Typography
                      sx={{
                        color: isDark ? "#ffffff" : "#1e293b",
                        fontWeight: 500,
                      }}
                    >
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 5,
                  textAlign: "center",
                  ...glassStyle,
                  border: `2px solid ${alpha("#fbbf24", 0.3)}`,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: isDark ? "#ffffff" : "#1e293b",
                  }}
                >
                  Ready to start?
                </Typography>
                <Typography
                  sx={{
                    mb: 4,
                    color: isDark ? alpha("#ffffff", 0.7) : "#64748b",
                  }}
                >
                  Create your free account in seconds and take control of your
                  finances today.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => navigate("/register")}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
                    background:
                      "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    color: "#000",
                    fontWeight: 700,
                    borderRadius: 2,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
                    },
                  }}
                >
                  Create Free Account
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: "auto", position: "relative", zIndex: 1 }}>
        <Divider
          sx={{
            borderColor: isDark ? alpha("#ffffff", 0.1) : alpha("#000000", 0.1),
          }}
        />
        <Container maxWidth="lg">
          <Box
            sx={{
              py: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: isDark ? alpha("#ffffff", 0.6) : "#64748b" }}
            >
              © {new Date().getFullYear()} WealthWise. All rights reserved.
            </Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              {["Privacy", "Terms", "Contact"].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: isDark ? alpha("#ffffff", 0.6) : "#64748b",
                    cursor: "pointer",
                    transition: "color 0.2s",
                    "&:hover": { color: "#fbbf24" },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

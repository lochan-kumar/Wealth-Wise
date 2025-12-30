import { useState } from "react";
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
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

const features = [
  {
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    title: "Multi-Account Management",
    description:
      "Link multiple bank accounts and track all your finances in one place.",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
  },
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: "Smart Analytics",
    description:
      "Visualize spending patterns with interactive charts and insights.",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: "Budget Alerts",
    description: "Set category budgets and get alerts when approaching limits.",
    gradient: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: "Real-time Tracking",
    description:
      "Track income and expenses instantly with auto-categorization.",
    gradient: "linear-gradient(135deg, #22c55e 0%, #4ade80 100%)",
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

  // Modal state
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleOpenLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const handleOpenRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

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
      {/* Base Gradient Background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          background: isDark
            ? "linear-gradient(180deg, #0a1628 0%, #0f2922 40%, #134e4a 70%, #0d3d3a 100%)"
            : "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 40%, #d1fae5 70%, #ecfdf5 100%)",
        }}
      />

      {/* Floating Orbs - Only visible below hero */}
      <Box
        sx={{
          position: "fixed",
          top: "40%",
          right: "5%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)",
          filter: "blur(30px)",
          zIndex: -1,
          animation: "float 8s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-40px)" },
          },
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "15%",
          left: "8%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          filter: "blur(25px)",
          zIndex: -1,
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          top: "60%",
          left: "45%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)",
          filter: "blur(20px)",
          zIndex: -1,
          animation: "float 12s ease-in-out infinite",
        }}
      />

      {/* Hero Background Image - Only at top */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          zIndex: -1,
          backgroundImage: isDark
            ? 'url("/bg-hero.png")'
            : 'url("/bg-hero-light.png")',
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          filter: isDark ? "blur(5px)" : "blur(3px)",
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      />

      {/* Dark overlay for hero text readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          zIndex: -1,
          background: isDark
            ? "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)"
            : "transparent",
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            pt: { xs: 14, md: 18 },
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
              onClick={() =>
                user ? navigate("/dashboard") : handleOpenRegister()
              }
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
              onClick={handleOpenLogin}
              sx={{
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                borderWidth: 2,
                borderColor: isDark ? alpha("#ffffff", 0.5) : "#059669",
                color: isDark ? "#ffffff" : "#059669",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: isDark ? "#ffffff" : "#047857",
                  backgroundColor: isDark
                    ? alpha("#ffffff", 0.1)
                    : alpha("#059669", 0.05),
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

      {/* Auth Modals */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={handleOpenRegister}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={handleOpenLogin}
      />
    </Box>
  );
};

export default LandingPage;

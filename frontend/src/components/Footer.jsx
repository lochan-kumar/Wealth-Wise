import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Link,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const footerLinks = {
    Product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Security", href: "#" },
      { name: "Integrations", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Press", href: "#" },
    ],
    Resources: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Community", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "GDPR", href: "#" },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: "auto",
        background: isDark
          ? "linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.8) 100%)"
          : "linear-gradient(180deg, transparent 0%, rgba(240, 253, 244, 0.9) 100%)",
        borderTop: `1px solid ${
          isDark ? alpha("#ffffff", 0.1) : "rgba(5, 150, 105, 0.15)"
        }`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  background:
                    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(251, 191, 36, 0.4)",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M256 128L360 216L256 400L152 216L256 128Z"
                    fill="black"
                    fillOpacity="0.2"
                  />
                  <path
                    d="M256 148L340 226L256 380L172 226L256 148Z"
                    fill="black"
                  />
                  <path d="M256 148L340 226L256 266L256 148Z" fill="#78350F" />
                  <path d="M172 226L256 148L256 266L172 226Z" fill="#92400E" />
                </svg>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                WealthWise
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: isDark ? "#94a3b8" : "#64748b",
                mb: 3,
                maxWidth: 280,
                lineHeight: 1.7,
              }}
            >
              Your trusted companion for personal finance management. Track
              expenses, set budgets, and achieve your financial goals with ease.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[Twitter, LinkedIn, GitHub].map((Icon, index) => (
                <IconButton
                  key={index}
                  size="small"
                  sx={{
                    color: isDark ? "#94a3b8" : "#64748b",
                    border: `1px solid ${
                      isDark ? alpha("#ffffff", 0.1) : "rgba(5, 150, 105, 0.2)"
                    }`,
                    "&:hover": {
                      color: "#10b981",
                      borderColor: "#10b981",
                      bgcolor: alpha("#10b981", 0.1),
                    },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <Grid item xs={6} sm={3} md={2} key={title}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: isDark ? "#f8fafc" : "#1e293b",
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    underline="none"
                    sx={{
                      color: isDark ? "#94a3b8" : "#64748b",
                      fontSize: "0.875rem",
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "#10b981",
                      },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider
          sx={{
            my: 4,
            borderColor: isDark
              ? alpha("#ffffff", 0.1)
              : "rgba(5, 150, 105, 0.15)",
          }}
        />

        {/* Bottom Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#64748b" : "#94a3b8" }}
          >
            © {new Date().getFullYear()} WealthWise. All rights reserved.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Email
                sx={{ fontSize: 16, color: isDark ? "#64748b" : "#94a3b8" }}
              />
              <Typography
                variant="body2"
                sx={{ color: isDark ? "#64748b" : "#94a3b8" }}
              >
                support@wealthwise.com
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Phone
                sx={{ fontSize: 16, color: isDark ? "#64748b" : "#94a3b8" }}
              />
              <Typography
                variant="body2"
                sx={{ color: isDark ? "#64748b" : "#94a3b8" }}
              >
                +91 98765 43210
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

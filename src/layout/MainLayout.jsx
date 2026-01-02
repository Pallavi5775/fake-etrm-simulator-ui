import { Box, Stack, Button, Typography, Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ExitToApp as LogoutIcon } from "@mui/icons-material";

export default function MainLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Redirect to auth page
    navigate("/auth");
  };

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Left navigation */}
      <Stack
        sx={{
          width: 200,
          background: "#11132B",
          p: 2,
          gap: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* User Info */}
        <Box sx={{ mb: 2, pb: 2, borderBottom: "1px solid #252862" }}>
          <Typography variant="caption" sx={{ color: "#B0BEC5", display: "block" }}>
            Logged in as
          </Typography>
          <Typography variant="body2" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
            {user.username || "User"}
          </Typography>
          {user.role && (
            <Typography variant="caption" sx={{ color: "#B388FF", display: "block" }}>
              {user.role}
            </Typography>
          )}
        </Box>

        {/* Navigation Buttons */}
        <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 1, mb: 0.5, fontWeight: 600 }}>
          Front Office
        </Typography>
        <Button component={Link} to="/fo/trade-booking" size="small">Book Trade</Button>
        <Button component={Link} to="/trades/search" size="small">Search Trades</Button>

        <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 2, mb: 0.5, fontWeight: 600 }}>
          Risk Management
        </Typography>
        <Button component={Link} to="/risk/approvals" size="small">Approval Queue</Button>
        <Button component={Link} to="/risk/positions" size="small">Positions</Button>
        <Button component={Link} to="/risk/limits" size="small">Risk Limits</Button>
        <Button component={Link} to="/risk/breaches" size="small">Breaches</Button>
        <Button component={Link} to="/risk/var" size="small">VaR</Button>

        <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 2, mb: 0.5, fontWeight: 600 }}>
          Operations
        </Typography>
        <Button component={Link} to="/mo/trade-status" size="small">Trade Status</Button>
        <Button component={Link} to="/mo/lifecycle" size="small">Lifecycle</Button>
        <Button component={Link} to="/mo/batch-valuation" size="small">Batch Valuation</Button>
        <Button component={Link} to="/mo/pnl" size="small">P&L</Button>
        <Button component={Link} to="/mo/pnl-attribution" size="small">P&L Attribution</Button>
        <Button component={Link} to="/mo/scenarios" size="small">Scenarios</Button>

        <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 2, mb: 0.5, fontWeight: 600 }}>
          Configuration
        </Typography>
        <Button component={Link} to="/config" size="small">Dashboard</Button>
        <Button component={Link} to="/config/counterparties" size="small">Counterparties</Button>
        <Button component={Link} to="/config/instruments" size="small">Instruments</Button>
        <Button component={Link} to="/config/portfolios" size="small">Portfolios</Button>
        <Button component={Link} to="/config/templates" size="small">Deal Templates</Button>
        <Button component={Link} to="/config/lifecycle" size="small">Lifecycle Rules</Button>
        <Button component={Link} to="/config/approvals" size="small">Approval Rules</Button>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Logout Button */}
        <Divider sx={{ my: 1, borderColor: "#252862" }} />
        <Button
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: "#FF5252",
            "&:hover": {
              backgroundColor: "#FF525220"
            }
          }}
        >
          Logout
        </Button>
      </Stack>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

import { Box, Stack, Button, Typography, Divider, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { ExitToApp as LogoutIcon, Menu as MenuIcon } from "@mui/icons-material";
import { useState } from "react";

export default function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Redirect to auth page
    navigate("/auth");
  };

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const sidebarContent = (
    <Stack
      sx={{
        width: isMobile ? 280 : 200,
        background: "#11132B",
        p: 2,
        gap: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%"
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
      <Button component={Link} to="/fo/trade-booking" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Book Trade</Button>
      <Button component={Link} to="/fo/multi-leg-booking" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Multi-Leg Spreads</Button>
      <Button component={Link} to="/trades/search" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Search Trades</Button>

      <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 2, mb: 0.5, fontWeight: 600 }}>
        Risk Management
      </Typography>
      <Button component={Link} to="/risk/approvals" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Approval Queue</Button>
      <Button component={Link} to="/risk/positions" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Positions</Button>
      <Button component={Link} to="/risk/limits" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Risk Limits</Button>
      <Button component={Link} to="/risk/breaches" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Breaches</Button>
      <Button component={Link} to="/risk/var" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>VaR</Button>

      <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 2, mb: 0.5, fontWeight: 600 }}>
        Operations
      </Typography>
      <Button component={Link} to="/mo/trade-status" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Trade Status</Button>
      <Button component={Link} to="/mo/lifecycle" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Lifecycle</Button>
      <Button component={Link} to="/mo/batch-valuation" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Batch Valuation</Button>
      <Button component={Link} to="/mo/pnl" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>P&L</Button>
      <Button component={Link} to="/mo/pnl-attribution" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>P&L Attribution</Button>
      <Button component={Link} to="/mo/scenarios" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Scenarios</Button>

      <Typography variant="caption" sx={{ color: "#B0BEC5", mt: 2, mb: 0.5, fontWeight: 600 }}>
        Configuration
      </Typography>
      <Button component={Link} to="/config" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Dashboard</Button>
      <Button component={Link} to="/config/counterparties" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Counterparties</Button>
      <Button component={Link} to="/config/instruments" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Instruments</Button>
      <Button component={Link} to="/config/portfolios" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Portfolios</Button>
      <Button component={Link} to="/config/templates" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Deal Templates</Button>
      {/* <Button component={Link} to="/config/lifecycle" size="small">Lifecycle Rules</Button> */}
      <Button component={Link} to="/config/approvals" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Approval Rules</Button>
      <Button component={Link} to="/config/forward-curves" size="small" fullWidth={isMobile} onClick={() => isMobile && setDrawerOpen(false)}>Forward Curves</Button>

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Logout Button */}
      <Divider sx={{ my: 1, borderColor: "#252862" }} />
      <Button
        startIcon={<LogoutIcon />}
        onClick={() => { handleLogout(); if (isMobile) setDrawerOpen(false); }}
        sx={{
          color: "#FF5252",
          "&:hover": {
            backgroundColor: "#FF525220"
          }
        }}
        fullWidth={isMobile}
      >
        Logout
      </Button>
    </Stack>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {isMobile ? (
        <>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                backgroundColor: "#11132B",
                borderRight: "1px solid #252862"
              }
            }}
          >
            {sidebarContent}
          </Drawer>
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid #252862", backgroundColor: "#11132B" }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{ color: "#EDE7F6" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
              {children}
            </Box>
          </Box>
        </>
      ) : (
        <>
          {sidebarContent}
          <Box sx={{ flex: 1, p: 2 }}>
            {children}
          </Box>
        </>
      )}
    </Box>
  );
}

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
    navigate("/");
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
        <Button component={Link} to="/config">Configuration</Button>
        <Button component={Link} to="/fo">Front Office</Button>
        <Button component={Link} to="/mo">Middle Office</Button>
        <Button component={Link} to="/risk">Risk</Button>

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

import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Tab, Tabs, MenuItem, Stack, Alert, Paper,
  useMediaQuery, useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiConfig from '../config/apiConfig';

const BASE_URL = apiConfig.baseURL + "/auth";

export default function AuthPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: ""
  });

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/config");
    }

    // Fetch active roles
    fetch(`${BASE_URL}/roles/active`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("Roles API response:", data); // Debug log
        // Handle array response or object with roles property
        const rolesList = Array.isArray(data) ? data : (data.roles || []);
        console.log("Parsed roles list:", rolesList); // Debug log
        setRoles(rolesList);
      })
      .catch(err => {
        console.error("Failed to load roles:", err);
        setError("Warning: Could not load roles. Using default role.");
        setRoles([{ value: "RISK", label: "Risk Manager" }]);
      });

    // Fetch all users for login dropdown
    fetch(`${apiConfig.baseURL}/users`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("Users API response:", data); // Debug log
        const usersList = Array.isArray(data) ? data : (data.users || []);
        console.log("Parsed users list:", usersList); // Debug log
        setUsers(usersList);
      })
      .catch(err => {
        console.error("Failed to load users:", err);
        // Don't show error for users, just leave dropdown empty
        setUsers([]);
      });
  }, [navigate]);

  const handleUserSelect = async (selectedUser) => {
    if (selectedUser) {
      const username = selectedUser.username;
      const password = selectedUser.password;
      
      // Perform login automatically
      setError("");
      setSuccess("");

      try {
        const res = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.userId) {
          // Success
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("token", data.token);
          setSuccess("Login successful! Redirecting...");
          setTimeout(() => navigate("/config"), 1000);
        } else {
          setError(data.message || "Login failed");
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error("Login error:", err);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!registerData.username || !registerData.password) {
      setError("Username and password are required");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
      });

      const data = await res.json();

      if (data.userId) {
        // Success
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => navigate("/config"), 1000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Registration error:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
        p: isMobile ? 1 : 2
      }}
    >
      <Card sx={{ maxWidth: isMobile ? "100%" : 500, width: "100%", mx: isMobile ? 1 : 0 }} elevation={3}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          <Typography variant={isMobile ? "h5" : "h4"} align="center" gutterBottom fontWeight="bold">
            CTRM Simulator
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Commodity Trading Risk Management System
          </Typography>

          <Tabs value={tab} onChange={(e, v) => setTab(v)} centered sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Login Form */}
          {tab === 0 && (
            <Box>
              <Stack spacing={2}>
                {users.length > 0 ? (
                  <TextField
                    select
                    label="Username"
                    fullWidth
                    value=""
                    onChange={(e) => {
                      const selectedUser = users.find(u => u.username === e.target.value);
                      handleUserSelect(selectedUser);
                    }}
                    helperText="Select a user to login automatically"
                  >
                    <MenuItem value="">
                      <em>Select a user...</em>
                    </MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.username} value={user.username}>
                        {user.username} ({user.role || 'User'})
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Loading users...
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {/* Register Form */}
          {tab === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <Stack spacing={2}>
                <TextField
                  label="Username"
                  fullWidth
                  required
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, username: e.target.value })
                  }
                  autoComplete="username"
                  helperText="Unique username for login"
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  autoComplete="new-password"
                  helperText="Minimum 6 characters"
                />

                <TextField
                  label="Full Name"
                  fullWidth
                  value={registerData.fullName}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, fullName: e.target.value })
                  }
                  autoComplete="name"
                />

                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, email: e.target.value })
                  }
                  autoComplete="email"
                />

                <TextField
                  select
                  label="Role"
                  fullWidth
                  required
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, role: e.target.value })
                  }
                >
                  {roles?.map((role) => (
                    <MenuItem key={role.roleName} value={role.roleName}>
                      {role.displayName}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Register
                </Button>
              </Stack>
            </Box>
          )}

          <Paper variant="outlined" sx={{ mt: 3, p: isMobile ? 1.5 : 2, bgcolor: "grey.50" }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Login:</strong> Select a user from the dropdown above to login automatically.<br />
              {isMobile ? (
                <>
                  <br />Available accounts:<br />
                  • risk_user (Risk Manager)<br />
                  • trader1 (Senior Trader)
                </>
              ) : (
                <>
                  Available accounts: risk_user (Risk Manager), trader1 (Senior Trader)
                </>
              )}
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  LinearProgress, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";

const BASE_URL = "http://localhost:8080/api";

const LIMIT_TYPES = ["POSITION", "MTM", "VAR", "CONCENTRATION"];
const LIMIT_SCOPES = ["PORTFOLIO", "COMMODITY", "COUNTERPARTY", "DESK"];
const BREACH_ACTIONS = ["BLOCK", "ALERT", "NOTIFY"];

/**
 * Risk Limits Dashboard with traffic light indicators
 */
export default function LimitDashboard() {
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLimit, setNewLimit] = useState({
    limitType: "POSITION",
    scope: "PORTFOLIO",
    entity: "",
    maxValue: "",
    warningThreshold: "80",
    breachAction: "ALERT"
  });

  useEffect(() => {
    fetchLimits();
    fetchBreaches();
  }, []);

  const fetchLimits = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/limits`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setLimits(data);
      } else {
        setError("Failed to load limits");
      }
    } catch (err) {
      console.error("Error fetching limits:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreaches = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/breaches/active`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setBreaches(data);
      }
    } catch (err) {
      console.error("Error fetching breaches:", err);
    }
  };

  const handleCreateLimit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/limits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          ...newLimit,
          maxValue: parseFloat(newLimit.maxValue),
          warningThreshold: parseFloat(newLimit.warningThreshold)
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: "Limit created successfully",
          severity: "success"
        });
        setDialogOpen(false);
        fetchLimits();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to create limit",
          severity: "error"
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Network error: " + err.message,
        severity: "error"
      });
    }
  };

  const getLimitStatus = (limit) => {
    const utilization = (limit.currentValue / limit.maxValue) * 100;
    const warningThreshold = limit.warningThreshold || 80;

    if (utilization >= 100) return { status: "BREACH", color: "error", icon: <ErrorIcon /> };
    if (utilization >= warningThreshold) return { status: "WARNING", color: "warning", icon: <WarningIcon /> };
    return { status: "OK", color: "success", icon: <CheckCircleIcon /> };
  };

  if (loading) {
    return <LoadingSpinner message="Loading limits..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          🚦 Risk Limits Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchLimits();
              fetchBreaches();
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            New Limit
          </Button>
        </Stack>
      </Stack>

      {/* Active Breaches Alert */}
      {breaches.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "error.light", color: "error.contrastText" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ErrorIcon />
            <Typography variant="h6">
              {breaches.length} Active Breach{breaches.length > 1 ? "es" : ""}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => window.location.href = "/risk/breaches"}
            >
              View All
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Limits Grid */}
      <Grid container spacing={3}>
        {limits?.map(limit => {
          const { status, color, icon } = getLimitStatus(limit);
          const utilization = (limit.currentValue / limit.maxValue) * 100;

          return (
            <Grid item xs={12} md={6} key={limit.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {limit.entity}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={limit.limitType} size="small" />
                        <Chip label={limit.scope} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                    <Chip
                      icon={icon}
                      label={status}
                      color={color}
                      size="small"
                    />
                  </Stack>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current: {limit.currentValue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Limit: {limit.maxValue.toLocaleString()}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(utilization, 100)}
                      color={color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {utilization.toFixed(1)}% Utilized
                    </Typography>
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Warning at {limit.warningThreshold}%
                    </Typography>
                    <Chip
                      label={limit.breachAction}
                      size="small"
                      color={limit.breachAction === "BLOCK" ? "error" : "default"}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {limits.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No risk limits configured
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Create First Limit
          </Button>
        </Paper>
      )}

      {/* Create Limit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Risk Limit</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Limit Type"
              fullWidth
              value={newLimit.limitType}
              onChange={e => setNewLimit({ ...newLimit, limitType: e.target.value })}
            >
              {LIMIT_TYPES?.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Scope"
              fullWidth
              value={newLimit.scope}
              onChange={e => setNewLimit({ ...newLimit, scope: e.target.value })}
            >
              {LIMIT_SCOPES?.map(scope => (
                <MenuItem key={scope} value={scope}>{scope}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Entity"
              fullWidth
              required
              value={newLimit.entity}
              onChange={e => setNewLimit({ ...newLimit, entity: e.target.value })}
              placeholder="e.g., CRUDE_FO, BP, CRUDE_OIL"
            />

            <TextField
              label="Max Value"
              type="number"
              fullWidth
              required
              value={newLimit.maxValue}
              onChange={e => setNewLimit({ ...newLimit, maxValue: e.target.value })}
            />

            <TextField
              label="Warning Threshold (%)"
              type="number"
              fullWidth
              value={newLimit.warningThreshold}
              onChange={e => setNewLimit({ ...newLimit, warningThreshold: e.target.value })}
              helperText="Alert when utilization exceeds this percentage"
            />

            <TextField
              select
              label="Breach Action"
              fullWidth
              value={newLimit.breachAction}
              onChange={e => setNewLimit({ ...newLimit, breachAction: e.target.value })}
            >
              {BREACH_ACTIONS?.map(action => (
                <MenuItem key={action} value={action}>{action}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateLimit}
            disabled={!newLimit.entity || !newLimit.maxValue}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}

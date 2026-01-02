import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  Chip, IconButton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";

const BASE_URL = "http://localhost:8080/api";

/**
 * Active Limit Breaches View with Resolution Actions
 */
export default function BreachAlert() {
  const [loading, setLoading] = useState(true);
  const [breaches, setBreaches] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [resolveDialog, setResolveDialog] = useState({ open: false, breach: null });
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    fetchBreaches();
    const interval = setInterval(fetchBreaches, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchBreaches = async () => {
    setLoading(true);
    setError(null);

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
      } else {
        setError("Failed to load breaches");
      }
    } catch (err) {
      console.error("Error fetching breaches:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveDialog.breach) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/breaches/${resolveDialog.breach.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          resolvedBy: user.username,
          resolutionNotes: resolutionNotes
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: "Breach resolved successfully",
          severity: "success"
        });
        setResolveDialog({ open: false, breach: null });
        setResolutionNotes("");
        fetchBreaches();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to resolve breach",
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

  const columns = [
    {
      field: "severity",
      label: "Severity",
      sortable: true,
      render: (val) => (
        <Chip
          icon={<ErrorIcon />}
          label={val}
          color={val === "CRITICAL" ? "error" : "warning"}
          size="small"
        />
      )
    },
    {
      field: "limitType",
      label: "Limit Type",
      sortable: true
    },
    {
      field: "entity",
      label: "Entity",
      sortable: true,
      render: (val) => <Typography fontWeight="bold">{val}</Typography>
    },
    {
      field: "currentValue",
      label: "Current Value",
      sortable: true,
      render: (val) => val.toLocaleString()
    },
    {
      field: "limitValue",
      label: "Limit",
      sortable: true,
      render: (val) => val.toLocaleString()
    },
    {
      field: "breachAmount",
      label: "Breach Amount",
      sortable: true,
      render: (val, row) => {
        const amount = row.currentValue - row.limitValue;
        const percent = ((amount / row.limitValue) * 100).toFixed(1);
        return (
          <Stack>
            <Typography color="error.main" fontWeight="bold">
              +{amount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({percent}% over)
            </Typography>
          </Stack>
        );
      }
    },
    {
      field: "breachAction",
      label: "Action",
      sortable: true,
      render: (val) => (
        <Chip
          label={val}
          size="small"
          color={val === "BLOCK" ? "error" : "warning"}
        />
      )
    },
    {
      field: "detectedAt",
      label: "Detected",
      sortable: true,
      render: (val) => new Date(val).toLocaleString()
    },
    {
      field: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      render: (val, row) => (
        <Button
          size="small"
          variant="outlined"
          color="success"
          startIcon={<CheckIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setResolveDialog({ open: true, breach: row });
          }}
        >
          Resolve
        </Button>
      )
    }
  ];

  if (loading && breaches.length === 0) {
    return <LoadingSpinner message="Loading breaches..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          🚨 Active Limit Breaches
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchBreaches}
        >
          Refresh
        </Button>
      </Stack>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "error.light" }}>
            <CardContent>
              <Typography color="error.contrastText" gutterBottom>
                Critical Breaches
              </Typography>
              <Typography variant="h3" color="error.contrastText">
                {breaches.filter(b => b.severity === "CRITICAL").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "warning.light" }}>
            <CardContent>
              <Typography color="warning.contrastText" gutterBottom>
                Warning Breaches
              </Typography>
              <Typography variant="h3" color="warning.contrastText">
                {breaches.filter(b => b.severity === "WARNING").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Active
              </Typography>
              <Typography variant="h3">
                {breaches.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Breaches Table */}
      {breaches.length > 0 ? (
        <DataTable
          columns={columns}
          rows={breaches}
          defaultSortBy="severity"
          defaultSortDirection="desc"
          pageSize={25}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "success.light" }}>
          <CheckIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
          <Typography variant="h6" color="success.main">
            No Active Breaches
          </Typography>
          <Typography color="text.secondary">
            All risk limits are within acceptable thresholds
          </Typography>
        </Paper>
      )}

      {/* Resolve Dialog */}
      <Dialog
        open={resolveDialog.open}
        onClose={() => setResolveDialog({ open: false, breach: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resolve Limit Breach</DialogTitle>
        <DialogContent>
          {resolveDialog.breach && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Entity:</strong> {resolveDialog.breach.entity}
              </Typography>
              <Typography variant="body2">
                <strong>Limit Type:</strong> {resolveDialog.breach.limitType}
              </Typography>
              <Typography variant="body2">
                <strong>Breach Amount:</strong>{" "}
                <span style={{ color: "red", fontWeight: "bold" }}>
                  {(resolveDialog.breach.currentValue - resolveDialog.breach.limitValue).toLocaleString()}
                </span>
              </Typography>

              <TextField
                label="Resolution Notes"
                multiline
                rows={4}
                fullWidth
                required
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Describe how this breach was resolved..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setResolveDialog({ open: false, breach: null });
            setResolutionNotes("");
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleResolve}
            disabled={!resolutionNotes.trim()}
          >
            Mark as Resolved
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

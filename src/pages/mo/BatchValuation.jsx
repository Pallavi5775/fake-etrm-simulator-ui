import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  TextField, Chip
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";

const BASE_URL = "http://localhost:8080/api";

/**
 * Batch Valuation Management - Trigger and monitor EOD valuation runs
 */
export default function BatchValuation() {
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState([]);
  const [config, setConfig] = useState({
    valuationDate: new Date().toISOString().split("T")[0],
    portfolioFilter: ""
  });
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchRuns = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/batch/runs`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setRuns(data);
      }
    } catch (err) {
      console.error("Error fetching runs:", err);
    }
  };

  const handleStartRun = async () => {
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          ...config,
          portfolioFilter: config.portfolioFilter || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setToast({
          open: true,
          message: `Batch valuation started - Run ID: ${data.runId}`,
          severity: "success"
        });
        setTimeout(fetchRuns, 1000); // Refresh list
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to start valuation",
          severity: "error"
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Network error: " + err.message,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIcon color="success" />;
      case "FAILED":
        return <ErrorIcon color="error" />;
      case "RUNNING":
        return <HourglassEmptyIcon color="primary" />;
      default:
        return null;
    }
  };

  const columns = [
    {
      field: "runId",
      label: "Run ID",
      sortable: true,
      render: (val) => <Typography fontWeight="bold">{val}</Typography>
    },
    {
      field: "status",
      label: "Status",
      sortable: true,
      render: (val) => (
        <Chip
          icon={getStatusIcon(val)}
          label={val}
          size="small"
          color={
            val === "COMPLETED" ? "success" :
            val === "FAILED" ? "error" :
            val === "RUNNING" ? "primary" :
            "default"
          }
        />
      )
    },
    {
      field: "valuationDate",
      label: "Valuation Date",
      sortable: true
    },
    {
      field: "portfolioFilter",
      label: "Portfolio",
      sortable: true,
      render: (val) => val || "All"
    },
    {
      field: "totalTrades",
      label: "Total Trades",
      sortable: true
    },
    {
      field: "successCount",
      label: "Success",
      sortable: true,
      render: (val) => (
        <Typography color="success.main" fontWeight="bold">
          {val}
        </Typography>
      )
    },
    {
      field: "failureCount",
      label: "Failed",
      sortable: true,
      render: (val) => (
        <Typography color={val > 0 ? "error.main" : "text.secondary"} fontWeight="bold">
          {val}
        </Typography>
      )
    },
    {
      field: "durationMs",
      label: "Duration",
      sortable: true,
      render: (val) => val ? `${(val / 1000).toFixed(2)}s` : "-"
    },
    {
      field: "startTime",
      label: "Started",
      sortable: true,
      render: (val) => new Date(val).toLocaleTimeString()
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          🔄 Batch Valuation
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRuns}
        >
          Refresh
        </Button>
      </Stack>

      {/* Trigger Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Start New Batch Run
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Valuation Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={config.valuationDate}
              onChange={e => setConfig({ ...config, valuationDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Portfolio Filter (optional)"
              fullWidth
              value={config.portfolioFilter}
              onChange={e => setConfig({ ...config, portfolioFilter: e.target.value })}
              placeholder="Leave empty for all portfolios"
            />
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={handleStartRun}
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? "Starting..." : "Start Valuation"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Runs Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Running
              </Typography>
              <Typography variant="h4" color="primary.main">
                {runs.filter(r => r.status === "RUNNING").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {runs.filter(r => r.status === "COMPLETED").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error.main">
                {runs.filter(r => r.status === "FAILED").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Runs
              </Typography>
              <Typography variant="h4">
                {runs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Runs Table */}
      {runs.length > 0 ? (
        <DataTable
          columns={columns}
          rows={runs}
          defaultSortBy="runId"
          defaultSortDirection="desc"
          pageSize={10}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No valuation runs yet. Start your first batch run above.
          </Typography>
        </Paper>
      )}

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}

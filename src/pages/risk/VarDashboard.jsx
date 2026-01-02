import { useState } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  TextField, MenuItem, Chip
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";

const BASE_URL = "http://localhost:8080/api";

const CONFIDENCE_LEVELS = [90, 95, 99];
const HORIZONS = [1, 5, 10];

/**
 * VaR Calculation Dashboard with ladder view and decomposition
 */
export default function VarDashboard() {
  const [loading, setLoading] = useState(false);
  const [varResults, setVarResults] = useState(null);
  const [config, setConfig] = useState({
    portfolio: "",
    confidenceLevel: 95,
    horizon: 10,
    method: "HISTORICAL"
  });
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const handleCalculateVaR = async () => {
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/var/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        const data = await res.json();
        setVarResults(data);
        setToast({
          open: true,
          message: "VaR calculated successfully",
          severity: "success"
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "VaR calculation failed",
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📊 VaR Dashboard
      </Typography>

      {/* Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          VaR Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Portfolio"
              fullWidth
              value={config.portfolio}
              onChange={e => setConfig({ ...config, portfolio: e.target.value })}
              placeholder="e.g., CRUDE_FO"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Confidence Level"
              fullWidth
              value={config.confidenceLevel}
              onChange={e => setConfig({ ...config, confidenceLevel: e.target.value })}
            >
              {CONFIDENCE_LEVELS?.map(level => (
                <MenuItem key={level} value={level}>{level}%</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Horizon (days)"
              fullWidth
              value={config.horizon}
              onChange={e => setConfig({ ...config, horizon: e.target.value })}
            >
              {HORIZONS?.map(h => (
                <MenuItem key={h} value={h}>{h} Day{h > 1 ? "s" : ""}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<CalculateIcon />}
              onClick={handleCalculateVaR}
              disabled={loading || !config.portfolio}
              sx={{ height: 56 }}
            >
              {loading ? "Calculating..." : "Calculate VaR"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {loading && <LoadingSpinner message="Calculating VaR..." />}

      {varResults && !loading && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Portfolio VaR
                  </Typography>
                  <Typography variant="h3" color="error.main">
                    ${varResults.portfolioVar?.toLocaleString() || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {config.confidenceLevel}% confidence, {config.horizon}d horizon
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    CVaR (Expected Shortfall)
                  </Typography>
                  <Typography variant="h3" color="error.main">
                    ${varResults.cvar?.toLocaleString() || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average loss beyond VaR
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Portfolio Value
                  </Typography>
                  <Typography variant="h3">
                    ${varResults.portfolioValue?.toLocaleString() || "N/A"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total notional exposure
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* VaR Ladder */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              VaR Ladder
            </Typography>
            <Grid container spacing={2}>
              {varResults.varLadder && varResults.varLadder?.map(item => (
                <Grid item xs={12} sm={4} key={item.confidenceLevel}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        {item.confidenceLevel}% VaR
                      </Typography>
                      <Typography variant="h5" color="error.main">
                        ${item.value.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}

      {!varResults && !loading && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Configure parameters and click "Calculate VaR" to run analysis
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

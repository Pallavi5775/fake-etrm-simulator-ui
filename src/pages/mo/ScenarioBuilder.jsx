import { useState } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  TextField, MenuItem, Chip, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";

const BASE_URL = "http://localhost:8080/api";

const SCENARIO_TYPES = [
  { value: "SPOT_SHOCK", label: "Spot Price Shock" },
  { value: "CURVE_SHIFT", label: "Forward Curve Shift" },
  { value: "VOL_SHOCK", label: "Volatility Shock" },
  { value: "FX_SHOCK", label: "FX Rate Shock" },
  { value: "CREDIT_SHOCK", label: "Credit Spread Shock" }
];

const PRESET_SCENARIOS = [
  { name: "Oil Crash (-20%)", type: "SPOT_SHOCK", magnitude: -20, commodity: "CRUDE_OIL" },
  { name: "Oil Spike (+30%)", type: "SPOT_SHOCK", magnitude: 30, commodity: "CRUDE_OIL" },
  { name: "Gas Rally (+50%)", type: "SPOT_SHOCK", magnitude: 50, commodity: "NATURAL_GAS" },
  { name: "Curve Steepening", type: "CURVE_SHIFT", magnitude: 10, commodity: null },
  { name: "Vol Spike (+50%)", type: "VOL_SHOCK", magnitude: 50, commodity: null }
];

/**
 * Scenario Analysis Builder - Create and run what-if scenarios
 */
export default function ScenarioBuilder() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [config, setConfig] = useState({
    scenarioName: "",
    scenarioType: "SPOT_SHOCK",
    portfolio: "",
    commodity: "",
    magnitude: "",
    shockDate: new Date().toISOString().split("T")[0]
  });
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const handleRunScenario = async () => {
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          ...config,
          magnitude: parseFloat(config.magnitude)
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setToast({
          open: true,
          message: "Scenario completed successfully",
          severity: "success"
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Scenario failed",
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

  const handlePresetScenario = (preset) => {
    setConfig({
      ...config,
      scenarioName: preset.name,
      scenarioType: preset.type,
      magnitude: preset.magnitude.toString(),
      commodity: preset.commodity || ""
    });
  };

  const columns = [
    {
      field: "tradeId",
      label: "Trade ID",
      sortable: true,
      render: (val) => <Typography fontWeight="bold">{val}</Typography>
    },
    {
      field: "portfolio",
      label: "Portfolio",
      sortable: true
    },
    {
      field: "commodity",
      label: "Commodity",
      sortable: true
    },
    {
      field: "baseValue",
      label: "Base Value",
      sortable: true,
      render: (val) => (
        <Typography variant="body2">
          {val?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
          })}
        </Typography>
      )
    },
    {
      field: "shockedValue",
      label: "Shocked Value",
      sortable: true,
      render: (val) => (
        <Typography variant="body2">
          {val?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
          })}
        </Typography>
      )
    },
    {
      field: "impact",
      label: "Impact",
      sortable: true,
      render: (val) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {val > 0 ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : val < 0 ? (
            <TrendingDownIcon color="error" fontSize="small" />
          ) : null}
          <Typography
            variant="body2"
            color={val >= 0 ? "success.main" : "error.main"}
            fontWeight="bold"
          >
            {val?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0
            })}
          </Typography>
        </Stack>
      )
    },
    {
      field: "impactPercent",
      label: "Impact %",
      sortable: true,
      render: (val, row) => {
        const percent = ((row.impact / row.baseValue) * 100).toFixed(2);
        return (
          <Typography
            variant="body2"
            color={row.impact >= 0 ? "success.main" : "error.main"}
          >
            {percent}%
          </Typography>
        );
      }
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🎭 Scenario Analysis
      </Typography>

      {/* Preset Scenarios */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Scenarios
        </Typography>
        <Grid container spacing={2}>
          {PRESET_SCENARIOS?.map(preset => (
            <Grid item xs={12} sm={6} md={2.4} key={preset.name}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handlePresetScenario(preset)}
              >
                {preset.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Custom Scenario Builder */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Custom Scenario
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Scenario Name"
              fullWidth
              value={config.scenarioName}
              onChange={e => setConfig({ ...config, scenarioName: e.target.value })}
              placeholder="e.g., Market Crash 2026"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Scenario Type"
              fullWidth
              value={config.scenarioType}
              onChange={e => setConfig({ ...config, scenarioType: e.target.value })}
            >
              {SCENARIO_TYPES?.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Portfolio"
              fullWidth
              value={config.portfolio}
              onChange={e => setConfig({ ...config, portfolio: e.target.value })}
              placeholder="e.g., CRUDE_FO"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Commodity (optional)"
              fullWidth
              value={config.commodity}
              onChange={e => setConfig({ ...config, commodity: e.target.value })}
              placeholder="e.g., CRUDE_OIL"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Magnitude (%)"
              type="number"
              fullWidth
              required
              value={config.magnitude}
              onChange={e => setConfig({ ...config, magnitude: e.target.value })}
              placeholder="e.g., -20 for -20%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Shock Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={config.shockDate}
              onChange={e => setConfig({ ...config, shockDate: e.target.value })}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleRunScenario}
          disabled={loading || !config.portfolio || !config.magnitude}
          sx={{ mt: 2 }}
        >
          {loading ? "Running Scenario..." : "Run Scenario"}
        </Button>
      </Paper>

      {/* Results */}
      {loading && <LoadingSpinner message="Running scenario analysis..." />}

      {results && !loading && (
        <>
          {/* Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Impact
                  </Typography>
                  <Typography
                    variant="h3"
                    color={results.totalImpact >= 0 ? "success.main" : "error.main"}
                  >
                    {results.totalImpact?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Trades Impacted
                  </Typography>
                  <Typography variant="h3">
                    {results.tradesImpacted || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Biggest Winner
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {results.biggestWinner?.tradeId || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    +{results.biggestWinner?.impact?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Biggest Loser
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {results.biggestLoser?.tradeId || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {results.biggestLoser?.impact?.toLocaleString() || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Trade Impact Details */}
          {results.tradeImpacts && results.tradeImpacts.length > 0 && (
            <DataTable
              columns={columns}
              rows={results.tradeImpacts}
              defaultSortBy="impact"
              defaultSortDirection="desc"
              pageSize={25}
            />
          )}
        </>
      )}

      {!results && !loading && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Configure a scenario above and click "Run Scenario" to analyze portfolio impact
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

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  TextField, Chip, IconButton, useMediaQuery, useTheme, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalculateIcon from "@mui/icons-material/Calculate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";
import httpClient from '../../api/httpClient';
import apiConfig from '../../config/apiConfig';

const BASE_URL = apiConfig.baseURL;

/**
 * Daily P&L Dashboard with breakdown by portfolio and commodity
 */
export default function PnlDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [pnlData, setPnlData] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [configData, setConfigData] = useState({
    yieldCurves: [],
    priceCurves: [],
    weatherData: [],
    generationForecast: []
  });
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    loadConfigData();
  }, []);

  useEffect(() => {
    if (date && configData.yieldCurves.length > 0) {
      fetchPnL();
      fetchTopPerformers();
    }
  }, [date, configData]);

  const loadConfigData = async () => {
    try {
      const [yieldCurves, priceCurves, weatherData, generationForecast] = await Promise.all([
        httpClient.get("/yield-curves"),
        httpClient.get("/price-curves"),
        httpClient.get("/weather-data"),
        httpClient.get("/generation-forecasts")
      ]);

      setConfigData({
        yieldCurves: yieldCurves.data || [],
        priceCurves: priceCurves.data || [],
        weatherData: weatherData.data || [],
        generationForecast: generationForecast.data || []
      });
    } catch (err) {
      console.error("Error loading config data:", err);
      setToast({
        open: true,
        message: "Failed to load configuration data",
        severity: "warning"
      });
    }
  };

  const calculateConfigImpact = () => {
    if (!pnlData) return null;

    // Calculate impact based on configuration data
    // Handle both raw API data (array) and grouped data (object)
    let yieldData = configData.yieldCurves;
    let priceData = configData.priceCurves;

    // If data is grouped (object with curveName keys), flatten it
    if (!Array.isArray(yieldData) && typeof yieldData === 'object') {
      yieldData = Object.values(yieldData).flat();
    }
    if (!Array.isArray(priceData) && typeof priceData === 'object') {
      priceData = Object.values(priceData).flat();
    }

    const yieldImpact = Array.isArray(yieldData) ? yieldData.reduce((sum, point) => sum + (point.value || 0), 0) : 0;
    const priceImpact = Array.isArray(priceData) ? priceData.reduce((sum, point) => sum + (point.price || 0), 0) : 0;

    // Weather data is an array of weather sets
    const weatherImpact = Array.isArray(configData.weatherData) ?
      configData.weatherData.reduce((sum, data) => sum + (data.temperature || 0) + (data.humidity || 0), 0) : 0;

    // Generation forecast is an array of forecasts
    const generationImpact = Array.isArray(configData.generationForecast) ?
      configData.generationForecast.reduce((sum, forecast) => sum + (forecast.forecastMWh || 0), 0) : 0;

    return {
      yieldImpact: yieldImpact * 0.01, // Scale down for demo
      priceImpact: priceImpact * 0.005,
      weatherImpact: weatherImpact * 0.1,
      generationImpact: generationImpact * 0.02
    };
  };

  const getConfigSummary = () => {
    // Handle both raw API data (array) and grouped data (object)
    let yieldCount = 0;
    let priceCount = 0;

    if (Array.isArray(configData.yieldCurves)) {
      // Raw API data - count unique curve names
      const uniqueCurves = new Set(configData.yieldCurves.map(item => item.curveName));
      yieldCount = uniqueCurves.size;
    } else if (typeof configData.yieldCurves === 'object') {
      // Grouped data - count keys
      yieldCount = Object.keys(configData.yieldCurves).length;
    }

    if (Array.isArray(configData.priceCurves)) {
      // Raw API data - count unique curve names
      const uniqueCurves = new Set(configData.priceCurves.map(item => item.curveName));
      priceCount = uniqueCurves.size;
    } else if (typeof configData.priceCurves === 'object') {
      // Grouped data - count keys
      priceCount = Object.keys(configData.priceCurves).length;
    }

    return [
      { name: "Yield Curves", count: yieldCount, impact: calculateConfigImpact()?.yieldImpact || 0 },
      { name: "Price Curves", count: priceCount, impact: calculateConfigImpact()?.priceImpact || 0 },
      { name: "Weather Data", count: Array.isArray(configData.weatherData) ? configData.weatherData.length : 0, impact: calculateConfigImpact()?.weatherImpact || 0 },
      { name: "Generation Forecast", count: Array.isArray(configData.generationForecast) ? configData.generationForecast.length : 0, impact: calculateConfigImpact()?.generationImpact || 0 }
    ];
  };

  const fetchPnL = async () => {
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/pnl/${date}`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPnlData(data);
      } else {
        setPnlData(null);
      }
    } catch (err) {
      console.error("Error fetching P&L:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/pnl/${date}/top-performers`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTopPerformers(data || []);
      } else {
        setTopPerformers([]);
      }
    } catch (err) {
      console.error("Error fetching top performers:", err);
      setTopPerformers([]);
    }
  };

  const handleCalculatePnL = async () => {
    setCalculating(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/pnl/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ pnlDate: date })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: "P&L calculation complete",
          severity: "success"
        });
        fetchPnL();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "P&L calculation failed",
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
      setCalculating(false);
    }
  };

  const columns = [
    {
      field: "portfolio",
      label: "Portfolio",
      sortable: true,
      render: (val) => <Typography fontWeight="bold">{val}</Typography>
    },
    {
      field: "commodity",
      label: "Commodity",
      sortable: true
    },
    {
      field: "totalPnl",
      label: "Total P&L",
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
      field: "realizedPnl",
      label: "Realized",
      sortable: true,
      render: (val) => (
        <Typography
          variant="body2"
          color={val >= 0 ? "success.main" : "error.main"}
        >
          {val?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
          })}
        </Typography>
      )
    },
    {
      field: "unrealizedPnl",
      label: "Unrealized",
      sortable: true,
      render: (val) => (
        <Typography
          variant="body2"
          color={val >= 0 ? "success.main" : "error.main"}
        >
          {val?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
          })}
        </Typography>
      )
    },
    {
      field: "tradeCount",
      label: "# Trades",
      sortable: true,
      render: (val) => <Chip label={val} size="small" />
    }
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>
          💰 P&L Dashboard
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: isMobile ? 1 : 0 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPnL}
            disabled={loading}
            size="small"
          >
            {isMobile ? "" : "Refresh"}
          </Button>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleCalculatePnL}
            disabled={calculating}
            size="small"
          >
            {calculating ? "Calculating..." : isMobile ? "Calculate" : "Calculate P&L"}
          </Button>
        </Stack>
      </Stack>

      {/* Date Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="P&L Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={e => setDate(e.target.value)}
          sx={{ width: isMobile ? '100%' : 200 }}
        />
      </Paper>

      {/* Configuration Impact Summary */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">📊 Configuration Impact Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {getConfigSummary().map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      {item.name}
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {item.count}
                    </Typography>
                    <Typography variant="body2" color={item.impact >= 0 ? "success.main" : "error.main"}>
                      Impact: {item.impact?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {loading ? (
        <LoadingSpinner message="Loading P&L..." />
      ) : pnlData ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total P&L
                  </Typography>
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    color={pnlData.totalPnl >= 0 ? "success.main" : "error.main"}
                  >
                    {pnlData.totalPnl?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                  {calculateConfigImpact() && (
                    <Typography variant="caption" color="text.secondary">
                      Config Impact: {calculateConfigImpact().yieldImpact?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD"
                      })}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Realized P&L
                  </Typography>
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    color={pnlData.realizedPnl >= 0 ? "success.main" : "error.main"}
                  >
                    {pnlData.realizedPnl?.toLocaleString("en-US", {
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
                    Unrealized P&L
                  </Typography>
                  <Typography
                    variant={isMobile ? "h4" : "h3"}
                    color={pnlData.unrealizedPnl >= 0 ? "success.main" : "error.main"}
                  >
                    {pnlData.unrealizedPnl?.toLocaleString("en-US", {
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
                    Top Winner
                  </Typography>
                  <Typography variant={isMobile ? "h5" : "h5"} color="success.main">
                    {pnlData.topWinner?.portfolio || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pnlData.topWinner?.pnl?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD"
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* P&L Breakdown Table */}
          {pnlData.breakdown && pnlData.breakdown.length > 0 && (
            <Paper sx={{ overflowX: 'auto' }}>
              <DataTable
                columns={columns}
                rows={pnlData.breakdown}
                defaultSortBy="totalPnl"
                defaultSortDirection="desc"
                pageSize={isMobile ? 10 : 25}
              />
            </Paper>
          )}

          {/* Top Performers Section */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>🏆 Top Performers</Typography>
            {topPerformers.length > 0 ? (
              <Grid container spacing={2}>
                {topPerformers.map((performer, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" color="primary.main">
                          #{index + 1} {performer.portfolio || performer.name}
                        </Typography>
                        <Typography variant="h4" color={performer.pnl >= 0 ? "success.main" : "error.main"}>
                          {performer.pnl?.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {performer.commodity || 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No top performers data available
              </Typography>
            )}
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No P&L data available for {date}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleCalculatePnL}
          >
            Calculate P&L for {date}
          </Button>
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

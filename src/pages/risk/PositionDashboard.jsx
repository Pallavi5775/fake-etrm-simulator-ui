import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  TextField, MenuItem, Chip, IconButton, Tooltip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalculateIcon from "@mui/icons-material/Calculate";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";

const BASE_URL = "http://localhost:8080/api";

/**
 * Portfolio Position Dashboard - Real-time position aggregates with drill-down
 */
export default function PositionDashboard() {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [positions, setPositions] = useState([]);
  const [summary, setSummary] = useState({
    totalLong: 0,
    totalShort: 0,
    netPosition: 0,
    portfolioCount: 0
  });
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    portfolio: "",
    commodity: ""
  });

  useEffect(() => {
    if (filters.date) {
      fetchPositions();
    }
  }, [filters.date]);

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      if (filters.portfolio) params.append("portfolio", filters.portfolio);
      if (filters.commodity) params.append("commodity", filters.commodity);

      const url = filters.portfolio
        ? `${BASE_URL}/risk/positions/${filters.date}/portfolio/${filters.portfolio}`
        : `${BASE_URL}/risk/positions/${filters.date}?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Handle both array response and object with positions array
        const positionsArray = Array.isArray(data) ? data : (data.positions || []);
        setPositions(positionsArray);
        calculateSummary(positionsArray);
        
        if (positionsArray.length === 0) {
          setToast({
            open: true,
            message: "No positions found for selected date. Try 'Calculate Positions' first.",
            severity: "info"
          });
        }
      } else {
        const errorMsg = `Failed to load positions (HTTP ${res.status})`;
        setError(errorMsg);
        setToast({
          open: true,
          message: errorMsg + ". Backend may not be running.",
          severity: "error"
        });
      }
    } catch (err) {
      console.error("Error fetching positions:", err);
      const errorMsg = err.message === "Failed to fetch" 
        ? "Cannot connect to backend at http://localhost:8080"
        : "Network error: " + err.message;
      setError(errorMsg);
      setToast({
        open: true,
        message: errorMsg,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const totalLong = data
      .filter(p => p.netPosition > 0)
      .reduce((sum, p) => sum + p.netPosition, 0);
    
    const totalShort = data
      .filter(p => p.netPosition < 0)
      .reduce((sum, p) => sum + Math.abs(p.netPosition), 0);
    
    const netPosition = data.reduce((sum, p) => sum + p.netPosition, 0);
    
    const portfolioCount = new Set(data?.map(p => p.portfolio)).size;

    setSummary({ totalLong, totalShort, netPosition, portfolioCount });
  };

  const handleCalculatePositions = async () => {
    setCalculating(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/positions/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          positionDate: filters.date,
          portfolioFilter: filters.portfolio || null
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: "Position calculation complete",
          severity: "success"
        });
        fetchPositions(); // Refresh
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Calculation failed",
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
      field: "deliveryPeriod",
      label: "Delivery Period",
      sortable: true
    },
    {
      field: "longPosition",
      label: "Long Position",
      sortable: true,
      render: (val) => (
        <Typography color="success.main" fontWeight="bold">
          {val != null ? val.toLocaleString() : "0"}
        </Typography>
      )
    },
    {
      field: "shortPosition",
      label: "Short Position",
      sortable: true,
      render: (val) => (
        <Typography color="error.main" fontWeight="bold">
          {val != null ? val.toLocaleString() : "0"}
        </Typography>
      )
    },
    {
      field: "netPosition",
      label: "Net Position",
      sortable: true,
      render: (val) => {
        const position = val != null ? val : 0;
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {position > 0 ? (
              <TrendingUpIcon color="success" fontSize="small" />
            ) : position < 0 ? (
              <TrendingDownIcon color="error" fontSize="small" />
            ) : null}
            <Typography
              color={position > 0 ? "success.main" : position < 0 ? "error.main" : "text.primary"}
              fontWeight="bold"
            >
              {position.toLocaleString()}
            </Typography>
          </Stack>
        );
      }
    },
    {
      field: "unit",
      label: "Unit",
      sortable: true
    },
    {
      field: "tradeCount",
      label: "# Trades",
      sortable: true,
      render: (val) => <Chip label={val} size="small" />
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          📊 Position Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPositions}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleCalculatePositions}
            disabled={calculating}
          >
            {calculating ? "Calculating..." : "Calculate Positions"}
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Long
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary.totalLong.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Short
              </Typography>
              <Typography variant="h4" color="error.main">
                {summary.totalShort.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Net Position
              </Typography>
              <Typography
                variant="h4"
                color={summary.netPosition >= 0 ? "success.main" : "error.main"}
              >
                {summary.netPosition.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Portfolios
              </Typography>
              <Typography variant="h4">
                {summary.portfolioCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Position Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.date}
              onChange={e => setFilters({ ...filters, date: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Portfolio"
              fullWidth
              value={filters.portfolio}
              onChange={e => setFilters({ ...filters, portfolio: e.target.value })}
              placeholder="e.g., CRUDE_FO"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Commodity"
              fullWidth
              value={filters.commodity}
              onChange={e => setFilters({ ...filters, commodity: e.target.value })}
              placeholder="e.g., CRUDE_OIL"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Positions Table */}
      {loading ? (
        <LoadingSpinner message="Loading positions..." />
      ) : positions.length > 0 ? (
        <DataTable
          columns={columns}
          rows={positions}
          defaultSortBy="portfolio"
          defaultSortDirection="asc"
          pageSize={25}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No positions found for the selected date.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleCalculatePositions}
            sx={{ mt: 2 }}
          >
            Calculate Positions for {filters.date}
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

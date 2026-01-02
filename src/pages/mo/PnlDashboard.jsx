import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Grid, Card, CardContent,
  TextField, Chip, IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalculateIcon from "@mui/icons-material/Calculate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import DataTable from "../../components/shared/DataTable";

const BASE_URL = "http://localhost:8080/api";

/**
 * Daily P&L Dashboard with breakdown by portfolio and commodity
 */
export default function PnlDashboard() {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [pnlData, setPnlData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (date) {
      fetchPnL();
    }
  }, [date]);

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
        body: JSON.stringify({ date })
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
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          💰 P&L Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPnL}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleCalculatePnL}
            disabled={calculating}
          >
            {calculating ? "Calculating..." : "Calculate P&L"}
          </Button>
        </Stack>
      </Stack>

      {/* Date Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="P&L Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={e => setDate(e.target.value)}
          sx={{ width: 200 }}
        />
      </Paper>

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
                    variant="h3"
                    color={pnlData.totalPnl >= 0 ? "success.main" : "error.main"}
                  >
                    {pnlData.totalPnl?.toLocaleString("en-US", {
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
                    Realized P&L
                  </Typography>
                  <Typography
                    variant="h3"
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
                    variant="h3"
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
                  <Typography variant="h5" color="success.main">
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
            <DataTable
              columns={columns}
              rows={pnlData.breakdown}
              defaultSortBy="totalPnl"
              defaultSortDirection="desc"
              pageSize={25}
            />
          )}
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

import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Grid, Card, CardContent,
  TextField, Divider
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";

const BASE_URL = "http://localhost:8080/api";

/**
 * P&L Attribution - Waterfall chart showing P&L breakdown by source
 */
export default function PnlAttribution() {
  const [loading, setLoading] = useState(false);
  const [attributionData, setAttributionData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (date) {
      fetchAttribution();
    }
  }, [date]);

  const fetchAttribution = async () => {
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/valuation/pnl/${date}/attribution`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAttributionData(data);
      } else {
        setAttributionData(null);
      }
    } catch (err) {
      console.error("Error fetching attribution:", err);
      setToast({
        open: true,
        message: "Failed to load P&L attribution",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!attributionData) return [];

    return [
      { name: "Spot Movement", value: attributionData.spotMovement || 0 },
      { name: "Curve Movement", value: attributionData.curveMovement || 0 },
      { name: "Vol Movement", value: attributionData.volMovement || 0 },
      { name: "Time Decay", value: attributionData.timeDecay || 0 },
      { name: "Carry", value: attributionData.carry || 0 },
      { name: "FX Impact", value: attributionData.fxImpact || 0 },
      { name: "Unexplained", value: attributionData.unexplained || 0 }
    ];
  };

  const getBarColor = (value) => {
    return value >= 0 ? "#4caf50" : "#f44336";
  };

  if (loading) {
    return <LoadingSpinner message="Loading P&L attribution..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📊 P&L Attribution
      </Typography>

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

      {attributionData ? (
        <>
          {/* Summary Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="text.secondary">
                  Total P&L
                </Typography>
                <Typography
                  variant="h2"
                  color={attributionData.totalPnl >= 0 ? "success.main" : "error.main"}
                >
                  {attributionData.totalPnl?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="text.secondary">
                  Unexplained P&L
                </Typography>
                <Typography
                  variant="h2"
                  color={Math.abs(attributionData.unexplained || 0) > 10000 ? "warning.main" : "text.primary"}
                >
                  {attributionData.unexplained?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0
                  })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((Math.abs(attributionData.unexplained || 0) / Math.abs(attributionData.totalPnl || 1)) * 100).toFixed(2)}% of total
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Attribution Breakdown */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Spot Movement
                  </Typography>
                  <Typography
                    variant="h4"
                    color={attributionData.spotMovement >= 0 ? "success.main" : "error.main"}
                  >
                    {attributionData.spotMovement?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Curve Movement
                  </Typography>
                  <Typography
                    variant="h4"
                    color={attributionData.curveMovement >= 0 ? "success.main" : "error.main"}
                  >
                    {attributionData.curveMovement?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Vol Movement
                  </Typography>
                  <Typography
                    variant="h4"
                    color={attributionData.volMovement >= 0 ? "success.main" : "error.main"}
                  >
                    {attributionData.volMovement?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Time Decay (Theta)
                  </Typography>
                  <Typography
                    variant="h4"
                    color={attributionData.timeDecay >= 0 ? "success.main" : "error.main"}
                  >
                    {attributionData.timeDecay?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Carry
                  </Typography>
                  <Typography
                    variant="h4"
                    color={attributionData.carry >= 0 ? "success.main" : "error.main"}
                  >
                    {attributionData.carry?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    FX Impact
                  </Typography>
                  <Typography
                    variant="h4"
                    color={attributionData.fxImpact >= 0 ? "success.main" : "error.main"}
                  >
                    {attributionData.fxImpact?.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Waterfall Chart */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              P&L Waterfall
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    value.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD"
                    })
                  }
                />
                <Bar dataKey="value">
                  {getChartData()?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No P&L attribution data available for {date}
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

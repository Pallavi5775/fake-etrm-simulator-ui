import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Stack, Button, Chip, Grid, Divider, Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import TradeLifecycleActions from "../components/TradeLifecycleActions";
import ValuationChart from "../components/ValuationChart";

const BASE_URL = "http://localhost:8080/api";

/**
 * Trade Detail Page - Full trade information with lifecycle actions
 */
export default function TradeDetail() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrade();
  }, [tradeId]);

  const fetchTrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/trades/${tradeId}`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setTrade(data);
      } else {
        setError("Failed to load trade");
      }
    } catch (err) {
      console.error("Error fetching trade:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading trade details..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!trade) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Trade not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4">
            Trade Details - {trade.tradeId}
          </Typography>
        </Stack>
        <TradeLifecycleActions trade={trade} onActionComplete={fetchTrade} />
      </Stack>

      {/* Trade Information Grid */}
      <Grid container spacing={3}>
        {/* Status & Identifiers */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Status & Identifiers</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Trade ID</Typography>
                <Typography variant="body1" fontFamily="monospace">{trade.tradeId}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={trade.status || "PENDING"}
                    color={
                      trade.status === "APPROVED" || trade.status === "SETTLED" ? "success" :
                      trade.status === "REJECTED" || trade.status === "CANCELLED" ? "error" :
                      "warning"
                    }
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Pending Approval Role</Typography>
                <Typography variant="body1">{trade.pendingApprovalRole || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Approval Level</Typography>
                <Typography variant="body1">{trade.currentApprovalLevel || trade.approvalLevel || "-"}</Typography>
              </Box>
              {trade.matchedRuleName && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Matched Rule</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={trade.matchedRuleName} color="secondary" size="small" />
                  </Box>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Instrument & Trade Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Instrument Details</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Instrument</Typography>
                <Typography variant="body1" fontFamily="monospace">
                  {trade.instrumentCode || trade.instrumentSymbol}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Commodity</Typography>
                <Typography variant="body1">{trade.commodity || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Type</Typography>
                <Typography variant="body1">{trade.instrumentType || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Buy/Sell</Typography>
                <Chip
                  label={trade.buySell}
                  size="small"
                  color={trade.buySell === "BUY" ? "primary" : "secondary"}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Trade Economics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Trade Economics</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Quantity</Typography>
                <Typography variant="body1">{trade.quantity?.toLocaleString()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Trade Price</Typography>
                <Typography variant="body1">
                  ${(trade.tradePrice || trade.price)?.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Trade Date</Typography>
                <Typography variant="body1">{trade.tradeDate || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">MTM</Typography>
                <Typography
                  variant="h6"
                  color={trade.mtm >= 0 ? "success.main" : "error.main"}
                >
                  {trade.mtm?.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                  })}
                </Typography>
              </Box>
              {trade.pnlDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">PnL Date</Typography>
                  <Typography variant="body1">
                    {new Date(trade.pnlDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Greeks */}
        {(trade.delta != null || trade.gamma != null || trade.vega != null) && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Greeks</Typography>
              <Stack spacing={1.5}>
                {trade.delta != null && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Delta</Typography>
                    <Typography variant="body1">{trade.delta.toFixed(2)}</Typography>
                  </Box>
                )}
                {trade.gamma != null && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Gamma</Typography>
                    <Typography variant="body1">{trade.gamma.toFixed(4)}</Typography>
                  </Box>
                )}
                {trade.vega != null && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Vega</Typography>
                    <Typography variant="body1">{trade.vega.toFixed(2)}</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* Parties */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Parties & Portfolio</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Portfolio</Typography>
                <Typography variant="body1">{trade.portfolio}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Counterparty</Typography>
                <Typography variant="body1">{trade.counterparty}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Created By</Typography>
                <Typography variant="body1">{trade.createdBy || "-"}</Typography>
              </Box>
              {trade.createdAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Created At</Typography>
                  <Typography variant="body1">
                    {new Date(trade.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Valuation History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Valuation History (MTM)</Typography>
            <Box sx={{ height: 300 }}>
              <ValuationChart tradeId={trade.tradeId} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

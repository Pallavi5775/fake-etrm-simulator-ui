import { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem,
  Grid, Chip, IconButton, Card, CardContent, Divider, Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./shared/LoadingSpinner";
import Toast from "./shared/Toast";

const BASE_URL = "http://localhost:8080/api/trades";

const STATUS_OPTIONS = ["PENDING_APPROVAL", "APPROVED", "REJECTED", "CANCELLED", "SETTLED"];
const BUY_SELL_OPTIONS = ["BUY", "SELL"];

/**
 * Advanced Trade Search with multiple filters
 */
export default function TradeSearch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [allTrades, setAllTrades] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const [filters, setFilters] = useState({
    tradeId: "",
    portfolio: "",
    counterparty: "",
    commodity: "",
    buySell: "",
    status: "",
    tradeDateFrom: "",
    tradeDateTo: "",
    minMtm: "",
    maxMtm: "",
    createdBy: "",
    instrumentSymbol: "",
    instrumentType: "",
    minPrice: "",
    maxPrice: "",
    minQuantity: "",
    maxQuantity: ""
  });

  // Fetch all trades on component mount
  useEffect(() => {
    fetchAllTrades();
  }, []);

  const fetchAllTrades = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAllTrades(Array.isArray(data) ? data : []);
      } else {
        const errorMsg = `Failed to fetch trades (HTTP ${res.status})`;
        setError(errorMsg);
        setToast({
          open: true,
          message: errorMsg + ". Please check if the backend is running.",
          severity: "error"
        });
      }
    } catch (err) {
      console.error("Error fetching trades:", err);
      const errorMsg = err.message === "Failed to fetch" 
        ? "Cannot connect to backend. Please ensure the server is running at http://localhost:8080"
        : `Network error: ${err.message}`;
      setError(errorMsg);
      setToast({
        open: true,
        message: errorMsg,
        severity: "error"
      });
      setAllTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  // Client-side filtering using useMemo
  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      // Trade ID filter
      if (filters.tradeId && !String(trade.tradeId).includes(filters.tradeId)) {
        return false;
      }

      // Portfolio filter
      if (filters.portfolio && !trade.portfolio?.toLowerCase().includes(filters.portfolio.toLowerCase())) {
        return false;
      }

      // Counterparty filter
      if (filters.counterparty && !trade.counterparty?.toLowerCase().includes(filters.counterparty.toLowerCase())) {
        return false;
      }

      // Commodity filter
      if (filters.commodity && !trade.commodity?.toLowerCase().includes(filters.commodity.toLowerCase())) {
        return false;
      }

      // Buy/Sell filter
      if (filters.buySell && trade.buySell !== filters.buySell) {
        return false;
      }

      // Status filter
      if (filters.status && trade.status !== filters.status) {
        return false;
      }

      // Trade Date From filter
      if (filters.tradeDateFrom && trade.tradeDate < filters.tradeDateFrom) {
        return false;
      }

      // Trade Date To filter
      if (filters.tradeDateTo && trade.tradeDate > filters.tradeDateTo) {
        return false;
      }

      // Min MTM filter
      if (filters.minMtm && trade.mtm < parseFloat(filters.minMtm)) {
        return false;
      }

      // Max MTM filter
      if (filters.maxMtm && trade.mtm > parseFloat(filters.maxMtm)) {
        return false;
      }

      // Created By filter
      if (filters.createdBy && !trade.createdBy?.toLowerCase().includes(filters.createdBy.toLowerCase())) {
        return false;
      }

      // Instrument Symbol filter
      if (filters.instrumentSymbol && !trade.instrumentSymbol?.toLowerCase().includes(filters.instrumentSymbol.toLowerCase())) {
        return false;
      }

      // Instrument Type filter
      if (filters.instrumentType && !trade.instrumentType?.toLowerCase().includes(filters.instrumentType.toLowerCase())) {
        return false;
      }

      // Min Price filter
      if (filters.minPrice && trade.price < parseFloat(filters.minPrice)) {
        return false;
      }

      // Max Price filter
      if (filters.maxPrice && trade.price > parseFloat(filters.maxPrice)) {
        return false;
      }

      // Min Quantity filter
      if (filters.minQuantity && trade.quantity < parseFloat(filters.minQuantity)) {
        return false;
      }

      // Max Quantity filter
      if (filters.maxQuantity && trade.quantity > parseFloat(filters.maxQuantity)) {
        return false;
      }

      return true;
    });
  }, [allTrades, filters]);

  const handleSearch = () => {
    setToast({
      open: true,
      message: `Found ${filteredTrades.length} trade(s)`,
      severity: "success"
    });
  };

  const handleClearFilters = () => {
    setFilters({
      tradeId: "",
      portfolio: "",
      counterparty: "",
      commodity: "",
      buySell: "",
      status: "",
      tradeDateFrom: "",
      tradeDateTo: "",
      minMtm: "",
      maxMtm: "",
      createdBy: "",
      instrumentSymbol: "",
      instrumentType: "",
      minPrice: "",
      maxPrice: "",
      minQuantity: "",
      maxQuantity: ""
    });
  };

  const handleViewTrade = (trade) => {
    navigate(`/trade/${trade.tradeId}`);
  };

  const handleAmendTrade = (trade) => {
    navigate(`/fo/trade-booking/amend/${trade.tradeId}`, { state: { trade } });
  };

  const handleViewHistory = (trade) => {
    navigate(`/trade/${trade.tradeId}/history`);
  };

  const formatCurrency = (val) => {
    if (val == null || val === undefined) return "N/A";
    return val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    });
  };

  const formatDate = (val) => {
    if (!val) return "N/A";
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val;
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🔍 Trade Search
      </Typography>

      {/* Search Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Search Criteria
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Trade ID"
              fullWidth
              size="small"
              value={filters.tradeId}
              onChange={e => handleFilterChange("tradeId", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Portfolio"
              fullWidth
              size="small"
              value={filters.portfolio}
              onChange={e => handleFilterChange("portfolio", e.target.value)}
              placeholder="e.g., CRUDE_FO"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Counterparty"
              fullWidth
              size="small"
              value={filters.counterparty}
              onChange={e => handleFilterChange("counterparty", e.target.value)}
              placeholder="e.g., BP"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Commodity"
              fullWidth
              size="small"
              value={filters.commodity}
              onChange={e => handleFilterChange("commodity", e.target.value)}
              placeholder="e.g., CRUDE_OIL"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Buy/Sell"
              fullWidth
              size="small"
              value={filters.buySell}
              onChange={e => handleFilterChange("buySell", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {BUY_SELL_OPTIONS?.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Status"
              fullWidth
              size="small"
              value={filters.status}
              onChange={e => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {STATUS_OPTIONS?.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Trade Date From"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.tradeDateFrom}
              onChange={e => handleFilterChange("tradeDateFrom", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Trade Date To"
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.tradeDateTo}
              onChange={e => handleFilterChange("tradeDateTo", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Min MTM"
              type="number"
              fullWidth
              size="small"
              value={filters.minMtm}
              onChange={e => handleFilterChange("minMtm", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Max MTM"
              type="number"
              fullWidth
              size="small"
              value={filters.maxMtm}
              onChange={e => handleFilterChange("maxMtm", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Created By"
              fullWidth
              size="small"
              value={filters.createdBy}
              onChange={e => handleFilterChange("createdBy", e.target.value)}
              placeholder="Username"
            />
          </Grid>

          {/* New filter fields */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Instrument Symbol"
              fullWidth
              size="small"
              value={filters.instrumentSymbol}
              onChange={e => handleFilterChange("instrumentSymbol", e.target.value)}
              placeholder="e.g., PWR-JAN25"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Instrument Type"
              fullWidth
              size="small"
              value={filters.instrumentType}
              onChange={e => handleFilterChange("instrumentType", e.target.value)}
              placeholder="e.g., FORWARD"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Min Price"
              type="number"
              fullWidth
              size="small"
              value={filters.minPrice}
              onChange={e => handleFilterChange("minPrice", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Max Price"
              type="number"
              fullWidth
              size="small"
              value={filters.maxPrice}
              onChange={e => handleFilterChange("maxPrice", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Min Quantity"
              type="number"
              fullWidth
              size="small"
              value={filters.minQuantity}
              onChange={e => handleFilterChange("minQuantity", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Max Quantity"
              type="number"
              fullWidth
              size="small"
              value={filters.maxQuantity}
              onChange={e => handleFilterChange("maxQuantity", e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
        </Stack>
      </Paper>

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Loading trades..." />
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      ) : filteredTrades.length > 0 ? (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Results ({filteredTrades.length} of {allTrades.length} trades)
          </Typography>
          
          {/* Card-based layout without horizontal scroll */}
          <Box sx={{ width: '100%' }}>
            {filteredTrades?.map((trade) => (
              <Card 
                key={trade.tradeId}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { boxShadow: 3, cursor: 'pointer' },
                  mb: 2,
                  width: '100%'
                }}
              >
                <CardContent sx={{ width: '100%' }}>
                  <Grid container spacing={3}>
                    {/* Header Row */}
                    <Grid item xs={12}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                          <Tooltip title={`Trade ID: ${trade.tradeId}`}>
                            <Typography variant="h6" fontFamily="monospace">
                              {trade.tradeId?.substring(0, 8)}...
                            </Typography>
                          </Tooltip>
                            <Chip
                              label={trade.status}
                              size="small"
                              color={
                                trade.status === "APPROVED" ? "success" :
                                trade.status === "PENDING_APPROVAL" ? "warning" :
                                trade.status === "REJECTED" ? "error" :
                                "default"
                              }
                            />
                            <Chip
                              label={trade.buySell}
                              size="small"
                              color={trade.buySell === "BUY" ? "primary" : "secondary"}
                            />
                            {trade.amendCount > 0 && (
                              <Chip label={`${trade.amendCount} Amends`} size="small" color="warning" />
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewTrade(trade)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {trade.status === "APPROVED" && (
                              <Tooltip title="Amend Trade">
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleAmendTrade(trade)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="View History">
                              <IconButton
                                size="small"
                                onClick={() => handleViewHistory(trade)}
                              >
                                <HistoryIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider />
                      </Grid>

                      {/* Trade Details - 3 columns */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">PORTFOLIO & PARTIES</Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="body2"><strong>Portfolio:</strong> {trade.portfolio}</Typography>
                          <Typography variant="body2"><strong>Counterparty:</strong> {trade.counterparty}</Typography>
                          <Typography variant="body2"><strong>Created By:</strong> {trade.createdBy}</Typography>
                          <Typography variant="body2"><strong>Created At:</strong> {formatDate(trade.createdAt)}</Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">INSTRUMENT & PRICING</Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="body2"><strong>Commodity:</strong> {trade.commodity}</Typography>
                          <Typography variant="body2">
                            <strong>Instrument:</strong> <Typography component="span" fontFamily="monospace">{trade.instrumentSymbol}</Typography>
                          </Typography>
                          <Typography variant="body2"><strong>Type:</strong> {trade.instrumentType}</Typography>
                          <Typography variant="body2"><strong>Trade Date:</strong> {trade.tradeDate}</Typography>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">QUANTITY & VALUATION</Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="body2">
                            <strong>Quantity:</strong> {trade.quantity?.toLocaleString() || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Price:</strong> {trade.price != null ? `$${trade.price.toLocaleString()}` : "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>MTM:</strong> 
                            <Typography 
                              component="span" 
                              color={trade.mtm >= 0 ? "success.main" : "error.main"}
                              fontWeight="bold"
                              sx={{ ml: 1 }}
                            >
                              {formatCurrency(trade.mtm)}
                            </Typography>
                          </Typography>
                          <Typography variant="body2">
                            <strong>Notional:</strong> {formatCurrency(trade.quantity * trade.price)}
                          </Typography>
                        </Stack>
                      </Grid>

                      {/* Greeks Section (if available) */}
                      {(trade.delta != null || trade.gamma != null || trade.vega != null) && (
                        <>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">RISK GREEKS</Typography>
                            <Stack direction="row" spacing={3} sx={{ mt: 0.5 }}>
                              <Typography variant="body2">
                                <strong>Delta:</strong> {trade.delta != null ? trade.delta.toFixed(2) : "-"}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Gamma:</strong> {trade.gamma != null ? trade.gamma.toFixed(4) : "-"}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Vega:</strong> {trade.vega != null ? trade.vega.toFixed(2) : "-"}
                              </Typography>
                            </Stack>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </>
      ) : allTrades.length > 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No trades match your filters. Total trades: {allTrades.length}
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No trades found in the system.
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

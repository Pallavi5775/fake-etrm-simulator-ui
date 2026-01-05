import { useState, useEffect } from "react";
import apiConfig from '../config/apiConfig';
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Stack, Button, Chip, Grid, Divider, Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import TradeLifecycleActions from "../components/TradeLifecycleActions";
import ValuationChart from "../components/ValuationChart";

const BASE_URL = apiConfig.baseURL;

/**
 * Trade Detail Page - Full trade information with lifecycle actions
 */
export default function TradeDetail() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [legs, setLegs] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch trade and legs in parallel
        await Promise.all([
          fetchTrade(isMounted),
          fetchLegs(isMounted)
        ]);
        
        // Then fetch valuation after legs are loaded
        await fetchValuation(isMounted);
      } catch (err) {
        console.error("Error loading trade data:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [tradeId]);

  const fetchTrade = async (isMounted = true) => {
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
        if (isMounted) {
          setTrade(data);
        }
      } else if (isMounted) {
        setError("Failed to load trade");
      }
    } catch (err) {
      console.error("Error fetching trade:", err);
      if (isMounted) {
        setError("Network error: " + err.message);
      }
    }
  };

  const fetchLegs = async (isMounted = true) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/trades/${tradeId}/legs`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (isMounted) {
          setLegs(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error("Error fetching legs:", err);
      // Not critical if legs fail to load
    }
  };

  const fetchValuation = async (isMounted = true) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      // Only use /trades/{tradeId}/valuations endpoint
      const res = await fetch(`${BASE_URL}/trades/${tradeId}/valuations`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!isMounted) return;

      if (res.ok) {
        const data = await res.json();
        // If it's an array, take the most recent
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          setValuation(latest);
          // If it's a multi-leg trade and we have leg valuations, merge them
          if (latest.isMultiLeg && latest.legValuations && latest.legValuations.length > 0) {
            setLegs(prevLegs => {
              // If we already have legs from API, merge valuation data
              if (prevLegs.length > 0) {
                return prevLegs.map(leg => {
                  const legVal = latest.legValuations.find(lv => lv.legNumber === leg.legNumber);
                  if (legVal) {
                    return {
                      ...leg,
                      mtm: legVal.mtm,
                      pnl: legVal.pnl,
                      marketPrice: legVal.marketPrice
                    };
                  }
                  return leg;
                });
              } else {
                // No legs yet, create them from valuation data
                return latest.legValuations.map(legVal => ({
                  legNumber: legVal.legNumber,
                  instrumentCode: legVal.instrumentCode,
                  buySell: legVal.buySell,
                  quantity: legVal.quantity,
                  price: legVal.tradePrice,
                  ratio: legVal.ratio || 1.0,
                  deliveryDate: legVal.deliveryDate,
                  mtm: legVal.mtm,
                  pnl: legVal.pnl,
                  marketPrice: legVal.marketPrice
                }));
              }
            });
          }
        }
      } else {
        console.log("Valuation not found - trade may not be valued yet");
      }
    } catch (err) {
      console.error("Error fetching valuation:", err);
      // Not critical if valuation fails to load
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
          <Box>
            <Typography variant="h4">
              Trade Details - {trade.tradeId}
            </Typography>
            {trade.strategyType && (
              <Chip
                label={trade.strategyType}
                color="secondary"
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
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
            <Typography variant="h6" sx={{ mb: 2 }}>
              {valuation?.isMultiLeg || legs.length > 0 ? "Strategy Details" : "Instrument Details"}
            </Typography>
            <Stack spacing={1.5}>
              {valuation?.isMultiLeg || legs.length > 0 ? (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Strategy Type</Typography>
                    <Typography variant="body1">
                      {valuation?.strategyType || trade.strategyType || "Multi-Leg"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Number of Legs</Typography>
                    <Typography variant="body1">{legs.length} legs</Typography>
                  </Box>
                  {valuation?.pricingModel && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pricing Model</Typography>
                      <Typography variant="body1">{valuation.pricingModel}</Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Trade Economics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Trade Economics
              {valuation?.isMultiLeg && (
                <Chip label="Multi-Leg" size="small" color="secondary" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Stack spacing={1.5}>
              {!valuation?.isMultiLeg && (
                <>
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
                </>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">Trade Date</Typography>
                <Typography variant="body1">{trade.tradeDate || "-"}</Typography>
              </Box>
              {valuation && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Valuation Date</Typography>
                    <Typography variant="body1">{valuation.valuationDate || "-"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {valuation.isMultiLeg ? "Total Strategy MTM" : "MTM"}
                    </Typography>
                    <Typography
                      variant="h6"
                      color={(valuation.totalMtm || trade.mtm || 0) >= 0 ? "success.main" : "error.main"}
                    >
                      {(valuation.totalMtm || trade.mtm || 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD"
                      })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {valuation.isMultiLeg ? "Total Strategy PnL" : "PnL"}
                    </Typography>
                    <Typography
                      variant="h6"
                      color={(valuation.totalPnl || 0) >= 0 ? "success.main" : "error.main"}
                    >
                      {(valuation.totalPnl || 0).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD"
                      })}
                    </Typography>
                  </Box>
                  {valuation.pricingModel && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Pricing Model</Typography>
                      <Chip label={valuation.pricingModel} size="small" />
                    </Box>
                  )}
                </>
              )}
              {!valuation && trade.mtm != null && (
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
              )}
              {trade.tradeDate && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Trade Date</Typography>
                  <Typography variant="body1">
                    {(() => {
                      try {
                        const date = new Date(trade.tradeDate);
                        // Check if date is valid
                        if (isNaN(date.getTime())) {
                          return trade.tradeDate; // Return original string if invalid
                        }
                        return date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                      } catch (error) {
                        return trade.tradeDate; // Fallback to original string
                      }
                    })()}
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
                    {(() => {
                      try {
                        const date = new Date(trade.createdAt);
                        // Check if date is valid
                        if (isNaN(date.getTime())) {
                          return trade.createdAt; // Return original string if invalid
                        }
                        return date.toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch (error) {
                        return trade.createdAt; // Fallback to original string
                      }
                    })()}
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

        {/* Multi-Leg Details */}
        {legs.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Multi-Leg Strategy ({legs.length} legs)
                {valuation?.strategyType && (
                  <Chip label={valuation.strategyType} color="primary" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>
              <Stack spacing={2}>
                {legs.map((leg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider"
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={1}>
                        <Chip label={`Leg ${leg.legNumber}`} color="primary" size="small" />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography variant="caption" color="text.secondary">Instrument</Typography>
                        <Typography variant="body2" fontFamily="monospace">
                          {leg.instrumentCode}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <Typography variant="caption" color="text.secondary">Side</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={leg.buySell}
                            size="small"
                            color={leg.buySell === "BUY" ? "success" : "error"}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={1.25}>
                        <Typography variant="caption" color="text.secondary">Quantity</Typography>
                        <Typography variant="body2">{leg.quantity?.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <Typography variant="caption" color="text.secondary">Price</Typography>
                        <Typography variant="body2">${leg.price?.toFixed(2)}</Typography>
                      </Grid>
                      {leg.marketPrice != null && (
                        <Grid item xs={12} sm={1}>
                          <Typography variant="caption" color="text.secondary">Market</Typography>
                          <Typography variant="body2">${leg.marketPrice?.toFixed(2)}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={12} sm={0.75}>
                        <Typography variant="caption" color="text.secondary">Ratio</Typography>
                        <Typography variant="body2">{leg.ratio?.toFixed(2)}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={1.25}>
                        <Typography variant="caption" color="text.secondary">Delivery</Typography>
                        <Typography variant="body2">
                          {leg.deliveryDate ? (() => {
                            try {
                              const date = new Date(leg.deliveryDate);
                              if (isNaN(date.getTime())) {
                                return leg.deliveryDate;
                              }
                              return date.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            } catch (error) {
                              return leg.deliveryDate;
                            }
                          })() : "-"}
                        </Typography>
                      </Grid>
                      {leg.mtm != null && (
                        <Grid item xs={12} sm={1.25}>
                          <Typography variant="caption" color="text.secondary">Leg MTM</Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={leg.mtm >= 0 ? "success.main" : "error.main"}
                          >
                            {leg.mtm.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD"
                            })}
                          </Typography>
                        </Grid>
                      )}
                      {leg.pnl != null && (
                        <Grid item xs={12} sm={1.25}>
                          <Typography variant="caption" color="text.secondary">Leg PnL</Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={leg.pnl >= 0 ? "success.main" : "error.main"}
                          >
                            {leg.pnl.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD"
                            })}
                          </Typography>
                        </Grid>
                      )}
                      {leg.mtm == null && leg.pnl == null && (
                        <Grid item xs={12} sm={1.5}>
                          <Typography variant="caption" color="text.secondary">Notional</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {(leg.quantity * leg.price * (leg.ratio || 1)).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD"
                            })}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

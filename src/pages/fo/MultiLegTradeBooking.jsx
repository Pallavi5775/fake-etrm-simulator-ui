import { useState, useEffect } from "react";
import apiConfig from '../../config/apiConfig';
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem,
  Grid, IconButton, Divider, Alert, Card, CardContent, Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import Toast from "../../components/shared/Toast";
import LoadingSpinner from "../../components/shared/LoadingSpinner";

const BASE_URL = apiConfig.baseURL;

const STRATEGY_TYPES = [
  { value: "CALENDAR_SPREAD", label: "Calendar Spread", legs: 2 },
  { value: "BUTTERFLY", label: "Butterfly", legs: 3 },
  { value: "CRACK_SPREAD", label: "Crack Spread (3-2-1)", legs: 3 },
  { value: "CUSTOM", label: "Custom Multi-Leg", legs: 2 }
];

const BUY_SELL = ["BUY", "SELL"];

/**
 * Multi-Leg Trade Booking - Calendar Spreads, Butterflies, Crack Spreads
 */
export default function MultiLegTradeBooking() {
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [instruments, setInstruments] = useState([]);
  
  const [formData, setFormData] = useState({
    strategyType: "CALENDAR_SPREAD",
    portfolio: "",
    counterparty: "",
    tradeDate: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const [legs, setLegs] = useState([
    {
      legNumber: 1,
      instrumentCode: "",
      buySell: "BUY",
      quantity: "",
      price: "",
      ratio: 1.0,
      deliveryDate: ""
    },
    {
      legNumber: 2,
      instrumentCode: "",
      buySell: "SELL",
      quantity: "",
      price: "",
      ratio: 1.0,
      deliveryDate: ""
    }
  ]);

  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchPortfolios();
    fetchCounterparties();
    fetchInstruments();
  }, []);

  useEffect(() => {
    // Auto-adjust legs based on strategy type
    const strategy = STRATEGY_TYPES.find(s => s.value === formData.strategyType);
    if (strategy && legs.length !== strategy.legs) {
      const newLegs = [];
      for (let i = 0; i < strategy.legs; i++) {
        newLegs.push(legs[i] || {
          legNumber: i + 1,
          instrumentCode: "",
          buySell: i === 0 ? "BUY" : "SELL",
          quantity: "",
          price: "",
          ratio: getDefaultRatio(formData.strategyType, i),
          deliveryDate: ""
        });
      }
      setLegs(newLegs);
    }
  }, [formData.strategyType]);

  const getDefaultRatio = (strategyType, legIndex) => {
    if (strategyType === "BUTTERFLY") {
      return legIndex === 1 ? 2.0 : 1.0;
    }
    if (strategyType === "CRACK_SPREAD") {
      if (legIndex === 0) return 1.0;
      if (legIndex === 1) return 0.42; // Gasoline
      if (legIndex === 2) return 0.58; // Heating Oil
    }
    return 1.0;
  };

  const fetchPortfolios = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/portfolios`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
    }
  };

  const fetchCounterparties = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/counterparties`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCounterparties(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching counterparties:", err);
    }
  };

  const fetchInstruments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/instruments`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Fetched instruments:", data);
        setInstruments(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch instruments, status:", res.status);
      }
    } catch (err) {
      console.error("Error fetching instruments:", err);
      setToast({
        open: true,
        message: "Failed to load instruments. Check console for details.",
        severity: "warning"
      });
    }
  };

  const addLeg = () => {
    setLegs([
      ...legs,
      {
        legNumber: legs.length + 1,
        instrumentCode: "",
        buySell: "BUY",
        quantity: "",
        price: "",
        ratio: 1.0,
        deliveryDate: ""
      }
    ]);
  };

  const removeLeg = (index) => {
    if (legs.length > 2) {
      const newLegs = legs.filter((_, i) => i !== index);
      // Renumber legs
      newLegs.forEach((leg, i) => {
        leg.legNumber = i + 1;
      });
      setLegs(newLegs);
    }
  };

  const updateLeg = (index, field, value) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    setLegs(newLegs);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.portfolio || !formData.counterparty) {
      setToast({
        open: true,
        message: "Portfolio and Counterparty are required",
        severity: "error"
      });
      return;
    }

    for (let leg of legs) {
      if (!leg.instrumentCode || !leg.quantity || !leg.price) {
        setToast({
          open: true,
          message: `All leg fields are required (Leg ${leg.legNumber})`,
          severity: "error"
        });
        return;
      }
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        createdByUser: user.username || "UNKNOWN",
        legs: legs.map(leg => ({
          ...leg,
          quantity: parseFloat(leg.quantity),
          price: parseFloat(leg.price),
          ratio: parseFloat(leg.ratio)
        }))
      };

      const res = await fetch(`${BASE_URL}/trades/multi-leg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setToast({
          open: true,
          message: `Multi-leg trade created: ${data.tradeId || 'Success'}`,
          severity: "success"
        });
        
        // Reset form
        setFormData({
          strategyType: "CALENDAR_SPREAD",
          portfolio: "",
          counterparty: "",
          tradeDate: new Date().toISOString().split('T')[0],
          notes: ""
        });
        setLegs([
          {
            legNumber: 1,
            instrumentCode: "",
            buySell: "BUY",
            quantity: "",
            price: "",
            ratio: 1.0,
            deliveryDate: ""
          },
          {
            legNumber: 2,
            instrumentCode: "",
            buySell: "SELL",
            quantity: "",
            price: "",
            ratio: 1.0,
            deliveryDate: ""
          }
        ]);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to create multi-leg trade",
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

  const calculateSpreadValue = () => {
    if (legs.length < 2) return 0;
    
    let value = 0;
    legs.forEach(leg => {
      const qty = parseFloat(leg.quantity) || 0;
      const price = parseFloat(leg.price) || 0;
      const ratio = parseFloat(leg.ratio) || 1;
      const multiplier = leg.buySell === "BUY" ? -1 : 1;
      value += multiplier * qty * price * ratio;
    });
    
    return value;
  };

  if (loading) {
    return <LoadingSpinner message="Creating multi-leg trade..." />;
  }

  const spreadValue = calculateSpreadValue();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        📊 Multi-Leg Trade Booking
      </Typography>

      <Grid container spacing={3}>
        {/* Strategy & Header Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Strategy Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Strategy Type"
                  fullWidth
                  value={formData.strategyType}
                  onChange={(e) => setFormData({ ...formData, strategyType: e.target.value })}
                >
                  {STRATEGY_TYPES.map(s => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label} ({s.legs} legs)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Portfolio"
                  fullWidth
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  required
                >
                  <MenuItem value="">-- Select Portfolio --</MenuItem>
                  {portfolios.map(p => (
                    <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Counterparty"
                  fullWidth
                  value={formData.counterparty}
                  onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
                  required
                >
                  <MenuItem value="">-- Select Counterparty --</MenuItem>
                  {counterparties.map(c => (
                    <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Trade Date"
                  type="date"
                  fullWidth
                  value={formData.tradeDate}
                  onChange={(e) => setFormData({ ...formData, tradeDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g., Q1/Q2 calendar spread - expect Q1 to outperform"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Legs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Trade Legs</Typography>
              {formData.strategyType === "CUSTOM" && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addLeg}
                  variant="outlined"
                  size="small"
                >
                  Add Leg
                </Button>
              )}
            </Stack>

            <Stack spacing={2}>
              {legs.map((leg, index) => (
                <Card key={index} sx={{ bgcolor: "background.default" }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Chip label={`Leg ${leg.legNumber}`} color="primary" />
                      {formData.strategyType === "CUSTOM" && legs.length > 2 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeLeg(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <TextField
                          select
                          label="Instrument"
                          fullWidth
                          value={leg.instrumentCode}
                          onChange={(e) => updateLeg(index, "instrumentCode", e.target.value)}
                          required
                          SelectProps={{
                            displayEmpty: true
                          }}
                        >
                          <MenuItem value="">-- Select Instrument --</MenuItem>
                          {instruments.map(i => (
                            <MenuItem key={i.id} value={i.instrumentCode}>
                              {i.instrumentCode} - {i.commodity} {i.instrumentType}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          select
                          label="Buy/Sell"
                          fullWidth
                          value={leg.buySell}
                          onChange={(e) => updateLeg(index, "buySell", e.target.value)}
                          required
                        >
                          {BUY_SELL.map(bs => (
                            <MenuItem key={bs} value={bs}>{bs}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Quantity"
                          type="number"
                          fullWidth
                          value={leg.quantity}
                          onChange={(e) => updateLeg(index, "quantity", e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          label="Price"
                          type="number"
                          fullWidth
                          value={leg.price}
                          onChange={(e) => updateLeg(index, "price", e.target.value)}
                          inputProps={{ step: "0.01" }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={1.5}>
                        <TextField
                          label="Ratio"
                          type="number"
                          fullWidth
                          value={leg.ratio}
                          onChange={(e) => updateLeg(index, "ratio", e.target.value)}
                          inputProps={{ step: "0.01" }}
                        />
                      </Grid>
                      <Grid item xs={12} md={1.5}>
                        <TextField
                          label="Delivery"
                          type="date"
                          fullWidth
                          value={leg.deliveryDate}
                          onChange={(e) => updateLeg(index, "deliveryDate", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Summary */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">Net Spread Value</Typography>
                <Typography variant="h6" color={spreadValue >= 0 ? "success.main" : "error.main"}>
                  {spreadValue.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                  })}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={loading}
              >
                Book Multi-Leg Trade
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}

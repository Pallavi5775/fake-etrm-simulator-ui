import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Divider
} from "@mui/material";

import {
  fetchDealTemplates,
  bookTradeFromTemplate
} from "../../api/tradeApi";

/**
 * Front Office – Trade Booking (Endur-style)
 * - Template hydrates UI
 * - Structural fields read-only
 * - Economic overrides allowed
 */
export default function TradeBooking() {
  const [templates, setTemplates] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buySell, setBuySell] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [spotPrice, setSpotPrice] = useState("");
  const [tradeDate, setTradeDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);

  /* ===== Load templates, counterparties, and portfolios ===== */
  useEffect(() => {
    fetchDealTemplates()
      .then(setTemplates)
      .catch(err => {
        console.error("Failed to load templates:", err);
        setTemplates([]);
      });
    
    // Fetch counterparties
    fetch("http://localhost:8080/api/counterparties")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setCounterparties(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Failed to load counterparties:", err);
        setCounterparties([]);
        alert("Warning: Could not load counterparties. Backend may not be running.");
      });
    
    // Fetch portfolios
    fetch("http://localhost:8080/api/portfolios")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setPortfolios(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Failed to load portfolios:", err);
        setPortfolios([]);
        alert("Warning: Could not load portfolios. Backend may not be running.");
      });
  }, []);

  /* ===== Selected template ===== */
  const selectedTemplate = useMemo(
    () => templates.find(t => String(t.id) === String(templateId)),
    [templates, templateId]
  );

  /* ===== Book trade ===== */
  const handleBookTrade = async () => {
    setLoading(true);
    try {
      await bookTradeFromTemplate({
        templateId: parseInt(templateId),
        quantity: parseFloat(quantity),
        buySell,
        counterparty,
        portfolio,
        tradeDate,
        valuationConfig: {
          spotPrice: spotPrice ? parseFloat(spotPrice) : selectedTemplate?.defaultPrice || 0
        }
      });
      alert("Trade booked successfully - Status: APPROVED");

      setQuantity("");
      setTemplateId("");
      setBuySell("");
      setCounterparty("");
      setPortfolio("");
      setSpotPrice("");
      setTradeDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error(err);
      alert("Trade booking failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  /* ===== Render ===== */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Trade Booking – Front Office
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 650 }}>
        <Stack spacing={3}>

          {/* ================= TEMPLATE ================= */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Deal Template
          </Typography>

          <TextField
            select
            label="Template"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            fullWidth
          >
            {templates?.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.templateName}
              </MenuItem>
            ))}
          </TextField>

          {/* ================= TEMPLATE DETAILS ================= */}
          {selectedTemplate && (
            <>
              <Divider />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#B388FF" }}>
                Template Details (Read-Only)
              </Typography>

              {/* Template Name & ID */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Template Name"
                  value={selectedTemplate.templateName || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Template ID"
                  value={selectedTemplate.id || ""}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* Commodity & Instrument Type */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Commodity"
                  value={selectedTemplate.commodity || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Instrument Type"
                  value={selectedTemplate.instrumentType || ""}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* Instrument Code & ID */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Instrument Code"
                  value={selectedTemplate.instrumentCode || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Instrument ID"
                  value={selectedTemplate.instrumentId || ""}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* Pricing Model & Currency */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Pricing Model"
                  value={selectedTemplate.pricingModel || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Currency"
                  value={selectedTemplate.currency || ""}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* Default Price & Unit */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Default Price"
                  value={selectedTemplate.defaultPrice || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Unit"
                  value={selectedTemplate.unit || ""}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* Default Quantity & MTM Threshold */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Default Quantity"
                  value={selectedTemplate.defaultQuantity || ""}
                  disabled
                  fullWidth
                />
                <TextField
                  label="MTM Approval Threshold"
                  value={selectedTemplate.mtmApprovalThreshold || ""}
                  disabled
                  fullWidth
                />
              </Stack>

              {/* Auto Approval & Risk Routing */}
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Auto Approval Allowed"
                  value={
                    selectedTemplate.autoApprovalAllowed
                      ? "YES"
                      : "NO"
                  }
                  disabled
                  fullWidth
                />
                <TextField
                  label="Risk Routing"
                  value="RISK"
                  disabled
                  fullWidth
                />
              </Stack>

              <Divider />

              {/* ================= OVERRIDES ================= */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Trade Overrides
              </Typography>

              <TextField
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                fullWidth
                helperText={`Default: ${selectedTemplate.defaultQuantity}`}
              />

              <TextField
                label="Trade Date"
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                helperText="Date when the trade is executed"
              />

              <TextField
  select
  label="Buy / Sell"
  value={buySell}
  onChange={(e) => setBuySell(e.target.value)}
>
  <MenuItem value="BUY">BUY</MenuItem>
  <MenuItem value="SELL">SELL</MenuItem>
</TextField>

<TextField
  select
  label="Counterparty"
  value={counterparty}
  onChange={(e) => setCounterparty(e.target.value)}
  fullWidth
  required
>
  {counterparties?.map((cp) => (
    <MenuItem key={cp.id} value={cp.name}>
      {cp.name}
    </MenuItem>
  ))}
</TextField>

<TextField
  select
  label="Portfolio"
  value={portfolio}
  onChange={(e) => setPortfolio(e.target.value)}
  fullWidth
  required
>
  {portfolios?.map((p) => (
    <MenuItem key={p.id} value={p.name}>
      {p.name}
    </MenuItem>
  ))}
</TextField>

              <TextField
                label="Spot Price (Override)"
                value={spotPrice}
                onChange={(e) => setSpotPrice(e.target.value)}
                type="number"
                fullWidth
                helperText={`Default: ${selectedTemplate?.defaultPrice || 'N/A'}`}
              />
            </>
          )}

          {/* ================= ACTION ================= */}
          <Button
            variant="contained"
            color="primary"
            disabled={!templateId || !quantity || !buySell || !counterparty || !portfolio || loading}
            onClick={handleBookTrade}
            sx={{ alignSelf: "flex-end", minWidth: 160 }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Book Trade"
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

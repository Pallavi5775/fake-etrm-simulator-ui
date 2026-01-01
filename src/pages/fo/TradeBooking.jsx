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
  const [templateId, setTemplateId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buySell, setBuySell] = useState([]);
  const [portfolio, setPortfolio] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [loading, setLoading] = useState(false);

  /* ===== Load templates ===== */
  useEffect(() => {
    fetchDealTemplates().then(setTemplates);
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
      await bookTradeFromTemplate(
  templateId,
  quantity,
  buySell,
  counterparty,
  portfolio
);
      alert("Trade booked successfully");

      setQuantity("");
      setTemplateId("");
    } catch (err) {
      console.error(err);
      alert("Trade booking failed");
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
            {templates.map((t) => (
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
  select
  label="Buy / Sell"
  value={buySell}
  onChange={(e) => setBuySell(e.target.value)}
>
  <MenuItem value="BUY">BUY</MenuItem>
  <MenuItem value="SELL">SELL</MenuItem>
</TextField>

<TextField
  label="Counterparty"
  value={counterparty}
  onChange={(e) => setCounterparty(e.target.value)}
/>

<TextField
  label="Portfolio"
  value={portfolio}
  onChange={(e) => setPortfolio(e.target.value)}
/>
            </>
          )}

          {/* ================= ACTION ================= */}
          <Button
            variant="contained"
            color="primary"
            disabled={!templateId || !quantity || loading}
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

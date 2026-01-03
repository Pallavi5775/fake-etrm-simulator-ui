import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Divider,
  Stack,
  Box,
  CircularProgress
} from "@mui/material";

import ValuationChart from "./ValuationChart";
import TradeLifecycleActions from "./TradeLifecycleActions";

/**
 * Trade Drill-down Modal
 * Endur-style trade details + valuation history
 */
export default function TradeDrilldownModal({ trade, open, onClose, onRefresh }) {
  const [showChart, setShowChart] = useState(false);

  // Reset chart visibility when trade changes
  useEffect(() => {
    if (trade) {
      setShowChart(true);
    }
  }, [trade]);

  if (!trade) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Trade #{trade.tradeId} – {trade.instrumentCode}
          </Typography>
          <TradeLifecycleActions trade={trade} onActionComplete={() => {
            onRefresh?.();
            onClose();
          }} />
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Trade details */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography>Quantity: {trade.quantity}</Typography>
          <Typography>Trade Price: {trade.tradePrice}</Typography>
          <Typography>Status: {trade.status}</Typography>
          <Typography>
            MTM:{" "}
            <strong
              style={{
                color: trade.mtm >= 0 ? "#00C853" : "#FF5252"
              }}
            >
              {trade.mtm}
            </strong>
          </Typography>
          <Typography>
            Pending Role: {trade.pendingRole || "-"}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Valuation History */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Valuation History (MTM)
        </Typography>

        <Box sx={{ height: 220 }}>
          {showChart ? (
            <ValuationChart tradeId={trade.tradeId} />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

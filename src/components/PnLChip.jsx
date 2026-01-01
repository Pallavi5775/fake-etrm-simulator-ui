import { useEffect, useState } from "react";
import { Chip, CircularProgress } from "@mui/material";
import { fetchPnL } from "../api/tradeApi";

/**
 * PnL indicator chip (Endur-style)
 * - Fetches PnL from backend
 * - Color-coded
 * - Lightweight & reusable
 */
export default function PnLChip({ tradeId }) {
  const [pnl, setPnl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tradeId) return;

    setLoading(true);
    fetchPnL(tradeId)
      .then(setPnl)
      .finally(() => setLoading(false));
  }, [tradeId]);

  /* ===== Render ===== */

  if (loading) {
    return (
      <Chip
        size="small"
        label={<CircularProgress size={12} />}
        variant="outlined"
      />
    );
  }

  if (pnl === null || pnl === undefined) {
    return (
      <Chip
        size="small"
        label="N/A"
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      size="small"
      label={pnl}
      color={pnl >= 0 ? "success" : "error"}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}

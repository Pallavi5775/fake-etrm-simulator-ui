import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import TradeTable from "../../components/TradeTable";
import { fetchAllTrades } from "../../api/tradeApi";

/**
 * Rejected Trades – Audit Only
 */
export default function RejectedTradesAudit() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRejectedTrades();
  }, []);

  const loadRejectedTrades = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTrades({ status: "REJECTED" });
      setTrades(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Rejected Trades (Audit Only)
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TradeTable trades={trades} />
      )}
    </Box>
  );
}

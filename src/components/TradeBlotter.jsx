import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

import TradeTable from "../../components/TradeTable";
import { fetchAllTrades } from "../../api/tradeApi";

/**
 * Trade Blotter – Approved Trades
 */
export default function TradeBlotter() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApprovedTrades();
  }, []);

  const loadApprovedTrades = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTrades({ status: "APPROVED" });
      setTrades(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Trade Blotter (Approved Trades)
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TradeTable trades={trades} />
      )}
    </Box>
  );
}

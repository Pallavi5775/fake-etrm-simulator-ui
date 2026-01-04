import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, useMediaQuery, useTheme } from "@mui/material";

import TradeTable from "../../components/TradeTable";
import { fetchAllTrades } from "../../api/tradeApi";

/**
 * Trade Blotter – Approved Trades
 */
export default function TradeBlotter() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h5"} sx={{ mb: 2 }}>
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

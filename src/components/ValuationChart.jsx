import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { Box, Typography, CircularProgress } from "@mui/material";
import { fetchValuationHistory } from "../api/tradeApi";

/**
 * Valuation history chart (Endur-style)
 * - MTM over time
 * - Used in trade drill-down
 */
export default function ValuationChart({ tradeId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tradeId) return;

    setLoading(true);
    fetchValuationHistory(tradeId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [tradeId]);

  /* ===== Render ===== */

  if (loading) {
    return (
      <Box
        sx={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          No valuation history available
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="mtm"
          stroke="#7C4DFF"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

import {
  Card, CardContent, Typography,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, Stack
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/api";

const statusColor = {
  CREATED: "default",
  PRICED: "info",
  DELIVERED: "warning",
  INVOICED: "primary",
  SETTLED: "success",
  CANCELLED: "error"
};


const allowedActions = (trade) => {
  const status = trade.status;

  switch (status) {

    // ✅ INITIAL STATES
    case "CREATED":
    case "NEW":           // <-- add this
      return ["PRICED", "CANCELLED"];

    case "PRICED":
      return trade.amendCount === 0
        ? ["AMENDED", "DELIVERED"]
        : ["DELIVERED"];

    case "DELIVERED":
      return ["INVOICED"];

    case "INVOICED":
      return ["SETTLED"];

    default:
      return [];
  }
};


export default function Trades() {
  const [trades, setTrades] = useState([]);

  const load = async () => {
    const res = await api.get("/api/trades");
    setTrades(res.data);
  };

  const apply = async (tradeId, eventType) => {
    try {
        await api.post(`/api/trades/${tradeId}/events`, {
        eventType
        });
        load();
    } catch (e) {
        alert(e.response?.data?.error || "Lifecycle action failed");
    }
};


  useEffect(() => { load(); }, []);

  return (
<Card>
  <CardContent>
    <Typography variant="h6" gutterBottom>
      Trades & Lifecycle
    </Typography>

    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Trade ID</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {trades.map(trade => (
          <TableRow key={trade.tradeId}>

            {/* Trade ID */}
            <TableCell>{trade.tradeId}</TableCell>

            {/* Status */}
            <TableCell>
              <Chip
                label={trade.status}
                color={statusColor[trade.status]}
                size="small"
              />
            </TableCell>

            {/* Lifecycle Actions */}
            <TableCell>
  <Stack direction="row" spacing={1}>

    {/* FIX / PRICE */}
    {allowedActions(trade).includes("PRICED") && (
      <Button
        size="small"
        onClick={() => apply(trade.tradeId, "PRICED")}
      >
        Fix / Price
      </Button>
    )}

    {/* AMEND (only once after PRICED) */}
    {allowedActions(trade).includes("AMENDED") && (
      <Button
        size="small"
        color="secondary"
        onClick={() => apply(trade.tradeId, "AMENDED")}
      >
        Amend
      </Button>
    )}

    {/* DELIVER */}
    {allowedActions(trade).includes("DELIVERED") && (
      <Button
        size="small"
        onClick={() => apply(trade.tradeId, "DELIVERED")}
      >
        Deliver
      </Button>
    )}

    {/* INVOICE */}
    {allowedActions(trade).includes("INVOICED") && (
      <Button
        size="small"
        onClick={() => apply(trade.tradeId, "INVOICED")}
      >
        Invoice
      </Button>
    )}

    {/* SETTLE */}
    {allowedActions(trade).includes("SETTLED") && (
      <Button
        size="small"
        onClick={() => apply(trade.tradeId, "SETTLED")}
      >
        Settle
      </Button>
    )}

    {/* CANCEL */}
    {allowedActions(trade).includes("CANCELLED") && (
      <Button
        size="small"
        color="error"
        onClick={() => apply(trade.tradeId, "CANCELLED")}
      >
        Cancel
      </Button>
    )}

  </Stack>
</TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>

  );
}

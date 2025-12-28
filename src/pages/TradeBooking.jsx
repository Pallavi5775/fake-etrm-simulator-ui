import {
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem
} from "@mui/material";
import { useState } from "react";
import { api } from "../api/api";

export default function TradeBooking() {

  const [trade, setTrade] = useState({
    eventType: "CREATED",
    tradeId: "",
    price: "",
    quantity: "",
    counterparty: "",
    portfolio: "",
    buySell: "BUY",
    instrumentSymbol: ""
  });

  const submit = async () => {
  try {
    await api.post("/api/trades", {
      eventType: trade.eventType,
      tradeId: trade.tradeId,
      instrumentSymbol: trade.instrumentSymbol,   // ✅ FIX
      price: Number(trade.price),
      quantity: Number(trade.quantity),
      counterparty: trade.counterparty,
      portfolio: trade.portfolio,
      buySell: trade.buySell
    });

    alert("Trade booked successfully");
  } catch (e) {
    alert(e.response?.data?.error || "Trade booking failed");
  }
};

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Trade Booking (Front Office)
        </Typography>

        <Grid container spacing={2}>

          {/* Event Type */}
          <Grid item xs={6}>
            <TextField
              select
              label="Event Type"
              fullWidth
              value={trade.eventType}
              onChange={e => setTrade({ ...trade, eventType: e.target.value })}
            >

                
              <MenuItem value="CREATED">CREATED</MenuItem>
              <MenuItem value="AMENDED">AMENDED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              <MenuItem value="DELIVERED">DELIVERED</MenuItem>
              <MenuItem value="INVOICED">INVOICED</MenuItem>
              <MenuItem value="SETTLED">SETTLED</MenuItem>
              <MenuItem value="PRICED">PRICED</MenuItem>
            </TextField>
          </Grid>

          {/* Buy / Sell */}
          <Grid item xs={6}>
            <TextField
              select
              label="Buy / Sell"
              fullWidth
              value={trade.buySell}
              onChange={e => setTrade({ ...trade, buySell: e.target.value })}
            >
              <MenuItem value="BUY">BUY</MenuItem>
              <MenuItem value="SELL">SELL</MenuItem>
            </TextField>
          </Grid>

          {/* Trade ID */}
          <Grid item xs={6}>
            <TextField
              label="Trade ID"
              fullWidth
              onChange={e => setTrade({ ...trade, tradeId: e.target.value })}
            />
          </Grid>

          {/* Counterparty */}
          <Grid item xs={6}>
            <TextField
              label="Counterparty"
              fullWidth
              onChange={e => setTrade({ ...trade, counterparty: e.target.value })}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={6}>
            <TextField
              label="Price"
              type="number"
              fullWidth
              onChange={e => setTrade({ ...trade, price: e.target.value })}
            />
          </Grid>

          {/* Quantity */}
          <Grid item xs={6}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              onChange={e => setTrade({ ...trade, quantity: e.target.value })}
            />
          </Grid>

          {/* Portfolio */}
          <Grid item xs={6}>
            <TextField
              label="Portfolio"
              fullWidth
              onChange={e => setTrade({ ...trade, portfolio: e.target.value })}
            />
          </Grid>

          {/* Instrument */}
          {/* Instrument Symbol */}
        <Grid item xs={6}>
        <TextField
            label="Instrument Symbol"
            placeholder="e.g. POWER_JAN25"
            fullWidth
            value={trade.instrumentSymbol}
            onChange={e =>
            setTrade({ ...trade, instrumentSymbol: e.target.value })
            }
        />
        </Grid>


        </Grid>

        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={submit}
        >
          Submit Trade
        </Button>
      </CardContent>
    </Card>
  );
}

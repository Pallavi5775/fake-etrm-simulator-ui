import {
  Button,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography
} from "@mui/material";
import { useState } from "react";

const STATUSES = ["CREATED", "CONFIRMED", "CANCELLED"];
const EVENTS = ["PRICED", "AMEND", "CANCEL"];
const DESKS = ["POWER", "GAS", "LNG"];

export default function SimulatorInputs({ onSimulate }) {
  const [tradeId, setTradeId] = useState("");
  const [ruleIds, setRuleIds] = useState("");
  const [fromStatus, setFromStatus] = useState("CREATED");
  const [eventType, setEventType] = useState("PRICED");
  const [desk, setDesk] = useState("POWER");
  const [price, setPrice] = useState("");

  const submit = () => {
    onSimulate({
      tradeId,
      ruleIds: ruleIds.split(",").map(id => Number(id.trim())),
      fromStatus,
      eventType,
      desk,
      overrideAttributes: {
        marketPrice: price !== "" ? Number(price) : undefined
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Rule Simulator</Typography>

        {/* Trade ID */}
        <TextField
          label="Trade ID"
          fullWidth
          margin="normal"
          value={tradeId}
          onChange={e => setTradeId(e.target.value)}
        />

        {/* Desk */}
        <TextField
          select
          label="Desk"
          fullWidth
          margin="normal"
          value={desk}
          onChange={e => setDesk(e.target.value)}
        >
          {DESKS.map(d => (
            <MenuItem key={d} value={d}>{d}</MenuItem>
          ))}
        </TextField>

        {/* From Status */}
        <TextField
          select
          label="From Status"
          fullWidth
          margin="normal"
          value={fromStatus}
          onChange={e => setFromStatus(e.target.value)}
        >
          {STATUSES.map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>

        {/* Event Type */}
        <TextField
          select
          label="Event Type"
          fullWidth
          margin="normal"
          value={eventType}
          onChange={e => setEventType(e.target.value)}
        >
          {EVENTS.map(ev => (
            <MenuItem key={ev} value={ev}>{ev}</MenuItem>
          ))}
        </TextField>

        {/* Rule IDs */}
        <TextField
          label="Rule IDs (comma separated)"
          fullWidth
          margin="normal"
          value={ruleIds}
          onChange={e => setRuleIds(e.target.value)}
        />

        {/* Override Market Price */}
        <TextField
          label="Override Market Price"
          type="number"
          fullWidth
          margin="normal"
          value={price}
          onChange={e => setPrice(e.target.value)}
          inputProps={{ step: "0.01" }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={submit}
        >
          Simulate
        </Button>
      </CardContent>
    </Card>
  );
}

import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  Button,
  Switch,
  FormControlLabel
} from "@mui/material";
import { useState } from "react";

const STATUSES = ["CREATED", "CONFIRMED", "CANCELLED"];
const EVENTS = ["PRICED", "AMEND", "CANCEL"];
const DESKS = ["POWER", "GAS", "LNG"];

export default function LifecycleRuleForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [fromStatus, setFromStatus] = useState("CREATED");
  const [eventType, setEventType] = useState("PRICED");
  const [toStatus, setToStatus] = useState("CONFIRMED");
  const [desk, setDesk] = useState("POWER");
  const [maxOccurrence, setMaxOccurrence] = useState(1);
  const [enabled, setEnabled] = useState(true);

  const submit = () => {
    onSubmit({
      name: name || null,          // ✅ optional
      fromStatus,
      eventType,
      toStatus,
      desk,
      maxOccurrence,
      enabled
      // productionEnabled intentionally omitted
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Create Lifecycle Rule</Typography>

        {/* Rule Name (Optional) */}
        <TextField
          label="Rule Name (Optional)"
          fullWidth
          margin="normal"
          value={name}
          onChange={e => setName(e.target.value)}
          helperText="Optional display label. Rule ID is the system identifier."
        />

        {/* Lifecycle Matching */}
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

        <TextField
          select
          label="Event Type"
          fullWidth
          margin="normal"
          value={eventType}
          onChange={e => setEventType(e.target.value)}
        >
          {EVENTS.map(e => (
            <MenuItem key={e} value={e}>{e}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="To Status"
          fullWidth
          margin="normal"
          value={toStatus}
          onChange={e => setToStatus(e.target.value)}
        >
          {STATUSES.map(s => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>

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

        {/* Rule Controls */}
        <TextField
          label="Max Occurrence"
          type="number"
          fullWidth
          margin="normal"
          value={maxOccurrence}
          onChange={e => setMaxOccurrence(Number(e.target.value))}
          inputProps={{ min: 1 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
            />
          }
          label="Enabled (Visible in Simulator)"
        />

        {/* Production Enabled - Read-only */}
        <FormControlLabel
          control={<Switch checked={false} disabled />}
          label="Production Enabled (Requires Approval)"
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={submit}
        >
          Create Rule
        </Button>
      </CardContent>
    </Card>
  );
}

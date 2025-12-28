import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
    Card,
  CardContent,
  Typography
} from "@mui/material";


import { useState } from "react";
import RuleExecutionCard from "../pages/RuleExecutionCard";

const SCOPES = {
  SINGLE_TRADE: "SINGLE_TRADE",
  FILTERED_TRADES: "FILTERED_TRADES",
  SAMPLE_TRADES: "SAMPLE_TRADES"
};

export default function RuleSimulationModal({
  open,
  ruleContext,
  onClose,
  onRun, result
}) {
  const [scope, setScope] = useState(SCOPES.SINGLE_TRADE);
  const [tradeId, setTradeId] = useState("");
  const [desk, setDesk] = useState(ruleContext?.desk);
  const [status, setStatus] = useState(ruleContext?.fromStatus);
  const [sampleSize, setSampleSize] = useState(10);
  const [price, setPrice] = useState("");

  const runSimulation = () => {
    onRun({
      scope,
      ruleIds: [ruleContext.ruleId],
      tradeId: scope === SCOPES.SINGLE_TRADE ? tradeId : null,
      desk: scope !== SCOPES.SINGLE_TRADE ? desk : null,
      status: scope === SCOPES.FILTERED_TRADES ? status : null,
      sampleSize: scope === SCOPES.SAMPLE_TRADES ? sampleSize : null,
      fromStatus: ruleContext.fromStatus,
      eventType: ruleContext.eventType,
      overrideAttributes: {
        marketPrice: price !== "" ? Number(price) : undefined
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Simulate Rule – {ruleContext?.ruleName}
      </DialogTitle>

      <DialogContent>
        <RadioGroup
          value={scope}
          onChange={e => setScope(e.target.value)}
        >
          <FormControlLabel
            value={SCOPES.SINGLE_TRADE}
            control={<Radio />}
            label="Single Trade"
          />
          <FormControlLabel
            value={SCOPES.FILTERED_TRADES}
            control={<Radio />}
            label="Filtered Trades"
          />
          <FormControlLabel
            value={SCOPES.SAMPLE_TRADES}
            control={<Radio />}
            label="Sample Trades"
          />
        </RadioGroup>

        <Stack spacing={2} mt={2}>
          {scope === SCOPES.SINGLE_TRADE && (
            <TextField
              label="Trade ID"
              value={tradeId}
              onChange={e => setTradeId(e.target.value)}
              fullWidth
            />
          )}

          {scope === SCOPES.FILTERED_TRADES && (
            <>
              <TextField
                label="Desk"
                value={desk}
                onChange={e => setDesk(e.target.value)}
                fullWidth
              />
              <TextField
                label="Trade Status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                fullWidth
              />
            </>
          )}

          {scope === SCOPES.SAMPLE_TRADES && (
            <TextField
              label="Sample Size"
              type="number"
              value={sampleSize}
              onChange={e => setSampleSize(Number(e.target.value))}
              fullWidth
            />
          )}

          <TextField
            label="Override Market Price"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={runSimulation}>
          Run Simulation
        </Button>
      </DialogActions>

      <DialogActions>

<Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Final Trade Status</Typography>
          <Typography>{result?.finalStatus}</Typography>
        </CardContent>
      </Card>
      {result?.traces.map((trace, idx) => (
        <RuleExecutionCard key={idx} trace={trace} />
      ))} 

      </DialogActions>


      
    </Dialog>
  );
}

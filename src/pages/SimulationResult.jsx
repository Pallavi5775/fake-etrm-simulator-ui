import { Card, CardContent, Typography, Alert } from "@mui/material";
import RuleExecutionCard from "./RuleExecutionCard";

export default function SimulationResult({ result }) {
  if (!result) {
    return <Alert severity="info">Run a simulation to see results</Alert>;
  }

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Final Trade Status</Typography>
          <Typography>{result.finalStatus}</Typography>
        </CardContent>
      </Card>

      {result.traces.map((trace, idx) => (
        <RuleExecutionCard key={idx} trace={trace} />
      ))}
    </>
  );
}

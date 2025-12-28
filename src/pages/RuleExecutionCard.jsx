import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip
} from "@mui/material";

export default function RuleExecutionCard({ trace }) {
  const chipColor =
    trace.result === "SUCCESS"
      ? "success"
      : trace.result === "SKIPPED"
      ? "default"
      : "error";

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {trace.ruleName}
          </Typography>

          {/* Chip: omit color for default */}
          <Chip
            label={trace.result}
            color={chipColor !== "default" ? chipColor : undefined}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Stack>

        <Typography sx={{ mt: 1 }}>
          Condition Matched:{" "}
          <b>{trace.conditionMatched ? "Yes" : "No"}</b>
        </Typography>

        {trace.actionsExecuted?.length > 0 && (
          <>
            <Typography sx={{ mt: 1, fontWeight: 500 }}>
              Actions Executed
            </Typography>
            <ul style={{ marginTop: 4 }}>
              {trace.actionsExecuted.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

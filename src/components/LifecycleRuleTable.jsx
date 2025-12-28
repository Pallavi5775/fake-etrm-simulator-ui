import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Stack,
  Typography
} from "@mui/material";

export default function LifecycleRuleTable({
  rules,
  onSimulate,
  onPromote,
  onDisable
}) {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Lifecycle Rules
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>From → To</TableCell>
            <TableCell>Event</TableCell>
            <TableCell>Desk</TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Production</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rules.map(rule => (
            <TableRow key={rule.id}>
              <TableCell>{rule.id}</TableCell>

              <TableCell>
                {rule.name || `RULE-${rule.id}`}
              </TableCell>

              <TableCell>
                {rule.fromStatus} → {rule.toStatus}
              </TableCell>

              <TableCell>{rule.eventType}</TableCell>

              <TableCell>{rule.desk}</TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={rule.enabled ? "YES" : "NO"}
                  color={rule.enabled ? "success" : "default"}
                />
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={rule.productionEnabled ? "LIVE" : "NOT LIVE"}
                  color={rule.productionEnabled ? "primary" : "warning"}
                />
              </TableCell>

              <TableCell>
                <Stack direction="row" spacing={1}>
                  {/* 🧪 SIMULATE */}
                  <Button
  size="small"
  variant="outlined"
  onClick={() => onSimulate({
    ruleId: rule.id,
    ruleName: rule.name || `RULE-${rule.id}`,
    desk: rule.desk,
    fromStatus: rule.fromStatus,
    eventType: rule.eventType
  })}
>
  Simulate
</Button>


                  {/* 🚀 PROMOTE */}
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={rule.productionEnabled}
                    onClick={() => onPromote(rule.id)}
                  >
                    Promote
                  </Button>

                  {/* ⛔ DISABLE */}
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={!rule.enabled}
                    onClick={() => onDisable(rule.id)}
                  >
                    Disable
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

import {
  Box,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button
} from "@mui/material";

export default function LifecycleRulesConfig() {
  const rules = [
    { from: "CREATED", to: "APPROVED", role: "RISK" },
    { from: "CREATED", to: "REJECTED", role: "RISK" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Lifecycle Rules
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }}>
        + Add Rule
      </Button>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Role</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rules.map((r, i) => (
            <TableRow key={i}>
              <TableCell>{r.from}</TableCell>
              <TableCell>{r.to}</TableCell>
              <TableCell>{r.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

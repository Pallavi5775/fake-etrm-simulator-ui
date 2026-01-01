import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Divider
} from "@mui/material";

/**
 * Lifecycle Monitor – With Approval Controls
 */
export default function LifecycleMonitor({
  trade,
  onApprove,
  onReject
}) {
  if (!trade) {
    return <Typography>No trade selected</Typography>;
  }

  const isPending = Boolean(trade.pendingApprovalRole);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Trade Lifecycle
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 700 }}>
        <Stack spacing={2}>

          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>
              <strong>Trade:</strong> {trade.tradeId}
            </Typography>

            <Chip
              label={trade.status}
              color={
                trade.status === "APPROVED"
                  ? "success"
                  : trade.status === "REJECTED"
                  ? "error"
                  : "warning"
              }
              size="small"
            />
          </Stack>

          <Divider />

          {/* Timeline */}
          <Stack spacing={1}>
            <Typography>📌 CREATED</Typography>

            {trade.pendingApprovalRole && (
              <Typography>
                🕒 Pending {trade.pendingApprovalRole} Approval
              </Typography>
            )}

            {trade.status === "APPROVED" && (
              <Typography>✅ APPROVED</Typography>
            )}

            {trade.status === "REJECTED" && (
              <Typography>
                ❌ REJECTED — {trade.rejectionReason}
              </Typography>
            )}
          </Stack>

          {/* Approval Controls */}
          {isPending && (
            <>
              <Divider />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onApprove(trade.tradeId)}
                >
                  Approve Trade
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onReject(trade.tradeId)}
                >
                  Reject Trade
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

import { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Chip,
} from "@mui/material";

import TradeDrilldownModal from "./TradeDrilldownModal";
import PnLChip from "./PnLChip";

/**
 * Endur-style Trade Table (Blotter)
 */
export default function TradeTable({
  trades,
  onApprove,
  onReject,
  onSelectTrade, // 👈 parent decides what to do
}) {
  const [selectedTrade, setSelectedTrade] = useState(null);

  const handleSelect = (trade) => {
    setSelectedTrade(trade);
    onSelectTrade?.(trade);
  };

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Trade</TableCell>
            <TableCell>Instrument</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">MTM</TableCell>
            <TableCell align="right">PnL</TableCell>
            <TableCell>Approval Role</TableCell>
            <TableCell>Approval Level</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {trades?.map((t) => (
            <TableRow
              key={t.tradeId}
              hover
              sx={{ cursor: "pointer" }}
              onDoubleClick={() => handleSelect(t)}
            >
              <TableCell>{t.tradeId}</TableCell>
              <TableCell>{t.instrumentCode}</TableCell>
              <TableCell align="right">{t.quantity}</TableCell>
              <TableCell align="right">{t.tradePrice}</TableCell>

              {/* MTM */}
              <TableCell align="right">
                <Chip
                  size="small"
                  label={t.mtm}
                  color={t.mtm >= 0 ? "success" : "error"}
                />
              </TableCell>

              {/* PnL */}
              <TableCell align="right">
                <PnLChip tradeId={t.tradeId} />
              </TableCell>

              {/* Approval Role */}
              <TableCell>
                <Chip
                  size="small"
                  label={t.approvalRole || t.pendingRole || "-"}
                  sx={{
                    backgroundColor: t.approvalRole ? "#FFD60020" : "#7C4DFF20",
                    color: t.approvalRole ? "#FFD600" : "#B388FF",
                    fontWeight: 600
                  }}
                />
              </TableCell>

              {/* Approval Level */}
              <TableCell>
                <Chip
                  size="small"
                  label={t.approvalLevel || "-"}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              {/* Status */}
              <TableCell>
                <Chip
                  size="small"
                  label={t.status || "PENDING"}
                  color={
                    t.status === "APPROVED"
                      ? "success"
                      : t.status === "REJECTED"
                      ? "error"
                      : "warning"
                  }
                  variant="outlined"
                />
              </TableCell>

              {/* Actions */}
              <TableCell>
                {onApprove && onReject ? (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onApprove(t.tradeId)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onReject(t.tradeId)}
                    >
                      Reject
                    </Button>
                  </Stack>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Drill-down only */}
      <TradeDrilldownModal
        trade={selectedTrade}
        open={Boolean(selectedTrade)}
        onClose={() => setSelectedTrade(null)}
      />
    </>
  );
}

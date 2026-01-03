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
import TradeLifecycleActions from "./TradeLifecycleActions";

/**
 * Endur-style Trade Table (Blotter)
 */
export default function TradeTable({
  trades,
  onApprove,
  onReject,
  onSelectTrade, // 👈 parent decides what to do
  onRefresh, // 👈 callback to refresh trade list after lifecycle action
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
          <TableRow sx={{ backgroundColor: "#1B1F3B" }}>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Trade ID</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Instrument</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Commodity</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Type</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">Qty</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">Price</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Trade Date</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">MTM</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">Delta</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">Gamma</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">Vega</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Match Rule</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Pending Approval</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Level</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Created By</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {trades?.map((t) => (
            <TableRow
              key={t.tradeId}
              hover
              sx={{ 
                cursor: "pointer",
                borderBottom: "1px solid #252862",
                "&:hover": { backgroundColor: "#1B1F3B" }
              }}
              onDoubleClick={() => handleSelect(t)}
            >
              <TableCell sx={{ color: "#EDE7F6", fontFamily: "monospace" }}>
                {t.tradeId?.substring(0, 13)}...
              </TableCell>
              <TableCell sx={{ color: "#EDE7F6" }}>{t.instrumentCode || t.instrumentSymbol}</TableCell>
              <TableCell sx={{ color: "#EDE7F6" }}>{t.commodity || "-"}</TableCell>
              <TableCell sx={{ color: "#EDE7F6" }}>{t.instrumentType || "-"}</TableCell>
              <TableCell align="right" sx={{ color: "#EDE7F6" }}>{t.quantity?.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                ${t.tradePrice || t.price}
              </TableCell>
              <TableCell sx={{ color: "#EDE7F6" }}>{t.tradeDate || "-"}</TableCell>

              {/* MTM */}
              <TableCell align="right">
                <Chip
                  size="small"
                  label={t.mtm != null ? `$${t.mtm.toLocaleString()}` : "N/A"}
                  color={t.mtm >= 0 ? "success" : "error"}
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              {/* Greeks */}
              <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                {t.delta != null ? t.delta.toFixed(2) : "-"}
              </TableCell>
              <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                {t.gamma != null ? t.gamma.toFixed(4) : "-"}
              </TableCell>
              <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                {t.vega != null ? t.vega.toFixed(2) : "-"}
              </TableCell>

              {/* Match Rule Name */}
              <TableCell>
                {t.matchRuleName ? (
                  <Chip
                    size="small"
                    label={t.matchRuleName}
                    sx={{
                      backgroundColor: "#9C27B020",
                      color: "#CE93D8",
                      fontWeight: 600,
                      border: "1px solid #9C27B060"
                    }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label="-"
                    variant="outlined"
                    sx={{ color: "#B0BEC5" }}
                  />
                )}
              </TableCell>

              {/* Pending Approval Role */}
              <TableCell>
                {t.pendingApprovalRole ? (
                  <Chip
                    size="small"
                    label={t.pendingApprovalRole}
                    sx={{
                      backgroundColor: "#FFD60020",
                      color: "#FFD600",
                      fontWeight: 600,
                      border: "1px solid #FFD60060"
                    }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label="-"
                    variant="outlined"
                    sx={{ color: "#B0BEC5" }}
                  />
                )}
              </TableCell>

              {/* Approval Level */}
              <TableCell>
                <Chip
                  size="small"
                  label={t.currentApprovalLevel || t.approvalLevel || "-"}
                  variant="outlined"
                  sx={{ fontWeight: 600, color: "#B388FF" }}
                />
              </TableCell>

              {/* Created By */}
              <TableCell sx={{ color: "#EDE7F6" }}>
                {t.createdBy || "-"}
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
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>

              {/* Actions */}
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  {onApprove && onReject ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onApprove(t.tradeId)}
                        sx={{ textTransform: "none" }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onReject(t.tradeId)}
                        sx={{ textTransform: "none" }}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  <TradeLifecycleActions trade={t} onActionComplete={onRefresh} />
                </Stack>
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

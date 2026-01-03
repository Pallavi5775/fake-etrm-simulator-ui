import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Multi-Leg Trade Valuation Modal - Endur Style
 */
export default function MultiLegValuationModal({ open, onClose, valuation }) {
  if (!valuation) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const formatNumber = (value, decimals = 4) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value || 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
          borderBottom: "1px solid #252862",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
            Multi-Leg Trade Valuation
          </Typography>
          <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
            Trade ID: {valuation.tradeId}
          </Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: "#EDE7F6" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#0F1020" }}>
        {/* Strategy Summary */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            border: "1px solid #252862"
          }}
        >
          <Stack direction="row" spacing={4} alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                Strategy Type
              </Typography>
              <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
                <Chip
                  label={valuation.strategyType}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "#252862" }} />

            <Box>
              <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                Valuation Date
              </Typography>
              <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
                {valuation.valuationDate}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "#252862" }} />

            <Box>
              <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                Pricing Model
              </Typography>
              <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
                {valuation.pricingModel}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: "#252862" }} />

            <Box>
              <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                Total MTM
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: valuation.totalMtm >= 0 ? "#00C853" : "#FF5252",
                  fontWeight: 700
                }}
              >
                {formatCurrency(valuation.totalMtm)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "#B0BEC5" }}>
                Total P&L
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: valuation.totalPnl >= 0 ? "#00C853" : "#FF5252",
                  fontWeight: 700
                }}
              >
                {formatCurrency(valuation.totalPnl)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Leg Valuations Table */}
        <Typography variant="h6" sx={{ mb: 2, color: "#EDE7F6" }}>
          Individual Leg Valuations
        </Typography>

        <Paper
          sx={{
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            border: "1px solid #252862",
            overflow: "hidden"
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1B1F3B" }}>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Leg</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Instrument</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Side</TableCell>
                <TableCell align="right" sx={{ color: "#B388FF", fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ color: "#B388FF", fontWeight: 600 }}>
                  Trade Price
                </TableCell>
                <TableCell align="right" sx={{ color: "#B388FF", fontWeight: 600 }}>
                  Market Price
                </TableCell>
                <TableCell align="right" sx={{ color: "#B388FF", fontWeight: 600 }}>
                  MTM
                </TableCell>
                <TableCell align="right" sx={{ color: "#B388FF", fontWeight: 600 }}>
                  P&L
                </TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Delivery</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {valuation.legValuations?.map((leg) => (
                <TableRow
                  key={leg.legNumber}
                  hover
                  sx={{
                    borderBottom: "1px solid #252862",
                    "&:hover": {
                      backgroundColor: "#1B1F3B"
                    }
                  }}
                >
                  <TableCell>
                    <Chip
                      label={`Leg ${leg.legNumber}`}
                      size="small"
                      sx={{
                        backgroundColor: "#7C4DFF20",
                        color: "#B388FF",
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6", fontWeight: 600 }}>
                    {leg.instrumentCode}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={leg.buySell}
                      size="small"
                      color={leg.buySell === "BUY" ? "success" : "error"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                    {formatNumber(leg.quantity, 2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                    ${formatNumber(leg.tradePrice, 2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#EDE7F6" }}>
                    ${formatNumber(leg.marketPrice, 2)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(leg.mtm)}
                      size="small"
                      sx={{
                        backgroundColor:
                          leg.mtm >= 0 ? "#00C85320" : "#FF525220",
                        color: leg.mtm >= 0 ? "#00C853" : "#FF5252",
                        fontWeight: 700
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(leg.pnl)}
                      size="small"
                      sx={{
                        backgroundColor:
                          leg.pnl >= 0 ? "#00C85320" : "#FF525220",
                        color: leg.pnl >= 0 ? "#00C853" : "#FF5252",
                        fontWeight: 700
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#B0BEC5" }}>
                    {leg.deliveryDate || "-"}
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals Row */}
              <TableRow
                sx={{
                  backgroundColor: "#1B1F3B",
                  borderTop: "2px solid #7C4DFF"
                }}
              >
                <TableCell colSpan={6} sx={{ color: "#EDE7F6", fontWeight: 700 }}>
                  TOTAL
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      color: valuation.totalMtm >= 0 ? "#00C853" : "#FF5252",
                      fontWeight: 700
                    }}
                  >
                    {formatCurrency(valuation.totalMtm)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      color: valuation.totalPnl >= 0 ? "#00C853" : "#FF5252",
                      fontWeight: 700
                    }}
                  >
                    {formatCurrency(valuation.totalPnl)}
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </Paper>

        {/* Spread Analysis */}
        {valuation.strategyType === "CALENDAR_SPREAD" && valuation.legValuations?.length === 2 && (
          <Paper
            sx={{
              p: 2,
              mt: 3,
              background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
              border: "1px solid #252862"
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "#B388FF", mb: 1, fontWeight: 600 }}>
              📊 Spread Analysis
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#B0BEC5" }}>
                  Trade Spread:
                </Typography>
                <Typography variant="body2" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
                  ${formatNumber(
                    valuation.legValuations[0].tradePrice - valuation.legValuations[1].tradePrice,
                    2
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#B0BEC5" }}>
                  Market Spread:
                </Typography>
                <Typography variant="body2" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
                  ${formatNumber(
                    valuation.legValuations[0].marketPrice - valuation.legValuations[1].marketPrice,
                    2
                  )}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#B0BEC5" }}>
                  Spread P&L:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: valuation.totalPnl >= 0 ? "#00C853" : "#FF5252",
                    fontWeight: 700
                  }}
                >
                  {formatCurrency(valuation.totalPnl)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}
      </DialogContent>
    </Dialog>
  );
}

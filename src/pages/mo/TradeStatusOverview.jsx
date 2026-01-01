import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import TradeTable from "../../components/TradeTable";
import TradeDrilldownModal from "../../components/TradeDrilldownModal";
import { fetchApprovedTrades, fetchRejectedTrades } from "../../api/tradeApi";

/**
 * Trade Status Overview - Shows Trade Blotter and Rejected Trade Audit
 */
export default function TradeStatusOverview() {
  const [currentTab, setCurrentTab] = useState(0);
  const [allTrades, setAllTrades] = useState([]);
  const [rejectedTrades, setRejectedTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all trades
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all trades and rejected trades in parallel
      const [allTradesData, rejectedTradesData] = await Promise.all([
        fetchApprovedTrades(),
        fetchRejectedTrades(),
      ]);

      setAllTrades(allTradesData);
      setRejectedTrades(rejectedTradesData);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load trades:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSelectTrade = (trade) => {
    setSelectedTrade(trade);
  };

  const handleCloseModal = () => {
    setSelectedTrade(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading trades: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Trade Status Overview
      </Typography>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Trade Blotter</span>
                <Chip
                  label={allTrades.length}
                  size="small"
                  color="primary"
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>Rejected Trade Audit</span>
                <Chip
                  label={rejectedTrades.length}
                  size="small"
                  color="error"
                />
              </Stack>
            }
          />
        </Tabs>
      </Paper>

      {/* Trade Blotter Tab */}
      {currentTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">All Trades</Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {allTrades.length} trades
              </Typography>
            </Stack>

            {allTrades.length === 0 ? (
              <Alert severity="info">No trades found in the system</Alert>
            ) : (
              <TradeTable
                trades={allTrades}
                onSelectTrade={handleSelectTrade}
              />
            )}
          </Stack>
        </Paper>
      )}

      {/* Rejected Trade Audit Tab */}
      {currentTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Rejected Trades Audit</Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {rejectedTrades.length} rejected trades
              </Typography>
            </Stack>

            {rejectedTrades.length === 0 ? (
              <Alert severity="success">No rejected trades found</Alert>
            ) : (
              <Stack spacing={2}>
                <Alert severity="warning">
                  These trades have been rejected and require review or re-booking
                </Alert>

                <TradeTable
                  trades={rejectedTrades}
                  onSelectTrade={handleSelectTrade}
                />

                {/* Rejection Summary */}
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#fff3e0" }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Rejection Reasons Summary
                  </Typography>
                  <Stack spacing={1}>
                    {rejectedTrades.map((trade) => (
                      <Box key={trade.tradeId}>
                        <Typography variant="body2">
                          <strong>{trade.tradeId}:</strong>{" "}
                          {trade.rejectionReason || "No reason provided"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      {/* Trade Drilldown Modal */}
      {selectedTrade && (
        <TradeDrilldownModal
          trade={selectedTrade}
          open={Boolean(selectedTrade)}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
}

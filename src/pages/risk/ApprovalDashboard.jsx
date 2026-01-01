import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress
} from "@mui/material";

import TradeTable from "../../components/TradeTable";
import {
  fetchPendingApprovals,
  approveTrade,
  rejectTrade
} from "../../api/tradeApi";

/**
 * Risk – Approval Dashboard (Endur style)
 */
export default function ApprovalDashboard() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get current user
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* ===== Load pending trades ===== */
  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingApprovals();
      setTrades(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  /* ===== Approve ===== */
  const handleApprove = async (tradeId) => {
    // Find the trade to check who created it
    const trade = trades.find(t => t.tradeId === tradeId);
    
    // Client-side validation: Check if user is trying to approve their own trade
    if (trade?.createdBy === user.username || trade?.tradedBy === user.username) {
      alert(`⚠️ Self-Approval Blocked\n\nYou cannot approve your own trade.\nTrade created by: ${trade.createdBy || trade.tradedBy}\nCurrent user: ${user.username}`);
      return;
    }
    
    try {
      await approveTrade(tradeId);
      alert("✅ Trade approved successfully");
      loadTrades(); // refresh queue
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Approval failed";
      
      // Show specific error message from backend
      if (errorMessage.includes("same user") || errorMessage.includes("self-approval")) {
        alert(`⚠️ Self-Approval Denied\n\n${errorMessage}`);
      } else if (errorMessage.includes("role")) {
        alert(`⚠️ Permission Denied\n\n${errorMessage}`);
      } else {
        alert(`❌ Approval Failed\n\n${errorMessage}`);
      }
    }
  };

  /* ===== Reject ===== */
  const handleReject = async (tradeId) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // User cancelled
    
    try {
      await rejectTrade(tradeId, reason);
      alert("✅ Trade rejected successfully");
      loadTrades();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Rejection failed";
      alert(`❌ Rejection Failed\n\n${errorMessage}`);
    }
  };

  /* ===== Render ===== */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Risk Approval Queue
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TradeTable
          trades={trades}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </Box>
  );
}

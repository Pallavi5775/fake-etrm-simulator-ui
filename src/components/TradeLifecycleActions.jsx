import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, IconButton, Tooltip,
  Typography, Box, Chip, Divider, Alert
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import Toast from "./shared/Toast";

const BASE_URL = "http://localhost:8080/api";

/**
 * Trade Lifecycle Actions Component
 * Handles Cancel, Amend, Settle actions and displays audit events
 */
export default function TradeLifecycleActions({ trade, onActionComplete }) {
  const [openCancel, setOpenCancel] = useState(false);
  const [openAmend, setOpenAmend] = useState(false);
  const [openSettle, setOpenSettle] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);
  
  const [cancelData, setCancelData] = useState({
    cancelReason: "",
    cancelledBy: ""
  });
  
  const [amendData, setAmendData] = useState({
    price: trade?.tradePrice || "",
    quantity: trade?.quantity || "",
    amendReason: "",
    amendedBy: ""
  });
  
  const [settleData, setSettleData] = useState({
    settlementDate: new Date().toISOString().split('T')[0],
    settledBy: "",
    notes: ""
  });
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "X-User-Name": user.username || "",
      "X-User-Role": user.role || "",
      "Authorization": token ? `Bearer ${token}` : ""
    };
  };

  const handleCancelTrade = async () => {
    if (!cancelData.cancelReason) {
      setToast({ open: true, message: "Cancel reason is required", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BASE_URL}/trades/${trade.tradeId}/cancel`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...cancelData,
          cancelledBy: cancelData.cancelledBy || user.username
        })
      });

      if (res.ok) {
        setToast({ open: true, message: "Trade cancelled successfully", severity: "success" });
        setOpenCancel(false);
        onActionComplete?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({ open: true, message: errorData.message || "Failed to cancel trade", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, message: "Network error: " + err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAmendTrade = async () => {
    if (!amendData.amendReason) {
      setToast({ open: true, message: "Amend reason is required", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BASE_URL}/trades/${trade.tradeId}/amend`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          price: parseFloat(amendData.price),
          quantity: parseFloat(amendData.quantity),
          amendReason: amendData.amendReason,
          amendedBy: amendData.amendedBy || user.username
        })
      });

      if (res.ok) {
        setToast({ open: true, message: "Trade amended successfully", severity: "success" });
        setOpenAmend(false);
        onActionComplete?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({ open: true, message: errorData.message || "Failed to amend trade", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, message: "Network error: " + err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSettleTrade = async () => {
    if (!settleData.settlementDate) {
      setToast({ open: true, message: "Settlement date is required", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BASE_URL}/trades/${trade.tradeId}/settle`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...settleData,
          settledBy: settleData.settledBy || user.username
        })
      });

      if (res.ok) {
        setToast({ open: true, message: "Trade settled successfully", severity: "success" });
        setOpenSettle(false);
        onActionComplete?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({ open: true, message: errorData.message || "Failed to settle trade", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, message: "Network error: " + err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/trades/${trade.tradeId}/events`, {
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } else {
        setToast({ open: true, message: "Failed to load audit events", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, message: "Network error: " + err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvents = () => {
    setOpenEvents(true);
    fetchAuditEvents();
  };

  if (!trade) return null;

  return (
    <>
      {/* Action Buttons */}
      <Stack direction="row" spacing={1}>
        <Tooltip title="Amend Trade">
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setAmendData({
                price: trade.tradePrice || "",
                quantity: trade.quantity || "",
                amendReason: "",
                amendedBy: ""
              });
              setOpenAmend(true);
            }}
            disabled={trade.status === "CANCELLED" || trade.status === "SETTLED"}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settle Trade">
          <IconButton
            size="small"
            color="success"
            onClick={() => setOpenSettle(true)}
            disabled={trade.status === "CANCELLED" || trade.status === "SETTLED"}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cancel Trade">
          <IconButton
            size="small"
            color="error"
            onClick={() => setOpenCancel(true)}
            disabled={trade.status === "CANCELLED" || trade.status === "SETTLED"}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Audit Trail">
          <IconButton
            size="small"
            color="info"
            onClick={handleOpenEvents}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Cancel Dialog */}
      <Dialog open={openCancel} onClose={() => setOpenCancel(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Trade {trade.tradeId}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will cancel the trade. Please provide a reason.
          </Alert>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Cancel Reason"
              fullWidth
              multiline
              rows={3}
              value={cancelData.cancelReason}
              onChange={(e) => setCancelData({ ...cancelData, cancelReason: e.target.value })}
              required
            />
            <TextField
              label="Cancelled By"
              fullWidth
              value={cancelData.cancelledBy}
              onChange={(e) => setCancelData({ ...cancelData, cancelledBy: e.target.value })}
              helperText="Leave blank to use logged-in user"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancel(false)}>Cancel</Button>
          <Button onClick={handleCancelTrade} variant="contained" color="error" disabled={loading}>
            {loading ? "Cancelling..." : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Amend Dialog */}
      <Dialog open={openAmend} onClose={() => setOpenAmend(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Amend Trade {trade.tradeId}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={amendData.price}
              onChange={(e) => setAmendData({ ...amendData, price: e.target.value })}
              inputProps={{ step: "0.01" }}
              required
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={amendData.quantity}
              onChange={(e) => setAmendData({ ...amendData, quantity: e.target.value })}
              required
            />
            <TextField
              label="Amend Reason"
              fullWidth
              multiline
              rows={2}
              value={amendData.amendReason}
              onChange={(e) => setAmendData({ ...amendData, amendReason: e.target.value })}
              required
            />
            <TextField
              label="Amended By"
              fullWidth
              value={amendData.amendedBy}
              onChange={(e) => setAmendData({ ...amendData, amendedBy: e.target.value })}
              helperText="Leave blank to use logged-in user"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAmend(false)}>Cancel</Button>
          <Button onClick={handleAmendTrade} variant="contained" color="primary" disabled={loading}>
            {loading ? "Amending..." : "Confirm Amend"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settle Dialog */}
      <Dialog open={openSettle} onClose={() => setOpenSettle(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Settle Trade {trade.tradeId}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Settlement Date"
              type="date"
              fullWidth
              value={settleData.settlementDate}
              onChange={(e) => setSettleData({ ...settleData, settlementDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Settled By"
              fullWidth
              value={settleData.settledBy}
              onChange={(e) => setSettleData({ ...settleData, settledBy: e.target.value })}
              helperText="Leave blank to use logged-in user"
            />
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              value={settleData.notes}
              onChange={(e) => setSettleData({ ...settleData, notes: e.target.value })}
              placeholder="Physical delivery completed, payment confirmed, etc."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettle(false)}>Cancel</Button>
          <Button onClick={handleSettleTrade} variant="contained" color="success" disabled={loading}>
            {loading ? "Settling..." : "Confirm Settle"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audit Events Dialog */}
      <Dialog open={openEvents} onClose={() => setOpenEvents(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Audit Trail - {trade.tradeId}
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Loading audit events...</Typography>
            </Box>
          ) : events.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">No audit events found</Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {events.map((event, idx) => (
                <Box key={idx} sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                      label={event.eventType || "EVENT"}
                      size="small"
                      color={
                        event.eventType === "CREATED" ? "success" :
                        event.eventType === "AMENDED" ? "primary" :
                        event.eventType === "CANCELLED" ? "error" :
                        event.eventType === "SETTLED" ? "success" :
                        "default"
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : "-"}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">
                    <strong>{event.performedBy || "System"}</strong>
                  </Typography>
                  {event.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {event.description}
                    </Typography>
                  )}
                  {event.changes && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: "action.hover", borderRadius: 0.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {JSON.stringify(event.changes, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEvents(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </>
  );
}

import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function ApprovalDashboard({ userRole }) {
  const [trades, setTrades] = useState([]);
  const [rejectingTrade, setRejectingTrade] = useState(null);
  const [reason, setReason] = useState("");

  const loadApprovals = async () => {
    const res = await api.get(`/api/approvals/pending?role=${userRole}`);
    setTrades(res.data);
  };

  useEffect(() => {
    loadApprovals();
  }, [userRole]);

  const approve = async (tradeId) => {
    await api.post(`/api/approvals/${tradeId}/approve?role=${userRole}`);
    loadApprovals();
  };

  const reject = async (rejectingTrade) => {
    await api.post(`/api/approvals/${rejectingTrade}/reject?role=${userRole}`, { reason });
    setRejectingTrade(null);
    setReason("");
    loadApprovals();
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Trade</TableCell>
            <TableCell>Desk</TableCell>
            <TableCell>Event</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Requested At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {trades.map((t) => (
            <TableRow key={t.tradeId}>
              <TableCell>{t.businessTradeId}</TableCell>
              <TableCell>{t.desk}</TableCell>
              <TableCell>{t.event}</TableCell>
              <TableCell>
                <Chip label={t.status} color="warning" />
              </TableCell>
              <TableCell>{new Date(t.requestedAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  color="success"
                  variant="contained"
                  onClick={() => approve(t.tradeId)}
                  sx={{ mr: 1 }}
                >
                  Approve
                </Button>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setRejectingTrade(t.tradeId)}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Reject Dialog */}
      <Dialog open={!!rejectingTrade} onClose={() => setRejectingTrade(null)}>
        <DialogTitle>Reject Trade</DialogTitle>
        <DialogContent>
          <TextField
            label="Rejection Reason"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectingTrade(null)}>Cancel</Button>
          <Button color="error" onClick={reject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

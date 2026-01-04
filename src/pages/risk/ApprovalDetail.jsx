import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Stack, Button, Divider, Grid,
  Card, CardContent, TextField, Chip, Alert,
  useMediaQuery, useTheme
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

import apiConfig from '../../config/apiConfig';
const BASE_URL = apiConfig.baseURL;

/**
 * Approval Detail View - Shows full trade details with approval actions
 */
export default function ApprovalDetail() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { approvalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!location.state?.approval);
  const [approval, setApproval] = useState(location.state?.approval || null);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  useEffect(() => {
    if (!approval) {
      fetchApprovalDetail();
    }
  }, [approvalId]);

  const fetchApprovalDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/approval/${approvalId}`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setApproval(data);
      } else {
        setError("Failed to load approval details");
      }
    } catch (err) {
      console.error("Error fetching approval:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/approval/${approvalId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          approvedBy: user.username,
          comments: comments || "Approved from detail view"
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: "Trade approved successfully",
          severity: "success"
        });
        setTimeout(() => navigate("/risk/approvals"), 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to approve",
          severity: "error"
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Network error: " + err.message,
        severity: "error"
      });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setToast({
        open: true,
        message: "Rejection reason is required",
        severity: "warning"
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/approval/${approvalId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          rejectedBy: user.username,
          reason: rejectReason
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: "Trade rejected successfully",
          severity: "info"
        });
        setTimeout(() => navigate("/risk/approvals"), 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to reject",
          severity: "error"
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Network error: " + err.message,
        severity: "error"
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading approval details..." />;
  }

  if (error || !approval) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Approval not found"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/risk/approvals")}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const trade = approval.trade || {};
  // Support for multi-condition, multi-level approval
  // approval.conditions: [{ field, operator, value, met }]
  // approval.routing: [{ approvalRole, approvalLevel, status, actedBy, comments, timestamp }]
  const conditions = approval.conditions || [
    {
      field: approval.conditionField,
      operator: approval.conditionOperator,
      value: approval.conditionValue,
      met: approval.conditionMet !== undefined ? approval.conditionMet : true
    }
  ];
  const routing = approval.routing || [
    {
      approvalRole: approval.approvalRole,
      approvalLevel: approval.approvalLevel,
      status: approval.status,
      actedBy: approval.approvedBy || approval.rejectedBy,
      comments: approval.comments,
      timestamp: approval.approvalTimestamp,
      rejectionReason: approval.rejectionReason
    }
  ];
  const isPending = routing.some(r => r.status === "PENDING");

  return (
    <Box sx={{ p: isMobile ? 1 : 3, maxWidth: 1400, mx: "auto" }}>
      {/* Header */}
      <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "stretch" : "center"} sx={{ mb: 3, gap: 2 }}>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} alignItems={isMobile ? "stretch" : "center"}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/risk/approvals")}
            fullWidth={isMobile}
          >
            Back
          </Button>
          <Typography variant={isMobile ? "h5" : "h4"}>
            Approval Detail #{approval.id}
          </Typography>
          <Chip
            label={approval.status}
            color={
              approval.status === "PENDING" ? "warning" :
              approval.status === "APPROVED" ? "success" :
              "error"
            }
          />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left Column - Trade Details */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Trade Summary */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📋 Trade Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Trade ID
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {trade.tradeId}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    <Chip label={trade.status} size="small" />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Portfolio
                  </Typography>
                  <Typography variant="body1">{trade.portfolio}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Counterparty
                  </Typography>
                  <Typography variant="body1">{trade.counterparty}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Commodity
                  </Typography>
                  <Typography variant="body1">{trade.commodity || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1">
                    {trade.quantity} {trade.unit || ""}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Buy/Sell
                  </Typography>
                  <Typography variant="body1">
                    <Chip
                      label={trade.buySell}
                      size="small"
                      color={trade.buySell === "BUY" ? "primary" : "secondary"}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body1">
                    ${trade.price?.toFixed(2) || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Valuation Details */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                💰 Valuation
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Mark-to-Market
                      </Typography>
                      <Typography
                        variant="h5"
                        color={trade.mtm >= 0 ? "success.main" : "error.main"}
                        fontWeight="bold"
                      >
                        {trade.mtm?.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Delta
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {trade.delta?.toFixed(4) || "N/A"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Gamma
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {trade.gamma?.toFixed(6) || "N/A"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Trade Dates */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                📅 Important Dates
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Trade Date
                  </Typography>
                  <Typography variant="body1">
                    {trade.tradeDate || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Settlement Date
                  </Typography>
                  <Typography variant="body1">
                    {trade.settlementDate || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {trade.startDate || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {trade.endDate || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Column - Approval Info & Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Approval Rule & Conditions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⚙️ Approval Rule
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rule Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {approval.ruleName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Trigger Reason
                  </Typography>
                  <Typography variant="body2">
                    {approval.reason || "Rule condition met"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Conditions
                  </Typography>
                  <Stack spacing={0.5}>
                    {conditions.map((cond, idx) => (
                      <Chip
                        key={idx}
                        label={`${cond.field} ${cond.operator} ${cond.value} (${cond.met ? 'Met' : 'Not Met'})`}
                        color={cond.met ? 'success' : 'warning'}
                        size="small"
                        sx={{ mr: 1, mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Approval Actions for Each Pending Level/Role */}
            {isPending && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  🎯 Pending Approvals
                </Typography>
                <Stack spacing={2}>
                  {routing.map((route, idx) => {
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    const canAct = route.status === "PENDING" && user.role === route.approvalRole;
                    return (
                      <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                        <Typography variant="subtitle2">
                          {route.approvalRole} (Level {route.approvalLevel})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Status: <Chip label={route.status} color={route.status === 'PENDING' ? 'warning' : (route.status === 'APPROVED' ? 'success' : 'error')} size="small" />
                        </Typography>
                        {canAct && (
                          <Stack spacing={1} sx={{ mt: 2 }}>
                            <TextField
                              label="Comments (optional)"
                              multiline
                              rows={2}
                              fullWidth
                              value={comments}
                              onChange={e => setComments(e.target.value)}
                              placeholder="Add any notes about your decision..."
                            />
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              fullWidth
                              size="large"
                              onClick={() => setConfirmDialog({ open: true, action: `approve_${idx}` })}
                            >
                              Approve
                            </Button>
                            <Divider>OR</Divider>
                            <TextField
                              label="Rejection Reason (required)"
                              multiline
                              rows={2}
                              fullWidth
                              required
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Why are you rejecting this approval?"
                              error={!rejectReason}
                            />
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              fullWidth
                              size="large"
                              onClick={() => setConfirmDialog({ open: true, action: `reject_${idx}` })}
                              disabled={!rejectReason.trim()}
                            >
                              Reject
                            </Button>
                          </Stack>
                        )}
                        {route.status !== "PENDING" && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Acted By: {route.actedBy || "-"}
                            </Typography>
                            {route.comments && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Comments: {route.comments}
                              </Typography>
                            )}
                            {route.rejectionReason && (
                              <Typography variant="caption" color="error" display="block">
                                Rejection Reason: {route.rejectionReason}
                              </Typography>
                            )}
                            {route.timestamp && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Time: {new Date(route.timestamp).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            )}

            {/* Approval History for All Levels */}
            {!isPending && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📜 Decision History
                </Typography>
                <Stack spacing={2}>
                  {routing.map((route, idx) => (
                    <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                      <Typography variant="subtitle2">
                        {route.approvalRole} (Level {route.approvalLevel})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: <Chip label={route.status} color={route.status === 'APPROVED' ? 'success' : (route.status === 'REJECTED' ? 'error' : 'warning')} size="small" />
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Acted By: {route.actedBy || "-"}
                        </Typography>
                        {route.comments && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Comments: {route.comments}
                          </Typography>
                        )}
                        {route.rejectionReason && (
                          <Typography variant="caption" color="error" display="block">
                            Rejection Reason: {route.rejectionReason}
                          </Typography>
                        )}
                        {route.timestamp && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Time: {new Date(route.timestamp).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === "approve"}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        onConfirm={() => {
          setConfirmDialog({ open: false, action: null });
          handleApprove();
        }}
        title="Confirm Approval"
        message={`Are you sure you want to approve Trade ${trade.tradeId}?`}
        confirmText="Approve"
        confirmColor="success"
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.action === "reject"}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        onConfirm={() => {
          setConfirmDialog({ open: false, action: null });
          handleReject();
        }}
        title="Confirm Rejection"
        message={`Are you sure you want to reject Trade ${trade.tradeId}? This action cannot be undone.`}
        confirmText="Reject"
        confirmColor="error"
      />

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}

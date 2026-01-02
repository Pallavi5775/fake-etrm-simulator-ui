import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, Chip, IconButton,
  TextField, MenuItem, Alert, Card, CardContent, Grid
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/shared/DataTable";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";

const BASE_URL = "http://localhost:8080/api";

const FILTER_OPTIONS = {
  status: ["PENDING", "APPROVED", "REJECTED"],
  approvalRole: ["TRADER", "RISK_MANAGER", "OPERATIONS", "SENIOR_TRADER"]
};

/**
 * Enhanced Risk Approval Dashboard with filtering, summary cards, and quick actions
 */
export default function ApprovalDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "PENDING",
    approvalRole: "",
    portfolio: "",
    minMtm: "",
    maxMtm: ""
  });
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [summary, setSummary] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalMtm: 0
  });

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/approval/pending`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
        calculateSummary(data);
      } else {
        setError("Failed to load approvals");
      }
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {
    const pending = data.filter(a => a.status === "PENDING").length;
    const approved = data.filter(a => a.status === "APPROVED").length;
    const rejected = data.filter(a => a.status === "REJECTED").length;
    const totalMtm = data.reduce((sum, a) => sum + (a.trade?.mtm || 0), 0);

    setSummary({ pending, approved, rejected, totalMtm });
  };

  const handleQuickApprove = async (approvalId, tradeId) => {
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
          comments: "Quick approval from dashboard"
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: `Trade ${tradeId} approved successfully`,
          severity: "success"
        });
        fetchApprovals(); // Refresh list
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

  const handleQuickReject = async (approvalId, tradeId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

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
          reason: reason
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: `Trade ${tradeId} rejected`,
          severity: "info"
        });
        fetchApprovals(); // Refresh list
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

  const handleViewDetail = (approval) => {
    navigate(`/risk/approval/${approval.id}`, { state: { approval } });
  };

  const getFilteredApprovals = () => {
    return approvals.filter(approval => {
      if (filters.status && approval.status !== filters.status) return false;
      if (filters.approvalRole && approval.approvalRole !== filters.approvalRole) return false;
      if (filters.portfolio && approval.trade?.portfolio !== filters.portfolio) return false;
      
      const mtm = approval.trade?.mtm || 0;
      if (filters.minMtm && mtm < parseFloat(filters.minMtm)) return false;
      if (filters.maxMtm && mtm > parseFloat(filters.maxMtm)) return false;

      return true;
    });
  };

  const columns = [
    {
      field: "id",
      label: "ID",
      sortable: true
    },
    {
      field: "tradeId",
      label: "Trade ID",
      sortable: true,
      render: (val, row) => row.trade?.tradeId || val
    },
    {
      field: "status",
      label: "Status",
      sortable: true,
      render: (val) => (
        <Chip
          label={val}
          size="small"
          color={
            val === "PENDING" ? "warning" :
            val === "APPROVED" ? "success" :
            "error"
          }
        />
      )
    },
    {
      field: "approvalRole",
      label: "Required Role",
      sortable: true
    },
    {
      field: "portfolio",
      label: "Portfolio",
      sortable: true,
      render: (val, row) => row.trade?.portfolio || "-"
    },
    {
      field: "counterparty",
      label: "Counterparty",
      sortable: true,
      render: (val, row) => row.trade?.counterparty || "-"
    },
    {
      field: "mtm",
      label: "MTM (USD)",
      sortable: true,
      render: (val, row) => {
        const mtm = row.trade?.mtm || 0;
        return (
          <Typography
            variant="body2"
            color={mtm >= 0 ? "success.main" : "error.main"}
            fontWeight="bold"
          >
            {mtm.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0
            })}
          </Typography>
        );
      }
    },
    {
      field: "ruleName",
      label: "Rule",
      sortable: true
    },
    {
      field: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      render: (val, row) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetail(row);
            }}
            title="View Details"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {row.status === "PENDING" && (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickApprove(row.id, row.trade?.tradeId);
                }}
                title="Quick Approve"
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickReject(row.id, row.trade?.tradeId);
                }}
                title="Quick Reject"
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Stack>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Loading approvals..." />;
  }

  const filteredApprovals = getFilteredApprovals();

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          ✅ Approval Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchApprovals}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summary.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">
                {summary.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" color="error.main">
                {summary.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total MTM
              </Typography>
              <Typography variant="h4" color={summary.totalMtm >= 0 ? "success.main" : "error.main"}>
                {summary.totalMtm.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="Status"
              fullWidth
              size="small"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {FILTER_OPTIONS.status?.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              label="Approval Role"
              fullWidth
              size="small"
              value={filters.approvalRole}
              onChange={e => setFilters({ ...filters, approvalRole: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {FILTER_OPTIONS.approvalRole?.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              label="Portfolio"
              fullWidth
              size="small"
              value={filters.portfolio}
              onChange={e => setFilters({ ...filters, portfolio: e.target.value })}
              placeholder="e.g., CRUDE_FO"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              label="Min MTM"
              type="number"
              fullWidth
              size="small"
              value={filters.minMtm}
              onChange={e => setFilters({ ...filters, minMtm: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              label="Max MTM"
              type="number"
              fullWidth
              size="small"
              value={filters.maxMtm}
              onChange={e => setFilters({ ...filters, maxMtm: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Approvals Table */}
      <DataTable
        columns={columns}
        rows={filteredApprovals}
        defaultSortBy="id"
        defaultSortDirection="desc"
        pageSize={25}
        onRowClick={handleViewDetail}
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

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
  const [statuses, setStatuses] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [filters, setFilters] = useState({
    status: "PENDING_APPROVAL",
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
    fetchStatuses();
    fetchPortfolios();
  }, []);

  const fetchStatuses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/trades/statuses`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Backend returns [{name, code}], extract as array of objects
        setStatuses(Array.isArray(data) ? data : [
          {name: "Pending Approval", code: "PENDING_APPROVAL"},
          {name: "Approved", code: "APPROVED"},
          {name: "Rejected", code: "REJECTED"}
        ]);
      } else {
        // Backend endpoint not available, use defaults
        setStatuses([
          {name: "Pending Approval", code: "PENDING_APPROVAL"},
          {name: "Approved", code: "APPROVED"},
          {name: "Rejected", code: "REJECTED"}
        ]);
      }
    } catch (err) {
      console.error("Error fetching statuses:", err);
      // Fallback to default statuses
      setStatuses([
        {name: "Pending Approval", code: "PENDING_APPROVAL"},
        {name: "Approved", code: "APPROVED"},
        {name: "Rejected", code: "REJECTED"}
      ]);
    }
  };

  const fetchPortfolios = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/portfolios`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching portfolios:", err);
      setPortfolios([]);
    }
  };

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const userRole = user.role || "RISK";

      const res = await fetch(`${BASE_URL}/trades/approval/pending?role=${userRole}`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": userRole,
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
    const pending = data.filter(t => t.status === "PENDING_APPROVAL").length;
    const approved = data.filter(t => t.status === "APPROVED").length;
    const rejected = data.filter(t => t.status === "REJECTED").length;
    const totalMtm = data.reduce((sum, t) => sum + (t.mtm || 0), 0);

    setSummary({ pending, approved, rejected, totalMtm });
  };

  const handleQuickApprove = async (tradeId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const trade = approvals.find(t => t.tradeId === tradeId);

      const res = await fetch(`${BASE_URL}/trades/${tradeId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          approvedBy: user.username,
          comments: "Quick approval from dashboard",
          pnlDate: trade?.pnlDate || new Date().toISOString().split('T')[0]
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

  const handleQuickReject = async (tradeId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const trade = approvals.find(t => t.tradeId === tradeId);

      const res = await fetch(`${BASE_URL}/trades/${tradeId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          rejectedBy: user.username,
          reason: reason,
          pnlDate: trade?.pnlDate || new Date().toISOString().split('T')[0]
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

  const handleViewDetail = (trade) => {
    navigate(`/trade/${trade.tradeId}`, { state: { trade } });
  };

  const getFilteredApprovals = () => {
    return approvals.filter(trade => {
      if (filters.status && trade.status !== filters.status) return false;
      if (filters.approvalRole && trade.pendingApprovalRole !== filters.approvalRole) return false;
      if (filters.portfolio && trade.portfolio !== filters.portfolio) return false;
      
      const mtm = trade.mtm || 0;
      if (filters.minMtm && mtm < parseFloat(filters.minMtm)) return false;
      if (filters.maxMtm && mtm > parseFloat(filters.maxMtm)) return false;

      return true;
    });
  };

  const columns = [
    {
      field: "tradeId",
      label: "Trade ID",
      sortable: true,
      render: (val) => (
        <Typography variant="body2" fontFamily="monospace">
          {val?.substring(0, 13)}...
        </Typography>
      )
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
            val === "PENDING_APPROVAL" ? "warning" :
            val === "APPROVED" ? "success" :
            "error"
          }
        />
      )
    },
    {
      field: "pendingApprovalRole",
      label: "Required Role",
      sortable: true
    },
    {
      field: "portfolio",
      label: "Portfolio",
      sortable: true
    },
    {
      field: "counterparty",
      label: "Counterparty",
      sortable: true
    },
    {
      field: "instrumentSymbol",
      label: "Instrument",
      sortable: true,
      render: (val) => (
        <Typography variant="body2" fontFamily="monospace">
          {val}
        </Typography>
      )
    },
    {
      field: "mtm",
      label: "MTM (USD)",
      sortable: true,
      render: (val) => {
        const mtm = val || 0;
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
      field: "pnlDate",
      label: "PnL Date",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : "-"
    },
    {
      field: "matchedRuleName",
      label: "Rule",
      sortable: true
    },
    {
      field: "currentApprovalLevel",
      label: "Level",
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
          {row.status === "PENDING_APPROVAL" && (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickApprove(row.tradeId);
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
                  handleQuickReject(row.tradeId);
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
          onClick={() => {
            fetchApprovals();
            fetchStatuses();
            fetchPortfolios();
          }}
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
              SelectProps={{
                onOpen: fetchStatuses
              }}
            >
              <MenuItem value="">All</MenuItem>
              {statuses?.map(opt => (
                <MenuItem key={opt.code} value={opt.code}>{opt.name}</MenuItem>
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
              select
              label="Portfolio"
              fullWidth
              size="small"
              value={filters.portfolio}
              onChange={e => setFilters({ ...filters, portfolio: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {portfolios?.map(p => (
                <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>
              ))}
            </TextField>
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
        defaultSortBy="tradeId"
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

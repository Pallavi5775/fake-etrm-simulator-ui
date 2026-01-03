import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Alert, Chip, Grid, Tabs, Tab
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import DataTable from "../../components/shared/DataTable";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";

const BASE_URL = "http://localhost:8080/api";

/**
 * Forward Curves Configuration - Manage forward curve points for pricing
 */
export default function ForwardCurvesConfig() {
  const [loading, setLoading] = useState(true);
  const [curves, setCurves] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    instrumentCode: "",
    deliveryDate: "",
    price: ""
  });
  
  // Bulk upload state
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [bulkInstrument, setBulkInstrument] = useState("");

  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInstruments();
  }, []);

  useEffect(() => {
    if (selectedInstrument) {
      fetchCurvesByInstrument(selectedInstrument);
    } else {
      setCurves([]);
      setLoading(false);
    }
  }, [selectedInstrument]);

  const fetchInstruments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/forward-curves/instruments`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setInstruments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching instruments:", err);
      setError("Failed to load instruments");
    }
  };

  const fetchCurvesByInstrument = async (instrumentCode) => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/forward-curves/instrument/${instrumentCode}`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCurves(Array.isArray(data) ? data : []);
      } else {
        setError("Failed to load forward curves");
      }
    } catch (err) {
      console.error("Error fetching curves:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (curve = null) => {
    if (curve) {
      setEditMode(true);
      setFormData({
        instrumentCode: curve.instrumentCode,
        deliveryDate: curve.deliveryDate,
        price: curve.price
      });
    } else {
      setEditMode(false);
      setFormData({
        instrumentCode: selectedInstrument || "",
        deliveryDate: "",
        price: ""
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ instrumentCode: "", deliveryDate: "", price: "" });
  };

  const handleSave = async () => {
    if (!formData.instrumentCode || !formData.deliveryDate || !formData.price) {
      setToast({
        open: true,
        message: "All fields are required",
        severity: "error"
      });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/forward-curves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          createdByUser: user.username || "UNKNOWN"
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: editMode ? "Curve point updated successfully" : "Curve point created successfully",
          severity: "success"
        });
        handleCloseDialog();
        fetchCurvesByInstrument(formData.instrumentCode);
        fetchInstruments(); // Refresh instruments list
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to save curve point",
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

  const handleDelete = async (instrumentCode, deliveryDate) => {
    if (!window.confirm(`Delete curve point for ${instrumentCode} on ${deliveryDate}?`)) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${BASE_URL}/forward-curves?instrumentCode=${instrumentCode}&deliveryDate=${deliveryDate}`,
        {
          method: "DELETE",
          headers: {
            "X-User-Name": user.username || "",
            "X-User-Role": user.role || "",
            "Authorization": token ? `Bearer ${token}` : ""
          }
        }
      );

      if (res.ok) {
        setToast({
          open: true,
          message: "Curve point deleted successfully",
          severity: "success"
        });
        fetchCurvesByInstrument(instrumentCode);
        fetchInstruments(); // Refresh instruments list
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Failed to delete curve point",
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

  const handleBulkUpload = async () => {
    if (!bulkInstrument || !bulkData.trim()) {
      setToast({
        open: true,
        message: "Instrument and data are required",
        severity: "error"
      });
      return;
    }

    try {
      // Parse CSV format: deliveryDate,price
      const lines = bulkData.trim().split('\n');
      const points = [];
      
      for (let line of lines) {
        const [deliveryDate, price] = line.split(',').map(s => s.trim());
        if (deliveryDate && price) {
          points.push({
            instrumentCode: bulkInstrument,
            deliveryDate,
            price: parseFloat(price)
          });
        }
      }

      if (points.length === 0) {
        setToast({
          open: true,
          message: "No valid data found. Format: deliveryDate,price (one per line)",
          severity: "error"
        });
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/forward-curves/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          points,
          createdByUser: user.username || "UNKNOWN"
        })
      });

      if (res.ok) {
        setToast({
          open: true,
          message: `${points.length} curve points uploaded successfully`,
          severity: "success"
        });
        setOpenBulkDialog(false);
        setBulkData("");
        fetchCurvesByInstrument(bulkInstrument);
        fetchInstruments();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({
          open: true,
          message: errorData.message || "Bulk upload failed",
          severity: "error"
        });
      }
    } catch (err) {
      setToast({
        open: true,
        message: "Upload error: " + err.message,
        severity: "error"
      });
    }
  };

  const columns = [
    {
      field: "instrumentCode",
      label: "Instrument",
      sortable: true,
      render: (val) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
          {val}
        </Typography>
      )
    },
    {
      field: "deliveryDate",
      label: "Delivery Date",
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString()
    },
    {
      field: "price",
      label: "Price (USD)",
      sortable: true,
      render: (val) => (
        <Typography variant="body2" fontWeight="bold">
          ${val.toFixed(2)}
        </Typography>
      )
    },
    {
      field: "lastUpdated",
      label: "Last Updated",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleString() : "-"
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
              handleOpenDialog(row);
            }}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.instrumentCode, row.deliveryDate);
            }}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          📈 Forward Curves Configuration
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchInstruments();
              if (selectedInstrument) fetchCurvesByInstrument(selectedInstrument);
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenBulkDialog(true)}
            color="secondary"
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Curve Point
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Curve Management" />
          <Tab label={`Instruments (${instruments.length})`} />
        </Tabs>
      </Paper>

      {/* Tab 0: Curve Management */}
      {tabValue === 0 && (
        <>
          {/* Instrument Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Select Instrument"
                  fullWidth
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                >
                  <MenuItem value="">-- Select Instrument --</MenuItem>
                  {instruments.map((inst) => (
                    <MenuItem key={inst} value={inst}>
                      {inst}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Chip
                  label={`${curves.length} curve points`}
                  color="primary"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Curves Table */}
          {loading ? (
            <LoadingSpinner message="Loading forward curves..." />
          ) : selectedInstrument ? (
            <DataTable
              columns={columns}
              rows={curves}
              defaultSortBy="deliveryDate"
              defaultSortDirection="asc"
              pageSize={25}
            />
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Select an instrument to view forward curve points
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Tab 1: Instruments List */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Instruments with Forward Curves
          </Typography>
          <Grid container spacing={2}>
            {instruments.map((inst) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={inst}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" }
                  }}
                  onClick={() => {
                    setSelectedInstrument(inst);
                    setTabValue(0);
                  }}
                >
                  <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
                    {inst}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          {instruments.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No instruments with forward curves found
            </Typography>
          )}
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Curve Point" : "Add Curve Point"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Instrument Code"
              fullWidth
              value={formData.instrumentCode}
              onChange={(e) => setFormData({ ...formData, instrumentCode: e.target.value })}
              disabled={editMode}
              required
            />
            <TextField
              label="Delivery Date"
              type="date"
              fullWidth
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              disabled={editMode}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Price (USD)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              inputProps={{ step: "0.01" }}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Forward Curves</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Instrument Code"
              fullWidth
              value={bulkInstrument}
              onChange={(e) => setBulkInstrument(e.target.value)}
              required
            />
            <TextField
              label="Curve Data"
              fullWidth
              multiline
              rows={10}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder="Enter data in CSV format (one per line):&#10;2026-01-15,75.50&#10;2026-02-15,76.20&#10;2026-03-15,77.00"
              helperText="Format: deliveryDate,price (one per line)"
              required
            />
            <Alert severity="info">
              Upload multiple curve points at once. Each line should contain: deliveryDate,price
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpload} variant="contained" startIcon={<UploadIcon />}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}

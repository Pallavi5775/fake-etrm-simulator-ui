import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Alert, Chip, Grid, Tabs, Tab, useMediaQuery, useTheme, Card, CardContent
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import DataTable from "../../components/shared/DataTable";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Toast from "../../components/shared/Toast";

import apiConfig from '../../config/apiConfig';
const BASE_URL = apiConfig.baseURL;

/**
 * Forward Curves Configuration - Manage forward curve points for pricing
 */
export default function ForwardCurvesConfig() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery(theme.breakpoints.down('sm'));
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
    price: "",
    curveDate: ""
  });
  
  // Bulk upload state
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

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
    if (!bulkFile) {
      setToast({
        open: true,
        message: "Please select a CSV file",
        severity: "error"
      });
      return;
    }

    try {
      const text = await bulkFile.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setToast({
          open: true,
          message: "CSV file must have at least a header and one data row",
          severity: "error"
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = ['instrumentCode', 'deliveryDate', 'price', 'curveDate'];
      if (!expectedHeaders.every(h => headers.includes(h))) {
        setToast({
          open: true,
          message: "CSV must have headers: instrumentCode,deliveryDate,price,curveDate",
          severity: "error"
        });
        return;
      }

      const points = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4) {
          const [instrumentCode, deliveryDate, price, curveDate] = values;
          if (instrumentCode && deliveryDate && price && curveDate) {
            points.push({
              instrumentCode,
              deliveryDate,
              price: parseFloat(price),
              curveDate
            });
          }
        }
      }

      if (points.length === 0) {
        setToast({
          open: true,
          message: "No valid data rows found in CSV",
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
        setBulkFile(null);
        fetchInstruments();
        if (selectedInstrument) {
          fetchCurvesByInstrument(selectedInstrument);
        }
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
        message: "Upload failed: " + err.message,
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
      field: "curveDate",
      label: "Curve Date",
      sortable: true,
      render: (val) => val ? new Date(val).toLocaleDateString() : ""
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
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems="center" sx={{ mb: 3, gap: isMobile ? 2 : 0 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>
          📈 Forward Curves Configuration
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} width={isMobile ? "100%" : "auto"}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchInstruments();
              if (selectedInstrument) fetchCurvesByInstrument(selectedInstrument);
            }}
            fullWidth={isMobile}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setOpenBulkDialog(true)}
            color="secondary"
            fullWidth={isMobile}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            fullWidth={isMobile}
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
          <Paper sx={{ p: isMobile ? 2 : 2, mb: 3 }}>
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
            isVerySmall ? (
              // Mobile: Card layout
              <Stack spacing={2}>
                {curves.map((curve) => (
                  <Card key={`${curve.instrumentCode}-${curve.deliveryDate}`} sx={{ backgroundColor: "#1B1F3B", border: "1px solid #252862" }}>
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Instrument</Typography>
                          <Typography sx={{ color: "#EDE7F6", fontFamily: "monospace", fontWeight: "bold" }}>{curve.instrumentCode}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Delivery Date</Typography>
                          <Typography sx={{ color: "#EDE7F6" }}>{new Date(curve.deliveryDate).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Price</Typography>
                          <Typography sx={{ color: "#EDE7F6", fontWeight: "bold" }}>${curve.price.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                          <Typography sx={{ color: "#EDE7F6" }}>{curve.lastUpdated ? new Date(curve.lastUpdated).toLocaleString() : "-"}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">Actions</Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(curve)}
                              title="Edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(curve.instrumentCode, curve.deliveryDate)}
                              title="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <DataTable
                columns={columns}
                rows={curves}
                defaultSortBy="deliveryDate"
                defaultSortDirection="asc"
                pageSize={25}
              />
            )
          ) : (
            <Paper sx={{ p: isMobile ? 2 : 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Select an instrument to view forward curve points
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Tab 1: Instruments List */}
      {tabValue === 1 && (
        <Paper sx={{ p: isMobile ? 2 : 3 }}>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>{editMode ? "Edit Curve Point" : "Add Curve Point"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, p: isMobile ? 1 : 0 }}>
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
            <TextField
              label="Curve Date"
              type="date"
              fullWidth
              value={formData.curveDate}
              onChange={(e) => setFormData({ ...formData, curveDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
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
      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>Upload Forward Curves CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, p: isMobile ? 1 : 0 }}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setBulkFile(e.target.files[0])}
              style={{ marginBottom: 16 }}
            />
            <Alert severity="info">
              Upload a CSV file with headers: instrumentCode,deliveryDate,price,curveDate
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

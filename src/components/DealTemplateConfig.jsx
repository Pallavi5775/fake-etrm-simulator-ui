import { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Switch, Chip, Paper, Button, Dialog, TextField,
  Stack, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Alert, CircularProgress
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

const BASE_URL = "http://localhost:8080/api/templates";
const INSTRUMENTS_URL = "http://localhost:8080/api/instruments";

export default function DealTemplateList() {
  const [templates, setTemplates] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    templateName: "",
    instrumentId: "",
    defaultQuantity: "",
    defaultPrice: "",
    autoApprovalAllowed: false
  });

  useEffect(() => {
    fetchTemplates();
    loadInstruments();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const loadInstruments = async () => {
    try {
      const response = await fetch(INSTRUMENTS_URL);
      if (response.ok) {
        const data = await response.json();
        setInstruments(data);
      }
    } catch (error) {
      console.error("Failed to load instruments:", error);
    }
  };

  const toggleAutoApproval = async (templateId, currentValue) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const newValue = !currentValue;
      const res = await fetch(
        `${BASE_URL}/${templateId}/auto-approval?enabled=${newValue}`,
        {
          method: "PATCH",
          headers: {
            "X-User-Name": user.username || "",
            "X-User-Role": user.role || "",
            "Authorization": token ? `Bearer ${token}` : ""
          }
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setTemplates(prev => prev.map(t => t.id === templateId ? updated : t));
      }
    } catch (error) {
      console.error("Error toggling auto-approval:", error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      templateName: "",
      instrumentId: "",
      defaultQuantity: "",
      defaultPrice: "",
      autoApprovalAllowed: false
    });
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleCreateTemplate = async () => {
    setError(null);

    if (!formData.templateName || !formData.instrumentId || !formData.defaultPrice) {
      setError("Template name, instrument, and price are required");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const payload = {
        templateName: formData.templateName,
        instrumentId: parseInt(formData.instrumentId),
        defaultQuantity: formData.defaultQuantity ? parseFloat(formData.defaultQuantity) : null,
        defaultPrice: parseFloat(formData.defaultPrice),
        autoApprovalAllowed: formData.autoApprovalAllowed
      };

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchTemplates();
        handleCloseDialog();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      setError("Error creating template: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">
          Deal Templates - Auto Approval Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ textTransform: "none" }}
        >
          New Template
        </Button>
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell><strong>Template Name</strong></TableCell>
              <TableCell><strong>Commodity</strong></TableCell>
              <TableCell><strong>Instrument</strong></TableCell>
              <TableCell align="center"><strong>Auto-Approval</strong></TableCell>
              <TableCell align="center"><strong>Toggle</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} hover>
                <TableCell>{template.templateName}</TableCell>
                <TableCell>
                  <Chip size="small" label={template.commodity} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>{template.instrumentCode}</TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={template.autoApprovalAllowed ? "Enabled" : "Disabled"}
                    color={template.autoApprovalAllowed ? "success" : "error"} />
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={template.autoApprovalAllowed}
                    onChange={() => toggleAutoApproval(template.id, template.autoApprovalAllowed)}
                    color="success" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Showing all {templates.length} templates. Toggle to enable/disable auto-approval for each template.
      </Typography>

      {/* Create Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create New Deal Template
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              label="Template Name"
              placeholder="e.g., Standard Power Forward"
              value={formData.templateName}
              onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
              fullWidth
              required
              size="small"
            />

            <FormControl fullWidth required size="small">
              <InputLabel>Instrument</InputLabel>
              <Select
                value={formData.instrumentId}
                onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                label="Instrument"
              >
                {instruments.map((instrument) => (
                  <MenuItem key={instrument.id} value={instrument.id}>
                    {instrument.instrumentCode} ({instrument.commodity} - {instrument.instrumentType})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Default Quantity"
              type="number"
              placeholder="e.g., 1000"
              value={formData.defaultQuantity}
              onChange={(e) => setFormData({ ...formData, defaultQuantity: e.target.value })}
              fullWidth
              size="small"
              helperText="Optional: Leave empty if not applicable"
            />

            <TextField
              label="Default Price"
              type="number"
              placeholder="e.g., 50.00"
              value={formData.defaultPrice}
              onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
              fullWidth
              required
              size="small"
              inputProps={{ step: "0.01" }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.autoApprovalAllowed}
                  onChange={(e) => setFormData({ ...formData, autoApprovalAllowed: e.target.checked })}
                  color="success"
                />
              }
              label="Enable Auto Approval (skip approval workflow)"
            />
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              variant="contained"
              fullWidth
              disabled={loading || !formData.templateName || !formData.instrumentId || !formData.defaultPrice}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? "Creating..." : "Create Template"}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}

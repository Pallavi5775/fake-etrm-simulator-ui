import { useState, useEffect } from "react";
import { getCommodities } from '../api/commoditiesApi';
import httpClient from '../api/httpClient';
import apiConfig from '../config/apiConfig';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Switch, Chip, Paper, Button, Dialog, TextField,
  Stack, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Alert, CircularProgress, useMediaQuery, useTheme, Card, CardContent, Grid
} from "@mui/material";
import { Add as AddIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";

const BASE_URL = apiConfig.baseURL + "/templates";
const INSTRUMENTS_URL = apiConfig.baseURL + "/instruments";

export default function DealTemplateList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [templates, setTemplates] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commodities, setCommodities] = useState([]);
  const [metadata, setMetadata] = useState({
    currencies: [],
    pricingModels: [],
    units: [],
    instrumentTypes: []
  });
  const [formData, setFormData] = useState({
    templateName: "",
    instrumentId: "",
    defaultQuantity: "",
    defaultPrice: "",
    autoApprovalAllowed: false,
    mtmApprovalThreshold: "",
    commodity: "",
    currency: "USD",
    pricingModel: "MARK_TO_MARKET",
    unit: "BBL",
    instrumentType: "FUTURE"
  });

  // Metadata-driven lists
  const currencyOptions = metadata.currency || [];
  const pricingModelOptions = metadata.pricingModel || [];
  const unitOptions = metadata.unit || [];
  const instrumentTypeOptions = metadata.instrumentType || [];
  
  // CSV Upload
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchTemplates();
    loadInstruments();
    getCommodities().then(res => setCommodities(res.data || []));
    // Fetch deal template metadata
    httpClient.get('/reference-data/deal-template-metadata').then(res => {
      setMetadata(res.data || {});
    }).catch(error => {
      console.error("Failed to fetch deal template metadata:", error);
      setMetadata({
        currencies: [],
        pricingModels: [],
        units: [],
        instrumentTypes: []
      });
    });
  }, []);

  const fetchTemplates = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const res = await fetch(BASE_URL, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Failed to load templates: Request timed out");
      } else {
        console.error("Failed to load templates:", error);
      }
      setTemplates([]);
    }
  };

  const loadInstruments = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(INSTRUMENTS_URL, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Normalize commodity field
        const normalizedData = data.map(instrument => ({
          ...instrument,
          commodity: instrument.commodityEntity?.name || instrument.commodity_name || instrument.commodity
        }));
        setInstruments(Array.isArray(normalizedData) ? normalizedData : []);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Failed to load instruments: Request timed out");
      } else {
        console.error("Failed to load instruments:", error);
      }
      setInstruments([]);
    }
  };

  const toggleAutoApproval = async (templateId, currentValue) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const newValue = !currentValue;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(
        `${BASE_URL}/${templateId}/auto-approval?enabled=${newValue}`,
        {
          method: "PATCH",
          headers: {
            "X-User-Name": user.username || "",
            "X-User-Role": user.role || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const updated = await res.json();
        setTemplates(prev => prev?.map(t => t.id === templateId ? updated : t));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Error toggling auto-approval: Request timed out");
      } else {
        console.error("Error toggling auto-approval:", error);
      }
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      templateName: "",
      instrumentId: "",
      defaultQuantity: "",
      defaultPrice: "",
      autoApprovalAllowed: false,
      mtmApprovalThreshold: "",
      commodity: "",
      currency: currencyOptions[0] || "",
      pricingModel: pricingModelOptions[0] || "",
      unit: unitOptions[0] || "",
      instrumentType: instrumentTypeOptions[0] || ""
    });
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file");
      return;
    }

    setUploadLoading(true);
    setUploadResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds for upload

      const response = await fetch(`${BASE_URL}/upload-csv`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload CSV");
      }

      const result = await response.json();
      setUploadResult(result);
      await fetchTemplates();
      setSelectedFile(null);
    } catch (err) {
      console.error("CSV upload failed:", err);
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
      setSelectedFile(null);
    }
  };

  const handleCreateTemplate = async () => {
    setError(null);

    if (!formData.templateName || !formData.instrumentId || !formData.defaultPrice || !formData.commodity || !formData.currency || !formData.pricingModel || !formData.unit || !formData.instrumentType) {
      setError("All fields are required");
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
        autoApprovalAllowed: formData.autoApprovalAllowed,
        mtmApprovalThreshold: formData.mtmApprovalThreshold ? parseFloat(formData.mtmApprovalThreshold) : null,
        commodity: formData.commodity,
        currency: formData.currency,
        pricingModel: formData.pricingModel,
        unit: formData.unit,
        instrumentType: formData.instrumentType,
        createdByUser: user.username || "UNKNOWN"
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        await fetchTemplates();
        handleCloseDialog();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || "Failed to create template");
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error("Error creating template: Request timed out");
        setError("Request timed out. Please try again.");
      } else {
        console.error("Error creating template:", error);
        setError("Error creating template: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 0 }}>
        <Typography variant={isMobile ? "h6" : "h5"}>
          Deal Templates - Auto Approval Configuration
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} width={isMobile ? "100%" : "auto"}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{ textTransform: "none" }}
            fullWidth={isMobile}
          >
            Upload CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ textTransform: "none" }}
            fullWidth={isMobile}
          >
            New Template
          </Button>
        </Stack>
      </Box>

      <Paper elevation={2}>
        {isVerySmall ? (
          // Mobile: Card layout
          <Stack spacing={2} sx={{ p: 2 }}>
            {templates?.map((template) => (
              <Card key={template.id} sx={{ backgroundColor: "#1B1F3B", border: "1px solid #252862" }}>
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Template Name</Typography>
                      <Typography sx={{ color: "#EDE7F6" }}>{template.templateName}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Commodity</Typography>
                      <Chip size="small" label={template.commodity} color="primary" variant="outlined" />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Instrument</Typography>
                      <Typography sx={{ color: "#EDE7F6" }}>{template.instrumentCode}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Auto-Approval</Typography>
                      <Chip
                        size="small"
                        label={template.autoApprovalAllowed ? "Enabled" : "Disabled"}
                        color={template.autoApprovalAllowed ? "success" : "error"}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Toggle</Typography>
                      <Switch
                        checked={template.autoApprovalAllowed}
                        onChange={() => toggleAutoApproval(template.id, template.autoApprovalAllowed)}
                        color="success"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          // Tablet/Desktop: Table with horizontal scroll
          <Box sx={{ overflowX: 'auto' }}>
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
                {templates?.map((template) => (
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
          </Box>
        )}
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {templates?.length > 0 
          ? `Showing all ${templates.length} templates. Toggle to enable/disable auto-approval for each template.`
          : "No deal templates found. Create your first template using the 'New Template' button above."
        }
      </Typography>

      {/* Create Template Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create New Deal Template
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
                        <FormControl fullWidth required size="small">
                          <InputLabel>Commodity</InputLabel>
                          <Select
                            value={formData.commodity}
                            onChange={e => setFormData({ ...formData, commodity: e.target.value })}
                            label="Commodity"
                          >
                            {commodities.map(c => (
                              <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth required size="small">
                          <InputLabel>Currency</InputLabel>
                          <Select
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            label="Currency"
                          >
                            {currencyOptions.map(cur => (
                              <MenuItem key={cur} value={cur}>{cur}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth required size="small">
                          <InputLabel>Pricing Model</InputLabel>
                          <Select
                            value={formData.pricingModel}
                            onChange={e => setFormData({ ...formData, pricingModel: e.target.value })}
                            label="Pricing Model"
                          >
                            {pricingModelOptions.map(pm => (
                              <MenuItem key={pm} value={pm}>{pm}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth required size="small">
                          <InputLabel>Unit</InputLabel>
                          <Select
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            label="Unit"
                          >
                            {unitOptions.map(u => (
                              <MenuItem key={u} value={u}>{u}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth required size="small">
                          <InputLabel>Instrument Type</InputLabel>
                          <Select
                            value={formData.instrumentType}
                            onChange={e => setFormData({ ...formData, instrumentType: e.target.value })}
                            label="Instrument Type"
                          >
                            {instrumentTypeOptions.map(it => (
                              <MenuItem key={it} value={it}>{it}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
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
                {instruments?.map((instrument) => (
                  <MenuItem key={instrument.id} value={instrument.id}>
                    {instrument.commodityEntity?.name || instrument.commodity} - {instrument.instrumentCode}
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

            <TextField
              label="MTM Approval Threshold"
              type="number"
              placeholder="e.g., 500000"
              value={formData.mtmApprovalThreshold}
              onChange={(e) => setFormData({ ...formData, mtmApprovalThreshold: e.target.value })}
              fullWidth
              size="small"
              helperText="Optional: Template-specific approval limit"
              inputProps={{ step: "1000" }}
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

      {/* CSV Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <Box sx={{ p: isMobile ? 2 : 3, borderBottom: "1px solid #ddd" }}>
          <Typography variant="h6">
            Upload Deal Templates CSV
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: isMobile ? 2 : 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              CSV Format Required:
            </Typography>
            <Typography variant="caption" component="pre" sx={{ fontFamily: "monospace", display: "block" }}>
{`templateName,instrumentCode,defaultQuantity,defaultPrice,autoApprovalAllowed,mtmApprovalThreshold,commodity,currency,pricingModel,unit,instrumentType
Power Forward Q1,PWR-Q1-2025,1000,75.50,true,500000,POWER,USD,MARK_TO_MARKET,BBL,FUTURE
Gas Option Feb,GAS-FEB25-OPT,500,50.00,false,,NATURAL_GAS,EUR,BLACK_SCHOLES,MMBTU,OPTION`}
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              p: 2,
              textTransform: "none"
            }}
          >
            {selectedFile ? selectedFile.name : "Select CSV File"}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileSelect}
            />
          </Button>

          {uploadResult && (
            <Alert severity="success">
              <Typography variant="body2">
                ✓ Successfully uploaded {uploadResult.successCount || uploadResult.count} templates
                {uploadResult.failedCount > 0 && ` (${uploadResult.failedCount} failed)`}
              </Typography>
            </Alert>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: isMobile ? 2 : 3, borderTop: "1px solid #ddd" }}>
          <Button
            variant="outlined"
            onClick={() => {
              setUploadDialog(false);
              setSelectedFile(null);
              setUploadResult(null);
            }}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCSVUpload}
            disabled={!selectedFile || uploadLoading}
            fullWidth
          >
            {uploadLoading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}

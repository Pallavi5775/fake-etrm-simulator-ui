import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Stack,
  Dialog,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";

const API_BASE = "http://localhost:8080/api";

/**
 * Instrument Configuration – Connected to Backend
 */
export default function InstrumentConfig() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [instrumentType, setInstrumentType] = useState("FORWARD");
  const [formData, setFormData] = useState({
    instrumentCode: "",
    commodity: "POWER",
    currency: "EUR",
    unit: "MWh",
    startDate: "",
    endDate: "",
    // Option-specific fields
    strikePrice: "",
    expiryDate: "",
    optionType: "CALL"
  });

  // Dropdown data from APIs
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [units, setUnits] = useState([]);
  
  // CSV Upload
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    loadInstruments();
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      // Fetch all dropdown data in parallel
      const [typesRes, commoditiesRes, currenciesRes, unitsRes] = await Promise.all([
        fetch(`${API_BASE}/reference-data/instrument-types`),
        fetch(`${API_BASE}/reference-data/commodities`),
        fetch(`${API_BASE}/reference-data/currencies`),
        fetch(`${API_BASE}/reference-data/units`)
      ]);

      if (typesRes.ok) {
        const types = await typesRes.json();
        setInstrumentTypes(Array.isArray(types) ? types : []);
      }
      if (commoditiesRes.ok) {
        const comms = await commoditiesRes.json();
        setCommodities(Array.isArray(comms) ? comms : []);
      }
      if (currenciesRes.ok) {
        const currs = await currenciesRes.json();
        setCurrencies(Array.isArray(currs) ? currs : []);
      }
      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(Array.isArray(unitsData) ? unitsData : []);
      }
    } catch (err) {
      console.error("Failed to load dropdown data:", err);
      // Use fallback values if API fails
      setInstrumentTypes([
        { code: "FORWARD", name: "Forward" },
        { code: "OPTION", name: "Option" },
        { code: "SWAP", name: "Swap" },
        { code: "PPA", name: "PPA" }
      ]);
      setCommodities([
        { code: "POWER", name: "Power" },
        { code: "GAS", name: "Gas" },
        { code: "OIL", name: "Oil" },
        { code: "CRUDE", name: "Crude" }
      ]);
      setCurrencies([
        { code: "EUR", name: "Euro" },
        { code: "USD", name: "US Dollar" },
        { code: "GBP", name: "British Pound" }
      ]);
      setUnits([
        { code: "MWh", name: "Megawatt Hour" },
        { code: "MMBtu", name: "Million BTU" },
        { code: "BBL", name: "Barrel" }
      ]);
    }
  };

  const loadInstruments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/instruments`);
      if (!response.ok) throw new Error("Failed to load instruments");
      const data = await response.json();
      setInstruments(data);
    } catch (err) {
      console.error("Failed to load instruments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (instrument = null) => {
    if (instrument) {
      // Editing not implemented yet - would need to detect type and populate fields
      alert("Edit functionality coming soon!");
    } else {
      // New instrument
      setFormData({
        instrumentCode: "",
        commodity: "POWER",
        currency: "EUR",
        unit: "MWh",
        startDate: "",
        endDate: "",
        strikePrice: "",
        expiryDate: "",
        optionType: "CALL"
      });
      setInstrumentType("FORWARD");
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      instrumentCode: "",
      commodity: "POWER",
      currency: "EUR",
      unit: "MWh",
      startDate: "",
      endDate: "",
      strikePrice: "",
      expiryDate: "",
      optionType: "CALL"
    });
    setInstrumentType("FORWARD");
  };

  // Auto-update unit based on commodity
  const handleCommodityChange = (commodity) => {
    let defaultUnit = "MWh";
    if (commodity === "GAS") {
      defaultUnit = "MMBtu";
    } else if (commodity === "POWER") {
      defaultUnit = "MWh";
    } else if (commodity === "OIL" || commodity === "CRUDE") {
      defaultUnit = "BBL";
    }
    setFormData({ ...formData, commodity, unit: defaultUnit });
  };

  const handleSave = async () => {
    setError(null);
    try {
      let endpoint = "";
      let payload = { ...formData, instrumentType };

      // For Options, include option-specific fields
      if (instrumentType === "OPTION") {
        payload.strikePrice = parseFloat(formData.strikePrice) || null;
        payload.expiryDate = formData.expiryDate || null;
        payload.optionType = formData.optionType;
        endpoint = "/instruments/commodity-option";
      } else if (instrumentType === "FORWARD") {
        endpoint = "/instruments/forward";
        // Remove option-specific fields for non-options
        delete payload.strikePrice;
        delete payload.expiryDate;
        delete payload.optionType;
      } else if (instrumentType === "SWAP") {
        endpoint = "/instruments/commodity-swap";
        delete payload.strikePrice;
        delete payload.expiryDate;
        delete payload.optionType;
      } else if (instrumentType === "PPA") {
        endpoint = "/instruments/renewable-ppa";
        delete payload.strikePrice;
        delete payload.expiryDate;
        delete payload.optionType;
      } else {
        throw new Error("Unknown instrument type");
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create instrument");
      }

      await loadInstruments();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save instrument:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete instrument ${code}?`)) return;

    try {
      const response = await fetch(`${API_BASE}/instruments/${code}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete instrument");
      }

      await loadInstruments();
    } catch (err) {
      console.error("Failed to delete instrument:", err);
      setError(err.message);
    }
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

      const response = await fetch(`${API_BASE}/instruments/upload-csv`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload CSV");
      }

      const result = await response.json();
      setUploadResult(result);
      await loadInstruments();
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

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#EDE7F6",
      "& fieldset": { borderColor: "#252862" },
      "&:hover fieldset": { borderColor: "#7C4DFF" }
    },
    "& .MuiInputLabel-root": { color: "#B0BEC5" },
    "& .MuiInputBase-input::placeholder": { color: "#B0BEC5", opacity: 1 }
  };

  const selectStyles = {
    color: "#EDE7F6",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#252862" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#7C4DFF" },
    "& .MuiSvgIcon-root": { color: "#B388FF" }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: "#EDE7F6",
            letterSpacing: 0.5
          }}
        >
          Instrument Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage tradeable instruments in the system
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
          Total Instruments: {instruments.length}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{
              borderColor: "#7C4DFF",
              color: "#B388FF",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#B388FF",
                backgroundColor: "#7C4DFF20"
              }
            }}
          >
            Upload CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            New Instrument
          </Button>
        </Stack>
      </Box>

      {/* Table */}
      <Paper
        sx={{
          background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
          border: "1px solid #252862",
          overflow: "hidden"
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : instruments.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">No instruments configured. Click "New Instrument" to add one.</Alert>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1B1F3B" }}>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Commodity</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Currency</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Unit</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instruments?.map((instrument) => (
                <TableRow
                  key={instrument.id}
                  hover
                  sx={{
                    borderBottom: "1px solid #252862",
                    "&:hover": {
                      backgroundColor: "#1B1F3B"
                    }
                  }}
                >
                  <TableCell sx={{ color: "#EDE7F6", fontWeight: 600 }}>
                    {instrument.instrumentCode}
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{instrument.commodity}</TableCell>
                  <TableCell>
                    <Chip
                      label={instrument.instrumentType}
                      size="small"
                      sx={{
                        backgroundColor: "#7C4DFF20",
                        color: "#B388FF",
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{instrument.currency}</TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{instrument.unit}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(instrument.instrumentCode)}
                        sx={{ color: "#FF5252", textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box
          sx={{
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            p: 3,
            borderBottom: "1px solid #252862"
          }}
        >
          <Typography variant="h6" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
            New Instrument
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3, backgroundColor: "#16182E" }}>
          {/* Instrument Type Selector */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#B0BEC5" }}>Instrument Type</InputLabel>
            <Select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value)}
              label="Instrument Type"
              sx={selectStyles}
            >
              {instrumentTypes.map((type) => (
                <MenuItem key={type.code} value={type.code}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Instrument Code */}
          <TextField
            label="Instrument Code"
            placeholder="e.g., PWR-JAN25-FWD"
            value={formData.instrumentCode}
            onChange={(e) => setFormData({ ...formData, instrumentCode: e.target.value })}
            fullWidth
            size="small"
            required
            sx={textFieldStyles}
          />

          {/* Commodity Dropdown */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#B0BEC5" }}>Commodity</InputLabel>
            <Select
              value={formData.commodity}
              onChange={(e) => handleCommodityChange(e.target.value)}
              label="Commodity"
              sx={selectStyles}
            >
              {commodities.map((commodity) => (
                <MenuItem key={commodity.code} value={commodity.code}>
                  {commodity.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Currency Dropdown */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#B0BEC5" }}>Currency</InputLabel>
            <Select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              label="Currency"
              sx={selectStyles}
            >
              {currencies.map((currency) => (
                <MenuItem key={currency.code} value={currency.code}>
                  {currency.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Unit Dropdown */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#B0BEC5" }}>Unit</InputLabel>
            <Select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              label="Unit"
              sx={selectStyles}
            >
              {units.map((unit) => (
                <MenuItem key={unit.code} value={unit.code}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Start Date */}
          <TextField
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={textFieldStyles}
          />

          {/* End Date */}
          <TextField
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={textFieldStyles}
          />

          {/* Conditional Option Fields */}
          {instrumentType === "OPTION" && (
            <>
              <TextField
                label="Strike Price"
                type="number"
                value={formData.strikePrice}
                onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                fullWidth
                size="small"
                required
                sx={textFieldStyles}
                helperText="Required for Options"
              />
              <TextField
                label="Expiry Date"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                fullWidth
                size="small"
                required
                InputLabelProps={{ shrink: true }}
                sx={textFieldStyles}
                helperText="Required for Options"
              />
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: "#B0BEC5" }}>Option Type</InputLabel>
                <Select
                  value={formData.optionType}
                  onChange={(e) => setFormData({ ...formData, optionType: e.target.value })}
                  label="Option Type"
                  sx={selectStyles}
                >
                  <MenuItem value="CALL">CALL</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 3, borderTop: "1px solid #252862", backgroundColor: "#16182E" }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{ 
              textTransform: "none",
              borderColor: "#252862",
              color: "#B388FF",
              "&:hover": {
                borderColor: "#7C4DFF",
                backgroundColor: "#7C4DFF20"
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.instrumentCode}
            sx={{
              background: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            Save
          </Button>
        </Stack>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <Box
          sx={{
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            p: 3,
            borderBottom: "1px solid #252862"
          }}
        >
          <Typography variant="h6" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
            Upload Instruments CSV
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3, backgroundColor: "#16182E" }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              CSV Format Required:
            </Typography>
            <Typography variant="caption" component="pre" sx={{ fontFamily: "monospace", display: "block" }}>
{`instrumentCode,instrumentType,commodity,currency,unit,startDate,endDate,strikePrice,expiryDate,optionType
PWR-JAN25-FWD,FORWARD,POWER,EUR,MWh,2025-01-01,2025-01-31,,,
GAS-FEB25-OPT,OPTION,GAS,USD,MMBtu,2025-02-01,2025-02-28,50.00,2025-02-25,CALL`}
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              borderColor: "#7C4DFF",
              color: "#B388FF",
              textTransform: "none",
              p: 2,
              "&:hover": {
                borderColor: "#B388FF",
                backgroundColor: "#7C4DFF20"
              }
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
                ✓ Successfully uploaded {uploadResult.successCount || uploadResult.count} instruments
                {uploadResult.failedCount > 0 && ` (${uploadResult.failedCount} failed)`}
              </Typography>
            </Alert>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 3, borderTop: "1px solid #252862", backgroundColor: "#16182E" }}>
          <Button
            variant="outlined"
            onClick={() => {
              setUploadDialog(false);
              setSelectedFile(null);
              setUploadResult(null);
            }}
            sx={{
              textTransform: "none",
              borderColor: "#252862",
              color: "#B388FF",
              "&:hover": {
                borderColor: "#7C4DFF",
                backgroundColor: "#7C4DFF20"
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCSVUpload}
            disabled={!selectedFile || uploadLoading}
            sx={{
              background: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            {uploadLoading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}

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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const API_BASE = "http://localhost:8080/api";

/**
 * Instrument Configuration – Connected to Backend
 */
export default function InstrumentConfig() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [instrumentType, setInstrumentType] = useState("POWER_FORWARD");
  const [formData, setFormData] = useState({
    instrumentCode: "",
    commodity: "",
    currency: "EUR",
    unit: ""
  });
  const [typeSpecificData, setTypeSpecificData] = useState({});

  useEffect(() => {
    loadInstruments();
  }, []);

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
        commodity: "",
        currency: "EUR",
        unit: ""
      });
      setTypeSpecificData({});
      setInstrumentType("POWER_FORWARD");
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      instrumentCode: "",
      commodity: "",
      currency: "EUR",
      unit: ""
    });
    setTypeSpecificData({});
    setInstrumentType("POWER_FORWARD");
  };

  const handleSave = async () => {
    setError(null);
    try {
      let endpoint = "";
      let payload = { ...formData, ...typeSpecificData };

      switch (instrumentType) {
        case "POWER_FORWARD":
          endpoint = "/instruments/power-forward";
          payload.commodity = payload.commodity || "POWER";
          payload.unit = payload.unit || "MWh";
          break;
        case "GAS_FORWARD":
          endpoint = "/instruments/gas-forward";
          payload.commodity = payload.commodity || "GAS";
          payload.unit = payload.unit || "MMBtu";
          break;
        case "RENEWABLE_PPA":
          endpoint = "/instruments/renewable-ppa";
          payload.commodity = payload.commodity || "POWER";
          payload.unit = payload.unit || "MWh";
          break;
        case "COMMODITY_SWAP":
          endpoint = "/instruments/commodity-swap";
          break;
        case "COMMODITY_OPTION":
          endpoint = "/instruments/commodity-option";
          break;
        default:
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

  const handleTypeChange = (newType) => {
    setInstrumentType(newType);
    setTypeSpecificData({});
  };

  const renderTypeSpecificFields = () => {
    switch (instrumentType) {
      case "POWER_FORWARD":
        return (
          <>
            <TextField
              label="Start Date"
              type="date"
              value={typeSpecificData.startDate || ""}
              onChange={(e) => setTypeSpecificData({ ...typeSpecificData, startDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
            />
            <TextField
              label="End Date"
              type="date"
              value={typeSpecificData.endDate || ""}
              onChange={(e) => setTypeSpecificData({ ...typeSpecificData, endDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
            />
          </>
        );

      case "GAS_FORWARD":
        return (
          <TextField
            label="Delivery Date"
            type="date"
            value={typeSpecificData.deliveryDate || ""}
            onChange={(e) => setTypeSpecificData({ ...typeSpecificData, deliveryDate: e.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={textFieldStyles}
          />
        );

      case "RENEWABLE_PPA":
        return (
          <>
            <TextField
              label="Technology"
              placeholder="WIND, SOLAR, etc."
              value={typeSpecificData.technology || ""}
              onChange={(e) => setTypeSpecificData({ ...typeSpecificData, technology: e.target.value })}
              fullWidth
              size="small"
              sx={textFieldStyles}
            />
            <TextField
              label="Forecast Curve"
              placeholder="WIND_FORECAST_2025"
              value={typeSpecificData.forecastCurve || ""}
              onChange={(e) => setTypeSpecificData({ ...typeSpecificData, forecastCurve: e.target.value })}
              fullWidth
              size="small"
              sx={textFieldStyles}
            />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#B0BEC5" }}>Settlement Type</InputLabel>
              <Select
                value={typeSpecificData.settlementType || ""}
                onChange={(e) => setTypeSpecificData({ ...typeSpecificData, settlementType: e.target.value })}
                label="Settlement Type"
                sx={selectStyles}
              >
                <MenuItem value="PHYSICAL">PHYSICAL</MenuItem>
                <MenuItem value="FINANCIAL">FINANCIAL</MenuItem>
              </Select>
            </FormControl>
          </>
        );

      case "COMMODITY_SWAP":
        return null; // Basic fields only

      case "COMMODITY_OPTION":
        return (
          <>
            <TextField
              label="Strike Price"
              type="number"
              value={typeSpecificData.strikePrice || ""}
              onChange={(e) => setTypeSpecificData({ ...typeSpecificData, strikePrice: e.target.value })}
              fullWidth
              size="small"
              sx={textFieldStyles}
            />
            <TextField
              label="Expiry Date"
              type="date"
              value={typeSpecificData.expiryDate || ""}
              onChange={(e) => setTypeSpecificData({ ...typeSpecificData, expiryDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={textFieldStyles}
            />
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#B0BEC5" }}>Option Type</InputLabel>
              <Select
                value={typeSpecificData.optionType || ""}
                onChange={(e) => setTypeSpecificData({ ...typeSpecificData, optionType: e.target.value })}
                label="Option Type"
                sx={selectStyles}
              >
                <MenuItem value="CALL">CALL</MenuItem>
                <MenuItem value="PUT">PUT</MenuItem>
              </Select>
            </FormControl>
          </>
        );

      default:
        return null;
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
              {instruments.map((instrument) => (
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
              onChange={(e) => handleTypeChange(e.target.value)}
              label="Instrument Type"
              sx={selectStyles}
            >
              <MenuItem value="POWER_FORWARD">Power Forward</MenuItem>
              <MenuItem value="GAS_FORWARD">Gas Forward</MenuItem>
              <MenuItem value="RENEWABLE_PPA">Renewable PPA</MenuItem>
              <MenuItem value="COMMODITY_SWAP">Commodity Swap</MenuItem>
              <MenuItem value="COMMODITY_OPTION">Commodity Option</MenuItem>
            </Select>
          </FormControl>

          {/* Common Fields */}
          <TextField
            label="Instrument Code"
            placeholder="e.g., PWR-JAN25"
            value={formData.instrumentCode}
            onChange={(e) => setFormData({ ...formData, instrumentCode: e.target.value })}
            fullWidth
            size="small"
            required
            sx={textFieldStyles}
          />
          <TextField
            label="Commodity"
            placeholder="e.g., POWER, GAS"
            value={formData.commodity}
            onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
            fullWidth
            size="small"
            sx={textFieldStyles}
          />
          <TextField
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            fullWidth
            size="small"
            sx={textFieldStyles}
          />
          <TextField
            label="Unit"
            placeholder="e.g., MWh, MMBtu"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            fullWidth
            size="small"
            sx={textFieldStyles}
          />

          {/* Type-Specific Fields */}
          {renderTypeSpecificFields()}
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
    </Box>
  );
}

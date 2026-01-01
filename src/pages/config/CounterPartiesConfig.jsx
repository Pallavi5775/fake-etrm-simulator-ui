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
  Chip
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * Counterparties Configuration – Endur Style
 */
export default function CounterPartiesConfig() {
  const [counterparties, setCounterparties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    country: "",
    credit_rating: ""
  });

  useEffect(() => {
    loadCounterparties();
  }, []);

  const loadCounterparties = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API call
      setCounterparties([
        { id: 1, code: "BP", name: "British Petroleum", country: "UK", credit_rating: "AA" },
        { id: 2, code: "SHELL", name: "Royal Dutch Shell", country: "Netherlands", credit_rating: "AA" },
        { id: 3, code: "TRAD1", name: "Trading Corp A", country: "USA", credit_rating: "A+" },
        { id: 4, code: "TRAD2", name: "Trading Corp B", country: "Singapore", credit_rating: "A" },
      ]);
    } catch (err) {
      console.error("Failed to load counterparties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (counterparty = null) => {
    if (counterparty) {
      setEditingId(counterparty.id);
      setFormData(counterparty);
    } else {
      setEditingId(null);
      setFormData({ code: "", name: "", country: "", credit_rating: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ code: "", name: "", country: "", credit_rating: "" });
  };

  const handleSave = () => {
    if (editingId) {
      setCounterparties(
        counterparties.map(c => (c.id === editingId ? { ...formData, id: editingId } : c))
      );
    } else {
      setCounterparties([...counterparties, { ...formData, id: Date.now() }]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    setCounterparties(counterparties.filter(c => c.id !== id));
  };

  const getRatingColor = (rating) => {
    if (rating.startsWith("AA")) return "#00C853";
    if (rating.startsWith("A")) return "#FFD600";
    return "#FF5252";
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
          Counterparties Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage trading counterparties and credit ratings
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
          Total Counterparties: {counterparties.length}
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
          New Counterparty
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
        ) : counterparties.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">No counterparties configured. Click "New Counterparty" to add one.</Alert>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1B1F3B" }}>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Credit Rating</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {counterparties.map((counterparty) => (
                <TableRow
                  key={counterparty.id}
                  hover
                  sx={{
                    borderBottom: "1px solid #252862",
                    "&:hover": {
                      backgroundColor: "#1B1F3B"
                    }
                  }}
                >
                  <TableCell sx={{ color: "#EDE7F6", fontWeight: 600 }}>
                    {counterparty.code}
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{counterparty.name}</TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{counterparty.country}</TableCell>
                  <TableCell>
                    <Chip
                      label={counterparty.credit_rating}
                      size="small"
                      sx={{
                        backgroundColor: `${getRatingColor(counterparty.credit_rating)}20`,
                        color: getRatingColor(counterparty.credit_rating),
                        fontWeight: 700
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(counterparty)}
                        sx={{ color: "#B388FF", textTransform: "none" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(counterparty.id)}
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
            {editingId ? "Edit Counterparty" : "New Counterparty"}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
          <TextField
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#EDE7F6",
                "& fieldset": { borderColor: "#252862" },
                "&:hover fieldset": { borderColor: "#7C4DFF" }
              }
            }}
          />
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#EDE7F6",
                "& fieldset": { borderColor: "#252862" },
                "&:hover fieldset": { borderColor: "#7C4DFF" }
              }
            }}
          />
          <TextField
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#EDE7F6",
                "& fieldset": { borderColor: "#252862" },
                "&:hover fieldset": { borderColor: "#7C4DFF" }
              }
            }}
          />
          <TextField
            label="Credit Rating"
            value={formData.credit_rating}
            onChange={(e) => setFormData({ ...formData, credit_rating: e.target.value })}
            fullWidth
            size="small"
            placeholder="e.g., AA, A+, A"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#EDE7F6",
                "& fieldset": { borderColor: "#252862" },
                "&:hover fieldset": { borderColor: "#7C4DFF" }
              }
            }}
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 3, borderTop: "1px solid #252862" }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
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

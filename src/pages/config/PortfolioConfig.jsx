import { useEffect, useState } from "react";
import apiConfig from '../../config/apiConfig';
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
  Switch,
  FormControlLabel
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

/**
 * Portfolio Configuration – Endur Style
 */
export default function PortfolioConfig() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    risk_owner: "",
    active: true
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiConfig.baseURL + "/portfolios");
      if (res.ok) {
        const data = await res.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load portfolios:", err);
      setPortfolios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (portfolio = null) => {
    if (portfolio) {
      setEditingId(portfolio.id);
      setFormData(portfolio);
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "", risk_owner: "", active: true });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: "", description: "", risk_owner: "", active: true });
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      if (editingId) {
        // Update existing
        const res = await fetch(`${apiConfig.baseURL}/portfolios/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Name": user.username || "",
            "X-User-Role": user.role || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Failed to update");
      } else {
        // Create new
        const res = await fetch(apiConfig.baseURL + "/portfolios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Name": user.username || "",
            "X-User-Role": user.role || "",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({
            ...formData,
            createdByUser: user.username || "UNKNOWN"
          })
        });
        if (!res.ok) throw new Error("Failed to create");
      }
      
      await loadPortfolios();
      handleCloseDialog();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save portfolio: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this portfolio?")) return;
    
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${apiConfig.baseURL}/portfolios/${id}`, {
        method: "DELETE",
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      if (!res.ok) throw new Error("Failed to delete");
      
      await loadPortfolios();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete portfolio: " + err.message);
    }
  };

  const getStatusColor = (status) => {
    return status === "ACTIVE" ? "#00C853" : "#FF5252";
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
          Portfolio Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage trading portfolios and assignments
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={2}>
          <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
            Total Portfolios: {portfolios.length}
          </Typography>
          <Chip
            label={`Active: ${portfolios.filter(p => p.active).length}`}
            size="small"
            sx={{
              backgroundColor: "#00C85320",
              color: "#00C853",
              fontWeight: 600
            }}
          />
        </Stack>
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
          New Portfolio
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
        ) : portfolios.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">No portfolios configured. Click "New Portfolio" to add one.</Alert>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1B1F3B" }}>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Risk Owner</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Active</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolios?.map((portfolio) => (
                <TableRow
                  key={portfolio.id}
                  hover
                  sx={{
                    borderBottom: "1px solid #252862",
                    "&:hover": {
                      backgroundColor: "#1B1F3B"
                    }
                  }}
                >
                  <TableCell sx={{ color: "#EDE7F6", fontWeight: 600 }}>
                    {portfolio.name}
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{portfolio.description}</TableCell>
                  <TableCell sx={{ color: "#B0BEC5" }}>{portfolio.risk_owner}</TableCell>
                  <TableCell>
                    <Chip
                      label={portfolio.active ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        backgroundColor: portfolio.active ? "#00C85320" : "#FF525220",
                        color: portfolio.active ? "#00C853" : "#FF5252",
                        fontWeight: 700
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(portfolio)}
                        sx={{ color: "#B388FF", textTransform: "none" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(portfolio.id)}
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
            {editingId ? "Edit Portfolio" : "New Portfolio"}
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
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
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#EDE7F6",
                "& fieldset": { borderColor: "#252862" },
                "&:hover fieldset": { borderColor: "#7C4DFF" }
              }
            }}
          />
          <TextField
            label="Risk Owner"
            value={formData.risk_owner}
            onChange={(e) => setFormData({ ...formData, risk_owner: e.target.value })}
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
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                color="primary"
              />
            }
            label="Active"
            sx={{ color: "#EDE7F6" }}
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
          <Button onClick={handleCloseDialog} variant="outlined" color="primary">OK</Button>
        </Stack>
      </Dialog>
    </Box>
  );
}

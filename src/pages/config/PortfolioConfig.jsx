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
 * Portfolio Configuration – Endur Style
 */
export default function PortfolioConfig() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    manager: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/portfolios");
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
      setFormData({ code: "", name: "", manager: "", status: "ACTIVE" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ code: "", name: "", manager: "", status: "ACTIVE" });
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      if (editingId) {
        // Update existing
        const res = await fetch(`http://localhost:8080/api/portfolios/${editingId}`, {
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
        const res = await fetch("http://localhost:8080/api/portfolios", {
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
      
      const res = await fetch(`http://localhost:8080/api/portfolios/${id}`, {
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
            label={`Active: ${portfolios.filter(p => p.status === "ACTIVE").length}`}
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
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Code</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Manager</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Status</TableCell>
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
                    {portfolio.code}
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{portfolio.name}</TableCell>
                  <TableCell sx={{ color: "#B0BEC5" }}>{portfolio.manager}</TableCell>
                  <TableCell>
                    <Chip
                      label={portfolio.status}
                      size="small"
                      sx={{
                        backgroundColor: `${getStatusColor(portfolio.status)}20`,
                        color: getStatusColor(portfolio.status),
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
            label="Manager"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
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
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            select
            fullWidth
            size="small"
            SelectProps={{
              native: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#EDE7F6",
                "& fieldset": { borderColor: "#252862" },
                "&:hover fieldset": { borderColor: "#7C4DFF" }
              }
            }}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </TextField>
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

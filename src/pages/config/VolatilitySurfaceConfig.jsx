
import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody, Dialog, CircularProgress, Alert } from "@mui/material";

export default function VolatilitySurfaceConfig() {
  const [surfaces, setSurfaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch surfaces from backend (placeholder logic)
  useEffect(() => {
    fetchSurfaces();
  }, []);

  const fetchSurfaces = async () => {
    setLoading(true);
    try {
      // Replace with: const res = await fetch('/api/vol-surfaces');
      // setSurfaces(await res.json());
      setSurfaces([
        { id: 1, name: "Crude Option Jan26", underlying: "CRUDE_OIL", expiry: "2026-01-31", asOf: "2026-01-04" },
        { id: 2, name: "Power Option Q1", underlying: "POWER", expiry: "2026-03-31", asOf: "2026-01-04" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setError(null);
    try {
      // Replace with: upload to /api/vol-surfaces/upload-csv
      await new Promise((res) => setTimeout(res, 1000));
      setUploadDialog(false);
      setSelectedFile(null);
      fetchSurfaces();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      // Replace with: await fetch(`/api/vol-surfaces/${id}`, { method: 'DELETE' })
      setSurfaces(surfaces.filter(s => s.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Volatility Surfaces
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">
          Configure and upload implied volatility surfaces for Black76 and other option models.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setUploadDialog(true)}>
            Upload Volatility Surface (CSV)
          </Button>
        </Stack>
      </Paper>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Underlying</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>As Of</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surfaces.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.underlying}</TableCell>
                <TableCell>{s.expiry}</TableCell>
                <TableCell>{s.asOf}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDelete(s.id)} size="small">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Upload Volatility Surface CSV</Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <input type="file" accept=".csv" onChange={handleFileSelect} style={{ marginTop: 16 }} />
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={() => setUploadDialog(false)} variant="outlined" fullWidth>Cancel</Button>
            <Button onClick={handleUpload} variant="contained" fullWidth disabled={uploadLoading || !selectedFile}>
              {uploadLoading ? <CircularProgress size={20} /> : "Upload"}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}

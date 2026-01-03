
import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody, Dialog, CircularProgress, Alert } from "@mui/material";
import httpClient from "../../api/httpClient";

export default function PriceCurvesConfig() {
  const [curves, setCurves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurves();
  }, []);

  const fetchCurves = async () => {
    setLoading(true);
    try {
      const res = await httpClient.get("/price-curves");
      setCurves(res.data || []);
    } catch (err) {
      setError("Failed to fetch price curves");
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
      const formData = new FormData();
      formData.append("file", selectedFile);
      await httpClient.post("/price-curves/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadDialog(false);
      setSelectedFile(null);
      fetchCurves();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await httpClient.delete(`/price-curves/${id}`);
      fetchCurves();
    } catch (err) {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Price Curves
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">
          Configure and upload price curves for RENEWABLE_FORECAST and other models.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setUploadDialog(true)}>
            Upload Price Curve (CSV)
          </Button>
        </Stack>
      </Paper>
      {loading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Commodity</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {curves.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.commodity}</TableCell>
                <TableCell>{c.date}</TableCell>
                <TableCell>{c.price}</TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleDelete(c.id)} size="small">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">Upload Price Curve CSV</Typography>
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

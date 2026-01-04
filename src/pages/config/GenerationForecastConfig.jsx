
import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody, Dialog, CircularProgress, Alert, useMediaQuery, useTheme } from "@mui/material";
import httpClient from "../../api/httpClient";

export default function GenerationForecastConfig() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const res = await httpClient.get("/generation-forecasts");
      setForecasts(res.data || []);
    } catch (err) {
      setError("Failed to fetch generation forecasts");
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
      await httpClient.post("/generation-forecasts/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadDialog(false);
      setSelectedFile(null);
      fetchForecasts();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await httpClient.delete(`/generation-forecasts/${id}`);
      fetchForecasts();
    } catch (err) {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: 3 }}>
        Generation Forecasts
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">
          Configure and upload renewable generation forecasts for RENEWABLE_FORECAST pricing models.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setUploadDialog(true)}>
            Upload Generation Forecast (CSV)
          </Button>
        </Stack>
      </Paper>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Plant Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Forecast (MWh)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forecasts.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.plantName}</TableCell>
                  <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">{f.forecastMWh?.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button color="error" onClick={() => handleDelete(f.id)} size="small">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant="h6">Upload Generation Forecast CSV</Typography>
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


import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody, Dialog, CircularProgress, Alert, useMediaQuery, useTheme } from "@mui/material";
import httpClient from "../../api/httpClient";

export default function WeatherDataConfig() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [weatherSets, setWeatherSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherSets();
  }, []);

  const fetchWeatherSets = async () => {
    setLoading(true);
    try {
      const res = await httpClient.get("/weather-data");
      setWeatherSets(res.data || []);
    } catch (err) {
      setError("Failed to fetch weather data");
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
      await httpClient.post("/weather-data/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadDialog(false);
      setSelectedFile(null);
      fetchWeatherSets();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await httpClient.delete(`/weather-data/${id}`);
      fetchWeatherSets();
    } catch (err) {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: 3 }}>
        Weather Data
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">
          Upload and manage weather data (temperature, precipitation) and renewable energy forecast data for forecasting models.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setUploadDialog(true)}>
            Upload Weather/Forecast Data (CSV)
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
                <TableCell>Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Temperature (°C)</TableCell>
                <TableCell align="right">Precipitation (mm)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {weatherSets.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.location || w.plantName}</TableCell>
                  <TableCell>{new Date(w.date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">{w.temperature != null ? `${w.temperature}°C` : '-'}</TableCell>
                  <TableCell align="right">{w.precipitation != null ? `${w.precipitation} mm` : '-'}</TableCell>
                  <TableCell align="right">
                    <Button color="error" onClick={() => handleDelete(w.id)} size="small">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <Typography variant="h6">Upload Weather/Forecast Data CSV</Typography>
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

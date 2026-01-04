
import { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody, Dialog, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import httpClient from "../../api/httpClient";

export default function PriceCurvesConfig() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [curves, setCurves] = useState([]);
  const [selectedCurve, setSelectedCurve] = useState('');
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
      // Group by curveName
      const grouped = (res.data || []).reduce((acc, item) => {
        if (!acc[item.curveName]) {
          acc[item.curveName] = [];
        }
        acc[item.curveName].push(item);
        return acc;
      }, {});
      const curveData = Object.entries(grouped).map(([name, points]) => ({
        name,
        points: points.sort((a, b) => new Date(a.date) - new Date(b.date))
      }));
      setCurves(curveData);
      // Select first curve by default
      if (curveData.length > 0 && !selectedCurve) {
        setSelectedCurve(curveData[0].name);
      }
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
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Typography variant={isMobile ? "h5" : "h4"} sx={{ mb: 3 }}>
        Price Curves
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1">
          Upload and manage price curve data points for various commodities and models.
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mt: 2 }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Select Curve</InputLabel>
            <Select
              value={selectedCurve}
              onChange={(e) => setSelectedCurve(e.target.value)}
              label="Select Curve"
            >
              {curves.map((curve) => (
                <MenuItem key={curve.name} value={curve.name}>
                  {curve.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setUploadDialog(true)}>
            Upload Price Curve (CSV)
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
                <TableCell>Date</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {curves.find(c => c.name === selectedCurve)?.points.map((point) => (
                <TableRow key={point.id}>
                  <TableCell>{new Date(point.date).toLocaleDateString()}</TableCell>
                  <TableCell align="right">${point.price?.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Button color="error" onClick={() => handleDelete(point.id)} size="small">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <Box sx={{ p: isMobile ? 2 : 3 }}>
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

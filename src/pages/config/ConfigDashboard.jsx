import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiConfig from '../../config/apiConfig';
const CONFIG_SECTIONS = [
  { title: "Instruments", path: "/config/instruments" },
  { title: "Counterparties", path: "/config/counterparties" },
  { title: "Portfolios", path: "/config/portfolios" },
  { title: "Commodities", path: "/config/commodities" },
  { title: "Deal Templates", path: "/config/templates" },
  { title: "Lifecycle Rules", path: "/config/lifecycle" },
  { title: "Approval Rules", path: "/config/approvals" },
  { title: "Credit Limits", path: "/config/credit-limits" },
];

export default function ConfigDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
    
    const BASE_URL = apiConfig.baseURL;

  // CSV Upload Handler
  const handleCsvUpload = async (event, endpoint) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: formData
      });
      if (res.ok) {
        setToast({ open: true, message: "CSV upload successful!", severity: "success" });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setToast({ open: true, message: errorData.message || "CSV upload failed", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, message: "Network error: " + err.message, severity: "error" });
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Configuration
      </Typography>

      {/* CSV Upload Buttons */}
      <Grid container spacing={2} sx={{ mb: 2 }} direction={isMobile ? "column" : "row"}>
        <Grid item xs={12} md="auto">
          <Button
            variant="outlined"
            component="label"
            sx={{ minWidth: 180 }}
            disabled={loading}
            fullWidth={isMobile}
          >
            Upload Trades CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={e => handleCsvUpload(e, "/trades/upload-csv")}
            />
          </Button>
        </Grid>
        <Grid item xs={12} md="auto">
          <Button
            variant="outlined"
            component="label"
            sx={{ minWidth: 180 }}
            disabled={loading}
            fullWidth={isMobile}
          >
            Upload Credit Limits CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={e => handleCsvUpload(e, "/credit-limits/upload-csv")}
            />
          </Button>
        </Grid>
        <Grid item xs={12} md="auto">
          <Button
            variant="outlined"
            component="label"
            sx={{ minWidth: 180 }}
            disabled={loading}
            fullWidth={isMobile}
          >
            Upload Risk Limits CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={e => handleCsvUpload(e, "/risk/limits/upload-csv")}
            />
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {CONFIG_SECTIONS?.map((c) => (
          <Grid item xs={12} md={4} key={c.title}>
            <Paper
              sx={{
                p: 2,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#1B1F3B" }
              }}
              onClick={() => navigate(c.path)}
            >
              <Typography variant="h6">{c.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure {c.title.toLowerCase()}
              </Typography>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#1B1F3B" }
            }}
            onClick={() => navigate("/config/yield-curves")}
          >
            <Typography variant="h6">Yield Curves</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage discount/yield curves for DCF and Black76 models.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#1B1F3B" }
            }}
            onClick={() => navigate("/config/generation-forecasts")}
          >
            <Typography variant="h6">Generation Forecasts</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage renewable generation forecasts for pricing models.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#1B1F3B" }
            }}
            onClick={() => navigate("/config/price-curves")}
          >
            <Typography variant="h6">Price Curves</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage price curves for RENEWABLE_FORECAST and other models.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { backgroundColor: "#1B1F3B" }
            }}
            onClick={() => navigate("/config/weather-data")}
          >
            <Typography variant="h6">Weather Data</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage weather data for RENEWABLE_FORECAST and other models.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

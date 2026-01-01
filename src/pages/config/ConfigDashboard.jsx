import {
  Box,
  Typography,
  Grid,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CONFIG_SECTIONS = [
  { title: "Instruments", path: "/config/instruments" },
  { title: "Counterparties", path: "/config/counterparties" },
  { title: "Portfolios", path: "/config/portfolios" },
  { title: "Deal Templates", path: "/config/templates" },
  { title: "Lifecycle Rules", path: "/config/lifecycle" },
  { title: "Approval Rules", path: "/config/approvals" },
];

export default function ConfigDashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        System Configuration
      </Typography>

      <Grid container spacing={2}>
        {CONFIG_SECTIONS.map((c) => (
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
      </Grid>
    </Box>
  );
}

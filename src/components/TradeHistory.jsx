import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Stack, Button, Card, CardContent, Chip, Grid, Divider
} from "@mui/material";
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoadingSpinner from "./shared/LoadingSpinner";
import Toast from "./shared/Toast";

const BASE_URL = "http://localhost:8080/api";

/**
 * Trade History - Shows all versions of a trade with visual diff viewer
 */
export default function TradeHistory() {
  const { tradeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    fetchTradeHistory();
  }, [tradeId]);

  const fetchTradeHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/risk/trades/${tradeId}/history`, {
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      } else {
        setError("Failed to load trade history");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderChangeDiff = (changeDiff) => {
    if (!changeDiff) return null;

    try {
      const changes = typeof changeDiff === "string" ? JSON.parse(changeDiff) : changeDiff;
      
      return (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {Object.entries(changes)?.map(([field, change]) => (
            <Box key={field} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip label={field} size="small" />
              <Typography variant="body2">
                <span style={{ textDecoration: "line-through", color: "red" }}>
                  {String(change.oldValue || "N/A")}
                </span>
                {" → "}
                <span style={{ color: "green", fontWeight: "bold" }}>
                  {String(change.newValue || "N/A")}
                </span>
              </Typography>
            </Box>
          ))}
        </Stack>
      );
    } catch (e) {
      return <Typography variant="caption" color="error">Unable to parse changes</Typography>;
    }
  };

  const getVersionIcon = (version) => {
    if (version.versionNumber === 1) {
      return <AddIcon />;
    } else if (version.amendmentType === "CANCELLED") {
      return <CheckCircleIcon />;
    } else {
      return <EditIcon />;
    }
  };

  const getVersionColor = (version) => {
    if (version.versionNumber === 1) return "primary";
    if (version.amendmentType === "CANCELLED") return "error";
    return "secondary";
  };

  if (loading) {
    return <LoadingSpinner message="Loading trade history..." />;
  }

  if (error || versions.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          {error || "No history found for this trade"}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Typography variant="h4">
            📜 Trade History - {tradeId}
          </Typography>
        </Stack>
        <Chip label={`${versions.length} Version(s)`} color="primary" />
      </Stack>

      {/* Timeline */}
      <Timeline position="alternate">
        {versions?.map((version, idx) => (
          <TimelineItem key={version.id}>
            <TimelineOppositeContent sx={{ m: "auto 0" }}>
              <Typography variant="body2" color="text.secondary">
                {new Date(version.versionTimestamp).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                by {version.amendedBy || "System"}
              </Typography>
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineDot color={getVersionColor(version)}>
                {getVersionIcon(version)}
              </TimelineDot>
              {idx < versions.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Card elevation={3}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      Version {version.versionNumber}
                    </Typography>
                    {version.amendmentType && (
                      <Chip label={version.amendmentType} size="small" />
                    )}
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {version.versionNumber === 1 ? (
                    <Typography variant="body2" color="success.main">
                      ✅ Initial trade booking
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Reason:</strong> {version.amendmentReason || "No reason provided"}
                      </Typography>

                      {version.changeDiff && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                            Changes:
                          </Typography>
                          {renderChangeDiff(version.changeDiff)}
                        </>
                      )}
                    </>
                  )}

                  {/* Key Trade Details */}
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body2">
                        <Chip label={version.status} size="small" />
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        MTM
                      </Typography>
                      <Typography
                        variant="body2"
                        color={version.mtm >= 0 ? "success.main" : "error.main"}
                        fontWeight="bold"
                      >
                        {version.mtm?.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD"
                        })}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />
    </Box>
  );
}

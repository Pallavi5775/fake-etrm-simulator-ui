import React from "react";
import { Box, Paper, Typography, Button, Alert } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            bgcolor: "background.default",
            p: 3
          }}
        >
          <Paper sx={{ maxWidth: 600, p: 4, textAlign: "center" }}>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The application encountered an unexpected error. This could be due to:
            </Typography>
            <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Backend server not running at http://localhost:8080</li>
                <li>Network connectivity issues</li>
                <li>Invalid data format from API</li>
                <li>Browser compatibility issues</li>
              </ul>
            </Alert>
            {this.state.error && (
              <Box sx={{ mb: 2, p: 2, bgcolor: "grey.100", borderRadius: 1, textAlign: "left" }}>
                <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: "break-word" }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Reusable loading spinner component
 */
export default function LoadingSpinner({ message = "Loading...", size = 40 }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        gap: 2
      }}
    >
      <CircularProgress size={size} />
      {message && <Typography color="text.secondary">{message}</Typography>}
    </Box>
  );
}

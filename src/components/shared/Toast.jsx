import { Snackbar, Alert } from "@mui/material";

/**
 * Reusable toast notification component
 */
export default function Toast({ 
  open, 
  onClose, 
  message, 
  severity = "info", 
  autoHideDuration = 6000 
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}

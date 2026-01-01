import { createTheme } from "@mui/material/styles";

const endurTheme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#7C4DFF", // Violet
    },
    secondary: {
      main: "#B388FF",
    },

    background: {
      default: "#0F1020",
      paper: "#16182E",
    },

    success: {
      main: "#00C853", // MTM +
    },
    error: {
      main: "#FF5252", // MTM -
    },

    text: {
      primary: "#EDE7F6",
      secondary: "#B0BEC5",
    },
  },

  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    fontSize: 13,

    h5: {
      fontWeight: 600,
      letterSpacing: 0.4,
    },
  },

  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #252862",
          padding: "8px 12px",
        },
        head: {
          fontWeight: 600,
          color: "#B388FF",
          backgroundColor: "#1B1F3B",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 4,
        },
      },
    },
  },
});

export default endurTheme;

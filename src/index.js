import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";

import App from "./App";
import endurTheme from "./theme/endurTheme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={endurTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);




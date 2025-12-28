import { AppBar, Toolbar, Typography, Container, Tabs, Tab } from "@mui/material";
import { useState } from "react";

import TradeBooking from "./pages/TradeBooking";
import Trades from "./pages/Trades";
import Positions from "./pages/Positions";
import Pricing from "./pages/Pricing";
import LifecycleRuleConfig from "./pages/LifecycleRuleConfig";
import SimulatorPage from "./pages/SimulatorPage";
import ApprovalDashboard from "./pages/ApprovalDashboard";
export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            ETRM / CTRM Simulator
          </Typography>
        </Toolbar>
      </AppBar>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
        <Tab label="Trade Booking" />
        <Tab label="Trades" />
        <Tab label="Positions" />
        <Tab label="Pricing" />
        <Tab label="Configs" />
        {/* <Tab label="Simulator" />
        <Tab label="Approvals" /> */}
      </Tabs>

      <Container sx={{ mt: 4 }}>
        {tab === 0 && <TradeBooking />}
        {tab === 1 && <Trades />}
        {tab === 2 && <Positions />}
        {tab === 3 && <Pricing />}
        {tab === 4 && <LifecycleRuleConfig />}
        {/* {tab === 5 && <SimulatorPage />}
        {tab === 6 && <ApprovalDashboard userRole={"RISK"}/>} */}
      </Container>
    </>
  );
}

import { Grid, Typography } from "@mui/material";
import SimulatorInputs from "./SimulatorInputs";
import SimulationResult from "./SimulationResult";
import { useState } from "react";
import axios from "axios";
export default function SimulatorPage() {
  const [result, setResult] = useState(null);

 const runSimulation = async (payload) => {
  try {
    const res = await axios.post("http://localhost:8080/api/simulator/run/lifecycle", payload);
    setResult(res.data);
  } catch (error) {
    console.error("Simulation failed:", error);
  }
};


  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Rule Simulator
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <SimulatorInputs onSimulate={runSimulation} />
        </Grid>

        <Grid item xs={8}>
          <SimulationResult result={result} />
        </Grid>
      </Grid>
    </>
  );
}

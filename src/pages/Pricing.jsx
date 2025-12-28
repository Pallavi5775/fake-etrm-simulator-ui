import {
  Card, CardContent, TextField, Button, Typography
} from "@mui/material";
import { useState } from "react";
import { api } from "../api/api";

export default function Pricing() {
  const [tradeId, setTradeId] = useState("");
  const [mtm, setMtm] = useState(null);

  const calc = async () => {
    const res = await api.get(`/api/pricing/mtm/${tradeId}`);
    setMtm(res.data);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">MTM Pricing</Typography>

        <TextField
          label="Trade ID"
          sx={{ mt: 2, mr: 2 }}
          onChange={e => setTradeId(e.target.value)}
        />

        <Button variant="contained" onClick={calc}>
          Calculate
        </Button>

        {mtm !== null && (
          <Typography sx={{ mt: 2 }}>
            MTM Value: <b>{mtm}</b>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

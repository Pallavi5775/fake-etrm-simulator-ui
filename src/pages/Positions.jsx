import {
  Card, CardContent, Typography,
  Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Positions() {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    api.get("/api/positions").then(res => setPositions(res.data));
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Portfolio Positions (Middle Office)
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Portfolio</TableCell>
              <TableCell>Instrument</TableCell>
              <TableCell>Net Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.portfolio}</TableCell>
                <TableCell>{p.instrumentSymbol}</TableCell>
                <TableCell>{p.netQuantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

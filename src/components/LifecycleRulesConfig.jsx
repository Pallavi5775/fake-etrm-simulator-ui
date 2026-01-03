import { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableRow, TableCell, TableHead, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, MenuItem, Stack, IconButton
} from "@mui/material";
import { getRules, createRule, toggleRule, getEventTypes, getTradeStatuses } from "../api/lifecycleRulesApi";
import Toast from "./shared/Toast";
import ConfirmDialog from "./shared/ConfirmDialog";


function LifecycleRulesConfig() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [formData, setFormData] = useState({
    fromStatus: "CREATED",
    event: "BOOKED",
    eventType: "BOOKED",
    toStatus: "APPROVED",
    desk: "",
    maxOccurrence: 1,
    enabled: true,
    productionEnabled: false,
    effectiveFrom: "",
    effectiveTo: "",
    name: ""
  });

  const [confirmToggle, setConfirmToggle] = useState({ open: false, rule: null });
  const [statuses, setStatuses] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);

  useEffect(() => {
    fetchStatuses();
    fetchEventTypes();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await getTradeStatuses();
      setStatuses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setToast({ open: true, message: "Failed to load statuses", severity: "error" });
    }
  };

  const fetchEventTypes = async () => {
    try {
      const res = await getEventTypes();
      setEventTypes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setToast({ open: true, message: "Failed to load event types", severity: "error" });
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await getRules();
      setRules(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setToast({ open: true, message: "Failed to load rules", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    const eventValue = eventTypes[0]?.code || eventTypes[0] || "";
    setFormData({
      fromStatus: statuses[0]?.code || statuses[0] || "",
      event: eventValue,
      eventType: eventValue,
      toStatus: statuses[0]?.code || statuses[0] || "",
      desk: "",
      maxOccurrence: 1,
      enabled: true,
      productionEnabled: false,
      effectiveFrom: "",
      effectiveTo: "",
      name: ""
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleCreateRule = async () => {
    setLoading(true);
    try {
      // Ensure both event and eventType are present and match
      const ruleData = { ...formData, eventType: formData.event, event: formData.event };
      await createRule(ruleData);
      setToast({ open: true, message: "Rule created", severity: "success" });
      setOpenDialog(false);
      fetchRules();
    } catch (err) {
      setToast({ open: true, message: "Failed to create rule", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (rule) => {
    setConfirmToggle({ open: true, rule });
  };

  const confirmToggleRule = async () => {
    setLoading(true);
    try {
      await toggleRule(confirmToggle.rule.id);
      setToast({ open: true, message: "Rule toggled", severity: "success" });
      fetchRules();
    } catch (err) {
      setToast({ open: true, message: "Failed to toggle rule", severity: "error" });
    } finally {
      setLoading(false);
      setConfirmToggle({ open: false, rule: null });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Lifecycle Rules
      </Typography>

      <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenDialog}>
        + Add Rule
      </Button>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>From Status</TableCell>
            <TableCell>Event Type</TableCell>
            <TableCell>To Status</TableCell>
            <TableCell>Desk</TableCell>
            <TableCell>Max Occurrence</TableCell>
            <TableCell>Enabled</TableCell>
            <TableCell>Production</TableCell>
            <TableCell>Effective From</TableCell>
            <TableCell>Effective To</TableCell>
            <TableCell>Toggle</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell>{rule.name}</TableCell>
              <TableCell>{rule.fromStatus}</TableCell>
              <TableCell>{rule.eventType}</TableCell>
              <TableCell>{rule.toStatus}</TableCell>
              <TableCell>{rule.desk}</TableCell>
              <TableCell>{rule.maxOccurrence}</TableCell>
              <TableCell>{rule.enabled ? "Yes" : "No"}</TableCell>
              <TableCell>{rule.productionEnabled ? "Yes" : "No"}</TableCell>
              <TableCell>{rule.effectiveFrom}</TableCell>
              <TableCell>{rule.effectiveTo}</TableCell>
              <TableCell>
                <Switch
                  checked={!!rule.enabled}
                  onChange={() => handleToggle(rule)}
                  color="primary"
                  inputProps={{ "aria-label": "Enable/Disable" }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Rule Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Lifecycle Rule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="From Status"
              value={formData.fromStatus}
              onChange={e => setFormData({ ...formData, fromStatus: e.target.value })}
              fullWidth
              disabled={statuses.length === 0}
            >
              {statuses.map(s => (
                <MenuItem key={s.code || s} value={s.code || s}>{s.name || s}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Event Type"
              value={formData.event}
              onChange={e => setFormData({ ...formData, event: e.target.value, eventType: e.target.value })}
              fullWidth
              disabled={eventTypes.length === 0}
            >
              {eventTypes.map(e => (
                <MenuItem key={e.code || e} value={e.code || e}>{e.name || e}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="To Status"
              value={formData.toStatus}
              onChange={e => setFormData({ ...formData, toStatus: e.target.value })}
              fullWidth
              disabled={statuses.length === 0}
            >
              {statuses.map(s => (
                <MenuItem key={s.code || s} value={s.code || s}>{s.name || s}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Desk"
              value={formData.desk}
              onChange={e => setFormData({ ...formData, desk: e.target.value })}
              fullWidth
            />
            <TextField
              label="Max Occurrence"
              type="number"
              value={formData.maxOccurrence}
              onChange={e => setFormData({ ...formData, maxOccurrence: parseInt(e.target.value, 10) })}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={formData.enabled} onChange={e => setFormData({ ...formData, enabled: e.target.checked })} />}
              label="Enabled"
            />
            <FormControlLabel
              control={<Switch checked={formData.productionEnabled} onChange={e => setFormData({ ...formData, productionEnabled: e.target.checked })} />}
              label="Production Enabled"
            />
            <TextField
              label="Effective From"
              type="date"
              value={formData.effectiveFrom}
              onChange={e => setFormData({ ...formData, effectiveFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Effective To"
              type="date"
              value={formData.effectiveTo}
              onChange={e => setFormData({ ...formData, effectiveTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateRule} variant="contained" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Toggle Dialog */}
      <ConfirmDialog
        open={confirmToggle.open}
        onClose={() => setConfirmToggle({ open: false, rule: null })}
        onConfirm={confirmToggleRule}
        title="Toggle Rule"
        message={`Are you sure you want to ${confirmToggle.rule?.enabled ? "disable" : "enable"} this rule?`}
        confirmText="Yes"
        cancelText="No"
        confirmColor="primary"
      />

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        severity={toast.severity}
      />

    </Box>
  );
}
export default LifecycleRulesConfig;

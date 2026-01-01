import { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Button, Chip, Stack, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Paper, Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const BASE_URL = "http://localhost:8080/api/approval-rules";

const TRIGGER_EVENTS = [
  { value: "TRADE_BOOK", label: "Trade Booking" },
  { value: "AMEND", label: "Amendment" },
  { value: "CANCEL", label: "Cancellation" },
  { value: "MATURITY", label: "Maturity" }
];

const FIELD_CODES = [
  { value: "quantity", label: "Quantity" },
  { value: "price", label: "Price" },
  { value: "counterparty", label: "Counterparty" },
  { value: "instrumentType", label: "Instrument Type" },
  { value: "portfolio", label: "Portfolio" }
];

const OPERATORS = [
  { value: ">", label: "Greater Than" },
  { value: "<", label: "Less Than" },
  { value: ">=", label: "Greater or Equal" },
  { value: "<=", label: "Less or Equal" },
  { value: "==", label: "Equal" },
  { value: "!=", label: "Not Equal" }
];

const APPROVAL_ROLES = [
  { value: "RISK", label: "Risk Manager" },
  { value: "SENIOR_TRADER", label: "Senior Trader" },
  { value: "HEAD_TRADER", label: "Head Trader" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "CFO", label: "CFO" }
];

export default function ApprovalRulesConfig() {

  const [rules, setRules] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newRule, setNewRule] = useState({
    ruleName: "",
    triggerEvent: "TRADE_BOOK",
    priority: 100,
    active: false,
    status: "DRAFT",
    version: 1,
    conditions: [
      { fieldCode: "quantity", operator: ">", value1: "" }
    ],
    routing: [
      { approvalRole: "RISK", approvalLevel: 1 }
    ]
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      const res = await fetch(BASE_URL, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      const data = await res.json();
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules:", error);
    }
  };

  const saveRule = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(newRule)
      });

      if (res.ok) {
        const saved = await res.json();
        setRules(r => [...r, saved]);
        setOpen(false);
        resetForm();
      } else {
        alert("Failed to save rule");
      }
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Error saving rule");
    } finally {
      setLoading(false);
    }
  };

  const activateRule = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${BASE_URL}/${id}/activate`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      if (res.ok) {
        await loadRules();
      } else {
        alert("Failed to activate rule");
      }
    } catch (error) {
      console.error("Error activating rule:", error);
    }
  };

  const createNewVersion = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${BASE_URL}/${id}/new-version`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      if (res.ok) {
        const created = await res.json();
        setRules(r => [...r, created]);
      } else {
        alert("Failed to create new version");
      }
    } catch (error) {
      console.error("Error creating new version:", error);
    }
  };

  const deleteRule = async (id, ruleName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete rule "${ruleName}" (ID: ${id})?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      if (res.ok) {
        setRules(rules.filter(r => r.ruleId !== id));
        alert(`✅ Rule "${ruleName}" deleted successfully`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`❌ Failed to delete rule: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting rule:", error);
      alert("❌ Error deleting rule");
    }
  };

  const resetForm = () => {
    setNewRule({
      ruleName: "",
      triggerEvent: "TRADE_BOOK",
      priority: 100,
      active: false,
      status: "DRAFT",
      version: 1,
      conditions: [
        { fieldCode: "quantity", operator: ">", value1: "" }
      ],
      routing: [
        { approvalRole: "RISK", approvalLevel: 1 }
      ]
    });
  };

  const addCondition = () => {
    setNewRule({
      ...newRule,
      conditions: [
        ...newRule.conditions,
        { fieldCode: "quantity", operator: ">", value1: "" }
      ]
    });
  };

  const removeCondition = (index) => {
    setNewRule({
      ...newRule,
      conditions: newRule.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index, field, value) => {
    const updated = [...newRule.conditions];
    updated[index] = { ...updated[index], [field]: value };
    setNewRule({ ...newRule, conditions: updated });
  };

  const addRouting = () => {
    const maxLevel = Math.max(...newRule.routing.map(r => r.approvalLevel || 0), 0);
    setNewRule({
      ...newRule,
      routing: [
        ...newRule.routing,
        { approvalRole: "RISK", approvalLevel: maxLevel + 1 }
      ]
    });
  };

  const removeRouting = (index) => {
    setNewRule({
      ...newRule,
      routing: newRule.routing.filter((_, i) => i !== index)
    });
  };

  const updateRouting = (index, field, value) => {
    const updated = [...newRule.routing];
    updated[index] = { ...updated[index], [field]: value };
    setNewRule({ ...newRule, routing: updated });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">
          Approval Rules Configuration
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add Rule
        </Button>
      </Stack>

      <Paper elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.100" }}>
              <TableCell><strong>Rule Name & ID</strong></TableCell>
              <TableCell><strong>Trigger Event</strong></TableCell>
              <TableCell align="center"><strong>Version</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Priority</strong></TableCell>
              <TableCell align="center"><strong>Conditions (Field, Operator, Value)</strong></TableCell>
              <TableCell align="center"><strong>Approval Routing (Level & Role)</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No approval rules configured
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rules.map(r => (
                <TableRow key={r.ruleId} hover sx={{ verticalAlign: "top" }}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {r.ruleName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {r.ruleId}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Chip size="small" label={r.triggerEvent} color="primary" variant="outlined" />
                      {r.parentRuleId && (
                        <Typography variant="caption" color="text.secondary">
                          Parent: {r.parentRuleId}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      v{r.version || 1}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={r.status || "DRAFT"}
                      color={
                        r.status === "ACTIVE"
                          ? "success"
                          : r.status === "DRAFT"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.priority}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack spacing={1}>
                      {r.conditions && r.conditions.length > 0 ? (
                        r.conditions.map((cond, idx) => (
                          <Paper key={idx} variant="outlined" sx={{ p: 1, bgcolor: "#7C4DFF15", borderColor: "#7C4DFF50" }}>
                            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#EDE7F6" }}>
                              <strong>{cond.fieldCode}</strong> {cond.operator} <strong>{cond.value1}</strong>
                            </Typography>
                            {cond.conditionId && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                (ID: {cond.conditionId})
                              </Typography>
                            )}
                          </Paper>
                        ))
                      ) : (
                        <Chip size="small" label="No conditions" variant="outlined" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack spacing={1}>
                      {r.routing && r.routing.length > 0 ? (
                        r.routing.map((route, idx) => (
                          <Paper key={idx} variant="outlined" sx={{ p: 1, bgcolor: "#B388FF15", borderColor: "#B388FF50" }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "#EDE7F6" }}>
                              <strong>L{route.approvalLevel}:</strong> {route.approvalRole}
                            </Typography>
                            {route.routingId && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                (ID: {route.routingId})
                              </Typography>
                            )}
                          </Paper>
                        ))
                      ) : (
                        <Chip size="small" label="No routing" variant="outlined" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {r.status === "DRAFT" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => activateRule(r.ruleId)}
                        >
                          Activate
                        </Button>
                      )}

                      {r.status === "ACTIVE" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => createNewVersion(r.ruleId)}
                        >
                          New Version
                        </Button>
                      )}

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteRule(r.ruleId, r.ruleName)}
                        title="Delete rule"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* ================= Add Rule Dialog ================= */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Create Approval Rule (Draft)</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <TextField
              label="Rule Name"
              fullWidth
              required
              value={newRule.ruleName}
              onChange={e =>
                setNewRule({ ...newRule, ruleName: e.target.value })
              }
              placeholder="e.g., High Value Trade Approval"
            />

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Trigger Event"
                fullWidth
                value={newRule.triggerEvent}
                onChange={e =>
                  setNewRule({ ...newRule, triggerEvent: e.target.value })
                }
              >
                {TRIGGER_EVENTS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="number"
                label="Priority"
                fullWidth
                value={newRule.priority}
                onChange={e =>
                  setNewRule({ ...newRule, priority: parseInt(e.target.value) })
                }
                helperText="Lower number = higher priority"
              />
            </Stack>

            <Divider />

            {/* Conditions */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Conditions (All must match)
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={addCondition}
                >
                  Add Condition
                </Button>
              </Stack>

              {newRule.conditions.map((cond, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      select
                      label="Field"
                      size="small"
                      value={cond.fieldCode}
                      onChange={e => updateCondition(idx, "fieldCode", e.target.value)}
                      sx={{ flex: 1 }}
                    >
                      {FIELD_CODES.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Operator"
                      size="small"
                      value={cond.operator}
                      onChange={e => updateCondition(idx, "operator", e.target.value)}
                      sx={{ flex: 0.8 }}
                    >
                      {OPERATORS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Value"
                      size="small"
                      value={cond.value1}
                      onChange={e => updateCondition(idx, "value1", e.target.value)}
                      sx={{ flex: 1 }}
                      placeholder="e.g., 1000"
                    />

                    <IconButton 
                      color="error" 
                      onClick={() => removeCondition(idx)}
                      disabled={newRule.conditions.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Box>

            <Divider />

            {/* Routing */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Approval Routing
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={addRouting}
                >
                  Add Approver
                </Button>
              </Stack>

              {newRule.routing.map((route, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      select
                      label="Approval Role"
                      size="small"
                      value={route.approvalRole}
                      onChange={e => updateRouting(idx, "approvalRole", e.target.value)}
                      sx={{ flex: 2 }}
                    >
                      {APPROVAL_ROLES.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      type="number"
                      label="Level"
                      size="small"
                      value={route.approvalLevel}
                      onChange={e => updateRouting(idx, "approvalLevel", parseInt(e.target.value))}
                      sx={{ flex: 1 }}
                      helperText="Approval order"
                    />

                    <IconButton 
                      color="error" 
                      onClick={() => removeRouting(idx)}
                      disabled={newRule.routing.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={saveRule}
            disabled={loading || !newRule.ruleName}
          >
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

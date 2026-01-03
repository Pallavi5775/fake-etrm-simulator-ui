import { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Stack, Button, TextField, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, FormControl, InputLabel, Select, Switch,
  Alert, CircularProgress, Chip, IconButton
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";

const BASE_URL = "http://localhost:8080/api/approval-rules";

const TRIGGER_EVENTS = [
  { value: "TRADE_BOOK", label: "Trade Book" },
  { value: "TRADE_AMEND", label: "Trade Amend" },
  { value: "TRADE_CANCEL", label: "Trade Cancel" }
];

const CONDITION_OPERATORS = [
  { value: "==", label: "Equals (==)" },
  { value: "!=", label: "Not Equals (!=)" },
  { value: ">", label: "Greater Than (>)" },
  { value: "<", label: "Less Than (<)" },
  { value: ">=", label: "Greater or Equal (>=)" },
  { value: "<=", label: "Less or Equal (<=)" }
];

const APPROVAL_ROLES = [
  { value: "RISK", label: "Risk" },
  { value: "SENIOR_TRADER", label: "Senior Trader" },
  { value: "HEAD_TRADER", label: "Head Trader" },
  { value: "CFO", label: "CFO" },
  { value: "COMPLIANCE", label: "Compliance" }
];

export default function ApprovalRulesConfig() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    ruleName: "",
    triggerEvent: "TRADE_BOOK",
    priority: 1,
    active: true,
    conditionField: "",
    conditionOperator: "==",
    conditionValue: "",
    approvalRole: "RISK",
    approvalLevel: 1
  });

  // CSV Upload
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched approval rules:", data);
        setRules(Array.isArray(data) ? data : []);
      } else {
        throw new Error(`Failed to fetch rules: ${response.status}`);
      }
    } catch (err) {
      console.error("Failed to fetch approval rules:", err);
      setError("Failed to load approval rules. Please check if backend is running.");
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      ruleName: "",
      triggerEvent: "TRADE_BOOK",
      priority: 1,
      active: true,
      conditionField: "",
      conditionOperator: "==",
      conditionValue: "",
      approvalRole: "RISK",
      approvalLevel: 1
    });
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleCreateRule = async () => {
    setError(null);
    if (!formData.ruleName || !formData.conditionField || !formData.conditionValue) {
      setError("Rule name, condition field, and condition value are required");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          ...formData,
          createdByUser: user.username || "UNKNOWN"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create rule");
      }

      console.log("Rule created successfully");
      await fetchRules();
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to create rule:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm("Delete this approval rule?")) return;

    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/${ruleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete rule");
      }

      console.log("Rule deleted successfully:", ruleId);
      await fetchRules();
    } catch (err) {
      console.error("Failed to delete rule:", err);
      setError(err.message);
    }
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file");
      return;
    }

    setUploadLoading(true);
    setUploadResult(null);
    setError(null);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${BASE_URL}/upload-csv`, {
        method: "POST",
        headers: {
          "X-User-Name": user.username || "",
          "X-User-Role": user.role || "",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload CSV");
      }

      const result = await response.json();
      console.log("CSV upload result:", result);
      setUploadResult(result);
      await fetchRules();
      setSelectedFile(null);
    } catch (err) {
      console.error("CSV upload failed:", err);
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
      setSelectedFile(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, mb: 1, color: "#EDE7F6", letterSpacing: 0.5 }}
        >
          Approval Rules Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define multi-level approval workflows for trade booking
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "#EDE7F6" }}>
          Total Rules: {rules.length}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setUploadDialog(true)}
            sx={{
              borderColor: "#7C4DFF",
              color: "#B388FF",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#B388FF",
                backgroundColor: "#7C4DFF20"
              }
            }}
          >
            Upload CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{
              background: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)",
              textTransform: "none",
              fontWeight: 600
            }}
          >
            New Rule
          </Button>
        </Stack>
      </Box>

      {/* Rules Table */}
      <Paper
        sx={{
          background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
          border: "1px solid #252862",
          overflow: "hidden"
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : rules.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="info">No approval rules configured. Create one or upload CSV.</Alert>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1B1F3B" }}>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Rule Name</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Trigger</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Condition</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Level</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: "#B388FF", fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={rule.ruleId || rule.id}
                  hover
                  sx={{ borderBottom: "1px solid #252862", "&:hover": { backgroundColor: "#1B1F3B" } }}
                >
                  <TableCell sx={{ color: "#EDE7F6", fontWeight: 600 }}>{rule.ruleName || "N/A"}</TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{rule.triggerEvent || "N/A"}</TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>{rule.priority || "N/A"}</TableCell>
                  <TableCell sx={{ color: "#EDE7F6", fontSize: "0.85rem" }}>
                    {rule.conditions && rule.conditions.length > 0 ? (
                      <Stack spacing={0.5}>
                        {rule.conditions.map((cond, idx) => (
                          <Box key={idx}>
                            {cond.fieldCode} {cond.operator} {cond.value1}
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      `${rule.conditionField || "N/A"} ${rule.conditionOperator || ""} ${rule.conditionValue || "N/A"}`
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>
                    {rule.routing && rule.routing.length > 0 ? (
                      <Stack spacing={0.5}>
                        {rule.routing.map((route, idx) => (
                          <Chip
                            key={idx}
                            label={`${route.approvalRole} (L${route.approvalLevel})`}
                            size="small"
                            sx={{ backgroundColor: "#7C4DFF20", color: "#B388FF" }}
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Chip
                        label={rule.approvalRole || "N/A"}
                        size="small"
                        sx={{ backgroundColor: "#7C4DFF20", color: "#B388FF" }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: "#EDE7F6" }}>
                    {rule.routing && rule.routing.length > 0 ? (
                      rule.routing.length > 1 ? "Multi-Level" : "Single"
                    ) : (
                      rule.approvalLevel || "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rule.active || rule.status === "ACTIVE" ? "Active" : "Inactive"}
                      size="small"
                      color={(rule.active || rule.status === "ACTIVE") ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rule.ruleId || rule.id)}
                      sx={{ 
                        color: "#FF5252",
                        "&:hover": {
                          backgroundColor: "#FF525220"
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create Rule Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box
          sx={{
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            p: 3,
            borderBottom: "1px solid #252862"
          }}
        >
          <Typography variant="h6" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
            Create Approval Rule
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3, backgroundColor: "#16182E" }}>
          <TextField
            label="Rule Name"
            value={formData.ruleName}
            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
            fullWidth
            size="small"
            required
          />

          <FormControl fullWidth size="small">
            <InputLabel>Trigger Event</InputLabel>
            <Select
              value={formData.triggerEvent}
              onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
              label="Trigger Event"
            >
              {TRIGGER_EVENTS.map((event) => (
                <MenuItem key={event.value} value={event.value}>
                  {event.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            fullWidth
            size="small"
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Condition Field"
            placeholder="e.g., quantity, mtm, commodity"
            value={formData.conditionField}
            onChange={(e) => setFormData({ ...formData, conditionField: e.target.value })}
            fullWidth
            size="small"
            required
          />

          <FormControl fullWidth size="small">
            <InputLabel>Condition Operator</InputLabel>
            <Select
              value={formData.conditionOperator}
              onChange={(e) => setFormData({ ...formData, conditionOperator: e.target.value })}
              label="Condition Operator"
            >
              {CONDITION_OPERATORS.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Condition Value"
            placeholder="e.g., 1000, HIGH_RISK, POWER"
            value={formData.conditionValue}
            onChange={(e) => setFormData({ ...formData, conditionValue: e.target.value })}
            fullWidth
            size="small"
            required
          />

          <FormControl fullWidth size="small">
            <InputLabel>Approval Role</InputLabel>
            <Select
              value={formData.approvalRole}
              onChange={(e) => setFormData({ ...formData, approvalRole: e.target.value })}
              label="Approval Role"
            >
              {APPROVAL_ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Approval Level"
            type="number"
            value={formData.approvalLevel}
            onChange={(e) => setFormData({ ...formData, approvalLevel: parseInt(e.target.value) })}
            fullWidth
            size="small"
            helperText="For multi-level approvals (1, 2, 3, etc.)"
            inputProps={{ min: 1 }}
          />

          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2">Active:</Typography>
            <Switch
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              color="success"
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 3, borderTop: "1px solid #252862", backgroundColor: "#16182E" }}>
          <Button variant="outlined" onClick={handleCloseDialog} fullWidth>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRule}
            disabled={loading}
            fullWidth
            sx={{ background: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)" }}
          >
            {loading ? <CircularProgress size={20} /> : "Create Rule"}
          </Button>
        </Stack>
      </Dialog>

      {/* CSV Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
        <Box
          sx={{
            background: "linear-gradient(135deg, #16182E 0%, #1B1F3B 100%)",
            p: 3,
            borderBottom: "1px solid #252862"
          }}
        >
          <Typography variant="h6" sx={{ color: "#EDE7F6", fontWeight: 600 }}>
            Upload Approval Rules CSV
          </Typography>
        </Box>

        <Stack spacing={2} sx={{ p: 3, backgroundColor: "#16182E" }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              CSV Format Required:
            </Typography>
            <Typography variant="caption" component="pre" sx={{ fontFamily: "monospace", display: "block", fontSize: "0.7rem" }}>
{`ruleName,triggerEvent,priority,active,status,version,conditionField,conditionOperator,conditionValue,approvalRole,approvalLevel
High Value Trade Approval,TRADE_BOOK,1,TRUE,ACTIVE,1,quantity,>,1000,RISK,1
Very High Value Multi-Level,TRADE_BOOK,2,TRUE,ACTIVE,1,quantity,>,10000,SENIOR_TRADER,1
Very High Value Multi-Level,TRADE_BOOK,2,TRUE,ACTIVE,1,quantity,>,10000,HEAD_TRADER,2
High MTM Trade Approval,TRADE_BOOK,4,TRUE,ACTIVE,1,mtm,>,500000,RISK,1
Gas Trade Approval,TRADE_BOOK,5,TRUE,ACTIVE,1,commodity;quantity,==;>,GAS;5000,SENIOR_TRADER,1`}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "warning.main" }}>
              Note: Multi-condition rules use semicolon (;) separator for fields, operators, and values
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{
              borderColor: "#7C4DFF",
              color: "#B388FF",
              textTransform: "none",
              p: 2,
              "&:hover": {
                borderColor: "#B388FF",
                backgroundColor: "#7C4DFF20"
              }
            }}
          >
            {selectedFile ? selectedFile.name : "Select CSV File"}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileSelect}
            />
          </Button>

          {uploadResult && (
            <Alert severity="success">
              <Typography variant="body2">
                ✓ Successfully uploaded {uploadResult.successCount || uploadResult.count} approval rules
                {uploadResult.failedCount > 0 && ` (${uploadResult.failedCount} failed)`}
              </Typography>
            </Alert>
          )}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ p: 3, borderTop: "1px solid #252862", backgroundColor: "#16182E" }}>
          <Button
            variant="outlined"
            onClick={() => {
              setUploadDialog(false);
              setSelectedFile(null);
              setUploadResult(null);
            }}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCSVUpload}
            disabled={!selectedFile || uploadLoading}
            fullWidth
            sx={{ background: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)" }}
          >
            {uploadLoading ? <CircularProgress size={20} /> : "Upload"}
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}

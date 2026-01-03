import React, { useEffect, useState } from 'react';
import { getRiskLimits, createRiskLimit } from '../../api/riskLimitApi';
import { getRiskLimitMetadata } from '../../api/referenceDataApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Toast from '../../components/shared/Toast';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';

const defaultLimit = {
  limitName: '',
  limitType: 'CREDIT',
  limitScope: 'PORTFOLIO',
  scopeValue: '',
  limitValue: '',
  warningThreshold: '',
  limitUnit: 'USD',
  active: true,
  breachAction: 'ALERT',
};

const RiskLimitConfig = () => {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultLimit);
  const [metadata, setMetadata] = useState({ limitType: [], limitScope: [], breachAction: [], limitUnit: [] });

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const res = await getRiskLimits();
      setLimits(res.data || []);
    } catch (e) {
      setToast({ open: true, message: 'Failed to load risk limits', severity: 'error' });
    }
    setLoading(false);
  };

  const fetchMetadata = async () => {
    try {
      const res = await getRiskLimitMetadata();
      setMetadata(res.data || { limitType: [], limitScope: [], breachAction: [], limitUnit: [] });
    } catch (e) {
      setToast({ open: true, message: 'Failed to load reference data', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchLimits();
    fetchMetadata();
  }, []);

  const handleOpenDialog = () => {
    // Set sensible defaults from metadata if available
    setForm({
      ...defaultLimit,
      limitType: metadata.limitType[0] || defaultLimit.limitType,
      limitScope: metadata.limitScope[0] || defaultLimit.limitScope,
      limitUnit: metadata.limitUnit[0] || defaultLimit.limitUnit,
      breachAction: metadata.breachAction[0] || defaultLimit.breachAction,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If limitScope changes, reset scopeValue
    if (name === 'limitScope') {
      setForm(f => ({
        ...f,
        limitScope: value,
        scopeValue: ''
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      await createRiskLimit(form);
      setToast({ open: true, message: 'Risk limit created', severity: 'success' });
      fetchLimits();
      handleCloseDialog();
    } catch (e) {
      setToast({ open: true, message: 'Failed to save risk limit', severity: 'error' });
    }
  };

  const columns = [
    { field: 'limitName', headerName: 'Name', flex: 1 },
    { field: 'limitType', headerName: 'Type', flex: 1 },
    { field: 'limitScope', headerName: 'Scope', flex: 1 },
    { field: 'scopeValue', headerName: 'Scope Value', flex: 1 },
    { field: 'limitValue', headerName: 'Limit Value', flex: 1 },
    { field: 'warningThreshold', headerName: 'Warning Threshold', flex: 1 },
    { field: 'limitUnit', headerName: 'Unit', flex: 1 },
    { field: 'active', headerName: 'Active', flex: 1, renderCell: (params) => params.row.active ? 'Yes' : 'No' },
    { field: 'breachAction', headerName: 'Breach Action', flex: 1 },
  ];

  return (
    <div>
      <h2>Risk Limit Configuration</h2>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>Add Risk Limit</Button>
      {loading ? <LoadingSpinner /> : (
        <DataTable rows={limits} columns={columns} autoHeight pageSize={10} />
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add Risk Limit</DialogTitle>
        {(!metadata.limitType.length || !metadata.limitScope.length || !metadata.limitUnit.length || !metadata.breachAction.length) ? (
          <DialogContent><LoadingSpinner /></DialogContent>
        ) : (
          <>
            <DialogContent>
              <TextField margin="dense" label="Name" name="limitName" value={form.limitName} onChange={handleChange} fullWidth />
              <TextField margin="dense" label="Type" name="limitType" value={form.limitType} onChange={handleChange} fullWidth select>
                {metadata.limitType.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
              <TextField margin="dense" label="Scope" name="limitScope" value={form.limitScope} onChange={handleChange} fullWidth select>
                {metadata.limitScope.map(scope => (
                  <MenuItem key={scope} value={scope}>{scope}</MenuItem>
                ))}
              </TextField>
              <TextField
                margin="dense"
                label="Scope Value"
                name="scopeValue"
                value={form.scopeValue}
                onChange={handleChange}
                fullWidth
                select
                disabled={!form.limitScope || !metadata.scopeValue || !metadata.scopeValue[form.limitScope]}
              >
                {(metadata.scopeValue && metadata.scopeValue[form.limitScope])
                  ? metadata.scopeValue[form.limitScope].map(val => (
                      <MenuItem key={val} value={val}>{val}</MenuItem>
                    ))
                  : <MenuItem value="">No options</MenuItem>}
              </TextField>
              <TextField margin="dense" label="Limit Value" name="limitValue" value={form.limitValue} onChange={handleChange} fullWidth type="number" />
              <TextField margin="dense" label="Warning Threshold" name="warningThreshold" value={form.warningThreshold} onChange={handleChange} fullWidth type="number" />
              <TextField margin="dense" label="Unit" name="limitUnit" value={form.limitUnit} onChange={handleChange} fullWidth select>
                {metadata.limitUnit.map(unit => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
              </TextField>
              <TextField margin="dense" label="Breach Action" name="breachAction" value={form.breachAction} onChange={handleChange} fullWidth select>
                {metadata.breachAction.map(action => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
              <Button onClick={handleCloseDialog} variant="outlined" color="primary">OK</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
};

export default RiskLimitConfig;

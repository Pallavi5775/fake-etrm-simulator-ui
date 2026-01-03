import React, { useEffect, useState } from 'react';
import { getCreditLimits, createCreditLimit, updateCreditLimit, deleteCreditLimit } from '../../api/creditLimitApi';
import { getRiskLimitMetadata } from '../../api/referenceDataApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Toast from '../../components/shared/Toast';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const defaultLimit = {
  limitName: '',
  limitScope: 'COUNTERPARTY',
  scopeValue: '',
  limitValue: '',
  warningThreshold: '',
  limitUnit: 'USD',
  active: true,
  breachAction: 'ALERT',
};

const CreditLimitConfig = () => {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultLimit);
  const [metadata, setMetadata] = useState({ limitScope: [], breachAction: [], limitUnit: [], scopeValue: {} });

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const res = await getCreditLimits();
      setLimits(res.data || []);
    } catch (e) {
      setToast({ open: true, message: 'Failed to load credit limits', severity: 'error' });
    }
    setLoading(false);
  };


  const fetchMetadata = async () => {
    try {
      const res = await getRiskLimitMetadata();
      setMetadata(res.data || { limitScope: [], breachAction: [], limitUnit: [], scopeValue: {} });
    } catch (e) {
      setToast({ open: true, message: 'Failed to load reference data', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchLimits();
    fetchMetadata();
  }, []);

  const handleOpenDialog = (limit) => {
    if (limit) {
      setEditId(limit.id);
      setForm({
        limitName: limit.limitName,
        limitScope: limit.limitScope,
        scopeValue: limit.scopeValue,
        limitValue: limit.limitValue,
        warningThreshold: limit.warningThreshold,
        limitUnit: limit.limitUnit,
        active: limit.active,
        breachAction: limit.breachAction,
      });
    } else {
      setEditId(null);
      setForm({
        ...defaultLimit,
        limitScope: metadata.limitScope[0] || 'COUNTERPARTY',
        limitUnit: metadata.limitUnit[0] || 'USD',
        breachAction: metadata.breachAction[0] || 'ALERT',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm(defaultLimit);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'limitScope') {
      setForm(f => ({ ...f, limitScope: value, scopeValue: '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateCreditLimit(editId, form);
        setToast({ open: true, message: 'Credit limit updated', severity: 'success' });
      } else {
        await createCreditLimit(form);
        setToast({ open: true, message: 'Credit limit created', severity: 'success' });
      }
      fetchLimits();
      handleCloseDialog();
    } catch (e) {
      setToast({ open: true, message: 'Failed to save credit limit', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this credit limit?')) return;
    try {
      await deleteCreditLimit(id);
      setToast({ open: true, message: 'Credit limit deleted', severity: 'success' });
      fetchLimits();
    } catch (e) {
      setToast({ open: true, message: 'Failed to delete credit limit', severity: 'error' });
    }
  };

  const columns = [
    { field: 'limitName', headerName: 'Name', flex: 2 },
    { field: 'limitScope', headerName: 'Scope', flex: 1 },
    { field: 'scopeValue', headerName: 'Scope Value', flex: 2 },
    { field: 'limitValue', headerName: 'Limit Value', flex: 1 },
    { field: 'warningThreshold', headerName: 'Warning Threshold', flex: 1 },
    { field: 'limitUnit', headerName: 'Unit', flex: 1 },
    { field: 'active', headerName: 'Active', flex: 1, renderCell: (params) => params.row.active ? 'Yes' : 'No' },
    { field: 'breachAction', headerName: 'Breach Action', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenDialog(params.row)} size="small"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} size="small"><DeleteIcon /></IconButton>
        </>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <div>
      <h2>Credit Limit Configuration</h2>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>Add Credit Limit</Button>
      {loading ? <LoadingSpinner /> : (
        <DataTable rows={limits} columns={columns} autoHeight pageSize={10} />
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editId ? 'Edit Credit Limit' : 'Add Credit Limit'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="limitName" value={form.limitName} onChange={handleChange} fullWidth />
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
      </Dialog>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
};

export default CreditLimitConfig;

import React, { useEffect, useState } from 'react';
import { getCommodities, createCommodity } from '../../api/commoditiesApi';
import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Toast from '../../components/shared/Toast';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const defaultCommodity = { name: '' };

const CommoditiesConfig = () => {
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultCommodity);

  const fetchCommodities = async () => {
    setLoading(true);
    try {
      const res = await getCommodities();
      setCommodities(res.data || []);
    } catch (e) {
      setToast({ open: true, message: 'Failed to load commodities', severity: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCommodities();
  }, []);

  const handleOpenDialog = () => {
    setForm(defaultCommodity);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await createCommodity(form);
      setToast({ open: true, message: 'Commodity created', severity: 'success' });
      fetchCommodities();
      handleCloseDialog();
    } catch (e) {
      setToast({ open: true, message: 'Failed to save commodity', severity: 'error' });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 2 },
  ];

  return (
    <div>
      <h2>Commodities Management</h2>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>Add Commodity</Button>
      {loading ? <LoadingSpinner /> : (
        <DataTable rows={commodities} columns={columns} autoHeight pageSize={10} />
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add Commodity</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
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

export default CommoditiesConfig;
